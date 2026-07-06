export type StoredTrackSummary = {
  key: string;
  languageId: string;
  goalId: string;
  avatarId: string;
  selectedLevelId: "A1" | "A2" | "B1";
  recommendedLevelId: "A1" | "A2" | "B1" | null;
  placementCompleted: boolean;
  completedLessonsCount: number;
  lastLessonScore: number | null;
};

export type LessonActivity = {
  lessonId: string;
  completedAt: string;
  scorePercent: number;
};

export type StoredProfile = {
  learnerName: string;
  activeTrackKey: string;
  savedTracks: StoredTrackSummary[];
  languageId: string;
  goalId: string;
  avatarId: string;
  selectedLevelId: "A1" | "A2" | "B1";
  recommendedLevelId: "A1" | "A2" | "B1" | null;
  placementCompleted: boolean;
  coins: number;
  totalCorrectAnswers: number;
  totalAnswered: number;
  completedLessonIds: string[];
  lessonHistory: LessonActivity[];
  lastLessonScore: number | null;
  ownedItemIds: string[];
  equippedItemIds: string[];
  selectedThemeId: string | null;
  streakDays: number;
  weeklyGoalCurrent: number;
  weeklyGoalTarget: number;
};

export type WeeklyActivityDay = {
  key: string;
  label: string;
  active: boolean;
  completedLessons: number;
};

type ActiveStoredProfileInput = Omit<
  StoredProfile,
  "activeTrackKey" | "savedTracks" | "streakDays" | "weeklyGoalCurrent" | "weeklyGoalTarget"
>;

type StoredTrack = {
  key: string;
  languageId: string;
  goalId: string;
  avatarId: string;
  selectedLevelId: "A1" | "A2" | "B1";
  recommendedLevelId: "A1" | "A2" | "B1" | null;
  placementCompleted: boolean;
  completedLessonIds: string[];
  lessonHistory: LessonActivity[];
  lastLessonScore: number | null;
};

type StoredProfileState = {
  activeTrackKey: string | null;
  tracks: StoredTrack[];
  shared: {
    learnerName: string;
    coins: number;
    totalCorrectAnswers: number;
    totalAnswered: number;
    ownedItemIds: string[];
    equippedItemIds: string[];
    selectedThemeId: string | null;
  };
};

const PROFILE_KEY = "lingo-jungle-profile";
const PROFILE_EVENT = "lingo-jungle-profile-change";
let cachedProfileRaw: string | null = null;
let cachedProfileValue: StoredProfile | null = null;

function buildTrackKey(
  languageId: string,
  goalId: string,
  levelId: "A1" | "A2" | "B1",
) {
  return `${languageId}:${goalId}:${levelId}`;
}

function defaultState(): StoredProfileState {
  return {
    activeTrackKey: null,
    tracks: [],
    shared: {
      coins: 0,
      learnerName: "",
      totalCorrectAnswers: 0,
      totalAnswered: 0,
      ownedItemIds: [],
      equippedItemIds: [],
      selectedThemeId: "jungle",
    },
  };
}

function normalizeTrack(track: StoredTrack): StoredTrack {
  const selectedLevelId = track.selectedLevelId ?? "A1";
  const completedLessonIds = (track.completedLessonIds ?? []).filter((lessonId) =>
    lessonBelongsToTrack(lessonId, track.languageId, track.goalId, selectedLevelId),
  );
  const lessonHistory = (track.lessonHistory ?? []).filter((item) =>
    lessonBelongsToTrack(item.lessonId, track.languageId, track.goalId, selectedLevelId),
  );

  return {
    key: buildTrackKey(track.languageId, track.goalId, selectedLevelId),
    languageId: track.languageId,
    goalId: track.goalId,
    avatarId: track.avatarId,
    selectedLevelId,
    recommendedLevelId: track.recommendedLevelId ?? null,
    placementCompleted: track.placementCompleted ?? false,
    completedLessonIds,
    lessonHistory,
    lastLessonScore: track.lastLessonScore ?? null,
  };
}

