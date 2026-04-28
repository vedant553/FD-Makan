"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { ChevronDown, Share2, X } from "lucide-react";

import { cn } from "@/lib/utils";

import type { PropertyInfoRow } from "./property-information-modal";

const PRIMARY = "rounded-md bg-[#1a56db] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700";
const CLEAR_BTN = "rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50";

const labelClass = "mb-1.5 block text-[13px] font-bold text-gray-700";
const selectClass =
  "w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2 pr-9 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]";

const AVAILABILITY_TYPES = ["Sale", "Rent", "Lease", "Both"] as const;
const PROPERTY_TYPES = ["Residential", "Commercial", "Plot", "Industrial"] as const;
const PROJECTS = ["Godrej City", "Balaji Symphony", "Silver Heights", "House Demo"] as const;
const STAGES = ["New", "Active", "Negotiation", "Closed"] as const;
const LOCATIONS = ["Mumbai", "Thane", "Navi Mumbai", "Panvel", "Vashi"] as const;
const SUB_LOCS = ["Panvel", "Vashi", "Andheri", "Kharghar"] as const;
const BUDGET_MIN = ["₹10 Lac", "₹25 Lac", "₹50 Lac", "₹1 Cr"] as const;
const BUDGET_MAX = ["₹50 Lac", "₹1 Cr", "₹2 Cr", "₹5 Cr"] as const;
const MIN_AREA = ["500", "750", "1000", "1500"] as const;
const MAX_AREA = ["1500", "2000", "3000", "5000"] as const;
const AREA_METRICS = ["Sq. Ft", "Sq. M"] as const;
const FURNISH = ["Unfurnished", "Semi-Furnished", "Furnished"] as const;
const SALES_AGENTS = ["Aman Dubey", "Ajay Jaiswal", "Priya Jagtap"] as const;
const YESNO = ["Yes", "No"] as const;
const ORDER_BY = ["Created Date", "Updated Date", "Price", "Area"] as const;

const MAP_EMBED =
  "https://www.openstreetmap.org/export/embed.html?bbox=72.96%2C19.05%2C73.25%2C19.28&layer=mapnik";

const CARD_IMG = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=640&q=80";

