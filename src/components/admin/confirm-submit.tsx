"use client";

import { useState, type ComponentProps } from "react";
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
