"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpDown,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Filter,
  Handshake,
  Home,
  MessageCircle,
  MoreVertical,
  Phone,
  Plus,
  PhoneCall,
  Search,
  User,
  Users,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  ActivityActionModals,
  type ActivityActionModalId,
} from "./add-activity-modals";

const PRIMARY = "bg-[#1a56db] hover:bg-blue-700";
const ORANGE = "bg-[#f97316] hover:bg-orange-600";

type MainTab = "leadActivities" | "salesAgent" | "userAnalysis";

const LEAD_METRICS: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBox: string;
}[] = [
  {
    label: "Tasks",
    value: "3786",
    icon: <ClipboardList className="h-4 w-4 text-amber-600" />,
    iconBox: "bg-amber-100",
  },
  {
    label: "Total Offline Calls",
    value: "9228",
    icon: <Phone className="h-4 w-4 text-blue-600" />,
    iconBox: "bg-blue-100",
  },
  {
    label: "Total IVR Calls",
    value: "0",
    icon: <PhoneCall className="h-4 w-4 text-sky-600" />,
    iconBox: "bg-sky-100",
  },
  {
    label: "Meetings",
    value: "0",
    icon: <Handshake className="h-4 w-4 text-cyan-600" />,
    iconBox: "bg-cyan-100",
  },
  {
    label: "Calls To Lead",
    value: "0",
    icon: <Users className="h-4 w-4 text-violet-600" />,
    iconBox: "bg-violet-100",
  },
  {
    label: "Calls To Lead",
    value: "0",
    icon: <Users className="h-4 w-4 text-violet-600" />,
    iconBox: "bg-violet-100",
  },
  {
    label: "Site Visit Scheduled",
    value: "7",
    icon: <Home className="h-4 w-4 text-emerald-600" />,
    iconBox: "bg-emerald-100",
  },
  {
    label: "Calls To Contact",
    value: "0",
    icon: <User className="h-4 w-4 text-blue-600" />,
    iconBox: "bg-blue-100",
  },
  {
    label: "Calls To Contact",
    value: "0",
    icon: <User className="h-4 w-4 text-blue-600" />,
    iconBox: "bg-blue-100",
  },
  {
    label: "Site Visit Completed",
    value: "7",
    icon: <Home className="h-4 w-4 text-emerald-600" />,
    iconBox: "bg-emerald-100",
  },
  {
    label: "Calls To Channel Partner",
    value: "0",
    icon: <MessageCircle className="h-4 w-4 text-slate-500" />,
    iconBox: "bg-slate-100",
  },
  {
    label: "Calls To Channel Partner",
    value: "0",
    icon: <MessageCircle className="h-4 w-4 text-slate-500" />,
    iconBox: "bg-slate-100",
  },
];

const ACTIVITY_FILTER_OPTIONS = ["Task", "Site Visit", "Meeting", "Call", "Note", "Email"] as const;
const DEFAULT_ACTIVITY_FILTERS = new Set<string>(["Task", "Site Visit", "Meeting"]);

