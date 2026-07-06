import { type StoredProfile } from "@/lib/profile-storage";
import { appThemes, shopItems } from "@/lib/shop-data";

export function getThemePresentation(themeId?: string | null) {
  const theme = appThemes.find((item) => item.id === themeId) ?? appThemes[0];

  if (theme.id === "sky") {
    return {
      theme,
      pageGlow:
        "bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.28),transparent_28%),radial-gradient(circle_at_top_right,rgba(191,219,254,0.24),transparent_22%),linear-gradient(180deg,#f8fdff_0%,#eef8ff_38%,#e7f3ff_100%)]",
      primarySurface: "bg-[rgba(240,249,255,0.82)]",
      secondarySurface: "bg-[rgba(255,255,255,0.78)]",
      accentBar: "bg-[#0ea5e9]",
      accentText: "text-[#0f6e8c]",
      accentButton: "bg-[#0ea5e9] hover:bg-[#0284c7]",
    };
  }

  if (theme.id === "flower") {
    return {
      theme,
      pageGlow:
        "bg-[radial-gradient(circle_at_top_left,rgba(251,207,232,0.3),transparent_28%),radial-gradient(circle_at_top_right,rgba(253,186,116,0.18),transparent_22%),linear-gradient(180deg,#fffdf8_0%,#fff7fb_38%,#fff2ef_100%)]",
      primarySurface: "bg-[rgba(255,250,252,0.84)]",
      secondarySurface: "bg-[rgba(255,255,255,0.8)]",
      accentBar: "bg-[#f97316]",
      accentText: "text-[#b45372]",
      accentButton: "bg-[#f97316] hover:bg-[#ea580c]",
    };
  }

  return {
    theme,
    pageGlow:
      "bg-[radial-gradient(circle_at_top_left,rgba(158,219,77,0.26),transparent_28%),radial-gradient(circle_at_top_right,rgba(46,196,182,0.18),transparent_22%),linear-gradient(180deg,#fffdf7_0%,#fff9ef_38%,#f8f4df_100%)]",
    primarySurface: "bg-[rgba(255,255,255,0.72)]",
    secondarySurface: "bg-[rgba(255,255,255,0.82)]",
    accentBar: "bg-[#2f8f5b]",
    accentText: "text-[#2f8f5b]",
    accentButton: "bg-[#2f8f5b] hover:bg-[#25764b]",
  };
}

export function getEquippedItems(profile: StoredProfile | null) {
  if (!profile) return [];
  return shopItems.filter((item) => profile.equippedItemIds.includes(item.id));
}

export function getEquippedCoinBonusPercent(profile: StoredProfile | null) {
  return getEquippedItems(profile).reduce(
    (total, item) => total + (item.coinBonusPercent ?? 0),
    0,
  );
}
