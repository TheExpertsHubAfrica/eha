"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "border-border bg-white text-fg shadow-none font-sans",
          title: "text-navy",
          description: "text-muted",
        },
      }}
    />
  );
}
