import { CourseHomeClient } from "@/components/course/CourseHomeClient";
import { avatarOptions, goalOptions, languageOptions } from "@/lib/onboarding-data";

type CoursePageProps = {
  searchParams: Promise<{
    language?: string;
    goal?: string;
    avatar?: string;
  }>;
};

export default async function CoursePage({ searchParams }: CoursePageProps) {
  const params = await searchParams;

  const language =
    languageOptions.find((item) => item.id === params.language) ?? languageOptions[0];
  const goal = goalOptions.find((item) => item.id === params.goal) ?? goalOptions[0];
  const avatar =
    avatarOptions.find((item) => item.id === params.avatar) ?? avatarOptions[0];

  return <CourseHomeClient language={language} goal={goal} avatar={avatar} />;
}
