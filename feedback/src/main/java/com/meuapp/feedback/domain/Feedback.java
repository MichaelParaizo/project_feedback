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

    private Boolean consentimentoLgpd;

    private String mensagemNegativa;

    private LocalDateTime dataCriacao;

    private String linkGoogle;

    private String cupom;

    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    @Column(nullable = false)
    private Boolean cupomValidado = false;

    private LocalDateTime dataValidacaoCupom;

    // 🚀 Garante que NUNCA será salvo null
    @PrePersist
    public void prePersist() {

        if (cupomValidado == null) {
            cupomValidado = false;
        }

        if (dataCriacao == null) {
            dataCriacao = LocalDateTime.now();
        }
    }
}
