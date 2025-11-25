package com.meuapp.feedback.config;

import com.meuapp.feedback.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // API REST não usa sessão
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // CSRF desnecessário em API REST (só atrapalha)
                .csrf(csrf -> csrf.disable())

                // CORS já configurado no seu projeto
                .cors(cors -> {})

                // LIBERAR ROTAS PÚBLICAS
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/auth/**",
                                "/feedback/**",

                                // Swagger - precisa estar público!
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // ROTAS PROTEGIDAS PELO JWT
                        .requestMatchers("/admin/**").authenticated()

                        // Qualquer outra rota -> pública (por enquanto)
                        .anyRequest().permitAll()
                )

                // Adiciona o filtro JWT ANTES do filtro padrão de login
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // BCrypt para armazenar senhas seguras
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
