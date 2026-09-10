package com.careflow.notification.service;

import com.careflow.entity.FollowUp;
import com.careflow.entity.Patient;
import com.careflow.entity.Task;
import com.careflow.entity.User;
import com.careflow.entity.enums.Role;
import com.careflow.notification.repository.NotificationLogRepository;
import com.careflow.repository.PatientRepository;
import com.careflow.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    public static final String TYPE_REGISTRATION = "USER_REGISTRATION";
    public static final String TYPE_TASK_ASSIGNMENT = "TASK_ASSIGNMENT";
    public static final String TYPE_FOLLOW_UP_REMINDER = "FOLLOW_UP_REMINDER";

    @Autowired
    private EmailService emailService;

    @Autowired
    private EmailTemplateService emailTemplateService;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    /**
     * 1. Send confirmation/welcome email upon successful user registration.
     */
    public void notifyUserRegistered(User user) {
        if (user == null || user.getEmail() == null) {
            return;
        }

        String refId = "user:" + user.getId();
        if (notificationLogRepository.existsByNotificationTypeAndReferenceIdAndRecipientAndStatus(TYPE_REGISTRATION, refId, user.getEmail(), "SENT")) {
            log.info("Registration email already sent for user: {}", user.getEmail());
            return;
        }

        String subject = emailTemplateService.buildWelcomeSubject();
        String body = emailTemplateService.buildWelcomeBody(user);

        emailService.sendEmail(user.getEmail(), subject, body, TYPE_REGISTRATION, refId);
        log.info("Triggered registration notification email for [{}]", user.getEmail());
    }

    /**
     * 2. Send task assignment notification when a task is assigned to a doctor.
     */
    public void notifyTaskAssigned(Task task) {
        if (task == null) {
            return;
        }

        Patient patient = task.getPatientId() != null ? patientRepository.findById(task.getPatientId()).orElse(null) : null;

        // Identify assigned doctor
        User doctorUser = findAssignedDoctor(task.getAssignedTo(), patient);
        if (doctorUser == null || doctorUser.getEmail() == null) {
            log.info("Task id [{}] assigned to [{}] - no matching doctor email found to notify.", task.getId(), task.getAssignedTo());
            return;
        }

        String refId = "task:" + task.getId() + ":doctor:" + doctorUser.getId();
        String subject = emailTemplateService.buildTaskAssignmentSubject(task);
        String body = emailTemplateService.buildTaskAssignmentBody(doctorUser.getName(), task, patient);

        emailService.sendEmail(doctorUser.getEmail(), subject, body, TYPE_TASK_ASSIGNMENT, refId);
        log.info("Triggered task assignment notification email to doctor [{}] ({}) for task [{}]", doctorUser.getName(), doctorUser.getEmail(), task.getTitle());
    }

    /**
     * 3. Send patient follow-up reminder email to responsible staff members.
     * Prevents duplicate emails for the same follow-up and scheduled date.
     */
    public int notifyFollowUpReminder(FollowUp followUp) {
        if (followUp == null || followUp.getId() == null) {
            return 0;
        }

        Patient patient = followUp.getPatientId() != null ? patientRepository.findById(followUp.getPatientId()).orElse(null) : null;
        String refId = "followup:" + followUp.getId() + ":" + followUp.getScheduledDate();

        // Identify responsible recipients (assigned doctor, patient doctor, or nurse/coordinator team)
        List<User> recipients = resolveFollowUpRecipients(followUp, patient);
        if (recipients.isEmpty()) {
            log.warn("No recipients found for follow-up reminder id [{}]", followUp.getId());
            return 0;
        }

        int sentCount = 0;
        for (User recipient : recipients) {
            if (recipient.getEmail() == null || recipient.getEmail().trim().isEmpty()) {
                continue;
            }

            // Check duplicate prevention
            if (notificationLogRepository.existsByNotificationTypeAndReferenceIdAndRecipientAndStatus(TYPE_FOLLOW_UP_REMINDER, refId, recipient.getEmail(), "SENT")) {
                log.info("Follow-up reminder already sent to [{}] for ref [{}] - skipping duplicate.", recipient.getEmail(), refId);
                continue;
            }

            String subject = emailTemplateService.buildFollowUpReminderSubject(patient, followUp);
            String body = emailTemplateService.buildFollowUpReminderBody(recipient.getName(), followUp, patient);

            emailService.sendEmail(recipient.getEmail(), subject, body, TYPE_FOLLOW_UP_REMINDER, refId);
            sentCount++;
        }

        return sentCount;
    }

    private User findAssignedDoctor(String assignedTo, Patient patient) {
        if (assignedTo != null && !assignedTo.trim().isEmpty()) {
            String clean = assignedTo.trim();
            // Try by email
            Optional<User> byEmail = userRepository.findByEmailIgnoreCase(clean);
            if (byEmail.isPresent()) return byEmail.get();

            // Try by name
            Optional<User> byName = userRepository.findByNameIgnoreCase(clean);
            if (byName.isPresent()) return byName.get();

            // Check if contains "Dr." or "Doctor"
            for (User u : userRepository.findByRole(Role.DOCTOR)) {
                if (u.getName().equalsIgnoreCase(clean) || clean.contains(u.getName()) || u.getName().contains(clean)) {
                    return u;
                }
            }
        }

        // Fallback to patient's assigned doctor
        if (patient != null && patient.getDoctor() != null && !patient.getDoctor().trim().isEmpty()) {
            String docName = patient.getDoctor().trim();
            Optional<User> byDocName = userRepository.findByNameIgnoreCase(docName);
            if (byDocName.isPresent()) return byDocName.get();

            for (User u : userRepository.findByRole(Role.DOCTOR)) {
                if (u.getName().equalsIgnoreCase(docName) || docName.contains(u.getName()) || u.getName().contains(docName)) {
                    return u;
                }
            }
        }

        return null;
    }

    private List<User> resolveFollowUpRecipients(FollowUp followUp, Patient patient) {
        Set<User> recipients = new LinkedHashSet<>();

        // 1. Doctor directly assigned to the follow-up
        if (followUp.getDoctor() != null && !followUp.getDoctor().trim().isEmpty()) {
            userRepository.findByNameIgnoreCase(followUp.getDoctor().trim()).ifPresent(recipients::add);
        }

        // 2. Doctor assigned to the patient
        if (patient != null && patient.getDoctor() != null && !patient.getDoctor().trim().isEmpty()) {
            userRepository.findByNameIgnoreCase(patient.getDoctor().trim()).ifPresent(recipients::add);
        }

        // 3. If still empty, notify all DOCTOR users
        if (recipients.isEmpty()) {
            recipients.addAll(userRepository.findByRole(Role.DOCTOR));
        }

        return new ArrayList<>(recipients);
    }
}
