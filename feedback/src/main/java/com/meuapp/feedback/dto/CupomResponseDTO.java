package com.meuapp.feedback.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CupomResponseDTO {
    private String cupom;
    private String mensagem;
}
