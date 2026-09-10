package com.careflow.controller;

import com.careflow.dto.AIAnalysisDto;
import com.careflow.service.AIServiceHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private AIServiceHandler aiServiceHandler;

    @PostMapping("/analyze/{documentId}")
    public ResponseEntity<AIAnalysisDto> analyzeDocument(@PathVariable("documentId") Long documentId) {
        AIAnalysisDto analysis = aiServiceHandler.analyzeDocument(documentId);
        return ResponseEntity.ok(analysis);
    }

    @GetMapping("/document/{documentId}")
    public ResponseEntity<AIAnalysisDto> getAnalysisByDocumentId(@PathVariable("documentId") Long documentId) {
        AIAnalysisDto analysis = aiServiceHandler.getAnalysisByDocumentId(documentId);
        return ResponseEntity.ok(analysis);
    }

    @PostMapping("/direct-analyze")
    public ResponseEntity<AIAnalysisDto> directAnalyze(@RequestBody Map<String, Object> payload) {
        String text = "";
        if (payload.containsKey("content") && payload.get("content") != null) {
            text = payload.get("content").toString();
        } else if (payload.containsKey("text") && payload.get("text") != null) {
            text = payload.get("text").toString();
        }
        AIAnalysisDto analysis = aiServiceHandler.directAnalyze(text);
        return ResponseEntity.ok(analysis);
    }
}
