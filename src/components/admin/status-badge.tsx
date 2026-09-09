import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatGhs, pesewasToGhs } from "@/lib/money";
import { statusLabel } from "@/lib/admin/status";

type BadgeTone = "navy" | "blue" | "gold" | "muted" | "success" | "danger" | "outline";

const publishTones: Record<string, BadgeTone> = {
  published: "success",
  draft: "muted",
  archived: "outline",
};

const availabilityTones: Record<string, BadgeTone> = {
  open: "success",
  limited: "gold",
  closed: "danger",
};

const applicationTones: Record<string, BadgeTone> = {
  draft: "muted",
  submitted: "navy",
  under_review: "gold",
  documents_required: "gold",
  shortlisted: "success",
  processing: "navy",
  approved: "success",
  rejected: "danger",
  withdrawn: "outline",
  completed: "success",
};

export type ApplicationPaymentSummary = {
  state: "paid" | "pending" | "unpaid";
  successCount: number;
  totalPesewas: number;
};

export function summarizeApplicationPayments(
  payments: { status: string; amountPesewas: number }[],
): ApplicationPaymentSummary {
  const success = payments.filter((payment) => payment.status === "success");
  if (success.length > 0) {
    return {
      state: "paid",
      successCount: success.length,
      totalPesewas: success.reduce((sum, payment) => sum + payment.amountPesewas, 0),
    };
  }
  if (payments.some((payment) => payment.status === "pending")) {
    return { state: "pending", successCount: 0, totalPesewas: 0 };
  }
  return { state: "unpaid", successCount: 0, totalPesewas: 0 };
}

export function PublishStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge tone={publishTones[status] ?? "muted"} className={cn("capitalize", className)}>
      {status}
    </Badge>
  );
}

export function AvailabilityBadge({ value, className }: { value: string; className?: string }) {
  return (
    <Badge tone={availabilityTones[value] ?? "muted"} className={cn("capitalize", className)}>
      {value}
    </Badge>
  );
}

export function ApplicationStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <Badge tone={applicationTones[status] ?? "muted"} className={cn("capitalize", className)}>
      {statusLabel(status)}
    </Badge>
  );
}

export function ApplicationPaymentBadge({
  summary,
  className,
  showAmount = false,
}: {
  summary: ApplicationPaymentSummary;
  className?: string;
  showAmount?: boolean;
}) {
  if (summary.state === "paid") {
    return (
      <Badge tone="success" className={cn(className)}>
        Paid
        {showAmount && summary.totalPesewas > 0
          ? ` · ${formatGhs(pesewasToGhs(summary.totalPesewas))}`
          : summary.successCount > 1
            ? ` · ${summary.successCount}`
            : ""}
      </Badge>
    );
  }
  if (summary.state === "pending") {
    return (
      <Badge tone="gold" className={cn(className)}>
        Payment pending
      </Badge>
    );
  }
  return (
    <Badge tone="muted" className={cn(className)}>
      Unpaid
    </Badge>
  );
}
