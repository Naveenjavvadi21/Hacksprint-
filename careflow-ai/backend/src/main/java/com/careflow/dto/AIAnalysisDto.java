package com.careflow.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AIAnalysisDto {
    private Long id;
    private Long documentId;
    private String summary;
    private List<String> keyInformation;
    private List<ActionItemDto> actions;
    private LocalDateTime createdAt;

    public AIAnalysisDto() {
    }

    public AIAnalysisDto(Long id, Long documentId, String summary, List<String> keyInformation, List<ActionItemDto> actions, LocalDateTime createdAt) {
        this.id = id;
        this.documentId = documentId;
        this.summary = summary;
        this.keyInformation = keyInformation;
        this.actions = actions;
        this.createdAt = createdAt;
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

    public List<String> getKeyInformation() {
        return keyInformation;
    }

    public void setKeyInformation(List<String> keyInformation) {
        this.keyInformation = keyInformation;
    }

    public List<ActionItemDto> getActions() {
        return actions;
    }

    public void setActions(List<ActionItemDto> actions) {
        this.actions = actions;
    }

    public List<ActionItemDto> getExtractedActions() {
        return actions;
    }

    public void setExtractedActions(List<ActionItemDto> extractedActions) {
        this.actions = extractedActions;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
