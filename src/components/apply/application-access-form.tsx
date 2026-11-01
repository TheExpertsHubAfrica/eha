"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";
import { requestApplicationLinkAction } from "@/server/application/actions";

export function ApplicationAccessForm({ reference }: { reference: string }) {
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<{ form?: string; reference?: string; email?: string }>({});
  const [sent, setSent] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setErrors({});
    const result = await requestApplicationLinkAction(formData);
    if (!result.ok) {
      setErrors({
        form: result.error,
        reference: result.fieldErrors?.reference,
        email: result.fieldErrors?.email,
      });
      setPending(false);
      return;
    }
    setSent(true);
    setPending(false);
  }

  if (sent) {
    return (
      <p className="mt-6 rounded-md border border-success/20 bg-success/5 px-3 py-2 text-sm text-navy" role="status">
        If those details match an application, we have sent a secure link. Check your inbox and spam folder.
      </p>
    );
  }

  return (
    <form action={onSubmit} className="mt-6 space-y-4">
      <div>
        <Label htmlFor="reference">Application reference</Label>
        <Input
          id="reference"
          name="reference"
          defaultValue={reference}
          autoComplete="off"
          required
          placeholder="TEHA-2026-000005-K7M2QX"
        />
        {errors.reference ? <FieldError>{errors.reference}</FieldError> : null}
      </div>
      <div>
        <Label htmlFor="email">Email used on the application</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        {errors.email ? <FieldError>{errors.email}</FieldError> : null}
      </div>
      {errors.form ? <FieldError>{errors.form}</FieldError> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Email me a secure link"}
      </Button>
    </form>
  );
}
