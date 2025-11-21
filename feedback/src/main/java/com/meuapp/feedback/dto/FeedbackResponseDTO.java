package com.meuapp.feedback.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class FeedbackResponseDTO {
    private Long id;
    private String tipo;            // "ALTA" ou "BAIXA"
    private String mensagem;        // texto final para o front
    private String linkGoogle;      // somente se nota >= 4
    private String cupom;           // vamos gerar depois
    private int nota;
    private LocalDateTime dataCriacao;
}
