import Image from "next/image";
import { cn } from "@/lib/utils";
import type { TravelPackage } from "@/lib/catalog/types";

const accents: Record<TravelPackage["accent"], string> = {
  navy: "from-[#1C1B18] to-[#45423C]",
  blue: "from-[#2E2C28] to-[#5A574F]",
  teal: "from-[#2E2C28] to-[#8F7330]",
  sand: "from-[#8F7330] to-[#B8953A]",
  rose: "from-[#45423C] to-[#9A968C]",
};

export function DestinationPanel({
  accent,
  label,
  coverImageUrl,
}: {
  accent: TravelPackage["accent"];
  label: string;
  coverImageUrl?: string | null;
}) {
  if (coverImageUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden bg-ash-100 sm:aspect-auto sm:h-44">
        <Image
          src={coverImageUrl}
          alt={label}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
          unoptimized={coverImageUrl.startsWith("/api/")}
        />
        <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/55 to-transparent px-4 pt-8 pb-3 text-sm font-medium tracking-wide text-white">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-linear-to-br",
        accents[accent],
      )}
    >
      <svg
        viewBox="0 0 320 180"
        className="h-40 w-full sm:h-44"
        aria-hidden="true"
      >
        <circle cx="260" cy="28" r="40" fill="white" opacity="0.08" />
        <path
          d="M0 140 C80 110 140 150 320 96 L320 180 L0 180 Z"
          fill="white"
          opacity="0.12"
        />
        <path
          d="M24 92h40M24 104h24"
          stroke="white"
          strokeWidth="6"
          opacity="0.25"
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute bottom-3 left-4 text-sm font-medium tracking-wide text-white">
        {label}
      </span>
    </div>
  );
}
