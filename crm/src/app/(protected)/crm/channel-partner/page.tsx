"use client";

import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpDown,
  Building2,
  ChevronDown,
  Download,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Upload,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  ChannelPartnerKebabModals,
  type ChannelPartnerKebabModal,
} from "./channel-partner-modals";
import { ExportChannelPartnerModal } from "./export-channel-partner-modal";
import { ChannelPartnerFilterPanel } from "./channel-partner-filter-panel";

const PRIMARY = "bg-[#1a56db] hover:bg-blue-700";
const ORANGE = "bg-[#f97316] hover:bg-orange-600";

const TEAM_OPTS = ["North", "South", "East", "West"];
const SOURCING_MANAGER_OPTS = ["Aman Dubey", "Ajay Jaiswal", "Priya Jagtap", "Supriya Jadhav"];

/** Matches CRM Channel Partner “Select Advance Filter” reference (4 options). */
const ADVANCED_FILTER_OPTIONS = ["Untouched", "No Reminder", "Overdue", "Unassigned"] as const;

const CHANNEL_PARTNER_KEBAB_ACTIONS: {
  id: string;
  label: string;
  Icon: LucideIcon;
}[] = [
  { id: "addChannelPartner", label: "Add Channel Partner", Icon: Plus },
  { id: "addChannelPartnerCompany", label: "Add Channel Partner Company", Icon: Plus },
  { id: "bulkUpload", label: "Bulk Upload", Icon: Upload },
  { id: "tableDownload", label: "Table Download", Icon: Download },
  { id: "bulkDownload", label: "Bulk Download", Icon: Download },
  { id: "bulkDownloadUpdate", label: "Bulk Download for Update", Icon: Download },
];

const COLUMN_PRESETS = ["Default", "All columns", "Minimal"] as const;

const CP_TABLE_HEADERS = [
  "SR. NO.",
  "CP ID",
  "DATE",
  "ASSIGNED DATE",
  "CONTACT PERSON",
  "MOBILE",
  "EMAIL",
  "STAGE",
  "SOURCING MANAGER",
  "COMPANY",
  "COMPANY CATEGORY",
  "RERA NUMBERS",
  "LAST ACTIVITY DATE",
  "LAST ACTIVITY REMARK",
  "ACTION",
] as const;

const KPI_CARDS = [
  {
    title: "Leads",
    value: "0",
    note: "Lead claimed but not contacted",
  },
  {
    title: "Untouched Channel Partner",
    value: "0",
    note: "Channel Partner claimed but not contacted",
  },
  {
    title: "No Followups Channel Partner",
    value: "0",
    note: "Contacted but no future followups",
  },
  {
    title: "Overdue Task Channel Partner",
    value: "0",
    note: "Channel Partner with overdue followups",
  },
] as const;

