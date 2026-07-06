"use client";

import { saveStoredOnboardingState } from "@/lib/onboarding-storage";
import {
  getStoredProfile,
  saveStoredProfile,
} from "@/lib/profile-storage";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type SyncProfileInput = {
  displayName?: string;
  languageId: string;
  goalId: string;
  avatarId: string;
  selectedLevelId?: "A1" | "A2" | "B1";
  recommendedLevelId?: "A1" | "A2" | "B1" | null;
  placementCompleted?: boolean;
  coins?: number;
  totalCorrectAnswers?: number;
  totalAnswered?: number;
};

type SyncLessonResultInput = {
  lessonId: string;
  languageId: string;
  goalId: string;
  avatarId: string;
  scorePercent: number;
  correctAnswers: number;
  totalAnswers: number;
  coinsEarned: number;
  weakTopics: string[];
};

type SyncInventoryInput = {
  itemIds: string[];
  equippedItemIds: string[];
};

type SyncThemeInput = {
  themeId: string;
};

type ProfileRow = {
  display_name: string | null;
  selected_language_id: string | null;
  selected_goal_id: string | null;
  selected_avatar_id: string | null;
  selected_theme_id: string | null;
  selected_level_code: string | null;
  recommended_level_code: string | null;
  placement_completed: boolean;
  coins: number;
  level_code: string | null;
};

export async function syncProfileSelection(input: SyncProfileInput) {
  if (!isSupabaseConfigured()) return false;

  try {
    const supabase = createClient();
    const currentProfile = getStoredProfile();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return false;

    const [languageId, goalId, avatarId] = await Promise.all([
      lookupId("languages", "code", input.languageId),
      lookupId("goals", "slug", input.goalId),
      lookupId("avatars", "slug", input.avatarId),
    ]);

    if (!languageId || !goalId || !avatarId) return false;

    const selectedLevelCode =
      input.selectedLevelId ?? currentProfile?.selectedLevelId ?? "A1";
    const recommendedLevelCode =
      input.recommendedLevelId !== undefined
        ? input.recommendedLevelId
        : currentProfile?.recommendedLevelId ?? null;
    const placementCompleted =
      input.placementCompleted !== undefined
        ? input.placementCompleted
        : currentProfile?.placementCompleted ?? Boolean(recommendedLevelCode);

    const payload = {
      id: session.user.id,
      display_name: input.displayName ?? currentProfile?.learnerName ?? null,
      selected_language_id: languageId,
      selected_goal_id: goalId,
      selected_avatar_id: avatarId,
      selected_level_code: selectedLevelCode,
      recommended_level_code: recommendedLevelCode,
      placement_completed: placementCompleted,
      level_code: recommendedLevelCode ?? selectedLevelCode,
      coins: input.coins ?? currentProfile?.coins ?? 0,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").upsert(payload);
    return !error;
  } catch {
    return false;
  }
}

export async function syncLessonResult(input: SyncLessonResultInput) {
  if (!isSupabaseConfigured()) return false;

  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return false;

    const lessonId = await lookupLessonIdWithFallback(
      input.languageId,
      input.goalId,
      input.lessonId,
    );
    if (!lessonId) return false;

    const { error } = await supabase.from("lesson_results").insert({
      user_id: session.user.id,
      lesson_id: lessonId,
      score_percent: input.scorePercent,
      correct_answers: input.correctAnswers,
      total_answers: input.totalAnswers,
      coins_earned: input.coinsEarned,
      weak_topics: input.weakTopics,
    });

    return !error;
  } catch {
    return false;
  }
}

export async function syncInventoryState(input: SyncInventoryInput) {
  if (!isSupabaseConfigured()) return false;

  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return false;

    const itemRecords = await Promise.all(
      input.itemIds.map(async (itemId) => {
        const avatarItemId = await lookupId("avatar_items", "slug", itemId);
        if (!avatarItemId) return null;

        return {
          user_id: session.user.id,
          avatar_item_id: avatarItemId,
          equipped: input.equippedItemIds.includes(itemId),
        };
      }),
    );

    const validRecords = itemRecords.filter(
      (
        item,
      ): item is {
        user_id: string;
        avatar_item_id: string;
        equipped: boolean;
      } => Boolean(item),
    );

    if (!validRecords.length) return true;

    const { error } = await supabase
      .from("user_inventory")
      .upsert(validRecords, { onConflict: "user_id,avatar_item_id" });

    return !error;
  } catch {
    return false;
  }
}

