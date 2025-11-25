package com.meuapp.feedback.dto.dashboard;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DashboardResponseDTO {

    private MetricasGeraisDTO metricasGerais;
    private CuponsDTO cupons;
    private SentimentosDTO sentimentos;
    private PrincipaisReclamacoesDTO principaisReclamacoes;
    private TimelineDTO timeline;
}
