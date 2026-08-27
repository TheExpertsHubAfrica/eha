import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-ash-wash">
      <div className="container-page py-12 sm:py-16">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <div className="gold-rule mt-4" aria-hidden="true" />
        <h1 className="mt-5 max-w-3xl text-3xl font-bold text-black sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-lg text-muted">{description}</p>
        ) : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <div className="gold-rule mt-3" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-bold text-black sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
