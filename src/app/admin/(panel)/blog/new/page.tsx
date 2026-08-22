import type { Metadata } from "next";
import Link from "next/link";
import { BlogForm } from "@/components/admin/cms-forms";
import { requireAdmin } from "@/server/admin/auth";

export const metadata: Metadata = {
  title: "New blog post",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminNewBlogPage() {
  await requireAdmin("content.write");
  return (
    <div>
      <Link href="/admin/blog" className="text-sm text-blue hover:underline">
        Back to blog
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold text-navy">New post</h1>
      <BlogForm />
    </div>
  );
}
