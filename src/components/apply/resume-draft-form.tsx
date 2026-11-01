"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { useTurnstile } from "@/components/security/use-turnstile";
import { TURNSTILE_ACTIONS, TURNSTILE_INCOMPLETE_MESSAGE } from "@/lib/turnstile";
import { requestResumeLinkAction } from "@/server/application/actions";

export function ResumeDraftForm({ offerId }: { offerId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);
  const turnstile = useTurnstile(TURNSTILE_ACTIONS.resumeLink);

  async function onSubmit(formData: FormData) {
    if (turnstile.enabled && !turnstile.token) {
      setError(TURNSTILE_INCOMPLETE_MESSAGE);
      return;
    }
    setPending(true);
    setError(undefined);
    formData.set("turnstileToken", turnstile.token);
    const result = await requestResumeLinkAction(offerId, formData);
    if (!result.ok) {
      turnstile.reset();
      const message = result.fieldErrors?.email || result.error || "Could not send a resume link.";
      setError(message);
      toast.error(message);
      setPending(false);
      return;
    }
    setSent(true);
    toast.success("If a draft exists for that email, we have sent a resume link.");
    setPending(false);
  }

  if (sent) {
    return (
      <p className="rounded-md border border-success/20 bg-success/5 px-3 py-2 text-sm text-navy">
        If a draft exists for that email, we have sent a resume link. Check your inbox and spam folder.
      </p>
    );
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <div>
        <Label htmlFor="resumeEmail">Email used on the application</Label>
        <Input
          id="resumeEmail"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
        {error ? <FieldError>{error}</FieldError> : null}
      </div>
      {turnstile.widget}
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Sending…" : "Email me a resume link"}
      </Button>
    </form>
  );
}
