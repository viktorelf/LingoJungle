"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { MentorAvatar } from "@/components/avatar/MentorAvatar";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { useClientReady } from "@/hooks/useClientReady";
import { useStoredProfile } from "@/hooks/useStoredProfile";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import {
  avatarOptions,
  goalOptions,
  languageOptions,
  type AvatarOption,
  type GoalOption,
  type LanguageOption,
} from "@/lib/onboarding-data";
import {
  getNextFlashcardWithJava,
  reviewFlashcardWithJava,
  type FlashcardItemPayload,
  type FlashcardReviewStatus,
  type NextFlashcardResult,
} from "@/lib/java-api";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getThemePresentation } from "@/lib/ui-theme";

type Props = {
  language: LanguageOption;
  goal: GoalOption;
  avatar: AvatarOption;
  level: "A1" | "A2" | "B1";
};

type PracticeCard = FlashcardItemPayload & {
  id: string;
};

type DisplayCard = {
  id: string;
  front: string;
  back: string;
  example: string;
  lessonTopic: string;
  direction: string;
};

const practiceDecks: Record<string, PracticeCard[]> = {
  "french-travel-A1": [
    {
      id: "fr-travel-a1-1",
      term: "la gare",
      translation: "вокзал",
      example: "Où est la gare ?",
      lessonTopic: "travel",
      mistakesCount: 2,
    },
    {
      id: "fr-travel-a1-2",
      term: "le billet",
      translation: "квиток",
      example: "Je voudrais un billet, s’il vous plaît.",
      lessonTopic: "travel",
      mistakesCount: 1,
    },
    {
      id: "fr-travel-a1-3",
      term: "l’hôtel",
      translation: "готель",
      example: "L’hôtel est près de la gare.",
      lessonTopic: "travel",
      mistakesCount: 0,
    },
    {
      id: "fr-travel-a1-4",
      term: "la carte",
      translation: "мапа",
      example: "Avez-vous une carte ?",
      lessonTopic: "travel",
      mistakesCount: 1,
    },
  ],
  "english-travel-A1": [
    {
      id: "en-travel-a1-1",
      term: "ticket",
      translation: "квиток",
      example: "I need a ticket, please.",
      lessonTopic: "travel",
      mistakesCount: 2,
    },
    {
      id: "en-travel-a1-2",
      term: "station",
      translation: "станція",
      example: "Where is the station?",
      lessonTopic: "travel",
      mistakesCount: 1,
    },
    {
      id: "en-travel-a1-3",
      term: "passport",
      translation: "паспорт",
      example: "I have my passport.",
      lessonTopic: "travel",
      mistakesCount: 0,
    },
    {
      id: "en-travel-a1-4",
      term: "map",
      translation: "мапа",
      example: "Can you show me the map?",
      lessonTopic: "travel",
      mistakesCount: 1,
    },
  ],
};

function buildFallbackDeck(
  languageId: string,
  goalId: string,
  level: "A1" | "A2" | "B1",
): PracticeCard[] {
  const deckKey = `${languageId}-${goalId}-${level}`;
  const preset = practiceDecks[deckKey];

  if (preset) {
    return preset;
  }

  const goalLabel = goalOptions.find((option) => option.id === goalId)?.label ?? goalId;

  if (languageId === "french") {
    return [
      {
        id: `${deckKey}-1`,
        term: "le mot",
        translation: "слово",
        example: `Je révise le vocabulaire pour le thème «${goalLabel}».`,
        lessonTopic: goalId,
        mistakesCount: 1,
      },
      {
        id: `${deckKey}-2`,
        term: "la phrase",
        translation: "фраза",
        example: "Cette carte aide à pratiquer une phrase utile.",
        lessonTopic: goalId,
        mistakesCount: 0,
      },
      {
        id: `${deckKey}-3`,
        term: "réviser",
        translation: "повторювати",
        example: "Je révise un mot difficile.",
        lessonTopic: goalId,
        mistakesCount: 2,
      },
    ];
  }

  return [
    {
      id: `${deckKey}-1`,
      term: "word",
      translation: "слово",
      example: `I revise vocabulary for the topic “${goalLabel}”.`,
      lessonTopic: goalId,
      mistakesCount: 1,
    },
    {
      id: `${deckKey}-2`,
      term: "phrase",
      translation: "фраза",
      example: "This card helps you practise one useful phrase.",
      lessonTopic: goalId,
      mistakesCount: 0,
    },
    {
      id: `${deckKey}-3`,
      term: "review",
      translation: "повторювати",
      example: "I review a difficult word.",
      lessonTopic: goalId,
      mistakesCount: 2,
    },
  ];
}

