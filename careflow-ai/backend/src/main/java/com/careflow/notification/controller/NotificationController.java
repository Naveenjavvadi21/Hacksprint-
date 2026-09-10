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
