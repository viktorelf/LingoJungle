package com.lingojungle.api.controller;

import com.lingojungle.api.dto.FlashcardReviewRequest;
import com.lingojungle.api.dto.FlashcardReviewResponse;
import com.lingojungle.api.dto.NextFlashcardRequest;
import com.lingojungle.api.dto.NextFlashcardResponse;
import com.lingojungle.api.service.FlashcardService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/logic/flashcards")
@CrossOrigin(origins = "*")
public class FlashcardController {

    private final FlashcardService flashcardService;

    public FlashcardController(FlashcardService flashcardService) {
        this.flashcardService = flashcardService;
    }

    @PostMapping("/review")
    public FlashcardReviewResponse reviewCard(@Valid @RequestBody FlashcardReviewRequest request) {
        return flashcardService.reviewCard(request);
    }

    @PostMapping("/next")
    public NextFlashcardResponse nextCard(@Valid @RequestBody NextFlashcardRequest request) {
        return flashcardService.selectNextCard(request);
    }
}
