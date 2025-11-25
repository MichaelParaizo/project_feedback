package com.meuapp.feedback.dto.dashboard;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TimelineDTO {
    private List<TimelinePontoDTO> feedbacks;
    private List<TimelinePontoDTO> cupons;
}
