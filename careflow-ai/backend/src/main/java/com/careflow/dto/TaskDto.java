package com.careflow.dto;

import com.careflow.entity.Task;
import com.careflow.entity.enums.Priority;
import com.careflow.entity.enums.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TaskDto {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long analysisId;
    private String title;
    private String description;
    private String department;
    private String assignedTo;
    private Priority priority;
    private TaskStatus status;
    private LocalDate dueDate;
    private LocalDateTime createdAt;

    public TaskDto() {
    }

    public TaskDto(Task task, String patientName) {
        this.id = task.getId();
        this.patientId = task.getPatientId();
        this.patientName = patientName;
        this.analysisId = task.getAnalysisId();
        this.title = task.getTitle();
        this.description = task.getDescription();
        this.department = task.getDepartment();
        this.assignedTo = task.getAssignedTo();
        this.priority = task.getPriority();
        this.status = task.getStatus();
        this.dueDate = task.getDueDate();
        this.createdAt = task.getCreatedAt();
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

    public Long getAnalysisId() {
        return analysisId;
    }

    public void setAnalysisId(Long analysisId) {
        this.analysisId = analysisId;
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

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
