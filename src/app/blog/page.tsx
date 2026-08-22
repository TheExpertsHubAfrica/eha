import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHero } from "@/components/ui/page-hero";
import { siteConfig } from "@/lib/site-config";
import { formatDisplayDate } from "@/lib/utils";
import { getPublishedPosts } from "@/server/public-content";

export const metadata: Metadata = {
  title: "Blog",
  description: `Guides and updates from ${siteConfig.name}.`,
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  return (
    <SiteShell>
      <PageHero
        eyebrow="Blog"
        title={posts.length ? "Guides and destination notes." : "Guides will be published here."}
        description={
          posts.length
            ? "Published by the team. Each article is a real update, not filler."
            : "No articles yet. This space is reserved for application guidance and destination notes."
        }
      />
      <section className="container-page py-12">
        {posts.length === 0 ? (
          <EmptyState
            title="No posts yet"
            description="When the content team publishes articles, they will appear on this page."
            actionHref="/contact"
            actionLabel="Contact us"
          />
        ) : (
          <ul className="space-y-8">
            {posts.map((post) => (
              <li key={post.id} className="border-t border-border pt-8 first:border-t-0 first:pt-0">
                <p className="text-sm text-muted">{formatDisplayDate(post.publishedAt)}</p>
                <h2 className="mt-1 text-xl font-semibold text-navy">
                  <Link href={`/blog/${post.slug}`} className="hover:text-blue">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 text-muted">{post.excerpt}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </SiteShell>
  );
}
