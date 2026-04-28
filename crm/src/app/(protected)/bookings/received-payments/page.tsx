"use client";

import { useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

import { PageShell, PageTitle, Panel } from "@/components/crm/page-shell";
import { cn } from "@/lib/utils";

const PRIMARY = "bg-primary text-primary-foreground hover:opacity-90";

const PAYMENTS_COUNT = 0;

const PAYMENT_COLUMNS = [
  "Sr. No.",
  "Type",
  "Payment For",
  "Date",
  "Customer Name",
  "Ledger A/C",
  "Payment Type",
  "Bank Name / Chq. No. / In Fav.",
  "Net Amount",
  "TDS",
  "Tax Amount",
  "Total Amount",
  "Final Amount",
  "Action",
] as const;

const controlBorder = "border border-border bg-card focus:border-primary";

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

export default function ReceivedPaymentsPage() {
  const [tableSearch, setTableSearch] = useState("");
  const [pageSize, setPageSize] = useState("50");

  return (
    <PageShell>
      <PageTitle>Received Payments</PageTitle>

      <Panel>
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold text-foreground">Payments ({PAYMENTS_COUNT})</h2>
        </div>

        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <PaginationBar />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex min-w-0 max-w-full items-stretch rounded border border-border bg-card shadow-sm">
              <input
                type="search"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search Payments"
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
          <table className="w-full min-w-[1650px] border-collapse text-sm">
            <thead className="bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                {PAYMENT_COLUMNS.map((col) => (
                  <th key={col} className="border-b border-border px-3 py-3 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={PAYMENT_COLUMNS.length} className="py-16 text-center text-sm font-medium text-muted-foreground">
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
