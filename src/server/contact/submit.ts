import type { ContactInput } from "@/lib/validation/contact";
import { contactMailReady, resolveContactRecipient } from "@/server/email/config";
import { deliverEmail } from "@/server/email/send";
import { contactEnquiryEmail } from "@/server/email/templates";

export async function submitContactEnquiry(input: ContactInput, siteEmail: string) {
  const recipient = resolveContactRecipient(siteEmail);
  if (!contactMailReady(siteEmail)) {
    return {
      ok: false as const,
      error:
        "Message delivery is not configured yet. Please use WhatsApp or email us directly if those are shown on this page.",
    };
  }

  const email = contactEnquiryEmail({
    name: input.name,
    email: input.email,
    phone: input.phone,
    subject: input.subject,
    message: input.message,
    intent: input.intent,
    offer: input.offer,
  });

  const result = await deliverEmail({
    template: email.template,
    to: recipient!,
    subject: email.subject,
    html: email.html,
    text: email.text,
    replyTo: input.email,
  });

  if (result.status === "sent") {
    return { ok: true as const };
  }

  if (result.status === "skipped") {
    return {
      ok: false as const,
      error:
        "Message delivery is not configured yet. Please use WhatsApp or email us directly if those are shown on this page.",
    };
  }

  return {
    ok: false as const,
    error: "We could not send your message right now. Please try again in a few minutes.",
  };
}
