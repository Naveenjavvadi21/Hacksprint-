package com.careflow.controller;

import com.careflow.dto.DocumentDto;
import com.careflow.entity.enums.DocumentType;
import com.careflow.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @GetMapping
    public ResponseEntity<List<DocumentDto>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @PostMapping("/upload/{patientId}")
    public ResponseEntity<DocumentDto> uploadDocument(
            @PathVariable("patientId") Long patientId,
            @RequestBody Map<String, String> payload) {

        String fileName = payload.getOrDefault("fileName", "Doctor_Note.txt");
        String content = payload.get("content");
        String typeStr = payload.getOrDefault("documentType", "DOCTOR_NOTE");
        DocumentType documentType;
        try {
            documentType = DocumentType.valueOf(typeStr);
        } catch (Exception e) {
            documentType = DocumentType.DOCTOR_NOTE;
        }

        DocumentDto dto = documentService.uploadDocument(patientId, fileName, documentType, content);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<DocumentDto>> getDocumentsByPatient(@PathVariable("patientId") Long patientId) {
        return ResponseEntity.ok(documentService.getDocumentsByPatient(patientId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentDto> getDocumentById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(documentService.getDocumentById(id));
    }
}
