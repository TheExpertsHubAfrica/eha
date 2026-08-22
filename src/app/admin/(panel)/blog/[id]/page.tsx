import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogForm } from "@/components/admin/cms-forms";
import { prisma } from "@/server/db";
import { requireAdmin } from "@/server/admin/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id }, select: { title: true } });
  return { title: post?.title ?? "Post", robots: { index: false, follow: false } };
}

export default async function AdminEditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("content.write");
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();
  return (
    <div>
      <Link href="/admin/blog" className="text-sm text-blue hover:underline">
        Back to blog
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold text-navy">{post.title}</h1>
      <BlogForm
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          body: post.body,
          status: post.status,
        }}
      />
    </div>
  );
}
