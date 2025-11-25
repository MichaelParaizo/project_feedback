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
public class FeedbackDetailsAdminDTO {

    private Long id;

    private String nome;
    private String email;
    private String whatsapp;

    private LocalDateTime dataCriacao;

    private int nota;

    // NEGATIVO / POSITIVO
    private String tipoFeedback;

    private String itemConsumido;

    // Mensagem negativa (quando nota baixa)
    private String mensagemNegativa;

    // Link do Google usado para notas altas
    private String linkGoogle;

    private String cupom;

    private boolean cupomValidado;

    private LocalDateTime dataValidacaoCupom;

    // Informação de LGPD
    private boolean consentimentoLgpd;

    // Nome do restaurante (caso queira mostrar na tela)
    private String restauranteNome;
}
