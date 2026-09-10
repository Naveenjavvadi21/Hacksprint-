package com.careflow.repository;

import com.careflow.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByPatientCode(String patientCode);
    List<Patient> findByDoctor(String doctor);
    long countByDoctor(String doctor);
}
