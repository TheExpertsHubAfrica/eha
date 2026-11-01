import { Resend } from "resend";
import { prisma } from "@/server/db";
import { getEmailConfig } from "@/server/email/config";
import { consumeRateLimit, type RateLimit } from "@/server/rate-limit";

export type OutboundEmail = {
  applicationId?: string;
  template: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer }[];
};

/**
 * Call only when an email is really about to be sent, so refused requests cannot use up the
 * site-wide allowance. A refused email is logged and not retried later, because there is no queue.
 */
export async function reserveSiteEmailSlot(
  limit: RateLimit,
  log: { applicationId?: string; template: string; to: string; subject: string },
) {
  const { ok } = await consumeRateLimit(limit, "all");
  if (ok) return true;
  console.warn(`site-wide email limit reached: ${limit.scope}`);
  await prisma.emailLog.create({
    data: {
      applicationId: log.applicationId,
      template: log.template,
      toAddress: log.to,
      subject: log.subject,
      status: "skipped",
      error: `Site-wide email limit reached (${limit.scope}).`,
    },
  });
  return false;
}

export async function deliverEmail(message: OutboundEmail & { allowResend?: boolean }) {
  const existing =
    message.applicationId && !message.allowResend
      ? await prisma.emailLog.findFirst({
          where: {
            applicationId: message.applicationId,
            template: message.template,
            status: "sent",
          },
        })
      : null;
  if (existing) {
    return { status: "sent" as const, skippedDuplicate: true };
  }

  const config = getEmailConfig();
  if (!config.apiKey || !config.from) {
    await prisma.emailLog.create({
      data: {
        applicationId: message.applicationId,
        template: message.template,
        toAddress: message.to,
        subject: message.subject,
        status: "skipped",
        error: "Email delivery is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL).",
      },
    });
    return { status: "skipped" as const };
  }

  try {
    const resend = new Resend(config.apiKey);
    const result = await resend.emails.send({
      from: config.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      replyTo: message.replyTo,
      attachments: message.attachments?.map((item) => ({
        filename: item.filename,
        content: item.content,
      })),
    });
    if (result.error) {
      throw new Error(result.error.message);
    }
    await prisma.emailLog.create({
      data: {
        applicationId: message.applicationId,
        template: message.template,
        toAddress: message.to,
        subject: message.subject,
        status: "sent",
        providerId: result.data?.id,
      },
    });
    return { status: "sent" as const, id: result.data?.id };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Email send failed.";
    await prisma.emailLog.create({
      data: {
        applicationId: message.applicationId,
        template: message.template,
        toAddress: message.to,
        subject: message.subject,
        status: "failed",
        error: detail.slice(0, 500),
      },
    });
    return { status: "failed" as const, error: detail };
  }
}
