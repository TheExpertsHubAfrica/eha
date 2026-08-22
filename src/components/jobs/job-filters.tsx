import Link from "next/link";
import type { JobListFacets, JobListQuery } from "@/lib/catalog/types";
import { CheckboxField, NativeSelect } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function JobFilters({
  filters,
  facets,
  resultCount,
}: {
  filters: JobListQuery;
  facets: JobListFacets;
  resultCount: number;
}) {
  return (
    <form
      method="get"
      className="rounded-lg border border-border bg-white p-5"
      aria-label="Filter opportunities"
    >
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
        <Label htmlFor="country">Country</Label>
        <NativeSelect id="country" name="country" defaultValue={filters.country ?? ""}>
          <option value="">All countries</option>
          {facets.countries.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="mt-4">
        <Label htmlFor="city">City</Label>
        <NativeSelect id="city" name="city" defaultValue={filters.city ?? ""}>
          <option value="">All cities</option>
          {facets.cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="mt-4">
        <Label htmlFor="category">Job category</Label>
        <NativeSelect id="category" name="category" defaultValue={filters.category ?? ""}>
          <option value="">All categories</option>
          {facets.categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="mt-4">
        <Label htmlFor="availability">Availability</Label>
        <NativeSelect
          id="availability"
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
            <Label htmlFor="salaryMin" className="sr-only">
              Minimum salary
            </Label>
            <Input
              id="salaryMin"
              name="salaryMin"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="Min"
              defaultValue={filters.salaryMin ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="salaryMax" className="sr-only">
              Maximum salary
            </Label>
            <Input
              id="salaryMax"
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
          id="accommodation"
          name="accommodation"
          label="Accommodation"
          defaultChecked={filters.accommodation}
        />
        <CheckboxField
          id="flight"
          name="flight"
          label="Flight"
          defaultChecked={filters.flight}
        />
        <CheckboxField
          id="visa"
          name="visa"
          label="Visa assistance"
          defaultChecked={filters.visa}
        />
      </fieldset>

      <div className="mt-4">
        <Label htmlFor="sort">Sort</Label>
        <NativeSelect id="sort" name="sort" defaultValue={filters.sort ?? "newest"}>
          <option value="newest">Newest</option>
          <option value="salary-desc">Salary: high to low</option>
          <option value="salary-asc">Salary: low to high</option>
        </NativeSelect>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <Button type="submit" className="w-full">
          Apply filters
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href="/work-abroad">Clear</Link>
        </Button>
      </div>
    </form>
  );
}
