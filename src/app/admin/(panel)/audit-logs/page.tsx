import type { Metadata } from "next";
import { ScrollText } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/empty-state";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatDisplayDate } from "@/lib/utils";
import { prisma } from "@/server/db";
import { requireAdmin } from "@/server/admin/auth";

export const metadata: Metadata = {
  title: "Audit log",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  await requireAdmin("audit.read");
  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 120,
  });
  return (
    <div>
      <AdminPageHeader
        eyebrow="Site"
        title="Audit log"
        description="Staff actions such as views, status changes, downloads and publishes. Showing the latest 120 events."
      />
      {rows.length === 0 ? (
        <AdminEmptyState
          title="No audit events yet"
          description="Actions taken in the admin console will appear here."
          icon={<ScrollText className="size-5" />}
          className="mt-6"
        />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Target</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border transition-colors last:border-0 hover:bg-gold-soft/20"
                >
                  <td className="px-4 py-3 whitespace-nowrap">{formatDisplayDate(row.createdAt)}</td>
                  <td className="px-4 py-3">
                    {row.actorType}
                    {row.actorId ? ` · ${row.actorId.slice(0, 8)}` : ""}
                  </td>
                  <td className="px-4 py-3 font-medium text-navy">{row.action}</td>
                  <td className="px-4 py-3">
                    {row.targetType}
                    {row.targetId ? ` · ${row.targetId.slice(0, 10)}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
