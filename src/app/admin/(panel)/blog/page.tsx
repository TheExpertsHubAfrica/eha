import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Blog</h1>
          <p className="mt-1 text-sm text-muted">Publish only real guidance. Empty is better than filler.</p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/blog/new">New post</Link>
        </Button>
      </div>
      {posts.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No posts yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/blog/${post.id}`} className="font-medium text-blue hover:underline">
                      {post.title}
                    </Link>
                    {post.status === "published" ? (
                      <Badge tone="success" className="ml-2">
                        Live
                      </Badge>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 capitalize">{post.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
