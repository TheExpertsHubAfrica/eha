"use client";

import { useSearchParams } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { FieldError, FieldHint, Label } from "@/components/ui/label";
import { contactSchema } from "@/lib/validation/contact";

const intentSubjects: Record<string, string> = {
  apply: "Application interest",
  help: "Application help",
  visa: "Visa assistance enquiry",
};

export function ContactForm() {
  const params = useSearchParams();
  const intent = params.get("intent") ?? "";
  const offer = params.get("offer") ?? "";

  const defaultSubject = useMemo(() => {
    if (intent === "apply" && offer) {
      return `Application interest — ${offer.replace(/-/g, " ")}`;
    }
    return intentSubjects[intent] ?? "";
  }, [intent, offer]);

  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function showValidationErrors(form: HTMLFormElement, next: Record<string, string>) {
    setErrors(next);
    const firstKey = Object.keys(next)[0];
    const firstMessage = firstKey ? next[firstKey] : undefined;
    if (firstMessage) {
      toast.error(firstMessage);
    }
    if (firstKey) {
      const field = form.querySelector<HTMLElement>(`[name="${firstKey}"]`);
      field?.focus({ preventScroll: true });
      field?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const parsed = contactSchema.safeParse(data);

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !next[key]) next[key] = issue.message;
      }
      showValidationErrors(form, next);
      return;
    }

    if (parsed.data._gotcha?.trim()) {
      toast.success("Thank you. We have received your message.");
      form.reset();
      return;
    }

    setErrors({});
    setPending(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = (await response.json().catch(() => null)) as
        | { ok: true }
        | { ok: false; error?: string; errors?: Record<string, string> }
        | null;

      if (response.status === 429) {
        toast.error(result?.ok === false && result.error ? result.error : "Too many messages. Please wait and try again.");
        return;
      }

      if (result?.ok === false && result.errors) {
        showValidationErrors(form, result.errors);
        return;
      }

      if (!response.ok || !result?.ok) {
        toast.error(
          result?.ok === false && result.error
            ? result.error
            : "We could not send your message. Please try again.",
        );
        return;
      }

      toast.success("Thank you. We have received your message and will get back to you soon.");
      form.reset();
    } catch {
      toast.error("We could not send your message. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <input
        type="text"
        name="_gotcha"
        tabIndex={-1}
        autoComplete="off"
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />
      <input type="hidden" name="intent" value={intent} />
      <input type="hidden" name="offer" value={offer} />

      <div>
        <Label htmlFor="name" required>
          Full name
        </Label>
        <Input id="name" name="name" autoComplete="name" required />
        <FieldError>{errors.name}</FieldError>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <FieldError>{errors.email}</FieldError>
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" />
          <FieldHint>Include country code if you can.</FieldHint>
          <FieldError>{errors.phone}</FieldError>
        </div>
      </div>
      <div>
        <Label htmlFor="subject" required>
          Subject
        </Label>
        <Input
          id="subject"
          name="subject"
          defaultValue={defaultSubject}
          required
        />
        <FieldError>{errors.subject}</FieldError>
      </div>
      <div>
        <Label htmlFor="message" required>
          Message
        </Label>
        <Textarea id="message" name="message" required />
        <FieldError>{errors.message}</FieldError>
      </div>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
