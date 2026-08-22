import type { ReactNode } from "react";
import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdmin } from "@/server/admin/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="flex h-dvh overflow-hidden bg-surface">
      <AdminSidebar user={{ name: user.name, role: user.role }} />
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div id="main-content" className="mx-auto max-w-6xl px-6 py-8 sm:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
