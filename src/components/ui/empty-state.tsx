import Link from "next/link";
import { ContentImage } from "@/components/ui/content-image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  image,
  imageAlt,
  className,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  image?: string;
  imageAlt?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden border border-dashed border-border bg-white text-center",
        className,
      )}
    >
      {image ? (
        <ContentImage
          src={image}
          alt={imageAlt ?? title}
          aspect="video"
          className="max-h-48 border-b border-border"
          imageClassName="object-contain bg-surface p-6"
        />
      ) : null}
      <div className="px-6 py-14">
        <h2 className="text-xl font-semibold text-navy">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-muted">{description}</p>
        {actionHref && actionLabel ? (
          <Button asChild className="mt-6">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
