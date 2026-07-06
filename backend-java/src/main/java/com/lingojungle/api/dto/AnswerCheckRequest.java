package com.lingojungle.api.dto;

import jakarta.validation.constraints.NotBlank;

public record AnswerCheckRequest(
        @NotBlank String exerciseType,
        @NotBlank String language,
        @NotBlank String lessonTopic,
        @NotBlank String correctAnswer,
        @NotBlank String userAnswer
) {
}
