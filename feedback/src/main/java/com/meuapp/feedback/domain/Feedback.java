package com.meuapp.feedback.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String email;
    private String whatsapp;
    private String itemConsumido;

    private int nota;

    private boolean consentimentoLgpd;


    private String mensagemNegativa;

//    private String mensagem;

    private LocalDateTime dataCriacao;

    private String linkGoogle;

    private String cupom;
}
