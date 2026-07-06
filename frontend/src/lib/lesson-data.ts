import {
  lessonSeedData,
  type LessonSeed,
  type SeedGoal,
  type SeedLanguage,
} from "@/lib/lesson-seed-data";

export type CefrLevel = "A1" | "A2" | "B1";
export type SupportedCourseLevel = CefrLevel;
export type LanguageId = "english" | "french";
export type GoalId = "travel" | "work" | "movies" | "general" | "self-development";

export type LessonExercise =
  | {
      id: string;
      type: "multiple-choice";
      prompt: string;
      lessonTopic: string;
      correctAnswer: string;
      choices: string[];
    }
  | {
      id: string;
      type: "matching";
      prompt: string;
      lessonTopic: string;
      correctAnswer: string;
      left: string;
      choices: string[];
    }
  | {
      id: string;
      type: "sentence-builder";
      prompt: string;
      lessonTopic: string;
      correctAnswer: string;
      words: string[];
    }
  | {
      id: string;
      type: "fill-blank";
      prompt: string;
      lessonTopic: string;
      correctAnswer: string;
      sentence: string;
    }
  | {
      id: string;
      type: "word-choice";
      prompt: string;
      lessonTopic: string;
      correctAnswer: string;
      sourceWord: string;
      choices: string[];
      visual?: string;
    }
  | {
      id: string;
      type: "dialogue-choice";
      prompt: string;
      lessonTopic: string;
      correctAnswer: string;
      choices: string[];
    }
  | {
      id: string;
      type: "translation";
      prompt: string;
      lessonTopic: string;
      correctAnswer: string;
      sourceUk: string;
      acceptableAnswers?: string[];
    };

export type DemoLesson = {
  id: string;
  title: string;
  moduleLabel: string;
  moduleTitle: string;
  level: CefrLevel;
  languageId: LanguageId;
  goalId: GoalId;
  intro: string;
  lessonNumber: number;
  totalLessons: number;
  exercises: LessonExercise[];
};

export type CourseLessonCard = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  moduleTitle: string;
  level: CefrLevel;
};

export type LessonStudyGuide = {
  mentorIntro: string;
  objectives: string[];
  vocabulary: string[];
  glossary: Array<{
    term: string;
    translation: string;
  }>;
  grammarFocus: string;
  modelSentence: string;
  warmupTask: string;
  keyPhrases: string[];
  keyPhraseItems: Array<{
    phrase: string;
    translation: string;
  }>;
  explanationSteps: string[];
  microDialogue: Array<{
    speaker: string;
    line: string;
  }>;
  memoryTip: string;
};

const goalAccent: Record<SeedGoal, string> = {
  travel: "bg-[#2f8f5b]",
  work: "bg-[#1f7a63]",
  movies: "bg-[#2f6fb0]",
  "self-development": "bg-[#6b8b38]",
};

const levelFallbackOrder: Record<CefrLevel, CefrLevel[]> = {
  A1: ["A1", "A2", "B1"],
  A2: ["A2", "A1", "B1"],
  B1: ["B1", "A2", "A1"],
};

const translationDictionary = buildTranslationDictionary(lessonSeedData);

export function resolvePlayableLevel(
  level: string | null | undefined,
): SupportedCourseLevel {
  if (level === "A2" || level === "B1") {
    return level;
  }

  return "A1";
}

export function getLessonTermTranslation(
  languageId: LanguageId,
  term: string,
): string | null {
  const normalized = normalizeKey(term);
  if (!normalized) return null;

  const dictionary = translationDictionary[languageId];
  return dictionary[normalized] ?? null;
}

export function getCourseLessons(
  languageId: string,
  goalId: string,
  level: CefrLevel = "A1",
): DemoLesson[] {
  const safeLanguage = normalizeLanguage(languageId);
  const safeGoal = normalizeGoal(goalId);
  const safeLevel = resolvePlayableLevel(level);
  const seedLessons = getSeedLessons(safeLanguage, safeGoal, safeLevel);

  return seedLessons.map((seed, index) => {
    const moduleNumber = Math.floor(index / 3) + 1;
    const lessonInModule = (index % 3) + 1;

    return {
      id: seed.id,
      title: seed.lessonTitle,
      moduleLabel: `Рівень ${seed.level} • Модуль ${moduleNumber} • Урок ${lessonInModule}`,
      moduleTitle: seed.moduleTitle,
      level: seed.level,
      languageId: safeLanguage,
      goalId: safeGoal,
      intro: seed.communicativeGoalUk,
      lessonNumber: index + 1,
      totalLessons: seedLessons.length,
      exercises: toRuntimeExercises(seed),
    };
  });
}

