import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import type { JobOffer } from "@/lib/catalog/types";
import { jobPath } from "@/lib/catalog";
import { ApplyStepper } from "@/components/apply/stepper";
import type { ApplyStepId } from "@/lib/apply/steps";
import type { ReactNode } from "react";

export function ApplyShell({
  job,
  step,
  completed,
  children,
}: {
  job: JobOffer;
  step?: ApplyStepId;
  completed?: string[];
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col bg-surface">
      <header className="border-b border-border bg-white">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Logo background="light" />
          <Link href={jobPath(job)} className="text-sm font-medium text-black hover:underline">
            Save and exit
          </Link>
        </div>
      </header>
      <main id="main-content" className="flex-1">
        <div className="container-page py-8 sm:py-10">
          <p className="text-xs font-semibold tracking-[0.16em] text-fg-soft uppercase">
            Application
          </p>
          <h1 className="mt-2 text-2xl font-bold text-black">{job.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {job.city}, {job.country}
          </p>
          {step ? (
            <div className="mt-6">
              <ApplyStepper job={job} current={step} completed={completed ?? []} />
            </div>
          ) : null}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
