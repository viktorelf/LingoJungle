package com.lingojungle.api.service;

import com.lingojungle.api.dto.AnswerCheckRequest;
import com.lingojungle.api.dto.AnswerCheckResponse;
import com.lingojungle.api.dto.LessonRecommendationRequest;
import com.lingojungle.api.dto.LessonRecommendationResponse;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class LessonLogicService {

    public AnswerCheckResponse checkAnswer(AnswerCheckRequest request) {
        String normalizedCorrect = normalize(request.correctAnswer());
        String normalizedUser = normalize(request.userAnswer());

        if (normalizedCorrect.equals(normalizedUser)) {
            return new AnswerCheckResponse(true, "NONE", "Perfect answer.", normalizedCorrect);
        }

        String mistakeType = detectMistakeType(request, normalizedCorrect, normalizedUser);
        String hint = buildHint(request.lessonTopic(), mistakeType, request.language());

        return new AnswerCheckResponse(false, mistakeType, hint, normalizedCorrect);
    }

    public LessonRecommendationResponse recommendNextLesson(LessonRecommendationRequest request) {
        String weakTopic = request.weakTopics().getFirst();
        String nextLessonSlug = request.language().toLowerCase(Locale.ROOT)
                + "-" + request.currentLevel().toLowerCase(Locale.ROOT)
                + "-" + slugify(weakTopic);

        String mentorMessage = "Let’s review " + weakTopic + " and make it feel easy.";

        return new LessonRecommendationResponse(nextLessonSlug, weakTopic, mentorMessage);
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
    }

    private String detectMistakeType(
            AnswerCheckRequest request,
            String normalizedCorrect,
            String normalizedUser
    ) {
        String topic = request.lessonTopic().toLowerCase(Locale.ROOT);

        if (topic.contains("article") || topic.contains("артик")) {
            return "ARTICLE";
        }

        if (topic.contains("tense") || topic.contains("врем")) {
            return "TENSE";
        }

        if (topic.contains("preposition") || topic.contains("предлог")) {
            return "PREPOSITION";
        }

        if (normalizedCorrect.split(" ").length != normalizedUser.split(" ").length) {
            return "WORD_ORDER";
        }

        return "GENERAL";
    }

    private String buildHint(String lessonTopic, String mistakeType, String language) {
        return switch (mistakeType) {
            case "ARTICLE" -> "Use the article that matches whether the noun is general or specific.";
            case "TENSE" -> "Choose the tense that matches when the action happens and how often it repeats.";
            case "PREPOSITION" -> "Check which preposition naturally goes with this word or situation.";
            case "WORD_ORDER" -> "Pay attention to the natural word order of the sentence.";
            default -> "Review the main rule for this topic and try the sentence again.";
        };
    }

    private String slugify(String value) {
        return value.toLowerCase(Locale.ROOT).trim().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }
}