export function getCourseLessonCards(
  languageId: string,
  goalId: string,
  level: CefrLevel = "A1",
): CourseLessonCard[] {
  const safeLanguage = normalizeLanguage(languageId);
  const safeGoal = normalizeGoal(goalId);
  const safeLevel = resolvePlayableLevel(level);
  const seedLessons = getSeedLessons(safeLanguage, safeGoal, safeLevel);

  return seedLessons.map((seed, index) => {
    const moduleNumber = Math.floor(index / 3) + 1;

    return {
      id: seed.id,
      title: seed.lessonTitle,
      subtitle: `Модуль ${moduleNumber} • ${seed.moduleTitle}`,
      description: seed.communicativeGoalUk,
      accent: goalAccent[toSeedGoal(safeGoal)],
      moduleTitle: seed.moduleTitle,
      level: seed.level,
    };
  });
}

export function getDemoLesson(
  languageId: string,
  goalId: string,
  level: CefrLevel = "A1",
  lessonId?: string,
): DemoLesson {
  const lessons = getCourseLessons(languageId, goalId, level);
  return lessons.find((lesson) => lesson.id === lessonId) ?? lessons[0];
}

export function getLessonStudyGuide(lesson: DemoLesson): LessonStudyGuide {
  const seed = getSeedLessonById(lesson.id) ?? getSeedLessons(lesson.languageId, lesson.goalId, lesson.level)[0];
  const glossary = seed.vocabularySet.map((item) => ({
    term: item.word,
    translation: item.translationUk,
  }));
  const vocabulary = seed.vocabularySet.map((item) => item.word);
  const explanationSteps = buildExplanationSteps(seed);
  const modelSentence =
    seed.usefulPhrases[0]?.phrase ?? seed.vocabularySet[0]?.example ?? seed.lessonTitle;

  return {
    mentorIntro: seed.presentation.topicIntroUk,
    objectives: buildObjectives(seed),
    vocabulary,
    glossary,
    grammarFocus: seed.grammarFocus,
    modelSentence,
    warmupTask: seed.presentation.communicativeTaskUk,
    keyPhrases: seed.usefulPhrases.map((item) => item.phrase),
    keyPhraseItems: seed.usefulPhrases.map((item) => ({
      phrase: item.phrase,
      translation: item.translationUk,
    })),
    explanationSteps,
    microDialogue: buildMicroDialogue(seed),
    memoryTip:
      seed.exercises[0]?.explanationUk ??
      seed.finalCheckpoint[0]?.explanationUk ??
      seed.mentorErrorMessage,
  };
}

function getSeedLessons(
  languageId: LanguageId,
  goalId: GoalId,
  level: CefrLevel,
): LessonSeed[] {
  const seedLanguage = toSeedLanguage(languageId);
  const seedGoal = toSeedGoal(goalId);
  const fallbackLevels = levelFallbackOrder[resolvePlayableLevel(level)];

  for (const candidateLevel of fallbackLevels) {
    const found = lessonSeedData.filter(
      (lesson) =>
        lesson.language === seedLanguage &&
        lesson.goal === seedGoal &&
        lesson.level === candidateLevel,
    );

    if (found.length) return found;
  }

  return lessonSeedData.filter(
    (lesson) => lesson.language === seedLanguage && lesson.goal === seedGoal,
  );
}

function getSeedLessonById(id: string): LessonSeed | undefined {
  return lessonSeedData.find((lesson) => lesson.id === id);
}

function toRuntimeExercises(seed: LessonSeed): LessonExercise[] {
  const exercises = seed.exercises.length ? seed.exercises : buildFallbackExercises(seed);

  return exercises.map((exercise) => {
    switch (exercise.type) {
      case "multiple-choice":
        return {
          id: exercise.id,
          type: "multiple-choice",
          prompt: exercise.questionUk,
          lessonTopic: seed.lessonTitle,
          correctAnswer: exercise.correctAnswer,
          choices: exercise.options,
        };
      case "matching":
        return {
          id: exercise.id,
          type: "matching",
          prompt: exercise.questionUk,
          lessonTopic: seed.lessonTitle,
          left: exercise.pairs[0]?.[0] ?? seed.vocabularySet[0]?.word ?? "",
          correctAnswer: exercise.pairs[0]?.[1] ?? seed.vocabularySet[0]?.translationUk ?? "",
          choices: exercise.pairs.map((pair) => pair[1]),
        };
      case "fill-blank":
        return {
          id: exercise.id,
          type: "fill-blank",
          prompt: exercise.questionUk,
          lessonTopic: seed.lessonTitle,
          sentence: exercise.sentence,
          correctAnswer: exercise.correctAnswer,
        };
      case "sentence-builder":
        return {
          id: exercise.id,
          type: "sentence-builder",
          prompt: exercise.questionUk,
          lessonTopic: seed.lessonTitle,
          correctAnswer: exercise.correctAnswer,
          words: exercise.words,
        };
      case "word-choice":
        return {
          id: exercise.id,
          type: "word-choice",
          prompt: exercise.questionUk,
          lessonTopic: seed.lessonTitle,
          sourceWord: exercise.sourceWord,
          correctAnswer: exercise.correctAnswer,
          choices: exercise.options,
        };
      case "dialogue-choice":
        return {
          id: exercise.id,
          type: "dialogue-choice",
          prompt: exercise.questionUk,
          lessonTopic: seed.lessonTitle,
          correctAnswer: exercise.correctAnswer,
          choices: exercise.options,
        };
      case "translation":
        return {
          id: exercise.id,
          type: "translation",
          prompt: exercise.questionUk,
          lessonTopic: seed.lessonTitle,
          sourceUk: exercise.sourceUk,
          correctAnswer: exercise.correctAnswer,
          acceptableAnswers: exercise.acceptableAnswers,
        };
      default:
        return assertNever(exercise);
    }
  });
}

