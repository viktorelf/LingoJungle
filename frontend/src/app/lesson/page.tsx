import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { avatarOptions, goalOptions, languageOptions } from "@/lib/onboarding-data";
import { getDemoLesson } from "@/lib/lesson-data";

type LessonPageProps = {
  searchParams: Promise<{
    language?: string;
    goal?: string;
    avatar?: string;
    level?: "A1" | "A2" | "B1";
    lesson?: string;
  }>;
};

export default async function LessonPage({ searchParams }: LessonPageProps) {
  const params = await searchParams;

  const language =
    languageOptions.find((item) => item.id === params.language) ?? languageOptions[0];
  const goal = goalOptions.find((item) => item.id === params.goal) ?? goalOptions[0];
  const avatar =
    avatarOptions.find((item) => item.id === params.avatar) ?? avatarOptions[0];

  const lesson = getDemoLesson(language.id, goal.id, params.level ?? "A1", params.lesson);

  return (
    <LessonPlayer
      key={lesson.id}
      lesson={lesson}
      languageLabel={language.label}
      goalLabel={goal.label}
      avatarId={avatar.id}
    />
  );
}
