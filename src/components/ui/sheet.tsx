"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sheet({ ...props }: Dialog.DialogProps) {
  return <Dialog.Root {...props} />;
}

export function SheetTrigger(props: Dialog.DialogTriggerProps) {
  return <Dialog.Trigger {...props} />;
}

export function SheetClose(props: Dialog.DialogCloseProps) {
  return <Dialog.Close {...props} />;
}

export function SheetContent({
  className,
  children,
  title,
  side = "right",
  bare = false,
  ...props
}: Dialog.DialogContentProps & {
  title: string;
  side?: "left" | "right";
  /** Full-bleed panel without built-in header (caller provides chrome). */
  bare?: boolean;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in" />
      <Dialog.Content
        className={cn(
          "fixed inset-y-0 z-50 flex h-full w-[min(100%,320px)] flex-col outline-none",
          side === "left" ? "left-0" : "right-0",
          !bare && "bg-white",
          className,
        )}
        {...props}
      >
        {bare ? (
          <>
            <Dialog.Title className="sr-only">{title}</Dialog.Title>
            {children}
          </>
        ) : (
          <>
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
              <Dialog.Title className="text-base font-semibold text-navy">
                {title}
              </Dialog.Title>
              <Dialog.Close
                className="inline-flex size-10 items-center justify-center text-navy hover:bg-black/5"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </Dialog.Close>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </>
        )}
      </Dialog.Content>
    </Dialog.Portal>
  );
}