function migrateState(raw: string): StoredProfileState | null {
  const parsed = JSON.parse(raw) as
    | StoredProfileState
    | (Omit<StoredProfile, "activeTrackKey" | "savedTracks"> & {
        activeTrackKey?: string;
        savedTracks?: StoredTrackSummary[];
      });

  if ("tracks" in parsed && "shared" in parsed) {
    const state = parsed as StoredProfileState;
    const normalizedTracks = (state.tracks ?? []).reduce<StoredTrack[]>((acc, track) => {
      return upsertTrack(acc, normalizeTrack(track));
    }, []);
    const normalizedActiveTrackKey =
      normalizedTracks.find((track) => track.key === state.activeTrackKey)?.key ??
      normalizedTracks[0]?.key ??
      null;

    return {
      activeTrackKey: normalizedActiveTrackKey,
      tracks: normalizedTracks,
      shared: {
        coins: state.shared?.coins ?? 0,
        learnerName: state.shared?.learnerName ?? "",
        totalCorrectAnswers: state.shared?.totalCorrectAnswers ?? 0,
        totalAnswered: state.shared?.totalAnswered ?? 0,
        ownedItemIds: state.shared?.ownedItemIds ?? [],
        equippedItemIds: state.shared?.equippedItemIds ?? [],
        selectedThemeId: state.shared?.selectedThemeId ?? "jungle",
      },
    };
  }

  if (!("languageId" in parsed) || !parsed.languageId || !parsed.goalId || !parsed.avatarId) {
    return null;
  }

  const legacyTrackKey = buildTrackKey(
    parsed.languageId,
    parsed.goalId,
    parsed.selectedLevelId ?? "A1",
  );

  return {
    activeTrackKey: legacyTrackKey,
    tracks: [
      normalizeTrack({
        key: legacyTrackKey,
        languageId: parsed.languageId,
        goalId: parsed.goalId,
        avatarId: parsed.avatarId,
        selectedLevelId: parsed.selectedLevelId ?? "A1",
        recommendedLevelId: parsed.recommendedLevelId ?? null,
        placementCompleted: parsed.placementCompleted ?? false,
        completedLessonIds: parsed.completedLessonIds ?? [],
        lessonHistory: [],
        lastLessonScore: parsed.lastLessonScore ?? null,
      }),
    ],
    shared: {
      coins: parsed.coins ?? 0,
      learnerName: "",
      totalCorrectAnswers: parsed.totalCorrectAnswers ?? 0,
      totalAnswered: parsed.totalAnswered ?? 0,
      ownedItemIds: parsed.ownedItemIds ?? [],
      equippedItemIds: parsed.equippedItemIds ?? [],
      selectedThemeId: parsed.selectedThemeId ?? "jungle",
    },
  };
}

function readProfileState(): StoredProfileState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return migrateState(raw);
  } catch {
    return null;
  }
}

function writeProfileState(state: StoredProfileState) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(PROFILE_EVENT));
  } catch {}
}

function buildStoredProfile(state: StoredProfileState): StoredProfile | null {
  const activeTrack =
    state.tracks.find((track) => track.key === state.activeTrackKey) ?? state.tracks[0];

  if (!activeTrack) return null;

  const streakDays = calculateStreakDays(activeTrack.lessonHistory);
  const weeklyGoalCurrent = calculateWeeklyGoalCurrent(activeTrack.lessonHistory);
  const weeklyGoalTarget = 6;

  return {
    activeTrackKey: activeTrack.key,
    savedTracks: state.tracks.map((track) => ({
      key: track.key,
      languageId: track.languageId,
      goalId: track.goalId,
      avatarId: track.avatarId,
      selectedLevelId: track.selectedLevelId,
      recommendedLevelId: track.recommendedLevelId,
      placementCompleted: track.placementCompleted,
      completedLessonsCount: track.completedLessonIds.length,
      lastLessonScore: track.lastLessonScore,
    })),
    languageId: activeTrack.languageId,
    goalId: activeTrack.goalId,
    avatarId: activeTrack.avatarId,
    selectedLevelId: activeTrack.selectedLevelId,
    recommendedLevelId: activeTrack.recommendedLevelId,
    placementCompleted: activeTrack.placementCompleted,
    completedLessonIds: activeTrack.completedLessonIds,
    lessonHistory: activeTrack.lessonHistory,
    lastLessonScore: activeTrack.lastLessonScore,
    learnerName: state.shared.learnerName,
    coins: state.shared.coins,
    totalCorrectAnswers: state.shared.totalCorrectAnswers,
    totalAnswered: state.shared.totalAnswered,
    ownedItemIds: state.shared.ownedItemIds,
    equippedItemIds: state.shared.equippedItemIds,
    selectedThemeId: state.shared.selectedThemeId,
    streakDays,
    weeklyGoalCurrent,
    weeklyGoalTarget,
  };
}

