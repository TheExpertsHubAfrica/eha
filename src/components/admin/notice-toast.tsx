"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const NOTICE_MESSAGES: Record<string, string> = {
  saved: "Saved successfully.",
  created: "Created successfully.",
  deleted: "Deleted.",
  updated: "Updated successfully.",
};

export function AdminNoticeToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const notice = searchParams.get("notice");
    if (!notice) return;
    toast.success(NOTICE_MESSAGES[notice] ?? "Done.");
    const next = new URLSearchParams(searchParams.toString());
    next.delete("notice");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return null;
}
