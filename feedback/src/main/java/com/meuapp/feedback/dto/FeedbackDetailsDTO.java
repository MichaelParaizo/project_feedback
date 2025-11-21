package com.meuapp.feedback.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedbackDetailsDTO {


    private String mensagemNegativa;
}
