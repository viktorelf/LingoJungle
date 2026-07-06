"use client";

import { useSyncExternalStore } from "react";

export type StoredOnboardingState = {
  learnerName: string;
  languageId: string | null;
  goalId: string | null;
  avatarId: string | null;
  levelId: "A1" | "A2" | "B1" | null;
  recommendedLevelId: "A1" | "A2" | "B1" | null;
  placementCompleted: boolean;
  placementSkipped: boolean;
};

const STORAGE_KEY = "lingo-jungle-onboarding";
const STORAGE_EVENT = "lingo-jungle-onboarding-change";
let cachedOnboardingRaw: string | null = null;
let cachedOnboardingValue: StoredOnboardingState | null = null;

const DEFAULT_STATE: StoredOnboardingState = {
  learnerName: "",
  languageId: null,
  goalId: null,
  avatarId: null,
  levelId: null,
  recommendedLevelId: null,
  placementCompleted: false,
  placementSkipped: false,
};

export function getStoredOnboardingState(): StoredOnboardingState {
  if (typeof window === "undefined") return DEFAULT_STATE;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;

    if (raw === cachedOnboardingRaw && cachedOnboardingValue) {
      return cachedOnboardingValue;
    }

    const saved = JSON.parse(raw) as Partial<StoredOnboardingState>;
    cachedOnboardingRaw = raw;
    cachedOnboardingValue = {
      learnerName: saved.learnerName ?? "",
      languageId: saved.languageId ?? null,
      goalId: saved.goalId ?? null,
      avatarId: saved.avatarId ?? null,
      levelId: saved.levelId ?? null,
      recommendedLevelId: saved.recommendedLevelId ?? null,
      placementCompleted: saved.placementCompleted ?? false,
      placementSkipped: saved.placementSkipped ?? false,
    };

    return cachedOnboardingValue;
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveStoredOnboardingState(state: StoredOnboardingState) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch {}
}

export function subscribeStoredOnboardingState(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === STORAGE_KEY) {
      onChange();
    }
  };

  window.addEventListener(STORAGE_EVENT, onChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(STORAGE_EVENT, onChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function useStoredOnboardingState() {
  return useSyncExternalStore(
    subscribeStoredOnboardingState,
    getStoredOnboardingState,
    () => DEFAULT_STATE,
  );
}
