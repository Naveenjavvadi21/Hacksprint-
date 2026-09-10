package com.careflow.service;

import com.careflow.dto.ActionItemDto;
import com.careflow.dto.TaskDto;
import com.careflow.entity.Patient;
import com.careflow.entity.Task;
import com.careflow.entity.enums.TaskStatus;
import com.careflow.repository.PatientRepository;
import com.careflow.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private com.careflow.notification.service.NotificationService notificationService;

    public List<TaskDto> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(task -> {
                    String patientName = patientRepository.findById(task.getPatientId())
                            .map(Patient::getName).orElse("Unknown Patient");
                    return new TaskDto(task, patientName);
                })
                .collect(Collectors.toList());
    }

    public TaskDto convertToDto(Task task) {
        String patientName = patientRepository.findById(task.getPatientId())
                .map(Patient::getName).orElse("Unknown Patient");
        return new TaskDto(task, patientName);
    }

    public List<TaskDto> getTasksByPatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));

        return taskRepository.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(task -> new TaskDto(task, patient.getName()))
                .collect(Collectors.toList());
    }

    public TaskDto createTask(TaskDto dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + dto.getPatientId()));

        Task task = new Task(
                dto.getPatientId(),
                dto.getAnalysisId(),
                dto.getTitle(),
                dto.getDescription(),
                dto.getDepartment(),
                dto.getAssignedTo(),
                dto.getPriority(),
                dto.getStatus() != null ? dto.getStatus() : TaskStatus.PENDING,
                dto.getDueDate() != null ? dto.getDueDate() : LocalDate.now()
        );

        Task saved = taskRepository.save(task);

        try {
            notificationService.notifyTaskAssigned(saved);
        } catch (Exception e) {
            // Task creation succeeds regardless of email failure
        }

        return new TaskDto(saved, patient.getName());
    }

    public List<TaskDto> createBatchTasksFromAI(Long patientId, Long analysisId, List<ActionItemDto> actions) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));

        // Deduplication check: if tasks with this analysisId already exist, return existing tasks
        if (analysisId != null) {
            List<Task> existing = taskRepository.findByAnalysisId(analysisId);
            if (!existing.isEmpty()) {
                return existing.stream()
                        .map(t -> new TaskDto(t, patient.getName()))
                        .collect(Collectors.toList());
            }
        }

        if (actions == null || actions.isEmpty()) {
            return Collections.emptyList();
        }

        List<TaskDto> createdList = new ArrayList<>();
        for (ActionItemDto action : actions) {
            LocalDate due = LocalDate.now().plusDays(action.getDueInDays() != null ? action.getDueInDays() : 0);
            Task task = new Task(
                    patientId,
                    analysisId,
                    action.getTitle(),
                    action.getDescription(),
                    action.getDepartment(),
                    action.getAssignedTo(),
                    action.getPriority(),
                    TaskStatus.PENDING,
                    due
            );
            Task saved = taskRepository.save(task);

            try {
                notificationService.notifyTaskAssigned(saved);
            } catch (Exception e) {
                // Ignore email failure
            }

            createdList.add(new TaskDto(saved, patient.getName()));
        }

        return createdList;
    }

    public TaskDto updateTaskStatus(Long taskId, TaskStatus status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        task.setStatus(status);
        Task updated = taskRepository.save(task);

        String patientName = patientRepository.findById(updated.getPatientId())
                .map(Patient::getName).orElse("Unknown Patient");

        return new TaskDto(updated, patientName);
    }

    public TaskDto updateTaskAssignee(Long taskId, Map<String, String> payload) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        if (payload.containsKey("assignedTo")) {
            task.setAssignedTo(payload.get("assignedTo"));
        }
        if (payload.containsKey("department")) {
            task.setDepartment(payload.get("department"));
        }

        Task updated = taskRepository.save(task);

        try {
            notificationService.notifyTaskAssigned(updated);
        } catch (Exception e) {
            // Ignore email failure
        }

        String patientName = patientRepository.findById(updated.getPatientId())
                .map(Patient::getName).orElse("Unknown Patient");

        return new TaskDto(updated, patientName);
    }
}
