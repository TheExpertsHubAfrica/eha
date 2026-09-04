import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
