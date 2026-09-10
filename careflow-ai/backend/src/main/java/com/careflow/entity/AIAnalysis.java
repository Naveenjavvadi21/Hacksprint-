package com.careflow.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_analyses")
public class AIAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long documentId;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String keyInformation;

    @Column(columnDefinition = "TEXT")
    private String extractedActionsJson;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public AIAnalysis() {
    }

    public AIAnalysis(Long documentId, String summary, String keyInformation, String extractedActionsJson) {
        this.documentId = documentId;
        this.summary = summary;
        this.keyInformation = keyInformation;
        this.extractedActionsJson = extractedActionsJson;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getKeyInformation() {
        return keyInformation;
    }

    public void setKeyInformation(String keyInformation) {
        this.keyInformation = keyInformation;
    }

    public String getExtractedActionsJson() {
        return extractedActionsJson;
    }

    public void setExtractedActionsJson(String extractedActionsJson) {
        this.extractedActionsJson = extractedActionsJson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
