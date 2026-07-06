export type AnswerCheckPayload = {
  exerciseType: string;
  language: string;
  lessonTopic: string;
  correctAnswer: string;
  userAnswer: string;
};

export type AnswerCheckResult = {
  correct: boolean;
  mistakeType: string;
  hint: string;
  normalizedAnswer: string;
};

export type FlashcardReviewStatus = "KNOW" | "DONT_KNOW" | "REPEAT_LATER";

export type FlashcardItemPayload = {
  term: string;
  translation: string;
  example?: string;
  lessonTopic?: string;
  mistakesCount: number;
};

export type FlashcardReviewPayload = {
  userId: string;
  term: string;
  translation: string;
  example?: string;
  lessonTopic?: string;
  language?: string;
  level?: string;
  status: FlashcardReviewStatus;
};

export type FlashcardReviewResult = {
  term: string;
  translation: string;
  lessonTopic: string;
  priority: number;
  shouldRepeat: boolean;
  nextReviewHint: string;
  mentorMessage: string;
};

export type NextFlashcardPayload = {
  userId: string;
  language?: string;
  level?: string;
  goal?: string;
  availableCards: FlashcardItemPayload[];
};

export type NextFlashcardResult = {
  term: string;
  translation: string;
  example: string;
  lessonTopic: string;
  direction: string;
  mentorMessage: string;
};

export async function checkAnswerWithJava(
  payload: AnswerCheckPayload,
): Promise<AnswerCheckResult> {
  if (shouldUseInstantLocalCheck(payload.exerciseType)) {
    return createLocalFallback(payload);
  }

  const baseUrl = process.env.NEXT_PUBLIC_JAVA_API_URL;

  if (!baseUrl) {
    return createLocalFallback(payload);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const response = await fetch(`${baseUrl}/api/logic/check-answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return createLocalFallback(payload);
    }

    return (await response.json()) as AnswerCheckResult;
  } catch {
    return createLocalFallback(payload);
  }
}

export async function getNextFlashcardWithJava(
  payload: NextFlashcardPayload,
): Promise<NextFlashcardResult> {
  const baseUrl = process.env.NEXT_PUBLIC_JAVA_API_URL;

  if (!baseUrl) {
    return createLocalFlashcardFallback(payload);
  }

  try {
    const response = await fetch(`${baseUrl}/api/logic/flashcards/next`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return createLocalFlashcardFallback(payload);
    }

    return (await response.json()) as NextFlashcardResult;
  } catch {
    return createLocalFlashcardFallback(payload);
  }
}

export async function reviewFlashcardWithJava(
  payload: FlashcardReviewPayload,
): Promise<FlashcardReviewResult> {
  const baseUrl = process.env.NEXT_PUBLIC_JAVA_API_URL;

  if (!baseUrl) {
    return createLocalReviewFallback(payload);
  }

  try {
    const response = await fetch(`${baseUrl}/api/logic/flashcards/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return createLocalReviewFallback(payload);
    }

    return (await response.json()) as FlashcardReviewResult;
  } catch {
    return createLocalReviewFallback(payload);
  }
}

function createLocalFallback(payload: AnswerCheckPayload): AnswerCheckResult {
  const normalizedCorrect = normalize(payload.correctAnswer);
  const normalizedUser = normalize(payload.userAnswer);
  const correct = normalizedCorrect === normalizedUser;

  if (correct) {
    return {
      correct: true,
      mistakeType: "NONE",
      hint: "Ідеально. Відповідь правильна.",
      normalizedAnswer: normalizedCorrect,
    };
  }

  const topic = payload.lessonTopic.toLowerCase();
  const mistakeType = topic.includes("article") ? "ARTICLE" : "GENERAL";
  const hint =
    mistakeType === "ARTICLE"
      ? "Зверни увагу на артикль: він має відповідати тому, чи йдеться про загальне чи конкретне поняття."
      : "Пригадай основне правило цієї теми й спробуй ще раз.";

  return {
    correct: false,
    mistakeType,
    hint,
    normalizedAnswer: normalizedCorrect,
  };
}

function createLocalFlashcardFallback(payload: NextFlashcardPayload): NextFlashcardResult {
  const cards = [...(payload.availableCards ?? [])];
  const selected =
    cards.sort((left, right) => right.mistakesCount - left.mistakesCount)[0] ?? {
      term: "",
      translation: "",
      example: "",
      lessonTopic: payload.goal ?? "general",
      mistakesCount: 0,
    };

  return {
    term: selected.term,
    translation: selected.translation,
    example: selected.example ?? "",
    lessonTopic: selected.lessonTopic ?? payload.goal ?? "general",
    direction: selected.mistakesCount > 0 ? "foreign-to-uk" : "uk-to-foreign",
    mentorMessage:
      selected.mistakesCount > 0
        ? "Повертаємося до слова, яке варто закріпити."
        : "Спробуй згадати переклад без підказки.",
  };
}

function createLocalReviewFallback(payload: FlashcardReviewPayload): FlashcardReviewResult {
  if (payload.status === "DONT_KNOW") {
    return {
      term: payload.term,
      translation: payload.translation,
      lessonTopic: payload.lessonTopic ?? "general",
      priority: 3,
      shouldRepeat: true,
      nextReviewHint: "Повторити сьогодні",
      mentorMessage: "Це слово поки слабке. Я додам його до швидкого повторення.",
    };
  }

  if (payload.status === "REPEAT_LATER") {
    return {
      term: payload.term,
      translation: payload.translation,
      lessonTopic: payload.lessonTopic ?? "general",
      priority: 2,
      shouldRepeat: true,
      nextReviewHint: "Повторити пізніше",
      mentorMessage: "Добре, повернемося до цього слова трохи пізніше.",
    };
  }

  return {
    term: payload.term,
    translation: payload.translation,
    lessonTopic: payload.lessonTopic ?? "general",
    priority: 1,
    shouldRepeat: false,
    nextReviewHint: "Слово засвоєно",
    mentorMessage: "Чудово! Це слово вже виглядає впевнено.",
  };
}

function normalize(value: string) {
  return value
    .trim()
    .replaceAll(/\s+/g, " ")
    .replace(/[.!?;:…]+$/u, "")
    .trim()
    .toLowerCase();
}

function shouldUseInstantLocalCheck(exerciseType: string) {
  return [
    "multiple-choice",
    "matching",
    "word-choice",
    "fill-blank",
    "sentence-builder",
  ].includes(exerciseType);
}
