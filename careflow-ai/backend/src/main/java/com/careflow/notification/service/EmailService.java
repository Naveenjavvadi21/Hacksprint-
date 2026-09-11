package com.careflow.notification.service;

import com.careflow.notification.entity.NotificationLog;
import com.careflow.notification.repository.NotificationLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.notifications.sender-email:${spring.mail.username:noreply@careflow.ai}}")
    private String fromEmail;

    @Value("${app.notifications.forward-to:${MAIL_FORWARD_TO:${spring.mail.username:}}}")
    private String forwardToEmail;

    @Value("${app.notifications.enable-forwarding:true}")
    private boolean enableForwarding;

    @Value("${app.notifications.resend-api-key:${RESEND_API_KEY:}}")
    private String resendApiKey;

    @Value("${app.notifications.brevo-api-key:${BREVO_API_KEY:}}")
    private String brevoApiKey;

    @Value("${app.notifications.http-relay-url:${MAIL_HTTP_RELAY_URL:}}")
    private String httpRelayUrl;

    /**
     * Sends an email asynchronously via SMTP or HTTPS Email API.
     * Records all notification attempts in the database for auditing and duplicate prevention.
     */
    @Async
    public void sendEmail(String to, String subject, String body, String notificationType, String referenceId) {
        sendEmailSync(to, subject, body, notificationType, referenceId);
    }

    /**
     * Synchronous email sending method with live forwarding and multi-provider delivery.
     */
    public boolean sendEmailSync(String to, String subject, String body, String notificationType, String referenceId) {
        if (to == null || to.trim().isEmpty()) {
            log.warn("Cannot send email: recipient address is empty for type: {}, ref: {}", notificationType, referenceId);
            return false;
        }

        String recipient = to.trim();

        // Check if any delivery channel is configured
        boolean hasHttpApi = (brevoApiKey != null && !brevoApiKey.isBlank())
                || (resendApiKey != null && !resendApiKey.isBlank())
                || (httpRelayUrl != null && !httpRelayUrl.isBlank());
        boolean hasSmtp = (mailSender != null && mailHost != null && !mailHost.isBlank() && mailUsername != null && !mailUsername.isBlank());

        if (!hasHttpApi && !hasSmtp) {
            log.info("No active email provider configured (SMTP/Brevo/Resend). Simulated delivery to [{}], Subject: [{}]", recipient, subject);
            recordNotification(recipient, notificationType, referenceId, subject, body, "SENT", "Simulated delivery (No live provider configured)");
            return true;
        }

        try {
            String targetAddress = recipient;
            String emailBody = body;

            // Live Mail Forwarding: If recipient is internal/demo domain (@careflow.ai or @example.com),
            // reroute delivery to the live verified email (e.g. guttulamurali941@gmail.com)
            if (enableForwarding && forwardToEmail != null && !forwardToEmail.isBlank()) {
                String forwardTarget = forwardToEmail.trim();
                if (recipient.toLowerCase().endsWith("@careflow.ai") || recipient.toLowerCase().endsWith("@example.com")) {
                    log.info("Live Mail Forwarding: Rerouting notification from internal address [{}] to live recipient [{}]", recipient, forwardTarget);
                    targetAddress = forwardTarget;
                    emailBody = "[Live Forwarded Notification - Originally addressed to: " + recipient + "]\n\n" + body;
                } else if (!forwardTarget.equalsIgnoreCase(recipient)) {
                    // Send a copy to the admin email so you see all live notifications
                    try {
                        dispatchEmail(forwardTarget, "[Copy] " + subject, "[Live Forwarded Copy - Sent to: " + recipient + "]\n\n" + body);
                        log.info("Live Mail Forwarding: Copy dispatched to [{}]", forwardTarget);
                    } catch (Exception fwdEx) {
                        log.warn("Failed to dispatch forwarded copy to [{}]: {}", forwardTarget, fwdEx.getMessage());
                    }
                }
            }

            // Dispatch main email to target address
            dispatchEmail(targetAddress, subject, emailBody);

            log.info("Email successfully dispatched to [{}] (orig: [{}]) for type: {}", targetAddress, recipient, notificationType);
            recordNotification(recipient, notificationType, referenceId, subject, body, "SENT", null);
            return true;
        } catch (Exception ex) {
            String errorMsg = ex.getMessage();
            if (errorMsg != null && (errorMsg.contains("timed out") || errorMsg.contains("ConnectException") || errorMsg.contains("Operation timed out"))) {
                errorMsg = "SMTP connection timed out. Note: Render Free Tier blocks outbound SMTP ports (25, 465, 587). To send emails from Render Free Tier, please set BREVO_API_KEY or RESEND_API_KEY in Render Environment Variables, or upgrade your Render plan.";
            }
            log.error("Failed to send email to [{}] for notification type [{}]: {}", recipient, notificationType, errorMsg);
            recordNotification(recipient, notificationType, referenceId, subject, body, "FAILED", errorMsg);
            return false;
        }
    }

    /**
     * Dispatches email using the available provider:
     * 1. Brevo HTTP REST API (HTTPS port 443 - works on Render Free Tier)
     * 2. Resend HTTP REST API (HTTPS port 443 - works on Render Free Tier)
     * 3. Custom HTTP Relay Webhook (HTTPS port 443 - works on Render Free Tier)
     * 4. Standard SMTP (Port 587 / 465 - for local development & paid Render plans)
     */
    private boolean dispatchEmail(String to, String subject, String body) throws Exception {
        // Priority 1: Brevo HTTP REST API (port 443 HTTPS)
        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            return sendViaBrevo(to, subject, body);
        }

        // Priority 2: Resend HTTP REST API (port 443 HTTPS)
        if (resendApiKey != null && !resendApiKey.isBlank()) {
            return sendViaResend(to, subject, body);
        }

        // Priority 3: HTTP Relay Webhook (port 443 HTTPS)
        if (httpRelayUrl != null && !httpRelayUrl.isBlank()) {
            return sendViaHttpRelay(to, subject, body);
        }

        // Priority 4: JavaMailSender SMTP (port 587 / 465)
        if (mailSender != null && mailUsername != null && !mailUsername.isBlank()) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            return true;
        }

        log.info("Simulated delivery to [{}] (no active email transport configured)", to);
        return true;
    }

    private boolean sendViaBrevo(String to, String subject, String body) {
        try {
            Map<String, Object> sender = new HashMap<>();
            sender.put("name", "CareFlow AI");
            String senderEmail = (fromEmail != null && fromEmail.contains("@") && !fromEmail.endsWith("careflow.ai"))
                    ? fromEmail : (mailUsername != null && mailUsername.contains("@") ? mailUsername : "careflow.ai.notifications@gmail.com");
            sender.put("email", senderEmail);

            Map<String, Object> recipient = new HashMap<>();
            recipient.put("email", to);

            Map<String, Object> payload = new HashMap<>();
            payload.put("sender", sender);
            payload.put("to", Collections.singletonList(recipient));
            payload.put("subject", subject);
            payload.put("textContent", body);

            String jsonPayload = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", brevoApiKey.trim())
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .timeout(Duration.ofSeconds(12))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Email dispatched successfully via Brevo HTTPS API to [{}]", to);
                return true;
            } else {
                log.error("Brevo API returned error status {}: {}", response.statusCode(), response.body());
                throw new RuntimeException("Brevo HTTP error: " + response.statusCode() + " - " + response.body());
            }
        } catch (Exception e) {
            log.error("Failed to send email via Brevo to [{}]: {}", to, e.getMessage());
            throw new RuntimeException("Brevo dispatch failed: " + e.getMessage(), e);
        }
    }

    private boolean sendViaResend(String to, String subject, String body) {
        try {
            Map<String, Object> payload = new HashMap<>();
            String sender = (fromEmail != null && fromEmail.contains("@") && !fromEmail.endsWith("@gmail.com") && !fromEmail.endsWith("careflow.ai"))
                    ? fromEmail : "CareFlow AI <onboarding@resend.dev>";
            payload.put("from", sender);
            payload.put("to", Collections.singletonList(to));
            payload.put("subject", subject);
            payload.put("text", body);

            String jsonPayload = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey.trim())
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .timeout(Duration.ofSeconds(12))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Email dispatched successfully via Resend HTTPS API to [{}]", to);
                return true;
            } else {
                log.error("Resend API returned error status {}: {}", response.statusCode(), response.body());
                throw new RuntimeException("Resend HTTP error: " + response.statusCode() + " - " + response.body());
            }
        } catch (Exception e) {
            log.error("Failed to send email via Resend to [{}]: {}", to, e.getMessage());
            throw new RuntimeException("Resend dispatch failed: " + e.getMessage(), e);
        }
    }

    private boolean sendViaHttpRelay(String to, String subject, String body) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("to", to);
            payload.put("subject", subject);
            payload.put("body", body);
            payload.put("from", fromEmail);

            String jsonPayload = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(httpRelayUrl.trim()))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .timeout(Duration.ofSeconds(12))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Email dispatched successfully via HTTP Relay to [{}]", to);
                return true;
            } else {
                log.error("HTTP Relay returned error status {}: {}", response.statusCode(), response.body());
                throw new RuntimeException("HTTP Relay error: " + response.statusCode() + " - " + response.body());
            }
        } catch (Exception e) {
            log.error("Failed to send email via HTTP Relay to [{}]: {}", to, e.getMessage());
            throw new RuntimeException("HTTP Relay dispatch failed: " + e.getMessage(), e);
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
