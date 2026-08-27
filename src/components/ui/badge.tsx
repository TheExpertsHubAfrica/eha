import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const tones = {
  navy: "bg-ash-100 text-ash-800",
  blue: "bg-ash-100 text-ash-800",
  gold: "bg-gold-soft text-gold-deep",
  muted: "bg-ash-100 text-muted",
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
        "inline-flex items-center rounded-sm px-2.5 py-1 text-xs font-medium tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