export function getStoredProfile(): StoredProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    if (raw === cachedProfileRaw) {
      return cachedProfileValue;
    }

    const state = migrateState(raw);
    cachedProfileRaw = raw;
    cachedProfileValue = state ? buildStoredProfile(state) : null;
    return cachedProfileValue;
  } catch {
    return null;
  }
}

export function saveStoredProfile(profile: ActiveStoredProfileInput) {
  const currentState = readProfileState() ?? defaultState();
  const trackKey = buildTrackKey(profile.languageId, profile.goalId, profile.selectedLevelId);
  const nextTrack: StoredTrack = normalizeTrack({
    key: trackKey,
    languageId: profile.languageId,
    goalId: profile.goalId,
    avatarId: profile.avatarId,
    selectedLevelId: profile.selectedLevelId,
    recommendedLevelId: profile.recommendedLevelId,
    placementCompleted: profile.placementCompleted,
    completedLessonIds: profile.completedLessonIds,
    lessonHistory: profile.lessonHistory,
    lastLessonScore: profile.lastLessonScore,
  });

  const nextTracks = upsertTrack(currentState.tracks, nextTrack);
  writeProfileState({
    activeTrackKey: trackKey,
    tracks: nextTracks,
    shared: {
      coins: profile.coins,
      learnerName: profile.learnerName,
      totalCorrectAnswers: profile.totalCorrectAnswers,
      totalAnswered: profile.totalAnswered,
      ownedItemIds: profile.ownedItemIds,
      equippedItemIds: profile.equippedItemIds,
      selectedThemeId: profile.selectedThemeId,
    },
  });
}

export function subscribeStoredProfile(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === PROFILE_KEY) {
      onChange();
    }
  };

  window.addEventListener(PROFILE_EVENT, onChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(PROFILE_EVENT, onChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function clearStoredProfile() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(PROFILE_KEY);
    cachedProfileRaw = null;
    cachedProfileValue = null;
    window.dispatchEvent(new Event(PROFILE_EVENT));
  } catch {}
}

export function setActiveStoredTrack(trackKey: string) {
  const state = readProfileState();
  if (!state) return null;

  const targetTrack = state.tracks.find((track) => track.key === trackKey);
  if (!targetTrack) return null;

  const nextState: StoredProfileState = {
    ...state,
    activeTrackKey: trackKey,
  };

  writeProfileState(nextState);
  return buildStoredProfile(nextState);
}

export function upsertStoredProfile(
  partial: Partial<StoredProfile> &
    Pick<StoredProfile, "languageId" | "goalId" | "avatarId">,
) {
  const currentState = readProfileState() ?? defaultState();
  const currentProfile = buildStoredProfile(currentState);
  const selectedLevelId =
    partial.selectedLevelId ?? currentProfile?.selectedLevelId ?? "A1";
  const trackKey = buildTrackKey(partial.languageId, partial.goalId, selectedLevelId);
  const existingTrack =
    currentState.tracks.find((track) => track.key === trackKey) ??
    currentState.tracks.find(
      (track) =>
        track.languageId === partial.languageId &&
        track.goalId === partial.goalId &&
        track.selectedLevelId === selectedLevelId,
    );
  const recommendedLevelId =
    partial.recommendedLevelId !== undefined
      ? partial.recommendedLevelId
      : existingTrack?.recommendedLevelId ?? currentProfile?.recommendedLevelId ?? null;
  const placementCompleted =
    partial.placementCompleted !== undefined
      ? partial.placementCompleted
      : existingTrack?.placementCompleted ?? currentProfile?.placementCompleted ?? false;

  const nextTrack: StoredTrack = normalizeTrack({
    key: trackKey,
    languageId: partial.languageId,
    goalId: partial.goalId,
    avatarId: partial.avatarId,
    selectedLevelId,
    recommendedLevelId,
    placementCompleted,
    completedLessonIds:
      partial.completedLessonIds ??
      existingTrack?.completedLessonIds ??
      currentProfile?.completedLessonIds ??
      [],
    lessonHistory:
      partial.lessonHistory ??
      existingTrack?.lessonHistory ??
      currentProfile?.lessonHistory ??
      [],
    lastLessonScore:
      partial.lastLessonScore ??
      existingTrack?.lastLessonScore ??
      currentProfile?.lastLessonScore ??
      null,
  });

  const nextState: StoredProfileState = {
    activeTrackKey: trackKey,
    tracks: upsertTrack(currentState.tracks, nextTrack),
    shared: {
      coins: partial.coins ?? currentState.shared.coins,
      learnerName: partial.learnerName ?? currentState.shared.learnerName,
      totalCorrectAnswers:
        partial.totalCorrectAnswers ?? currentState.shared.totalCorrectAnswers,
      totalAnswered: partial.totalAnswered ?? currentState.shared.totalAnswered,
      ownedItemIds: currentState.shared.ownedItemIds,
      equippedItemIds: currentState.shared.equippedItemIds,
      selectedThemeId: currentState.shared.selectedThemeId,
    },
  };

  writeProfileState(nextState);
  return buildStoredProfile(nextState);
}

