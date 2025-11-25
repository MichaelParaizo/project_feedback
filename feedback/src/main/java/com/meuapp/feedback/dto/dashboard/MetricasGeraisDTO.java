package com.meuapp.feedback.dto.dashboard;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MetricasGeraisDTO {
    private long totalFeedbacks;
    private double positivosPercent;
    private double negativosPercent;
    private int novosClientesHoje;
}