function stripCardMeta(card: PracticeCard): FlashcardItemPayload {
  return {
    term: card.term,
    translation: card.translation,
    example: card.example,
    lessonTopic: card.lessonTopic,
    mistakesCount: card.mistakesCount,
  };
}

function mapCardForDisplay(
  card: PracticeCard | undefined,
  nextCard: NextFlashcardResult | null,
): DisplayCard | null {
  if (!card || !nextCard) {
    return null;
  }

  const direction = nextCard.direction || "foreign-to-uk";

  return {
    id: card.id,
    front: direction === "uk-to-foreign" ? card.translation : card.term,
    back: direction === "uk-to-foreign" ? card.term : card.translation,
    example: card.example ?? "",
    lessonTopic: card.lessonTopic ?? nextCard.lessonTopic,
    direction,
  };
}

function resolveNextCard(
  cards: PracticeCard[],
  result: NextFlashcardResult,
  currentCardId: string | null,
): PracticeCard | undefined {
  const exactMatch = cards.find(
    (card) => card.term === result.term && card.translation === result.translation,
  );

  if (exactMatch && exactMatch.id !== currentCardId) {
    return exactMatch;
  }

  if (cards.length <= 1) {
    return exactMatch ?? cards[0];
  }

  const currentIndex = cards.findIndex((card) => card.id === currentCardId);

  if (currentIndex === -1) {
    return exactMatch ?? cards[0];
  }

  return cards[(currentIndex + 1) % cards.length];
}

