"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BrandLogo } from "@/components/branding/BrandLogo";
import { SupabaseGoogleButton } from "@/components/supabase/SupabaseGoogleButton";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import {
  avatarOptions,
  goalOptions,
  languageOptions,
  levelOptions,
} from "@/lib/onboarding-data";
import {
  saveStoredOnboardingState,
  useStoredOnboardingState,
} from "@/lib/onboarding-storage";
import {
  getPlacementQuestions,
  getRecommendedLevel,
  type PlacementQuestion,
} from "@/lib/placement-data";
import { upsertStoredProfile } from "@/lib/profile-storage";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { syncProfileSelection } from "@/lib/supabase/profile-sync";
import { cn } from "@/lib/utils";

type StepId =
  | "welcome"
  | "auth"
  | "name"
  | "avatar"
  | "language"
  | "goal"
  | "level"
  | "placement";

const steps: { id: StepId; label: string }[] = [
  { id: "welcome", label: "Старт" },
  { id: "auth", label: "Вхід" },
  { id: "name", label: "Ім'я" },
  { id: "avatar", label: "Аватар" },
  { id: "language", label: "Мова" },
  { id: "goal", label: "Ціль" },
  { id: "level", label: "Рівень" },
  { id: "placement", label: "Тест" },
];

type ChoiceVariant = "avatar" | "language" | "goal" | "level";

type ChoiceItem = {
  id: string;
  title: string;
  subtitle: string;
  body?: string;
  accent: string;
  selected: boolean;
  onSelect: () => void;
  imagePosition?: string;
  imageSrc?: string;
  sticker?: string;
  stickerSrc?: string;
  badge?: string;
};

