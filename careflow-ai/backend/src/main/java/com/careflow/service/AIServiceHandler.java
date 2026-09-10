package com.careflow.service;

import com.careflow.ai.AIService;
import com.careflow.dto.AIAnalysisDto;
import com.careflow.dto.ActionItemDto;
import com.careflow.entity.AIAnalysis;
import com.careflow.entity.Document;
import com.careflow.repository.AIAnalysisRepository;
import com.careflow.repository.DocumentRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class AIServiceHandler {

    @Autowired
    private AIService aiService;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private AIAnalysisRepository aiAnalysisRepository;

    @Autowired
    private ObjectMapper objectMapper;

    public AIAnalysisDto analyzeDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + documentId));

        // Call AI Service
        AIAnalysisDto result = aiService.analyzeDocument(documentId, document.getContent());

        // Save to Database
        try {
            String keyInfoJson = objectMapper.writeValueAsString(result.getKeyInformation());
            String actionsJson = objectMapper.writeValueAsString(result.getActions());

            AIAnalysis entity = aiAnalysisRepository.findByDocumentId(documentId)
                    .orElse(new AIAnalysis());

            entity.setDocumentId(documentId);
            entity.setSummary(result.getSummary());
            entity.setKeyInformation(keyInfoJson);
            entity.setExtractedActionsJson(actionsJson);

            AIAnalysis saved = aiAnalysisRepository.save(entity);
            result.setId(saved.getId());

            // Mark document as AI processed
            document.setAiProcessed(true);
            documentRepository.save(document);

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing AI analysis results", e);
        }

        return result;
    }

    public AIAnalysisDto getAnalysisByDocumentId(Long documentId) {
        AIAnalysis analysis = aiAnalysisRepository.findByDocumentId(documentId)
                .orElseThrow(() -> new RuntimeException("Analysis not found for document id: " + documentId));

        try {
            List<String> keyInfo = objectMapper.readValue(
                    analysis.getKeyInformation(), new TypeReference<List<String>>() {});
            List<ActionItemDto> actions = objectMapper.readValue(
                    analysis.getExtractedActionsJson(), new TypeReference<List<ActionItemDto>>() {});

            return new AIAnalysisDto(
                    analysis.getId(),
                    analysis.getDocumentId(),
                    analysis.getSummary(),
                    keyInfo,
                    actions,
                    analysis.getCreatedAt()
            );
        } catch (Exception e) {
            return new AIAnalysisDto(
                    analysis.getId(),
                    analysis.getDocumentId(),
                    analysis.getSummary(),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    analysis.getCreatedAt()
            );
        }
    }

    public AIAnalysisDto directAnalyze(String text) {
        return aiService.analyzeDocument(null, text);
    }
}
