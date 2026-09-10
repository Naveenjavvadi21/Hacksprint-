package com.careflow.service;

import com.careflow.dto.FollowUpDto;
import com.careflow.entity.FollowUp;
import com.careflow.entity.Patient;
import com.careflow.entity.enums.FollowUpStatus;
import com.careflow.repository.FollowUpRepository;
import com.careflow.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FollowUpService {

    @Autowired
    private FollowUpRepository followUpRepository;

    @Autowired
    private PatientRepository patientRepository;

    public List<FollowUpDto> getAllFollowUps() {
        return followUpRepository.findAll().stream()
                .map(followUp -> {
                    String patientName = patientRepository.findById(followUp.getPatientId())
                            .map(Patient::getName).orElse("Unknown Patient");
                    return new FollowUpDto(followUp, patientName);
                })
                .collect(Collectors.toList());
    }

    public FollowUpDto convertToDto(FollowUp followUp) {
        String patientName = patientRepository.findById(followUp.getPatientId())
                .map(Patient::getName).orElse("Unknown Patient");
        return new FollowUpDto(followUp, patientName);
    }

    public List<FollowUpDto> getFollowUpsByPatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));

        return followUpRepository.findByPatientIdOrderByScheduledDateAsc(patientId).stream()
                .map(followUp -> new FollowUpDto(followUp, patient.getName()))
                .collect(Collectors.toList());
    }

    public FollowUpDto createFollowUp(FollowUpDto dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + dto.getPatientId()));

        LocalDate date = dto.getScheduledDate() != null ? dto.getScheduledDate() : LocalDate.now().plusDays(7);
        FollowUpStatus status = dto.getStatus();
        if (status == null) {
            status = date.isEqual(LocalDate.now()) ? FollowUpStatus.DUE_TODAY : FollowUpStatus.UPCOMING;
        }

        FollowUp followUp = new FollowUp(
                dto.getPatientId(),
                dto.getDoctor() != null ? dto.getDoctor() : patient.getDoctor(),
                dto.getType() != null ? dto.getType() : "Consultation",
                date,
                status,
                dto.getNotes()
        );

        FollowUp saved = followUpRepository.save(followUp);
        return new FollowUpDto(saved, patient.getName());
    }

    public FollowUpDto updateFollowUpStatus(Long id, FollowUpStatus status) {
        FollowUp followUp = followUpRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("FollowUp not found with id: " + id));

        followUp.setStatus(status);
        FollowUp updated = followUpRepository.save(followUp);

        String patientName = patientRepository.findById(updated.getPatientId())
                .map(Patient::getName).orElse("Unknown Patient");

        return new FollowUpDto(updated, patientName);
    }
}
