"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { MentorAvatar } from "@/components/avatar/MentorAvatar";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { useClientReady } from "@/hooks/useClientReady";
import { useStoredProfile } from "@/hooks/useStoredProfile";
import {
  avatarOptions,
  goalOptions,
  languageOptions,
  type AvatarOption,
  type GoalOption,
  type LanguageOption,
} from "@/lib/onboarding-data";
import {
  equipProfileItem,
  purchaseProfileItem,
  selectProfileTheme,
  upsertStoredProfile,
} from "@/lib/profile-storage";
import { appThemes, shopItems } from "@/lib/shop-data";
import {
  syncInventoryState,
  syncProfileSelection,
  syncThemeSelection,
} from "@/lib/supabase/profile-sync";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getThemePresentation } from "@/lib/ui-theme";

type Props = {
  language: LanguageOption;
  goal: GoalOption;
  avatar: AvatarOption;
};

type TabId = "themes" | "mentors" | "accessories" | "boosters" | "coins";

const tabs: { id: TabId; label: string }[] = [
  { id: "themes", label: "Теми" },
  { id: "mentors", label: "Наставники" },
  { id: "accessories", label: "Аксесуари" },
  { id: "boosters", label: "Бустери" },
  { id: "coins", label: "Монети" },
];

const themeDecor: Record<string, { sticker: string; glow: string }> = {
  jungle: { sticker: "🌿", glow: "from-lime-300/50 via-emerald-300/20 to-transparent" },
  sky: { sticker: "☁️", glow: "from-sky-300/40 via-cyan-200/20 to-transparent" },
  flower: { sticker: "🌸", glow: "from-rose-300/40 via-orange-200/20 to-transparent" },
};

const shopDecor: Record<string, string> = {
  "leaf-crown": "🍃",
  "travel-hat": "👒",
  "round-glasses": "🕶",
  "flower-scarf": "🧣",
  "mini-backpack": "🎒",
};

