import type { JobListQuery } from "@/lib/catalog/types";

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function bool(value: string | string[] | undefined) {
  const v = first(value);
  return v === "1" || v === "true" || v === "on";
}

function num(value: string | string[] | undefined) {
  const v = first(value);
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function parseJobFilters(
  params: Record<string, string | string[] | undefined>,
): JobListQuery {
  const availability = first(params.availability);
  const sort = first(params.sort);

  return {
    q: first(params.q)?.trim() || undefined,
    country: first(params.country) || undefined,
    city: first(params.city) || undefined,
    category: first(params.category) || undefined,
    availability:
      availability === "open" || availability === "limited" || availability === "closed"
        ? availability
        : undefined,
    salaryMin: num(params.salaryMin),
    salaryMax: num(params.salaryMax),
    accommodation: bool(params.accommodation) || undefined,
    flight: bool(params.flight) || undefined,
    visa: bool(params.visa) || undefined,
    sort:
      sort === "salary-desc" || sort === "salary-asc" || sort === "newest"
        ? sort
        : "newest",
  };
}

export function hasActiveFilters(filters: JobListQuery) {
  return Boolean(
    filters.q ||
      filters.country ||
      filters.city ||
      filters.category ||
      filters.availability ||
      filters.salaryMin != null ||
      filters.salaryMax != null ||
      filters.accommodation ||
      filters.flight ||
      filters.visa,
  );
}