export async function syncThemeSelection(input: SyncThemeInput) {
  if (!isSupabaseConfigured()) return false;

  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return false;

    const themeId = await lookupId("themes", "slug", input.themeId);
    if (!themeId) return false;

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: session.user.id,
        selected_theme_id: themeId,
        updated_at: new Date().toISOString(),
      });

    return !error;
  } catch {
    return false;
  }
}

export async function hydrateLocalProfileFromSupabase() {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return null;

    const { data: profileRow, error: profileError } = await supabase
      .from("profiles")
      .select(
        "display_name, selected_language_id, selected_goal_id, selected_avatar_id, selected_theme_id, selected_level_code, recommended_level_code, placement_completed, coins, level_code",
      )
      .eq("id", session.user.id)
      .maybeSingle<ProfileRow>();

    if (profileError || !profileRow) return null;

    const [languageId, goalId, avatarId, themeId] = await Promise.all([
      profileRow.selected_language_id
        ? lookupValueById("languages", "code", profileRow.selected_language_id)
        : null,
      profileRow.selected_goal_id
        ? lookupValueById("goals", "slug", profileRow.selected_goal_id)
        : null,
      profileRow.selected_avatar_id
        ? lookupValueById("avatars", "slug", profileRow.selected_avatar_id)
        : null,
      profileRow.selected_theme_id
        ? lookupValueById("themes", "slug", profileRow.selected_theme_id)
        : null,
    ]);

    const current = getStoredProfile();
    const inventory = await fetchInventorySnapshot();
    const lessonSummary = await fetchLessonSummary();

    const nextLanguageId = languageId ?? current?.languageId ?? null;
    const nextGoalId = goalId ?? current?.goalId ?? null;
    const nextAvatarId = avatarId ?? current?.avatarId ?? null;

    if (!(nextLanguageId && nextGoalId && nextAvatarId)) {
      return null;
    }

    const selectedLevelCode =
      (profileRow.selected_level_code as "A1" | "A2" | "B1" | null) ??
      (profileRow.level_code as "A1" | "A2" | "B1" | null) ??
      "A1";
    const recommendedLevelCode = profileRow.placement_completed
      ? ((profileRow.recommended_level_code as "A1" | "A2" | "B1" | null) ??
        (profileRow.level_code as "A1" | "A2" | "B1" | null) ??
        null)
      : null;

    const nextProfile = {
      languageId: nextLanguageId,
      goalId: nextGoalId,
      avatarId: nextAvatarId,
      learnerName: profileRow.display_name ?? current?.learnerName ?? "",
      selectedLevelId: selectedLevelCode,
      recommendedLevelId: recommendedLevelCode,
      placementCompleted: profileRow.placement_completed ?? false,
      coins: profileRow.coins ?? current?.coins ?? 0,
      totalCorrectAnswers:
        lessonSummary?.totalCorrectAnswers ?? current?.totalCorrectAnswers ?? 0,
      totalAnswered: lessonSummary?.totalAnswered ?? current?.totalAnswered ?? 0,
      completedLessonIds:
        lessonSummary?.completedLessonIds ?? current?.completedLessonIds ?? [],
      lessonHistory: lessonSummary?.lessonHistory ?? current?.lessonHistory ?? [],
      lastLessonScore:
        lessonSummary?.lastLessonScore ?? current?.lastLessonScore ?? null,
      ownedItemIds: inventory?.ownedItemIds ?? current?.ownedItemIds ?? [],
      equippedItemIds:
        inventory?.equippedItemIds ?? current?.equippedItemIds ?? [],
      selectedThemeId: themeId ?? current?.selectedThemeId ?? "jungle",
    };

    saveStoredProfile(nextProfile);
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

    return nextProfile;
  } catch {
    return null;
  }
}

async function lookupId(
  table: "languages" | "goals" | "avatars" | "lessons" | "avatar_items" | "themes",
  column: "code" | "slug",
  value: string,
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq(column, value)
    .maybeSingle();

  if (error) return null;
  return data?.id ?? null;
}