const SALES_AGENT_COLUMNS = [
  "#",
  "SALES AGENT",
  "LEAD COUNT",
  "CONTACT COUNT",
  "CP COUNT",
  "TOTAL TASK",
  "MEETINGS",
  "SITEVISIT SCHEDULED",
  "SITEVISIT COMPLETED",
  "TOTAL IVR CALLS",
  "TOTAL CALL LOGS",
] as const;

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="mb-1.5 flex items-baseline gap-0.5 text-[13px] font-bold text-gray-700">
      {children}
      {required ? <span className="text-red-500">*</span> : null}
    </span>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  placeholder,
  options,
  required,
  hideEmptyOption,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
  required?: boolean;
  hideEmptyOption?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <FieldLabel required={required}>{label}</FieldLabel>
      <div className="relative">
        <select
          suppressHydrationWarning
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2 pr-9 text-[13px] text-gray-700 shadow-sm outline-none transition-colors focus:border-[#1a56db]"
        >
          {hideEmptyOption ? null : <option value="">{placeholder}</option>}
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

function ActivityFilterMulti({
  value,
  onChange,
}: {
  value: Set<string>;
  onChange: (s: Set<string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const toggle = (k: string) => {
    const n = new Set(value);
    if (n.has(k)) n.delete(k);
    else n.add(k);
    onChange(n);
  };

  return (
    <div className="flex min-w-0 flex-col" ref={ref}>
      <span className="mb-1.5 text-[13px] font-bold text-gray-700">Activity Filter</span>
      <div className="relative">
        <button
          suppressHydrationWarning
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full min-h-[42px] flex-wrap content-start items-center gap-1.5 rounded border border-gray-300 bg-white px-2 py-1.5 text-left text-[13px] text-gray-700 shadow-sm outline-none transition-colors focus:border-[#1a56db]"
          aria-expanded={open}
        >
          {value.size ? (
            [...value].map((k) => (
              <span
                key={k}
                className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[12px] font-medium text-sky-800"
                onClick={(e) => e.stopPropagation()}
              >
                {k}
                <span
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(k);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(k);
                  }}
                  className="rounded p-0.5 hover:bg-sky-200"
                  aria-label={`Remove ${k}`}
                >
                  <X className="h-3 w-3" />
                </span>
              </span>
            ))
          ) : (
            <span className="pl-1 text-gray-500">Select activities</span>
          )}
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 self-center text-gray-400" />
        </button>
        {open ? (
          <ul
            className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
            role="listbox"
          >
            {ACTIVITY_FILTER_OPTIONS.map((opt) => (
              <li key={opt}>
                <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-[13px] text-gray-800 hover:bg-blue-50">
                  <input
                    suppressHydrationWarning
                    type="checkbox"
                    className="rounded border-gray-300 text-[#1a56db] focus:ring-[#1a56db]"
                    checked={value.has(opt)}
                    onChange={() => toggle(opt)}
                  />
                  {opt}
                </label>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function SortHeader({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1">
      {children}
      <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" aria-hidden />
    </span>
  );
}

function ApplyClearRow() {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 pt-3">
      <button
        suppressHydrationWarning
        type="button"
        className={cn("rounded-md px-5 py-2 text-sm font-medium text-white", PRIMARY)}
      >
        Apply
      </button>
      <button
        suppressHydrationWarning
        type="button"
        className="rounded-md border border-[#1a56db] bg-white px-5 py-2 text-sm font-medium text-[#1a56db] hover:bg-blue-50"
      >
        Clear
      </button>
    </div>
  );
}

function LeadActivitiesFilters({
  dateType,
  setDateType,
  timeRange,
  setTimeRange,
  team,
  setTeam,
  agent,
  setAgent,
  source,
  setSource,
  subSource,
  setSubSource,
  types,
  setTypes,
  project,
  setProject,
  completed,
  setCompleted,
  activitySet,
  setActivitySet,
}: {
  dateType: string;
  setDateType: (v: string) => void;
  timeRange: string;
  setTimeRange: (v: string) => void;
  team: string;
  setTeam: (v: string) => void;
  agent: string;
  setAgent: (v: string) => void;
  source: string;
  setSource: (v: string) => void;
  subSource: string;
  setSubSource: (v: string) => void;
  types: string;
  setTypes: (v: string) => void;
  project: string;
  setProject: (v: string) => void;
  completed: string;
  setCompleted: (v: string) => void;
  activitySet: Set<string>;
  setActivitySet: (s: Set<string>) => void;
}) {
  return (
    <div className="rounded-md border border-gray-200 bg-[#f4f7f6] p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FilterSelect
          label="Date Type"
          value={dateType}
          onChange={setDateType}
          placeholder="Select"
          options={["Activity Date", "Created Date", "Assigned Date"]}
        />
        <FilterSelect
          label="Time Range"
          value={timeRange}
          onChange={setTimeRange}
          placeholder="Select"
          options={["Current Month", "Today", "Yesterday", "Last 7 Days", "Last 30 Days", "Custom"]}
        />
        <FilterSelect
          label="Teams"
          value={team}
          onChange={setTeam}
          placeholder="Select Team"
          options={["North", "South", "East", "West"]}
        />
        <FilterSelect
          label="Sales Agent"
          value={agent}
          onChange={setAgent}
          placeholder="Select Sales Agent"
          options={["Aman Dubey", "Ajay Jaiswal", "Priya Jagtap"]}
        />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FilterSelect
          label="Source"
          value={source}
          onChange={setSource}
          placeholder="Select Source"
          options={["FB", "IG", "Walk-in", "Referral"]}
        />
        <FilterSelect
          label="Sub Source"
          value={subSource}
          onChange={setSubSource}
          placeholder="Select Sub Source"
          options={["Campaign A", "Campaign B", "Organic"]}
        />
        <ActivityFilterMulti value={activitySet} onChange={setActivitySet} />
        <FilterSelect
          label="Types"
          value={types}
          onChange={setTypes}
          placeholder="Select Entity"
          options={["Lead", "Contact", "Channel Partner"]}
        />
      </div>
      <div className="mt-3 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
        <FilterSelect
          label="Project"
          value={project}
          onChange={setProject}
          placeholder="Search & Select Project"
          options={["Nerul Generic", "Balaji Symphony", "Prime Towers"]}
        />
        <FilterSelect
          label="Completed"
          value={completed}
          onChange={setCompleted}
          placeholder="All"
          options={["All", "Yes", "No"]}
          hideEmptyOption
        />
      </div>
      <ApplyClearRow />
    </div>
  );
}

function SalesAgentFilters({
  timeRange,
  setTimeRange,
  team,
  setTeam,
  agent,
  setAgent,
  source,
  setSource,
  subSource,
  setSubSource,
}: {
  timeRange: string;
  setTimeRange: (v: string) => void;
  team: string;
  setTeam: (v: string) => void;
  agent: string;
  setAgent: (v: string) => void;
  source: string;
  setSource: (v: string) => void;
  subSource: string;
  setSubSource: (v: string) => void;
}) {
  return (
    <div className="rounded-md border border-gray-200 bg-[#f4f7f6] p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <FilterSelect
          label="Time Range"
          value={timeRange}
          onChange={setTimeRange}
          placeholder="Select"
          options={["Todays", "Yesterday", "Current Week", "Current Month", "Current Year"]}
        />
        <FilterSelect
          label="Teams"
          value={team}
          onChange={setTeam}
          placeholder="Select Team"
          options={["North", "South", "East", "West"]}
        />
        <FilterSelect
          label="Sales Agent"
          value={agent}
          onChange={setAgent}
          placeholder="Select Sales Agent"
          options={["Aman Dubey", "Ajay Jaiswal", "Priya Jagtap"]}
        />
        <FilterSelect
          label="Source"
          value={source}
          onChange={setSource}
          placeholder="Select Source"
          options={["FB", "IG", "Walk-in", "Referral"]}
        />
        <FilterSelect
          label="Sub Source"
          value={subSource}
          onChange={setSubSource}
          placeholder="Select Sub Source"
          options={["Campaign A", "Campaign B", "Organic"]}
        />
      </div>
      <ApplyClearRow />
    </div>
  );
}

function UserAnalysisFilters({
  type,
  setType,
  from,
  setFrom,
  to,
  setTo,
  team,
  setTeam,
  agent,
  setAgent,
}: {
  type: string;
  setType: (v: string) => void;
  from: string;
  setFrom: (v: string) => void;
  to: string;
  setTo: (v: string) => void;
  team: string;
  setTeam: (v: string) => void;
  agent: string;
  setAgent: (v: string) => void;
}) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FilterSelect
          label="Select Type"
          value={type}
          onChange={setType}
          placeholder="Select"
          options={["Day", "Week", "Month"]}
        />
        <div className="flex flex-col">
          <FieldLabel required>From Date</FieldLabel>
          <div className="relative">
            <input
              suppressHydrationWarning
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 pr-10 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
            />
            <CalendarDays className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div className="flex flex-col">
          <FieldLabel required>To Date</FieldLabel>
          <div className="relative">
            <input
              suppressHydrationWarning
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 pr-10 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
            />
            <CalendarDays className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <FilterSelect
          label="Teams"
          value={team}
          onChange={setTeam}
          placeholder="Select Team"
          options={["North", "South", "East", "West"]}
        />
      </div>
      <div className="mt-3 max-w-sm">
        <FilterSelect
          label="Sales Agent"
          value={agent}
          onChange={setAgent}
          placeholder="Select Sales Agent"
          options={["Aman Dubey", "Ajay Jaiswal", "Priya Jagtap"]}
          required
        />
      </div>
      <ApplyClearRow />
    </div>
  );
}

const LEAD_REPORT_ACTIONS: { id: ActivityActionModalId; label: string }[] = [
  { id: "completedTask", label: "Add Completed Task" },
  { id: "offlineCall", label: "Add Offline Call" },
  { id: "meeting", label: "Add Meeting" },
];

function LeadActivitiesReport({ onOpenAction }: { onOpenAction: (id: ActivityActionModalId) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-base font-semibold text-gray-800">Lead Activities Report</h2>
        <div className="relative" ref={menuRef}>
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded border border-[#1a56db] bg-[#1a56db] text-white shadow-sm hover:bg-blue-800"
            aria-label="Report actions"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-full z-30 mt-1 min-w-[220px] rounded-md border border-gray-200 bg-white py-1 shadow-lg"
            >
              {LEAD_REPORT_ACTIONS.map((item) => (
                <button
                  key={item.id}
                  suppressHydrationWarning
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] font-medium text-gray-900 hover:bg-gray-50"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenAction(item.id);
                  }}
                >
                  <Plus className="h-4 w-4 shrink-0 font-bold text-gray-900" strokeWidth={2.5} aria-hidden />
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 gap-x-10 gap-y-3 md:grid-cols-3">
          {LEAD_METRICS.map((m, idx) => (
            <div key={`m-${idx}-${m.label}`} className="flex items-center justify-between gap-3 border-b border-gray-100 py-1.5 last:border-0 md:border-0">
              <div className="flex min-w-0 items-center gap-3">
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", m.iconBox)}>{m.icon}</div>
                <span className="text-sm text-gray-600">{m.label}</span>
              </div>
              <span className="shrink-0 text-sm font-semibold text-gray-800">{m.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const ACTIVITIES_LOG_COLUMNS = [
  "#",
  "DATE",
  "DETAILS",
  "VISIT FREQUENCY",
  "EXECUTIVE",
  "PROJECT",
  "CHANNEL PARTNER",
  "STAGE",
  "PERFORMED DATE",
  "REMARK",
  "SOURCE",
  "ACTIVITY TYPE",
] as const;

function LeadActivitiesLogSection() {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState("20");
  const rowCount = 0;

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-base font-semibold text-gray-800">
          Activities ( {rowCount} )
        </h2>
        <button
          suppressHydrationWarning
          type="button"
          className={cn("flex h-9 w-9 items-center justify-center rounded text-white", ORANGE)}
          aria-label="Filter activities"
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
        <table className="w-full min-w-[1100px] border-collapse text-sm">
          <thead className="bg-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
            <tr>
              {ACTIVITIES_LOG_COLUMNS.map((c) => (
                <th key={c} className="whitespace-nowrap border-b border-gray-200 px-3 py-2.5">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={ACTIVITIES_LOG_COLUMNS.length} className="px-3 py-12 text-center text-gray-500">
                No Data Found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SalesAgentTable() {
  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-base font-semibold text-gray-800">Sales Agent Activity</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse text-sm">
          <thead className="bg-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
            <tr>
              {SALES_AGENT_COLUMNS.map((c) => (
                <th key={c} className="whitespace-nowrap border-b border-gray-200 px-3 py-2.5">
                  {c === "#" ? c : <SortHeader>{c}</SortHeader>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={SALES_AGENT_COLUMNS.length}
                className="px-3 py-12 text-center text-gray-500"
              >
                No Data Found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserDetailsTable() {
  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-base font-semibold text-gray-800">User Details</h2>
        <button
          suppressHydrationWarning
          type="button"
          className={cn("flex h-9 w-9 items-center justify-center rounded text-white", ORANGE)}
          aria-label="Filter table"
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-sm">
          <thead className="bg-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
            <tr>
              <th className="border border-gray-200 px-2 py-2" rowSpan={2}>
                SR. NO.
              </th>
              <th className="border border-gray-200 px-2 py-2" rowSpan={2}>
                <SortHeader>SALES AGENT</SortHeader>
              </th>
              <th className="border border-gray-200 px-2 py-2" rowSpan={2}>
                <SortHeader>DATE</SortHeader>
              </th>
              <th className="border border-gray-200 px-2 py-2" rowSpan={2}>
                <SortHeader>TOTAL TASK</SortHeader>
              </th>
              <th className="border border-gray-200 px-2 py-2" rowSpan={2}>
                <SortHeader>MEETINGS</SortHeader>
              </th>
              <th className="border border-gray-200 px-2 py-2 text-center" colSpan={2}>
                SITE VISIT
              </th>
              <th className="border border-gray-200 px-2 py-2 text-center" colSpan={2}>
                TOTAL CALL
              </th>
            </tr>
            <tr>
              <th className="border border-gray-200 px-2 py-2">
                <SortHeader>SCHEDULED</SortHeader>
              </th>
              <th className="border border-gray-200 px-2 py-2">
                <SortHeader>COMPLETED</SortHeader>
              </th>
              <th className="border border-gray-200 px-2 py-2">
                <SortHeader>OFFLINE</SortHeader>
              </th>
              <th className="border border-gray-200 px-2 py-2">
                <SortHeader>IVR</SortHeader>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={9} className="px-3 py-12 text-center text-gray-500">
                No Data Found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MainTabs({ tab, onTab }: { tab: MainTab; onTab: (t: MainTab) => void }) {
  const items: { id: MainTab; label: string }[] = [
    { id: "leadActivities", label: "Activities" },
    { id: "salesAgent", label: "Sales Agent Report" },
    { id: "userAnalysis", label: "User Analysis" },
  ];
  return (
    <div className="mb-0 flex flex-wrap border-b border-gray-200 bg-white">
      {items.map((item) => {
        const active = tab === item.id;
        return (
          <button
            key={item.id}
            suppressHydrationWarning
            type="button"
            onClick={() => onTab(item.id)}
            className={cn(
              "px-5 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-[#1a56db] text-white"
                : "text-[#1a56db] hover:bg-gray-50",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export default function CrmActivitiesPage() {
  const [tab, setTab] = useState<MainTab>("leadActivities");
  const [activityModal, setActivityModal] = useState<ActivityActionModalId | null>(null);

  const [dateType, setDateType] = useState("Activity Date");
  const [timeRangeLA, setTimeRangeLA] = useState("Current Month");
  const [timeRangeSA, setTimeRangeSA] = useState("Todays");
  const [team, setTeam] = useState("");
  const [agent, setAgent] = useState("");
  const [source, setSource] = useState("");
  const [subSource, setSubSource] = useState("");
  const [types, setTypes] = useState("");
  const [project, setProject] = useState("");
  const [completed, setCompleted] = useState("All");
  const [activitySet, setActivitySet] = useState<Set<string>>(() => new Set(DEFAULT_ACTIVITY_FILTERS));

  const [uaType, setUaType] = useState("Day");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 font-sans text-gray-800 md:p-6">
      <h1 className="mb-4 text-lg font-semibold text-gray-800">Activities</h1>

      {tab === "leadActivities" ? (
        <LeadActivitiesFilters
          dateType={dateType}
          setDateType={setDateType}
          timeRange={timeRangeLA}
          setTimeRange={setTimeRangeLA}
          team={team}
          setTeam={setTeam}
          agent={agent}
          setAgent={setAgent}
          source={source}
          setSource={setSource}
          subSource={subSource}
          setSubSource={setSubSource}
          types={types}
          setTypes={setTypes}
          project={project}
          setProject={setProject}
          completed={completed}
          setCompleted={setCompleted}
          activitySet={activitySet}
          setActivitySet={setActivitySet}
        />
      ) : null}
      {tab === "salesAgent" ? (
        <SalesAgentFilters
          timeRange={timeRangeSA}
          setTimeRange={setTimeRangeSA}
          team={team}
          setTeam={setTeam}
          agent={agent}
          setAgent={setAgent}
          source={source}
          setSource={setSource}
          subSource={subSource}
          setSubSource={setSubSource}
        />
      ) : null}
      {tab === "userAnalysis" ? (
        <UserAnalysisFilters
          type={uaType}
          setType={setUaType}
          from={fromDate}
          setFrom={setFromDate}
          to={toDate}
          setTo={setToDate}
          team={team}
          setTeam={setTeam}
          agent={agent}
          setAgent={setAgent}
        />
      ) : null}

      <div className="mt-4 overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
        <MainTabs tab={tab} onTab={setTab} />
        <div className="border-t border-gray-200 p-4 md:p-5">
          {tab === "leadActivities" ? (
            <div className="flex flex-col gap-4">
              <LeadActivitiesReport onOpenAction={(id) => setActivityModal(id)} />
              <LeadActivitiesLogSection />
            </div>
          ) : null}
          {tab === "salesAgent" ? <SalesAgentTable /> : null}
          {tab === "userAnalysis" ? <UserDetailsTable /> : null}
        </div>
      </div>

      <ActivityActionModals active={activityModal} onClose={() => setActivityModal(null)} />
    </div>
  );
}
