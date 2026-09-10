package com.careflow.dto;

import com.careflow.entity.FollowUp;
import com.careflow.entity.enums.FollowUpStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class FollowUpDto {
    private Long id;
    private Long patientId;
    private String patientName;
    private String doctor;
    private String type;
    private LocalDate scheduledDate;
    private FollowUpStatus status;
    private String notes;
    private LocalDateTime createdAt;

    public FollowUpDto() {
    }

    public FollowUpDto(FollowUp followUp, String patientName) {
        this.id = followUp.getId();
        this.patientId = followUp.getPatientId();
        this.patientName = patientName;
        this.doctor = followUp.getDoctor();
        this.type = followUp.getType();
        this.scheduledDate = followUp.getScheduledDate();
        this.status = followUp.getStatus();
        this.notes = followUp.getNotes();
        this.createdAt = followUp.getCreatedAt();
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

    public String getDoctor() {
        return doctor;
    }

    public void setDoctor(String doctor) {
        this.doctor = doctor;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDate scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public FollowUpStatus getStatus() {
        return status;
    }

    public void setStatus(FollowUpStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
