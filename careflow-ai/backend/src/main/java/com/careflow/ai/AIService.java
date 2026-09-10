package com.careflow.ai;

import com.careflow.dto.AIAnalysisDto;

public interface AIService {
    AIAnalysisDto analyzeDocument(Long documentId, String documentText);
}
