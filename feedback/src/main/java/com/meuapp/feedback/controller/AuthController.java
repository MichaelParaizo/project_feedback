package com.meuapp.feedback.controller;

import com.meuapp.feedback.domain.AdminUser;
import com.meuapp.feedback.dto.LoginRequestDTO;
import com.meuapp.feedback.dto.LoginResponseDTO;
import com.meuapp.feedback.dto.MeResponseDTO;
import com.meuapp.feedback.dto.RegisterAdminRequestDTO;
import com.meuapp.feedback.service.AuthService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register-admin")
    public ResponseEntity<AdminUser> registerAdmin(@RequestBody RegisterAdminRequestDTO dto) {
        return ResponseEntity.ok(authService.registerAdmin(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponseDTO> me(@AuthenticationPrincipal AdminUser admin) {

        if (admin == null) {
            return ResponseEntity.status(401).build();
        }

        MeResponseDTO response = MeResponseDTO.builder()
                .adminId(admin.getId())
                .nome(admin.getNome())
                .email(admin.getEmail())
                .restaurantId(admin.getRestaurant().getId())
                .build();

        return ResponseEntity.ok(response);
    }

}
