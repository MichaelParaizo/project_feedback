package com.meuapp.feedback.controller.admin;

import com.meuapp.feedback.domain.AdminUser;
import com.meuapp.feedback.dto.dashboard.DashboardResponseDTO;
import com.meuapp.feedback.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    @GetMapping
    public DashboardResponseDTO getDashboard(@AuthenticationPrincipal AdminUser admin) {
        return dashboardService.getDashboard(admin.getId());
    }
}
