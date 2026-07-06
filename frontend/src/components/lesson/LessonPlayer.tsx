"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AvatarStage } from "@/components/avatar/AvatarStage";
import { useClientReady } from "@/hooks/useClientReady";
import { useStoredProfile } from "@/hooks/useStoredProfile";
import { avatarOptions } from "@/lib/onboarding-data";
import { checkAnswerWithJava } from "@/lib/java-api";
import {
  getCourseLessons,
  getLessonTermTranslation,
  getLessonStudyGuide,
  type DemoLesson,
  type LessonExercise,
  type LessonStudyGuide,
} from "@/lib/lesson-data";
import { recordLessonCompletion } from "@/lib/profile-storage";
import { syncLessonResult, syncProfileSelection } from "@/lib/supabase/profile-sync";
import {
  getEquippedCoinBonusPercent,
  getEquippedItems,
  getThemePresentation,
} from "@/lib/ui-theme";

type LessonPlayerProps = {
  lesson: DemoLesson;
  languageLabel: string;
  goalLabel: string;
  avatarId: string;
};

type FeedbackState = {
  correct: boolean;
  hint: string;
  correctAnswer: string;
} | null;

type ExerciseTranslationHint = {
  term: string;
  translation: string;
};

export function LessonPlayer({
  lesson,
  languageLabel,
  goalLabel,
  avatarId,
}: LessonPlayerProps) {
  const router = useRouter();
  const isClientReady = useClientReady();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [submitting, setSubmitting] = useState(false);
  const [answer, setAnswer] = useState("");
  const [mentorStepOpen, setMentorStepOpen] = useState(true);
  const [mentorMessageIndex, setMentorMessageIndex] = useState(0);
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState<string | null>(null);
  const [savedCoins, setSavedCoins] = useState<number | null>(null);
  const [leavePromptOpen, setLeavePromptOpen] = useState(false);
  const storedProfile = useStoredProfile();
  const hasPersistedCompletion = useRef(false);

  const exercise = lesson.exercises[index];
  const isLast = index === lesson.exercises.length - 1;
  const progress = Math.round(((index + 1) / lesson.exercises.length) * 100);
  const isRepeatLesson = storedProfile?.completedLessonIds.includes(lesson.id) ?? false;
  const equippedCoinBonusPercent = getEquippedCoinBonusPercent(storedProfile);
  const baseCoinsEarned = isRepeatLesson ? Math.max(1, Math.floor((score * 10) / 2)) : score * 10;
  const coinsEarned = Math.max(
    1,
    Math.floor(baseCoinsEarned * (1 + equippedCoinBonusPercent / 100)),
  );
  const weeklyGoalCurrent = storedProfile?.weeklyGoalCurrent ?? 0;
  const activeAvatarId = storedProfile?.avatarId ?? avatarId;
  const lessonSequence = useMemo(
    () => getCourseLessons(lesson.languageId, lesson.goalId, lesson.level),
    [lesson.goalId, lesson.languageId, lesson.level],
  );
  const currentLessonIndex = lessonSequence.findIndex((item) => item.id === lesson.id);
  const nextLesson = lessonSequence[currentLessonIndex + 1] ?? null;
  const courseHref = `/course?language=${lesson.languageId}&goal=${lesson.goalId}&avatar=${activeAvatarId}&level=${lesson.level}`;
  const profileHref = `/profile?language=${lesson.languageId}&goal=${lesson.goalId}&avatar=${activeAvatarId}&level=${lesson.level}`;
  const nextLessonHref = nextLesson
    ? `/lesson?language=${lesson.languageId}&goal=${lesson.goalId}&avatar=${activeAvatarId}&level=${lesson.level}&lesson=${nextLesson.id}`
    : null;
  const themeUi = getThemePresentation(storedProfile?.selectedThemeId);
  const equippedItems = getEquippedItems(storedProfile);
  const avatar = avatarOptions.find((item) => item.id === activeAvatarId) ?? avatarOptions[0];
  const mentorVoice = getMentorVoice(activeAvatarId);
  const studyGuide = useMemo(() => getLessonStudyGuide(lesson), [lesson]);
  const currentMentorCard = useMemo(
    () => buildMentorCard(studyGuide, exercise, index),
    [exercise, index, studyGuide],
  );
  const mentorMessages = currentMentorCard.messages;

  const sentenceBuilderWords = useMemo(() => {
    if (exercise.type !== "sentence-builder") return [];
    return exercise.words;
  }, [exercise]);
  const exerciseTranslationHints = useMemo(
    () => buildExerciseTranslationHints(lesson.languageId, exercise, studyGuide),
    [exercise, lesson.languageId, studyGuide],
  );
  const feedbackTranslation = useMemo(() => {
    if (!feedback) return null;
    if (exercise.type === "word-choice") {
      return `"${exercise.sourceWord}" українською — "${feedback.correctAnswer}"`;
    }

    const translation = getLessonTermTranslation(lesson.languageId, feedback.correctAnswer);
    if (!translation) return null;

    return `"${feedback.correctAnswer}" українською — "${translation}"`;
  }, [exercise, feedback, lesson.languageId]);
  const lessonPath = useMemo(
    () =>
      lesson.exercises.map((item, itemIndex) => ({
        key: item.id,
        label: `Крок ${itemIndex + 1}`,
        typeLabel: getExerciseTypeLabel(item.type),
        active: itemIndex === index,
        completed: itemIndex < index || (itemIndex === index && Boolean(feedback)),
      })),
    [feedback, index, lesson.exercises],
  );

  useEffect(() => {
    if (!(isLast && feedback) || hasPersistedCompletion.current) return;

    hasPersistedCompletion.current = true;

    const completionResult = recordLessonCompletion({
      languageId: lesson.languageId,
      goalId: lesson.goalId,
      avatarId,
      selectedLevelId: lesson.level,
      lessonId: lesson.id,
      correctAnswers: score,
      totalAnswers: lesson.exercises.length,
      coinsEarned,
    });

    setSavedCoins(completionResult.profile.coins);

    void (async () => {
      await syncProfileSelection({
        languageId: completionResult.profile.languageId,
        goalId: completionResult.profile.goalId,
        avatarId: completionResult.profile.avatarId,
        selectedLevelId: completionResult.profile.selectedLevelId,
        recommendedLevelId: completionResult.profile.recommendedLevelId,
        placementCompleted: completionResult.profile.placementCompleted,
        coins: completionResult.profile.coins,
        totalCorrectAnswers: completionResult.profile.totalCorrectAnswers,
        totalAnswered: completionResult.profile.totalAnswered,
      });

      const lessonSyncResult = await syncLessonResult({
        lessonId: lesson.id,
        languageId: lesson.languageId,
        goalId: lesson.goalId,
        avatarId: completionResult.profile.avatarId,
        scorePercent: Math.round((score / lesson.exercises.length) * 100),
        correctAnswers: score,
        totalAnswers: lesson.exercises.length,
        coinsEarned: completionResult.awardedCoins,
        weakTopics: feedback.correct ? [] : [exercise.lessonTopic],
      });

      if (!lessonSyncResult) {
        console.error("[LessonPlayer] Lesson result sync failed.", {
          lessonId: lesson.id,
          languageId: lesson.languageId,
          goalId: lesson.goalId,
        });
      }
    })();
  }, [
    avatarId,
    coinsEarned,
    exercise.lessonTopic,
    feedback,
    isLast,
    lesson.exercises.length,
    lesson.goalId,
    lesson.id,
    lesson.languageId,
    lesson.level,
    score,
  ]);

  async function submitCurrent(answerOverride?: string) {
    const userAnswer = (answerOverride ?? answer).trim();
    if (!userAnswer || submitting) return;

    setSubmitting(true);
    const result = await checkAnswerWithJava({
      exerciseType: exercise.type,
      language: lesson.languageId,
      lessonTopic: exercise.lessonTopic,
      correctAnswer: exercise.correctAnswer,
      userAnswer,
    });

    if (result.correct) {
      setScore((value) => value + 1);
    }

    setFeedback({
      correct: result.correct,
      hint: result.hint,
      correctAnswer: exercise.correctAnswer,
    });
    setSubmitting(false);
  }

  function handleAnswerChange(value: string) {
    setAnswer(value);
  }

  const exerciseCardAction = feedback ? (
    <button
      type="button"
      onClick={nextExercise}
      className={`rounded-full px-3.5 py-2 text-[14px] font-semibold text-white transition ${themeUi.accentButton}`}
    >
      {isLast ? "Завершити урок" : "Наступна вправа"}
    </button>
  ) : (
    <button
      type="button"
      onClick={() => {
        void submitCurrent();
      }}
      disabled={!answer.trim() || submitting}
      className={`rounded-full px-3.5 py-2 text-[14px] font-semibold text-white transition ${themeUi.accentButton} disabled:cursor-not-allowed disabled:opacity-55`}
    >
      {submitting ? "Перевірка..." : "Перевірити відповідь"}
    </button>
  );

  function nextExercise() {
    if (!feedback) return;
    if (!isLast) {
      setIndex((value) => value + 1);
      setAnswer("");
      setFeedback(null);
      setMentorStepOpen(false);
      setMentorMessageIndex(0);
    }
  }

  function continueMentorSequence() {
    if (mentorMessageIndex < mentorMessages.length - 1) {
      setMentorMessageIndex((value) => value + 1);
      return;
    }

    setMentorStepOpen(false);
    setMentorMessageIndex(0);
  }

  function skipMentorSequence() {
    setMentorStepOpen(false);
    setMentorMessageIndex(0);
  }

  function requestLeaveLesson() {
    setLeavePromptOpen(true);
  }

  function closeLeavePrompt() {
    setLeavePromptOpen(false);
  }

  function confirmLeaveLesson() {
    setLeavePromptOpen(false);
    router.push(courseHref);
  }

  if (!isClientReady) {
    return (
      <main className="app-shell">
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <div className="glass-header rounded-[28px] px-5 py-6" />
          <div className="glass-panel h-36 rounded-[28px]" />
          <div className="grid gap-6 xl:grid-cols-[0.52fr_1.48fr]">
            <div className="glass-panel h-[32rem] rounded-[30px]" />
            <div className="glass-panel h-[32rem] rounded-[30px]" />
          </div>
        </section>
      </main>
    );
  }

  if (isLast && feedback) {
    const percent = Math.round((score / lesson.exercises.length) * 100);

    return (
      <main className="app-shell">
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 ${themeUi.pageGlow}`}
        />
        <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <div
            className={`glass-panel rounded-[30px] p-6 sm:p-8 ${themeUi.primarySurface}`}
          >
            <p className={`text-sm uppercase tracking-[0.18em] ${themeUi.accentText}`}>
              Урок завершено
            </p>
            <h1 className="section-title mt-3 text-2xl font-semibold sm:text-4xl">{lesson.title}</h1>
            <p className="mt-4 text-base leading-7 text-[#567062] sm:text-lg sm:leading-8">
              {languageLabel} • {goalLabel} • Наставник: {avatar.name}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <ResultCard
                label="Правильні відповіді"
                value={`${score}/${lesson.exercises.length}`}
              />
              <ResultCard label="Зароблено монет" value={`+${coinsEarned}`} />
              <ResultCard label="Бонус предметів" value={`+${equippedCoinBonusPercent}%`} />
              <ResultCard label="Режим нагороди" value={isRepeatLesson ? "x0.5" : "x1"} />
              <ResultCard label="Прогрес" value={`${percent}%`} />
            </div>

            <div className="mt-4 rounded-[24px] bg-[rgba(255,255,255,0.82)] p-5">
              <p className={`text-sm uppercase tracking-[0.18em] ${themeUi.accentText}`}>
                Збережений стан профілю
              </p>
              <p className="mt-2 text-sm leading-6 text-[#567062]">
                У профілі зараз {savedCoins ?? coinsEarned} монет.{" "}
                {isRepeatLesson
                  ? "За повторне проходження цього уроку нараховано половину стандартної нагороди."
                  : "Це повна нагорода за перше проходження уроку."}{" "}
                {equippedCoinBonusPercent > 0
                  ? `Екіпіровані предмети дали ще +${equippedCoinBonusPercent}% до монет. `
                  : ""}
                Цей урок також відкриває наступний крок у поточному треку CEFR.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {nextLessonHref ? (
                <Link
                  href={nextLessonHref}
                  className={`rounded-full px-6 py-3 text-center font-semibold text-white transition ${themeUi.accentButton}`}
                >
                  Наступний урок
                </Link>
              ) : null}
              <Link
                href={courseHref}
                className="rounded-full border border-[rgba(22,49,40,0.12)] bg-white px-6 py-3 font-medium text-[#24483a] transition hover:bg-[rgba(255,255,255,0.84)]"
              >
                Назад до курсу
              </Link>
              <Link
                href={profileHref}
                className="rounded-full border border-[rgba(22,49,40,0.12)] bg-white px-6 py-3 font-medium text-[#24483a] transition hover:bg-[rgba(255,255,255,0.84)]"
              >
                Відкрити профіль і магазин
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${themeUi.pageGlow}`}
      />
      <section className="mx-auto flex w-full max-w-[1560px] flex-col gap-2.5 2xl:max-w-[1660px]">
        <header
          className={`glass-header flex flex-col gap-3 rounded-[26px] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${themeUi.primarySurface}`}
        >
          <div>
            <p className={`text-sm uppercase tracking-[0.22em] ${themeUi.accentText}`}>
              {lesson.moduleLabel}
            </p>
            <h1 className="text-[1.1rem] font-semibold sm:text-[1.45rem]">{lesson.title}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            <button
              type="button"
              onClick={requestLeaveLesson}
              className="rounded-full border border-[rgba(22,49,40,0.12)] bg-white px-4 py-2 text-sm font-medium text-[#24483a] transition hover:bg-[rgba(255,255,255,0.84)]"
            >
              Назад до курсу
            </button>
            <div
              className={`max-w-full rounded-full px-4 py-2 text-center text-sm font-medium ${themeUi.secondarySurface} text-[#356f55]`}
            >
              {languageLabel} • {goalLabel}
            </div>
            <Link
              href={profileHref}
              className="rounded-full border border-[rgba(22,49,40,0.12)] bg-white px-4 py-2 text-sm font-semibold text-[#24483a] transition hover:bg-[rgba(255,255,255,0.84)]"
            >
              Профіль і магазин
            </Link>
          </div>
        </header>

        <section className="grid">
          <article
            className={`glass-panel rounded-[24px] p-3.5 sm:p-4 ${themeUi.primarySurface}`}
          >
            <p className={`text-xs uppercase tracking-[0.18em] ${themeUi.accentText}`}>
              Місія уроку
            </p>
            <h2 className="section-title mt-2 text-[1rem] font-semibold text-[#17362d] sm:text-[1.45rem] 2xl:text-[1.65rem]">
              {lesson.intro}
            </h2>
            <p className="mt-2.5 max-w-6xl text-[14px] leading-5.5 text-[#587264]">
              {studyGuide.mentorIntro}
            </p>
          </article>
        </section>

        <div className="grid gap-3 xl:grid-cols-[220px_minmax(0,1fr)] 2xl:grid-cols-[236px_minmax(0,1fr)]">
          <aside
            className={`glass-panel space-y-2.5 rounded-[24px] p-3.5 xl:sticky xl:top-4 ${themeUi.primarySurface}`}
          >
            <div>
              <p className={`text-sm uppercase tracking-[0.18em] ${themeUi.accentText}`}>
                Контекст уроку
              </p>
            </div>
            <AvatarStage
              avatar={avatar}
              equippedItems={equippedItems}
              accentTextClass={themeUi.accentText}
            />

            <div className="rounded-[22px] bg-[#163128] p-3.5 text-white">
              <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                Прогрес
              </p>
              <div className="mt-2.5 h-2.5 rounded-full bg-white/15">
                <div
                  className="h-2.5 rounded-full bg-[#9edb4d]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2.5 text-sm text-white/82">
                Вправа {index + 1} з {lesson.exercises.length}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <MiniCard label="Урок" value={`${lesson.lessonNumber}/${lesson.totalLessons}`} />
              <MiniCard label="Поточний бал" value={`${score}`} />
              <MiniCard label="Монет зараз" value={`${coinsEarned}`} />
              <MiniCard label="Тижнева ціль" value={`${Math.min(weeklyGoalCurrent, 6)}/6`} />
            </div>

  
          </aside>

          <section className="space-y-4">
              <div className="glass-panel rounded-[24px] p-3.5 sm:p-4">
                <p className="text-sm uppercase tracking-[0.18em] text-[#2f8f5b]">
                  Підготовка перед практикою
                </p>
                <div className="mt-3 rounded-[20px] bg-[rgba(22,49,40,0.05)] px-4 py-3 text-sm leading-6 text-[#36594a]">
                  {studyGuide.mentorIntro}
                </div>
                <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                  <div className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-[22px] bg-[rgba(255,255,255,0.84)] p-4 shadow-[0_12px_28px_rgba(20,56,42,0.04)]">
                        <p className="text-sm font-semibold text-[#17362d]">Цілі</p>
                        <ul className="mt-2 space-y-2.5 text-sm leading-6 text-[#587264]">
                          {studyGuide.objectives.map((objective) => (
                            <li key={objective} className="flex items-start gap-3">
                              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#2f8f5b]" />
                              <span>{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-[22px] bg-[rgba(244,251,247,0.92)] p-4 shadow-[0_12px_28px_rgba(20,56,42,0.04)]">
                        <p className="text-sm font-semibold text-[#17362d]">Граматика</p>
                        <p className="mt-2 text-sm leading-6 text-[#587264]">
                          {studyGuide.grammarFocus}
                        </p>
                      </div>
                      
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#17362d]">Ключові фрази</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {studyGuide.keyPhraseItems.map((item) => (
                          <div
                            key={item.phrase}
                            className="rounded-[18px] bg-[rgba(22,49,40,0.08)] px-3 py-2 text-sm leading-6 text-[#355e4c]"
                          >
                            <span className="font-semibold">{item.phrase}</span>
                            {" — "}
                            <span>{item.translation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div> 

                  <div className="space-y-4">
                    <div className="rounded-[22px] bg-[rgba(255,248,228,0.92)] p-4 shadow-[0_12px_28px_rgba(20,56,42,0.04)]">
                      <p className="text-sm font-semibold text-[#17362d]">Модельне речення</p>
                      <p className="mt-2 text-sm leading-6 text-[#587264]">
                        {studyGuide.modelSentence}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-[#587264]">
                        {studyGuide.warmupTask}
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-[rgba(235,247,242,0.92)] p-4 shadow-[0_12px_28px_rgba(20,56,42,0.04)]">
                      <p className="text-sm font-semibold text-[#17362d]">Запам&apos;ятай</p>
                      <p className="mt-2 text-sm leading-6 text-[#587264]">
                        {studyGuide.memoryTip}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#17362d]">Корисні слова</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {studyGuide.glossary.map((item) => (
                          <button
                            key={item.term}
                            type="button"
                            onClick={() =>
                              setSelectedGlossaryTerm((current) =>
                                current === item.term ? null : item.term,
                              )
                            }
                            className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                              selectedGlossaryTerm === item.term
                                ? "bg-[#2f8f5b] text-white"
                                : "bg-[rgba(47,143,91,0.1)] text-[#2f5b49]"
                            }`}
                          >
                            {item.term}
                          </button>
                        ))}
                      </div>
                      {selectedGlossaryTerm ? (
                        <div className="mt-2 rounded-[16px] bg-[rgba(22,49,40,0.06)] px-4 py-3 text-sm leading-6 text-[#355e4c]">
                          <span className="font-semibold">{selectedGlossaryTerm}</span>
                          {" — "}
                          {studyGuide.glossary.find((item) => item.term === selectedGlossaryTerm)
                            ?.translation ?? "Переклад готується."}
                        </div>
                      ) : (
                        <p className="mt-2 text-xs leading-5 text-[#6a8276]">
                          Натисни на слово, щоб побачити переклад українською.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-[24px] p-3.5 sm:p-4">
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-[#2f8f5b]">
        Маршрут уроку
      </p>
      <p className="mt-1 text-sm leading-6 text-[#587264]">
        Проходь кроки послідовно: від слова і перекладу до фінальної перевірки.
      </p>
    </div>

    <div className="rounded-full bg-[rgba(47,143,91,0.1)] px-4 py-2 text-sm font-semibold text-[#2f8f5b]">
      Крок {index + 1} з {lesson.exercises.length}
    </div>
  </div>

  <div className="mt-4 overflow-x-auto pb-2">
    <div className="flex min-w-max gap-2.5">
      {lessonPath.map((step, stepIndex) => (
        <div
          key={step.key}
          className={`relative min-w-[168px] rounded-[18px] px-4 py-3 transition ${
            step.active
              ? "bg-[#163128] text-white shadow-[0_16px_34px_rgba(20,56,42,0.16)]"
              : step.completed
                ? "bg-[rgba(47,143,91,0.12)] text-[#24483a]"
                : "bg-[rgba(22,49,40,0.05)] text-[#4d685b]"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.18em] opacity-75">
              Крок {stepIndex + 1}
            </p>

            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                step.active
                  ? "bg-white text-[#163128]"
                  : step.completed
                    ? "bg-[#2f8f5b] text-white"
                    : "bg-white/80 text-[#6a8276]"
              }`}
            >
              {step.completed ? "✓" : stepIndex + 1}
            </span>
          </div>

          <p className="mt-2 text-sm font-semibold leading-5">
            {step.typeLabel}
          </p>
        </div>
      ))}
    </div>
  </div>
</div>
              <div className="space-y-3">
                {mentorStepOpen && !feedback ? (
                  <div className="glass-panel rounded-[28px] p-5 sm:p-6">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#2f8f5b]">
                      Повідомлення наставника
                    </p>
                    <h3 className="mt-2 text-[2rem] font-semibold text-[#17362d] 2xl:text-[2.25rem]">
                      {currentMentorCard.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#5f786b]">
                      {currentMentorCard.subtitle}
                    </p>
                    <div className="mt-4 grid gap-2.5">
                      {mentorMessages.slice(0, mentorMessageIndex + 1).map((message, messageIndex) => (
                        <div
                          key={`${messageIndex}-${message}`}
                          className={`rounded-[18px] px-4 py-3 text-sm leading-6 ${
                            messageIndex === 0
                              ? "bg-[rgba(47,143,91,0.1)] text-[#24483a]"
                              : "bg-[rgba(22,49,40,0.06)] text-[#355e4c]"
                          }`}
                        >
                          {messageIndex === 0 ? (
                            <>
                              <span className="mr-2 text-lg">{mentorVoice.emoji}</span>
                              {mentorVoice.intro}
                            </>
                          ) : (
                            message
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 rounded-[18px] bg-[rgba(255,248,228,0.9)] px-4 py-3 text-sm leading-6 text-[#5d5a3c]">
                      <span className="font-semibold">Фокус:</span> {currentMentorCard.focus}
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={skipMentorSequence}
                          className="min-w-[210px] rounded-[22px] border border-[rgba(22,49,40,0.12)] bg-white px-6 py-4 text-base font-medium text-[#24483a] shadow-[0_14px_30px_rgba(20,56,42,0.06)] transition hover:bg-[rgba(255,255,255,0.92)]"
                        >
                          Пропустити пояснення
                        </button>
                        <button
                          type="button"
                          onClick={continueMentorSequence}
                          className={`min-w-[132px] rounded-[18px] px-5 py-3 text-[15px] font-semibold text-white shadow-[0_18px_36px_rgba(14,165,233,0.2)] transition ${themeUi.accentButton}`}
                        >
                          {mentorMessageIndex < mentorMessages.length - 1 ? "Далі" : "До вправи"}
                        </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="glass-panel rounded-[28px] p-5 shadow-[0_20px_48px_rgba(20,56,42,0.08)] sm:p-6 2xl:p-7">
                      <div className="mb-3 rounded-[18px] border border-[rgba(22,49,40,0.08)] bg-[rgba(47,143,91,0.08)] px-4 py-3 text-sm leading-6 text-[#24483a]">
                        <span className="mr-2 text-lg">{mentorVoice.emoji}</span>
                        <span className="font-semibold">{currentMentorCard.title}:</span>{" "}
                        {currentMentorCard.focus}
                      </div>
                      <ExerciseCard
                        exercise={exercise}
                        answer={answer}
                        onAnswerChange={handleAnswerChange}
                        sentenceBuilderWords={sentenceBuilderWords}
                        translationHints={exerciseTranslationHints}
                        headerAction={exerciseCardAction}
                      />
                      <div className="mt-3 rounded-[18px] border border-[rgba(22,49,40,0.08)] bg-[rgba(255,253,247,0.92)] px-4 py-3">
                        {feedback ? (
                          <div className="space-y-2">
                            <p className={`text-sm uppercase tracking-[0.18em] ${themeUi.accentText}`}>
                              {feedback.correct ? "Правильно" : "Спробуй ще раз"}
                            </p>
                            <p className="text-sm leading-6 text-[#28473a]">
                              {feedback.correct ? mentorVoice.success : mentorVoice.error}
                            </p>
                            {!feedback.correct ? (
                              <p className="text-sm leading-6 text-[#567062]">{feedback.hint}</p>
                            ) : null}
                            {!feedback.correct ? (
                              <p className="text-sm leading-6 text-[#567062]">
                                Правильна відповідь:{" "}
                                <span className="font-semibold">{feedback.correctAnswer}</span>
                              </p>
                            ) : null}
                            {feedbackTranslation ? (
                              <p className="text-sm leading-6 text-[#567062]">
                                Переклад: <span className="font-semibold">{feedbackTranslation}</span>
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <p className="text-sm leading-6 text-[#587264]">
                            {answer
                              ? "Відповідь готова до перевірки. Кнопка праворуч угорі в шапці цієї картки."
                              : "Виконай вправу, а потім натисни кнопку перевірки праворуч угорі в шапці картки."}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 rounded-[24px] border border-[rgba(22,49,40,0.08)] bg-[rgba(255,253,247,0.92)] px-4 py-4 shadow-[0_12px_28px_rgba(20,56,42,0.08)] sm:px-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={requestLeaveLesson}
                    className="rounded-[22px] border border-[rgba(22,49,40,0.12)] bg-white px-6 py-4 text-center text-base font-medium text-[#24483a] transition hover:bg-[rgba(255,255,255,0.92)]"
                  >
                    Назад до курсу
                  </button>
                  </div>
                </div>
              </div>
          </section>
        </div>
      </section>

      {leavePromptOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,31,25,0.42)] px-4">
          <div className="glass-panel w-full max-w-xl rounded-[32px] p-6 shadow-[0_28px_80px_rgba(20,56,42,0.2)] sm:p-7">
            <p className={`text-xs uppercase tracking-[0.18em] ${themeUi.accentText}`}>
              Підтвердження виходу
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[#17362d] sm:text-[2rem]">
              Перервати урок?
            </h2>
            <p className="mt-4 text-base leading-7 text-[#567062]">
              Якщо вийти зараз, прогрес цього уроку не збережеться. Ви справді хочете повернутися до курсу?
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeLeavePrompt}
                className="rounded-[22px] border border-[rgba(22,49,40,0.12)] bg-white px-6 py-4 text-base font-medium text-[#24483a] transition hover:bg-[rgba(255,255,255,0.92)]"
              >
                Залишитися в уроці
              </button>
              <button
                type="button"
                onClick={confirmLeaveLesson}
                className={`rounded-[22px] px-6 py-4 text-base font-semibold text-white transition ${themeUi.accentButton}`}
              >
                Так, вийти до курсу
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function ExerciseCard({
  exercise,
  answer,
  onAnswerChange,
  sentenceBuilderWords,
  translationHints,
  headerAction,
}: {
  exercise: LessonExercise;
  answer: string;
  onAnswerChange: (value: string) => void;
  sentenceBuilderWords: string[];
  translationHints: ExerciseTranslationHint[];
  headerAction?: ReactNode;
}) {
  const displayedChoices = useMemo(
    () => ("choices" in exercise ? shuffleChoices(exercise.choices) : []),
    [exercise],
  );

  return (
    <div>
      <div className="rounded-[24px] border border-[rgba(22,49,40,0.08)] bg-white/78 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm uppercase tracking-[0.18em] text-[#2f8f5b]">
            {getExerciseTypeLabel(exercise.type)}
          </p>
          {headerAction ?? (
            <span className="rounded-full bg-[rgba(47,143,91,0.1)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2f8f5b]">
              {getExerciseHelperText(exercise.type)}
            </span>
          )}
        </div>
        <h2 className="section-title mt-4 text-2xl font-semibold text-[#17362d] sm:text-3xl lg:text-[2.2rem]">
          {exercise.prompt}
        </h2>
      </div>

      <div className="mt-6">
        {translationHints.length ? (
          <div className="mb-5 rounded-[24px] bg-[rgba(47,143,91,0.08)] p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[#2f8f5b]">
              Швидкий переклад
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {translationHints.map((hint) => (
                <div
                  key={`${hint.term}-${hint.translation}`}
                  className="rounded-[18px] bg-white/82 px-3 py-2 text-sm leading-5 text-[#24483a]"
                >
                  <span className="font-semibold">{hint.term}</span>
                  {" — "}
                  <span>{hint.translation}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {exercise.type === "multiple-choice" ? (
          <div className="grid gap-3 xl:grid-cols-2">
            {displayedChoices.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => onAnswerChange(choice)}
                className={`min-h-[88px] rounded-[24px] border px-5 py-4 text-left text-base font-medium transition ${
                  answer === choice
                    ? "border-[#2f8f5b] bg-[rgba(47,143,91,0.08)] shadow-[0_12px_28px_rgba(43,122,88,0.12)]"
                    : "border-[rgba(22,49,40,0.08)] bg-white hover:bg-[rgba(255,255,255,0.84)]"
                }`}
              >
                {choice}
              </button>
            ))}
          </div>
        ) : null}

        {exercise.type === "matching" ? (
          <div className="space-y-4">
            <div className="rounded-[24px] bg-[rgba(255,255,255,0.8)] p-5 text-base font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] sm:text-lg">
              {exercise.left}
            </div>
            <div className="grid gap-3 xl:grid-cols-2">
              {displayedChoices.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => onAnswerChange(choice)}
                  className={`min-h-[88px] rounded-[24px] border px-5 py-4 text-left text-base font-medium transition ${
                    answer === choice
                      ? "border-[#2f8f5b] bg-[rgba(47,143,91,0.08)] shadow-[0_12px_28px_rgba(43,122,88,0.12)]"
                      : "border-[rgba(22,49,40,0.08)] bg-white hover:bg-[rgba(255,255,255,0.84)]"
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {exercise.type === "word-choice" ? (
          <div className="space-y-4">
            <div className="rounded-[28px] border border-[rgba(22,49,40,0.08)] bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(245,251,247,0.92))] p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[rgba(47,143,91,0.1)] text-3xl">
                  {exercise.visual ?? "📘"}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#2f8f5b]">
                    Слово уроку
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[#17362d]">
                    {exercise.sourceWord}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {displayedChoices.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => onAnswerChange(choice)}
                  className={`min-h-[88px] rounded-[24px] border px-5 py-4 text-left text-base font-medium transition ${
                    answer === choice
                      ? "border-[#2f8f5b] bg-[rgba(47,143,91,0.08)] shadow-[0_12px_28px_rgba(43,122,88,0.12)]"
                      : "border-[rgba(22,49,40,0.08)] bg-white hover:bg-[rgba(255,255,255,0.84)]"
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {exercise.type === "dialogue-choice" ? (
          <div className="grid gap-3 xl:grid-cols-2">
            {displayedChoices.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => onAnswerChange(choice)}
                className={`min-h-[88px] rounded-[24px] border px-5 py-4 text-left text-base font-medium transition ${
                  answer === choice
                    ? "border-[#2f8f5b] bg-[rgba(47,143,91,0.08)] shadow-[0_12px_28px_rgba(43,122,88,0.12)]"
                    : "border-[rgba(22,49,40,0.08)] bg-white hover:bg-[rgba(255,255,255,0.84)]"
                }`}
              >
                {choice}
              </button>
            ))}
          </div>
        ) : null}

        {exercise.type === "sentence-builder" ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {sentenceBuilderWords.map((word) => (
                <button
                  key={word}
                  type="button"
                  onClick={() => onAnswerChange(answer ? `${answer} ${word}` : word)}
                  className="rounded-full border border-[rgba(22,49,40,0.08)] bg-white px-4 py-2 text-sm font-medium transition hover:bg-[rgba(255,255,255,0.84)]"
                >
                  {word}
                </button>
              ))}
            </div>
            {answer ? (
              <div className="rounded-[22px] border border-[rgba(47,143,91,0.14)] bg-[rgba(47,143,91,0.08)] px-4 py-3 text-sm leading-6 text-[#24483a]">
                <span className="font-semibold">Черновик:</span> {answer}
              </div>
            ) : null}
            <textarea
              value={answer}
              onChange={(event) => onAnswerChange(event.target.value)}
              rows={3}
              className="w-full rounded-[24px] border border-[rgba(22,49,40,0.08)] bg-white px-4 py-4 outline-none transition focus:border-[#2f8f5b] focus:ring-4 focus:ring-[rgba(47,143,91,0.08)]"
              placeholder="Склади речення тут"
            />
          </div>
        ) : null}

        {exercise.type === "fill-blank" ? (
          <div className="space-y-4">
            <div className="rounded-[24px] bg-[rgba(255,255,255,0.8)] p-5 text-base font-semibold sm:text-lg">
              {exercise.sentence}
            </div>
            <input
              value={answer}
              onChange={(event) => onAnswerChange(event.target.value)}
              className="w-full rounded-[24px] border border-[rgba(22,49,40,0.08)] bg-white px-4 py-4 outline-none transition focus:border-[#2f8f5b] focus:ring-4 focus:ring-[rgba(47,143,91,0.08)]"
              placeholder="Введи пропущене слово"
            />
          </div>
        ) : null}

        {exercise.type === "translation" ? (
          <div className="space-y-4">
            <div className="rounded-[24px] bg-[rgba(255,255,255,0.8)] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#2f8f5b]">
                Українська фраза
              </p>
              <p className="mt-2 text-base font-semibold text-[#17362d] sm:text-lg">
                {exercise.sourceUk}
              </p>
            </div>
            <textarea
              value={answer}
              onChange={(event) => onAnswerChange(event.target.value)}
              rows={3}
              className="w-full rounded-[24px] border border-[rgba(22,49,40,0.08)] bg-white px-4 py-4 outline-none transition focus:border-[#2f8f5b] focus:ring-4 focus:ring-[rgba(47,143,91,0.08)]"
              placeholder="Введи переклад цільовою мовою"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-[rgba(255,255,255,0.7)] p-4">
      <p className="text-sm uppercase tracking-[0.18em] text-[#2f8f5b]">{label}</p>
      <p className="mt-2 text-xl font-semibold sm:text-2xl">{value}</p>
    </div>
  );
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-[rgba(255,255,255,0.84)] p-5">
      <p className="text-sm uppercase tracking-[0.18em] text-[#2f8f5b]">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function buildMentorCard(
  studyGuide: LessonStudyGuide,
  exercise: LessonExercise,
  index: number,
) {
  const titles = [
    "Починаємо з опори",
    "Розбираємо шаблон",
    "Переходимо до практики",
    "Закріплюємо приклад",
    "Фінальна перевірка",
    "Підсумковий крок",
  ];

  const typeFocus: Record<LessonExercise["type"], string> = {
    "multiple-choice": "Зверни увагу на контекст і обери найприроднішу відповідь.",
    matching: "Зістав слово або фразу з правильним значенням, не поспішай.",
    "sentence-builder": "Склади правильний порядок слів і перевір ритм фрази.",
    "fill-blank": "Пригадай ключове слово або форму й заповни пропуск.",
    "word-choice": "Запам'ятай значення слова і зв'яжи його з українським перекладом.",
    "dialogue-choice": "Обери репліку, яка найкраще працює в живій комунікативній ситуації.",
    translation: "Переклади зміст коротко й природно, без зайвого ускладнення.",
  };

  return {
    title: titles[index] ?? "Наступний крок уроку",
    subtitle: `Крок ${index + 1} зосереджується на темі "${exercise.lessonTopic}".`,
    focus: typeFocus[exercise.type],
    messages: [
      studyGuide.mentorIntro,
      studyGuide.explanationSteps[index % studyGuide.explanationSteps.length] ??
        studyGuide.memoryTip,
      studyGuide.keyPhrases[index % studyGuide.keyPhrases.length] ?? studyGuide.memoryTip,
    ],
  };
}

function getMentorVoice(avatarId: string) {
  switch (avatarId) {
    case "fox":
      return {
        emoji: "🦊",
        intro:
          "Працюємо уважно: спочатку сенс, потім форма. Без паніки, правило зараз розкладемо по поличках.",
        success: "Добре. Це вже схоже на впевнену відповідь.",
        error: "Майже. Подивись на порядок слів і не дай фразі втекти в хащі.",
      };
    case "panda":
      return {
        emoji: "🐼",
        intro:
          "Не поспішай. Спокійно читаємо фразу, дивимося на переклад і тренуємо один маленький крок.",
        success: "Чудово. М’яко, спокійно — і вже є результат.",
        error: "Нічого страшного. Помилка просто показує, що саме треба повторити.",
      };
    case "parrot":
      return {
        emoji: "🦜",
        intro:
          "Полетіли! Зараз беремо одну фразу, один сенс і робимо з цього живу мову.",
        success: "Клас! Це звучить набагато впевненіше.",
        error: "Опа, трохи не туди. Але ми швидко повернемо фразу на маршрут.",
      };
    case "panther":
      return {
        emoji: "🐆",
        intro:
          "Тихо й точно. Дивимося на контекст і обираємо найсильнішу відповідь.",
        success: "Влучно. Саме так працює точна мовна реакція.",
        error: "Зупинись на секунду. Тут важливий не поспіх, а точність.",
      };
    case "flamingo":
      return {
        emoji: "🦩",
        intro:
          "Зробимо це красиво: фраза, переклад, маленький ритм — і можна говорити впевненіше.",
        success: "Гарно! Фраза вже звучить природніше.",
        error: "Не біда. Давай підправимо форму, щоб звучало елегантніше.",
      };
    case "monkey":
      return {
        emoji: "🐒",
        intro:
          "Так, беремо фразу й граємося з нею, поки вона не стане знайомою.",
        success: "Є! Мозок спіймав банан знання.",
        error: "Ха, ця фраза спробувала втекти. Ловимо її ще раз.",
      };
    default:
      return {
        emoji: "🌿",
        intro: "Почнемо з короткого пояснення, а потім перейдемо до практики.",
        success: "Добре. Відповідь зараховано.",
        error: "Спробуй ще раз і зверни увагу на підказку.",
      };
  }
}

function getExerciseTypeLabel(type: LessonExercise["type"]) {
  switch (type) {
    case "multiple-choice":
      return "Вибір відповіді";
    case "matching":
      return "Зіставлення";
    case "sentence-builder":
      return "Конструктор речення";
    case "fill-blank":
      return "Заповни пропуск";
    case "word-choice":
      return "Слово і переклад";
    case "dialogue-choice":
      return "Репліка в діалозі";
    case "translation":
      return "Переклад фрази";
    default:
      return "Вправа";
  }
}

function getExerciseHelperText(type: LessonExercise["type"]) {
  switch (type) {
    case "multiple-choice":
      return "Обери варіант";
    case "matching":
      return "Знайди пару";
    case "sentence-builder":
      return "Склади фразу";
    case "fill-blank":
      return "Допиши слово";
    case "word-choice":
      return "Знайди переклад";
    case "dialogue-choice":
      return "Обери репліку";
    case "translation":
      return "Переклади";
    default:
      return "Вправа";
  }
}

function buildExerciseTranslationHints(
  languageId: DemoLesson["languageId"],
  exercise: LessonExercise,
  studyGuide: LessonStudyGuide,
): ExerciseTranslationHint[] {
  const hints = new Map<string, string>();

  function addTerm(term: string) {
    const trimmedTerm = term.trim();
    if (!trimmedTerm || hints.has(trimmedTerm)) return;

    const translation = getLessonTermTranslation(languageId, trimmedTerm);
    if (!translation) return;

    hints.set(trimmedTerm, translation);
  }

  if (exercise.type !== "word-choice" && exercise.type !== "translation") {
    addTerm(exercise.correctAnswer);
  }

  switch (exercise.type) {
    case "multiple-choice":
      exercise.choices.forEach(addTerm);
      break;
    case "matching":
      addTerm(exercise.left);
      exercise.choices.forEach(addTerm);
      break;
    case "sentence-builder":
      exercise.words.forEach(addTerm);
      break;
    case "fill-blank":
      addTerm(exercise.correctAnswer);
      break;
    case "word-choice":
      addTerm(exercise.sourceWord);
      exercise.choices.forEach(addTerm);
      break;
    case "dialogue-choice":
      exercise.choices.forEach(addTerm);
      break;
    case "translation":
      addTerm(exercise.correctAnswer);
      break;
    default:
      break;
  }

  if (hints.size < 4) {
    studyGuide.glossary.slice(0, 6).forEach((item) => {
      if (!hints.has(item.term)) {
        hints.set(item.term, item.translation);
      }
    });
  }

  return Array.from(hints.entries())
    .map(([term, translation]) => ({ term, translation }))
    .slice(0, 8);
}

function shuffleChoices(choices: string[]) {
  const copy = [...choices];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}
