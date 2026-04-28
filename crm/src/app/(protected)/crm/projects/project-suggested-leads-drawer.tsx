"use client";

import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useState } from "react";
import { Bell, ChevronDown, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

const PRIMARY = "bg-[#1a56db] hover:bg-blue-700";

type Props = {
  open: boolean;
  onClose: () => void;
};

const INITIAL_TAGS = ["Location", "Budget", "Unit", "Sub Type"];

export function ProjectSuggestedLeadsDrawer({ open, onClose }: Props) {
  const [mainEl, setMainEl] = useState<HTMLElement | null>(null);
  const [filterTags, setFilterTags] = useState<string[]>(INITIAL_TAGS);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState("50");
  const leadCount = 0;

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
    if (open) {
      setFilterTags(INITIAL_TAGS);
      setSearch("");
      setPageSize("50");
    }
  }, [open]);

  if (!open || !mainEl) return null;

  return createPortal(
    <div className="absolute inset-0 z-[102] flex justify-end">
      <button type="button" className="min-h-0 min-w-0 flex-1 cursor-default bg-black/40" aria-label="Close panel" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="suggested-leads-title"
        className="flex h-full w-full max-w-[min(100vw,56rem)] flex-col border-l border-gray-200 bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 id="suggested-leads-title" className="text-base font-semibold text-gray-900">
            Suggested Leads ({leadCount})
          </h2>
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

        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-2.5">
          <span className="text-sm font-medium text-gray-700">Filter By</span>
          <div className="flex min-h-[2.25rem] flex-1 flex-wrap items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1">
            {filterTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-gray-800"
              >
                {tag}
                <button
                  suppressHydrationWarning
                  type="button"
                  className="rounded p-0.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  aria-label={`Remove ${tag} filter`}
                  onClick={() => setFilterTags((t) => t.filter((x) => x !== tag))}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <button
            suppressHydrationWarning
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#f97316] text-white shadow-sm hover:bg-orange-600"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-stretch rounded border border-gray-300 bg-white shadow-sm">
            <input
              suppressHydrationWarning
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm text-gray-900 outline-none"
            />
            <button suppressHydrationWarning type="button" className={cn("flex shrink-0 items-center justify-center px-3 text-white", PRIMARY)} aria-label="Search">
              <Search className="h-4 w-4" />
            </button>
          </div>
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setSearch("")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="relative min-w-[4.5rem]">
            <select
              suppressHydrationWarning
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value)}
              className="w-full appearance-none rounded border border-gray-300 bg-white py-2 pl-2 pr-8 text-sm text-gray-800 shadow-sm outline-none"
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="w-full min-w-[1000px] border-collapse text-sm">
              <thead className="bg-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                <tr>
                  <th className="border-b border-gray-200 px-2 py-2">
                    <input suppressHydrationWarning type="checkbox" className="rounded border-gray-300" aria-label="Select all" />
                  </th>
                  <th className="border-b border-gray-200 px-2 py-2 whitespace-nowrap">#</th>
                  <th className="border-b border-gray-200 px-2 py-2 whitespace-nowrap">Lead Date</th>
                  <th className="border-b border-gray-200 px-2 py-2 whitespace-nowrap">Lead Details</th>
                  <th className="border-b border-gray-200 px-2 py-2 whitespace-nowrap">Lead Stage</th>
                  <th className="border-b border-gray-200 px-2 py-2 whitespace-nowrap">Source</th>
                  <th className="border-b border-gray-200 px-2 py-2 whitespace-nowrap">Project</th>
                  <th className="border-b border-gray-200 px-2 py-2 whitespace-nowrap">Sales Agent</th>
                  <th className="border-b border-gray-200 px-2 py-2 whitespace-nowrap">Requirement</th>
                  <th className="border-b border-gray-200 px-2 py-2 whitespace-nowrap">Budget</th>
                  <th className="border-b border-gray-200 px-2 py-2 whitespace-nowrap">Remark</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={11} className="py-16 text-center text-sm font-medium text-gray-500">
                    No Data Found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </aside>
    </div>,
    mainEl,
  );
}
