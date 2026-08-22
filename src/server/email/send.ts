import { Resend } from "resend";
import { prisma } from "@/server/db";
import { getEmailConfig } from "@/server/email/config";

export type OutboundEmail = {
  applicationId?: string;
  template: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: { filename: string; content: Buffer }[];
};

export async function deliverEmail(message: OutboundEmail) {
  const existing = message.applicationId
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
