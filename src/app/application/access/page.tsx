import type { Metadata } from "next";
import { ApplicationAccessForm } from "@/components/apply/application-access-form";
import { ConfirmationShell } from "@/components/apply/confirmation-shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Open your application",
  robots: { index: false, follow: false },
};

export default async function ApplicationAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string | string[]; link?: string | string[] }>;
}) {
  const query = await searchParams;
  const reference = typeof query.reference === "string" ? query.reference : "";

  return (
    <ConfirmationShell>
      <div className="max-w-xl rounded-lg border border-border bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-navy">Open your application</h1>
        {query.link === "expired" ? (
          <p className="mt-3 rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
            That link has already been used or has expired. Request a new one below.
          </p>
        ) : null}
        <p className="mt-3 text-muted">
          To protect your passport details, access to a submitted application is temporary. Enter
          your reference and email, and we will send you a secure link.
        </p>
        <ApplicationAccessForm reference={reference} />
      </div>
    </ConfirmationShell>
  );
}
