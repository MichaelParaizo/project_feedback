package com.meuapp.feedback.dto.dashboard;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CuponsDTO {
    private long cuponsSolicitados;
    private long cuponsValidados;
}
