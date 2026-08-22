"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdminAction } from "@/server/admin/actions";
import { can, roleLabel, type AdminPermission, type AdminRole } from "@/lib/admin/permissions";
import { siteConfig } from "@/lib/site-config";

const links: { href: string; label: string; permission?: AdminPermission }[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/applications", label: "Applications", permission: "applications.read" },
  { href: "/admin/analytics", label: "Analytics", permission: "analytics.read" },
  { href: "/admin/jobs", label: "Jobs", permission: "jobs.write" },
  { href: "/admin/travel", label: "Travel", permission: "travel.write" },
  { href: "/admin/study", label: "Study", permission: "study.write" },
  { href: "/admin/blog", label: "Blog", permission: "content.write" },
  { href: "/admin/content", label: "Content", permission: "content.write" },
  { href: "/admin/settings", label: "Settings", permission: "settings.write" },
  { href: "/admin/audit-logs", label: "Audit log", permission: "audit.read" },
];

export function AdminSidebar({
  user,
}: {
  user: { name: string; role: AdminRole };
}) {
  const pathname = usePathname() || "/admin";

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-navy text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/55">
          {siteConfig.shortName}
        </p>
        <p className="mt-1 text-[15px] font-semibold">Admin console</p>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {links
          .filter((item) => !item.permission || can(user.role, item.permission))
          .map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm ${
                  active ? "bg-white/12 text-white" : "text-white/75 hover:bg-white/8 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
      </nav>
      <div className="border-t border-white/10 px-5 py-4">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-xs text-white/55">{roleLabel(user.role)}</p>
        <form action={logoutAdminAction} className="mt-3">
          <button
            type="submit"
            className="text-sm text-white/75 underline-offset-4 hover:text-white hover:underline"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
