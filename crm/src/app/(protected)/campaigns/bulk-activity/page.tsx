"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, Search, X } from "lucide-react";

import { PageShell, Panel } from "@/components/crm/page-shell";
import { cn } from "@/lib/utils";

const PRIMARY = "bg-primary text-primary-foreground hover:opacity-90";

const BULK_COUNT = 0;

const TYPE_OPTIONS = [
  { value: "", label: "Select Type" },
  { value: "SMS", label: "SMS" },
  { value: "WHATSAPP", label: "WHATSAPP" },
  { value: "EMAIL", label: "EMAIL" },
] as const;

const NEW_ACTIVITY_ITEMS = [
  { id: "sms", label: "Add SMS Activity" },
  { id: "email", label: "Add Email Activity" },
  { id: "whatsapp", label: "Add WhatsApp Activity" },
] as const;

const TABLE_COLUMNS = ["#", "Activity Name & Remark", "Bulk Type", "Created Date", "Executed Date", "Action"] as const;

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

export default function BulkActivityPage() {
  const [tableSearch, setTableSearch] = useState("");
  const [pageSize, setPageSize] = useState("20");
  const [bulkType, setBulkType] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  function pickNewActivity(kind: string) {
    setMenuOpen(false);
    void kind;
  }

  return (
    <PageShell>
      <Link href="/campaigns" className="mb-4 inline-block text-sm font-medium text-primary hover:underline">
        ← Campaign
      </Link>

      <Panel>
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Bulk Activity (<span className="tabular-nums">{BULK_COUNT}</span>)
          </h2>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <div className="relative min-w-[160px]">
              <label htmlFor="bulk-type" className="sr-only">
                Select Type
              </label>
              <select
                id="bulk-type"
                value={bulkType}
                onChange={(e) => setBulkType(e.target.value)}
                className={cn("w-full appearance-none rounded-md py-2 pl-3 pr-9 text-[13px] text-foreground shadow-sm outline-none", controlBorder)}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value || "all"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className={cn(
                  "inline-flex min-h-[2.25rem] select-none overflow-hidden rounded-md text-sm font-medium text-primary-foreground shadow-sm",
                  PRIMARY,
                )}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-primary/85" aria-hidden>
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <span className="flex items-center gap-1.5 px-3 py-2">
                  New Activity
                  <ChevronDown className={cn("h-4 w-4 opacity-90 transition-transform", menuOpen && "rotate-180")} />
                </span>
              </button>
              {menuOpen ? (
                <ul role="menu" className="absolute right-0 z-20 mt-1 min-w-[14rem] rounded-md border border-border bg-card py-1 shadow-lg">
                  {NEW_ACTIVITY_ITEMS.map((item) => (
                    <li key={item.id} role="none">
                      <button
                        type="button"
                        role="menuitem"
                        className="block w-full px-4 py-2.5 text-left text-[13px] text-foreground hover:bg-primary/5"
                        onClick={() => pickNewActivity(item.id)}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
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
                placeholder="Search"
                className="min-w-[120px] max-w-[200px] flex-1 border-0 bg-transparent px-3 py-2 text-[13px] text-foreground outline-none sm:max-w-[260px]"
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
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead className="bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                {TABLE_COLUMNS.map((col) => (
                  <th key={col} className={cn("border-b border-border px-3 py-3 whitespace-nowrap", col === "#" && "w-12")}>
                    {col === "#" ? "#" : col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={TABLE_COLUMNS.length} className="py-16 text-center text-sm font-medium text-muted-foreground">
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
