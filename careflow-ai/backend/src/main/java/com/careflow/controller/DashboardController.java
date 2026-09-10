package com.careflow.controller;

import com.careflow.dto.DashboardDto;
import com.careflow.security.UserDetailsImpl;
import com.careflow.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardDto> getDashboardMetrics(
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "user", required = false) String user
    ) {
        // If explicit role is requested (e.g. from role switch in UI)
        if (role != null && !role.trim().isEmpty()) {
            String roleUpper = role.toUpperCase();
            String defaultName = "Admin";
            if ("DOCTOR".equals(roleUpper)) defaultName = "Dr. Rao";
            else if ("NURSE".equals(roleUpper) || "STAFF".equals(roleUpper)) defaultName = "Nurse Sarah";

            String effectiveUser = (user != null && !user.trim().isEmpty()) ? user : defaultName;
            return ResponseEntity.ok(dashboardService.getDashboardForRole(effectiveUser, roleUpper));
        }

        // Otherwise use authenticated user's role
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            return ResponseEntity.ok(
                    dashboardService.getDashboardForRole(userDetails.getName(), userDetails.getRole().name())
            );
        }
        return ResponseEntity.ok(dashboardService.getDashboardMetrics());
    }

    @GetMapping("/admin")
    public ResponseEntity<DashboardDto> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboardForRole("Admin User", "ADMIN"));
    }

    @GetMapping("/doctor")
    public ResponseEntity<DashboardDto> getDoctorDashboard(@RequestParam(value = "doctor", required = false, defaultValue = "Dr. Rao") String doctor) {
        return ResponseEntity.ok(dashboardService.getDashboardForRole(doctor, "DOCTOR"));
    }

    @GetMapping("/nurse")
    public ResponseEntity<DashboardDto> getNurseDashboard(@RequestParam(value = "nurse", required = false, defaultValue = "Nurse Sarah") String nurse) {
        return ResponseEntity.ok(dashboardService.getDashboardForRole(nurse, "NURSE"));
    }
}
