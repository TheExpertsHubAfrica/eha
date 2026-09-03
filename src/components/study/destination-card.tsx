import Image from "next/image";
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
        "relative overflow-hidden px-5 py-6 sm:px-6 sm:py-7",
        className,
      )}
    >
      <Image
        src={theme.image}
        alt={theme.imageAlt}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      />
      <div
        className="absolute inset-0 bg-linear-to-t from-black/75 via-black/45 to-black/20"
        aria-hidden="true"
      />
      <div className="relative">
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
      <StudyDestinationPanel
        destination={destination}
        className="min-h-[11.5rem] sm:min-h-[13rem]"
      />
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
