package com.meuapp.feedback.dto.cupom;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CupomListItemDTO {

    private Long id;
    private String nome;
    private String email;
    private String whatsapp;

    private String dataCriacao;

    private String cupom;
    private boolean cupomValidado;

    private String tipoFeedback; // POSITIVO ou NEGATIVO
}
