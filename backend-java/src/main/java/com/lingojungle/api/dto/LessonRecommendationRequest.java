package com.lingojungle.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record LessonRecommendationRequest(
        @NotBlank String language,
        @NotBlank String goal,
        @NotBlank String currentLevel,
        @NotEmpty List<String> weakTopics
) {
}