export function recordLessonCompletion(input: {
  languageId: string;
  goalId: string;
  avatarId: string;
  selectedLevelId: "A1" | "A2" | "B1";
  lessonId: string;
  correctAnswers: number;
  totalAnswers: number;
  coinsEarned: number;
}) {
  const currentState = readProfileState() ?? defaultState();
  const currentProfile = buildStoredProfile(currentState);
  const trackKey = buildTrackKey(input.languageId, input.goalId, input.selectedLevelId);
  const existingTrack =
    currentState.tracks.find((track) => track.key === trackKey) ??
    currentState.tracks.find(
      (track) =>
        track.languageId === input.languageId &&
        track.goalId === input.goalId &&
        track.selectedLevelId === input.selectedLevelId,
    );
  const isRepeatLesson = (existingTrack?.completedLessonIds ?? []).includes(input.lessonId);
  const completedLessonIds = Array.from(
    new Set([...(existingTrack?.completedLessonIds ?? []), input.lessonId]),
  );
  const awardedCoins = isRepeatLesson
    ? Math.max(1, Math.floor(input.coinsEarned / 2))
    : input.coinsEarned;
  const lessonHistory = [
    ...(existingTrack?.lessonHistory ?? []),
    {
      lessonId: input.lessonId,
      completedAt: new Date().toISOString(),
      scorePercent: Math.round((input.correctAnswers / input.totalAnswers) * 100),
    },
  ];

  const nextTrack: StoredTrack = normalizeTrack({
    key: trackKey,
    languageId: input.languageId,
    goalId: input.goalId,
    avatarId: input.avatarId,
    selectedLevelId: input.selectedLevelId,
    recommendedLevelId:
      existingTrack?.recommendedLevelId ?? currentProfile?.recommendedLevelId ?? null,
    placementCompleted:
      existingTrack?.placementCompleted ?? currentProfile?.placementCompleted ?? false,
    completedLessonIds,
    lessonHistory,
    lastLessonScore: Math.round((input.correctAnswers / input.totalAnswers) * 100),
  });

  const nextState: StoredProfileState = {
    activeTrackKey: trackKey,
    tracks: upsertTrack(currentState.tracks, nextTrack),
    shared: {
      ...currentState.shared,
      coins: currentState.shared.coins + awardedCoins,
      totalCorrectAnswers: currentState.shared.totalCorrectAnswers + input.correctAnswers,
      totalAnswered: currentState.shared.totalAnswered + input.totalAnswers,
    },
  };

  writeProfileState(nextState);
  return {
    profile: buildStoredProfile(nextState)!,
    awardedCoins,
    isRepeatLesson,
  };
}

export function purchaseProfileItem(itemId: string, price: number) {
  const currentState = readProfileState();
  if (!currentState) return { ok: false as const, reason: "missing-profile" };
  if (currentState.shared.ownedItemIds.includes(itemId)) {
    return { ok: false as const, reason: "already-owned" };
  }
  if (currentState.shared.coins < price) {
    return { ok: false as const, reason: "not-enough-coins" };
  }

  const nextState: StoredProfileState = {
    ...currentState,
    shared: {
      ...currentState.shared,
      coins: currentState.shared.coins - price,
      ownedItemIds: [...currentState.shared.ownedItemIds, itemId],
    },
  };

  writeProfileState(nextState);
  return { ok: true as const, profile: buildStoredProfile(nextState)! };
}

export function equipProfileItem(itemId: string) {
  const currentState = readProfileState();
  if (!currentState) return null;
  if (!currentState.shared.ownedItemIds.includes(itemId)) return null;

  const nextState: StoredProfileState = {
    ...currentState,
    shared: {
      ...currentState.shared,
      equippedItemIds: currentState.shared.equippedItemIds.includes(itemId)
        ? currentState.shared.equippedItemIds.filter((id) => id !== itemId)
        : [...currentState.shared.equippedItemIds, itemId],
    },
  };

  writeProfileState(nextState);
  return buildStoredProfile(nextState);
}

