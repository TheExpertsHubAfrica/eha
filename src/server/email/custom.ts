import { prisma } from "@/server/db";

export function applyTemplateVars(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => vars[key] ?? "");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function htmlFromText(title: string, text: string, brand: string) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((block) => `<p style="margin:0 0 12px;line-height:1.6;">${escapeHtml(block).replaceAll("\n", "<br />")}</p>`)
    .join("");
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f7f8fa;font-family:Arial,sans-serif;color:#142033;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fa;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e8ee;border-radius:8px;">
            <tr>
              <td style="background:#0b1f3a;color:#ffffff;padding:20px 24px;font-size:13px;letter-spacing:0.16em;text-transform:uppercase;">
                ${escapeHtml(brand)}
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px;">
                <h1 style="margin:0 0 16px;font-size:22px;color:#0b1f3a;">${escapeHtml(title)}</h1>
                ${paragraphs}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function overlayEmailTemplate(
  key: string,
  vars: Record<string, string>,
  fallback: { template: string; subject: string; html: string; text: string },
  brand: string,
) {
  const custom = await prisma.emailTemplate.findUnique({ where: { key } });
  if (!custom) return fallback;
  const subject = applyTemplateVars(custom.subject, vars);
  const text = applyTemplateVars(custom.bodyText, vars);
  return {
    template: fallback.template,
    subject,
    text,
    html: htmlFromText(subject, text, brand),
  };
}

export const DEFAULT_EMAIL_TEMPLATES = [
  {
    key: "application_received",
    name: "Applicant — application received",
    subject: "Application Received — {{reference}}",
    bodyText:
      "Hello {{applicantName}},\n\nWe have received your application for {{jobTitle}} ({{location}}).\n\nReference: {{reference}}\nSubmitted: {{submittedAt}}\n\nConfirmation: {{confirmationUrl}}\n\nThis is a receipt of your submitted profile — it is not a visa or placement decision.",
  },
  {
    key: "admin_new_application",
    name: "Admin — new application",
    subject: "New Work Application Received — {{reference}}",
    bodyText:
      "A new application was submitted.\n\nReference: {{reference}}\nApplicant: {{applicantName}}\nEmail: {{applicantEmail}}\nPhone: {{phone}}\nOpportunity: {{jobTitle}} — {{location}}\nSubmitted: {{submittedAt}}\n\n{{adminUrl}}",
  },
  {
    key: "application_status_changed",
    name: "Applicant — status update",
    subject: "Application update — {{reference}}",
    bodyText:
      "Hello {{applicantName}},\n\nYour application {{reference}} for {{jobTitle}} is now marked as {{statusLabel}}.\n\n{{confirmationUrl}}\n\nThis is a status update from our team, not a visa or placement decision.",
  },
] as const;
