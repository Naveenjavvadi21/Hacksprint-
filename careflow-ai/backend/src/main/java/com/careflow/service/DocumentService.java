package com.careflow.service;

import com.careflow.dto.DocumentDto;
import com.careflow.entity.Document;
import com.careflow.entity.Patient;
import com.careflow.entity.enums.DocumentType;
import com.careflow.repository.DocumentRepository;
import com.careflow.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private PatientRepository patientRepository;

    public DocumentDto uploadDocument(Long patientId, String fileName, DocumentType documentType, String content) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));

        String username = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : "Doctor";

        Document document = new Document(
                patientId,
                fileName != null ? fileName : "Medical-Record.txt",
                documentType != null ? documentType : DocumentType.DOCTOR_NOTE,
                content,
                username
        );

        Document saved = documentRepository.save(document);
        return new DocumentDto(saved, patient.getName());
    }

    public List<DocumentDto> getDocumentsByPatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));

        return documentRepository.findByPatientIdOrderByUploadedAtDesc(patientId).stream()
                .map(doc -> new DocumentDto(doc, patient.getName()))
                .collect(Collectors.toList());
    }

    public List<DocumentDto> getAllDocuments() {
        return documentRepository.findAll().stream()
                .map(doc -> {
                    String patientName = patientRepository.findById(doc.getPatientId())
                            .map(Patient::getName).orElse("Unknown Patient");
                    return new DocumentDto(doc, patientName);
                })
                .collect(Collectors.toList());
    }

    public DocumentDto getDocumentById(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));

        String patientName = patientRepository.findById(doc.getPatientId())
                .map(Patient::getName).orElse("Unknown Patient");

        return new DocumentDto(doc, patientName);
    }
}
