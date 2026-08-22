import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

export function Logo({
  className,
  invert = false,
}: {
  className?: string;
  invert?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-2.5", className)}
      aria-label={`${siteConfig.name} home`}
    >
      <span
        className={cn(
          "relative flex size-9 shrink-0 items-center justify-center rounded-full",
          invert ? "bg-white/10" : "bg-blue",
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 32 32" className="size-6 text-white">
          <circle
            cx="16"
            cy="16"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <ellipse
            cx="16"
            cy="16"
            rx="4.2"
            ry="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M6.5 16h19M8.2 11.2h15.6M8.2 20.8h15.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="min-w-0 leading-tight">
        <span
          className={cn(
            "block text-[11px] font-semibold tracking-[0.16em] uppercase",
            invert ? "text-white/70" : "text-blue",
          )}
        >
          {siteConfig.name.replace(/\s+Africa$/i, "").trim()}
        </span>
        <span
          className={cn(
            "block text-[15px] font-semibold tracking-wide",
            invert ? "text-white" : "text-navy",
          )}
        >
          Africa
        </span>
      </span>
    </Link>
  );
}
