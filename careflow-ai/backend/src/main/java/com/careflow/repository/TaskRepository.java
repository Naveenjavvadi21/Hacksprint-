package com.careflow.repository;

import com.careflow.entity.Task;
import com.careflow.entity.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<Task> findByStatus(TaskStatus status);
    List<Task> findByAnalysisId(Long analysisId);
    long countByStatus(TaskStatus status);
    List<Task> findByAssignedTo(String assignedTo);
    long countByStatusAndAssignedTo(TaskStatus status, String assignedTo);
    List<Task> findByPatientIdIn(List<Long> patientIds);
    long countByStatusAndPatientIdIn(TaskStatus status, List<Long> patientIds);
}