function Select({
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: readonly string[];
}) {
  return (
    <div className="flex flex-col">
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <select suppressHydrationWarning value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; id: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className={labelClass}>{label}</span>
      <button
        suppressHydrationWarning
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 rounded-full border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:ring-offset-1",
          checked ? "bg-[#1a56db]" : "bg-gray-300",
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-6 w-6 translate-y-px rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-[1.35rem]" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

function formatContact(m: string) {
  const d = m.replace(/\s/g, "");
  if (d.startsWith("+91")) return d.replace("+91", "91-");
  return d;
}

function MapPropertyCard({ row }: { row: PropertyInfoRow }) {
  const isSale = row.sr === 1;
  const carpet = isSale ? "493 Sq. Ft" : "1500 Sq. Ft";
  const superBuilt = isSale ? "750 Sq. Ft" : "0 Sq. Ft";
  const built = isSale ? "750 Sq. Ft" : "0 Sq. Ft";
  const furnish = isSale ? "UNFURNISHED" : "—";
  const unitLabel = isSale ? "2BHK" : "—";

  return (
    <article className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
      <div className="aspect-[16/10] w-full overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CARD_IMG} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-bold leading-snug text-gray-900">{row.details}</h3>
          <button suppressHydrationWarning type="button" className="shrink-0 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-[#1a56db]" aria-label="Share">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[13px] font-medium text-gray-700">{row.ownerName}</p>
        <dl className="space-y-2 border-t border-gray-100 pt-3 text-[13px]">
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-gray-500">Property Name:</dt>
            <dd className="text-gray-800">{row.projectDetails !== "—" ? row.projectDetails : "—"}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-gray-500">Contact:</dt>
            <dd className="text-gray-800">{formatContact(row.ownerMobile)}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-gray-500">Property Type:</dt>
            <dd className="text-gray-800">{row.inventoryType || "—"}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-gray-500">Unit:</dt>
            <dd className="text-gray-800">{unitLabel}</dd>
            <span className="mx-1 text-gray-300">|</span>
            <dt className="font-medium text-gray-500">Carpet Area:</dt>
            <dd className="text-gray-800">{carpet}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-gray-500">Super Buildup Area:</dt>
            <dd className="text-gray-800">{superBuilt}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-gray-500">Buildup Area:</dt>
            <dd className="text-gray-800">{built}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-gray-500">Available From:</dt>
            <dd className="text-gray-800">{row.availableFrom}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-gray-500">Expectation:</dt>
            <dd className="font-semibold text-gray-900">{row.expectation}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-gray-500">Furnish Type:</dt>
            <dd className="text-gray-800">{furnish}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

type FilterForm = {
  availableFor: string;
  propertyType: string;
  project: string;
  stages: string;
  location: string;
  subLocation: string;
  minBudget: string;
  maxBudget: string;
  minArea: string;
  maxArea: string;
  areaMetric: string;
  furnishStatus: string;
  salesAgent: string;
  isFeatured: string;
  isPublish: string;
  orderBy: string;
  sortAscending: boolean;
};

const emptyFilters: FilterForm = {
  availableFor: "",
  propertyType: "",
  project: "",
  stages: "",
  location: "",
  subLocation: "",
  minBudget: "",
  maxBudget: "",
  minArea: "",
  maxArea: "",
  areaMetric: "",
  furnishStatus: "",
  salesAgent: "",
  isFeatured: "",
  isPublish: "",
  orderBy: "Created Date",
  sortAscending: false,
};

export function PropertyMapModal({
  open,
  onClose,
  rows,
}: {
  open: boolean;
  onClose: () => void;
  rows: PropertyInfoRow[];
}) {
  const [mainEl, setMainEl] = useState<HTMLElement | null>(null);
  const [filters, setFilters] = useState<FilterForm>(emptyFilters);

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
    if (!open) setFilters(emptyFilters);
  }, [open]);

  const patch = useCallback(<K extends keyof FilterForm>(key: K, value: FilterForm[K]) => {
    setFilters((f) => ({ ...f, [key]: value }));
  }, []);

  const handleClear = useCallback(() => setFilters(emptyFilters), []);

  if (!open || !mainEl) return null;

  return createPortal(
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 p-2 backdrop-blur-[2px] md:p-4" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="map-modal-title"
        className="flex max-h-[min(96vh,920px)] w-full max-w-[1600px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3 md:px-5">
          <h2 id="map-modal-title" className="text-lg font-semibold text-gray-900">
            View Inventories in Map
          </h2>
          <button suppressHydrationWarning type="button" onClick={onClose} className="rounded border border-gray-400 p-1 text-gray-600 hover:bg-gray-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* Map */}
          <div className="relative flex min-h-[260px] shrink-0 flex-col border-b border-gray-200 lg:min-h-0 lg:w-[38%] lg:border-b-0 lg:border-r">
            <div className="relative min-h-[260px] flex-1 lg:min-h-[min(520px,58vh)]">
              <iframe
                title="Property map"
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={MAP_EMBED}
              />
              <div className="pointer-events-none absolute left-[46%] top-[38%] z-10 flex flex-col items-center lg:left-[44%] lg:top-[40%]">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#1a56db] shadow-lg">
                  <span className="text-[10px] font-bold text-white">⌂</span>
                </div>
                <span className="mt-1 rounded bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-gray-800 shadow">2BHK</span>
              </div>
            </div>
            <p className="shrink-0 border-t border-gray-200 bg-gray-50 px-2 py-1 text-center text-[10px] text-gray-500">OpenStreetMap preview</p>
          </div>

          {/* Property cards */}
          <div className="min-h-0 flex-1 overflow-y-auto border-b border-gray-200 bg-[#f8fafc] p-3 md:p-4 lg:w-[34%] lg:border-b-0 lg:border-r">
            <div className="mx-auto flex max-w-lg flex-col gap-4">
              {rows.map((row) => (
                <MapPropertyCard key={row.sr} row={row} />
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex max-h-[min(42vh,360px)] min-h-0 flex-col overflow-hidden border-t border-gray-200 lg:max-h-none lg:w-[28%] lg:border-l lg:border-t-0">
            <div className="min-h-0 flex-1 overflow-y-auto p-3 md:p-4">
              <div className="space-y-3">
                <Select label="Available for" value={filters.availableFor} onChange={(v) => patch("availableFor", v)} placeholder="Select Availability Type" options={AVAILABILITY_TYPES} />
                <Select label="Type of Property" value={filters.propertyType} onChange={(v) => patch("propertyType", v)} placeholder="Select Property Type" options={PROPERTY_TYPES} />
                <Select label="Project" value={filters.project} onChange={(v) => patch("project", v)} placeholder="Select Project Name" options={PROJECTS} />
                <Select label="Stages" value={filters.stages} onChange={(v) => patch("stages", v)} placeholder="Select Stage" options={STAGES} />
                <Select label="Location" value={filters.location} onChange={(v) => patch("location", v)} placeholder="Select Location" options={LOCATIONS} />
                <Select label="Sub Location" value={filters.subLocation} onChange={(v) => patch("subLocation", v)} placeholder="Select Sub Location" options={SUB_LOCS} />
                <Select label="Min Budget" value={filters.minBudget} onChange={(v) => patch("minBudget", v)} placeholder="Select Min Budget" options={BUDGET_MIN} />
                <Select label="Max Budget" value={filters.maxBudget} onChange={(v) => patch("maxBudget", v)} placeholder="Select Max Budget" options={BUDGET_MAX} />
                <Select label="Min Area" value={filters.minArea} onChange={(v) => patch("minArea", v)} placeholder="Select Minimum Area" options={MIN_AREA} />
                <Select label="Max Area" value={filters.maxArea} onChange={(v) => patch("maxArea", v)} placeholder="Select Maximum Area" options={MAX_AREA} />
                <Select label="Area Metric" value={filters.areaMetric} onChange={(v) => patch("areaMetric", v)} placeholder="Select Area Metric" options={AREA_METRICS} />
                <Select label="Furnish Status" value={filters.furnishStatus} onChange={(v) => patch("furnishStatus", v)} placeholder="Select Furnish Status" options={FURNISH} />
                <Select label="Sales Agent" value={filters.salesAgent} onChange={(v) => patch("salesAgent", v)} placeholder="Select Sales Agent" options={SALES_AGENTS} />
                <Select label="Is Featured" value={filters.isFeatured} onChange={(v) => patch("isFeatured", v)} placeholder="Select Status" options={YESNO} />
                <Select label="Is Publish" value={filters.isPublish} onChange={(v) => patch("isPublish", v)} placeholder="Select Status" options={YESNO} />
                <Select label="Order By" value={filters.orderBy} onChange={(v) => patch("orderBy", v)} placeholder="Order By" options={ORDER_BY} />
                <Toggle id="map-sort-asc" label="Sort Ascending" checked={filters.sortAscending} onChange={(v) => patch("sortAscending", v)} />
              </div>
            </div>
            <div className="flex shrink-0 justify-end gap-2 border-t border-gray-200 bg-white p-3">
              <button suppressHydrationWarning type="button" onClick={() => {}} className={PRIMARY}>
                Apply
              </button>
              <button suppressHydrationWarning type="button" onClick={handleClear} className={CLEAR_BTN}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    mainEl,
  );
}
