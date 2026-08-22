import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Terms of use for ${siteConfig.name}.`,
};

export const dynamic = "force-dynamic";

export default function TermsPage() {
  return (
    <LegalDocument
      slug="terms"
      fallbackTitle="Terms & Conditions"
      fallbackDescription="Using this website means you agree to these terms. It is not a substitute for formal legal review."
      fallbackBody={`Listings describe opportunities as currently offered through ${siteConfig.name}. They are not employment contracts, visa grants, or university offers.

Placement and visa support, where stated, is subject to eligibility, documentation, employer or institution decisions, and applicable law. Do not rely on informal guarantees from unverified third parties.

You are responsible for the accuracy of information you submit. False documents or identity details may result in an application being declined.`}
    />
  );
}
