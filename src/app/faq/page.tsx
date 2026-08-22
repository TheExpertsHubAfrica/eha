import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { siteConfig } from "@/lib/site-config";
import { getPublishedFaqs } from "@/server/public-content";

export const metadata: Metadata = {
  title: "FAQs",
  description: `Frequently asked questions about applying with ${siteConfig.name}.`,
};

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const faqs = await getPublishedFaqs();
  return (
    <SiteShell>
      <PageHero
        eyebrow="Support"
        title="Application help"
        description="Short answers for first-time applicants. Contact us if your question is not covered."
      />
      <section className="container-page space-y-6 py-12">
        {faqs.length === 0 ? (
          <p className="text-muted">FAQs will appear here once they are published in the admin CMS.</p>
        ) : (
          faqs.map((item) => (
            <article key={item.id} className="border-t border-border pt-6 first:border-t-0 first:pt-0">
              <h2 className="text-lg font-semibold text-navy">{item.question}</h2>
              <p className="mt-2 text-muted">{item.answer}</p>
            </article>
          ))
        )}
      </section>
    </SiteShell>
  );
}
