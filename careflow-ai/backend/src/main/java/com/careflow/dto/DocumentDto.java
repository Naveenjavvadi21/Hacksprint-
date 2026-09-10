package com.careflow.dto;

import com.careflow.entity.Document;
import com.careflow.entity.enums.DocumentType;

import java.time.LocalDateTime;

public class DocumentDto {
    private Long id;
    private Long patientId;
    private String patientName;
    private String fileName;
    private DocumentType documentType;
    private String content;
    private String uploadedBy;
    private LocalDateTime uploadedAt;
    private Boolean aiProcessed;

    public DocumentDto() {
    }

    public DocumentDto(Document doc, String patientName) {
        this.id = doc.getId();
        this.patientId = doc.getPatientId();
        this.patientName = patientName;
        this.fileName = doc.getFileName();
        this.documentType = doc.getDocumentType();
        this.content = doc.getContent();
        this.uploadedBy = doc.getUploadedBy();
        this.uploadedAt = doc.getUploadedAt();
        this.aiProcessed = doc.getAiProcessed();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public DocumentType getDocumentType() {
        return documentType;
    }

    public void setDocumentType(DocumentType documentType) {
        this.documentType = documentType;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(String uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public Boolean getAiProcessed() {
        return aiProcessed;
    }

    public void setAiProcessed(Boolean aiProcessed) {
        this.aiProcessed = aiProcessed;
    }
}
