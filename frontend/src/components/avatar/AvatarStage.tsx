import { MentorAvatar } from "@/components/avatar/MentorAvatar";
import { type AvatarOption } from "@/lib/onboarding-data";
import { type ShopItem } from "@/lib/shop-data";

type Props = {
  avatar: AvatarOption;
  equippedItems: ShopItem[];
  accentTextClass?: string;
};

export function AvatarStage({
  avatar,
  accentTextClass = "text-[#2f8f5b]",
}: Props) {
  return (
    <div className="rounded-[24px] border border-[rgba(22,49,40,0.08)] bg-[rgba(255,255,255,0.76)] p-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <MentorAvatar
          avatar={avatar}
          className="h-24 w-24 shrink-0"
          imageClassName="scale-[1.02]"
          textClassName="text-3xl text-[#163128]"
          fit="contain"
        />
        <h3 className="text-[1.75rem] font-semibold leading-none">{avatar.name}</h3>
        <p className={`text-xs uppercase tracking-[0.18em] ${accentTextClass}`}>
          Готовий до нового уроку?
        </p>
      </div>
    </div>
  );
}
