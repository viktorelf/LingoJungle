package com.lingojungle.api.dto;

public record AnswerCheckResponse(
        boolean correct,
        String mistakeType,
        String hint,
        String normalizedAnswer
) {
}
