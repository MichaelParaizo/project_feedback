package com.meuapp.feedback.dto.cupom;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CupomDetalheDTO {

    private Long id;
    private String cupom;
    private Boolean validado;
    private String mensagem;

}
