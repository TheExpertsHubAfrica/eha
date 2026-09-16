"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ConfirmSubmitButton({
  confirmMessage,
  children,
  idleLabel,
  confirmLabel = "Confirm delete",
  ...props
}: ComponentProps<typeof Button> & {
  confirmMessage: string;
  idleLabel?: string;
  confirmLabel?: string;
}) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <Button
        {...props}
        type="button"
        onClick={(event) => {
          event.preventDefault();
          setArmed(true);
        }}
      >
        {idleLabel ?? children}
      </Button>
    );
  }

  return (
    <Button
      {...props}
      type="submit"
      variant={props.variant ?? "danger"}
      onBlur={() => setArmed(false)}
      title={confirmMessage}
    >
      {confirmLabel}
    </Button>
  );
}

/** Two-step delete with pending state and toast feedback. */
export function ConfirmDeleteButton({
  confirmMessage,
  idleLabel = "Delete",
  confirmLabel = "Confirm delete",
  successMessage = "Deleted.",
  errorMessage = "Could not delete. Please try again.",
  onConfirm,
  size = "sm",
  variant = "ghost",
}: {
  confirmMessage: string;
  idleLabel?: string;
  confirmLabel?: string;
  successMessage?: string;
  errorMessage?: string;
  onConfirm: () => Promise<{ ok: boolean; error?: string } | void>;
  size?: ComponentProps<typeof Button>["size"];
  variant?: ComponentProps<typeof Button>["variant"];
}) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [pending, setPending] = useState(false);

  async function run() {
    setPending(true);
    try {
      const result = await onConfirm();
      if (result && result.ok === false) {
        toast.error(result.error || errorMessage);
        setArmed(false);
        return;
      }
      toast.success(successMessage);
      router.refresh();
    } catch {
      toast.error(errorMessage);
      setArmed(false);
    } finally {
      setPending(false);
    }
  }

  if (!armed) {
    return (
      <Button type="button" size={size} variant={variant} disabled={pending} onClick={() => setArmed(true)}>
        {idleLabel}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size={size}
      variant="danger"
      disabled={pending}
      title={confirmMessage}
      onBlur={() => {
        if (!pending) setArmed(false);
      }}
      onClick={() => void run()}
    >
      {pending ? "Deleting…" : confirmLabel}
    </Button>
  );
}

export function AdminDeleteForm({
  children,
  ...props
}: Omit<Parameters<typeof ConfirmDeleteButton>[0], "idleLabel"> & { children?: ReactNode }) {
  return <ConfirmDeleteButton idleLabel={typeof children === "string" ? children : "Delete"} {...props} />;
}
