import { SiteHeader } from "@/components/layout/site-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <SiteHeader />
      <div className="container-wide py-12">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="mt-6 h-16 w-full max-w-xl" />
        <Skeleton className="mt-4 h-6 w-full max-w-lg" />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </div>
  );
}
