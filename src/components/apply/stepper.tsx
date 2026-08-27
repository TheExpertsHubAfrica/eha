import Link from "next/link";
import type { JobOffer } from "@/lib/catalog/types";
import { applyPath, getApplySteps, type ApplyStepId } from "@/lib/apply/steps";
import { cn } from "@/lib/utils";

export function ApplyStepper({
  job,
  current,
  completed,
}: {
  job: JobOffer;
  current: ApplyStepId;
  completed: string[];
}) {
  const steps = getApplySteps(job);
  const currentIndex = steps.findIndex((step) => step.id === current);

  return (
    <nav aria-label="Application progress">
      <ol className="flex gap-2 overflow-x-auto pb-1 sm:gap-3">
        {steps.map((step, index) => {
          const done = completed.includes(step.id) || index < currentIndex;
          const isCurrent = step.id === current;
          const clickable = done || isCurrent;
          const className = cn(
            "flex min-w-fit items-center gap-2 rounded-sm px-3 py-1.5 text-xs font-medium sm:text-sm",
            isCurrent
              ? "bg-black text-white"
              : done
                ? "bg-gold-soft text-gold-deep"
                : "border border-border bg-white text-muted",
          );
          return (
            <li key={step.id}>
              {clickable ? (
                <Link
                  href={applyPath(job.id, step.id)}
                  className={className}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <span aria-hidden="true">{index + 1}</span>
                  {step.label}
                </Link>
              ) : (
                <span className={className}>
                  <span aria-hidden="true">{index + 1}</span>
                  {step.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
