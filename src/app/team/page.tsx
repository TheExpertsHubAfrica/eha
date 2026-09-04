import type { Metadata } from "next";
import { TeamSection } from "@/components/about/team-section";
import { SiteShell } from "@/components/layout/site-shell";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "The Team",
  description: `Meet the people behind ${siteConfig.name}.`,
};

export default function TeamPage() {
  return (
    <SiteShell>
      <section className="border-b border-border bg-ash-wash">
        <div className="container-page py-12 sm:py-16">
          <TeamSection />
        </div>
      </section>
    </SiteShell>
  );
}
