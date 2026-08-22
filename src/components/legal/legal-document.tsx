import { SiteShell } from "@/components/layout/site-shell";
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
  const paragraphs = body.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  return (
    <SiteShell>
      <PageHero eyebrow="Legal" title={title} description={fallbackDescription} />
      <article className="container-page prose-eha space-y-6 py-12 text-muted">
        {paragraphs.map((block) =>
          block.startsWith("# ") ? (
            <h2 key={block} className="text-xl font-semibold text-navy">
              {block.slice(2)}
            </h2>
          ) : (
            <p key={block.slice(0, 60)}>{block}</p>
          ),
        )}
      </article>
    </SiteShell>
  );
}
