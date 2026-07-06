package com.lingojungle.api.service;

import com.lingojungle.api.dto.FlashcardItem;
import com.lingojungle.api.dto.NextFlashcardRequest;
import com.lingojungle.api.dto.NextFlashcardResponse;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class FlashcardServiceTest {

    @Test
    void rotatesCardsWithinSameTopPriorityBucket() {
        FlashcardService service = new FlashcardService();
        NextFlashcardRequest request = new NextFlashcardRequest();
        request.setUserId("user-1");
        request.setLanguage("en");
        request.setLevel("A2");
        request.setGoal("travel");
        request.setAvailableCards(List.of(
                createCard("message", "повідомлення", 0),
                createCard("meeting", "зустріч", 0),
                createCard("practice", "практика", 0)
        ));

        NextFlashcardResponse first = service.selectNextCard(request);
        NextFlashcardResponse second = service.selectNextCard(request);
        NextFlashcardResponse third = service.selectNextCard(request);

        assertEquals("meeting", first.getTerm());
        assertEquals("message", second.getTerm());
        assertEquals("practice", third.getTerm());
    }

    private static FlashcardItem createCard(String term, String translation, int mistakesCount) {
        FlashcardItem card = new FlashcardItem();
        card.setTerm(term);
        card.setTranslation(translation);
        card.setExample("Example sentence.");
        card.setLessonTopic("general");
        card.setMistakesCount(mistakesCount);
        return card;
    }
}
