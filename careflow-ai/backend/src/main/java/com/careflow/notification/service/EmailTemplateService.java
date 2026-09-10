package com.careflow.notification.service;

import com.careflow.entity.Patient;
import com.careflow.entity.Task;
import com.careflow.entity.User;
import com.careflow.entity.FollowUp;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailTemplateService {

    @Value("${app.notifications.portal-url:http://localhost:5173}")
    private String portalUrl;

    public String buildWelcomeSubject() {
        return "Welcome to CareFlow AI Healthcare Portal";
    }

    public String buildWelcomeBody(User user) {
        return String.format(
                "Dear %s,\n\n" +
                "Welcome to CareFlow AI – AI-Powered Healthcare Workflow & Care Coordination Platform.\n\n" +
                "Your account has been successfully registered with the following details:\n" +
                " - Registered Email: %s\n" +
                " - Designated Role: %s\n\n" +
                "You can now log in securely to access your dashboard:\n" +
                "%s/login\n\n" +
                "If you need any assistance, please contact the hospital system administrator or support team at support@careflow.ai.\n\n" +
                "Best regards,\n" +
                "CareFlow AI Care Coordination Team",
                user.getName(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().name() : "STAFF",
                portalUrl
        );
    }

    public String buildTaskAssignmentSubject(Task task) {
        return "New Patient Task Assigned: " + (task.getTitle() != null ? task.getTitle() : "Clinical Task");
    }

    public String buildTaskAssignmentBody(String doctorName, Task task, Patient patient) {
        String patientName = patient != null ? patient.getName() : "Assigned Patient";
        String patientCode = patient != null ? patient.getPatientCode() : "N/A";
        String dueDate = task.getDueDate() != null ? task.getDueDate().toString() : "No due date specified";
        String priority = task.getPriority() != null ? task.getPriority().name() : "NORMAL";
        String description = task.getDescription() != null ? task.getDescription() : "No description provided.";

        return String.format(
                "New Patient Task Assigned\n\n" +
                "Doctor: %s\n" +
                "Patient: %s (Patient ID: %s)\n" +
                "Task: %s\n" +
                "Priority: %s\n" +
                "Due Date: %s\n\n" +
                "Description:\n%s\n\n" +
                "Please log in to the healthcare portal to view the complete task details and coordinate care:\n" +
                "%s\n\n" +
                "Best regards,\n" +
                "CareFlow AI Clinical Coordination System",
                doctorName,
                patientName,
                patientCode,
                task.getTitle(),
                priority,
                dueDate,
                description,
                portalUrl
        );
    }

    public String buildFollowUpReminderSubject(Patient patient, FollowUp followUp) {
        String patientName = patient != null ? patient.getName() : "Patient";
        String dateStr = followUp.getScheduledDate() != null ? followUp.getScheduledDate().toString() : "Upcoming";
        return String.format("Patient Follow-Up Reminder: %s (%s)", patientName, dateStr);
    }

    public String buildFollowUpReminderBody(String staffName, FollowUp followUp, Patient patient) {
        String patientName = patient != null ? patient.getName() : "Assigned Patient";
        String patientCode = patient != null ? patient.getPatientCode() : "N/A";
        String scheduledDate = followUp.getScheduledDate() != null ? followUp.getScheduledDate().toString() : "Scheduled";
        String followUpType = followUp.getType() != null ? followUp.getType() : "Consultation";
        String notes = followUp.getNotes() != null ? followUp.getNotes() : "Standard follow-up consultation.";

        return String.format(
                "Patient Follow-Up Reminder\n\n" +
                "Staff Member: %s\n" +
                "Patient: %s (Patient ID: %s)\n" +
                "Follow-Up Date: %s\n" +
                "Type: %s\n\n" +
                "Notes / Instructions:\n%s\n\n" +
                "Please log in to the healthcare portal to review schedule details and prepare necessary clinical workflows:\n" +
                "%s\n\n" +
                "Best regards,\n" +
                "CareFlow AI Care Coordination Team",
                staffName,
                patientName,
                patientCode,
                scheduledDate,
                followUpType,
                notes,
                portalUrl
        );
    }
}
