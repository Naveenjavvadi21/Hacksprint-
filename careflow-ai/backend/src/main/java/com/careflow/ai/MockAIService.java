package com.careflow.ai;

import com.careflow.dto.AIAnalysisDto;
import com.careflow.dto.ActionItemDto;
import com.careflow.entity.enums.Priority;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service("mockAIService")
public class MockAIService implements AIService {

    @Override
    public AIAnalysisDto analyzeDocument(Long documentId, String documentText) {
        String text = documentText != null ? documentText.trim() : "";

        String summary;
        List<String> keyInformation;
        List<ActionItemDto> actions = new ArrayList<>();

        if (text.toLowerCase().contains("cbc") || text.toLowerCase().contains("ravi")) {
            summary = "Patient requires CBC testing, doctor review of the laboratory report, and a follow-up consultation scheduled within 7 days.";
            keyInformation = Arrays.asList(
                    "CBC testing required immediately",
                    "Lab report should be reviewed by attending physician after 2 days",
                    "Follow-up consultation required after 7 days"
            );

            actions.add(new ActionItemDto(
                    "CBC Test",
                    "Perform Complete Blood Count (CBC) laboratory test.",
                    "Laboratory",
                    "Lab Team",
                    Priority.NORMAL,
                    0
            ));

            actions.add(new ActionItemDto(
                    "Review CBC Report",
                    "Evaluate CBC lab results and update treatment plan accordingly.",
                    "Doctor",
                    "Dr. Rao",
                    Priority.HIGH,
                    2
            ));

            actions.add(new ActionItemDto(
                    "Schedule Follow-up Consultation",
                    "Book 15-minute follow-up consultation with Dr. Rao in 7 days.",
                    "Scheduling",
                    "Reception Team",
                    Priority.NORMAL,
                    7
            ));
        } else if (text.toLowerCase().contains("discharge") || text.toLowerCase().contains("heart")) {
            summary = "Patient post-discharge evaluation. Cardiac vitals stable, prescription medication updated, and physical therapy scheduled.";
            keyInformation = Arrays.asList(
                    "Cardiac post-op recovery progressing well",
                    "Blood pressure monitoring required twice daily",
                    "Follow-up ECG scheduled in 10 days"
            );

            actions.add(new ActionItemDto(
                    "Daily BP & Vitals Log",
                    "Log blood pressure and pulse twice daily.",
                    "Nursing",
                    "Nurse Staff",
                    Priority.NORMAL,
                    1
            ));

            actions.add(new ActionItemDto(
                    "Schedule Follow-up ECG",
                    "Book outpatient electrocardiogram test.",
                    "Cardiology",
                    "Dr. Patel",
                    Priority.HIGH,
                    10
            ));
        } else {
            summary = "AI analysis completed. Primary medical observation parsed, recommendations and follow-up clinical tasks extracted.";
            keyInformation = Arrays.asList(
                    "Patient documentation ingested into CareFlow AI system",
                    "Clinical observations recorded for attending physician",
                    "Preventative follow-up tasks flagged"
            );

            actions.add(new ActionItemDto(
                    "Clinical Record Review",
                    "Review uploaded documentation and confirm patient care workflow.",
                    "Doctor",
                    "Attending Physician",
                    Priority.NORMAL,
                    1
            ));

            actions.add(new ActionItemDto(
                    "Patient Follow-up Call",
                    "Contact patient to verify recovery status.",
                    "Coordinator",
                    "Care Coordinator",
                    Priority.NORMAL,
                    3
            ));
        }

        return new AIAnalysisDto(
                null,
                documentId,
                summary,
                keyInformation,
                actions,
                LocalDateTime.now()
        );
    }
}
