package com.lingojungle.api.dto;

public class FlashcardItem {

    private String term;
    private String translation;
    private String example;
    private String lessonTopic;
    private int mistakesCount;

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

    public int getMistakesCount() {
        return mistakesCount;
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

    public void setMistakesCount(int mistakesCount) {
        this.mistakesCount = mistakesCount;
    }
}
