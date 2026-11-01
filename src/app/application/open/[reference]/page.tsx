import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ConfirmationShell } from "@/components/apply/confirmation-shell";
import { ContinueApplicationButton } from "@/components/apply/start-button";
import { maskEmail } from "@/lib/apply/mask-email";
import { applicationAccessPath } from "@/lib/apply/reference";
import { openApplicationAction } from "@/server/application/actions";
import { inspectAccessLink } from "@/server/application/access";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Open your application",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function OpenApplicationPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ t?: string | string[] }>;
}) {
  const { reference } = await params;
  const query = await searchParams;
  const token = typeof query.t === "string" ? query.t.trim() : "";
  const link = token ? await inspectAccessLink(reference, token) : null;
  if (!link) {
    redirect(`${applicationAccessPath(reference)}&link=expired`);
  }

  return (
    <ConfirmationShell>
      <div className="max-w-xl rounded-lg border border-border bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-navy">Open your application?</h1>
        <p className="mt-3 text-muted">
          This link opens your application for {link.job.title} in {link.job.city}
          {link.profile ? (
            <>
              , submitted with the email{" "}
              <span className="font-medium text-navy">{maskEmail(link.profile.email)}</span>
            </>
          ) : null}
          .
        </p>
        <p className="mt-3 text-sm text-muted">
          It shows your passport details, so only continue on a device you trust. The link works
          once, access lasts 24 hours, and continuing signs out any other device.
        </p>
        <form action={openApplicationAction.bind(null, reference, token)} className="mt-6">
          <ContinueApplicationButton label="Open my application" />
        </form>
        <p className="mt-4 text-sm">
          <Link href="/" className="text-blue">
            Not now
          </Link>
        </p>
      </div>
    </ConfirmationShell>
  );
}
