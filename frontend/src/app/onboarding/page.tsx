import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

type OnboardingPageProps = {
  searchParams: Promise<{
    returnTo?: string;
  }>;
};

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const params = await searchParams;

  return <OnboardingFlow returnTo={params.returnTo ?? null} />;
}
