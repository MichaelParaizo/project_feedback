package com.meuapp.feedback.dto.dashboard;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReclamacaoItemDTO {
    private String categoria;
    private long quantidade;
}
