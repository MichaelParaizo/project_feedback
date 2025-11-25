package com.meuapp.feedback.service;

import com.meuapp.feedback.domain.AdminUser;
import com.meuapp.feedback.domain.Feedback;
import com.meuapp.feedback.domain.Restaurant;
import com.meuapp.feedback.dto.cupom.CupomDetalheDTO;
import com.meuapp.feedback.dto.cupom.CupomListItemDTO;
import com.meuapp.feedback.repository.AdminUserRepository;
import com.meuapp.feedback.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class CupomService {

    private final AdminUserRepository adminUserRepository;
    private final FeedbackRepository feedbackRepository;

    private final DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private Restaurant getRestaurantFromToken(Long adminId) {
        AdminUser admin = adminUserRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin não encontrado"));

        return admin.getRestaurant();
    }

    // LISTAGEM DE CUPONS
    public Page<CupomListItemDTO> listarCupons(Long adminId, Pageable pageable, Boolean somenteValidados) {

        Restaurant rest = getRestaurantFromToken(adminId);

        Page<Feedback> page;

        if (somenteValidados == null) {
            page = feedbackRepository.findByRestaurant(rest, pageable);
        } else if (somenteValidados) {
            page = feedbackRepository.findByRestaurantAndCupomValidadoTrue(rest, pageable);
        } else {
            page = feedbackRepository.findByRestaurantAndCupomValidadoFalse(rest, pageable);
        }

        return page.map(f -> CupomListItemDTO.builder()
                .id(f.getId())
                .nome(f.getNome())
                .email(f.getEmail())
                .whatsapp(f.getWhatsapp())
                .cupom(f.getCupom())
                .cupomValidado(f.getCupomValidado())
                .dataCriacao(f.getDataCriacao().format(dtf))
                .build()
        );
    }

    // VALIDAR CUPOM
    public CupomDetalheDTO validarCupom(Long adminId, Long feedbackId) {

        Restaurant rest = getRestaurantFromToken(adminId);

        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Cupom/Feedback não encontrado"));

        if (!feedback.getRestaurant().getId().equals(rest.getId())) {
            throw new RuntimeException("Cupom não pertence ao seu restaurante");
        }

        feedback.setCupomValidado(true);
        feedbackRepository.save(feedback);

        return CupomDetalheDTO.builder()
                .id(feedback.getId())
                .cupom(feedback.getCupom())
                .validado(true)
                .mensagem("Cupom validado com sucesso!")
                .build();
    }
}
