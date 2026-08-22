import type { Metadata } from "next";
import { headers } from "next/headers";
import { AdminLoginForm } from "@/components/admin/login-form";
import { siteConfig } from "@/lib/site-config";
import { bootstrapAdminExists } from "@/server/admin/actions";
import { loadAdminUser } from "@/server/admin/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await loadAdminUser();
  if (session) redirect("/admin");
  const query = await searchParams;
  const nextPath = query.next?.startsWith("/admin") ? query.next : undefined;
  const hasAdmin = await bootstrapAdminExists();
  const host = (await headers()).get("host") ?? "this server";

  return (
    <main className="flex min-h-full items-center justify-center bg-navy px-4 py-12">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-blue">
          {siteConfig.shortName}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-navy">Admin console</h1>
        <p className="mt-2 text-sm text-muted">
          Sign in with an issued staff account. This area is not part of the public
          website.
        </p>
        <div className="mt-6">
          <AdminLoginForm nextPath={nextPath} />
        </div>
        {!hasAdmin ? (
          <p className="mt-6 text-sm text-muted">
            No staff account exists yet. Set ADMIN_EMAIL and ADMIN_PASSWORD in
            .env.local (8+ characters), then run npm run db:seed.
          </p>
        ) : null}
        <p className="mt-6 text-xs text-muted">Signing in to {host}.</p>
      </div>
    </main>
  );
}
