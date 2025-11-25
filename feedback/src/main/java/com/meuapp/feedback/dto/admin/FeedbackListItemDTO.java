package com.meuapp.feedback.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FeedbackListItemDTO {

    private Long id;

    private String nome;
    private String email;
    private String whatsapp;

    // Data/hora em que o feedback foi criado
    private LocalDateTime data;

    // "POSITIVO" ou "NEGATIVO"
    private String tipoFeedback;

    // Só é preenchido para feedbacks negativos (nota <= 3)
    private String mensagem;

    private String itemConsumido;

    private String cupom;

    // true = validado (usado) | false = pendente
    private boolean cupomValidado;

    private int nota;
}
