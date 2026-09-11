package com.careflow.notification.controller;

import com.careflow.notification.entity.NotificationLog;
import com.careflow.notification.repository.NotificationLogRepository;
import com.careflow.scheduler.FollowUpReminderScheduler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private FollowUpReminderScheduler followUpReminderScheduler;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Autowired
    private com.careflow.notification.service.EmailService emailService;

    @PostMapping("/test-email")
    public ResponseEntity<Map<String, Object>> sendTestEmail(@RequestBody(required = false) Map<String, String> body) {
        String to = (body != null && body.containsKey("to")) ? body.get("to") : "guttulamurali941@gmail.com";
        String subject = (body != null && body.containsKey("subject")) ? body.get("subject") : "SMTP Test - Healthcare Portal";
        String content = (body != null && body.containsKey("body")) ? body.get("body") : "SMTP email configuration is working successfully.";

        boolean success = emailService.sendEmailSync(to, subject, content, "SMTP_TEST", "test:" + System.currentTimeMillis());

        Map<String, Object> response = new HashMap<>();
        response.put("status", success ? "SUCCESS" : "FAILED");
        response.put("recipient", to);
        response.put("subject", subject);
        response.put("message", success ? "Email sent successfully via Gmail SMTP!" : "Failed to send email. Check logs for details.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/followups/trigger")
    public ResponseEntity<Map<String, Object>> triggerFollowUpCheck() {
        int dispatched = followUpReminderScheduler.runFollowUpReminderCheck();
        Map<String, Object> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("notificationsDispatched", dispatched);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/logs")
    public ResponseEntity<List<NotificationLog>> getNotificationLogs() {
        return ResponseEntity.ok(notificationLogRepository.findAll());
    }
}
