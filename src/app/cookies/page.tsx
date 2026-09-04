import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `How ${siteConfig.name} uses cookies.`,
};

export const dynamic = "force-dynamic";

export default function CookiesPage() {
  return (
    <LegalDocument
      slug="cookies"
      fallbackTitle="Cookie Policy"
      fallbackDescription="This site uses essentials required to run the application."
      fallbackBody={`Essential cookies or local storage may be used to keep an application draft, protect forms against abuse and maintain an admin session. We do not currently place advertising cookies.

Page-view counts used in the admin console are stored without names, emails, or document contents.`}
    />
  );
}