export function OnboardingFlow({
  returnTo = null,
}: {
  returnTo?: null | string;
}) {
  const router = useRouter();
  const state = useStoredOnboardingState();
  const supabaseUser = useSupabaseUser();
  const [stepIndex, setStepIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

  const currentStep = steps[stepIndex].id;

  const selectedLanguage = useMemo(
    () => languageOptions.find((item) => item.id === state.languageId) ?? null,
    [state.languageId],
  );
  const selectedGoal = useMemo(
    () => goalOptions.find((item) => item.id === state.goalId) ?? null,
    [state.goalId],
  );
  const selectedAvatar = useMemo(
    () => avatarOptions.find((item) => item.id === state.avatarId) ?? null,
    [state.avatarId],
  );
  const selectedLevel = useMemo(
    () => levelOptions.find((item) => item.id === state.levelId) ?? null,
    [state.levelId],
  );
  const recommendedLevel = useMemo(
    () => levelOptions.find((item) => item.id === state.recommendedLevelId) ?? null,
    [state.recommendedLevelId],
  );
  const placementQuestions = useMemo(
    () => getPlacementQuestions(state.languageId ?? "english"),
    [state.languageId],
  );

  const currentQuestion = placementQuestions[quizIndex] ?? null;
  const quizScore = useMemo(() => {
    const correct = placementQuestions.filter(
      (question) => quizAnswers[question.id] === question.correctAnswer,
    ).length;
    return Math.round((correct / placementQuestions.length) * 100);
  }, [placementQuestions, quizAnswers]);

  const updateState = useCallback(
    (partial: Partial<typeof state>) => {
      saveStoredOnboardingState({
        ...state,
        ...partial,
      });
    },
    [state],
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();

    void supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(Boolean(data.session?.user));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user));
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!(selectedLanguage && selectedGoal && selectedAvatar && selectedLevel)) return;

    void syncProfileSelection({
      displayName: state.learnerName,
      languageId: selectedLanguage.id,
      goalId: selectedGoal.id,
      avatarId: selectedAvatar.id,
      selectedLevelId: selectedLevel.id,
      recommendedLevelId: state.recommendedLevelId,
      placementCompleted: state.placementCompleted,
    });
  }, [
    selectedAvatar,
    selectedGoal,
    selectedLanguage,
    selectedLevel,
    state.learnerName,
    state.placementCompleted,
    state.recommendedLevelId,
  ]);

  useEffect(() => {
    if (!supabaseUser || state.learnerName.trim()) return;

    updateState({
      learnerName: supabaseUser.displayName,
    });
  }, [state.learnerName, supabaseUser, updateState]);

  const canContinue =
    currentStep === "welcome" ||
    (currentStep === "auth" && isAuthenticated) ||
    (currentStep === "name" && state.learnerName.trim().length >= 2) ||
    (currentStep === "avatar" && Boolean(state.avatarId)) ||
    (currentStep === "language" && Boolean(state.languageId)) ||
    (currentStep === "goal" && Boolean(state.goalId)) ||
    (currentStep === "level" && Boolean(state.levelId)) ||
    (currentStep === "placement" &&
      Boolean(state.levelId) &&
      (state.placementSkipped || state.placementCompleted));

  const continueLabel =
    currentStep === "welcome"
      ? "Почати"
      : currentStep === "placement"
        ? "Відкрити курс"
        : "Далі";

  const backHref = returnTo ?? "/";
  const isAtFirstStep = stepIndex === 0;

  function nextStep() {
    if (!canContinue) return;

    if (currentStep === "placement" && selectedLanguage && selectedGoal && selectedAvatar) {
      const selectedLevelId = state.recommendedLevelId ?? state.levelId ?? "A1";

      upsertStoredProfile({
        learnerName: state.learnerName.trim() || supabaseUser?.displayName || "Learner",
        languageId: selectedLanguage.id,
        goalId: selectedGoal.id,
        avatarId: selectedAvatar.id,
        selectedLevelId,
        recommendedLevelId: state.recommendedLevelId,
        placementCompleted: state.placementCompleted,
      });

      void syncProfileSelection({
        displayName: state.learnerName.trim() || supabaseUser?.displayName || "Learner",
        languageId: selectedLanguage.id,
        goalId: selectedGoal.id,
        avatarId: selectedAvatar.id,
        selectedLevelId,
        recommendedLevelId: state.recommendedLevelId,
        placementCompleted: state.placementCompleted,
      });

      const params = new URLSearchParams({
        language: selectedLanguage.id,
        goal: selectedGoal.id,
        avatar: selectedAvatar.id,
        level: selectedLevelId,
      });
      router.push(`/course?${params.toString()}`);
      return;
    }

    setStepIndex((index) => Math.min(index + 1, steps.length - 1));
  }

  function prevStep() {
    if (currentStep === "placement" && quizStarted) {
      setQuizStarted(false);
      setQuizIndex(0);
      setQuizAnswers({});
      return;
    }

    if (isAtFirstStep) {
      router.push(backHref);
      return;
    }

    setStepIndex((index) => Math.max(index - 1, 0));
  }

  function startPlacement() {
    setQuizStarted(true);
    setQuizIndex(0);
    setQuizAnswers({});
    updateState({
      placementCompleted: false,
      placementSkipped: false,
      recommendedLevelId: null,
    });
  }

  function skipPlacement() {
    updateState({
      placementCompleted: false,
      placementSkipped: true,
      recommendedLevelId: null,
    });
    setQuizStarted(false);
  }

  function answerPlacement(choice: string) {
    if (!currentQuestion) return;

    const nextAnswers = {
      ...quizAnswers,
      [currentQuestion.id]: choice,
    };
    setQuizAnswers(nextAnswers);

    if (quizIndex === placementQuestions.length - 1) {
      const correct = placementQuestions.filter((question) => {
        const answer =
          question.id === currentQuestion.id ? choice : nextAnswers[question.id];
        return answer === question.correctAnswer;
      }).length;
      const percent = Math.round((correct / placementQuestions.length) * 100);
      const recommended = getRecommendedLevel(percent);

      updateState({
        recommendedLevelId: recommended,
        placementCompleted: true,
        placementSkipped: false,
      });
      setQuizStarted(false);
      return;
    }

    setQuizIndex((value) => value + 1);
  }

  return (
    <main className="app-shell">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-10 h-56 w-56 rounded-full bg-[rgba(158,219,77,0.22)] blur-3xl" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[rgba(46,196,182,0.14)] blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[1440px] flex-col gap-4">
        <header className="glass-header flex flex-col gap-3 rounded-[26px] px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
          <Link
            href="/"
            className="flex min-w-0 items-center rounded-[20px] transition hover:opacity-92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f8f5b]/45"
          >
            <BrandLogo
              subtitle="Твій навчальний шлях"
              imageClassName="h-12 w-[132px]"
              titleClassName="text-[#17362d]"
              subtitleClassName="text-[#2f8f5b]"
            />
          </Link>

          <div className="-mx-1 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-1 xl:mx-0 xl:flex-wrap xl:justify-end xl:overflow-visible xl:px-0 xl:pb-0">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-[14px] font-medium transition",
                  index === stepIndex
                    ? "bg-[#163128] text-white"
                    : index < stepIndex
                      ? "bg-[rgba(47,143,91,0.16)] text-[#2f8f5b]"
                      : "bg-[rgba(255,255,255,0.76)] text-[#547264]",
                )}
              >
                {step.label}
              </div>
            ))}
          </div>
        </header>

        <section className="glass-panel rounded-[24px] px-4 py-4 xl:px-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-[72rem]">
              <p className="section-kicker">Створення профілю</p>
              <h2 className="section-title mt-1.5 max-w-[16ch] text-[1.8rem] font-semibold text-[#17362d] sm:text-[2.2rem] xl:max-w-[18ch] xl:text-[2.8rem]">
                Налаштуй курс під себе перед першим уроком.
              </h2>
              <p className="muted-copy mt-2 max-w-4xl text-[13px] leading-5 sm:text-[14px] sm:leading-5">
                Обери наставника, мову, навчальну ціль і стартовий рівень. Після цього відкриється
                готовий маршрут з уроками, прогресом і перевіркою рівня.
              </p>
            </div>

            <div className="rounded-[18px] bg-[#163128] px-3.5 py-2.5 text-white shadow-[0_20px_60px_rgba(22,49,40,0.2)]">
              <p className="text-xs uppercase tracking-[0.18em] text-white/68">
                Крок {stepIndex + 1} з {steps.length}
              </p>
              <p className="mt-1 text-[1.45rem] font-semibold">{steps[stepIndex].label}</p>
            </div>
          </div>

          <div className="mt-3 h-2 rounded-full bg-[rgba(22,49,40,0.08)]">
            <div
              className="h-2 rounded-full bg-[linear-gradient(90deg,#2b7a58_0%,#9ecf58_100%)]"
              style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </section>

        <section className="glass-panel rounded-[24px] p-3.5 sm:p-4 xl:p-5">
          {currentStep !== "welcome" && currentStep !== "auth" ? (
            <SelectionRibbon
              avatar={selectedAvatar?.name ?? "Наставник"}
              language={selectedLanguage?.label ?? "Мова"}
              goal={selectedGoal?.label ?? "Ціль"}
              level={recommendedLevel?.id ?? selectedLevel?.id ?? "Рівень"}
              placementStatus={
                state.placementCompleted
                  ? "Тест пройдено"
                  : state.placementSkipped
                    ? "Тест пропущено"
                    : "Тест попереду"
              }
            />
          ) : null}

            <div className={cn(currentStep !== "welcome" && currentStep !== "auth" ? "mt-5" : "")}>
            {currentStep === "welcome" && <WelcomeStep />}
            {currentStep === "auth" && (
              <AuthStep isAuthenticated={isAuthenticated} user={supabaseUser} />
            )}
            {currentStep === "name" && (
              <NameStep
                learnerName={state.learnerName}
                googleName={supabaseUser?.displayName ?? null}
                googleAvatarUrl={supabaseUser?.avatarUrl ?? null}
                onNameChange={(value) => updateState({ learnerName: value })}
              />
            )}
            {currentStep === "avatar" && (
              <ChoiceGrid
                variant="avatar"
                title="Обери аватара-наставника"
                description="Аватар супроводжує тебе в уроках, підказує після помилок і задає тон усьому навчанню."
                items={avatarOptions.filter((item) => item.starter !== false).map((item) => ({
                  id: item.id,
                  title: item.name,
                  subtitle: item.role,
                  accent: item.accent,
                  imagePosition: item.imagePosition,
                  imageSrc: item.imageSrc,
                  selected: state.avatarId === item.id,
                  onSelect: () => updateState({ avatarId: item.id }),
                }))}
              />
            )}
            {currentStep === "language" && (
              <ChoiceGrid
                variant="language"
                title="Обери мову"
                description="Почни з однієї основної мови, а потім за бажанням додаси ще один курс окремо."
                items={languageOptions.map((item) => ({
                  id: item.id,
                  title: item.label,
                  subtitle: item.nativeLabel,
                  body: item.description,
                  accent: item.accent,
                  stickerSrc:
                    item.id === "english"
                      ? "/images/stickers/flag-uk.svg"
                      : "/images/stickers/flag-fr.svg",
                  selected: state.languageId === item.id,
                  onSelect: () => updateState({ languageId: item.id }),
                }))}
              />
            )}
            {currentStep === "goal" && (
              <ChoiceGrid
                variant="goal"
                title="Яка твоя навчальна ціль?"
                description="Це вплине на словник, теми модулів і приклади, з якими працюватиме курс."
                items={goalOptions.map((item) => ({
                  id: item.id,
                  title: item.label,
                  subtitle: "Персоналізований фокус",
                  body: `${item.description} ${item.example}`,
                  accent: "from-[#2ec4b6]/20 to-[#ffc93c]/35",
                  stickerSrc: getGoalStickerSrc(item.id),
                  selected: state.goalId === item.id,
                  onSelect: () => updateState({ goalId: item.id }),
                }))}
              />
            )}
            {currentStep === "level" && (
              <ChoiceGrid
                variant="level"
                title="Обери стартовий рівень"
                description="Можна вказати рівень вручну, а потім підтвердити його коротким тестом на наступному кроці."
                items={levelOptions.map((item) => ({
                  id: item.id,
                  title: item.title,
                  subtitle: item.description,
                  body: `Фокус: ${item.focus}`,
                  accent: item.accent,
                  badge: item.id,
                  selected: state.levelId === item.id,
                  onSelect: () =>
                    updateState({
                      levelId: item.id,
                      recommendedLevelId: null,
                      placementCompleted: false,
                      placementSkipped: false,
                    }),
                }))}
              />
            )}
            {currentStep === "placement" && (
              <PlacementStep
                quizStarted={quizStarted}
                quizIndex={quizIndex}
                totalQuestions={placementQuestions.length}
                quizScore={quizScore}
                currentQuestion={currentQuestion}
                answers={quizAnswers}
                selectedLevel={selectedLevel}
                recommendedLevel={recommendedLevel}
                placementCompleted={state.placementCompleted}
                placementSkipped={state.placementSkipped}
                onStart={startPlacement}
                onSkip={skipPlacement}
                onAnswer={answerPlacement}
              />
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={prevStep}
              className="rounded-full border border-[rgba(22,49,40,0.12)] bg-[rgba(255,255,255,0.82)] px-4 py-2.5 text-[15px] font-medium text-[#355e4c] transition hover:bg-white"
            >
              {isAtFirstStep ? "Назад до курсу" : "Назад"}
            </button>

            <button
              type="button"
              onClick={nextStep}
              disabled={!canContinue || (currentStep === "placement" && quizStarted)}
              className="w-full rounded-full bg-[#2f8f5b] px-5 py-2.5 text-[15px] font-semibold text-white shadow-[0_16px_40px_rgba(47,143,91,0.28)] transition hover:bg-[#25764b] disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
            >
              {continueLabel}
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

function WelcomeStep() {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-[1.06fr_0.94fr]">
        <article className="hero-card relative overflow-hidden rounded-[28px] p-5 text-white sm:p-6">
          <div className="absolute bottom-0 right-0 h-28 w-28 rounded-full bg-white/10 blur-3xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">Старт</p>
          <h2 className="mt-3 max-w-[11ch] text-[2.6rem] font-semibold leading-[0.95] sm:text-[3.25rem] xl:text-[4rem]">
            Почни свій шлях у Lingo Jungle.
          </h2>
          <p className="mt-4 max-w-xl text-[14px] leading-6 text-white/82 sm:text-[15px]">
            За кілька кроків ти збереш профіль, обереш наставника, мову, ціль і стартовий
            рівень. Після цього відкриється повноцінний курс із уроками та прогресом.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["1", "Наставник", "Персонаж супроводжує тебе у вправах."],
              ["2", "Мова й ціль", "Курс підлаштується під подорожі, роботу або фільми."],
              ["3", "Рівень і тест", "Можна підтвердити старт короткою перевіркою."],
            ].map(([step, title, text]) => (
              <div key={title} className="rounded-[20px] bg-white/10 p-3.5 backdrop-blur-sm">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/18 text-[13px] font-semibold">
                  {step}
                </span>
                <h3 className="mt-3 text-[1rem] font-semibold">{title}</h3>
                <p className="mt-1.5 text-[13px] leading-5 text-white/76">{text}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-[rgba(22,49,40,0.08)] bg-[rgba(255,255,255,0.84)] p-5 sm:p-6">
          <p className="section-kicker">Що отримаєш після старту</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ["Маршрут CEFR", "Модулі відкриваються послідовно від A1 до потрібного треку."],
              ["Наставник", "Кожен персонаж має свій тон пояснення та підтримки."],
              ["Реальний прогрес", "Зберігаються уроки, монети, серія та тижнева ціль."],
              ["Тест рівня", "Окремий крок наприкінці. Його можна пройти або пропустити."],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-[20px] border border-[rgba(22,49,40,0.08)] bg-white px-4 py-3.5 shadow-[0_14px_30px_rgba(23,54,45,0.05)]"
              >
                <h3 className="text-[15px] font-semibold text-[#17362d]">{title}</h3>
                <p className="mt-1.5 text-[13px] leading-5 text-[#577266]">{text}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function AuthStep({
  isAuthenticated,
  user,
}: {
  isAuthenticated: boolean;
  user: { displayName: string; avatarUrl: string | null; email: string | null } | null;
}) {
  return (
    <div className="mx-auto grid w-full max-w-[1180px] gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <article className="hero-card rounded-[36px] p-8 text-white sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">Вхід</p>
        <h2 className="mt-4 max-w-[10ch] text-4xl font-semibold leading-[0.95] sm:text-5xl">
          Увійди перед створенням профілю.
        </h2>
        <p className="mt-5 max-w-md text-sm leading-7 text-white/82 sm:text-base">
          Акаунт збереже мову, ціль, стартовий рівень, прогрес уроків, монети та покупки після
          оновлення сторінки або повторного входу.
        </p>

        <ul className="mt-8 space-y-3 text-sm leading-6 text-white/84">
          <li>Прогрес і серія синхронізуються з профілем.</li>
          <li>Після входу відкриється повний онбординг без втрати вибору.</li>
          <li>Курс залишиться з тобою і на іншому пристрої.</li>
        </ul>
      </article>

      <article className="rounded-[36px] border border-[rgba(22,49,40,0.08)] bg-white p-8 shadow-[0_20px_50px_rgba(23,54,45,0.06)] sm:p-10">
        <p className="section-kicker">Google Sign In</p>
        <h3 className="section-title mt-3 text-3xl font-semibold text-[#17362d] sm:text-4xl">
          Підключи акаунт перед стартом навчання.
        </h3>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[#5f786d] sm:text-base">
          Увійди через Google, щоб зберігати вибір мови, цілі, стартового рівня та прогрес уроків.
        </p>

        <div className="mt-8 rounded-[30px] border border-[rgba(22,49,40,0.08)] bg-[rgba(248,250,247,0.9)] p-6">
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#2f8f5b]">
            Акаунт Google
          </label>
          <div className="mt-4">
            <SupabaseGoogleButton />
          </div>
          {isAuthenticated && user ? (
            <div className="mt-5 flex items-center gap-4 rounded-[22px] border border-[rgba(47,143,91,0.12)] bg-white px-4 py-4">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf6ea] text-lg font-semibold text-[#2f8f5b]">
                  {user.displayName.slice(0, 1)}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm uppercase tracking-[0.16em] text-[#2f8f5b]">Ти в акаунті</p>
                <p className="truncate text-lg font-semibold text-[#17362d]">{user.displayName}</p>
                <p className="truncate text-sm text-[#5f786d]">{user.email ?? "Google account"}</p>
              </div>
            </div>
          ) : null}
          <p className="mt-4 text-sm leading-6 text-[#5f786d]">
            {isAuthenticated
              ? "Google-акаунт підключено. Можна переходити до вибору наставника."
              : "Після успішного входу кнопка продовження стане активною автоматично."}
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border border-[rgba(22,49,40,0.08)] bg-[rgba(255,255,255,0.88)] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2f8f5b]">
              Збережеться
            </p>
            <p className="mt-2 text-sm leading-6 text-[#5f786d]">
              Рівень, ціль, прогрес уроків, inventory і тема інтерфейсу.
            </p>
          </div>
          <div className="rounded-[24px] border border-[rgba(22,49,40,0.08)] bg-[rgba(255,255,255,0.88)] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2f8f5b]">
              Після входу
            </p>
            <p className="mt-2 text-sm leading-6 text-[#5f786d]">
              Одразу відкриється повний онбординг з наставником, мовою, ціллю та тестом рівня.
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}

function NameStep({
  learnerName,
  googleName,
  googleAvatarUrl,
  onNameChange,
}: {
  learnerName: string;
  googleName: string | null;
  googleAvatarUrl: string | null;
  onNameChange: (value: string) => void;
}) {
  return (
    <div className="mx-auto grid w-full max-w-[1160px] gap-6 xl:grid-cols-[0.88fr_1.12fr]">
      <article className="rounded-[34px] border border-[rgba(22,49,40,0.08)] bg-[linear-gradient(180deg,#fffdf8_0%,#f7f2df_100%)] p-8 sm:p-10">
        <p className="section-kicker">Профіль</p>
        <h2 className="section-title mt-3 text-3xl font-semibold text-[#17362d] sm:text-5xl">
          Як тебе називати в курсі?
        </h2>
        <p className="mt-4 max-w-md text-sm leading-7 text-[#5a7368] sm:text-base">
          Це ім&apos;я з&apos;явиться в привітанні, у профілі та на старті курсу. Можеш лишити
          Google-ім&apos;я або ввести своє.
        </p>

        <div className="mt-8 rounded-[26px] bg-white/92 p-5 shadow-[0_14px_30px_rgba(23,54,45,0.05)]">
          <p className="text-sm font-semibold text-[#17362d]">Порада</p>
          <p className="mt-2 text-sm leading-6 text-[#5a7368]">
            Використай коротке ім&apos;я, яке приємно бачити у привітанні та під час навчання.
          </p>
        </div>
      </article>

      <article className="rounded-[34px] border border-[rgba(22,49,40,0.08)] bg-white p-8 shadow-[0_20px_50px_rgba(23,54,45,0.06)] sm:p-10">
        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#2f8f5b]">
          Ім&apos;я учня
        </label>
        <input
          value={learnerName}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Наприклад, Анна"
          className="mt-4 h-16 w-full rounded-[24px] border border-[rgba(22,49,40,0.1)] bg-[rgba(248,250,247,0.95)] px-5 text-xl font-semibold text-[#17362d] outline-none transition focus:border-[#2f8f5b] focus:ring-4 focus:ring-[rgba(47,143,91,0.12)]"
        />

        <div className="mt-6 rounded-[28px] border border-[rgba(22,49,40,0.08)] bg-[rgba(248,250,247,0.88)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2f8f5b]">
            Прев&apos;ю профілю
          </p>
          <div className="mt-4 flex items-center gap-4">
            {googleAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={googleAvatarUrl}
                alt={learnerName || googleName || "User"}
                className="h-[60px] w-[60px] rounded-full object-cover"
              />
            ) : (
              <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#eaf6ea] text-xl font-semibold text-[#2f8f5b]">
                {(learnerName || googleName || "L").slice(0, 1)}
              </div>
            )}
            <div>
              <p className="text-xl font-semibold text-[#17362d]">
                {learnerName.trim() || googleName || "Твоє ім'я"}
              </p>
              <p className="mt-1 text-sm text-[#5f786d]">
                Саме так курс буде звертатися до тебе далі.
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

function PlacementStep({
  quizStarted,
  quizIndex,
  totalQuestions,
  quizScore,
  currentQuestion,
  answers,
  selectedLevel,
  recommendedLevel,
  placementCompleted,
  placementSkipped,
  onStart,
  onSkip,
  onAnswer,
}: {
  quizStarted: boolean;
  quizIndex: number;
  totalQuestions: number;
  quizScore: number;
  currentQuestion: PlacementQuestion | null;
  answers: Record<string, string>;
  selectedLevel: (typeof levelOptions)[number] | null;
  recommendedLevel: (typeof levelOptions)[number] | null;
  placementCompleted: boolean;
  placementSkipped: boolean;
  onStart: () => void;
  onSkip: () => void;
  onAnswer: (choice: string) => void;
}) {
  if (!quizStarted && placementCompleted) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-[#2f8f5b]">Результат тесту</p>
          <h2 className="section-title mt-3 text-2xl font-semibold leading-tight sm:text-4xl">
            Рекомендований рівень: {recommendedLevel?.title ?? "A1 Початковий"}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#557063] sm:text-lg sm:leading-8">
            Твій результат: {quizScore}%. Можеш використати цю рекомендацію як стартову точку або
            залишитися на обраному рівні.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-[28px] border border-[rgba(22,49,40,0.08)] bg-white p-5 shadow-[0_18px_50px_rgba(38,78,57,0.08)]">
            <p className="text-sm uppercase tracking-[0.18em] text-[#2f8f5b]">Результат</p>
            <h3 className="mt-3 text-3xl font-semibold sm:text-4xl">{quizScore}%</h3>
            <div className="mt-4 h-3 rounded-full bg-[rgba(22,49,40,0.08)]">
              <div className="h-3 rounded-full bg-[#2f8f5b]" style={{ width: `${quizScore}%` }} />
            </div>
          </article>

          <article className="rounded-[28px] border border-[rgba(22,49,40,0.08)] bg-[rgba(255,255,255,0.82)] p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-[#2f8f5b]">Порівняння</p>
            <p className="mt-3 text-sm leading-6 text-[#577266]">
              Обраний рівень: {selectedLevel?.title ?? "Ще не задано"}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#577266]">
              Рекомендований рівень: {recommendedLevel?.title ?? "A1 Початковий"}
            </p>
          </article>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-[#2f8f5b]">Перевірка рівня</p>
          <h2 className="section-title mt-3 text-2xl font-semibold leading-tight sm:text-4xl">
            Підтвердь стартовий рівень або пропусти цей крок.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#557063] sm:text-lg sm:leading-8">
            Тест не обов&apos;язковий. Він допомагає швидко зрозуміти, з якого рівня краще почати
            курс, і лишається окремим фінальним кроком онбордингу.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <button
            type="button"
            onClick={onStart}
            className="rounded-[28px] border border-[rgba(22,49,40,0.08)] bg-white p-6 text-left shadow-[0_20px_55px_rgba(38,78,57,0.08)] transition hover:bg-[rgba(255,255,255,0.94)]"
          >
            <p className="text-sm uppercase tracking-[0.18em] text-[#2f8f5b]">Варіант 1</p>
            <h3 className="mt-2 text-2xl font-semibold">Пройти тест</h3>
            <p className="mt-3 text-sm leading-6 text-[#577266]">
              Коротка перевірка рівня перед стартом курсу. Питання підбираються під англійську або
              французьку.
            </p>
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="rounded-[28px] border border-[rgba(22,49,40,0.08)] bg-[rgba(255,255,255,0.76)] p-6 text-left transition hover:bg-white"
          >
            <p className="text-sm uppercase tracking-[0.18em] text-[#2f8f5b]">Варіант 2</p>
            <h3 className="mt-2 text-2xl font-semibold">Пропустити поки що</h3>
            <p className="mt-3 text-sm leading-6 text-[#577266]">
              Залишити обраний рівень і перейти одразу до курсу. Тест можна пройти пізніше.
            </p>
          </button>
        </div>

        {placementSkipped ? (
          <div className="rounded-[24px] bg-[rgba(255,255,255,0.78)] px-5 py-4 text-sm leading-6 text-[#355e4c]">
            Перевірку рівня пропущено. Курс відкриється з рівня, який ти обрала вручну.
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-[#2f8f5b]">Тест визначення рівня</p>
        <h2 className="section-title mt-3 text-2xl font-semibold leading-tight sm:text-4xl">
          Питання {quizIndex + 1} з {totalQuestions}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#557063] sm:text-lg sm:leading-8">
          Обери найкращу відповідь. Це швидкий крок, який займає лише кілька хвилин.
        </p>
      </div>

      {currentQuestion ? (
        <div className="space-y-5">
          <div className="rounded-[28px] border border-[rgba(22,49,40,0.08)] bg-white p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-[#2f8f5b]">
              {currentQuestion.levelBand} / {currentQuestion.topic}
            </p>
            <h3 className="mt-2 text-2xl font-semibold">{currentQuestion.prompt}</h3>
          </div>

          <div className="grid gap-3">
            {currentQuestion.choices.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => onAnswer(choice)}
                className={cn(
                  "rounded-[24px] border px-4 py-4 text-left transition",
                  answers[currentQuestion.id] === choice
                    ? "border-[#2f8f5b] bg-[rgba(47,143,91,0.08)]"
                    : "border-[rgba(22,49,40,0.08)] bg-white hover:bg-[rgba(255,255,255,0.94)]",
                )}
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ChoiceGrid({
  title,
  description,
  items,
  variant,
}: {
  title: string;
  description: string;
  items: ChoiceItem[];
  variant: ChoiceVariant;
}) {
  const listClassName =
    variant === "avatar"
      ? "grid gap-3 2xl:grid-cols-3"
      : variant === "goal"
        ? "grid gap-3 xl:grid-cols-2"
        : "grid gap-3 xl:grid-cols-2";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a9d90]">
            Налаштування
          </p>
          <h2 className="section-title mt-2 text-[2rem] font-semibold leading-tight text-[#17362d] sm:text-[2.7rem]">
            {title}
          </h2>
          <p className="mt-2.5 max-w-3xl text-[14px] leading-6 text-[#5a7368] sm:text-[15px]">
            {description}
          </p>
        </div>

        <div className="rounded-[20px] border border-[rgba(22,49,40,0.08)] bg-[rgba(255,255,255,0.86)] px-4 py-3 shadow-[0_14px_30px_rgba(23,54,45,0.05)]">
          <p className="text-sm font-semibold text-[#17362d]">Порада</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-[#5a7368]">
            Обирай той варіант, який найближчий до твого реального сценарію навчання.
          </p>
        </div>
      </div>

      <div className={listClassName}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onSelect}
            className={cn(
              "group flex h-full w-full rounded-[24px] border p-4 text-left transition duration-200",
              variant === "avatar" ? "flex-col items-start gap-4" : "items-center gap-4",
              item.selected
                ? "border-[#2f8f5b] bg-white shadow-[0_24px_60px_rgba(47,143,91,0.16)]"
                : "border-[rgba(22,49,40,0.08)] bg-[rgba(255,255,255,0.78)] hover:bg-white",
            )}
          >
            <ChoiceVisual item={item} variant={variant} />

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-[1.15rem] font-semibold leading-tight text-[#17362d]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[1rem] leading-6 text-[#2f8f5b]">{item.subtitle}</p>
                </div>
                <span
                  className={cn(
                    "mt-1 h-5 w-5 rounded-full border-2 shrink-0",
                    item.selected
                      ? "border-[#2f8f5b] bg-[#2f8f5b] shadow-[inset_0_0_0_4px_white]"
                      : "border-[#c8d4cd] bg-white",
                  )}
                />
              </div>
              {item.body ? (
                <p className="mt-2.5 max-w-3xl text-[14px] leading-7 text-[#577266]">{item.body}</p>
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChoiceVisual({
  item,
  variant,
}: {
  item: ChoiceItem;
  variant: ChoiceVariant;
}) {
  if (variant === "avatar" && item.imageSrc) {
    return (
      <div className="relative mx-auto flex h-32 w-full max-w-[150px] shrink-0 items-end justify-center overflow-hidden rounded-[22px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(239,247,237,0.9))]">
        <Image
          src={item.imageSrc}
          alt={item.title}
          fill
          sizes="180px"
          className="object-contain px-2 pb-2 drop-shadow-[0_14px_22px_rgba(18,53,42,0.16)]"
          style={{ objectPosition: item.imagePosition ?? "center bottom" }}
        />
      </div>
    );
  }

  if (item.stickerSrc) {
    return (
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-white shadow-[inset_0_12px_24px_rgba(255,255,255,0.24)]">
        <Image src={item.stickerSrc} alt="" fill sizes="64px" className="object-contain p-3.5" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] text-[1.75rem] shadow-[inset_0_12px_24px_rgba(255,255,255,0.24)]",
        variant === "level"
          ? `bg-gradient-to-br ${item.accent} text-[#17362d]`
          : `bg-gradient-to-br ${item.accent}`,
      )}
    >
      {variant === "level" ? (
        <span className="text-[1.6rem] font-semibold">{item.badge}</span>
      ) : (
        <span className="translate-y-[1px]">{item.sticker}</span>
      )}
    </div>
  );
}

function SelectionRibbon({
  avatar,
  language,
  goal,
  level,
  placementStatus,
}: {
  avatar: string;
  language: string;
  goal: string;
  level: string;
  placementStatus: string;
}) {
  return (
    <div className="grid gap-2.5 xl:grid-cols-5">
      {[
        ["Наставник", avatar],
        ["Мова", language],
        ["Ціль", goal],
        ["Рівень", level],
        ["Тест", placementStatus],
      ].map(([label, value]) => (
        <article
          key={label}
          className="rounded-[18px] border border-[rgba(22,49,40,0.08)] bg-[rgba(255,255,255,0.82)] px-3.5 py-2.5 shadow-[0_12px_26px_rgba(23,54,45,0.05)]"
        >
          <p className="text-xs uppercase tracking-[0.18em] text-[#2f8f5b]">{label}</p>
          <p className="mt-1.5 text-[15px] font-semibold text-[#17362d]">{value}</p>
        </article>
      ))}
    </div>
  );
}

function getGoalStickerSrc(goalId: string) {
  switch (goalId) {
    case "travel":
      return "/images/stickers/goal-travel.svg";
    case "work":
      return "/images/stickers/goal-work.svg";
    case "movies":
      return "/images/stickers/goal-movies.svg";
    default:
      return "/images/stickers/goal-general.svg";
  }
}
