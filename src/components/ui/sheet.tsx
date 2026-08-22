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

export function SheetContent({
  className,
  children,
  title,
  ...props
}: Dialog.DialogContentProps & { title: string }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-navy/40 data-[state=open]:animate-in" />
      <Dialog.Content
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex h-full w-[min(100%,380px)] flex-col bg-white outline-none",
          className,
        )}
        {...props}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-border px-5">
          <Dialog.Title className="text-base font-semibold text-navy">
            {title}
          </Dialog.Title>
          <Dialog.Close
            className="inline-flex size-10 items-center justify-center rounded-md text-navy hover:bg-sky"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </Dialog.Close>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
