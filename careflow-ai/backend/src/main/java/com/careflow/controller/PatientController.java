package com.careflow.controller;

import com.careflow.dto.PatientDto;
import com.careflow.dto.TimelineEventDto;
import com.careflow.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PatientController {

    @Autowired
    private PatientService patientService;

    @GetMapping
    public ResponseEntity<List<PatientDto>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDto> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'COORDINATOR')")
    public ResponseEntity<PatientDto> createPatient(@RequestBody PatientDto patientDto) {
        return ResponseEntity.ok(patientService.createPatient(patientDto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'COORDINATOR', 'NURSE')")
    public ResponseEntity<PatientDto> updatePatient(@PathVariable Long id, @RequestBody PatientDto patientDto) {
        return ResponseEntity.ok(patientService.updatePatient(id, patientDto));
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<List<TimelineEventDto>> getPatientTimeline(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientTimeline(id));
    }
}