export function selectProfileTheme(themeId: string) {
  const currentState = readProfileState();
  if (!currentState) return null;

  const nextState: StoredProfileState = {
    ...currentState,
    shared: {
      ...currentState.shared,
      selectedThemeId: themeId,
    },
  };

  writeProfileState(nextState);
  return buildStoredProfile(nextState);
}

export function getCurrentWeekActivity(lessonHistory: LessonActivity[]): WeeklyActivityDay[] {
  const weekDays = getCurrentWeekDays();
  const grouped = new Map<string, Set<string>>();

  for (const item of lessonHistory) {
    const dayKey = toLocalDayKey(item.completedAt);
    const existing = grouped.get(dayKey) ?? new Set<string>();
    existing.add(item.lessonId);
    grouped.set(dayKey, existing);
  }

  return weekDays.map((day, index) => {
    const lessons = grouped.get(day.key);

    return {
      key: day.key,
      label: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"][index],
      active: Boolean(lessons?.size),
      completedLessons: lessons?.size ?? 0,
    };
  });
}

function upsertTrack(tracks: StoredTrack[], nextTrack: StoredTrack) {
  const existingIndex = tracks.findIndex((track) => track.key === nextTrack.key);
  if (existingIndex === -1) {
    return [...tracks, nextTrack];
  }

  const copy = [...tracks];
  copy[existingIndex] = nextTrack;
  return copy;
}

function calculateStreakDays(lessonHistory: LessonActivity[]) {
  if (!lessonHistory.length) return 0;

  const dayKeys = Array.from(
    new Set(lessonHistory.map((item) => toLocalDayKey(item.completedAt))),
  ).sort();

  const lastKey = dayKeys[dayKeys.length - 1];
  const todayKey = toLocalDayKey(new Date().toISOString());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toLocalDayKey(yesterday.toISOString());

  if (lastKey !== todayKey && lastKey !== yesterdayKey) {
    return 0;
  }

  let streak = 1;
  const cursor = new Date(`${lastKey}T12:00:00`);

  while (true) {
    cursor.setDate(cursor.getDate() - 1);
    const previousKey = toLocalDayKey(cursor.toISOString());
    if (!dayKeys.includes(previousKey)) break;
    streak += 1;
  }

  return streak;
}

function calculateWeeklyGoalCurrent(lessonHistory: LessonActivity[]) {
  if (!lessonHistory.length) return 0;

  const currentWeekKeys = new Set(getCurrentWeekDays().map((day) => day.key));
  const uniqueLessons = new Set<string>();

  for (const item of lessonHistory) {
    const dayKey = toLocalDayKey(item.completedAt);
    if (!currentWeekKeys.has(dayKey)) continue;
    uniqueLessons.add(`${dayKey}:${item.lessonId}`);
  }

  return uniqueLessons.size;
}

function toLocalDayKey(iso: string) {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function lessonBelongsToTrack(
  lessonId: string,
  languageId: string,
  goalId: string,
  levelId: "A1" | "A2" | "B1",
) {
  const normalizedLessonId = lessonId.toLowerCase();
  const normalizedLevel = levelId.toLowerCase();
  const goalSlug = normalizeGoalSlug(goalId);
  const languagePrefixes = [languageId.toLowerCase(), toSeedLanguagePrefix(languageId)];

  for (const languagePrefix of languagePrefixes) {
    const prefix = `${languagePrefix}-${normalizedLevel}-`;
    if (!normalizedLessonId.startsWith(prefix)) continue;

    const remainder = normalizedLessonId.slice(prefix.length);
    if (remainder.startsWith(`${goalSlug}-`)) {
      return true;
    }

    if (!startsWithKnownGoal(remainder)) {
      return true;
    }
  }

  return false;
}

function normalizeGoalSlug(goalId: string) {
  if (goalId === "general") {
    return "self-development";
  }

  return goalId.toLowerCase();
}

function toSeedLanguagePrefix(languageId: string) {
  return languageId === "french" ? "fr" : "en";
}

function startsWithKnownGoal(value: string) {
  return [
    "travel-",
    "work-",
    "movies-",
    "general-",
    "self-development-",
  ].some((prefix) => value.startsWith(prefix));
}

function getCurrentWeekDays() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      key: toLocalDayKey(date.toISOString()),
      date,
    };
  });
}
