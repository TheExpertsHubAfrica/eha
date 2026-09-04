import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminStatCard({
  label,
  value,
  href,
  hint,
  accent = false,
  className,
}: {
  label: string;
  value: number | string;
  href?: string;
  hint?: string;
  accent?: boolean;
  className?: string;
}) {
  const body = (
    <>
      <p className="text-[11px] leading-snug font-medium tracking-wide text-muted uppercase sm:text-xs">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 text-2xl font-semibold tabular-nums tracking-tight",
          accent ? "text-gold-deep" : "text-navy",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </>
  );

  const classes = cn(
    "rounded-lg border border-border bg-white px-4 py-3.5 transition-all",
    href &&
      "block hover:-translate-y-0.5 hover:border-gold/45 hover:shadow-[0_10px_28px_-16px_rgba(26,24,20,0.4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    );
  }

  return <div className={classes}>{body}</div>;
}

export function AdminQuickAction({
  href,
  title,
  description,
  icon,
  className,
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-start gap-3 rounded-lg border border-border bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-gold/45 hover:shadow-[0_10px_28px_-16px_rgba(26,24,20,0.4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        className,
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-ash-100 text-navy transition-colors group-hover:bg-gold-soft group-hover:text-gold-deep">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-navy">{title}</span>
        <span className="mt-0.5 block text-xs text-muted">{description}</span>
      </span>
    </Link>
  );
}

export function AdminPanel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-white", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-semibold text-navy">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
