import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md border border-border bg-white px-3.5 text-[15px] text-fg shadow-none outline-none transition-colors placeholder:text-muted/80 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-60",
        "focus-visible:border-blue",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-md border border-border bg-white px-3.5 py-3 text-[15px] text-fg outline-none placeholder:text-muted/80 disabled:opacity-60",
        "focus-visible:border-blue",
        className,
      )}
      {...props}
    />
  );
}
