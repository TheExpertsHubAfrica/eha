"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CopyPaymentLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Payment link copied.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy. Select the link and copy manually.");
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input readOnly value={url} className="font-mono text-xs sm:text-sm" onFocus={(e) => e.target.select()} />
      <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => void copy()}>
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  );
}
