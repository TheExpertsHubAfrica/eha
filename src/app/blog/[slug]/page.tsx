import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { formatDisplayDate } from "@/lib/utils";
import { siteImages } from "@/lib/site-images";
import { getPublishedPost } from "@/server/public-content";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Article not found" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();
  const paragraphs = post.body.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Blog"
        title={post.title}
        description={`${formatDisplayDate(post.publishedAt)} · ${post.excerpt}`}
        image={siteImages.blog.default}
        imageAlt={`${post.title} — TEHA blog on work, travel and study abroad`}
      />
      <article className="container-page space-y-5 py-12 text-muted">
        {paragraphs.map((block) => (
          <p key={block.slice(0, 48)}>{block}</p>
        ))}
        <p className="pt-4 text-sm">
          <Link href="/blog" className="text-blue hover:underline">
            All posts
          </Link>
        </p>
      </article>
    </SiteShell>
  );
}
