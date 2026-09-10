package com.careflow.scheduler;

import com.careflow.entity.FollowUp;
import com.careflow.entity.enums.FollowUpStatus;
import com.careflow.notification.service.NotificationService;
import com.careflow.repository.FollowUpRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class FollowUpReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(FollowUpReminderScheduler.class);

    @Autowired
    private FollowUpRepository followUpRepository;

    @Autowired
    private NotificationService notificationService;

    @Value("${app.notifications.follow-up-reminder-days:1}")
    private int reminderDays;

    /**
     * Periodically check for upcoming follow-ups that fall within the configured reminder window.
     * Default runs periodically with an initial delay after startup.
     */
    @Scheduled(
            fixedDelayString = "${app.notifications.follow-up-check-interval-ms:3600000}",
            initialDelayString = "${app.notifications.follow-up-initial-delay-ms:20000}"
    )
    public void scheduledFollowUpCheck() {
        log.info("Running scheduled follow-up reminder check (reminder window: {} day(s))...", reminderDays);
        runFollowUpReminderCheck();
    }

    /**
     * Public method to run check on demand for testing or API trigger.
     */
    public int runFollowUpReminderCheck() {
        LocalDate today = LocalDate.now();
        LocalDate windowEnd = today.plusDays(reminderDays);

        // Fetch follow-ups that are not completed and scheduled within the window
        List<FollowUp> upcoming = followUpRepository.findAll().stream()
                .filter(f -> f.getStatus() != FollowUpStatus.COMPLETED)
                .filter(f -> f.getScheduledDate() != null)
                .filter(f -> !f.getScheduledDate().isBefore(today) && !f.getScheduledDate().isAfter(windowEnd))
                .toList();

        int sentTotal = 0;
        for (FollowUp followUp : upcoming) {
            sentTotal += notificationService.notifyFollowUpReminder(followUp);
        }

        log.info("Follow-up reminder check completed. Examined {} upcoming follow-ups, dispatched {} notifications.",
                upcoming.size(), sentTotal);
        return sentTotal;
    }
}
