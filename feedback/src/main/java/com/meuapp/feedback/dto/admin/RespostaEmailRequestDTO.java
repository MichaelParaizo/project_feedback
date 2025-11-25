package com.meuapp.feedback.dto.admin;

import lombok.Data;

@Data
public class RespostaEmailRequestDTO {
    private String email;
    private String mensagem;
}
