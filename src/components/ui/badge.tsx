import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const tones = {
  navy: "bg-navy/8 text-navy",
  blue: "bg-sky text-blue",
  gold: "bg-gold-soft text-navy",
  muted: "bg-surface text-muted",
  success: "bg-success/10 text-success",
  danger: "bg-danger/10 text-danger",
  outline: "border border-border bg-white text-fg-soft",
} as const;

export function Badge({
  className,
  tone = "muted",
  ...props
}: ComponentProps<"span"> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
