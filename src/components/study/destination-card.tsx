import Link from "next/link";
import { cn } from "@/lib/utils";
import type { StudyDestination } from "@/lib/catalog/types";
import { studyDestinationTheme } from "@/lib/study/destination-theme";

export function StudyDestinationPanel({
  destination,
  className,
}: {
  destination: Pick<StudyDestination, "slug" | "name" | "region">;
  className?: string;
}) {
  const theme = studyDestinationTheme(destination);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-linear-to-br px-5 py-6 sm:px-6 sm:py-7",
        theme.gradient,
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -top-6 -right-4 size-28 rounded-full bg-white/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-8 bottom-0 h-16 w-32 bg-white/5"
        style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
        aria-hidden="true"
      />
      <span className="text-4xl sm:text-5xl" aria-hidden="true">
        {theme.flag}
      </span>
      <p
        className={cn(
          "mt-4 text-[0.65rem] font-semibold tracking-[0.16em] uppercase sm:text-xs",
          theme.panelText,
          "opacity-90",
        )}
      >
        {destination.region}
      </p>
      <p className={cn("mt-1 text-lg font-semibold sm:text-xl", theme.panelText)}>
        {destination.name}
      </p>
    </div>
  );
}

export function StudyDestinationCard({
  destination,
  showSupport = false,
  className,
}: {
  destination: StudyDestination;
  showSupport?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/study-abroad/${destination.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden border border-border bg-white transition-colors hover:border-gold/50",
        className,
      )}
    >
      <StudyDestinationPanel destination={destination} />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="flex-1 text-sm leading-relaxed text-muted">{destination.summary}</p>
        {showSupport ? (
          <ul className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm text-fg-soft">
            {destination.support.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Link>
  );
}
