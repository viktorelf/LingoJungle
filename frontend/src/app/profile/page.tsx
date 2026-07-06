import { ProfileShopClient } from "@/components/profile/ProfileShopClient";
import { avatarOptions, goalOptions, languageOptions } from "@/lib/onboarding-data";

type ProfilePageProps = {
  searchParams: Promise<{
    language?: string;
    goal?: string;
    avatar?: string;
  }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = await searchParams;

  const language =
    languageOptions.find((item) => item.id === params.language) ?? languageOptions[0];
  const goal = goalOptions.find((item) => item.id === params.goal) ?? goalOptions[0];
  const avatar =
    avatarOptions.find((item) => item.id === params.avatar) ?? avatarOptions[0];

  return <ProfileShopClient language={language} goal={goal} avatar={avatar} />;
}
