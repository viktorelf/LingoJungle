"use client";

import { useState } from "react";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function SupabaseGoogleButton() {
  const [isLoading, setIsLoading] = useState(false);
  const configured = isSupabaseConfigured();

  async function handleGoogleSignIn() {
    if (!configured || isLoading) return;

    setIsLoading(true);

    try {
      const supabase = createClient();
      const origin = window.location.origin;

      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=/onboarding`,
        },
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={!configured || isLoading}
        className="flex items-center justify-center gap-3 rounded-full border border-[rgba(18,53,42,0.08)] bg-white px-5 py-3 font-semibold text-[#17362d] shadow-[0_14px_28px_rgba(31,65,50,0.08)] transition hover:bg-[rgba(255,255,255,0.92)] disabled:cursor-not-allowed disabled:opacity-55"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff3cf] text-sm font-bold text-[#b76b00]">
          G
        </span>
        {isLoading ? "Перенаправлення..." : "Продовжити з Google"}
      </button>

      <p className="text-sm leading-6 text-[#5c7468]">
        {configured
          ? "Supabase готовий до автентифікації в браузері."
          : "Додай URL Supabase та anon key, щоб увімкнути справжній вхід через Google."}
      </p>
    </div>
  );
}
