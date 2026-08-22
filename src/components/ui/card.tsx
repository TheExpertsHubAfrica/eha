import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-white",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: ComponentProps<"div">) {
  return <div className={cn("px-6 pt-6", className)} {...props} />;
}

export function CardBody({
  className,
  ...props
}: ComponentProps<"div">) {
  return <div className={cn("px-6 py-5", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn("border-t border-border px-6 py-4", className)}
      {...props}
    />
  );
}
