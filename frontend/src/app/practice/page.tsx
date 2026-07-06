import { PracticePageClient } from "@/components/practice/PracticePageClient";
import { avatarOptions, goalOptions, languageOptions } from "@/lib/onboarding-data";

type PracticePageProps = {
  searchParams: Promise<{
    language?: string;
    goal?: string;
    avatar?: string;
    level?: "A1" | "A2" | "B1";
  }>;
};

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const params = await searchParams;

  const language =
    languageOptions.find((item) => item.id === params.language) ?? languageOptions[0];
  const goal = goalOptions.find((item) => item.id === params.goal) ?? goalOptions[0];
  const avatar =
    avatarOptions.find((item) => item.id === params.avatar) ?? avatarOptions[0];
  const level = params.level === "A2" || params.level === "B1" ? params.level : "A1";

  return (
    <PracticePageClient
      language={language}
      goal={goal}
      avatar={avatar}
      level={level}
    />
  );
}
