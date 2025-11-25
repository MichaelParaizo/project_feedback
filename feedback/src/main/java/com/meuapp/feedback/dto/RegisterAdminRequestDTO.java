package com.meuapp.feedback.dto;

import lombok.Data;

@Data
public class RegisterAdminRequestDTO {

    private String nome;
    private String email;
    private String password;
    private Long restaurantId;
}
