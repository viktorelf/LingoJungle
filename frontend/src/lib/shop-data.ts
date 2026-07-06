export type ShopItem = {
  id: string;
  name: string;
  type: "hat" | "accessory" | "companion";
  price: number;
  description: string;
  symbol: string;
  accent: string;
  coinBonusPercent?: number;
};

export type AppTheme = {
  id: string;
  name: string;
  description: string;
  accent: string;
};

export const shopItems: ShopItem[] = [
  {
    id: "leaf-crown",
    name: "Листяна корона",
    type: "hat",
    price: 80,
    description: "Тропічна корона для яскравого настрою джунглів.",
    symbol: "LC",
    accent: "from-lime-300 via-emerald-400 to-green-500",
    coinBonusPercent: 5,
  },
  {
    id: "travel-hat",
    name: "Капелюх мандрівника",
    type: "hat",
    price: 110,
    description: "Практичний капелюх дослідника для пригодницьких уроків.",
    symbol: "TH",
    accent: "from-amber-300 via-orange-300 to-yellow-400",
    coinBonusPercent: 7,
  },
  {
    id: "round-glasses",
    name: "Круглі окуляри",
    type: "accessory",
    price: 260,
    description: "Розумні окуляри для образу наставника, який пояснює правила.",
    symbol: "RG",
    accent: "from-slate-200 via-zinc-200 to-stone-300",
    coinBonusPercent: 3,
  },
  {
    id: "flower-scarf",
    name: "Квітковий шарф",
    type: "accessory",
    price: 200,
    description: "Мякий квітковий акцент для затишного стилю профілю.",
    symbol: "FS",
    accent: "from-pink-200 via-rose-200 to-orange-200",
    coinBonusPercent: 4,
  },
  {
    id: "mini-backpack",
    name: "Міні-рюкзак",
    type: "companion",
    price: 320,
    description: "Маленький рюкзак для навчальних подорожей і цілей мандрівника.",
    symbol: "MB",
    accent: "from-teal-300 via-cyan-300 to-sky-300",
    coinBonusPercent: 6,
  },
];

export const appThemes: AppTheme[] = [
  {
    id: "jungle",
    name: "Цвіт джунглів",
    description: "Свіжа зелень, тепле світло та тропічна енергія.",
    accent: "from-lime-300 via-emerald-400 to-green-500",
  },
  {
    id: "sky",
    name: "Мрійливе небо",
    description: "Чисте повітря, мякі блакитні тони та спокійний ритм уроків.",
    accent: "from-sky-200 via-cyan-200 to-blue-300",
  },
  {
    id: "flower",
    name: "Квітковий сад",
    description: "Ніжні квіти, теплі кремові фони та затишні деталі.",
    accent: "from-pink-200 via-rose-200 to-orange-200",
  },
];
