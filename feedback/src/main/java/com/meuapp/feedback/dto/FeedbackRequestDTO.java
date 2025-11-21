package com.meuapp.feedback.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedbackRequestDTO {

    @NotBlank(message = "O nome é obrigatório")
    private String nome;

    @Email(message = "E-mail inválido")
    @NotBlank(message = "O e-mail é obrigatório")
    private String email;

    @NotBlank(message = "O WhatsApp é obrigatório")
    private String whatsapp;

    private String itemConsumido;

    @Min(value = 1, message = "Nota mínima é 1")
    @Max(value = 5, message = "Nota máxima é 5")
    private int nota;

    private boolean consentimentoLgpd;

    // apenas usado para notas < 4
    private String mensagemNegativa;
}