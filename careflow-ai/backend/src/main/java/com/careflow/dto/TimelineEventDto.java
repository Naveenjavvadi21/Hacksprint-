package com.careflow.dto;

import java.time.LocalDateTime;

public class TimelineEventDto {
    private String id;
    private String type; // e.g. PATIENT_REGISTERED, DOCUMENT_UPLOADED, AI_ANALYSIS, TASK_CREATED, TASK_COMPLETED, FOLLOWUP_SCHEDULED
    private String title;
    private String description;
    private String actor;
    private LocalDateTime timestamp;

    public TimelineEventDto() {
    }

    public TimelineEventDto(String id, String type, String title, String description, String actor, LocalDateTime timestamp) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.description = description;
        this.actor = actor;
        this.timestamp = timestamp;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getActor() {
        return actor;
    }

    public void setActor(String actor) {
        this.actor = actor;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