function buildFallbackExercises(seed: LessonSeed): LessonSeed["exercises"] {
  const vocabA = seed.vocabularySet[0];
  const vocabB = seed.vocabularySet[1] ?? seed.vocabularySet[0];
  const vocabC = seed.vocabularySet[2] ?? seed.vocabularySet[0];
  const vocabD = seed.vocabularySet[3] ?? seed.vocabularySet[0];
  const phraseA = seed.usefulPhrases[0];
  const phraseB = seed.usefulPhrases[1] ?? phraseA;
  const phraseC = seed.usefulPhrases[2] ?? phraseA;
  const phraseAWords = splitWords(phraseA?.phrase ?? seed.lessonTitle);
  const phraseATranslation = phraseA?.translationUk ?? seed.communicativeGoalUk;
  const keyWord = getLastWord(phraseA?.phrase ?? seed.lessonTitle);

  return [
    {
      id: `${seed.id}-fallback-1`,
      type: "word-choice",
      questionUk: "Обери правильний переклад слова.",
      sourceWord: vocabA.word,
      options: [vocabA.translationUk, vocabB.translationUk, vocabC.translationUk, vocabD.translationUk],
      correctAnswer: vocabA.translationUk,
      explanationUk: `Слово «${vocabA.word}» у цьому уроці перекладається як «${vocabA.translationUk}».`,
    },
    {
      id: `${seed.id}-fallback-2`,
      type: "matching",
      questionUk: "Зістав слово з перекладом.",
      pairs: [
        [vocabA.word, vocabA.translationUk],
        [vocabB.word, vocabB.translationUk],
        [vocabC.word, vocabC.translationUk],
        [vocabD.word, vocabD.translationUk],
      ],
      explanationUk: "Тематичний словник краще запам’ятовується, коли слова повторюються в одній темі.",
    },
    {
      id: `${seed.id}-fallback-3`,
      type: "multiple-choice",
      questionUk: `Ти хочеш сказати: «${phraseATranslation}». Яку фразу потрібно обрати?`,
      options: [
        phraseA?.phrase ?? seed.lessonTitle,
        phraseB?.phrase ?? seed.lessonTitle,
        phraseC?.phrase ?? seed.lessonTitle,
        `${vocabA.word} ${keyWord}`,
      ],
      correctAnswer: phraseA?.phrase ?? seed.lessonTitle,
      explanationUk: `Правильна відповідь тут — готова доречна фраза для ситуації уроку. Вона тренує тему: ${seed.grammarFocus}.`,
    },
    {
      id: `${seed.id}-fallback-4`,
      type: "fill-blank",
      questionUk: "Заповни пропуск ключовим словом.",
      sentence: buildBlankSentence(phraseA?.phrase ?? seed.lessonTitle),
      correctAnswer: keyWord,
      explanationUk: "У цій вправі важливо відновити готовий мовний шаблон без зміни структури.",
    },
    {
      id: `${seed.id}-fallback-5`,
      type: "sentence-builder",
      questionUk: "Склади правильну фразу з поданих слів.",
      words: phraseAWords,
      correctAnswer: phraseA?.phrase ?? seed.lessonTitle,
      explanationUk: "Складання фрази допомагає побачити порядок слів у готовому мовному шаблоні.",
    },
    {
      id: `${seed.id}-fallback-6`,
      type: "dialogue-choice",
      questionUk: `Ти хочеш сказати: «${phraseATranslation}». Яку репліку варто обрати?`,
      options: [
        phraseA?.phrase ?? seed.lessonTitle,
        phraseB?.phrase ?? seed.lessonTitle,
        phraseC?.phrase ?? seed.lessonTitle,
        vocabA.word,
      ],
      correctAnswer: phraseA?.phrase ?? seed.lessonTitle,
      explanationUk: "У комунікативній ситуації правильним вибором є повна доречна репліка, а не окреме слово.",
    },
    {
      id: `${seed.id}-fallback-7`,
      type: "translation",
      questionUk: "Переклади українську фразу цільовою мовою.",
      sourceUk: phraseATranslation,
      correctAnswer: phraseA?.phrase ?? seed.lessonTitle,
      explanationUk: "Переклад закріплює зв’язок між комунікативним наміром і готовою фразою цільовою мовою.",
    },
    {
      id: `${seed.id}-fallback-8`,
      type: "multiple-choice",
      questionUk: `Фінальна перевірка: як правильно сказати «${phraseATranslation}»?`,
      options: [
        phraseA?.phrase ?? seed.lessonTitle,
        phraseB?.phrase ?? phraseA?.phrase ?? seed.lessonTitle,
        phraseC?.phrase ?? phraseA?.phrase ?? seed.lessonTitle,
        `${vocabB.word} ${vocabC.word}`,
      ],
      correctAnswer: phraseA?.phrase ?? seed.lessonTitle,
      explanationUk:
        seed.finalCheckpoint[0]?.explanationUk ??
        "Фінальна перевірка закріплює головну мовну дію уроку в одній короткій ситуації.",
    },
  ];
}

