package com.meuapp.feedback.service;

import com.meuapp.feedback.domain.Feedback;
import com.meuapp.feedback.dto.CupomResponseDTO;
import com.meuapp.feedback.dto.FeedbackRequestDTO;
import com.meuapp.feedback.dto.FeedbackResponseDTO;
import com.meuapp.feedback.exception.BusinessException;
import com.meuapp.feedback.repository.FeedbackRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    /**
     * Processa o feedback (POST /feedback)
     * - valida LGPD e regras
     * - salva o feedback
     * - se nota < 4 -> gera cupom imediato
     * - se nota >= 4 -> cupom fica null (será gerado via gerarCupom)
     * - devolve FeedbackResponseDTO com cupom (se já gerado) ou null
     */
    public FeedbackResponseDTO processarFeedback(FeedbackRequestDTO dto) {

        // 1. Validar LGPD
        if (!dto.isConsentimentoLgpd()) {
            throw new BusinessException("Não é possível prosseguir sem consentimento LGPD.");
        }

        // 2. Regras mensagem negativa
        if (dto.getNota() >= 4 &&
                dto.getMensagemNegativa() != null &&
                !dto.getMensagemNegativa().isBlank()) {
            throw new BusinessException("Feedback de nota alta não pode ter mensagem negativa.");
        }

        if (dto.getNota() < 4 &&
                (dto.getMensagemNegativa() == null || dto.getMensagemNegativa().isBlank())) {
            throw new BusinessException("Para notas 1 a 3 é obrigatório informar uma mensagem negativa.");
        }

        // 3. Construir entidade
        Feedback feedback = Feedback.builder()
                .nome(dto.getNome())
                .email(dto.getEmail())
                .whatsapp(dto.getWhatsapp())
                .itemConsumido(dto.getItemConsumido())
                .nota(dto.getNota())
                .consentimentoLgpd(dto.isConsentimentoLgpd())
                .mensagemNegativa(dto.getNota() < 4 ? dto.getMensagemNegativa() : null)
                .dataCriacao(LocalDateTime.now())
                .build();

        // 4. Se nota alta, set linkGoogle
        if (dto.getNota() >= 4) {
            feedback.setLinkGoogle("https://search.google.com/local/writereview");
            // cupom permanece null por enquanto
        } else {
            // nota baixa -> gerar cupom imediatamente
            String cupom = gerarCodigoCupom();
            feedback.setCupom(cupom);
        }

        // 5. salvar e retornar
        Feedback salvo = feedbackRepository.save(feedback);

        String tipo = salvo.getNota() >= 4 ? "ALTA" : "BAIXA";
        String mensagem;
        if ("ALTA".equals(tipo)) {
            // mensagem para nota alta (sua versão ajustada)
            mensagem = "Muito obrigado pelo seu feedback!\n" +
                    "Falta pouco para liberar seu cupom 🎁\n" +
                    "Agora complete sua avaliação no Google escolhendo as " + salvo.getNota() + " estrelas digitadas nesta página.\n" +
                    "Clique no botão abaixo somente após concluir sua avaliação no Google.\n\n" +
                    "[ Botão ] Já fiz minha avaliação\n\n" +
                    "Após isso, seu cupom será exibido automaticamente!";
        } else {
            mensagem = "Obrigado! Seu feedback foi registrado e enviado ao estabelecimento. Seu cupom já está disponível.";
        }

        return new FeedbackResponseDTO(
                salvo.getId(),
                tipo,
                mensagem,
                salvo.getLinkGoogle(),
                salvo.getCupom(),       // null para ALTA, código para BAIXA
                salvo.getNota(),
                salvo.getDataCriacao()
        );
    }

    /**
     * Endpoint que será chamado pelo front quando o usuário confirmar que avaliou no Google.
     * - valida que feedback existe e nota >=4
     * - valida que cupom ainda não foi gerado
     * - gera, salva e retorna o cupom
     */
    public CupomResponseDTO gerarCupom(Long feedbackId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new BusinessException("Feedback não encontrado."));

        if (feedback.getNota() < 4) {
            throw new BusinessException("Cupom por confirmação só é válido para avaliações com nota 4 ou 5.");
        }

        if (feedback.getCupom() != null && !feedback.getCupom().isBlank()) {
            // já gerado anteriormente
            return new CupomResponseDTO(feedback.getCupom(), "Cupom já foi gerado anteriormente.");
        }

        // gerar código, salvar e retornar
        String cupom = gerarCodigoCupom();
        feedback.setCupom(cupom);
        feedbackRepository.save(feedback);

        return new CupomResponseDTO(cupom, "Cupom liberado! Aproveite seu benefício 🎁");
    }

    // gera um cupom no formato MEUAPP-YYYYMMDD-XXXXXX (6 chars alfanum)
    private String gerarCodigoCupom() {
        String datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE); // YYYYMMDD
        String rand = UUID.randomUUID().toString().replaceAll("-", "").substring(0, 6).toUpperCase();
        return "MEUAPP-" + datePart + "-" + rand;
    }
}
