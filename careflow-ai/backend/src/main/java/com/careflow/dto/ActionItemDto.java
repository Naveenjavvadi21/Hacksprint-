package com.careflow.dto;

import com.careflow.entity.enums.Priority;

public class ActionItemDto {
    private String title;
    private String description;
    private String department;
    private String assignedTo;
    private Priority priority;
    private Integer dueInDays;

    public ActionItemDto() {
    }

    public ActionItemDto(String title, String description, String department, String assignedTo, Priority priority, Integer dueInDays) {
        this.title = title;
        this.description = description;
        this.department = department;
        this.assignedTo = assignedTo;
        this.priority = priority;
        this.dueInDays = dueInDays;
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

    public Integer getDueInDays() {
        return dueInDays;
    }

    public void setDueInDays(Integer dueInDays) {
        this.dueInDays = dueInDays;
    }
}
