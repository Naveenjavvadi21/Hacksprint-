package com.careflow.controller;

import com.careflow.dto.ActionItemDto;
import com.careflow.dto.TaskDto;
import com.careflow.entity.enums.TaskStatus;
import com.careflow.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskDto>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<TaskDto>> getTasksByPatient(@PathVariable("patientId") Long patientId) {
        return ResponseEntity.ok(taskService.getTasksByPatient(patientId));
    }

    @PostMapping
    public ResponseEntity<TaskDto> createTask(@RequestBody TaskDto taskDto) {
        return ResponseEntity.ok(taskService.createTask(taskDto));
    }

    public static class BatchTaskRequest {
        private Long patientId;
        private Long analysisId;
        private List<ActionItemDto> actions;

        public Long getPatientId() { return patientId; }
        public void setPatientId(Long patientId) { this.patientId = patientId; }
        public Long getAnalysisId() { return analysisId; }
        public void setAnalysisId(Long analysisId) { this.analysisId = analysisId; }
        public List<ActionItemDto> getActions() { return actions; }
        public void setActions(List<ActionItemDto> actions) { this.actions = actions; }
    }

    @PostMapping("/batch-create")
    public ResponseEntity<List<TaskDto>> createBatchTasks(@RequestBody BatchTaskRequest request) {
        List<TaskDto> created = taskService.createBatchTasksFromAI(
                request.getPatientId(),
                request.getAnalysisId(),
                request.getActions()
        );
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TaskDto> updateTaskStatus(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> payload) {
        String statusStr = payload.get("status");
        if (statusStr == null || statusStr.trim().isEmpty()) {
            throw new IllegalArgumentException("Task status cannot be empty.");
        }
        TaskStatus status;
        try {
            status = TaskStatus.valueOf(statusStr.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid task status: " + statusStr + ". Must be PENDING, IN_PROGRESS, or COMPLETED.");
        }
        TaskDto updated = taskService.updateTaskStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<TaskDto> updateTaskAssignee(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> payload) {
        TaskDto updated = taskService.updateTaskAssignee(id, payload);
        return ResponseEntity.ok(updated);
    }
}
