"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { documentFileUrl, isPreviewableMime } from "@/lib/uploads/http";
import { cn } from "@/lib/utils";

export function DocumentPreviewButton({
  href,
  filename,
  mimeType,
  size = "sm",
  variant = "outline",
  className,
}: {
  href: string;
  filename: string;
  mimeType: string;
  size?: "sm" | "md";
  variant?: "outline" | "ghost" | "link";
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  if (!isPreviewableMime(mimeType)) return null;

  const previewUrl = documentFileUrl(href, "inline");
  const isImage = mimeType.startsWith("image/");

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button type="button" size={size} variant={variant} className={className}>
          Preview
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55 data-[state=open]:animate-in" />
        <Dialog.Content
          className={cn(
            "fixed inset-3 z-50 flex flex-col overflow-hidden bg-white outline-none sm:inset-6 lg:inset-10",
            "data-[state=open]:animate-in",
          )}
          aria-describedby={undefined}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
            <Dialog.Title className="truncate text-sm font-semibold text-black sm:text-base">
              {filename}
            </Dialog.Title>
            <div className="flex shrink-0 items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <a href={href} download>
                  Download
                </a>
              </Button>
              <Dialog.Close
                className="inline-flex size-10 items-center justify-center text-black hover:bg-black/5"
                aria-label="Close preview"
              >
                <X className="size-5" />
              </Dialog.Close>
            </div>
          </div>
          <div className="min-h-0 flex-1 bg-surface">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- authenticated blob route; next/image unsuitable
              <img
                src={previewUrl}
                alt={filename}
                className="mx-auto h-full max-h-full w-auto max-w-full object-contain p-4"
              />
            ) : (
              <iframe
                title={filename}
                src={previewUrl}
                className="h-full w-full border-0 bg-white"
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function DocumentFileActions({
  href,
  filename,
  mimeType,
  className,
}: {
  href: string;
  filename: string;
  mimeType: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <DocumentPreviewButton href={href} filename={filename} mimeType={mimeType} />
      <Button asChild size="sm" variant="outline">
        <a href={href}>Download</a>
      </Button>
    </div>
  );
}
