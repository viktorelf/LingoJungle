import { type LanguageId } from "@/lib/lesson-data";

export type PlacementQuestion = {
  id: string;
  prompt: string;
  levelBand: "A1" | "A2" | "B1";
  topic: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
};

const englishPlacementQuestions: PlacementQuestion[] = [
  {
    id: "en-pq-1",
    prompt: 'Оберіть правильне речення: "She ___ from Spain."',
    levelBand: "A1",
    topic: "present simple",
    choices: ["is", "are", "am", "be"],
    correctAnswer: "is",
    explanation: "З займенником 'she' у простих реченнях про ідентичність використовуємо 'is'.",
  },
  {
    id: "en-pq-2",
    prompt: "Оберіть речення з правильним артиклем.",
    levelBand: "A1",
    topic: "articles",
    choices: [
      "She is an engineer.",
      "She is engineer.",
      "She is the engineer.",
      "She is a engineer.",
    ],
    correctAnswer: "She is an engineer.",
    explanation: "Артикль 'an' ставимо перед голосним звуком, як у слові 'engineer'.",
  },
  {
    id: "en-pq-3",
    prompt: 'Оберіть найкращий варіант: "I go to work ___ bus."',
    levelBand: "A2",
    topic: "prepositions",
    choices: ["by", "with", "on", "at"],
    correctAnswer: "by",
    explanation: "Зазвичай кажемо 'by bus', 'by train' та 'by car'.",
  },
  {
    id: "en-pq-4",
    prompt: 'Оберіть найкращий сполучник: "I stayed home ___ it was raining."',
    levelBand: "A2",
    topic: "connectors",
    choices: ["because", "although", "unless", "however"],
    correctAnswer: "because",
    explanation: "'Because' вводить причину.",
  },
  {
    id: "en-pq-5",
    prompt: "Оберіть правильне речення.",
    levelBand: "B1",
    topic: "present perfect",
    choices: [
      "I have never been to Paris.",
      "I never have been to Paris.",
      "I has never been to Paris.",
      "I am never been to Paris.",
    ],
    correctAnswer: "I have never been to Paris.",
    explanation: "Present perfect будується за схемою 'have/has + past participle'.",
  },
  {
    id: "en-pq-6",
    prompt: 'Оберіть найкращий варіант: "If I had more time, I ___ French every day."',
    levelBand: "B1",
    topic: "conditionals",
    choices: ["would study", "study", "will study", "am studying"],
    correctAnswer: "would study",
    explanation: "Second conditional має форму 'if + past, would + verb'.",
  },
  {
    id: "en-pq-7",
    prompt: 'Оберіть найкращий варіант: "The report ___ by Friday."',
    levelBand: "B1",
    topic: "modals",
    choices: ["must be finished", "must finish", "must finished", "must be finish"],
    correctAnswer: "must be finished",
    explanation: "Після модальних дієслів пасив утворюється як 'be + past participle'.",
  },
  {
    id: "en-pq-8",
    prompt: 'Оберіть найкращий перефраз для "reliable".',
    levelBand: "B1",
    topic: "vocabulary",
    choices: [
      "someone you can trust",
      "someone very loud",
      "someone very nervous",
      "someone who is bored",
    ],
    correctAnswer: "someone you can trust",
    explanation: "'Reliable' означає надійний, той, кому можна довіряти.",
  },
];

const frenchPlacementQuestions: PlacementQuestion[] = [
  {
    id: "fr-pq-1",
    prompt: 'Choisissez la bonne phrase : "Elle ___ de France."',
    levelBand: "A1",
    topic: "etre",
    choices: ["est", "sont", "es", "etre"],
    correctAnswer: "est",
    explanation: "Avec 'elle', on utilise 'est'.",
  },
  {
    id: "fr-pq-2",
    prompt: "Choisissez la phrase avec le bon article.",
    levelBand: "A1",
    topic: "articles",
    choices: [
      "C'est une amie.",
      "C'est amie.",
      "C'est un amie.",
      "C'est la amie.",
    ],
    correctAnswer: "C'est une amie.",
    explanation: "On utilise 'une' avec un nom feminin singulier.",
  },
  {
    id: "fr-pq-3",
    prompt: 'Choisissez la meilleure option : "Je vais au travail ___ bus."',
    levelBand: "A2",
    topic: "prepositions",
    choices: ["en", "a", "de", "sur"],
    correctAnswer: "en",
    explanation: "En francais, on dit souvent 'en bus', 'en train', 'en voiture'.",
  },
  {
    id: "fr-pq-4",
    prompt: 'Choisissez le bon connecteur : "Je suis reste a la maison ___ il pleuvait."',
    levelBand: "A2",
    topic: "connectors",
    choices: ["parce que", "mais", "ou", "donc"],
    correctAnswer: "parce que",
    explanation: "'Parce que' introduit la cause.",
  },
  {
    id: "fr-pq-5",
    prompt: "Choisissez la phrase correcte.",
    levelBand: "B1",
    topic: "passe compose",
    choices: [
      "Je suis deja alle a Paris.",
      "Je deja suis alle a Paris.",
      "Je ai deja alle a Paris.",
      "Je suis deja aller a Paris.",
    ],
    correctAnswer: "Je suis deja alle a Paris.",
    explanation: "Avec certains verbes de mouvement, on utilise 'etre' au passe compose.",
  },
  {
    id: "fr-pq-6",
    prompt: 'Choisissez la meilleure option : "Si j avais plus de temps, je ___ plus souvent."',
    levelBand: "B1",
    topic: "conditionnel",
    choices: ["lirais", "lis", "lirai", "lisais"],
    correctAnswer: "lirais",
    explanation: "Dans une hypothese, on utilise souvent le conditionnel.",
  },
  {
    id: "fr-pq-7",
    prompt: 'Choisissez la meilleure option : "Le rapport ___ avant vendredi."',
    levelBand: "B1",
    topic: "passive",
    choices: ["doit etre termine", "doit terminer", "doit etre terminer", "doit termine"],
    correctAnswer: "doit etre termine",
    explanation: "La voix passive utilise 'etre' + participe passe.",
  },
  {
    id: "fr-pq-8",
    prompt: 'Choisissez la meilleure paraphrase pour "fiable".',
    levelBand: "B1",
    topic: "vocabulary",
    choices: [
      "quelqu'un en qui on peut avoir confiance",
      "quelqu'un de tres bruyant",
      "quelqu'un de tres fatigue",
      "quelqu'un qui ne parle jamais",
    ],
    correctAnswer: "quelqu'un en qui on peut avoir confiance",
    explanation: "'Fiable' veut dire digne de confiance.",
  },
];

export function getPlacementQuestions(languageId: string): PlacementQuestion[] {
  return normalizeLanguage(languageId) === "french"
    ? frenchPlacementQuestions
    : englishPlacementQuestions;
}

export function getRecommendedLevel(scorePercent: number): "A1" | "A2" | "B1" {
  if (scorePercent <= 35) return "A1";
  if (scorePercent <= 55) return "A2";
  return "B1";
}

function normalizeLanguage(languageId: string): LanguageId {
  return languageId === "french" ? "french" : "english";
}
