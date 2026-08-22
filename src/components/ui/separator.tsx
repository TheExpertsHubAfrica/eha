import { Separator as RadixSeparator } from "@radix-ui/react-separator";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: ComponentProps<typeof RadixSeparator>) {
  return (
    <RadixSeparator
      orientation={orientation}
      className={cn(
        orientation === "horizontal" ? "h-px w-full bg-border" : "h-full w-px bg-border",
        className,
      )}
      {...props}
    />
  );
}
