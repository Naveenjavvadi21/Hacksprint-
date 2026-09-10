package com.careflow.notification.repository;

import com.careflow.notification.entity.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    boolean existsByNotificationTypeAndReferenceIdAndRecipientAndStatus(String notificationType, String referenceId, String recipient, String status);
    boolean existsByNotificationTypeAndReferenceIdAndStatus(String notificationType, String referenceId, String status);
    List<NotificationLog> findByRecipientOrderBySentAtDesc(String recipient);
    List<NotificationLog> findByNotificationTypeOrderBySentAtDesc(String notificationType);
}
