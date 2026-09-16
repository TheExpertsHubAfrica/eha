"use client";

import { Button } from "@/components/ui/button";

export function PrintReceiptButton({ label = "Print / download receipt" }: { label?: string }) {
  return (
    <Button type="button" variant="outline" onClick={() => window.print()}>
      {label}
    </Button>
  );
}
