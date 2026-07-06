"use client";

import { useSyncExternalStore } from "react";

import {
  getStoredProfile,
  subscribeStoredProfile,
  type StoredProfile,
} from "@/lib/profile-storage";

export function useStoredProfile(): StoredProfile | null {
  return useSyncExternalStore(subscribeStoredProfile, getStoredProfile, () => null);
}
