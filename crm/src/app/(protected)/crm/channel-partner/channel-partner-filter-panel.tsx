"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const PRIMARY = "bg-[#1a56db] hover:bg-blue-700";

const DATE_TYPE_OPTIONS = ["CP Created", "CP Assigned", "Last Activity"] as const;

const DATE_RANGE_OPTIONS = ["Today", "Yesterday", "This Week", "This Month", "Last Month", "Custom Range"] as const;

const MOCK_COMPANIES = ["Balaji Realty", "Silver Estates", "Prime Developers", "Urban Nest Pvt Ltd"];

const COMPANY_CATEGORY_OPTIONS = ["Developer", "Broker", "Consultant", "Aggregator"] as const;

const STAGE_OPTIONS = ["New", "Contacted", "Qualified", "On Hold", "Closed"] as const;

const LOCATION_OPTIONS = ["Mumbai", "Thane", "Navi Mumbai", "Pune"] as const;

const SUB_LOCATION_OPTIONS = ["Andheri", "Borivali", "Vashi", "Kharghar"] as const;

const labelClass = "mb-1.5 block text-[13px] font-bold text-[#1e293b]";
const inputClass =
  "w-full rounded border border-gray-300 bg-white px-3 py-2 pr-9 text-[13px] text-gray-800 shadow-sm outline-none transition-colors focus:border-[#1a56db]";
const dateInputClass =
  "min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-[13px] text-gray-800 outline-none";

type FilterForm = {
  dateType: string;
  dateRange: string;
  fromDate: string;
  toDate: string;
  cpCompany: string;
  cpCompanyCategory: string;
  stage: string;
  location: string;
  subLocation: string;
};

const initialForm: FilterForm = {
  dateType: "CP Created",
  dateRange: "",
  fromDate: "",
  toDate: "",
  cpCompany: "",
  cpCompanyCategory: "",
  stage: "",
  location: "",
  subLocation: "",
};

function DateRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col">
      <label className={labelClass}>{label}</label>
      <div className="flex overflow-hidden rounded border border-gray-300 shadow-sm">
        <input
          suppressHydrationWarning
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(dateInputClass, !value && "text-gray-400")}
        />
        <button
          suppressHydrationWarning
          type="button"
          className="border-l border-gray-300 bg-gray-50 px-3 text-gray-600 hover:bg-gray-100"
          aria-label="Calendar"
          tabIndex={-1}
        >
          <CalendarDays className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ChannelPartnerFilterPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mainEl, setMainEl] = useState<HTMLElement | null>(null);
  const [form, setForm] = useState<FilterForm>(initialForm);

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
    if (!open) setForm(initialForm);
  }, [open]);

  const update = useCallback(<K extends keyof FilterForm>(key: K, value: FilterForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const handleClear = useCallback(() => {
    setForm(initialForm);
  }, []);

  const handleApply = useCallback(() => {
    // Filters apply to the table when wired to data; panel stays open for further edits.
  }, []);

  const ActionButtons = ({ className }: { className?: string }) => (
    <div className={cn("flex shrink-0 items-center gap-2", className)}>
      <button
        suppressHydrationWarning
        type="button"
        onClick={handleApply}
        className={cn("rounded px-4 py-2 text-sm font-medium text-white shadow-sm", PRIMARY)}
      >
        Apply
      </button>
      <button
        suppressHydrationWarning
        type="button"
        onClick={handleClear}
        className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
      >
        Clear
      </button>
    </div>
  );

  if (!open || !mainEl) return null;

  return createPortal(
    <div className="absolute inset-0 z-[95] flex justify-end" role="presentation">
      <button
        suppressHydrationWarning
        type="button"
        aria-label="Close filters"
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside
        className="relative flex h-full w-full max-w-[400px] flex-col border-l border-gray-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cp-filter-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
          <h2 id="cp-filter-title" className="text-base font-semibold text-[#1e293b]">
            Filter
          </h2>
          <ActionButtons />
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-1">
            <span className={labelClass}>Date Type</span>
            <div className="relative">
              <select
                suppressHydrationWarning
                value={form.dateType}
                onChange={(e) => update("dateType", e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                {DATE_TYPE_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className={labelClass}>Date Range</span>
            <div className="relative">
              <select
                suppressHydrationWarning
                value={form.dateRange}
                onChange={(e) => update("dateRange", e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                <option value="">Select Date Range</option>
                {DATE_RANGE_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <DateRow label="From Date" value={form.fromDate} onChange={(v) => update("fromDate", v)} />
          <DateRow label="To Date" value={form.toDate} onChange={(v) => update("toDate", v)} />

          <div className="flex flex-col gap-1">
            <span className={labelClass}>CP Company</span>
            <div className="relative">
              <select
                suppressHydrationWarning
                value={form.cpCompany}
                onChange={(e) => update("cpCompany", e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                <option value="">Search & Select Company Name</option>
                {MOCK_COMPANIES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className={labelClass}>CP Company Category</span>
            <div className="relative">
              <select
                suppressHydrationWarning
                value={form.cpCompanyCategory}
                onChange={(e) => update("cpCompanyCategory", e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                <option value="">Select Company Category</option>
                {COMPANY_CATEGORY_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className={labelClass}>Stage</span>
            <div className="relative">
              <select
                suppressHydrationWarning
                value={form.stage}
                onChange={(e) => update("stage", e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                <option value="">Select Stage</option>
                {STAGE_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className={labelClass}>Location</span>
            <div className="relative">
              <select
                suppressHydrationWarning
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                <option value="">Select Location</option>
                {LOCATION_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className={labelClass}>Sub Locations</span>
            <div className="relative">
              <select
                suppressHydrationWarning
                value={form.subLocation}
                onChange={(e) => update("subLocation", e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                <option value="">Select Sub Location</option>
                {SUB_LOCATION_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-gray-200 px-4 py-3">
          <ActionButtons />
        </div>
      </aside>
    </div>,
    mainEl,
  );
}
