package com.meuapp.feedback.dto.admin;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class HorarioReclamacoesDTO {

    private int horaInicio;       // ex.: 14
    private int horaFim;          // ex.: 16
    private long totalReclamacoes;
}
