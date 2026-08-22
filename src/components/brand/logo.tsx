import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

const logoAssets = {
  light: {
    src: "/brand/logo-white.png",
    width: 348,
    height: 134,
  },
  dark: {
    src: "/brand/logo-black.png",
    width: 348,
    height: 134,
  },
} as const;

export type LogoBackground = keyof typeof logoAssets;

export function Logo({
  className,
  background = "light",
}: {
  className?: string;
  /** Background the logo sits on — picks black or white artwork automatically. */
  background?: LogoBackground;
}) {
  const logo = logoAssets[background];

  return (
    <Link
      href="/"
      className={cn("inline-flex shrink-0", className)}
      aria-label={`${siteConfig.name} home`}
    >
      <Image
        src={logo.src}
        alt={siteConfig.name}
        width={logo.width}
        height={logo.height}
        className="h-11 w-auto"
        priority
        unoptimized
      />
    </Link>
  );
}
