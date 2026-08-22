import { cn } from "@/lib/utils";
import type { TravelPackage } from "@/lib/catalog/types";

const accents: Record<TravelPackage["accent"], string> = {
  navy: "from-[#0B1F3A] to-[#1D4ED8]",
  blue: "from-[#1D4ED8] to-[#5B8DEF]",
  teal: "from-[#0F4C5C] to-[#2A9D8F]",
  sand: "from-[#7A5C2E] to-[#C4A35A]",
  rose: "from-[#5C2A3A] to-[#C45C6A]",
};

export function DestinationPanel({
  accent,
  label,
}: {
  accent: TravelPackage["accent"];
  label: string;
}) {
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
