"use client";

import { useState } from "react";
import { ChevronDown, Filter, Search, X } from "lucide-react";

import { PageShell, PageTitle, Panel } from "@/components/crm/page-shell";
import { cn } from "@/lib/utils";

const PRIMARY = "bg-primary text-primary-foreground hover:opacity-90";
const ACCENT = "bg-accent text-accent-foreground hover:opacity-90";

const LEAD_COUNT = 0;

const controlBorder = "border border-border bg-card focus:border-primary";

function FilterSelect({
  id,
  label,
  placeholder,
  defaultValue,
}: {
  id: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[13px] font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          defaultValue={defaultValue ?? ""}
          className={cn(
            "w-full appearance-none rounded-md py-2 pl-3 pr-9 text-[13px] text-foreground shadow-sm outline-none",
            controlBorder,
          )}
        >
          {!defaultValue ? <option value="">{placeholder}</option> : null}
          {defaultValue ? <option value={defaultValue}>{defaultValue}</option> : null}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}

function PaginationBar() {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <button suppressHydrationWarning type="button" className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40" disabled>
        Previous
      </button>
      <button suppressHydrationWarning type="button" className="min-w-[2rem] rounded bg-primary px-2 py-1 text-sm font-medium text-primary-foreground">
        1
      </button>
      <button suppressHydrationWarning type="button" className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40" disabled>
        Next
      </button>
    </div>
  );
}

export default function BookedListPage() {
  const [tableSearch, setTableSearch] = useState("");
  const [pageSize, setPageSize] = useState("50");
  /** Top Date Range / Teams / … filter card; funnel icon toggles visibility */
  const [showTopFilters, setShowTopFilters] = useState(true);

  return (
    <PageShell>
      <PageTitle>Booked List</PageTitle>

      {showTopFilters ? (
        <Panel className="mb-4 p-4 md:p-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <FilterSelect id="bf-date-range" label="Date Range" placeholder="Select range" defaultValue="Today" />
            <FilterSelect id="bf-teams" label="Teams" placeholder="Select Team" />
            <FilterSelect id="bf-pre-sales" label="Pre Sales Agent" placeholder="Select Pre Sales Agent" />
            <FilterSelect id="bf-sales" label="Sales Agent" placeholder="Select Sales Agent" />
            <div>
              <label htmlFor="bf-project" className="mb-1 block text-[13px] font-medium text-muted-foreground">
                Project
              </label>
              <div className="relative">
                <select
                  id="bf-project"
                  defaultValue=""
                  className={cn("w-full appearance-none rounded-md py-2 pl-3 pr-9 text-[13px] text-foreground shadow-sm outline-none", controlBorder)}
                >
                  <option value="">Search &amp; Select Project</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <FilterSelect id="bf-source" label="Source" placeholder="Select Source" />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:items-end">
            <div className="lg:col-span-2">
              <label htmlFor="bf-channel" className="mb-1 block text-[13px] font-medium text-muted-foreground">
                Channel Partner
              </label>
              <div className="relative">
                <select
                  id="bf-channel"
                  defaultValue=""
                  className={cn("w-full appearance-none rounded-md py-2 pl-3 pr-9 text-[13px] text-foreground shadow-sm outline-none", controlBorder)}
                >
                  <option value="">Search &amp; Select Channel Partner</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <FilterSelect id="bf-sourcing" label="Sourcing Manager" placeholder="Select Sourcing Manager" />
            <div className="flex flex-wrap items-center gap-2 md:col-span-2 xl:col-span-3 xl:justify-end">
              <button suppressHydrationWarning type="button" className={cn("rounded-md px-6 py-2 text-sm font-medium shadow-sm", PRIMARY)}>
                Search
              </button>
              <button
                suppressHydrationWarning
                type="button"
                className="rounded-md border border-border bg-card px-6 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted"
              >
                Clear
              </button>
            </div>
          </div>
        </Panel>
      ) : null}

      <Panel>
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-foreground">Lead Customers ({LEAD_COUNT})</h2>
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setShowTopFilters((v) => !v)}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-shadow",
              ACCENT,
              showTopFilters && "ring-2 ring-accent/40 ring-offset-2",
            )}
            aria-label={showTopFilters ? "Hide filters" : "Show filters"}
            aria-expanded={showTopFilters}
          >
            <Filter className="h-[18px] w-[18px] text-accent-foreground" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <PaginationBar />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex min-w-0 max-w-full items-stretch rounded border border-border bg-card shadow-sm">
              <input
                suppressHydrationWarning
                type="search"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search"
                className="min-w-[120px] max-w-[200px] flex-1 border-0 bg-transparent px-3 py-2 text-[13px] text-foreground outline-none sm:max-w-[260px]"
              />
              <button suppressHydrationWarning type="button" className={cn("flex shrink-0 items-center justify-center px-3 py-2", PRIMARY)} aria-label="Search">
                <Search className="h-4 w-4" />
              </button>
            </div>
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setTableSearch("")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-border bg-muted text-muted-foreground hover:bg-muted/80"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative min-w-[4.5rem]">
              <select
                suppressHydrationWarning
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className={cn("w-full appearance-none rounded py-2 pl-2 pr-8 text-[13px] text-foreground shadow-sm outline-none", controlBorder)}
              >
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px] border-collapse text-sm">
            <thead className="bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="border-b border-border px-3 py-3 whitespace-nowrap">Sr. No.</th>
                <th className="border-b border-border px-3 py-3 whitespace-nowrap">Date</th>
                <th className="border-b border-border px-3 py-3 whitespace-nowrap">Details</th>
                <th className="border-b border-border px-3 py-3 whitespace-nowrap">Pre Sales Agent</th>
                <th className="border-b border-border px-3 py-3 whitespace-nowrap">Sales Agent</th>
                <th className="border-b border-border px-3 py-3 whitespace-nowrap">Co-owners</th>
                <th className="border-b border-border px-3 py-3 whitespace-nowrap">Sourcing Manager</th>
                <th className="border-b border-border px-3 py-3 whitespace-nowrap">Channel Partner</th>
                <th className="border-b border-border px-3 py-3 whitespace-nowrap">Project</th>
                <th className="border-b border-border px-3 py-3 whitespace-nowrap">Stage</th>
                <th className="border-b border-border px-3 py-3 whitespace-nowrap">Source</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={11} className="py-16 text-center text-sm font-medium text-muted-foreground">
                  No Data Found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border-t border-border px-4 py-3">
          <PaginationBar />
        </div>
      </Panel>
    </PageShell>
  );
}
