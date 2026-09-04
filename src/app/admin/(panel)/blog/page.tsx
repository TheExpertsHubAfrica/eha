import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { AdminCatalogBrowser } from "@/components/admin/catalog-browser";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { prisma } from "@/server/db";
import { requireAdmin } from "@/server/admin/auth";

export const metadata: Metadata = {
  title: "Blog",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  await requireAdmin("content.write");
  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const items = posts.map((post) => ({
    id: post.id,
    href: `/admin/blog/${post.id}`,
    title: post.title,
    subtitle: post.excerpt?.trim() || "No excerpt yet",
    status: post.status,
    meta: "Blog post",
  }));

  return (
    <div>
      <AdminPageHeader
        eyebrow="Site"
        title="Blog"
        description="Publish only real guidance. Empty is better than filler."
        actions={
          <Button asChild size="sm">
            <Link href="/admin/blog/new">New post</Link>
          </Button>
        }
      />
      <AdminCatalogBrowser
        items={items}
        emptyTitle="No posts yet"
        emptyDescription="Write a short guidance article when you have something useful to publish."
        emptyActionHref="/admin/blog/new"
        emptyActionLabel="Write post"
        emptyIcon={<Newspaper className="size-5" />}
        searchPlaceholder="Search posts…"
      />
    </div>
  );
}
