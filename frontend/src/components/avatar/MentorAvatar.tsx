import Image from "next/image";

import { type AvatarOption } from "@/lib/onboarding-data";

type Props = {
  avatar: AvatarOption;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  fit?: "contain" | "cover";
};

export function MentorAvatar({
  avatar,
  className = "",
  imageClassName = "",
  textClassName = "text-[#17362d]",
  fit = "contain",
}: Props) {
  if (avatar.imageSrc) {
    return (
      <div className={`relative overflow-hidden rounded-[inherit] bg-transparent ${className}`}>
        <Image
          src={avatar.imageSrc}
          alt={avatar.name}
          fill
          sizes="160px"
          className={`${fit === "cover" ? "object-cover" : "object-contain"} bg-transparent drop-shadow-[0_14px_24px_rgba(18,53,42,0.16)] ${imageClassName}`}
          style={{ objectPosition: avatar.imagePosition ?? "center" }}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-[inherit] bg-gradient-to-br ${avatar.accent} font-semibold shadow-[inset_0_10px_24px_rgba(255,255,255,0.24)] ${textClassName} ${className}`}
    >
      {avatar.symbol}
    </div>
  );
}
