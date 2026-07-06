import Image from "next/image";

type Props = {
  className?: string;
  imageClassName?: string;
  subtitle?: string;
  titleClassName?: string;
  subtitleClassName?: string;
};

export function BrandLogo({
  className = "",
  imageClassName = "",
  subtitle,
  titleClassName = "",
  subtitleClassName = "",
}: Props) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative h-12 w-[124px] shrink-0 ${imageClassName}`}>
        <Image
          src="/images/branding/logo-jungle.png"
          alt="Lingo Jungle"
          fill
          sizes="124px"
          className="object-contain drop-shadow-[0_12px_24px_rgba(18,53,42,0.18)]"
        />
      </div>
      {subtitle ? (
        <div className="min-w-0">
          <p className={`text-lg font-semibold leading-none ${titleClassName}`}>Lingo Jungle</p>
          <p className={`mt-1 text-sm ${subtitleClassName}`}>{subtitle}</p>
        </div>
      ) : null}
    </div>
  );
}
