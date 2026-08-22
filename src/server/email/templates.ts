import { siteConfig } from "@/lib/site-config";
import { formatDisplayDate } from "@/lib/utils";

export type ApplicationReceivedVars = {
  applicantName: string;
  applicantEmail: string;
  reference: string;
  jobTitle: string;
  location: string;
  submittedAt: Date;
  confirmationUrl: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function layout(title: string, body: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f7f8fa;font-family:Arial,sans-serif;color:#142033;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fa;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e8ee;border-radius:8px;">
            <tr>
              <td style="background:#0b1f3a;color:#ffffff;padding:20px 24px;font-size:13px;letter-spacing:0.16em;text-transform:uppercase;">
                ${escapeHtml(siteConfig.name)}
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px;">
                <h1 style="margin:0 0 16px;font-size:22px;color:#0b1f3a;">${escapeHtml(title)}</h1>
                ${body}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function applicationReceivedEmail(vars: ApplicationReceivedVars) {
  const submitted = formatDisplayDate(vars.submittedAt);
  const support = siteConfig.email
    ? `If you need to update anything, write to ${siteConfig.email} and quote your reference.`
    : "Keep this reference. Use the confirmation page on this device if you need a copy of your work profile.";
  const html = layout(
    "Application received",
    `
      <p style="margin:0 0 12px;line-height:1.6;">Hello ${escapeHtml(vars.applicantName)},</p>
      <p style="margin:0 0 12px;line-height:1.6;">We have received your application for <strong>${escapeHtml(vars.jobTitle)}</strong> (${escapeHtml(vars.location)}).</p>
      <p style="margin:0 0 12px;line-height:1.6;"><strong>Reference:</strong> ${escapeHtml(vars.reference)}<br /><strong>Submitted:</strong> ${escapeHtml(submitted)}</p>
      <p style="margin:0 0 12px;line-height:1.6;">A PDF copy of your work profile is attached when email delivery is configured. You can also open your confirmation page:</p>
      <p style="margin:0 0 16px;"><a href="${escapeHtml(vars.confirmationUrl)}" style="color:#1d4ed8;">View confirmation</a></p>
      <p style="margin:0;line-height:1.6;color:#5b6573;">${escapeHtml(support)} This is a receipt of your submitted profile — it is not a visa or placement decision.</p>
    `,
  );
  const text = [
    `Hello ${vars.applicantName},`,
    "",
    `We have received your application for ${vars.jobTitle} (${vars.location}).`,
    `Reference: ${vars.reference}`,
    `Submitted: ${submitted}`,
    "",
    `Confirmation: ${vars.confirmationUrl}`,
    "",
    support,
  ].join("\n");
  return {
    template: "application_received" as const,
    subject: `Application Received — ${vars.reference}`,
    html,
    text,
  };
}

export function adminNewApplicationEmail(
  vars: ApplicationReceivedVars & { phone: string; applicationId: string },
) {
  const submitted = formatDisplayDate(vars.submittedAt);
  const adminUrl = `${siteConfig.url}/admin/applications/${vars.applicationId}`;
  const html = layout(
    "New work application",
    `
      <p style="margin:0 0 12px;line-height:1.6;">A new application was submitted.</p>
      <p style="margin:0 0 12px;line-height:1.6;">
        <strong>Reference:</strong> ${escapeHtml(vars.reference)}<br />
        <strong>Applicant:</strong> ${escapeHtml(vars.applicantName)}<br />
        <strong>Email:</strong> ${escapeHtml(vars.applicantEmail)}<br />
        <strong>Phone:</strong> ${escapeHtml(vars.phone)}<br />
        <strong>Opportunity:</strong> ${escapeHtml(vars.jobTitle)} — ${escapeHtml(vars.location)}<br />
        <strong>Submitted:</strong> ${escapeHtml(submitted)}
      </p>
      <p style="margin:0;line-height:1.6;color:#5b6573;">Admin workspace (when available): <a href="${escapeHtml(adminUrl)}" style="color:#1d4ed8;">${escapeHtml(adminUrl)}</a></p>
    `,
  );
  const text = [
    `New application ${vars.reference}`,
    `${vars.applicantName} <${vars.applicantEmail}>`,
    vars.phone,
    `${vars.jobTitle} — ${vars.location}`,
    submitted,
    adminUrl,
  ].join("\n");
  return {
    template: "admin_new_application" as const,
    subject: `New Work Application Received — ${vars.reference}`,
    html,
    text,
  };
}

export function applicationStatusChangedEmail(vars: {
  applicantName: string;
  reference: string;
  jobTitle: string;
  statusLabel: string;
  confirmationUrl: string;
}) {
  const html = layout(
    "Application update",
    `
      <p style="margin:0 0 12px;line-height:1.6;">Hello ${escapeHtml(vars.applicantName)},</p>
      <p style="margin:0 0 12px;line-height:1.6;">Your application <strong>${escapeHtml(vars.reference)}</strong> for ${escapeHtml(vars.jobTitle)} is now marked as <strong>${escapeHtml(vars.statusLabel)}</strong>.</p>
      <p style="margin:0 0 16px;"><a href="${escapeHtml(vars.confirmationUrl)}" style="color:#1d4ed8;">View your confirmation</a></p>
      <p style="margin:0;line-height:1.6;color:#5b6573;">This is a status update from our team, not a visa or placement decision.</p>
    `,
  );
  const text = [
    `Hello ${vars.applicantName},`,
    `Application ${vars.reference} for ${vars.jobTitle} is now ${vars.statusLabel}.`,
    vars.confirmationUrl,
  ].join("\n");
  return {
    template: "application_status_changed" as const,
    subject: `Application update — ${vars.reference}`,
    html,
    text,
  };
}
