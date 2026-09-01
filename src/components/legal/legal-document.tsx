import { SiteShell } from "@/components/layout/site-shell";
import { LegalBody } from "@/components/legal/legal-body";
import { PageHero } from "@/components/ui/page-hero";
import { getLegalPage } from "@/server/public-content";

export async function LegalDocument({
  slug,
  fallbackTitle,
  fallbackDescription,
  fallbackBody,
}: {
  slug: string;
  fallbackTitle: string;
  fallbackDescription: string;
  fallbackBody: string;
}) {
  const page = await getLegalPage(slug);
  const title = page?.title || fallbackTitle;
  const body = page?.body || fallbackBody;

  return (
    <SiteShell>
      <PageHero eyebrow="Legal" title={title} description={fallbackDescription} />
      <article className="container-page prose-eha max-w-3xl py-12 sm:py-14">
        <LegalBody body={body} />
      </article>
    </SiteShell>
  );
}
