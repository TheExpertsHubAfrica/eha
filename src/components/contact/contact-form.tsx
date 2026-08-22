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

export function ContactForm({ mailTo }: { mailTo?: string }) {
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

  function onSubmit(event: FormEvent<HTMLFormElement>) {
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
      setErrors(next);
      return;
    }

    if (parsed.data.website) {
      toast.success("Thank you. We have received your message.");
      form.reset();
      return;
    }

    setErrors({});

    if (!mailTo) {
      toast.error(
        "Email is not configured yet. Please use WhatsApp if the chat button is visible, or check back shortly.",
      );
      return;
    }

    setPending(true);
    const body = [
      parsed.data.message,
      parsed.data.phone ? `Phone: ${parsed.data.phone}` : "",
      parsed.data.offer ? `Opportunity: ${parsed.data.offer}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const mailto = `mailto:${mailTo}?subject=${encodeURIComponent(parsed.data.subject)}&body=${encodeURIComponent(`From: ${parsed.data.name} <${parsed.data.email}>\n\n${body}`)}`;
    window.location.href = mailto;
    toast.success("Your email app should open with the message ready to send.");
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
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
        {pending ? "Opening…" : "Send message"}
      </Button>
    </form>
  );
}
