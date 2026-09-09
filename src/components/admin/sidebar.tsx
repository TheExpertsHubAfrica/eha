"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Newspaper,
  Plane,
  ScrollText,
  Settings,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { logoutAdminAction } from "@/server/admin/actions";
import { can, roleLabel, type AdminPermission, type AdminRole } from "@/lib/admin/permissions";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  permission?: AdminPermission;
  icon: ComponentType<{ className?: string }>;
};

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Workspace",
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/applications", label: "Applications", permission: "applications.read", icon: ClipboardList },
      { href: "/admin/payments", label: "Payments", permission: "payments.read", icon: Wallet },
      { href: "/admin/invoices", label: "Invoices", permission: "payments.write", icon: FileText },
      { href: "/admin/analytics", label: "Analytics", permission: "analytics.read", icon: BarChart3 },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { href: "/admin/jobs", label: "Jobs", permission: "jobs.write", icon: Briefcase },
      { href: "/admin/travel", label: "Travel", permission: "travel.write", icon: Plane },
      { href: "/admin/study", label: "Study", permission: "study.write", icon: GraduationCap },
    ],
  },
  {
    label: "Site",
    items: [
      { href: "/admin/blog", label: "Blog", permission: "content.write", icon: Newspaper },
      { href: "/admin/content", label: "Content", permission: "content.write", icon: FileText },
      { href: "/admin/settings", label: "Settings", permission: "settings.write", icon: Settings },
      { href: "/admin/audit-logs", label: "Audit log", permission: "audit.read", icon: ScrollText },
    ],
  },
];

function AdminNavLinks({
  role,
  onNavigate,
}: {
  role: AdminRole;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() || "/admin";

  return (
    <nav className="space-y-5 p-3" aria-label="Admin">
      {groups.map((group) => {
        const visible = group.items.filter(
          (item) => !item.permission || can(role, item.permission),
        );
        if (visible.length === 0) return null;
        return (
          <div key={group.label}>
            <p className="px-3 pb-1.5 text-[10px] font-semibold tracking-[0.16em] text-white/40 uppercase">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {visible.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-white text-black shadow-[inset_3px_0_0_0_#b8953a]"
                        : "text-white/75 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <Icon className={cn("size-4 shrink-0", active ? "text-gold-deep" : "opacity-80")} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function AdminNavFooter({
  user,
}: {
  user: { name: string; role: AdminRole };
}) {
  return (
    <div className="shrink-0 border-t border-white/10 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-semibold text-black">
          {user.name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? "")
            .join("") || "A"}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{user.name}</p>
          <p className="truncate text-xs text-white/55">{roleLabel(user.role)}</p>
        </div>
      </div>
      <form action={logoutAdminAction} className="mt-3">
        <button
          type="submit"
          className="text-sm text-white/75 underline-offset-4 hover:text-white hover:underline"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

function AdminNavPanel({
  user,
  onNavigate,
  showClose = false,
  className,
}: {
  user: { name: string; role: AdminRole };
  onNavigate?: () => void;
  showClose?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex h-full flex-col overflow-hidden bg-black text-white", className)}>
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-5 py-5">
        <div className="min-w-0">
          <div className="inline-flex bg-white px-3 py-2">
            <Logo background="light" href="/admin" imageClassName="h-8 w-auto" />
          </div>
          <p className="mt-3 text-[11px] font-semibold tracking-[0.18em] uppercase text-white/55">
            Admin console
          </p>
        </div>
        {showClose ? (
          <SheetClose
            className="inline-flex size-10 shrink-0 items-center justify-center text-white hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </SheetClose>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <AdminNavLinks role={user.role} onNavigate={onNavigate} />
      </div>
      <AdminNavFooter user={user} />
    </div>
  );
}

export function AdminSidebar({
  user,
}: {
  user: { name: string; role: AdminRole };
}) {
  const pathname = usePathname() || "/admin";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const currentLabel =
    groups.flatMap((group) => group.items).find((item) =>
      item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href),
    )?.label ?? "Admin";

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-white/95 px-4 backdrop-blur md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" size="icon" aria-label="Open admin menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent title="Admin menu" side="left" bare className="w-[min(100%,288px)]">
            <AdminNavPanel user={user} showClose onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <Logo background="light" href="/admin" imageClassName="h-7 w-auto" />
        <p className="ml-auto truncate text-xs font-semibold tracking-[0.12em] text-muted uppercase">
          {currentLabel}
        </p>
      </header>

      <aside className="hidden h-dvh w-64 shrink-0 md:flex">
        <AdminNavPanel user={user} className="w-full" />
      </aside>
    </>
  );
}
