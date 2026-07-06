"use client";

import { useEffect } from "react";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { hydrateLocalProfileFromSupabase } from "@/lib/supabase/profile-sync";

export function SupabaseProfileHydrator() {
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();

    void hydrateLocalProfileFromSupabase();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void hydrateLocalProfileFromSupabase();
      }

      if (event === "SIGNED_OUT" && !session) {
        return;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
