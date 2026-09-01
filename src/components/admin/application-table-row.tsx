"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminApplicationRow({
  href,
  label,
  children,
  className,
}: {
  href: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const router = useRouter();

  function navigate() {
    router.push(href);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTableRowElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate();
    }
  }

  return (
    <tr
      className={cn(
        "group cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-gold-soft/25",
        className,
      )}
      onClick={navigate}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="link"
      aria-label={`View application ${label}`}
    >
      {children}
    </tr>
  );
}
