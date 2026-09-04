import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  icon,
  className,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start rounded-lg border border-dashed border-border bg-white px-6 py-12",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex size-11 items-center justify-center rounded-md bg-gold-soft text-gold-deep">
          {icon}
        </div>
      ) : null}
      <h2 className="text-lg font-semibold text-navy">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted">{description}</p>
      {actionHref && actionLabel ? (
        <Button asChild size="sm" className="mt-5">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
