package com.careflow.ai;

import com.careflow.dto.AIAnalysisDto;
import com.careflow.dto.ActionItemDto;
import com.careflow.entity.enums.Priority;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service("groqAIService")
@Primary
public class GroqAIService implements AIService {

    private static final Logger logger = LoggerFactory.getLogger(GroqAIService.class);

    @Value("${careflow.ai.groq.api-key:}")
    private String apiKey;

    @Value("${careflow.ai.groq.model:qwen/qwen3.8-27b}")
    private String model;

    @Value("${careflow.ai.groq.url:https://api.groq.com/openai/v1/chat/completions}")
    private String apiUrl;

    @Autowired
    @Qualifier("mockAIService")
    private AIService fallbackService;

    @Autowired
    private ObjectMapper objectMapper;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String SYSTEM_PROMPT =
            "You are an expert Clinical AI Workflow Assistant for hospital care coordination. " +
            "Analyze clinical notes, lab reports, or doctor orders and extract a structured care plan.\n" +
            "You MUST respond ONLY with valid JSON with the following structure:\n" +
            "{\n" +
            "  \"summary\": \"Concise clinical summary of patient condition and care plan\",\n" +
            "  \"keyInformation\": [\"Key clinical observation 1\", \"Key clinical observation 2\"],\n" +
            "  \"actions\": [\n" +
            "    {\n" +
            "      \"title\": \"Action name (e.g. CBC Blood Test)\",\n" +
            "      \"description\": \"Specific clinical instruction\",\n" +
            "      \"department\": \"Target department (Laboratory, Doctor, Nursing, Scheduling, Pharmacy, Cardiology)\",\n" +
            "      \"assignedTo\": \"Role or individual (e.g. Lab Team, Dr. Rao, Nurse Sarah, Scheduling Team)\",\n" +
            "      \"priority\": \"URGENT, HIGH, NORMAL, or LOW\",\n" +
            "      \"dueInDays\": 2\n" +
            "    }\n" +
            "  ]\n" +
            "}";

    @Override
    public AIAnalysisDto analyzeDocument(Long documentId, String documentText) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            logger.info("No Groq API key configured; using MockAIService fallback.");
            return fallbackService.analyzeDocument(documentId, documentText);
        }

        try {
            logger.info("Sending clinical text to Groq model: {}...", model);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey.trim());

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("temperature", 0.1);

            Map<String, String> responseFormat = new HashMap<>();
            responseFormat.put("type", "json_object");
            requestBody.put("response_format", responseFormat);

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));
            messages.add(Map.of("role", "user", "content", documentText != null ? documentText : ""));
            requestBody.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode choices = root.path("choices");
                if (choices.isArray() && choices.size() > 0) {
                    String contentStr = choices.get(0).path("message").path("content").asText();
                    JsonNode parsedContent = objectMapper.readTree(contentStr);

                    String summary = parsedContent.path("summary").asText("Clinical analysis completed.");
                    
                    List<String> keyInfoList = new ArrayList<>();
                    JsonNode keyInfoNode = parsedContent.path("keyInformation");
                    if (keyInfoNode.isArray()) {
                        for (JsonNode item : keyInfoNode) {
                            keyInfoList.add(item.asText());
                        }
                    }

                    List<ActionItemDto> actionList = new ArrayList<>();
                    JsonNode actionsNode = parsedContent.path("actions");
                    if (actionsNode.isArray()) {
                        for (JsonNode a : actionsNode) {
                            String title = a.path("title").asText("Follow-up Task");
                            String desc = a.path("description").asText("");
                            String dept = a.path("department").asText("General");
                            String assignedTo = a.path("assignedTo").asText("Clinical Staff");
                            String priorityStr = a.path("priority").asText("NORMAL").toUpperCase();
                            Priority priority = Priority.NORMAL;
                            try {
                                priority = Priority.valueOf(priorityStr);
                            } catch (Exception ignored) {
                                if (priorityStr.contains("URG")) priority = Priority.URGENT;
                                else if (priorityStr.contains("HIGH")) priority = Priority.HIGH;
                                else if (priorityStr.contains("LOW")) priority = Priority.LOW;
                            }
                            int dueInDays = a.path("dueInDays").asInt(1);

                            actionList.add(new ActionItemDto(title, desc, dept, assignedTo, priority, dueInDays));
                        }
                    }

                    logger.info("Successfully extracted {} actions from Groq AI.", actionList.size());
                    return new AIAnalysisDto(
                            null,
                            documentId,
                            summary,
                            keyInfoList,
                            actionList,
                            LocalDateTime.now()
                    );
                }
            }
        } catch (Exception e) {
            logger.warn("Groq AI call encountered an error: {}. Triggering MockAIService fallback.", e.getMessage());
        }

        return fallbackService.analyzeDocument(documentId, documentText);
    }
}
