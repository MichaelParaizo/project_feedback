package com.meuapp.feedback.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MeResponseDTO {

    private Long adminId;
    private String nome;
    private String email;
    private Long restaurantId;
}
