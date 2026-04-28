"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown, Filter, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

const PRIMARY = "bg-[#1a56db] hover:bg-blue-700";
const ORANGE = "bg-[#f97316] hover:bg-orange-600";

const TEAM_OPTS = ["North", "South", "East", "West"];
const AGENT_OPTS = ["Aman Dubey", "Ajay Jaiswal", "Priya Jagtap", "Supriya Jadhav"];
const SOURCE_OPTS = ["FB", "IG", "Walk-in", "Referral", "Magicbricks"];
const SUB_SOURCE_OPTS = ["Campaign A", "Campaign B", "Organic"];
const LOG_FILTER_OPTS = ["All Types", "Lead", "Contact", "CP", "Property", "Stage"];
const ENTITY_OPTS = ["Lead", "Contact", "Channel Partner", "Property"];
const PROJECT_OPTS = ["Nerul Generic", "Balaji Symphony", "Prime Towers", "Renucorp Generic"];

const LEAD_LOG_METRICS_COL1 = [
  { label: "Lead Added", value: "0" },
  { label: "Lead Returned", value: "0" },
  { label: "Lead Transferred", value: "0" },
  { label: "Lead Stage Changed", value: "0" },
];
const LEAD_LOG_METRICS_COL2 = [
  { label: "Contact Transferred", value: "0" },
  { label: "Contact Merged", value: "0" },
  { label: "Contact Stage Changed", value: "0" },
  { label: "WhatsApp Message", value: "0" },
];
const LEAD_LOG_METRICS_COL3 = [
  { label: "CP Merged", value: "0" },
  { label: "CP Transferred", value: "0" },
  { label: "Property Stage Changed", value: "0" },
  { label: "Property Transferred", value: "0" },
];

const LOGS_TABLE_COLUMNS = [
  "#",
  "DATE",
  "DETAILS",
  "EXECUTIVE",
  "REMARK",
  "PROJECT",
  "STAGE",
  "SOURCE",
  "LOGS TYPE",
] as const;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-1.5 block text-[13px] font-bold text-gray-700">{children}</span>;
}

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
  options: string[];
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <FieldLabel>{label}</FieldLabel>
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

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <input
          suppressHydrationWarning
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 pr-10 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
        />
        <CalendarDays className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}

function ApplyClearRow() {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 pt-3">
      <button suppressHydrationWarning type="button" className={cn("rounded-md px-5 py-2 text-sm font-medium text-white", PRIMARY)}>
        Apply
      </button>
      <button
        suppressHydrationWarning
        type="button"
        className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Clear
      </button>
    </div>
  );
}

function LogMetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative flex items-center justify-between gap-3 border-b border-gray-100 py-2 last:border-0 md:border-0">
      <div className="absolute bottom-0 left-0 top-0 w-1.5 bg-[#1a56db]" aria-hidden />
      <span className="pl-3 text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}

function LogsFiltersCard() {
  const [timeRange, setTimeRange] = useState("Todays");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [team, setTeam] = useState("");
  const [agent, setAgent] = useState("");
  const [source, setSource] = useState("");
  const [subSource, setSubSource] = useState("");
  const [logsFilter, setLogsFilter] = useState("");
  const [entityType, setEntityType] = useState("");
  const [project, setProject] = useState("");

  return (
    <div className="rounded-md border border-gray-200 bg-[#f4f7f6] p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FilterSelect
          label="Time Range"
          value={timeRange}
          onChange={setTimeRange}
          placeholder="Select"
          options={["Todays", "Yesterday", "Current Week", "Current Month", "Current Year", "Custom"]}
        />
        <DateField label="From Date" value={fromDate} onChange={setFromDate} />
        <DateField label="To Date" value={toDate} onChange={setToDate} />
        <FilterSelect label="Teams" value={team} onChange={setTeam} placeholder="Select Team" options={TEAM_OPTS} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FilterSelect label="Sales Agent" value={agent} onChange={setAgent} placeholder="Select Sales Agent" options={AGENT_OPTS} />
        <FilterSelect label="Source" value={source} onChange={setSource} placeholder="Select Source" options={SOURCE_OPTS} />
        <FilterSelect label="Sub Source" value={subSource} onChange={setSubSource} placeholder="Select Sub Source" options={SUB_SOURCE_OPTS} />
        <FilterSelect label="Logs Filter" value={logsFilter} onChange={setLogsFilter} placeholder="Filter Types" options={LOG_FILTER_OPTS} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FilterSelect label="Entity Type" value={entityType} onChange={setEntityType} placeholder="Select Entity" options={ENTITY_OPTS} />
        <div className="sm:col-span-2 lg:col-span-3">
          <FilterSelect
            label="Project"
            value={project}
            onChange={setProject}
            placeholder="Search & Select Project"
            options={PROJECT_OPTS}
          />
        </div>
      </div>
      <ApplyClearRow />
    </div>
  );
}

function LeadLogsReportCard() {
  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 bg-gray-100 px-4 py-3">
        <h2 className="text-base font-semibold text-gray-800">Lead Logs Report</h2>
      </div>
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 gap-x-10 gap-y-0 md:grid-cols-3">
          <div className="space-y-0">
            {LEAD_LOG_METRICS_COL1.map((m) => (
              <LogMetricRow key={m.label} label={m.label} value={m.value} />
            ))}
          </div>
          <div className="space-y-0">
            {LEAD_LOG_METRICS_COL2.map((m) => (
              <LogMetricRow key={m.label} label={m.label} value={m.value} />
            ))}
          </div>
          <div className="space-y-0">
            {LEAD_LOG_METRICS_COL3.map((m) => (
              <LogMetricRow key={m.label} label={m.label} value={m.value} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LogsTableSection() {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState("20");
  const rowCount = 0;

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-4 py-3">
        <h2 className="text-base font-semibold text-gray-800">Logs ( {rowCount} )</h2>
        <button
          suppressHydrationWarning
          type="button"
          className={cn("flex h-9 w-9 items-center justify-center rounded text-white", ORANGE)}
          aria-label="Filter logs"
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 border-b border-gray-200 px-4 py-2.5">
        <div className="flex min-w-0 max-w-full items-stretch rounded border border-gray-300 bg-white shadow-sm">
          <input
            suppressHydrationWarning
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="min-w-[140px] max-w-[220px] flex-1 border-0 bg-transparent px-3 py-2 text-[13px] text-gray-800 outline-none sm:max-w-[280px]"
          />
          <button
            suppressHydrationWarning
            type="button"
            className="flex shrink-0 items-center justify-center bg-[#1a56db] px-3 py-2 text-white hover:bg-blue-700"
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
        <div className="relative">
          <select
            suppressHydrationWarning
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
            className="appearance-none rounded border border-gray-300 bg-white py-2 pl-3 pr-8 text-[13px] text-gray-700 shadow-sm outline-none focus:border-[#1a56db]"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead className="bg-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
            <tr>
              {LOGS_TABLE_COLUMNS.map((c) => (
                <th key={c} className="whitespace-nowrap border-b border-gray-200 px-3 py-2.5">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={LOGS_TABLE_COLUMNS.length} className="px-3 py-12 text-center text-gray-500">
                No Data Found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CrmLogsPage() {
  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 font-sans text-gray-800 md:p-6">
      <h1 className="mb-4 text-lg font-semibold text-gray-800">Logs</h1>

      <div className="flex flex-col gap-4">
        <LogsFiltersCard />
        <LeadLogsReportCard />
        <LogsTableSection />
      </div>
    </div>
  );
}
