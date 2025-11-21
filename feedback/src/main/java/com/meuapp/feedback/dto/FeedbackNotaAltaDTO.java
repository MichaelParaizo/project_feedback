package com.meuapp.feedback.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FeedbackNotaAltaDTO {
    private String mensagem;
    private String urlAvaliacao;
}