async function lookupLessonIdWithFallback(
  languageId: string,
  goalId: string,
  lessonId: string,
) {
  const directMatch = await lookupId("lessons", "slug", lessonId);
  if (directMatch) return directMatch;

  return lookupId("lessons", "slug", `${languageId}-${goalId}-${lessonId}`);
}

async function lookupValueById(
  table: "languages" | "goals" | "avatars" | "themes",
  column: "code" | "slug",
  id: string,
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(table)
    .select(column)
    .eq("id", id)
    .maybeSingle();

  if (error) return null;
  const row = data as Record<string, string> | null;
  return row?.[column] ?? null;
}

async function fetchInventorySnapshot() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return null;

  const { data: inventoryRows, error } = await supabase
    .from("user_inventory")
    .select("avatar_item_id, equipped")
    .eq("user_id", session.user.id);

  if (error || !inventoryRows?.length) {
    return { ownedItemIds: [], equippedItemIds: [] };
  }

  const itemIds = inventoryRows.map((row) => row.avatar_item_id);
  const { data: itemRows, error: itemError } = await supabase
    .from("avatar_items")
    .select("id, slug")
    .in("id", itemIds);

  if (itemError || !itemRows?.length) {
    return { ownedItemIds: [], equippedItemIds: [] };
  }

  const slugById = new Map(itemRows.map((item) => [item.id, item.slug]));
  const ownedItemIds = inventoryRows
    .map((row) => slugById.get(row.avatar_item_id))
    .filter((value): value is string => Boolean(value));
  const equippedItemIds = inventoryRows
    .filter((row) => row.equipped)
    .map((row) => slugById.get(row.avatar_item_id))
    .filter((value): value is string => Boolean(value));

  return { ownedItemIds, equippedItemIds };
}

async function fetchLessonSummary() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return null;

  const { data: resultRows, error } = await supabase
    .from("lesson_results")
    .select("lesson_id, score_percent, correct_answers, total_answers, completed_at")
    .eq("user_id", session.user.id)
    .order("completed_at", { ascending: false });

  if (error || !resultRows?.length) {
    return {
      totalCorrectAnswers: 0,
      totalAnswered: 0,
      completedLessonIds: [],
      lessonHistory: [],
      lastLessonScore: null,
    };
  }

  const lessonIds = resultRows.map((row) => row.lesson_id);
  const { data: lessonRows, error: lessonError } = await supabase
    .from("lessons")
    .select("id, slug")
    .in("id", lessonIds);

  if (lessonError || !lessonRows?.length) {
    return {
      totalCorrectAnswers: resultRows.reduce((sum, row) => sum + row.correct_answers, 0),
      totalAnswered: resultRows.reduce((sum, row) => sum + row.total_answers, 0),
      completedLessonIds: [],
      lessonHistory: resultRows.map((row) => ({
        lessonId: row.lesson_id,
        completedAt: row.completed_at,
        scorePercent: Number(row.score_percent ?? 0) || 0,
      })),
      lastLessonScore: Number(resultRows[0]?.score_percent ?? 0) || null,
    };
  }

  const slugById = new Map(lessonRows.map((lesson) => [lesson.id, lesson.slug]));

  return {
    totalCorrectAnswers: resultRows.reduce((sum, row) => sum + row.correct_answers, 0),
    totalAnswered: resultRows.reduce((sum, row) => sum + row.total_answers, 0),
    completedLessonIds: Array.from(
      new Set(
        resultRows
          .map((row) => slugById.get(row.lesson_id))
          .map((slug) => normalizeLessonSlug(slug))
          .filter((value): value is string => Boolean(value)),
      ),
    ),
    lessonHistory: resultRows.map((row) => ({
      lessonId: normalizeLessonSlug(slugById.get(row.lesson_id)) ?? row.lesson_id,
      completedAt: row.completed_at,
      scorePercent: Number(row.score_percent ?? 0) || 0,
    })),
    lastLessonScore: Number(resultRows[0]?.score_percent ?? 0) || null,
  };
}

function normalizeLessonSlug(slug: string | undefined) {
  if (!slug) return null;

  const parts = slug.split("-");
  if (parts.length < 3) return slug;

  const [language, goal, ...rest] = parts;
  const knownLanguages = new Set(["english", "french"]);
  const knownGoals = new Set(["travel", "work", "movies", "general"]);

  if (knownLanguages.has(language) && knownGoals.has(goal) && rest.length) {
    return rest.join("-");
  }

  return slug;
}
