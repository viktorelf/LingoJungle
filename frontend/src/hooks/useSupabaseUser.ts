"use client";

import { useEffect, useState } from "react";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type SupabaseUserSnapshot = {
  id: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
};

export function useSupabaseUser() {
  const [user, setUser] = useState<SupabaseUserSnapshot | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();

    function mapUser(authUser: {
      id: string;
      email?: string | null;
      user_metadata?: Record<string, unknown>;
    } | null) {
      if (!authUser) {
        setUser(null);
        return;
      }

      const metadata = authUser.user_metadata ?? {};
      const displayName =
        typeof metadata.full_name === "string"
          ? metadata.full_name
          : typeof metadata.name === "string"
            ? metadata.name
            : authUser.email?.split("@")[0] ?? "Learner";
      const avatarUrl =
        typeof metadata.avatar_url === "string" ? metadata.avatar_url : null;

      setUser({
        id: authUser.id,
        email: authUser.email ?? null,
        displayName,
        avatarUrl,
      });
    }

    void supabase.auth.getUser().then(({ data }) => mapUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        mapUser(session.user);
        return;
      }

      const { data } = await supabase.auth.getUser();
      mapUser(data.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  return user;
}
