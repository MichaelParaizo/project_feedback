package com.meuapp.feedback.controller.admin;

import com.meuapp.feedback.dto.cupom.CupomDetalheDTO;
import com.meuapp.feedback.dto.cupom.CupomListItemDTO;
import com.meuapp.feedback.security.AuthenticatedAdmin;
import com.meuapp.feedback.service.CupomService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/cupons")
@RequiredArgsConstructor
public class CupomController {

    private final CupomService cupomService;

    @GetMapping
    public Page<CupomListItemDTO> listar(
            @AuthenticatedAdmin Long adminId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean validados
    ) {
        return cupomService.listarCupons(
                adminId,
                PageRequest.of(page, size, Sort.by("id").descending()),
                validados
        );
    }

    @PatchMapping("/{id}/validar")
    public ResponseEntity<?> validar(
            @AuthenticatedAdmin Long adminId,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(cupomService.validarCupom(adminId, id));
    }
}
