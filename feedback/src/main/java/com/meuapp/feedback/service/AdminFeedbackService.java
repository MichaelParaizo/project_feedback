package com.meuapp.feedback.service;

import com.meuapp.feedback.domain.AdminUser;
import com.meuapp.feedback.domain.Feedback;
import com.meuapp.feedback.domain.Restaurant;
import com.meuapp.feedback.dto.admin.FeedbackDetailsAdminDTO;
import com.meuapp.feedback.dto.admin.FeedbackListItemDTO;
import com.meuapp.feedback.dto.admin.HorarioReclamacoesDTO;
import com.meuapp.feedback.dto.admin.RespostaEmailRequestDTO;
import com.meuapp.feedback.repository.AdminUserRepository;
import com.meuapp.feedback.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminFeedbackService {

    private final AdminUserRepository adminUserRepository;
    private final FeedbackRepository feedbackRepository;
    private final EmailService emailService;


    private Restaurant getRestaurant(Long adminId) {
        return adminUserRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin não encontrado"))
                .getRestaurant();
    }

    // ============================================================
    // LISTAGEM COMPLETA DE FEEDBACKS + FILTROS
    // ============================================================
    public Page<FeedbackListItemDTO> listarFeedbacks(
            AdminUser admin,
            Integer page,
            Integer size,
            String tipo,
            Boolean validado,
            String nome,
            String email,
            String cupom,
            LocalDate dataInicio,
            LocalDate dataFim
    ) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Restaurant restaurant = admin.getRestaurant();

        List<Feedback> todos = feedbackRepository
                .findByRestaurant(restaurant, Pageable.unpaged())
                .getContent();

        List<Feedback> filtrados = todos.stream()

                // Tipo: POSITIVO / NEGATIVO
                .filter(f -> {
                    if (tipo == null) return true;
                    if (tipo.equalsIgnoreCase("POSITIVO")) return f.getNota() >= 4;
                    if (tipo.equalsIgnoreCase("NEGATIVO")) return f.getNota() <= 3;
                    return true;
                })

                // Validado
                .filter(f -> validado == null || Boolean.TRUE.equals(f.getCupomValidado()) == validado)

                // Nome
                .filter(f -> nome == null || f.getNome().toLowerCase().contains(nome.toLowerCase()))

                // Email
                .filter(f -> email == null || f.getEmail().toLowerCase().contains(email.toLowerCase()))

                // Cupom
                .filter(f -> cupom == null ||
                        (f.getCupom() != null && f.getCupom().toLowerCase().contains(cupom.toLowerCase())))

                // Data início
                .filter(f -> dataInicio == null ||
                        !f.getDataCriacao().toLocalDate().isBefore(dataInicio))

                // Data fim
                .filter(f -> dataFim == null ||
                        !f.getDataCriacao().toLocalDate().isAfter(dataFim))

                .sorted(Comparator.comparing(Feedback::getId).reversed())
                .toList();

        // DTO
        List<FeedbackListItemDTO> dtos = filtrados.stream()
                .map(f -> FeedbackListItemDTO.builder()
                        .id(f.getId())
                        .nome(f.getNome())
                        .email(f.getEmail())
                        .whatsapp(f.getWhatsapp())
                        .data(f.getDataCriacao())
                        .nota(f.getNota())
                        .tipoFeedback(f.getNota() >= 4 ? "POSITIVO" : "NEGATIVO")
                        .mensagem(f.getMensagemNegativa())
                        .itemConsumido(f.getItemConsumido())
                        .cupom(f.getCupom())
                        .cupomValidado(f.getCupomValidado())
                        .build())
                .toList();

        // Paginação manual
        int start = page * size;
        int end = Math.min(start + size, dtos.size());

        List<FeedbackListItemDTO> pageContent =
                start >= dtos.size() ? List.of() : dtos.subList(start, end);

        return new PageImpl<>(pageContent, pageable, dtos.size());
    }

    // ============================================================
    // DETALHES DO FEEDBACK
    // ============================================================
    public FeedbackDetailsAdminDTO buscarDetalhe(AdminUser admin, Long idFeedback) {

        Restaurant restaurant = admin.getRestaurant();

        Feedback f = feedbackRepository.findById(idFeedback)
                .orElseThrow(() -> new RuntimeException("Feedback não encontrado"));

        if (!f.getRestaurant().equals(restaurant)) {
            throw new RuntimeException("Acesso negado ao feedback de outro restaurante");
        }

        return FeedbackDetailsAdminDTO.builder()
                .id(f.getId())
                .nome(f.getNome())
                .email(f.getEmail())
                .whatsapp(f.getWhatsapp())
                .itemConsumido(f.getItemConsumido())
                .nota(f.getNota())
                .mensagemNegativa(f.getMensagemNegativa())
                .dataCriacao(f.getDataCriacao())
                .cupom(f.getCupom())
                .cupomValidado(f.getCupomValidado())
                .dataValidacaoCupom(f.getDataValidacaoCupom())
                .build();
    }

    // ============================================================
    // VALIDAR CUPOM
    // ============================================================
    public FeedbackDetailsAdminDTO validarCupom(Long adminId, Long idFeedback) {

        Restaurant restaurant = getRestaurant(adminId);

        Feedback f = feedbackRepository.findById(idFeedback)
                .orElseThrow(() -> new RuntimeException("Feedback não encontrado"));

        if (!f.getRestaurant().equals(restaurant)) {
            throw new RuntimeException("Acesso negado: este feedback pertence a outro restaurante");
        }

        if (Boolean.TRUE.equals(f.getCupomValidado())) {
            throw new RuntimeException("Este cupom já foi validado anteriormente");
        }

        f.setCupomValidado(true);
        f.setDataValidacaoCupom(LocalDateTime.now());
        feedbackRepository.save(f);

        return FeedbackDetailsAdminDTO.builder()
                .id(f.getId())
                .nome(f.getNome())
                .email(f.getEmail())
                .whatsapp(f.getWhatsapp())
                .itemConsumido(f.getItemConsumido())
                .nota(f.getNota())
                .mensagemNegativa(f.getMensagemNegativa())
                .dataCriacao(f.getDataCriacao())
                .cupom(f.getCupom())
                .cupomValidado(f.getCupomValidado())
                .dataValidacaoCupom(f.getDataValidacaoCupom())
                .build();
    }

    // ============================================================
    // NOVO: HORÁRIOS COM MAIS RECLAMAÇÕES
    // ============================================================
    public List<HorarioReclamacoesDTO> horariosComMaisReclamacoes(Long adminId) {

        Restaurant restaurant = getRestaurant(adminId);

        List<Feedback> feedbacks = feedbackRepository
                .findByRestaurant(restaurant, Pageable.unpaged())
                .getContent();

        Map<Integer, Long> contagemPorHora = new HashMap<>();

        for (Feedback f : feedbacks) {
            if (f.getMensagemNegativa() != null && !f.getMensagemNegativa().isBlank()) {

                int hora = f.getDataCriacao().getHour();

                contagemPorHora.put(hora, contagemPorHora.getOrDefault(hora, 0L) + 1);
            }
        }

        return contagemPorHora.entrySet().stream()
                .sorted(Map.Entry.<Integer, Long>comparingByValue().reversed())
                .map(e -> HorarioReclamacoesDTO.builder()
                        .horaInicio(e.getKey())
                        .horaFim(e.getKey() + 1)
                        .totalReclamacoes(e.getValue())
                        .build()
                )
                .toList();
    }

    public void enviarRespostaEmail(AdminUser admin, Long idFeedback, String mensagem) {

        Restaurant restaurant = admin.getRestaurant();

        Feedback f = feedbackRepository.findById(idFeedback)
                .orElseThrow(() -> new RuntimeException("Feedback não encontrado"));

        if (!f.getRestaurant().equals(restaurant)) {
            throw new RuntimeException("Acesso negado");
        }

        if (f.getNota() >= 4) {
            throw new RuntimeException("Somente feedback negativo pode receber resposta");
        }

        String assunto = "Retorno sobre seu feedback";

        emailService.enviarEmail(f.getEmail(), assunto, mensagem);
    }


}
