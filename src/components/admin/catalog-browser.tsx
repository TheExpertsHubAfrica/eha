"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AdminEmptyState } from "@/components/admin/empty-state";
import { AvailabilityBadge, PublishStatusBadge } from "@/components/admin/status-badge";
import { cn } from "@/lib/utils";

export type AdminCatalogItem = {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  status: string;
  featured?: boolean;
  availability?: string;
  coverUrl?: string | null;
  meta?: string;
};

type StatusFilter = "all" | "published" | "draft" | "archived";

export function AdminCatalogBrowser({
  items,
  emptyTitle,
  emptyDescription,
  emptyActionHref,
  emptyActionLabel,
  emptyIcon,
  searchPlaceholder = "Search…",
}: {
  items: AdminCatalogItem[];
  emptyTitle: string;
  emptyDescription: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
  emptyIcon?: ReactNode;
  searchPlaceholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (status !== "all" && item.status !== status) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        (item.meta?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [items, query, status]);

  const counts = useMemo(() => {
    return {
      all: items.length,
      published: items.filter((i) => i.status === "published").length,
      draft: items.filter((i) => i.status === "draft").length,
      archived: items.filter((i) => i.status === "archived").length,
    };
  }, [items]);

  const filters: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "published", label: "Published" },
    { id: "draft", label: "Draft" },
    { id: "archived", label: "Archived" },
  ];

  if (items.length === 0) {
    return (
      <AdminEmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionHref={emptyActionHref}
        actionLabel={emptyActionLabel}
        icon={emptyIcon}
        className="mt-6"
      />
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
            aria-label={searchPlaceholder}
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter by status">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={status === filter.id}
              onClick={() => setStatus(filter.id)}
              className={cn(
                "rounded-sm px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors",
                status === filter.id
                  ? "bg-black text-white"
                  : "bg-white text-muted ring-1 ring-border hover:text-navy",
              )}
            >
              {filter.label}
              <span className="ml-1.5 tabular-nums opacity-70">{counts[filter.id]}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-border bg-white px-4 py-8 text-center text-sm text-muted">
          No items match “{query || status}”.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white transition-all hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[0_8px_24px_-12px_rgba(26,24,20,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                {item.coverUrl ? (
                  <div className="relative aspect-[16/9] overflow-hidden bg-ash-100">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbs; may be /api covers */}
                    <img
                      src={item.coverUrl}
                      alt=""
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] items-end bg-linear-to-br from-ash-200 to-ash-100 px-4 py-3">
                    <span className="text-xs font-medium tracking-wide text-muted uppercase">
                      {item.meta ?? "Listing"}
                    </span>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <PublishStatusBadge status={item.status} />
                    {item.featured ? <Badge tone="gold">Featured</Badge> : null}
                    {item.availability ? <AvailabilityBadge value={item.availability} /> : null}
                  </div>
                  <h2 className="mt-3 text-base font-semibold text-navy group-hover:text-gold-deep">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted">{item.subtitle}</p>
                  {item.meta && item.coverUrl ? (
                    <p className="mt-auto pt-3 text-xs text-muted">{item.meta}</p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