function FilterSelect({
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
    <div className="flex min-w-[160px] flex-1 flex-col gap-1.5">
      <span className="text-[13px] font-bold text-gray-700">{label}</span>
      <div className="relative">
        <select
          suppressHydrationWarning
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2 pr-9 text-[13px] text-gray-700 shadow-sm outline-none focus:border-[#1a56db]"
        >
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

function KpiCard({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="relative flex flex-col rounded-md border border-gray-200 bg-white py-3 pl-4 pr-3 shadow-sm">
      <div className="absolute bottom-0 left-0 top-0 w-1.5 rounded-l bg-[#1a56db]" aria-hidden />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="mb-1.5 text-[15px] font-medium text-gray-600">{title}</p>
          <p className="text-xl font-semibold text-gray-700">{value}</p>
          <p className="mt-1 text-xs leading-snug text-gray-500">{note}</p>
        </div>
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e5efff] text-blue-500 shadow-sm">
          <Building2 className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function PaginationBar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        suppressHydrationWarning
        type="button"
        className="text-sm font-medium text-gray-500 hover:text-gray-800 disabled:opacity-40"
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
        className="text-sm font-medium text-gray-500 hover:text-gray-800 disabled:opacity-40"
        disabled
      >
        Next
      </button>
    </div>
  );
}

function TableToolbar({
  search,
  setSearch,
  pageSize,
  setPageSize,
  columnPreset,
  setColumnPreset,
}: {
  search: string;
  setSearch: (v: string) => void;
  pageSize: string;
  setPageSize: (v: string) => void;
  columnPreset: string;
  setColumnPreset: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <PaginationBar />
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="relative min-w-[140px]">
          <select
            suppressHydrationWarning
            value={columnPreset}
            onChange={(e) => setColumnPreset(e.target.value)}
            className="w-full appearance-none rounded border border-gray-300 bg-white py-2 pl-3 pr-9 text-[13px] text-gray-700 shadow-sm outline-none focus:border-[#1a56db]"
          >
            <option value="">Select Columns</option>
            {COLUMN_PRESETS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
        <button
          suppressHydrationWarning
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[#1a56db] bg-white text-[#1a56db] hover:bg-blue-50"
          aria-label="Column order"
        >
          <ArrowUpDown className="h-4 w-4" />
        </button>
        <div className="flex min-w-0 max-w-full items-stretch rounded border border-gray-300 bg-white shadow-sm">
          <input
            suppressHydrationWarning
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="min-w-[120px] max-w-[200px] flex-1 border-0 bg-transparent px-3 py-2 text-[13px] text-gray-800 outline-none sm:max-w-[240px]"
          />
          <button
            suppressHydrationWarning
            type="button"
            className={cn("flex shrink-0 items-center justify-center px-3 py-2 text-white", PRIMARY)}
            aria-label="Search"
          >
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
            className="w-full appearance-none rounded border border-gray-300 bg-white py-2 pl-3 pr-8 text-[13px] text-gray-700 shadow-sm outline-none focus:border-[#1a56db]"
          >
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>
    </div>
  );
}

export default function CrmChannelPartnerPage() {
  const [team, setTeam] = useState("");
  const [sourcingManager, setSourcingManager] = useState("");
  const [advanceFilter, setAdvanceFilter] = useState("");
  const [kebabOpen, setKebabOpen] = useState(false);
  const kebabRef = useRef<HTMLDivElement>(null);
  const [cpKebabModal, setCpKebabModal] = useState<ChannelPartnerKebabModal>(null);
  const [exportTableOpen, setExportTableOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState("50");
  const [columnPreset, setColumnPreset] = useState("");
  const rowCount = 0;
  const colCount = 1 + CP_TABLE_HEADERS.length;

  useEffect(() => {
    if (!kebabOpen) return;
    const onDown = (e: MouseEvent) => {
      if (kebabRef.current && !kebabRef.current.contains(e.target as Node)) setKebabOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [kebabOpen]);

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 font-sans text-gray-800 md:p-6">
      <h1 className="mb-4 text-lg font-semibold text-gray-800">Channel Partner</h1>

      <div className="mb-4 flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-4">
          <FilterSelect label="Select Team" value={team} onChange={setTeam} placeholder="Select Team" options={TEAM_OPTS} />
          <FilterSelect
            label="Select Sourcing Manager"
            value={sourcingManager}
            onChange={setSourcingManager}
            placeholder="Select Sourcing Manager"
            options={SOURCING_MANAGER_OPTS}
          />
        </div>
        <button suppressHydrationWarning type="button" className={cn("shrink-0 rounded-md px-6 py-2 text-sm font-medium text-white", PRIMARY)}>
          Apply
        </button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_CARDS.map((k) => (
          <KpiCard key={k.title} title={k.title} value={k.value} note={k.note} />
        ))}
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-gray-800">Channel Partner ( {rowCount} )</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px] flex-1 sm:flex-initial">
              <select
                suppressHydrationWarning
                value={advanceFilter}
                onChange={(e) => setAdvanceFilter(e.target.value)}
                className="w-full appearance-none rounded border border-gray-300 bg-white py-2 pl-3 pr-9 text-[13px] text-gray-700 shadow-sm outline-none focus:border-[#1a56db]"
              >
                <option value="">Select Advance Filter</option>
                {ADVANCED_FILTER_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative" ref={kebabRef}>
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setKebabOpen((o) => !o)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 shadow-sm hover:bg-gray-50"
                aria-label="More actions"
                aria-expanded={kebabOpen}
                aria-haspopup="menu"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {kebabOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-40 mt-1 min-w-[260px] rounded-md border border-gray-200 bg-white py-1 shadow-lg"
                >
                  {CHANNEL_PARTNER_KEBAB_ACTIONS.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      suppressHydrationWarning
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] text-gray-800 hover:bg-sky-50"
                      onClick={() => {
                        setKebabOpen(false);
                        if (id === "addChannelPartner") setCpKebabModal("addPartner");
                        else if (id === "addChannelPartnerCompany") setCpKebabModal("company");
                        else if (id === "bulkUpload") setCpKebabModal("bulkUpload");
                        else if (id === "tableDownload") setExportTableOpen(true);
                      }}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-gray-600" strokeWidth={2.25} aria-hidden />
                      {label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setFilterPanelOpen(true)}
              className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded text-white", ORANGE)}
              aria-label="Open filters"
              aria-expanded={filterPanelOpen}
              aria-haspopup="dialog"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        <TableToolbar
          search={search}
          setSearch={setSearch}
          pageSize={pageSize}
          setPageSize={setPageSize}
          columnPreset={columnPreset}
          setColumnPreset={setColumnPreset}
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px] border-collapse text-sm">
            <thead className="bg-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
              <tr>
                <th className="w-10 border-b border-gray-200 px-2 py-2.5">
                  <span className="sr-only">Select</span>
                  <input suppressHydrationWarning type="checkbox" className="rounded border-gray-300" aria-label="Select all" />
                </th>
                {CP_TABLE_HEADERS.map((h) => (
                  <th key={h} className="whitespace-nowrap border-b border-gray-200 px-3 py-2.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={colCount} className="px-3 py-12 text-center text-gray-500">
                  No Data Found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-200 px-4 py-3">
          <PaginationBar />
        </div>
      </div>

      <ChannelPartnerKebabModals active={cpKebabModal} onClose={() => setCpKebabModal(null)} />
      <ExportChannelPartnerModal open={exportTableOpen} onClose={() => setExportTableOpen(false)} />
      <ChannelPartnerFilterPanel open={filterPanelOpen} onClose={() => setFilterPanelOpen(false)} />
    </div>
  );
}
