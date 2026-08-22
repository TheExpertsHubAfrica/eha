import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppCta } from "@/components/layout/whatsapp-cta";
import { getResolvedSite } from "@/server/settings";

export async function SiteShell({ children }: { children: ReactNode }) {
  const site = await getResolvedSite();
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter site={site} />
      <WhatsAppCta site={site} />
    </div>
  );
}