function buildObjectives(seed: LessonSeed): string[] {
  const vocabularyPreview = seed.vocabularySet.slice(0, 3).map((item) => item.word).join(", ");

  return [
    seed.communicativeGoalUk,
    `Зрозуміти й використати граматичну модель уроку: ${seed.grammarFocus}.`,
    `Упізнавати та вживати ключові слова теми: ${vocabularyPreview}.`,
  ];
}

function buildExplanationSteps(seed: LessonSeed): string[] {
  if (seed.exercises.length >= 3) {
    return seed.exercises.slice(0, 3).map((exercise) => exercise.explanationUk);
  }

  return [
    `Почни з теми уроку: ${seed.communicativeGoalUk}`,
    `Запам'ятай кілька ключових слів: ${seed.vocabularySet
      .slice(0, 4)
      .map((item) => `${item.word} — ${item.translationUk}`)
      .join(", ")}.`,
    `Головна граматична опора цього уроку: ${seed.grammarFocus}.`,
    `Подивись на готову фразу: ${
      seed.usefulPhrases[0]?.phrase ?? seed.vocabularySet[0]?.example ?? seed.lessonTitle
    }`,
  ];
}

function buildMicroDialogue(seed: LessonSeed) {
  const first = seed.usefulPhrases[0];
  const second = seed.usefulPhrases[1] ?? first;

  return [
    {
      speaker: "Mentor",
      line: first?.phrase ?? seed.lessonTitle,
    },
    {
      speaker: "Learner",
      line: second?.phrase ?? first?.phrase ?? seed.lessonTitle,
    },
  ];
}

function buildTranslationDictionary(seeds: LessonSeed[]) {
  const english: Record<string, string> = {};
  const french: Record<string, string> = {};

  for (const lesson of seeds) {
    const target = lesson.language === "fr" ? french : english;

    for (const item of lesson.vocabularySet) {
      target[normalizeKey(item.word)] = item.translationUk;
      target[normalizeKey(item.example)] = item.exampleTranslationUk;
    }

    for (const item of lesson.usefulPhrases) {
      target[normalizeKey(item.phrase)] = item.translationUk;
    }
  }

  return {
    english,
    french,
  } satisfies Record<LanguageId, Record<string, string>>;
}

function normalizeLanguage(languageId: string): LanguageId {
  return languageId === "french" ? "french" : "english";
}

function normalizeGoal(goalId: string): GoalId {
  if (
    goalId === "travel" ||
    goalId === "work" ||
    goalId === "movies" ||
    goalId === "self-development"
  ) {
    return goalId;
  }

  return "general";
}

function toSeedLanguage(languageId: LanguageId): SeedLanguage {
  return languageId === "french" ? "fr" : "en";
}

function toSeedGoal(goalId: GoalId): SeedGoal {
  return goalId === "general" ? "self-development" : goalId;
}

function normalizeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[“”„"'`’]/g, "")
    .replace(/[?!.,:;()]/g, "")
    .replace(/\s+/g, " ");
}

function splitWords(value: string) {
  return value
    .replace(/[.?!]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function getLastWord(value: string) {
  const words = splitWords(value);
  return words[words.length - 1] ?? value;
}

function buildBlankSentence(value: string) {
  const words = splitWords(value);
  if (!words.length) return value;

  const lastWord = words[words.length - 1];
  return value.replace(new RegExp(`${escapeRegExp(lastWord)}([.?!]?)$`), "___$1");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function assertNever(value: never): never {
  throw new Error(`Unexpected lesson exercise: ${JSON.stringify(value)}`);
}

