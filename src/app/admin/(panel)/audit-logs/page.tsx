import type { Metadata } from "next";
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
      <h1 className="text-2xl font-semibold text-navy">Audit log</h1>
      <p className="mt-1 text-sm text-muted">Staff actions such as views, status changes, downloads, and publishes.</p>
      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No audit events recorded yet.</p>
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
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{formatDisplayDate(row.createdAt)}</td>
                  <td className="px-4 py-3">
                    {row.actorType}
                    {row.actorId ? ` · ${row.actorId.slice(0, 8)}` : ""}
                  </td>
                  <td className="px-4 py-3">{row.action}</td>
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
