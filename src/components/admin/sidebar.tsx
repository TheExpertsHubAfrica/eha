"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { logoutAdminAction } from "@/server/admin/actions";
import { can, roleLabel, type AdminPermission, type AdminRole } from "@/lib/admin/permissions";
import { cn } from "@/lib/utils";

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

function AdminNavLinks({
  role,
  onNavigate,
}: {
  role: AdminRole;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() || "/admin";

  return (
    <nav className="space-y-0.5 p-3" aria-label="Admin">
      {links
        .filter((item) => !item.permission || can(role, item.permission))
        .map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "block rounded-sm px-3 py-2.5 text-sm",
                active
                  ? "bg-white text-black"
                  : "text-white/75 hover:bg-white/10 hover:text-white",
              )}
            >
              {item.label}
            </Link>
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
      <p className="truncate text-sm font-medium text-white">{user.name}</p>
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
          <Logo
            background="dark"
            href="/admin"
            imageClassName="h-8 w-auto"
          />
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

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-white px-4 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Open admin menu"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent title="Admin menu" side="left" bare className="w-[min(100%,288px)]">
            <AdminNavPanel
              user={user}
              showClose
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <Logo background="light" href="/admin" imageClassName="h-7 w-auto" />
        <p className="ml-auto truncate text-xs font-semibold tracking-[0.12em] text-muted uppercase">
          Admin
        </p>
      </header>

      <aside className="hidden h-dvh w-64 shrink-0 md:flex">
        <AdminNavPanel user={user} className="w-full" />
      </aside>
    </>
  );
}
