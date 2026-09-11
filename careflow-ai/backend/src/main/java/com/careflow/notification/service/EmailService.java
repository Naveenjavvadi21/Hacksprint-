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

    @Value("${app.notifications.forward-to:${MAIL_FORWARD_TO:${spring.mail.username:}}}")
    private String forwardToEmail;

    @Value("${app.notifications.enable-forwarding:true}")
    private boolean enableForwarding;

    /**
     * Sends an email asynchronously via SMTP or simulates sending if SMTP is not configured.
     * Records all notification attempts in the database for auditing and duplicate prevention.
     */
    @Async
    public void sendEmail(String to, String subject, String body, String notificationType, String referenceId) {
        sendEmailSync(to, subject, body, notificationType, referenceId);
    }

    /**
     * Synchronous email sending method with live forwarding capability.
     */
    public boolean sendEmailSync(String to, String subject, String body, String notificationType, String referenceId) {
        if (to == null || to.trim().isEmpty()) {
            log.warn("Cannot send email: recipient address is empty for type: {}, ref: {}", notificationType, referenceId);
            return false;
        }

        String recipient = to.trim();

        // Check if SMTP is configured and available
        if (mailSender == null || mailHost == null || mailHost.trim().isEmpty()) {
            log.info("SMTP host not configured. Simulated email notification to [{}], Subject: [{}]", recipient, subject);
            recordNotification(recipient, notificationType, referenceId, subject, body, "SENT", "Simulated delivery (SMTP host not configured)");
            return true;
        }

        try {
            String targetAddress = recipient;
            String emailBody = body;

            // Live Mail Forwarding: If recipient is internal/demo domain (@careflow.ai) or forwarding is enabled,
            // reroute delivery to the live verified email (e.g. guttulamurali941@gmail.com) so real inboxes receive it.
            if (enableForwarding && forwardToEmail != null && !forwardToEmail.trim().isEmpty()) {
                String forwardTarget = forwardToEmail.trim();
                if (recipient.toLowerCase().endsWith("@careflow.ai") || recipient.toLowerCase().endsWith("@example.com")) {
                    log.info("Live Mail Forwarding: Rerouting notification from internal address [{}] to live recipient [{}]", recipient, forwardTarget);
                    targetAddress = forwardTarget;
                    emailBody = "[Live Forwarded Notification - Originally addressed to: " + recipient + "]\n\n" + body;
                } else if (!forwardTarget.equalsIgnoreCase(recipient)) {
                    // Send a copy to the admin email so you see all live notifications
                    try {
                        SimpleMailMessage copyMsg = new SimpleMailMessage();
                        copyMsg.setFrom(fromEmail);
                        copyMsg.setTo(forwardTarget);
                        copyMsg.setSubject("[Copy] " + subject);
                        copyMsg.setText("[Live Forwarded Copy - Sent to: " + recipient + "]\n\n" + body);
                        mailSender.send(copyMsg);
                        log.info("Live Mail Forwarding: Copy dispatched to [{}]", forwardTarget);
                    } catch (Exception fwdEx) {
                        log.warn("Failed to dispatch forwarded copy: {}", fwdEx.getMessage());
                    }
                }
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(targetAddress);
            message.setSubject(subject);
            message.setText(emailBody);

            mailSender.send(message);

            log.info("Email successfully dispatched via SMTP to [{}] (orig: [{}]) for type: {}", targetAddress, recipient, notificationType);
            recordNotification(recipient, notificationType, referenceId, subject, body, "SENT", null);
            return true;
        } catch (Exception ex) {
            log.error("Failed to send email to [{}] for notification type [{}]: {}", recipient, notificationType, ex.getMessage());
            recordNotification(recipient, notificationType, referenceId, subject, body, "FAILED", ex.getMessage());
            return false;
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
