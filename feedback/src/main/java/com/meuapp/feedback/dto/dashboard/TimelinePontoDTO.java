package com.meuapp.feedback.dto.dashboard;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TimelinePontoDTO {
    private String dia; // "2025-11-23"
    private long quantidade;
}
