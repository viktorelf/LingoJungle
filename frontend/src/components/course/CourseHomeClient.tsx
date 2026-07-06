"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { MentorAvatar } from "@/components/avatar/MentorAvatar";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { useClientReady } from "@/hooks/useClientReady";
import { useStoredProfile } from "@/hooks/useStoredProfile";
import { cefrCourseStructure } from "@/lib/course-structure";
import { getCourseLessonCards, resolvePlayableLevel } from "@/lib/lesson-data";
import {
  goalOptions,
  languageOptions,
  type AvatarOption,
  type GoalOption,
  type LanguageOption,
} from "@/lib/onboarding-data";
import { saveStoredOnboardingState } from "@/lib/onboarding-storage";
import {
  clearStoredProfile,
  getCurrentWeekActivity,
  setActiveStoredTrack,
} from "@/lib/profile-storage";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getThemePresentation } from "@/lib/ui-theme";

type Props = {
  language: LanguageOption;
  goal: GoalOption;
  avatar: AvatarOption;
};

export function CourseHomeClient({ language, goal, avatar }: Props) {
  const router = useRouter();
  const isClientReady = useClientReady();
  const storedProfile = useStoredProfile();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const activeLanguage =
    languageOptions.find((item) => item.id === storedProfile?.languageId) ?? language;
  const activeGoal = goalOptions.find((item) => item.id === storedProfile?.goalId) ?? goal;
  const completedLessonIds = storedProfile?.completedLessonIds ?? [];
  const currentLevel = storedProfile?.selectedLevelId ?? "A1";
  const contentLevel = resolvePlayableLevel(currentLevel);
  const lessonCards = getCourseLessonCards(activeLanguage.id, activeGoal.id, contentLevel);
  const completedLessonIdsSet = new Set(completedLessonIds);
  const completedCurrentLessonIds = lessonCards
    .filter((lesson) => completedLessonIdsSet.has(lesson.id))
    .map((lesson) => lesson.id);
  const roadmap =
    cefrCourseStructure.find((item) => item.level === currentLevel) ??
    cefrCourseStructure[0];
  const nextLessonId =
    lessonCards.find((lesson) => !completedLessonIdsSet.has(lesson.id))?.id ??
    lessonCards[0]?.id;
  const nextLesson =
    lessonCards.find((lesson) => lesson.id === nextLessonId) ?? lessonCards[0];
  const completion = lessonCards.length
    ? Math.round((completedCurrentLessonIds.length / lessonCards.length) * 100)
    : 0;
  const totalCoins = storedProfile?.coins ?? 120;
  const streakDays = storedProfile?.streakDays ?? 0;
  const weeklyGoalCurrent = Math.min(storedProfile?.weeklyGoalCurrent ?? 0, 6);
  const weeklyGoalTarget = storedProfile?.weeklyGoalTarget ?? 6;
  const weeklyActivity = getCurrentWeekActivity(storedProfile?.lessonHistory ?? []);
  const profileHref = `/profile?language=${activeLanguage.id}&goal=${activeGoal.id}&avatar=${avatar.id}&level=${currentLevel}`;
  const courseHref = `/course?language=${activeLanguage.id}&goal=${activeGoal.id}&avatar=${avatar.id}&level=${currentLevel}`;
  const practiceHref = `/practice?language=${activeLanguage.id}&goal=${activeGoal.id}&avatar=${avatar.id}&level=${currentLevel}`;
  const editPathHref = `/onboarding?returnTo=${encodeURIComponent(courseHref)}`;
  const themeUi = getThemePresentation(storedProfile?.selectedThemeId);

  if (!isClientReady) {
    return (
      <main className="app-shell">
        <section className="page-frame">
          <div className="grid gap-6 lg:grid-cols-[288px_1fr]">
            <div className="sidebar-shell rounded-[36px] p-6" />
            <div className="space-y-6">
              <div className="glass-header rounded-[32px] px-6 py-10" />
              <div className="grid gap-4 xl:grid-cols-3">
                <div className="glass-panel h-48 rounded-[30px]" />
                <div className="glass-panel h-48 rounded-[30px]" />
                <div className="glass-panel h-48 rounded-[30px]" />
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="glass-panel h-64 rounded-[32px]" />
                <div className="glass-panel h-64 rounded-[32px]" />
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  function handleTrackSwitch(trackKey: string) {
    const nextProfile = setActiveStoredTrack(trackKey);
    if (!nextProfile) return;

    saveStoredOnboardingState({
      learnerName: nextProfile.learnerName,
      languageId: nextProfile.languageId,
      goalId: nextProfile.goalId,
      avatarId: nextProfile.avatarId,
      levelId: nextProfile.selectedLevelId,
      recommendedLevelId: nextProfile.recommendedLevelId,
      placementCompleted: nextProfile.placementCompleted,
      placementSkipped: !nextProfile.placementCompleted,
    });

    router.push(
      `/course?language=${nextProfile.languageId}&goal=${nextProfile.goalId}&avatar=${nextProfile.avatarId}&level=${nextProfile.selectedLevelId}`,
    );
  }

  async function handleSignOut() {
    if (isSigningOut) return;

    try {
      setIsSigningOut(true);

      if (isSupabaseConfigured()) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }

      clearStoredProfile();
      window.location.href = "/";
    } finally {
      setIsSigningOut(false);
    }
  }

  const sidebarLinks = [
    { label: "Головна", href: "#overview", active: true },
    { label: "Уроки", href: "#lessons" },
    { label: "Додаткові вправи", href: "#extras" },
    { label: "Магазин", href: profileHref },
  ];

  return (
    <main className={`app-shell ${themeUi.pageGlow}`}>
      <section className="page-frame">
        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          <aside className="sidebar-shell rounded-[32px] p-5 text-white">
            <div className="flex min-h-full flex-col">
              <Link
                href="/"
                className="flex flex-col items-center gap-3 rounded-[20px] px-3 text-center transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <BrandLogo className="justify-center" imageClassName="!h-24 !w-[196px]" />
                <p className="max-w-[156px] text-[13px] leading-5 text-white/70">
                  Вчи. Практикуй. Рости.
                </p>
              </Link>

              <nav className="mt-7 space-y-1.5">
                {sidebarLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`sidebar-item block rounded-[16px] px-4 py-2.5 text-[15px] font-medium ${
                      item.active ? "sidebar-item-active" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-7 rounded-[22px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/62">
                  Серія
                </p>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-[2rem] font-semibold">{streakDays}</p>
                    <p className="text-[13px] text-white/72">днів</p>
                  </div>
                  <div className="text-[2rem]">🔥</div>
                </div>
              </div>

              <div className="mt-5 rounded-[22px] border border-white/10 bg-white/8 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/62">
                  Активний наставник
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <MentorAvatar
                    avatar={avatar}
                    className="h-16 w-16 rounded-[20px]"
                    imageClassName="scale-[1.12]"
                    textClassName="text-lg text-[#17362d]"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold">{avatar.name}</p>
                    <p className="text-[13px] leading-5 text-white/70">{avatar.role}</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-7">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full rounded-[18px] border border-white/14 bg-white/10 px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSigningOut ? "Вихід..." : "Вийти з акаунта"}
                </button>
              </div>
            </div>
          </aside>

          <section className="space-y-5">
            <header
              id="overview"
              className="glass-header flex flex-col gap-4 rounded-[30px] px-5 py-5 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <p className="section-kicker">Панель курсу</p>
                <h1 className="section-title mt-2.5 text-[2.25rem] font-semibold text-[#17362d] sm:text-[3.35rem]">
                  {storedProfile?.learnerName
                    ? `Привіт, ${storedProfile.learnerName}.`
                    : "Продовжуємо маршрут."}
                </h1>
                <p className="mt-3 max-w-2xl text-[15px] leading-6 text-[#5f786d] sm:text-[1rem] sm:leading-7">
                  Тут зібрано твій активний курс: мова, ціль, рівень, прогрес уроків і
                  наступний крок.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
                {storedProfile && storedProfile.savedTracks.length > 1 ? (
                  <label className="stat-tile flex min-w-[210px] flex-col gap-1 rounded-[16px] px-3 py-2 text-[11px] font-semibold text-[#5f786d]">
                    <span>Курс</span>
                    <select
                      value={storedProfile.activeTrackKey}
                      onChange={(event) => handleTrackSwitch(event.target.value)}
                      className="bg-transparent text-[15px] font-semibold text-[#17362d] outline-none"
                    >
                      {storedProfile.savedTracks.map((track) => {
                        const trackLanguage =
                          languageOptions.find((item) => item.id === track.languageId)
                            ?.label ?? track.languageId;
                        const trackGoal =
                          goalOptions.find((item) => item.id === track.goalId)?.label ??
                          track.goalId;

                        return (
                          <option key={track.key} value={track.key}>
                            {trackLanguage} • {trackGoal} • {track.selectedLevelId}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                ) : null}

                <div className="rounded-full bg-[#fff3cf] px-4 py-2 text-[15px] font-semibold text-[#7a5f19]">
                  {totalCoins} монет
                </div>

                <Link
                  href={profileHref}
                  className="action-secondary rounded-full px-4 py-2.5 text-[15px] font-semibold text-[#17362d]"
                >
                  Профіль
                </Link>

                <Link
                  href={editPathHref}
                  className="action-primary rounded-full px-4 py-2.5 text-[15px] font-medium !text-white"
                >
                  Змінити шлях
                </Link>
              </div>
            </header>

            <section className="grid gap-4 xl:grid-cols-[1.05fr_1.05fr_0.9fr]">
              <article className="glass-panel rounded-[28px] p-4.5">
                <p className="section-kicker">Твій прогрес</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[conic-gradient(#2f8f5b_0deg,rgba(47,143,91,0.14)_0deg)]">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#2f8f5b ${completion * 3.6}deg, rgba(47,143,91,0.12) 0deg)`,
                      }}
                    />
                    <div className="relative flex h-20 w-20 flex-col items-center justify-center rounded-full bg-[#fffdf8] text-[#17362d]">
                      <span className="text-[2rem] font-semibold">{currentLevel}</span>
                      <span className="text-xs uppercase tracking-[0.16em] text-[#6b8277]">
                        {completion}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-[15px] text-[#5f786d]">
                    <p>Мова: {activeLanguage.label}</p>
                    <p>Ціль: {activeGoal.label}</p>
                    <p>Пройдено уроків: {completedCurrentLessonIds.length}</p>
                    <p>Активний контент: {contentLevel}</p>
                  </div>
                </div>
              </article>

              <article id="roadmap" className="glass-panel rounded-[28px] p-4.5">
                <p className="section-kicker">CEFR шлях</p>
                <div className="mt-5 flex items-center justify-between gap-2.5">
                  {cefrCourseStructure.map((item) => {
                    const active = item.level === currentLevel;
                    const planned = item.status === "planned";

                    return (
                      <div
                        key={item.level}
                        className="flex flex-1 flex-col items-center text-center"
                      >
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-full border text-[15px] font-semibold ${
                            active
                              ? "border-[#f5bf44] bg-[#f5bf44] text-[#17362d]"
                              : planned
                                ? "border-[rgba(18,53,42,0.1)] bg-white text-[#7d8d84]"
                                : "border-[rgba(18,53,42,0.12)] bg-[rgba(47,143,91,0.1)] text-[#1f7a4f]"
                          }`}
                        >
                          {item.level}
                        </div>
                        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5f786d]">
                          {item.status === "planned" ? "План" : "Готово"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className="glass-panel rounded-[28px] p-4.5">
                <p className="section-kicker">Поточний фокус</p>
                <h2 className="mt-3 text-[2rem] font-semibold text-[#17362d]">
                  {nextLesson?.moduleTitle ?? "Навчальний фокус"}
                </h2>
                <p className="mt-3 text-[15px] leading-6 text-[#5f786d]">
                  {nextLesson
                    ? `Зараз у фокусі урок "${nextLesson.title}". Він веде тебе далі по темі і відкриває наступний логічний крок маршруту.`
                    : "Заверши доступний урок, щоб рухатися далі своїм треком."}
                </p>
              </article>
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <article className="hero-card rounded-[30px] p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/68">
                  Наступний урок
                </p>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[2.25rem] font-semibold">
                      {nextLesson?.title ?? "Продовжити навчання"}
                    </h2>
                    <p className="mt-3 max-w-xl text-[15px] leading-6 text-white/82">
                      {nextLesson?.description ??
                        "Наступний відкритий урок уже чекає. Продовжуй маршрут і відкривай нові кроки модуля."}
                    </p>
                  </div>
                  <div className="rounded-[22px] bg-white/10 px-4 py-3 text-4xl">🦜</div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                  <span className="rounded-full bg-white/12 px-3 py-2 text-[14px] font-medium text-white">
                    {nextLesson?.moduleTitle ?? roadmap.modules[0]?.title}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-2 text-[14px] font-medium text-white/82">
                    {activeLanguage.label} • {activeGoal.label}
                  </span>
                </div>

                {nextLesson ? (
                  <Link
                    href={`/lesson?language=${activeLanguage.id}&goal=${activeGoal.id}&avatar=${avatar.id}&level=${currentLevel}&lesson=${nextLesson.id}`}
                    className="mt-6 inline-flex rounded-full bg-[#f5bf44] px-5 py-2.5 text-[15px] font-semibold text-[#17362d] shadow-[0_16px_32px_rgba(245,191,68,0.24)] transition hover:bg-[#efb633]"
                  >
                    Продовжити
                  </Link>
                ) : null}
              </article>

              <article className="glass-panel rounded-[30px] p-4.5">
                <p className="section-kicker">Тижнева ціль</p>
                <h3 className="mt-3 text-[2rem] font-semibold text-[#17362d]">
                  {weeklyGoalCurrent} / {weeklyGoalTarget} уроків
                </h3>
                <div className="mt-4 h-3 rounded-full bg-[rgba(18,53,42,0.08)]">
                  <div
                    className="h-3 rounded-full bg-[#8fcf4f]"
                    style={{
                      width: `${Math.min(100, (weeklyGoalCurrent / weeklyGoalTarget) * 100)}%`,
                    }}
                  />
                </div>
                <div className="mt-5 flex items-center justify-between text-[13px] font-medium text-[#5f786d]">
                  {weeklyActivity.map((day) => (
                    <div
                      key={day.key}
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        day.active
                          ? "bg-[rgba(47,143,91,0.14)] text-[#1f7a4f]"
                          : "bg-[rgba(18,53,42,0.06)]"
                      }`}
                      title={
                        day.active
                          ? `${day.completedLessons} завершених уроків`
                          : "Без завершених уроків"
                      }
                    >
                      {day.label}
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section id="extras" className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="section-kicker">Додаткові вправи</p>
                  <h2 className="mt-2 text-[2rem] font-semibold text-[#17362d]">
                    Закріплення поза уроком
                  </h2>
                </div>
                <div className="rounded-full bg-[rgba(47,143,91,0.1)] px-4 py-2 text-[14px] font-semibold text-[#1f7a4f]">
                  1 активна фіча
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <article className="device-frame rounded-[28px] p-5">
                  <p className="section-kicker">Flashcards</p>
                  <h3 className="mt-3 text-[1.85rem] font-semibold text-[#17362d]">
                    Картки для швидкого повторення
                  </h3>
                  <p className="mt-3 max-w-2xl text-[15px] leading-6 text-[#5f786d]">
                    Окрема практика без тиску уроку: дивись слово, відкривай переклад і
                    відмічай, чи знаєш його. Це зручно для коротких підходів між уроками.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-2.5">
                    <span className="rounded-full bg-[rgba(47,143,91,0.1)] px-3 py-2 text-[14px] font-medium text-[#1f7a4f]">
                      {activeLanguage.label}
                    </span>
                    <span className="rounded-full bg-[rgba(18,53,42,0.06)] px-3 py-2 text-[14px] font-medium text-[#5f786d]">
                      {activeGoal.label} • {currentLevel}
                    </span>
                  </div>
                  <Link
                    href={practiceHref}
                    className="action-primary mt-6 inline-flex rounded-full px-5 py-2.5 text-[15px] font-semibold !text-white !bg-[linear-gradient(180deg,#f4c542_0%,#d8a814_100%)] !shadow-[0_16px_32px_rgba(244,197,66,0.3)] hover:!bg-[linear-gradient(180deg,#ffd65a_0%,#c99708_100%)]"
                  >
                    Відкрити practice
                  </Link>
                </article>

                <article className="glass-panel rounded-[28px] p-5">
                  <p className="section-kicker">Що дає</p>
                  <ul className="mt-4 space-y-3 text-[15px] leading-6 text-[#5f786d]">
                    <li>Повторення слів окремо від lesson-flow.</li>
                    <li>Швидкий формат для 2–3 хвилин практики.</li>
                    <li>Фокус на слабких словах через кнопки “Не знаю” і “Повторити пізніше”.</li>
                  </ul>
                </article>
              </div>
            </section>

            <section id="lessons" className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="section-kicker">Уроки</p>
                  <h2 className="mt-2 text-[2rem] font-semibold text-[#17362d]">
                    Твій маршрут
                  </h2>
                </div>
                <div className="rounded-full bg-[rgba(47,143,91,0.1)] px-4 py-2 text-[14px] font-semibold text-[#1f7a4f]">
                  {completedCurrentLessonIds.length} завершено
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {lessonCards.map((card, index) => {
                  const isCompleted = completedLessonIdsSet.has(card.id);
                  const isUnlocked =
                    index === 0 ||
                    completedLessonIdsSet.has(lessonCards[index - 1]?.id ?? "");
                  const href = `/lesson?language=${activeLanguage.id}&goal=${activeGoal.id}&avatar=${avatar.id}&level=${currentLevel}&lesson=${card.id}`;
                  const sticker =
                    index % 4 === 0 ? "🧭" : index % 4 === 1 ? "🛒" : index % 4 === 2 ? "🎧" : "📘";

                  return (
                    <article key={card.id} className="device-frame rounded-[28px] p-4.5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-4">
                          <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] ${card.accent} text-[1.65rem] shadow-[inset_0_8px_20px_rgba(255,255,255,0.24)]`}
                          >
                            {sticker}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2f8f5b]">
                              {card.subtitle}
                            </p>
                            <h3 className="mt-2 text-[1.75rem] font-semibold text-[#17362d]">
                              {card.title}
                            </h3>
                            <p className="mt-2 text-[15px] leading-6 text-[#5f786d]">
                              {card.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-3 self-center">
                          <span
                            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                              isCompleted
                                ? "bg-[rgba(47,143,91,0.12)] text-[#1f7a4f]"
                                : isUnlocked
                                  ? "bg-[rgba(245,191,68,0.2)] text-[#8a6110]"
                                  : "bg-[rgba(18,53,42,0.08)] text-[#74867e]"
                            }`}
                          >
                            {isCompleted ? "Пройдено" : isUnlocked ? "Відкрито" : "Закрито"}
                          </span>

                          {isUnlocked ? (
                            <Link
                              href={href}
                              className="action-primary rounded-full px-5 py-2.5 text-[14px] font-medium !text-white"
                            >
                              {isCompleted ? "Повторити" : "Продовжити"}
                            </Link>
                          ) : (
                            <span className="rounded-full border border-[rgba(18,53,42,0.08)] px-5 py-2.5 text-[14px] font-medium text-[#74867e]">
                              Заверши попередній урок
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </section>
        </div>
      </section>
    </main>
  );
}
