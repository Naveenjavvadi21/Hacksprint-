package com.careflow.notification.service;

import com.careflow.notification.entity.NotificationLog;
import com.careflow.notification.repository.NotificationLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${app.notifications.sender-email:${spring.mail.username:noreply@careflow.ai}}")
    private String fromEmail;

    /**
     * Sends an email via SMTP or simulates sending if SMTP is not configured.
     * Records all notification attempts in the database for auditing and duplicate prevention.
     */
    @Async
    public void sendEmail(String to, String subject, String body, String notificationType, String referenceId) {
        if (to == null || to.trim().isEmpty()) {
            log.warn("Cannot send email: recipient address is empty for type: {}, ref: {}", notificationType, referenceId);
            return;
        }

        String recipient = to.trim();

        // Check if SMTP is configured and available
        if (mailSender == null || mailHost == null || mailHost.trim().isEmpty()) {
            log.info("SMTP host not configured. Simulated email notification to [{}], Subject: [{}]", recipient, subject);
            recordNotification(recipient, notificationType, referenceId, subject, body, "SENT", "Simulated delivery (SMTP host not configured)");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(recipient);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

            log.info("Email successfully dispatched via SMTP to [{}] for notification type: {}", recipient, notificationType);
            recordNotification(recipient, notificationType, referenceId, subject, body, "SENT", null);
        } catch (Exception ex) {
            log.error("Failed to send email to [{}] for notification type [{}]: {}", recipient, notificationType, ex.getMessage());
            recordNotification(recipient, notificationType, referenceId, subject, body, "FAILED", ex.getMessage());
        }
    }

    private void recordNotification(String recipient, String notificationType, String referenceId, String subject, String body, String status, String error) {
        try {
            NotificationLog logEntry = new NotificationLog(
                    recipient,
                    notificationType,
                    referenceId != null ? referenceId : "none",
                    subject,
                    body,
                    status,
                    error
            );
            notificationLogRepository.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to persist notification log: {}", e.getMessage());
        }
    }
}
