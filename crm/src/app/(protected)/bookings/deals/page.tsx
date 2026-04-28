"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar, ChevronDown, Filter, Plus, Search, X } from "lucide-react";

import { PageShell, PageTitle, Panel } from "@/components/crm/page-shell";
import { cn } from "@/lib/utils";

const PRIMARY = "bg-primary text-primary-foreground hover:opacity-90";
const ACCENT = "bg-accent text-accent-foreground hover:opacity-90";
const CLEAR_OUTLINE = "border border-primary bg-card text-primary hover:bg-primary/5";

const BOOKINGS_COUNT = 0;

const DEAL_TABLE_COLUMNS = [
  "Sr. No.",
  "Date",
  "Form No.",
  "Deal Type",
  "Customer",
  "Project",
  "Deal Value",
  "Brokerage",
  "Pre Sales Agent",
  "Executive",
  "Exec. Incentive",
  "Channel Partner",
  "Channel Partner Company",
  "Sourcing Agent",
  "Source",
  "Saleable Area",
  "Terms",
  "Approved Status",
  "Status Date",
  "Remark",
  "Created Date",
  "Action",
] as const;

const controlBorder = "border border-border bg-card focus:border-primary";

function FilterSelect({
  id,
  label,
  placeholder,
  defaultValue,
  options,
}: {
  id: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
  options?: { value: string; label: string }[];
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
          {options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}

function PaginationBar() {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <button type="button" className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40" disabled>
        Previous
      </button>
      <button type="button" className="min-w-[2rem] rounded bg-primary px-2 py-1 text-sm font-medium text-primary-foreground">
        1
      </button>
      <button type="button" className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40" disabled>
        Next
      </button>
    </div>
  );
}

export default function DealsPage() {
  const [tableSearch, setTableSearch] = useState("");
  const [pageSize, setPageSize] = useState("50");
  const [showTopFilters, setShowTopFilters] = useState(true);
  const [fromDate, setFromDate] = useState("2026-04-01");
  const [toDate, setToDate] = useState("2026-04-30");

  return (
    <PageShell>
      <PageTitle>Deals</PageTitle>

      {showTopFilters ? (
        <Panel className="mb-4 p-4 md:p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FilterSelect id="dl-bookings" label="Bookings" placeholder="Select" defaultValue="All Bookings" />
            <FilterSelect id="dl-teams" label="Teams" placeholder="Select Team" />
            <FilterSelect id="dl-pre" label="Pre Sales Agent" placeholder="Select Pre Sales Agent" />
            <FilterSelect id="dl-sales" label="Sales Agent" placeholder="Select Sales Agent" />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label htmlFor="dl-channel" className="mb-1 block text-[13px] font-medium text-muted-foreground">
                Channel Partner
              </label>
              <div className="relative">
                <select
                  id="dl-channel"
                  defaultValue=""
                  className={cn("w-full appearance-none rounded-md py-2 pl-3 pr-9 text-[13px] text-foreground shadow-sm outline-none", controlBorder)}
                >
                  <option value="">Search &amp; Select Channel Partner</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <div>
              <label htmlFor="dl-project" className="mb-1 block text-[13px] font-medium text-muted-foreground">
                Project
              </label>
              <div className="relative">
                <select
                  id="dl-project"
                  defaultValue=""
                  className={cn("w-full appearance-none rounded-md py-2 pl-3 pr-9 text-[13px] text-foreground shadow-sm outline-none", controlBorder)}
                >
                  <option value="">Search &amp; Select Project</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <div>
              <label htmlFor="dl-property" className="mb-1 block text-[13px] font-medium text-muted-foreground">
                Property
              </label>
              <div className="relative">
                <select
                  id="dl-property"
                  defaultValue=""
                  className={cn("w-full appearance-none rounded-md py-2 pl-3 pr-9 text-[13px] text-foreground shadow-sm outline-none", controlBorder)}
                >
                  <option value="">Search &amp; Select Property</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <FilterSelect id="dl-time" label="Time Range" placeholder="Select range" defaultValue="Current Month" />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3 xl:items-end">
            <div>
              <label htmlFor="dl-from" className="mb-1 block text-[13px] font-medium text-muted-foreground">
                From Date
              </label>
              <div className="relative">
                <input
                  id="dl-from"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className={cn("w-full rounded-md py-2 pl-3 pr-10 text-[13px] text-foreground shadow-sm outline-none", controlBorder)}
                />
                <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <div>
              <label htmlFor="dl-to" className="mb-1 block text-[13px] font-medium text-muted-foreground">
                To Date
              </label>
              <div className="relative">
                <input
                  id="dl-to"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className={cn("w-full rounded-md py-2 pl-3 pr-10 text-[13px] text-foreground shadow-sm outline-none", controlBorder)}
                />
                <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <FilterSelect id="dl-approval" label="Approval Status" placeholder="Select" defaultValue="All" />
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button type="button" className={cn("rounded-md px-6 py-2 text-sm font-medium shadow-sm", PRIMARY)}>
              Apply
            </button>
            <button type="button" className={cn("rounded-md px-6 py-2 text-sm font-medium shadow-sm", CLEAR_OUTLINE)}>
              Clear
            </button>
          </div>
        </Panel>
      ) : null}

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <Panel>
          <div className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">Sales Overview</div>
          <div className="divide-y divide-border px-4 py-1 text-sm">
            <div className="flex justify-between gap-3 py-3">
              <span className="text-muted-foreground">This Month Sales</span>
              <span className="font-medium text-foreground">₹0.00</span>
            </div>
            <div className="flex justify-between gap-3 py-3">
              <span className="text-muted-foreground">No Of Bookings</span>
              <span className="font-medium text-foreground">0</span>
            </div>
            <div className="flex justify-between gap-3 py-3">
              <span className="text-muted-foreground">Incentive Earned</span>
              <span className="font-medium text-foreground">₹0.00</span>
            </div>
          </div>
        </Panel>
        <Panel className="flex min-h-[180px] flex-col">
          <div className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">Leaders Board</div>
          <div className="flex flex-1 items-center justify-center px-4 py-8 text-sm font-medium text-muted-foreground">No Data Found</div>
        </Panel>
        <Panel className="flex min-h-[180px] flex-col">
          <div className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">Team Wise Booking</div>
          <div className="flex flex-1 items-center justify-center px-4 py-8 text-sm font-medium text-muted-foreground">No Data Found</div>
        </Panel>
      </div>

      <Panel>
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-foreground">Bookings ({BOOKINGS_COUNT})</h2>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Link href="/bookings/deals/add" className={cn("inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium shadow-sm", PRIMARY)}>
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Add Booking
            </Link>
            <button
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
        </div>

        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <PaginationBar />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex min-w-0 max-w-full items-stretch rounded border border-border bg-card shadow-sm">
              <input
                type="search"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search Bookings"
                className="min-w-[140px] max-w-[220px] flex-1 border-0 bg-transparent px-3 py-2 text-[13px] text-foreground outline-none sm:max-w-[280px]"
              />
              <button type="button" className={cn("flex shrink-0 items-center justify-center px-3 py-2", PRIMARY)} aria-label="Search">
                <Search className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setTableSearch("")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-border bg-muted text-muted-foreground hover:bg-muted/80"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative min-w-[4.5rem]">
              <select
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
          <table className="w-full min-w-[2600px] border-collapse text-sm">
            <thead className="bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                {DEAL_TABLE_COLUMNS.map((col) => (
                  <th key={col} className="border-b border-border px-3 py-3 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={DEAL_TABLE_COLUMNS.length} className="py-16 text-center text-sm font-medium text-muted-foreground">
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
