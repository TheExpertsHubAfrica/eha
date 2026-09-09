import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  WhatsAppCta,
  type WhatsAppCtaMode,
} from "@/components/layout/whatsapp-cta";
import { getResolvedSite } from "@/server/settings";

export async function SiteShell({
  children,
  whatsapp,
}: {
  children: ReactNode;
  whatsapp?: {
    mode?: WhatsAppCtaMode;
    prefill?: string;
    raiseForMobileBar?: boolean;
    label?: string;
  };
}) {
  const site = await getResolvedSite();
  return (
    <div className="flex min-h-full flex-col">
      <div className="print:hidden">
        <SiteHeader />
      </div>
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <div className="print:hidden">
        <SiteFooter site={site} />
        <WhatsAppCta
          site={site}
          mode={whatsapp?.mode ?? "default"}
          prefill={whatsapp?.prefill}
          raiseForMobileBar={whatsapp?.raiseForMobileBar}
          label={whatsapp?.label}
        />
      </div>
    </div>
  );
}
