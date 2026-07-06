package com.lingojungle.api.dto;

public record LessonRecommendationResponse(
        String nextLessonSlug,
        String recommendedTopic,
        String mentorMessage
) {
}
