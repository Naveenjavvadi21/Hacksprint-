package com.careflow.service;

import com.careflow.dto.PatientDto;
import com.careflow.dto.TimelineEventDto;
import com.careflow.entity.Document;
import com.careflow.entity.FollowUp;
import com.careflow.entity.Patient;
import com.careflow.entity.Task;
import com.careflow.repository.DocumentRepository;
import com.careflow.repository.FollowUpRepository;
import com.careflow.repository.PatientRepository;
import com.careflow.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private FollowUpRepository followUpRepository;

    public List<PatientDto> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(PatientDto::new)
                .collect(Collectors.toList());
    }

    public PatientDto convertToDto(Patient patient) {
        return new PatientDto(patient);
    }

    public PatientDto getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
        return new PatientDto(patient);
    }

    public PatientDto createPatient(PatientDto dto) {
        String patientCode = dto.getPatientCode();
        if (patientCode == null || patientCode.isBlank()) {
            long count = patientRepository.count();
            patientCode = "P-" + (1000 + count + 1);
        }

        Patient patient = new Patient(
                patientCode,
                dto.getName(),
                dto.getAge(),
                dto.getGender(),
                dto.getPhone(),
                dto.getDoctor(),
                dto.getWorkflowStatus()
        );

        Patient saved = patientRepository.save(patient);
        return new PatientDto(saved);
    }

    public PatientDto updatePatient(Long id, PatientDto dto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));

        if (dto.getName() != null) patient.setName(dto.getName());
        if (dto.getAge() != null) patient.setAge(dto.getAge());
        if (dto.getGender() != null) patient.setGender(dto.getGender());
        if (dto.getPhone() != null) patient.setPhone(dto.getPhone());
        if (dto.getDoctor() != null) patient.setDoctor(dto.getDoctor());
        if (dto.getWorkflowStatus() != null) patient.setWorkflowStatus(dto.getWorkflowStatus());

        Patient updated = patientRepository.save(patient);
        return new PatientDto(updated);
    }

    public List<TimelineEventDto> getPatientTimeline(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));

        List<TimelineEventDto> events = new ArrayList<>();

        // Event 1: Registration
        events.add(new TimelineEventDto(
                "reg-" + patient.getId(),
                "PATIENT_REGISTERED",
                "Patient Admitted & Workflow Opened",
                "Patient record created with ID " + patient.getPatientCode() + " assigned to " + patient.getDoctor() + ".",
                "Admissions",
                patient.getCreatedAt() != null ? patient.getCreatedAt() : LocalDateTime.now().minusDays(3)
        ));

        // Event 2: Documents
        List<Document> docs = documentRepository.findByPatientIdOrderByUploadedAtDesc(patientId);
        for (Document doc : docs) {
            events.add(new TimelineEventDto(
                    "doc-" + doc.getId(),
                    "DOCUMENT_UPLOADED",
                    "Document Uploaded: " + doc.getFileName(),
                    "Type: " + doc.getDocumentType() + " uploaded by " + doc.getUploadedBy() + ".",
                    doc.getUploadedBy() != null ? doc.getUploadedBy() : "System",
                    doc.getUploadedAt() != null ? doc.getUploadedAt() : LocalDateTime.now().minusDays(2)
            ));

            if (Boolean.TRUE.equals(doc.getAiProcessed())) {
                events.add(new TimelineEventDto(
                        "ai-" + doc.getId(),
                        "AI_ANALYSIS",
                        "AI Document Analysis Completed",
                        "CareFlow AI extracted summary and care action items for " + doc.getFileName() + ".",
                        "CareFlow AI Engine",
                        doc.getUploadedAt() != null ? doc.getUploadedAt().plusMinutes(2) : LocalDateTime.now().minusDays(2)
                ));
            }
        }

        // Event 3: Tasks
        List<Task> tasks = taskRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
        for (Task task : tasks) {
            events.add(new TimelineEventDto(
                    "task-" + task.getId(),
                    "TASK_CREATED",
                    "Task Generated: " + task.getTitle(),
                    "Department: " + task.getDepartment() + " | Assigned To: " + task.getAssignedTo() + " | Priority: " + task.getPriority(),
                    "CareFlow AI Workflow",
                    task.getCreatedAt() != null ? task.getCreatedAt() : LocalDateTime.now().minusDays(1)
            ));

            if (task.getStatus() == com.careflow.entity.enums.TaskStatus.COMPLETED) {
                events.add(new TimelineEventDto(
                        "task-comp-" + task.getId(),
                        "TASK_COMPLETED",
                        "Task Completed: " + task.getTitle(),
                        "Task marked as COMPLETED by " + task.getAssignedTo() + ".",
                        task.getAssignedTo() != null ? task.getAssignedTo() : "Staff",
                        task.getCreatedAt() != null ? task.getCreatedAt().plusHours(4) : LocalDateTime.now()
                ));
            }
        }

        // Event 4: Follow-ups
        List<FollowUp> followUps = followUpRepository.findByPatientIdOrderByScheduledDateAsc(patientId);
        for (FollowUp f : followUps) {
            events.add(new TimelineEventDto(
                    "fu-" + f.getId(),
                    "FOLLOWUP_SCHEDULED",
                    "Follow-up Scheduled: " + f.getType(),
                    "Scheduled on " + f.getScheduledDate() + " with " + f.getDoctor() + " (" + f.getStatus() + ").",
                    "Scheduling",
                    f.getCreatedAt() != null ? f.getCreatedAt() : LocalDateTime.now()
            ));
        }

        events.sort(Comparator.comparing(TimelineEventDto::getTimestamp).reversed());
        return events;
    }
}
