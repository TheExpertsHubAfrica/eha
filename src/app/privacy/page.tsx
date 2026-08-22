import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} handles personal and identity information.`,
};

export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  return (
    <LegalDocument
      slug="privacy"
      fallbackTitle="Privacy Policy"
      fallbackDescription="This page is the public privacy notice. It is not legal advice."
      fallbackBody={`${siteConfig.name} collects personal information only as needed to operate this platform: contact enquiries, applications, and the documents required for a selected opportunity.

# What we collect

Depending on the opportunity: identity details, contact information, education and employment history, travel history where relevant, emergency contacts, and supporting documents such as passport copies and CVs.

We do not require religion or religious sect unless there is a stated operational or legal reason for a specific opportunity.

# Documents

Identity files are collected inside the application — never on the landing page. They are stored privately and accessed by authorised staff only.

# Contact

Questions about this notice can be sent through the contact page${siteConfig.email ? ` or ${siteConfig.email}` : ""}.`}
    />
  );
}
