package com.careflow.dto;

import com.careflow.entity.Patient;
import com.careflow.entity.enums.WorkflowStatus;

import java.time.LocalDateTime;

public class PatientDto {
    private Long id;
    private String patientCode;
    private String name;
    private Integer age;
    private String gender;
    private String phone;
    private String doctor;
    private WorkflowStatus workflowStatus;
    private LocalDateTime createdAt;

    public PatientDto() {
    }

    public PatientDto(Patient patient) {
        this.id = patient.getId();
        this.patientCode = patient.getPatientCode();
        this.name = patient.getName();
        this.age = patient.getAge();
        this.gender = patient.getGender();
        this.phone = patient.getPhone();
        this.doctor = patient.getDoctor();
        this.workflowStatus = patient.getWorkflowStatus();
        this.createdAt = patient.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPatientCode() {
        return patientCode;
    }

    public void setPatientCode(String patientCode) {
        this.patientCode = patientCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDoctor() {
        return doctor;
    }

    public void setDoctor(String doctor) {
        this.doctor = doctor;
    }

    public WorkflowStatus getWorkflowStatus() {
        return workflowStatus;
    }

    public void setWorkflowStatus(WorkflowStatus workflowStatus) {
        this.workflowStatus = workflowStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    private Long pendingTasksCount;
    private String nextFollowUp;

    public Long getPendingTasksCount() {
        return pendingTasksCount;
    }

    public void setPendingTasksCount(Long pendingTasksCount) {
        this.pendingTasksCount = pendingTasksCount;
    }

    public String getNextFollowUp() {
        return nextFollowUp;
    }

    public void setNextFollowUp(String nextFollowUp) {
        this.nextFollowUp = nextFollowUp;
    }
}