export function ProfileShopClient({ language, goal, avatar }: Props) {
  const isClientReady = useClientReady();
  const profile = useStoredProfile();
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("themes");
  const [isSigningOut, setIsSigningOut] = useState(false);

  const activeAvatar =
    avatarOptions.find((item) => item.id === profile?.avatarId) ?? avatar;
  const activeLanguage =
    languageOptions.find((item) => item.id === profile?.languageId) ?? language;
  const activeGoal = goalOptions.find((item) => item.id === profile?.goalId) ?? goal;
  const starterMentors = avatarOptions.filter((item) => item.starter !== false);
  const premiumMentors = avatarOptions.filter((item) => item.starter === false);

  const equippedItems = useMemo(
    () => shopItems.filter((item) => profile?.equippedItemIds.includes(item.id)),
    [profile],
  );
  const selectedTheme = useMemo(
    () => appThemes.find((theme) => theme.id === profile?.selectedThemeId) ?? appThemes[0],
    [profile],
  );

  const themeUi = getThemePresentation(profile?.selectedThemeId);
  const accessoryItems = shopItems.filter((item) => item.type !== "companion");
  const boosterItems = shopItems.filter((item) => item.type === "companion");
  const coins = profile?.coins ?? 0;
  const completion = Math.min(100, 8 + (profile?.completedLessonIds.length ?? 0) * 12);
  const activeLevel =
    profile?.placementCompleted && profile.recommendedLevelId
      ? profile.recommendedLevelId
      : profile?.selectedLevelId ?? "A1";

  const courseHref = `/course?language=${activeLanguage.id}&goal=${activeGoal.id}&avatar=${activeAvatar.id}&level=${activeLevel}`;
  const practiceHref = `/practice?language=${activeLanguage.id}&goal=${activeGoal.id}&avatar=${activeAvatar.id}&level=${activeLevel}`;

  if (!isClientReady) {
    return (
      <main className="app-shell">
        <section className="page-frame">
          <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
            <div className="sidebar-shell rounded-[32px] p-5" />
            <div className="space-y-6">
              <div className="glass-header rounded-[32px] px-6 py-10" />
              <div className="grid gap-4 xl:grid-cols-3">
                <div className="glass-panel h-56 rounded-[30px]" />
                <div className="glass-panel h-56 rounded-[30px]" />
                <div className="glass-panel h-56 rounded-[30px]" />
              </div>
              <div className="glass-panel h-96 rounded-[32px]" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  function handleBuy(itemId: string, price: number) {
    const result = purchaseProfileItem(itemId, price);
    if (!result.ok) {
      if (result.reason === "not-enough-coins") {
        setMessage("Поки що не вистачає монет. Пройди ще кілька уроків, щоб відкрити цю покупку.");
      } else if (result.reason === "already-owned") {
        setMessage("Цей предмет уже є у твоїй колекції.");
      } else {
        setMessage("Спочатку створи свій навчальний шлях через онбординг.");
      }
      return;
    }

    setMessage("Предмет успішно придбано.");
    void syncProfileSelection({
      displayName: result.profile.learnerName,
      languageId: result.profile.languageId,
      goalId: result.profile.goalId,
      avatarId: result.profile.avatarId,
      selectedLevelId: result.profile.selectedLevelId,
      recommendedLevelId: result.profile.recommendedLevelId,
      placementCompleted: result.profile.placementCompleted,
      coins: result.profile.coins,
      totalCorrectAnswers: result.profile.totalCorrectAnswers,
      totalAnswered: result.profile.totalAnswered,
    });
    void syncInventoryState({
      itemIds: result.profile.ownedItemIds,
      equippedItemIds: result.profile.equippedItemIds,
    });
  }

  function handleEquip(itemId: string) {
    const next = equipProfileItem(itemId);
    if (!next) return;
    setMessage("Екіпірування оновлено.");
    void syncInventoryState({
      itemIds: next.ownedItemIds,
      equippedItemIds: next.equippedItemIds,
    });
  }

  function handleTheme(themeId: string) {
    const next = selectProfileTheme(themeId);
    if (!next) return;
    setMessage("Тему профілю змінено.");
    void syncThemeSelection({ themeId });
  }

  function handleMentorChange(nextAvatarId: string) {
    if (!profile) return;
    const targetMentor = avatarOptions.find((item) => item.id === nextAvatarId);
    if (!targetMentor) return;

    const unlocked =
      targetMentor.starter !== false || profile.ownedItemIds.includes(nextAvatarId);

    if (!unlocked) {
      setMessage("Спочатку придбай цього наставника в магазині.");
      return;
    }

    const nextProfile = upsertStoredProfile({
      learnerName: profile.learnerName,
      languageId: profile.languageId,
      goalId: profile.goalId,
      avatarId: nextAvatarId,
      selectedLevelId: profile.selectedLevelId,
      recommendedLevelId: profile.recommendedLevelId,
      placementCompleted: profile.placementCompleted,
      coins: profile.coins,
      totalCorrectAnswers: profile.totalCorrectAnswers,
      totalAnswered: profile.totalAnswered,
    });

    if (!nextProfile) return;

    setMessage("Наставника оновлено. Тепер курс і уроки використовують новий вибір.");
    void syncProfileSelection({
      displayName: nextProfile.learnerName,
      languageId: nextProfile.languageId,
      goalId: nextProfile.goalId,
      avatarId: nextProfile.avatarId,
      selectedLevelId: nextProfile.selectedLevelId,
      recommendedLevelId: nextProfile.recommendedLevelId,
      placementCompleted: nextProfile.placementCompleted,
      coins: nextProfile.coins,
      totalCorrectAnswers: nextProfile.totalCorrectAnswers,
      totalAnswered: nextProfile.totalAnswered,
    });
  }

  async function handleSignOut() {
    if (isSigningOut) return;

    try {
      setIsSigningOut(true);

      if (isSupabaseConfigured()) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }

      window.location.href = "/";
    } finally {
      setIsSigningOut(false);
    }
  }

  const sidebarLinks = [
    { label: "Головна", href: courseHref },
    { label: "Уроки", href: `${courseHref}#lessons` },
    { label: "Практика", href: practiceHref },
    { label: "Магазин", href: "#shop", active: true },
  ];

  return (
    <main className={`app-shell ${themeUi.pageGlow}`}>
      <section className="page-frame">
        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          <aside className="sidebar-shell rounded-[32px] p-5 text-white">
            <div className="flex min-h-full flex-col">
              <Link
                href="/"
                className="flex flex-col items-center gap-4 rounded-[22px] px-3 text-center transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <BrandLogo className="justify-center" imageClassName="!h-24 !w-[196px]" />
                <p className="max-w-[156px] text-[13px] leading-5 text-white/70">
                  Персоналізуй свій простір
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

              <div className="mt-7 rounded-[22px] border border-white/10 bg-white/8 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/62">
                  Активний профіль
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <MentorAvatar
                    avatar={activeAvatar}
                    className="h-16 w-16 rounded-[20px]"
                    imageClassName="scale-[1.02]"
                    textClassName="text-lg text-[#17362d]"
                    fit="contain"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-white">{activeAvatar.name}</p>
                    <p className="text-[13px] leading-5 text-white/70">
                      {activeLanguage.label} • {activeGoal.label}
                    </p>
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

          <section className="space-y-6">
            <header className="glass-header flex flex-col gap-4 rounded-[28px] px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="section-kicker">Профіль та магазин</p>
                <h1 className="section-title mt-2.5 text-[2.2rem] font-semibold text-[#17362d] sm:text-[3.15rem]">
                  Оформи свій Lingo Jungle.
                </h1>
                <p className="mt-3 max-w-2xl text-[15px] leading-6 text-[#5f786d] sm:text-[1rem] sm:leading-7">
                  Тут живе персоналізація: тема, наставник, аксесуари та магазин.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="rounded-full bg-[#fff3cf] px-4 py-2 text-[15px] font-semibold text-[#7a5f19]">
                  {coins} монет
                </div>
                <Link
                  href={courseHref}
                  className="action-primary rounded-full px-4 py-2.5 text-[15px] font-semibold !text-white"
                >
                  Назад до курсу
                </Link>
              </div>
            </header>

            <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-5">
                <article className="glass-panel rounded-[28px] p-5">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <MentorAvatar
                      avatar={activeAvatar}
                      className="h-28 w-28 shrink-0 rounded-[24px]"
                      imageClassName="scale-[1.02]"
                      textClassName="text-[2rem] text-[#17362d]"
                      fit="contain"
                    />
                    <div>
                      <p className="section-kicker">Аватар наставника</p>
                      <h2 className="mt-2 text-[2rem] font-semibold text-[#17362d] sm:text-[2.4rem]">
                        {activeAvatar.name}
                      </h2>
                      <p className="mt-1.5 text-[15px] text-[#5f786d]">{activeAvatar.role}</p>
                      <p className="mt-3 max-w-xl text-[15px] leading-6 text-[#5f786d]">
                        {activeAvatar.blurb}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <ProfileStat label="Монети" value={`${coins}`} />
                    <ProfileStat label="Прогрес" value={`${completion}%`} />
                    <ProfileStat label="Рівень" value={activeLevel} />
                    <ProfileStat label="Інвентар" value={`${profile?.ownedItemIds.length ?? 0}`} />
                  </div>

                  <div className="mt-5 rounded-[24px] bg-[#14392c] p-4 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/66">
                      Активна тема
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-[20px] bg-white/10">
                        <div
                          className={`absolute inset-0 rounded-[20px] bg-gradient-to-br ${selectedTheme.accent}`}
                        />
                        <span className="relative text-[1.75rem]">
                          {themeDecor[selectedTheme.id]?.sticker ?? "🌿"}
                        </span>
                      </div>
                      <div>
                        <p className="text-[1rem] font-semibold">{selectedTheme.name}</p>
                        <p className="text-[13px] leading-5 text-white/74">
                          {selectedTheme.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[22px] border border-[rgba(18,53,42,0.08)] bg-white/84 p-4">
                    <p className="section-kicker">Екіпіровані аксесуари</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {equippedItems.length ? (
                        equippedItems.map((item) => (
                          <span
                            key={item.id}
                            className="rounded-full bg-[rgba(47,143,91,0.1)] px-3 py-1.5 text-[14px] font-semibold text-[#24483a]"
                          >
                            {item.name}
                            {item.coinBonusPercent ? ` • +${item.coinBonusPercent}% coins` : ""}
                          </span>
                        ))
                      ) : (
                        <p className="text-[14px] leading-6 text-[#5f786d]">
                          Поки що аксесуари не екіпіровано.
                        </p>
                      )}
                    </div>
                  </div>
                </article>

                {message ? (
                  <div className="rounded-[22px] border border-[rgba(18,53,42,0.08)] bg-[rgba(255,255,255,0.84)] px-4 py-3.5 text-[14px] leading-6 text-[#355e4c] shadow-[0_18px_40px_rgba(33,60,47,0.05)]">
                    {message}
                  </div>
                ) : null}
              </div>

              <div className="space-y-5" id="shop">
                <article className="glass-panel rounded-[28px] p-4.5">
                  <div className="flex flex-wrap items-center gap-3">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          activeTab === tab.id
                            ? "bg-[#14392c] text-white"
                            : "bg-[rgba(18,53,42,0.06)] text-[#56756a] hover:bg-[rgba(18,53,42,0.1)]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {activeTab === "themes" ? (
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      {appThemes.map((theme) => {
                        const selected = profile?.selectedThemeId === theme.id;
                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => handleTheme(theme.id)}
                            className={`device-frame rounded-[28px] p-4 text-left transition ${
                              selected ? "ring-2 ring-[#2f8f5b]" : ""
                            }`}
                          >
                            <div className="relative h-36 overflow-hidden rounded-[22px]">
                              <div className={`absolute inset-0 bg-gradient-to-br ${theme.accent}`} />
                              <div
                                className={`absolute inset-0 bg-gradient-to-br ${themeDecor[theme.id]?.glow ?? "from-white/10 to-transparent"}`}
                              />
                              <span className="absolute bottom-4 left-4 text-5xl">
                                {themeDecor[theme.id]?.sticker ?? "🌿"}
                              </span>
                              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/12 to-transparent" />
                            </div>
                            <div className="mt-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-semibold text-[#17362d]">{theme.name}</h3>
                                {selected ? (
                                  <span className="rounded-full bg-[rgba(47,143,91,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#1f7a4f]">
                                    Активно
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[#5f786d]">
                              {theme.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {activeTab === "mentors" ? (
                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {[...starterMentors, ...premiumMentors].map((option) => {
                        const selected = option.id === activeAvatar.id;
                        const unlocked =
                          option.starter !== false || (profile?.ownedItemIds.includes(option.id) ?? false);
                        return (
                          <article
                            key={option.id}
                            className={`device-frame rounded-[28px] p-5 text-left transition ${
                              selected ? "ring-2 ring-[#2f8f5b]" : ""
                            }`}
                          >
                            <MentorAvatar
                              avatar={option}
                              className="mx-auto h-36 w-36 rounded-[26px]"
                              imageClassName="scale-[1.02]"
                              fit="contain"
                            />
                            <div className="mt-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-2xl font-semibold text-[#17362d]">
                                  {option.name}
                                </h3>
                                {selected ? (
                                  <span className="rounded-full bg-[rgba(47,143,91,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#1f7a4f]">
                                    Обрано
                                  </span>
                                ) : null}
                                {option.starter === false ? (
                                  <span className="rounded-full bg-[#fff3cf] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#7a5f19]">
                                    Преміум
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-2 text-base text-[#4e8d66]">{option.role}</p>
                              <p className="mt-3 text-sm leading-6 text-[#5f786d]">
                                {option.blurb}
                              </p>
                              {option.perk ? (
                                <div className="mt-4 rounded-[18px] bg-[rgba(47,143,91,0.08)] px-3 py-2 text-sm font-medium text-[#1f7a4f]">
                                  Баф: {option.perk}
                                </div>
                              ) : null}
                              <div className="mt-5 flex flex-wrap gap-3">
                                {unlocked ? (
                                  <button
                                    type="button"
                                    onClick={() => handleMentorChange(option.id)}
                                    className={`rounded-full px-5 py-3 text-sm font-semibold ${
                                      selected
                                        ? "bg-[#14392c] text-white"
                                        : "bg-[rgba(47,143,91,0.1)] text-[#1f7a4f]"
                                    }`}
                                  >
                                    {selected ? "Активно" : "Обрати наставника"}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleBuy(option.id, option.price ?? 0)}
                                    className="action-primary rounded-full px-5 py-3 text-sm font-semibold text-white"
                                  >
                                    Купити за {option.price}
                                  </button>
                                )}

                                <span className="rounded-full border border-[rgba(18,53,42,0.08)] px-4 py-3 text-sm font-medium text-[#5f786d]">
                                  {unlocked ? "Доступно" : `${option.price ?? 0} монет`}
                                </span>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : null}

                  {activeTab === "accessories" ? (
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      {accessoryItems.map((item) => (
                        <ShopCard
                          key={item.id}
                          item={item}
                          owned={profile?.ownedItemIds.includes(item.id) ?? false}
                          equipped={profile?.equippedItemIds.includes(item.id) ?? false}
                          onBuy={handleBuy}
                          onEquip={handleEquip}
                        />
                      ))}
                    </div>
                  ) : null}

                  {activeTab === "boosters" ? (
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      {boosterItems.map((item) => (
                        <ShopCard
                          key={item.id}
                          item={item}
                          owned={profile?.ownedItemIds.includes(item.id) ?? false}
                          equipped={profile?.equippedItemIds.includes(item.id) ?? false}
                          onBuy={handleBuy}
                          onEquip={handleEquip}
                        />
                      ))}
                    </div>
                  ) : null}

                  {activeTab === "coins" ? (
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <article className="device-frame rounded-[28px] p-5">
                        <p className="section-kicker">Баланс</p>
                        <h3 className="mt-3 text-4xl font-semibold text-[#17362d]">{coins}</h3>
                        <p className="mt-3 text-sm leading-6 text-[#5f786d]">
                          Монети використовуються для тем, аксесуарів та візуальних нагород у профілі.
                        </p>
                      </article>

                      <article className="device-frame rounded-[28px] p-5">
                        <p className="section-kicker">Як заробити</p>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-[#5f786d]">
                          <li>Завершуй уроки й проходь вправи без пропусків.</li>
                          <li>Підтримуй серію занять кілька днів поспіль.</li>
                          <li>Відкривай нові модулі та повертайся до повторення.</li>
                        </ul>
                      </article>
                    </div>
                  ) : null}
                </article>
              </div>
            </section>
          </section>
        </div>
      </section>
    </main>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-tile rounded-[24px] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2f8f5b]">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-[#17362d]">{value}</p>
    </div>
  );
}

function ShopCard({
  item,
  owned,
  equipped,
  onBuy,
  onEquip,
}: {
  item: (typeof shopItems)[number];
  owned: boolean;
  equipped: boolean;
  onBuy: (itemId: string, price: number) => void;
  onEquip: (itemId: string) => void;
}) {
  return (
    <article className="device-frame rounded-[28px] p-5">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br ${item.accent} text-2xl shadow-[inset_0_8px_20px_rgba(255,255,255,0.24)]`}
        >
          {shopDecor[item.id] ?? item.symbol}
        </div>
        <div className="rounded-full bg-[#fff3cf] px-3 py-1.5 text-sm font-semibold text-[#7a5f19]">
          {item.price}
        </div>
      </div>

      <h3 className="mt-4 text-xl font-semibold text-[#17362d]">{item.name}</h3>
      <p className="mt-2 text-sm leading-6 text-[#5f786d]">{item.description}</p>
      {item.coinBonusPercent ? (
        <div className="mt-3 rounded-[18px] bg-[rgba(47,143,91,0.08)] px-3 py-2 text-sm font-medium text-[#1f7a4f]">
          Баф: +{item.coinBonusPercent}% coins
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        {!owned ? (
          <button
            type="button"
            onClick={() => onBuy(item.id, item.price)}
            className="action-primary rounded-full px-5 py-3 text-sm font-semibold text-white"
          >
            Купити
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onEquip(item.id)}
            className={`rounded-full px-5 py-3 text-sm font-semibold ${
              equipped
                ? "bg-[#14392c] text-white"
                : "bg-[rgba(47,143,91,0.1)] text-[#1f7a4f]"
            }`}
          >
            {equipped ? "Екіпіровано" : "Екіпірувати"}
          </button>
        )}

        <span className="rounded-full border border-[rgba(18,53,42,0.08)] px-4 py-3 text-sm font-medium text-[#5f786d]">
          {owned ? "У колекції" : item.type}
        </span>
      </div>
    </article>
  );
}
