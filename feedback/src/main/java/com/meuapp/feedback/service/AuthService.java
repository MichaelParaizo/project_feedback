package com.meuapp.feedback.service;

import com.meuapp.feedback.domain.AdminUser;
import com.meuapp.feedback.domain.Restaurant;
import com.meuapp.feedback.dto.LoginRequestDTO;
import com.meuapp.feedback.dto.LoginResponseDTO;
import com.meuapp.feedback.dto.RegisterAdminRequestDTO;
import com.meuapp.feedback.repository.AdminUserRepository;
import com.meuapp.feedback.repository.RestaurantRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminUserRepository adminRepo;
    private final RestaurantRepository restaurantRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService; // vamos criar na próxima parte

    public AdminUser registerAdmin(RegisterAdminRequestDTO dto) {

        Restaurant restaurant = restaurantRepo.findById(dto.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurante não encontrado"));

        AdminUser admin = AdminUser.builder()
                .nome(dto.getNome())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .restaurant(restaurant)
                .build();

        return adminRepo.save(admin);
    }

    public LoginResponseDTO login(LoginRequestDTO dto) {

        AdminUser admin = adminRepo.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou senha inválidos"));

        if (!passwordEncoder.matches(dto.getPassword(), admin.getPassword())) {
            throw new RuntimeException("Email ou senha inválidos");
        }

        String token = jwtService.generateToken(admin);

        return LoginResponseDTO.builder()
                .token(token)
                .adminId(admin.getId())
                .nome(admin.getNome())
                .email(admin.getEmail())
                .restaurantId(admin.getRestaurant().getId())
                .build();
    }
}
