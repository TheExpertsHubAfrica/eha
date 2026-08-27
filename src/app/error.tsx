"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ErrorShell } from "@/components/layout/error-shell";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorShell>
      <div className="container-page py-24 text-center">
        <p className="text-sm font-semibold tracking-wide text-blue">Error</p>
        <h1 className="mt-3 text-3xl font-semibold text-navy">
          Something went wrong.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Please try again. If it continues, contact our team — do not resend
          documents by email unless we ask.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Return home</Link>
          </Button>
        </div>
      </div>
    </ErrorShell>
  );
}
