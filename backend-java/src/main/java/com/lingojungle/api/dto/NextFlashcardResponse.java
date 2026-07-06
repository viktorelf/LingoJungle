package com.lingojungle.api.dto;

public class NextFlashcardResponse {

    private String term;
    private String translation;
    private String example;
    private String lessonTopic;
    private String direction;
    private String mentorMessage;

    public NextFlashcardResponse(
            String term,
            String translation,
            String example,
            String lessonTopic,
            String direction,
            String mentorMessage
    ) {
        this.term = term;
        this.translation = translation;
        this.example = example;
        this.lessonTopic = lessonTopic;
        this.direction = direction;
        this.mentorMessage = mentorMessage;
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

    public String getDirection() {
        return direction;
    }

    public String getMentorMessage() {
        return mentorMessage;
    }
}
