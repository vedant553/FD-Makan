"use client";

import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useState } from "react";
import { Bell, ChevronDown, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

import type { PropertyInfoRow } from "./property-information-modal";

const SUGGESTED_LEADS_COLUMNS = [
  "#",
  "LEAD DATE",
  "LEAD DETAILS",
  "LEAD STAGE",
  "SOURCE",
  "PROJECT",
  "SALES AGENT",
  "REQUIREMENT",
  "BUDGET",
  "REMARK",
] as const;

const FILTER_TAGS = ["Location", "Budget", "Unit", "Sub Type"] as const;

/** Replace with API total when wired. */
const LEAD_TOTAL = 0;

export function PropertySuggestedLeadsModal({
  open,
  onClose,
  row,
}: {
  open: boolean;
  onClose: () => void;
  row: PropertyInfoRow | null;
}) {
  const [mainEl, setMainEl] = useState<HTMLElement | null>(null);
  const [leadSearch, setLeadSearch] = useState("");
  const [leadPageSize, setLeadPageSize] = useState("50");

  useLayoutEffect(() => {
    setMainEl(document.getElementById("app-main"));
  }, []);

  useEffect(() => {
    if (!open) return;
    const main = document.getElementById("app-main");
    if (!main) return;
    const prev = main.style.overflow;
    main.style.overflow = "hidden";
    return () => {
      main.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setLeadSearch("");
    setLeadPageSize("50");
  }, [open, row?.propertyId]);

  if (!open || !mainEl || !row) return null;

  return createPortal(
    <div className="absolute inset-0 z-[100] flex min-h-0 flex-col bg-[#f4f7f6]">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 md:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="suggested-leads-title"
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm"
        >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 id="suggested-leads-title" className="text-lg font-semibold text-gray-900">
              Suggested Leads
            </h2>
            <p className="mt-0.5 text-[13px] text-gray-500">
              {row.propertyId}
              {row.details ? ` · ${row.details}` : null}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              suppressHydrationWarning
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded bg-[#f97316] text-white shadow-sm hover:bg-orange-600"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
            <button
              suppressHydrationWarning
              type="button"
              onClick={onClose}
              className="rounded border border-gray-300 p-1.5 text-gray-600 hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#f4f7f6] p-4 md:p-5">
          <div className="mx-auto max-w-6xl rounded-md border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-[15px] font-semibold text-gray-900">
                Suggested Leads ({LEAD_TOTAL})
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-[13px]">
                <span className="font-medium text-gray-700">Filter By</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {FILTER_TAGS.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded border border-gray-300 bg-gray-50 px-2 py-0.5 text-xs text-gray-700"
                    >
                      {tag} <span className="text-gray-400">×</span>
                    </span>
                  ))}
                  <button
                    suppressHydrationWarning
                    type="button"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                    aria-label="More filters"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-3 flex flex-col gap-2 border-b border-gray-100 pb-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  suppressHydrationWarning
                  type="button"
                  className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-40"
                  disabled
                >
                  Previous
                </button>
                <button
                  suppressHydrationWarning
                  type="button"
                  className="min-w-[2rem] rounded bg-[#1a56db] px-2 py-1 text-sm font-medium text-white"
                >
                  1
                </button>
                <button
                  suppressHydrationWarning
                  type="button"
                  className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-40"
                  disabled
                >
                  Next
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex min-w-0 max-w-full items-stretch rounded border border-gray-300 bg-white shadow-sm">
                  <input
                    suppressHydrationWarning
                    type="search"
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    placeholder="Search"
                    className="min-w-[100px] max-w-[200px] flex-1 border-0 bg-transparent px-3 py-1.5 text-[13px] outline-none"
                  />
                  <button
                    suppressHydrationWarning
                    type="button"
                    className={cn("flex shrink-0 items-center justify-center px-3 py-1.5 text-white", "bg-[#1a56db] hover:bg-blue-700")}
                    aria-label="Search leads"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setLeadSearch("")}
                  className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="relative">
                  <select
                    suppressHydrationWarning
                    value={leadPageSize}
                    onChange={(e) => setLeadPageSize(e.target.value)}
                    className="appearance-none rounded border border-gray-300 bg-white py-1.5 pl-2 pr-8 text-[13px] text-gray-700"
                  >
                    <option value="50">50</option>
                    <option value="20">20</option>
                    <option value="100">100</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded border border-gray-200">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead className="bg-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-700">
                  <tr>
                    <th className="w-10 border-b border-gray-200 px-2 py-2.5">
                      <input suppressHydrationWarning type="checkbox" className="rounded border-gray-300" aria-label="Select all leads" />
                    </th>
                    {SUGGESTED_LEADS_COLUMNS.map((col) => (
                      <th key={col} className="border-b border-gray-200 px-3 py-2.5 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={11} className="px-4 py-10 text-center text-[13px] text-gray-600">
                      No Data Found
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
              <button suppressHydrationWarning type="button" className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-40" disabled>
                Previous
              </button>
              <button
                suppressHydrationWarning
                type="button"
                className="min-w-[2rem] rounded bg-[#1a56db] px-2 py-1 text-sm font-medium text-white"
              >
                1
              </button>
              <button suppressHydrationWarning type="button" className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-40" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>,
    mainEl,
  );
}
