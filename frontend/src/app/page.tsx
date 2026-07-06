"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { BrandLogo } from "@/components/branding/BrandLogo";
import { useStoredProfile } from "@/hooks/useStoredProfile";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { clearStoredProfile } from "@/lib/profile-storage";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const heroBullets = [
  "Персоналізовані уроки для англійської та французької",
  "Пояснення, практика й м'який супровід наставника",
];

const heroStats = [
  { value: "2", label: "мови", sticker: "🌍" },
  { value: "4", label: "навчальні цілі", sticker: "🎯" },
  { value: "A1–B1", label: "готовий контент", sticker: "📚" },
  { value: "CEFR", label: "структура курсу", sticker: "🧭" },
];

export default function Home() {
  const router = useRouter();
  const user = useSupabaseUser();
  const storedProfile = useStoredProfile();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isAuthenticated = Boolean(user) && !isSigningOut;

  const displayName = isAuthenticated
    ? storedProfile?.learnerName || user?.displayName || null
    : null;
  const loginHref = "/onboarding";
  const continueHref =
    storedProfile?.languageId && storedProfile?.goalId && storedProfile?.avatarId
      ? `/course?language=${storedProfile.languageId}&goal=${storedProfile.goalId}&avatar=${storedProfile.avatarId}&level=${storedProfile.selectedLevelId}`
      : "/onboarding";

  async function handleSignOut() {
    if (!isSupabaseConfigured() || isSigningOut) return;

    try {
      setIsSigningOut(true);
      clearStoredProfile();
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <main className="h-screen overflow-hidden bg-[#0d261b] text-white">
      <section className="relative h-screen overflow-hidden">
        <Image
          src="/images/hero-jungle-v2.png"
          alt="Lingo Jungle hero scene"
          fill
          priority
          className="object-cover object-center"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,27,18,0.92)_0%,rgba(8,27,18,0.82)_24%,rgba(8,27,18,0.52)_46%,rgba(8,27,18,0.12)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,248,218,0.24),transparent_24%),linear-gradient(180deg,rgba(6,20,13,0.06)_0%,rgba(6,20,13,0.04)_48%,rgba(6,20,13,0.32)_100%)]"
        />

        <div className="relative z-10 flex h-full flex-col px-4 py-4 sm:px-7 sm:py-6 lg:px-10 xl:px-14">
          <header className="flex items-center justify-between gap-4">
            <Link href="/" className="rounded-[18px] transition hover:opacity-90">
              <BrandLogo
                subtitle="Learn. Practice. Grow."
                imageClassName="h-14 w-[158px]"
                titleClassName="text-[1.9rem] text-white"
                subtitleClassName="text-base text-white/72"
              />
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-medium text-white/84 lg:flex">
              <a href="#about" className="transition hover:text-white">
                Курси
              </a>
              <Link href="/onboarding" className="transition hover:text-white">
                Як це працює
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3 rounded-full border border-white/12 bg-white/10 px-3 py-2 backdrop-blur-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/14 text-sm font-semibold text-white">
                    {(displayName ?? "U").slice(0, 1)}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/62">
                      Ти в акаунті
                    </p>
                    <p className="max-w-[10rem] truncate text-sm font-semibold text-white">
                      {displayName ?? "Learner"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="rounded-full border border-white/16 bg-white/8 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/12 disabled:opacity-55"
                  >
                    {isSigningOut ? "Вихід..." : "Вийти"}
                  </button>
                </div>
              ) : null}

              {!isAuthenticated ? (
                <Link
                  href={loginHref}
                  className="rounded-full border border-white/18 bg-white/8 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/12"
                >
                  Увійти
                </Link>
              ) : null}
            </div>
          </header>

          <div className="grid flex-1 items-center gap-8 lg:grid-cols-[minmax(0,38rem)_1fr]">
            <div className="max-w-[38rem] lg:pl-8 xl:pl-16 2xl:pl-20">
              <h1 className="max-w-[8.6ch] text-[3.15rem] font-semibold leading-[0.92] tracking-[-0.065em] text-[#f8f5e8] sm:text-[4.6rem] lg:text-[6rem]">
                Your jungle.
                <br />
                Your language.
              </h1>

              <p className="mt-5 max-w-[29rem] text-sm leading-7 text-white/84 sm:text-base">
                Вивчай англійську та французьку через адаптовані уроки, короткі
                пояснення і практику з наставником.
              </p>

              {displayName ? (
                <div className="mt-4 inline-flex rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-medium text-white/92 backdrop-blur-sm">
                  Вітаємо, {displayName}. Твій профіль уже готовий до продовження.
                </div>
              ) : null}

              <div className="mt-6 space-y-3">
                {heroBullets.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-white/92 sm:text-base"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8fcf4f] text-xs font-bold text-[#17362d]">
                      ✓
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={loginHref}
                  className="rounded-full bg-[#f5bf44] px-6 py-3 text-center text-base font-semibold !text-[#17362d] shadow-[0_18px_34px_rgba(245,191,68,0.24)] transition hover:bg-[#efb633]"
                >
                  {user ? "Переглянути курси" : "Увійти та почати"}
                </Link>

                {isAuthenticated ? (
                  <Link
                    href={continueHref}
                    className="rounded-full border border-[#d7dccc] bg-[#fff6df] px-6 py-3 text-center text-base font-semibold !text-[#17362d] shadow-[0_12px_28px_rgba(11,32,22,0.08)] transition hover:bg-[#fff0c8]"
                  >
                    Продовжити навчання
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="relative hidden h-full min-h-[26rem] lg:block">
              <div className="absolute right-[25%] top-[22%] max-w-[13rem] rounded-[26px] border border-[#f7dfb4] bg-[#fff4dc] px-5 py-4 text-[#17362d] shadow-[0_22px_44px_rgba(20,58,44,0.14)]">
                <p className="text-2xl font-semibold leading-none">Привіт!</p>
                <p className="mt-2 text-sm font-medium leading-5 text-[#6b7a62]">
                  Обери англійську
                  <br />
                  або французьку
                </p>
                <div className="absolute -bottom-3 right-10 h-6 w-6 rotate-45 rounded-[6px] bg-[#fff4dc]" />
              </div>
            </div>
          </div>

          <div
            id="about"
            className="grid gap-3 border-t border-white/12 pt-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="rounded-[22px] bg-[rgba(8,24,16,0.42)] px-4 py-4 backdrop-blur-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-2xl font-semibold text-white">{item.value}</p>
                    <p className="mt-1 text-sm text-white/74">{item.label}</p>
                  </div>
                  <span className="text-2xl">{item.sticker}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
