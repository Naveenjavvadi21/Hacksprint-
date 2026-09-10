package com.careflow.config;

import com.careflow.entity.*;
import com.careflow.entity.enums.*;
import com.careflow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private FollowUpRepository followUpRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedPatientsAndRelatedData();
        ensureNurseTasks();
    }

    private void ensureNurseTasks() {
        taskRepository.findById(1L).ifPresent(t -> {
            if ("Lab Team".equals(t.getAssignedTo()) || "Laboratory".equals(t.getDepartment())) {
                t.setAssignedTo("Nurse Sarah");
                t.setDepartment("Nursing");
                t.setDescription("Collect blood sample and coordinate Complete Blood Count (CBC) test.");
                taskRepository.save(t);
            }
        });
    }

    private void seedUsers() {
        String initialPassword = System.getenv("CAREFLOW_INITIAL_PASSWORD");
        if (initialPassword == null || initialPassword.isBlank()) {
            throw new IllegalStateException("CAREFLOW_INITIAL_PASSWORD must be configured");
        }
        String defaultPassword = passwordEncoder.encode(initialPassword);

        upsertUser("Doctor", "doctor@careflow.ai", defaultPassword, Role.DOCTOR);
        upsertUser("Nurse", "nurse@careflow.ai", defaultPassword, Role.NURSE);
        upsertUser("Admin", "admin@careflow.ai", defaultPassword, Role.ADMIN);

        userRepository.findByEmailIgnoreCase("coordinator@careflow.ai").ifPresent(userRepository::delete);
        userRepository.findByEmailIgnoreCase("staff@careflow.ai").ifPresent(userRepository::delete);
    }

    private void upsertUser(String name, String email, String encodedPassword, Role role) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> new User(name, email, encodedPassword, role));
        user.setName(name);
        user.setPassword(encodedPassword);
        user.setRole(role);
        userRepository.save(user);
    }

    private void seedPatientsAndRelatedData() {
        if (patientRepository.count() == 0) {
            // Patient 1: Ravi Kumar (Primary Hero Demo Patient)
            Patient ravi = patientRepository.save(new Patient(
                    "P-1001", "Ravi Kumar", 35, "Male", "+91 98765 43210", "Dr. Rao", WorkflowStatus.ACTIVE
            ));

            // Patient 2: Sarah Williams
            Patient sarah = patientRepository.save(new Patient(
                    "P-1002", "Sarah Williams", 42, "Female", "+1 555 0192", "Dr. Rao", WorkflowStatus.ACTIVE
            ));

            // Patient 3: Robert Brown
            Patient robert = patientRepository.save(new Patient(
                    "P-1003", "Robert Brown", 58, "Male", "+1 555 0148", "Dr. Patel", WorkflowStatus.ACTIVE
            ));

            // Patient 4: Anita Sharma
            Patient anita = patientRepository.save(new Patient(
                    "P-1004", "Anita Sharma", 29, "Female", "+91 98123 45678", "Dr. Rao", WorkflowStatus.ACTIVE
            ));

            // Patient 5: David Johnson
            Patient david = patientRepository.save(new Patient(
                    "P-1005", "David Johnson", 64, "Male", "+1 555 0177", "Dr. Patel", WorkflowStatus.DISCHARGED
            ));

            // Seed Documents
            Document docRavi = documentRepository.save(new Document(
                    ravi.getId(),
                    "doctor_note_ravi.txt",
                    DocumentType.DOCTOR_NOTE,
                    "Patient Ravi requires CBC testing. Lab report should be reviewed after 2 days. Schedule follow-up consultation after 7 days.",
                    "Dr. Rao"
            ));

            Document docSarah = documentRepository.save(new Document(
                    sarah.getId(),
                    "lab_report_sarah.pdf",
                    DocumentType.LAB_REPORT,
                    "Routine Lipid Panel & HbA1c normal. Recommend dietary follow-up in 30 days.",
                    "Lab Team"
            ));

            Document docRobert = documentRepository.save(new Document(
                    robert.getId(),
                    "discharge_summary_robert.txt",
                    DocumentType.DISCHARGE_SUMMARY,
                    "Post-cardiac catheterization. BP monitoring required twice daily. Follow-up ECG scheduled in 10 days.",
                    "Dr. Patel"
            ));

            // Seed Tasks
            taskRepository.save(new Task(
                    ravi.getId(), null, "CBC Test",
                    "Collect blood sample and coordinate Complete Blood Count (CBC) test.",
                    "Nursing", "Nurse Sarah", Priority.HIGH, TaskStatus.PENDING, LocalDate.now()
            ));

            taskRepository.save(new Task(
                    ravi.getId(), null, "Review CBC Report",
                    "Evaluate CBC lab results and update clinical notes.",
                    "Doctor", "Dr. Rao", Priority.HIGH, TaskStatus.PENDING, LocalDate.now().plusDays(2)
            ));

            taskRepository.save(new Task(
                    ravi.getId(), null, "Schedule Follow-up Consultation",
                    "Book 15-minute consultation appointment in 7 days.",
                    "Scheduling", "Reception Team", Priority.NORMAL, TaskStatus.PENDING, LocalDate.now().plusDays(7)
            ));

            taskRepository.save(new Task(
                    sarah.getId(), null, "Dietary Consultation Follow-up",
                    "Discuss HbA1c & lipid results dietary modifications.",
                    "Nutrition", "Dietitian Staff", Priority.LOW, TaskStatus.IN_PROGRESS, LocalDate.now().plusDays(5)
            ));

            taskRepository.save(new Task(
                    robert.getId(), null, "Post-op Cardiac Vitals Check",
                    "Daily blood pressure and telemetry monitoring post-discharge.",
                    "Nursing", "Nurse Sarah", Priority.URGENT, TaskStatus.COMPLETED, LocalDate.now()
            ));

            // Seed Follow-ups
            followUpRepository.save(new FollowUp(
                    ravi.getId(), "Dr. Rao", "Follow-up Consultation",
                    LocalDate.now().plusDays(7), FollowUpStatus.UPCOMING, "Review CBC results and clinical progress."
            ));

            followUpRepository.save(new FollowUp(
                    sarah.getId(), "Dr. Rao", "Routine Check-up",
                    LocalDate.now(), FollowUpStatus.DUE_TODAY, "Review lipid panel and nutrition plan."
            ));

            followUpRepository.save(new FollowUp(
                    robert.getId(), "Dr. Patel", "Post-Op ECG Scan",
                    LocalDate.now().plusDays(10), FollowUpStatus.UPCOMING, "Outpatient electrocardiogram scan."
            ));
        }
    }
}
