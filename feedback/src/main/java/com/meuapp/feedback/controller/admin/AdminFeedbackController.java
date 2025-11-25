package com.meuapp.feedback.controller.admin;

import com.meuapp.feedback.domain.AdminUser;
import com.meuapp.feedback.dto.admin.FeedbackDetailsAdminDTO;
import com.meuapp.feedback.dto.admin.FeedbackListItemDTO;
import com.meuapp.feedback.dto.admin.RespostaEmailRequestDTO;
import com.meuapp.feedback.service.AdminFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/admin/feedbacks")
@RequiredArgsConstructor
public class AdminFeedbackController {

    private final AdminFeedbackService adminFeedbackService;

    @GetMapping
    public Page<FeedbackListItemDTO> listarFeedbacks(
            @AuthenticationPrincipal AdminUser admin,

            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,

            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) Boolean validado,
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String cupom,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                    LocalDate dataInicio,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                    LocalDate dataFim
    ) {
        return adminFeedbackService.listarFeedbacks(
                admin,
                page,
                size,
                tipo,
                validado,
                nome,
                email,
                cupom,
                dataInicio,
                dataFim
        );
    }

    @GetMapping("/{id}")
    public FeedbackDetailsAdminDTO buscarDetalhe(
            @AuthenticationPrincipal AdminUser admin,
            @PathVariable Long id
    ) {
        return adminFeedbackService.buscarDetalhe(admin, id);
    }

    @PatchMapping("/{id}/validar-cupom")
    public FeedbackDetailsAdminDTO validarCupom(
            @AuthenticationPrincipal AdminUser admin,
            @PathVariable Long id
    ) {
        return adminFeedbackService.validarCupom(admin.getId(), id);
    }

    // NOVO ENDPOINT DO PONTO 1 (HORÁRIOS)
    @GetMapping("/horarios")
    public Object horariosMaisReclamacoes(@AuthenticationPrincipal AdminUser admin) {
        return adminFeedbackService.horariosComMaisReclamacoes(admin.getId());
    }

    @PostMapping("/{id}/responder-email")
    public ResponseEntity<?> responderEmail(
            @AuthenticationPrincipal AdminUser admin,
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String mensagem = body.get("mensagem");

        adminFeedbackService.enviarRespostaEmail(admin, id, mensagem);

        return ResponseEntity.ok(Map.of(
                "status", "OK",
                "mensagem", "Email enviado com sucesso!"
        ));
    }


}
