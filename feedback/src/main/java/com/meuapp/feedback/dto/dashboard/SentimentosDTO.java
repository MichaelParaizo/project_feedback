package com.meuapp.feedback.dto.dashboard;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SentimentosDTO {
    private double positivosPercent;
    private double negativosPercent;
}
