package com.careflow.repository;

import com.careflow.entity.FollowUp;
import com.careflow.entity.enums.FollowUpStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FollowUpRepository extends JpaRepository<FollowUp, Long> {
    List<FollowUp> findByPatientIdOrderByScheduledDateAsc(Long patientId);
    List<FollowUp> findByStatus(FollowUpStatus status);
    long countByStatus(FollowUpStatus status);
    long countByScheduledDate(LocalDate date);
    List<FollowUp> findByDoctor(String doctor);
    long countByScheduledDateAndDoctor(LocalDate date, String doctor);
    long countByStatusAndDoctor(FollowUpStatus status, String doctor);
    List<FollowUp> findByPatientIdIn(List<Long> patientIds);
    long countByScheduledDateAndPatientIdIn(LocalDate date, List<Long> patientIds);
    long countByStatusAndPatientIdIn(FollowUpStatus status, List<Long> patientIds);
}
