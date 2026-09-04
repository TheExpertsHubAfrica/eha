import type { Metadata } from "next";
import { Card, CardBody } from "@/components/ui/card";
import { EmailTemplateForm, LegalPageForm, SiteSettingsForm } from "@/components/admin/cms-forms";
import { AdminPageHeader } from "@/components/admin/page-header";
import { prisma } from "@/server/db";
import { requireAdmin } from "@/server/admin/auth";
import { DEFAULT_EMAIL_TEMPLATES } from "@/server/email/custom";
import { getEmailConfig } from "@/server/email/config";
import { getResolvedSite } from "@/server/settings";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const LEGAL = [
  { slug: "privacy", fallbackTitle: "Privacy Policy" },
  { slug: "terms", fallbackTitle: "Terms & Conditions" },
  { slug: "cookies", fallbackTitle: "Cookie Policy" },
];

export default async function AdminSettingsPage() {
  await requireAdmin("settings.write");
  const site = await getResolvedSite();
  const [legal, templates] = await Promise.all([
    prisma.legalPage.findMany(),
    prisma.emailTemplate.findMany(),
  ]);
  const legalMap = Object.fromEntries(legal.map((row) => [row.slug, row]));
  const templateMap = Object.fromEntries(templates.map((row) => [row.key, row]));
  const values = {
    tagline: site.tagline,
    phone: site.phone,
    email: site.email,
    address: site.address,
    hours: site.hours,
    whatsapp: site.whatsapp,
    facebook: site.social.facebook,
    instagram: site.social.instagram,
    linkedin: site.social.linkedin,
    youtube: site.social.youtube,
  };
  const email = getEmailConfig();

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Site"
        title="Settings"
        description="Public contact channels overlay environment values after you save. Secrets stay in .env.local."
      />
      <Card>
        <CardBody>
          <h2 className="mb-4 text-lg font-semibold text-navy">Contact and social</h2>
          <SiteSettingsForm values={values} />
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <h2 className="text-lg font-semibold text-navy">Email delivery</h2>
          <p className="mt-2 text-sm text-muted">
            From address and API key are environment-only.
            {email.from ? " Outbound mail is configured." : " Outbound mail is not configured yet."}
            {email.adminTo ? " Admin notifications are enabled." : " Admin notification recipient is not set."}
            {" "}Contact form messages go to the admin notification address, or the public email above if that is unset.
          </p>
          <div className="mt-6 space-y-8">
            {DEFAULT_EMAIL_TEMPLATES.map((item) => {
              const saved = templateMap[item.key];
              return (
                <EmailTemplateForm
                  key={item.key}
                  templateKey={item.key}
                  name={item.name}
                  subject={saved?.subject ?? item.subject}
                  bodyText={saved?.bodyText ?? item.bodyText}
                />
              );
            })}
          </div>
          <p className="mt-4 text-xs text-muted">
            Placeholders: {"{{applicantName}}"}, {"{{reference}}"}, {"{{jobTitle}}"}, {"{{location}}"}, {"{{confirmationUrl}}"}, {"{{statusLabel}}"}.
          </p>
        </CardBody>
      </Card>
      {LEGAL.map((item) => (
        <Card key={item.slug}>
          <CardBody>
            <h2 className="mb-4 text-lg font-semibold text-navy">{item.fallbackTitle}</h2>
            <LegalPageForm
              slug={item.slug}
              title={legalMap[item.slug]?.title ?? item.fallbackTitle}
              body={legalMap[item.slug]?.body ?? ""}
            />
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
