package com.lingojungle.api.dto;

import com.lingojungle.api.model.ReviewStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class FlashcardReviewRequest {

    @NotBlank
    private String userId;

    @NotBlank
    private String term;

    @NotBlank
    private String translation;

    private String example;

    private String lessonTopic;

    private String language;

    private String level;

    @NotNull
    private ReviewStatus status;

    public String getUserId() {
        return userId;
    }

    public String getTerm() {
        return term;
    }

    public String getTranslation() {
        return translation;
    }

    public String getExample() {
        return example;
    }

    public String getLessonTopic() {
        return lessonTopic;
    }

    public String getLanguage() {
        return language;
    }

    public String getLevel() {
        return level;
    }

    public ReviewStatus getStatus() {
        return status;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setTerm(String term) {
        this.term = term;
    }

    public void setTranslation(String translation) {
        this.translation = translation;
    }

    public void setExample(String example) {
        this.example = example;
    }

    public void setLessonTopic(String lessonTopic) {
        this.lessonTopic = lessonTopic;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public void setStatus(ReviewStatus status) {
        this.status = status;
    }
}
