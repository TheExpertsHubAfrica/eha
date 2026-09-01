"use client";

import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import type { JobListFacets, JobListQuery } from "@/lib/catalog/types";
import { hasActiveFilters } from "@/lib/jobs/filters";
import { CheckboxField, NativeSelect } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function AdvancedFilters({
  filters,
  facets,
  idPrefix = "",
}: {
  filters: JobListQuery;
  facets: JobListFacets;
  idPrefix?: string;
}) {
  const id = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name);

  return (
    <>
      <div>
        <Label htmlFor={id("country")}>Country</Label>
        <NativeSelect id={id("country")} name="country" defaultValue={filters.country ?? ""}>
          <option value="">All countries</option>
          {facets.countries.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="mt-4">
        <Label htmlFor={id("city")}>City</Label>
        <NativeSelect id={id("city")} name="city" defaultValue={filters.city ?? ""}>
          <option value="">All cities</option>
          {facets.cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="mt-4">
        <Label htmlFor={id("category")}>Job category</Label>
        <NativeSelect id={id("category")} name="category" defaultValue={filters.category ?? ""}>
          <option value="">All categories</option>
          {facets.categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="mt-4">
        <Label htmlFor={id("availability")}>Availability</Label>
        <NativeSelect
          id={id("availability")}
          name="availability"
          defaultValue={filters.availability ?? ""}
        >
          <option value="">Any status</option>
          <option value="open">Open</option>
          <option value="limited">Limited</option>
          <option value="closed">Closed</option>
        </NativeSelect>
      </div>

      <fieldset className="mt-4">
        <legend className="mb-1.5 text-sm font-medium text-navy">
          Monthly salary (listed currency)
        </legend>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor={id("salaryMin")} className="sr-only">
              Minimum salary
            </Label>
            <Input
              id={id("salaryMin")}
              name="salaryMin"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="Min"
              defaultValue={filters.salaryMin ?? ""}
            />
          </div>
          <div>
            <Label htmlFor={id("salaryMax")} className="sr-only">
              Maximum salary
            </Label>
            <Input
              id={id("salaryMax")}
              name="salaryMax"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="Max"
              defaultValue={filters.salaryMax ?? ""}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="mt-5 space-y-3">
        <legend className="mb-1 text-sm font-medium text-navy">Included</legend>
        <CheckboxField
          id={id("accommodation")}
          name="accommodation"
          label="Accommodation"
          defaultChecked={filters.accommodation}
        />
        <CheckboxField
          id={id("flight")}
          name="flight"
          label="Flight"
          defaultChecked={filters.flight}
        />
        <CheckboxField
          id={id("visa")}
          name="visa"
          label="Visa assistance"
          defaultChecked={filters.visa}
        />
      </fieldset>

      <div className="mt-4">
        <Label htmlFor={id("sort")}>Sort</Label>
        <NativeSelect id={id("sort")} name="sort" defaultValue={filters.sort ?? "newest"}>
          <option value="newest">Newest</option>
          <option value="salary-desc">Salary: high to low</option>
          <option value="salary-asc">Salary: low to high</option>
        </NativeSelect>
      </div>
    </>
  );
}

function FilterActions({ onApply }: { onApply?: () => void }) {
  return (
    <div className="mt-5 flex flex-col gap-2">
      <Button type="submit" className="w-full" onClick={onApply}>
        Apply filters
      </Button>
      <Button asChild variant="ghost" className="w-full">
        <Link href="/work-abroad">Clear</Link>
      </Button>
    </div>
  );
}

export function JobFilters({
  filters,
  facets,
  resultCount,
}: {
  filters: JobListQuery;
  facets: JobListFacets;
  resultCount: number;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const filtersActive = hasActiveFilters(filters);

  return (
    <form method="get" aria-label="Filter opportunities">
      <div className="rounded-lg border border-border bg-white p-4 lg:hidden">
        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <Label htmlFor="q-mobile">Search</Label>
            <Input
              id="q-mobile"
              name="q"
              type="search"
              placeholder="Role, city, or country"
              defaultValue={filters.q ?? ""}
            />
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn("mt-6 shrink-0 gap-1.5", filtersActive && "border-gold text-gold-deep")}
                aria-label="View more filters"
              >
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">More</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" title="Filter opportunities" className="overflow-y-auto">
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs text-muted">{resultCount} opportunities shown</p>
                <div className="mt-4">
                  <AdvancedFilters filters={filters} facets={facets} idPrefix="mobile" />
                </div>
                <FilterActions onApply={() => setSheetOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <p className="mt-2 text-xs text-muted">{resultCount} shown</p>
      </div>

      <div className="hidden rounded-lg border border-border bg-white p-5 lg:block">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-base font-semibold text-navy">Filter</h2>
          <p className="text-xs text-muted">{resultCount} shown</p>
        </div>

        <div className="mt-4">
          <Label htmlFor="q">Search</Label>
          <Input
            id="q"
            name="q"
            type="search"
            placeholder="Role, city, or country"
            defaultValue={filters.q ?? ""}
          />
        </div>

        <div className="mt-4">
          <AdvancedFilters filters={filters} facets={facets} />
        </div>

        <FilterActions />
      </div>
    </form>
  );
}
