"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function StartApplicationButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Starting…" : "Start application"}
    </Button>
  );
}
