package com.lingojungle.api.service;

import com.lingojungle.api.dto.FlashcardItem;
import com.lingojungle.api.dto.FlashcardReviewRequest;
import com.lingojungle.api.dto.FlashcardReviewResponse;
import com.lingojungle.api.dto.NextFlashcardRequest;
import com.lingojungle.api.dto.NextFlashcardResponse;
import com.lingojungle.api.model.ReviewStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FlashcardService {
    private static final String DEFAULT_FLASHCARD_DIRECTION = "foreign-to-uk";
    private final Map<String, Integer> rotationOffsets = new ConcurrentHashMap<>();

    public FlashcardReviewResponse reviewCard(FlashcardReviewRequest request) {
        int priority;
        boolean shouldRepeat;
        String nextReviewHint;
        String mentorMessage;

        if (request.getStatus() == ReviewStatus.DONT_KNOW) {
            priority = 3;
            shouldRepeat = true;
            nextReviewHint = "Повторити сьогодні";
            mentorMessage = "Це слово поки слабке. Я додам його до швидкого повторення.";
        } else if (request.getStatus() == ReviewStatus.REPEAT_LATER) {
            priority = 2;
            shouldRepeat = true;
            nextReviewHint = "Повторити пізніше";
            mentorMessage = "Добре, повернемося до цього слова трохи пізніше.";
        } else {
            priority = 1;
            shouldRepeat = false;
            nextReviewHint = "Слово засвоєно";
            mentorMessage = "Чудово! Це слово вже виглядає впевнено.";
        }

        return new FlashcardReviewResponse(
                request.getTerm(),
                request.getTranslation(),
                normalizeTopic(request.getLessonTopic()),
                priority,
                shouldRepeat,
                nextReviewHint,
                mentorMessage
        );
    }

    public NextFlashcardResponse selectNextCard(NextFlashcardRequest request) {
        List<FlashcardItem> cards = request.getAvailableCards();

        if (cards == null || cards.isEmpty()) {
            return new NextFlashcardResponse(
                    "",
                    "",
                    "",
                    normalizeTopic(request.getGoal()),
                    DEFAULT_FLASHCARD_DIRECTION,
                    "Поки немає карток для повторення. Завершіть урок, щоб зібрати нові слова."
            );
        }

        List<FlashcardItem> sortedCards = cards.stream()
                .sorted(
                        Comparator.comparingInt(this::calculateCardPriority)
                                .reversed()
                                .thenComparing(FlashcardItem::getTerm, Comparator.nullsLast(String::compareTo))
                                .thenComparing(FlashcardItem::getTranslation, Comparator.nullsLast(String::compareTo))
                )
                .toList();

        int topPriority = calculateCardPriority(sortedCards.get(0));
        List<FlashcardItem> priorityCards = new ArrayList<>();

        for (FlashcardItem card : sortedCards) {
            if (calculateCardPriority(card) != topPriority) {
                break;
            }

            priorityCards.add(card);
        }

        String rotationKey = buildRotationKey(request, topPriority);
        int offset = rotationOffsets.getOrDefault(rotationKey, 0);
        FlashcardItem selectedCard = priorityCards.get(offset % priorityCards.size());

        rotationOffsets.put(rotationKey, (offset + 1) % priorityCards.size());

        String direction = DEFAULT_FLASHCARD_DIRECTION;

        return new NextFlashcardResponse(
                selectedCard.getTerm(),
                selectedCard.getTranslation(),
                selectedCard.getExample(),
                normalizeTopic(selectedCard.getLessonTopic()),
                direction,
                buildNextCardMessage(selectedCard)
        );
    }

    private int calculateCardPriority(FlashcardItem card) {
        int priority = 1;

        if (card.getMistakesCount() >= 3) {
            priority += 4;
        } else if (card.getMistakesCount() == 2) {
            priority += 3;
        } else if (card.getMistakesCount() == 1) {
            priority += 2;
        }

        if (card.getExample() != null && !card.getExample().isBlank()) {
            priority += 1;
        }

        return priority;
    }

    private String buildNextCardMessage(FlashcardItem card) {
        if (card.getMistakesCount() >= 3) {
            return "Це слово часто викликало помилки. Повторімо його уважно.";
        }

        if (card.getMistakesCount() > 0) {
            return "Повертаємося до слова, яке варто закріпити.";
        }

        return "Спробуй згадати переклад без підказки.";
    }

    private String normalizeTopic(String topic) {
        if (topic == null || topic.isBlank()) {
            return "general";
        }

        return topic.trim().toLowerCase();
    }

    private String buildRotationKey(NextFlashcardRequest request, int topPriority) {
        return String.join(
                "|",
                normalizeKeyPart(request.getUserId()),
                normalizeKeyPart(request.getLanguage()),
                normalizeKeyPart(request.getLevel()),
                normalizeKeyPart(request.getGoal()),
                Integer.toString(topPriority)
        );
    }

    private String normalizeKeyPart(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }

        return value.trim().toLowerCase();
    }
}
