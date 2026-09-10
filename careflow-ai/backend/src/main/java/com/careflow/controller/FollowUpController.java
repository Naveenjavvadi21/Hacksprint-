package com.careflow.controller;

import com.careflow.dto.FollowUpDto;
import com.careflow.entity.enums.FollowUpStatus;
import com.careflow.service.FollowUpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/followups")
public class FollowUpController {

    @Autowired
    private FollowUpService followUpService;

    @GetMapping
    public ResponseEntity<List<FollowUpDto>> getAllFollowUps() {
        return ResponseEntity.ok(followUpService.getAllFollowUps());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<FollowUpDto>> getFollowUpsByPatient(@PathVariable("patientId") Long patientId) {
        return ResponseEntity.ok(followUpService.getFollowUpsByPatient(patientId));
    }

    @PostMapping
    public ResponseEntity<FollowUpDto> createFollowUp(@RequestBody FollowUpDto followUpDto) {
        return ResponseEntity.ok(followUpService.createFollowUp(followUpDto));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<FollowUpDto> updateFollowUpStatus(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> payload) {
        String statusStr = payload.get("status");
        if (statusStr == null || statusStr.trim().isEmpty()) {
            throw new IllegalArgumentException("Follow-up status cannot be empty.");
        }
        FollowUpStatus status;
        try {
            status = FollowUpStatus.valueOf(statusStr.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid follow-up status: " + statusStr + ". Must be UPCOMING, DUE_TODAY, or COMPLETED.");
        }
        FollowUpDto updated = followUpService.updateFollowUpStatus(id, status);
        return ResponseEntity.ok(updated);
    }
}
