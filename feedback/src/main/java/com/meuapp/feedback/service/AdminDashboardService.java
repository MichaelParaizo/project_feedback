package com.meuapp.feedback.service;

import com.meuapp.feedback.domain.AdminUser;
import com.meuapp.feedback.domain.Feedback;
import com.meuapp.feedback.domain.Restaurant;
import com.meuapp.feedback.dto.dashboard.*;
import com.meuapp.feedback.repository.AdminUserRepository;
import com.meuapp.feedback.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final AdminUserRepository adminUserRepository;
    private final FeedbackRepository feedbackRepository;

    private Restaurant getRestaurant(Long adminId) {
        return adminUserRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin não encontrado"))
                .getRestaurant();
    }

    public DashboardResponseDTO getDashboard(Long adminId) {

        Restaurant restaurant = getRestaurant(adminId);

        Page<Feedback> pagina = feedbackRepository.findByRestaurant(restaurant, Pageable.unpaged());
        List<Feedback> feedbacks = pagina.getContent();

        long total = feedbacks.size();
        long positivos = feedbacks.stream().filter(f -> f.getNota() >= 4).count();
        long negativos = feedbacks.stream().filter(f -> f.getNota() <= 3).count();

        MetricasGeraisDTO metricas = MetricasGeraisDTO.builder()
                .totalFeedbacks(total)
                .positivosPercent(total > 0 ? (positivos * 100.0) / total : 0)
                .negativosPercent(total > 0 ? (negativos * 100.0) / total : 0)
                .novosClientesHoje((int) feedbacks.stream()
                        .filter(f -> f.getDataCriacao().toLocalDate().equals(LocalDate.now()))
                        .count())
                .build();

        CuponsDTO cupons = CuponsDTO.builder()
                .cuponsSolicitados((int) feedbacks.stream().filter(f -> f.getCupom() != null).count())
                .cuponsValidados((int) feedbacks.stream().filter(Feedback::getCupomValidado).count())
                .build();

        SentimentosDTO sentimentos = SentimentosDTO.builder()
                .positivosPercent(metricas.getPositivosPercent())
                .negativosPercent(metricas.getNegativosPercent())
                .build();

        // Reclamações agrupadas
        Map<String, Long> agrupadas =
                feedbacks.stream()
                        .filter(f -> f.getMensagemNegativa() != null && !f.getMensagemNegativa().isBlank())
                        .collect(Collectors.groupingBy(Feedback::getMensagemNegativa, Collectors.counting()));

        List<ReclamacaoItemDTO> reclamacoes = agrupadas.entrySet().stream()
                .map(e -> new ReclamacaoItemDTO(e.getKey(), e.getValue()))
                .sorted(Comparator.comparingLong(ReclamacaoItemDTO::getQuantidade).reversed())
                .toList();

        PrincipaisReclamacoesDTO principais = new PrincipaisReclamacoesDTO(reclamacoes);

        // Timeline dos últimos 7 dias
        DateTimeFormatter df = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        List<TimelinePontoDTO> timelineFeedbacks = new ArrayList<>();
        List<TimelinePontoDTO> timelineCupons = new ArrayList<>();

        for (int i = 6; i >= 0; i--) {
            LocalDate dia = LocalDate.now().minusDays(i);

            long countFeedback = feedbacks.stream()
                    .filter(f -> f.getDataCriacao().toLocalDate().equals(dia))
                    .count();

            long countCupom = feedbacks.stream()
                    .filter(f -> f.getCupom() != null
                            && f.getDataCriacao().toLocalDate().equals(dia))
                    .count();

            timelineFeedbacks.add(new TimelinePontoDTO(df.format(dia), countFeedback));
            timelineCupons.add(new TimelinePontoDTO(df.format(dia), countCupom));
        }

        TimelineDTO timeline = TimelineDTO.builder()
                .feedbacks(timelineFeedbacks)
                .cupons(timelineCupons)
                .build();

        return DashboardResponseDTO.builder()
                .metricasGerais(metricas)
                .cupons(cupons)
                .sentimentos(sentimentos)
                .principaisReclamacoes(principais)
                .timeline(timeline)
                .build();
    }
}
