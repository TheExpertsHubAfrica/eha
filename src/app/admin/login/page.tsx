import type { Metadata } from "next";
import { headers } from "next/headers";
import { Logo } from "@/components/brand/logo";
import { AdminLoginForm } from "@/components/admin/login-form";
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
    <main className="flex min-h-dvh items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-md border border-white/10 bg-white p-8 sm:p-10">
        <Logo
          background="light"
          href="/admin/login"
          priority
          imageClassName="h-10 w-auto"
        />
        <h1 className="mt-8 text-2xl font-bold tracking-tight text-black">
          Admin console
        </h1>
        <p className="mt-2 text-sm text-muted">
          Sign in with an issued staff account. This area is not part of the public
          website.
        </p>
        <div className="mt-8">
          <AdminLoginForm nextPath={nextPath} />
        </div>
        {!hasAdmin ? (
          <p className="mt-6 text-sm text-muted">
            No staff account exists yet. Set ADMIN_EMAIL and ADMIN_PASSWORD in
            .env.local (8+ characters), then run npm run db:seed.
          </p>
        ) : null}
        <p className="mt-8 text-xs text-muted">Signing in to {host}.</p>
      </div>
    </main>
  );
}
