package com.lingojungle.api.dto;

public class FlashcardReviewResponse {

    private String term;
    private String translation;
    private String lessonTopic;
    private int priority;
    private boolean shouldRepeat;
    private String nextReviewHint;
    private String mentorMessage;

    public FlashcardReviewResponse(
            String term,
            String translation,
            String lessonTopic,
            int priority,
            boolean shouldRepeat,
            String nextReviewHint,
            String mentorMessage
    ) {
        this.term = term;
        this.translation = translation;
        this.lessonTopic = lessonTopic;
        this.priority = priority;
        this.shouldRepeat = shouldRepeat;
        this.nextReviewHint = nextReviewHint;
        this.mentorMessage = mentorMessage;
    }

    public String getTerm() {
        return term;
    }

    public String getTranslation() {
        return translation;
    }

    public String getLessonTopic() {
        return lessonTopic;
    }

    public int getPriority() {
        return priority;
    }

    public boolean isShouldRepeat() {
        return shouldRepeat;
    }

    public String getNextReviewHint() {
        return nextReviewHint;
    }

    public String getMentorMessage() {
        return mentorMessage;
    }
}
