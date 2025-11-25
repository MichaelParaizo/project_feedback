package com.meuapp.feedback.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "restaurant")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String endereco;

    private String linkGoogleAvaliacao;
}
