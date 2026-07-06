package com.lingojungle.api.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class NextFlashcardRequest {

    @NotBlank
    private String userId;

    private String language;

    private String level;

    private String goal;

    private List<FlashcardItem> availableCards;

    public String getUserId() {
        return userId;
    }

    public String getLanguage() {
        return language;
    }

    public String getLevel() {
        return level;
    }

    public String getGoal() {
        return goal;
    }

    public List<FlashcardItem> getAvailableCards() {
        return availableCards;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public void setGoal(String goal) {
        this.goal = goal;
    }

    public void setAvailableCards(List<FlashcardItem> availableCards) {
        this.availableCards = availableCards;
    }
}
