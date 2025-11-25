package com.meuapp.feedback.service;

import com.meuapp.feedback.domain.Feedback;
import com.meuapp.feedback.domain.Restaurant;
import com.meuapp.feedback.dto.CupomResponseDTO;
import com.meuapp.feedback.dto.FeedbackRequestDTO;
import com.meuapp.feedback.dto.FeedbackResponseDTO;
import com.meuapp.feedback.exception.BusinessException;
import com.meuapp.feedback.repository.FeedbackRepository;
import com.meuapp.feedback.repository.RestaurantRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final RestaurantRepository restaurantRepository;

    // 👇 agora o service recebe também o RestaurantRepository
    public FeedbackService(FeedbackRepository feedbackRepository,
                           RestaurantRepository restaurantRepository) {
        this.feedbackRepository = feedbackRepository;
        this.restaurantRepository = restaurantRepository;
    }

    /**
     * Retorna o restaurante padrão (por enquanto id = 1).
     * Se não existir, lança BusinessException (melhor do que NullPointer).
     */
    private Restaurant getDefaultRestaurant() {
        Long defaultRestaurantId = 1L; // hoje você só tem 1 restaurante

        return restaurantRepository.findById(defaultRestaurantId)
                .orElseThrow(() -> new BusinessException(
                        "Restaurante padrão (id=" + defaultRestaurantId + ") não encontrado. " +
                                "Cadastre um restaurante na tabela 'restaurant'."));
    }

    /**
     * Processa o feedback (POST /feedback)
     * - valida LGPD e regras
     * - salva o feedback já amarrando ao restaurante
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

        // 3. Descobrir o restaurante (HOJE: sempre o padrão id=1)
        Restaurant restaurant = getDefaultRestaurant();

        // 4. Construir entidade já com restaurant
        Feedback feedback = Feedback.builder()
                .nome(dto.getNome())
                .email(dto.getEmail())
                .whatsapp(dto.getWhatsapp())
                .itemConsumido(dto.getItemConsumido())
                .nota(dto.getNota())
                .consentimentoLgpd(dto.isConsentimentoLgpd())
                .mensagemNegativa(dto.getNota() < 4 ? dto.getMensagemNegativa() : null)
                .dataCriacao(LocalDateTime.now())
                .restaurant(restaurant)          // 👈 IMPORTANTE!
                .build();

        // 5. Se nota alta, set linkGoogle
        if (dto.getNota() >= 4) {
            feedback.setLinkGoogle("https://search.google.com/local/writereview");
            // cupom permanece null por enquanto
        } else {
            // nota baixa -> gerar cupom imediatamente
            String cupom = gerarCodigoCupom();
            feedback.setCupom(cupom);
        }

        // 6. salvar e retornar
        Feedback salvo = feedbackRepository.save(feedback);

        String tipo = salvo.getNota() >= 4 ? "ALTA" : "BAIXA";
        String mensagem;
        if ("ALTA".equals(tipo)) {
            mensagem = "Muito obrigado pelo seu feedback!\n" +
                    "Falta pouco para liberar seu cupom 🎁\n" +
                    "Agora complete sua avaliação no Google escolhendo as "
                    + salvo.getNota() + " estrelas digitadas nesta página.\n" +
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
     * Endpoint chamado quando o usuário confirma que avaliou no Google.
     */
    public CupomResponseDTO gerarCupom(Long feedbackId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new BusinessException("Feedback não encontrado."));

        if (feedback.getNota() < 4) {
            throw new BusinessException("Cupom por confirmação só é válido para avaliações com nota 4 ou 5.");
        }

        if (feedback.getCupom() != null && !feedback.getCupom().isBlank()) {
            return new CupomResponseDTO(feedback.getCupom(), "Cupom já foi gerado anteriormente.");
        }

        String cupom = gerarCodigoCupom();
        feedback.setCupom(cupom);
        feedbackRepository.save(feedback);

        return new CupomResponseDTO(cupom, "Cupom liberado! Aproveite seu benefício 🎁");
    }

    // gera um cupom no formato MEUAPP-YYYYMMDD-XXXXXX (6 chars alfanum)
    private String gerarCodigoCupom() {
        String datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE); // YYYYMMDD
        String rand = UUID.randomUUID().toString().replaceAll("-", "")
                .substring(0, 6).toUpperCase();
        return "MEUAPP-" + datePart + "-" + rand;
    }
}
