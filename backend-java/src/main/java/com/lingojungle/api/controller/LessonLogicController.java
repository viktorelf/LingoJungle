package com.lingojungle.api.controller;

import com.lingojungle.api.dto.AnswerCheckRequest;
import com.lingojungle.api.dto.AnswerCheckResponse;
import com.lingojungle.api.dto.LessonRecommendationRequest;
import com.lingojungle.api.dto.LessonRecommendationResponse;
import com.lingojungle.api.service.LessonLogicService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/logic")
public class LessonLogicController {

    private final LessonLogicService lessonLogicService;

    public LessonLogicController(LessonLogicService lessonLogicService) {
        this.lessonLogicService = lessonLogicService;
    }

    @PostMapping("/check-answer")
    public AnswerCheckResponse checkAnswer(@Valid @RequestBody AnswerCheckRequest request) {
        return lessonLogicService.checkAnswer(request);
    }

    @PostMapping("/recommend-next-lesson")
    public LessonRecommendationResponse recommendNextLesson(
            @Valid @RequestBody LessonRecommendationRequest request
    ) {
        return lessonLogicService.recommendNextLesson(request);
    }
}
