package com.meuapp.feedback.controller;

import com.meuapp.feedback.domain.Feedback;
import com.meuapp.feedback.dto.CupomResponseDTO;
import com.meuapp.feedback.dto.FeedbackRequestDTO;
import com.meuapp.feedback.dto.FeedbackResponseDTO;
import com.meuapp.feedback.service.FeedbackService;

import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }


    @PostMapping
    public ResponseEntity<FeedbackResponseDTO> enviarFeedback(@RequestBody @Valid FeedbackRequestDTO dto) {
        FeedbackResponseDTO resposta = feedbackService.processarFeedback(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @PostMapping("/{id}/gerar-cupom")
    public ResponseEntity<CupomResponseDTO> gerarCupom(@PathVariable Long id) {
        CupomResponseDTO dto = feedbackService.gerarCupom(id);
        return ResponseEntity.ok(dto);
    }


}
