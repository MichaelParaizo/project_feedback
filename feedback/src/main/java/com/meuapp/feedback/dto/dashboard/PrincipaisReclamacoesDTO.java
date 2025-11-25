package com.meuapp.feedback.dto.dashboard;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PrincipaisReclamacoesDTO {
    private List<ReclamacaoItemDTO> itens;
}
