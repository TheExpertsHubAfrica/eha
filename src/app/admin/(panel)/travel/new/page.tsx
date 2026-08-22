import type { Metadata } from "next";
import Link from "next/link";
import { AdminTravelForm } from "@/components/admin/offer-forms";
import { requireAdmin } from "@/server/admin/auth";

export const metadata: Metadata = {
  title: "New travel package",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminNewTravelPage() {
  await requireAdmin("travel.write");
  return (
    <div>
      <Link href="/admin/travel" className="text-sm text-blue hover:underline">
        Back to travel
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold text-navy">New travel package</h1>
      <AdminTravelForm
        pack={{
          name: "",
          slug: "",
          destination: "",
          country: "",
          duration: "",
          summary: "",
          includes: "",
          excludes: "",
          featured: false,
          status: "draft",
          accent: "navy",
        }}
      />
    </div>
  );
}