export function PracticePageClient({ language, goal, avatar, level }: Props) {
  const isClientReady = useClientReady();
  const storedProfile = useStoredProfile();
  const supabaseUser = useSupabaseUser();
  const supabase = useMemo(
    () => (isSupabaseConfigured() ? createClient() : null),
    [],
  );

  const activeAvatar =
    avatarOptions.find((item) => item.id === storedProfile?.avatarId) ?? avatar;
  const activeLanguage =
    languageOptions.find((item) => item.id === storedProfile?.languageId) ?? language;
  const activeGoal = goalOptions.find((item) => item.id === storedProfile?.goalId) ?? goal;
  const activeLevel =
    storedProfile?.placementCompleted && storedProfile.recommendedLevelId
      ? storedProfile.recommendedLevelId
      : storedProfile?.selectedLevelId ?? level;
  const userId = supabaseUser?.id ?? storedProfile?.learnerName ?? "demo-user";
  const themeUi = getThemePresentation(storedProfile?.selectedThemeId);

  const deck = useMemo(
    () => buildFallbackDeck(activeLanguage.id, activeGoal.id, activeLevel),
    [activeGoal.id, activeLanguage.id, activeLevel],
  );

  const [cards, setCards] = useState<PracticeCard[]>(() => deck);
  const [currentCardId, setCurrentCardId] = useState<string | null>(deck[0]?.id ?? null);
  const [showBack, setShowBack] = useState(false);
  const [isLoadingCard, setIsLoadingCard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentorMessage, setMentorMessage] = useState(
    "Покажи переклад і познач, наскільки впевнено ти знаєш це слово.",
  );
  const [reviewHint, setReviewHint] = useState(
    "Слова для повторення підбираються за помилками та частотою повтору.",
  );
  const [nextCardPayload, setNextCardPayload] = useState<NextFlashcardResult | null>(null);

  const currentCard = useMemo(
    () => cards.find((item) => item.id === currentCardId),
    [cards, currentCardId],
  );

  const displayCard = useMemo(
    () => mapCardForDisplay(currentCard, nextCardPayload),
    [currentCard, nextCardPayload],
  );

  const courseHref = `/course?language=${activeLanguage.id}&goal=${activeGoal.id}&avatar=${activeAvatar.id}&level=${activeLevel}`;
  const profileHref = `/profile?language=${activeLanguage.id}&goal=${activeGoal.id}&avatar=${activeAvatar.id}&level=${activeLevel}`;
  const practiceHref = `/practice?language=${activeLanguage.id}&goal=${activeGoal.id}&avatar=${activeAvatar.id}&level=${activeLevel}`;

  useEffect(() => {
    if (!isClientReady || !cards.length) {
      return;
    }

    let cancelled = false;

    async function loadNextCard() {
      setIsLoadingCard(true);

      const result = await getNextFlashcardWithJava({
        userId,
        language: activeLanguage.id,
        level: activeLevel,
        goal: activeGoal.id,
        availableCards: cards.map(stripCardMeta),
      });

      if (cancelled) {
        return;
      }

      const selected = resolveNextCard(cards, result, null);

      setCurrentCardId(selected?.id ?? null);
      setNextCardPayload(result);
      setMentorMessage(result.mentorMessage);
      setReviewHint("Показ карток не впливає на проходження уроків, це окрема практика.");
      setShowBack(false);
      setIsLoadingCard(false);
    }

    void loadNextCard();

    return () => {
      cancelled = true;
    };
  }, [activeGoal.id, activeLanguage.id, activeLevel, cards, isClientReady, userId]);

  async function handleReview(status: FlashcardReviewStatus) {
    if (!currentCard || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      const review = await reviewFlashcardWithJava({
        userId,
        term: currentCard.term,
        translation: currentCard.translation,
        example: currentCard.example,
        lessonTopic: currentCard.lessonTopic,
        language: activeLanguage.id,
        level: activeLevel,
        status,
      });

      const updatedCards = cards.map((card) => {
        if (card.id !== currentCard.id) {
          return card;
        }

        const nextMistakes =
          status === "KNOW"
            ? 0
            : status === "REPEAT_LATER"
              ? Math.max(card.mistakesCount, 1)
              : card.mistakesCount + 1;

        return {
          ...card,
          mistakesCount: nextMistakes,
        };
      });

      setCards(updatedCards);
      setMentorMessage(review.mentorMessage);
      setReviewHint(review.nextReviewHint);
      setShowBack(false);

      if (supabase) {
        await supabase.from("user_vocabulary_progress").upsert(
          {
            user_id: userId,
            vocabulary_item_id: currentCard.id,
            mistakes_count:
              status === "KNOW"
                ? 0
                : status === "REPEAT_LATER"
                  ? Math.max(currentCard.mistakesCount, 1)
                  : currentCard.mistakesCount + 1,
            correct_count: status === "KNOW" ? 1 : 0,
            last_status: status,
            next_review_priority: review.priority,
            last_reviewed_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,vocabulary_item_id",
          },
        );
      }
      const nextResult = await getNextFlashcardWithJava({
        userId,
        language: activeLanguage.id,
        level: activeLevel,
        goal: activeGoal.id,
        availableCards: updatedCards.map(stripCardMeta),
      });

      const selected = resolveNextCard(updatedCards, nextResult, currentCard.id);

      setCurrentCardId(selected?.id ?? null);
      setNextCardPayload(nextResult);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isClientReady) {
    return (
      <main className="app-shell">
        <section className="page-frame">
          <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
            <div className="sidebar-shell rounded-[32px] p-5" />
            <div className="space-y-5">
              <div className="glass-header rounded-[30px] px-6 py-10" />
              <div className="glass-panel h-[520px] rounded-[30px]" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={`app-shell ${themeUi.pageGlow}`}>
      <section className="page-frame">
        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          <aside className="sidebar-shell rounded-[32px] p-5 text-white">
            <Link
              href="/"
              className="flex flex-col items-center gap-3 rounded-[20px] px-3 text-center transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <BrandLogo className="justify-center" imageClassName="!h-24 !w-[196px]" />
              <p className="max-w-[156px] text-[13px] leading-5 text-white/70">
                Окрема зона для короткого повторення слів.
              </p>
            </Link>

            <nav className="mt-7 space-y-1.5">
              <Link
                href={courseHref}
                className="sidebar-item block rounded-[16px] px-4 py-2.5 text-[15px] font-medium"
              >
                Головна
              </Link>
              <Link
                href={`${courseHref}#lessons`}
                className="sidebar-item block rounded-[16px] px-4 py-2.5 text-[15px] font-medium"
              >
                Уроки
              </Link>
              <Link
                href={practiceHref}
                className="sidebar-item sidebar-item-active block rounded-[16px] px-4 py-2.5 text-[15px] font-medium"
              >
                Додаткові вправи
              </Link>
              <Link
                href={profileHref}
                className="sidebar-item block rounded-[16px] px-4 py-2.5 text-[15px] font-medium"
              >
                Магазин
              </Link>
            </nav>

            <div className="mt-7 rounded-[22px] border border-white/10 bg-white/8 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/62">
                Активний наставник
              </p>
              <div className="mt-4 flex items-center gap-3">
                <MentorAvatar
                  avatar={activeAvatar}
                  className="h-16 w-16 rounded-[20px]"
                  imageClassName="scale-[1.02]"
                  fit="contain"
                />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold">{activeAvatar.name}</p>
                  <p className="text-[13px] leading-5 text-white/70">{activeAvatar.role}</p>
                </div>
              </div>
            </div>
          </aside>

          <section className="space-y-5">
            <header className="glass-header flex flex-col gap-4 rounded-[30px] px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="section-kicker">Практика карток</p>
                <h1 className="section-title mt-2.5 text-[2.2rem] font-semibold text-[#17362d] sm:text-[3.2rem]">
                  Повторюй слова окремо від уроків.
                </h1>
                <p className="mt-3 max-w-2xl text-[15px] leading-6 text-[#5f786d]">
                  Тут можна швидко переглянути лексику, яку варто закріпити. Екран не зараховує
                  проходження уроку, а просто допомагає повторити слова у зручному темпі.
                </p>
              </div>

              <div className="stat-tile rounded-[18px] px-4 py-3 text-[14px] font-semibold text-[#17362d]">
                {activeLanguage.label} • {activeGoal.label} • {activeLevel}
              </div>
            </header>

            <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
              <article className="glass-panel rounded-[30px] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="section-kicker">Картка</p>
                    <h2 className="mt-2 text-[1.95rem] font-semibold text-[#17362d] sm:text-[2.4rem]">
                      {isLoadingCard ? "Завантажуємо..." : displayCard?.front ?? "Немає карток"}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBack((value) => !value)}
                    disabled={!displayCard || isLoadingCard}
                    className="action-secondary rounded-full px-5 py-3 text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {showBack ? "Сховати переклад" : "Показати переклад"}
                  </button>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="device-frame rounded-[26px] p-5">
                    <p className="section-kicker">Лицьова сторона</p>
                    <p className="mt-4 text-[1.7rem] font-semibold text-[#17362d]">
                      {displayCard?.front ?? "—"}
                    </p>
                  </div>
                  <div className="device-frame rounded-[26px] p-5">
                    <p className="section-kicker">Зворотний бік</p>
                    <p className="mt-4 min-h-[44px] text-[1.35rem] font-semibold text-[#17362d]">
                      {showBack ? displayCard?.back ?? "—" : "Переклад поки приховано"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-[22px] bg-[rgba(237,246,241,0.92)] px-4 py-3.5 text-[15px] leading-6 text-[#355e4c]">
                  <span className="font-semibold">Приклад:</span>{" "}
                  {displayCard?.example || "Для цієї картки приклад поки не додано."}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => void handleReview("KNOW")}
                    disabled={!displayCard || isSubmitting || isLoadingCard}
                    className="action-primary rounded-full px-5 py-3 text-[15px] font-semibold !text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Знаю
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleReview("DONT_KNOW")}
                    disabled={!displayCard || isSubmitting || isLoadingCard}
                    className="rounded-full bg-[#17362d] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#21493b] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Не знаю
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleReview("REPEAT_LATER")}
                    disabled={!displayCard || isSubmitting || isLoadingCard}
                    className="action-secondary rounded-full px-5 py-3 text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Повторити пізніше
                  </button>
                </div>
              </article>

              <aside className="space-y-5">
                <article className="glass-panel rounded-[28px] p-5">
                  <p className="section-kicker">Підказка наставника</p>
                  <p className="mt-3 text-[1.05rem] font-semibold leading-7 text-[#17362d]">
                    {mentorMessage}
                  </p>
                  <p className="mt-4 text-[14px] leading-6 text-[#5f786d]">{reviewHint}</p>
                </article>

                <article className="glass-panel rounded-[28px] p-5">
                  <p className="section-kicker">Як це працює</p>
                  <ul className="mt-4 space-y-3 text-[14px] leading-6 text-[#5f786d]">
                    <li>Спочатку спробуй згадати слово самостійно, а вже потім відкрий переклад.</li>
                    <li>Кнопка «Не знаю» повертає слово у швидке повторення раніше.</li>
                    <li>Кнопка «Повторити пізніше» зберігає слово в колоді, але з нижчим пріоритетом.</li>
                  </ul>
                </article>
              </aside>
            </section>
          </section>
        </div>
      </section>
    </main>
  );
}
