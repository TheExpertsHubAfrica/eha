import type { Metadata } from "next";
import Link from "next/link";
import { AdminStudyForm } from "@/components/admin/offer-forms";
import { requireAdmin } from "@/server/admin/auth";

export const metadata: Metadata = {
  title: "New study destination",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminNewStudyPage() {
  await requireAdmin("study.write");
  return (
    <div>
      <Link href="/admin/study" className="text-sm text-blue hover:underline">
        Back to study
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold text-navy">New study destination</h1>
      <AdminStudyForm
        item={{
          name: "",
          slug: "",
          region: "",
          summary: "",
          support: "",
          featured: false,
          status: "draft",
        }}
      />
    </div>
  );
}
