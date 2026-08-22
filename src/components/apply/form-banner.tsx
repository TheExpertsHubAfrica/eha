import { FieldError } from "@/components/ui/label";

export function FormBanner({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
      {error}
    </p>
  );
}

export { FieldError };
