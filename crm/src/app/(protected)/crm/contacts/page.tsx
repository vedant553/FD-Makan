"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, Download, Filter, ArrowUpDown, Search, X, MoreVertical, Plus, Upload } from "lucide-react";

import { cn } from "@/lib/utils";

type ContactTab = "analysis" | "detailed";

const PRIMARY = "bg-[#1a56db] hover:bg-blue-700";
const ORANGE_BTN = "bg-[#f97316] hover:bg-orange-600";

const DONUT_LEFT = {
  total: 11_810,
  segments: [
    { label: "Total Assigned", value: 11_159, displayPct: 94, ringPct: 94, color: "#e85c50", barClass: "bg-[#e85c50]" },
    { label: "Lead", value: 10, displayPct: 0.09, ringPct: 0.1, color: "#eab308", barClass: "bg-yellow-400" },
    { label: "Unqualified", value: 641, displayPct: 5.43, ringPct: 5.9, color: "#7c3aed", barClass: "bg-violet-600" },
  ],
};

const DONUT_RIGHT = {
  total: 17_322,
  // Display % from reference; ring slice % normalized to sum 100 for the donut graphic
  segments: [
    { label: "Contact - Data", value: 1, displayPct: 0.01, ringPct: 0.2, color: "#e85c50" },
    { label: "FB", value: 264, displayPct: 1.52, ringPct: 32, color: "#eab308" },
    { label: "IG", value: 163, displayPct: 0.94, ringPct: 20, color: "#7c3aed" },
    { label: "MAGICBRICKS", value: 397, displayPct: 2.29, ringPct: 44, color: "#eab308" },
    { label: "OTHER", value: 12, displayPct: 0.07, ringPct: 3.8, color: "#e85c50" },
  ],
};

const TREND_POINTS = {
  total: [7200, 3200, 2100, 800, 1500, 900],
  lead: [40, 20, 10, 5, 8, 4],
  unq: [600, 200, 50, 20, 30, 10],
};
const TREND_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const AGENT_NAMES = [
  "Aman Dubey",
  "Avishi Pandey",
  "Ajay Jaiswal",
  "Sakshi Pagare",
  "Arbaaz Patel",
  "Kajal Jadhav",
];
const AGENT_CHART = {
  total: [7528, 60, 800, 0, 152, 2619],
  lead: [1, 0, 6, 1, 0, 2],
  unqualified: [641, 0, 0, 0, 0, 0],
};

const TABLE_ROWS = [
  { agent: "Kajal Jadhav", total: 2619, lead: 2, unq: 0 },
  { agent: "Arbaaz Patel", total: 152, lead: 0, unq: 0 },
  { agent: "Sakshi Pagare", total: 0, lead: 1, unq: 0 },
  { agent: "Ajay Jaiswal", total: 800, lead: 6, unq: 0 },
  { agent: "Avishi Pandey", total: 60, lead: 0, unq: 0 },
  { agent: "Aman Dubey", total: 7528, lead: 1, unq: 641 },
];

function Donut({ segments, holePct = 58 }: { segments: { pct: number; color: string }[]; holePct?: number }) {
  let acc = 0;
  const segs = segments.map((s) => {
    const start = acc;
    acc += s.pct;
    return { ...s, start, end: acc };
  });
  const gradient = segs
    .map((s) => {
      const a = (s.start / 100) * 360;
      const b = (s.end / 100) * 360;
      return `${s.color} ${a}deg ${b}deg`;
    })
    .join(", ");

  return (
    <div
      className="mx-auto h-[140px] w-[140px] shrink-0 rounded-full"
      style={{
        background: `conic-gradient(${gradient})`,
        mask: `radial-gradient(farthest-side, transparent calc(${holePct}% - 1px), #000 ${holePct}%)`,
        WebkitMask: `radial-gradient(farthest-side, transparent calc(${holePct}% - 1px), #000 ${holePct}%)`,
      }}
    />
  );
}

function buildPolyline(values: number[], maxY: number, width: number, height: number, pad: number) {
  if (values.length < 2) return "";
  const n = values.length;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  return values
    .map((v, i) => {
      const x = pad + (innerW * i) / (n - 1);
      const y = pad + innerH - (v / maxY) * innerH;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function TrendLineChart() {
  const w = 640;
  const h = 200;
  const pad = 36;
  const yMax = 8000;
  const getVals = (key: "total" | "lead" | "unq") =>
    key === "total" ? TREND_POINTS.total : key === "lead" ? TREND_POINTS.lead : TREND_POINTS.unq;

  return (
    <div className="rounded-md border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-700">Trend</h3>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-6 rounded-full bg-[#e85c50]" />
            <span className="text-gray-600">Total</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-6 rounded-full bg-[#2563eb]" />
            <span className="text-gray-600">Lead</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-6 rounded-full bg-[#22c55e]" />
            <span className="text-gray-600">Unqualified</span>
          </div>
        </div>
      </div>
      <div className="min-w-0 overflow-x-auto">
        <svg className="w-full min-w-[500px] text-[10px] text-gray-500" viewBox={`0 0 ${w} ${h + 16}`} preserveAspectRatio="xMidYMid meet">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = pad + (h - pad * 2) * (1 - t);
            return (
              <g key={String(t)}>
                <line x1={pad} y1={y} x2={w - pad} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                <text x={4} y={y + 4} fill="currentColor">
                  {Math.round(yMax * t)}
                </text>
              </g>
            );
          })}
          {(
            [
              { key: "unq" as const, color: "#22c55e" },
              { key: "lead" as const, color: "#2563eb" },
              { key: "total" as const, color: "#e85c50" },
            ] as const
          ).map(({ key, color }) => {
            const vals = getVals(key);
            const d = buildPolyline(vals, yMax, w, h, pad);
            return <path key={key} d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />;
          })}
          {TREND_LABELS.map((lab, i) => {
            const x = pad + ((w - pad * 2) * i) / (TREND_LABELS.length - 1);
            return (
              <text key={lab} x={x - 10} y={h - 2} fill="currentColor" className="text-[9px]">
                {lab}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function AgentLineChart() {
  const w = 720;
  const h = 220;
  const pad = 40;
  const yMax = 8000;

  return (
    <div className="rounded-md border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-700">Sales agent trend</h3>
        <div className="flex flex-wrap items-center justify-end gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-6 bg-[#e85c50]" />
          <span className="text-gray-600">Total</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-6 bg-[#2563eb]" />
          <span className="text-gray-600">Lead</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-6 bg-[#22c55e]" />
          <span className="text-gray-600">Unqualified</span>
        </div>
        </div>
      </div>
      <div className="min-w-0 overflow-x-auto">
        <svg className="w-full min-w-[600px]" viewBox={`0 0 ${w} ${h + 32}`} preserveAspectRatio="xMidYMid meet">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = pad + (h - pad * 2) * (1 - t);
            return (
              <g key={String(t)}>
                <line x1={pad} y1={y} x2={w - pad} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                <text x={4} y={y + 4} className="fill-gray-500 text-[10px]">
                  {8000 * t}
                </text>
              </g>
            );
          })}
          {(
            [
              { vals: AGENT_CHART.unqualified, color: "#22c55e" },
              { vals: AGENT_CHART.lead, color: "#2563eb" },
              { vals: AGENT_CHART.total, color: "#e85c50" },
            ] as const
          ).map(({ vals, color }) => {
            const d = buildPolyline(vals, yMax, w, h, pad);
            return <path key={color} d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />;
          })}
          {AGENT_NAMES.map((name, i) => {
            const x = pad + ((w - pad * 2) * i) / (AGENT_NAMES.length - 1);
            return (
              <text key={name} x={x - 36} y={h + 20} className="fill-gray-600" style={{ fontSize: "7px" }}>
                {name}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function SalesAgentTable() {
  return (
    <div className="rounded-md border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-700">Sales Agent Activity</h3>
        <button suppressHydrationWarning
          type="button"
          className="inline-flex items-center gap-2 rounded bg-[#19c6a6] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#14b293]"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm whitespace-nowrap text-gray-700">
          <thead className="border-b border-gray-200 bg-white text-[12px] font-bold uppercase tracking-wide text-gray-700">
            <tr>
              <th className="border-r border-gray-100 px-4 py-3">#</th>
              <th className="border-r border-gray-100 px-4 py-3">
                <span className="inline-flex items-center gap-1">
                  Sales Agent <ArrowUpDown className="h-3 w-3 text-gray-400" />
                </span>
              </th>
              <th className="border-r border-gray-100 px-4 py-3">
                <span className="inline-flex items-center gap-1">
                  Total Contacts <ArrowUpDown className="h-3 w-3 text-gray-400" />
                </span>
              </th>
              <th className="border-r border-gray-100 px-4 py-3">
                <span className="inline-flex items-center gap-1">
                  Lead <ArrowUpDown className="h-3 w-3 text-gray-400" />
                </span>
              </th>
              <th className="px-4 py-3">
                <span className="inline-flex items-center gap-1">
                  Unqualified <ArrowUpDown className="h-3 w-3 text-gray-400" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {TABLE_ROWS.map((row, i) => (
              <tr key={row.agent} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="border-r border-gray-100 px-4 py-3">{i + 1}</td>
                <td className="border-r border-gray-100 px-4 py-3">{row.agent}</td>
                <td className="border-r border-gray-100 px-4 py-3">{row.total}</td>
                <td className="border-r border-gray-100 px-4 py-3">{row.lead}</td>
                <td className="px-4 py-3">{row.unq}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DataAnalysisDonuts() {
  return (
    <div className="rounded-md border border-gray-100 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-700">Data Analysis</h3>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center">
          <Donut
            segments={DONUT_LEFT.segments.map((s) => ({
              pct: s.ringPct,
              color: s.color,
            }))}
          />
          <div className="text-center sm:text-left">
            <p className="text-xl font-semibold text-gray-700">{DONUT_LEFT.total.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
          <div className="flex w-full max-w-md flex-col gap-3 sm:ml-4">
            {DONUT_LEFT.segments.map((s) => (
              <div key={s.label} className="flex gap-2">
                <div className={`w-1 shrink-0 rounded-full ${s.barClass}`} />
                <div className="text-xs text-gray-700">
                  <span className="font-semibold">{s.value.toLocaleString()}</span> {s.label}{" "}
                  <span className="text-gray-500">{s.displayPct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center">
          <Donut
            segments={DONUT_RIGHT.segments.map((s) => ({
              pct: s.ringPct,
              color: s.color,
            }))}
          />
          <div className="text-center sm:text-left">
            <p className="text-xl font-semibold text-gray-700">{DONUT_RIGHT.total.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
          <div className="w-full min-w-0 max-w-xl overflow-x-auto pb-1">
            <div className="flex min-w-max gap-0">
              {DONUT_RIGHT.segments.map((s) => (
                <div
                  key={s.label}
                  className="flex min-w-[100px] flex-col border-l-2 border-gray-100 px-3 first:border-l-0 first:pl-0"
                  style={{ borderLeftColor: s.color }}
                >
                  <span className="text-sm font-semibold text-gray-800">{s.value.toLocaleString()}</span>
                  <span className="text-[11px] text-gray-600">{s.label}</span>
                  <span className="text-[11px] text-gray-500">{s.displayPct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterBar() {
  return (
    <div className="space-y-4 rounded-md border border-gray-100 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <div className="flex flex-col">
          <label className="mb-1.5 text-[13px] font-bold text-gray-700">Teams</label>
          <div className="relative">
            <select suppressHydrationWarning className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-500 shadow-sm outline-none">
              <option>Select Team</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div className="flex flex-col">
          <label className="mb-1.5 text-[13px] font-bold text-gray-700">Assigned To</label>
          <div className="relative">
            <select suppressHydrationWarning className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-500 shadow-sm outline-none">
              <option>Select Sales Agent</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-4">
        <button suppressHydrationWarning type="button" className={`rounded px-4 py-1.5 text-sm font-medium text-white transition-colors ${PRIMARY}`}>
          Apply
        </button>
        <button suppressHydrationWarning
          type="button"
          className="rounded border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          Clear
        </button>
        <button suppressHydrationWarning
          type="button"
          className={`flex h-9 w-9 items-center justify-center rounded text-white transition-colors ${ORANGE_BTN}`}
          title="Filter"
          aria-label="Filter"
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ContactAnalysisTab() {
  return (
    <div className="space-y-6">
      <FilterBar />
      <DataAnalysisDonuts />
      <TrendLineChart />
      <AgentLineChart />
      <SalesAgentTable />
    </div>
  );
}

const DETAILED_LIST_COLUMNS = [
  { key: "sr", label: "SR. NO.", minW: "min-w-[64px]" },
  { key: "date", label: "DATE", minW: "min-w-[100px]" },
  { key: "name", label: "NAME", minW: "min-w-[120px]" },
  { key: "email", label: "EMAIL", minW: "min-w-[160px]" },
  { key: "phone", label: "PRIMARY NUMBER", minW: "min-w-[120px]" },
  { key: "type", label: "TYPE", minW: "min-w-[80px]" },
  { key: "stage", label: "CONTACT STAGE", minW: "min-w-[120px]" },
  { key: "source", label: "SOURCE", minW: "min-w-[100px]" },
  { key: "tags", label: "TAGS", minW: "min-w-[100px]" },
  { key: "preSales", label: "PRE SALES AGENT", minW: "min-w-[120px]" },
  { key: "sales", label: "SALES AGENT", minW: "min-w-[120px]" },
  { key: "channel", label: "CHANNEL PARTNER", minW: "min-w-[120px]" },
  { key: "sourcing", label: "SOURCING MANAGER", minW: "min-w-[120px]" },
  { key: "assignCount", label: "ASSIGNMENT COUNT", minW: "min-w-[120px]" },
  { key: "assignedDate", label: "ASSIGNED DATE", minW: "min-w-[110px]" },
  { key: "lastAssignedDate", label: "LAST ASSIGNED DATE", minW: "min-w-[130px]" },
  { key: "lastAssigned", label: "LAST ASSIGNED", minW: "min-w-[120px]" },
  { key: "lastActivity", label: "LAST ACTIVITY DATE", minW: "min-w-[130px]" },
  { key: "lastRemark", label: "LAST ACTIVITY REMARK", minW: "min-w-[160px]" },
  { key: "action", label: "ACTION", minW: "min-w-[80px]" },
] as const;

function DetailedListTab() {
  const contactCount = 0;
  const [kebabOpen, setKebabOpen] = useState(false);
  const kebabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!kebabOpen) return;
    const onDown = (e: MouseEvent) => {
      if (kebabRef.current && !kebabRef.current.contains(e.target as Node)) {
        setKebabOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [kebabOpen]);

  return (
    <div className="space-y-6">
      <FilterBar />

      <div className="overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Contacts ( {contactCount} )
          </h2>
          <div ref={kebabRef} className="relative z-20">
            <button suppressHydrationWarning
              type="button"
              onClick={() => setKebabOpen((o) => !o)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded border border-[#1a56db] shadow-sm transition-colors",
                kebabOpen
                  ? "bg-[#1a56db] text-white hover:bg-blue-800"
                  : "bg-white text-[#1a56db] hover:bg-blue-50",
              )}
              aria-expanded={kebabOpen}
              aria-label="List actions"
              title="Options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            <div
              className={cn(
                "absolute right-0 top-full z-30 mt-1 min-w-[220px] rounded-md border border-gray-200 bg-white py-1 shadow-lg",
                kebabOpen ? "block" : "hidden",
              )}
            >
              <button suppressHydrationWarning
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-gray-700 hover:bg-gray-50"
                onClick={() => setKebabOpen(false)}
              >
                <Plus className="h-4 w-4 text-gray-600" />
                Add Contact
              </button>
              <button suppressHydrationWarning
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-gray-700 hover:bg-gray-50"
                onClick={() => setKebabOpen(false)}
              >
                <Download className="h-4 w-4 text-gray-600" />
                Table Download
              </button>
              <button suppressHydrationWarning
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-gray-700 hover:bg-gray-50"
                onClick={() => setKebabOpen(false)}
              >
                <Download className="h-4 w-4 text-gray-600" />
                Bulk Download
              </button>
              <button suppressHydrationWarning
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-gray-700 hover:bg-gray-50"
                onClick={() => setKebabOpen(false)}
              >
                <Download className="h-4 w-4 text-gray-600" />
                Bulk Download for Update
              </button>
              <button suppressHydrationWarning
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-gray-700 hover:bg-gray-50"
                onClick={() => setKebabOpen(false)}
              >
                <Upload className="h-4 w-4 text-gray-600" />
                Bulk Upload
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="flex overflow-hidden rounded border border-gray-300 text-sm shadow-sm">
              <button suppressHydrationWarning
                type="button"
                className="border-r border-gray-300 bg-gray-50 px-3 py-1.5 text-gray-500 transition-colors hover:bg-gray-100"
              >
                Previous
              </button>
              <button suppressHydrationWarning
                type="button"
                className="border-r border-[#1a56db] bg-[#1a56db] px-3 py-1.5 text-white"
              >
                1
              </button>
              <button suppressHydrationWarning
                type="button"
                className="px-3 py-1.5 text-[#1a56db] transition-colors hover:bg-blue-50"
              >
                Next
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select suppressHydrationWarning className="w-40 appearance-none rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-500 shadow-sm outline-none">
                <option>Select Columns</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex overflow-hidden rounded border border-gray-300 shadow-sm">
              <input suppressHydrationWarning
                type="search"
                placeholder="Search"
                className="w-48 px-3 py-1.5 text-sm text-gray-600 outline-none"
              />
              <button suppressHydrationWarning
                type="button"
                className="flex items-center justify-center bg-[#5978de] px-3 py-1.5 text-white transition-colors hover:bg-blue-600"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
              <button suppressHydrationWarning
                type="button"
                className="flex items-center justify-center border-l border-gray-300 bg-gray-100 px-3 py-1.5 text-gray-500 transition-colors hover:bg-gray-200"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative">
              <select suppressHydrationWarning className="w-16 appearance-none rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm outline-none">
                <option>50</option>
                <option>20</option>
                <option>100</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="min-h-[200px] overflow-x-auto">
          <table className="w-full min-w-[2000px] text-left text-sm whitespace-nowrap text-gray-700">
            <thead className="border-b border-gray-200 bg-white text-[12px] font-bold uppercase tracking-wide text-gray-700">
              <tr>
                <th className="w-10 border-r border-gray-100 px-4 py-3">
                  <input suppressHydrationWarning type="checkbox" className="rounded border-gray-300" aria-label="Select all" />
                </th>
                {DETAILED_LIST_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`whitespace-nowrap border-r border-gray-100 px-4 py-3 last:border-r-0 ${col.minW}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td
                  colSpan={1 + DETAILED_LIST_COLUMNS.length}
                  className="py-10 text-center text-sm text-gray-500"
                >
                  No Data Found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function CrmContactsPage() {
  const [subTab, setSubTab] = useState<ContactTab>("analysis");

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 font-sans text-gray-800 md:p-6">
      <div className="mb-4 flex items-stretch justify-between gap-3 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex min-w-0 flex-1">
          <button suppressHydrationWarning
            type="button"
            onClick={() => setSubTab("analysis")}
            className={`border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
              subTab === "analysis"
                ? "border-[#1a56db] bg-[#1a56db] text-white"
                : "border-transparent text-[#1a56db] hover:bg-gray-50"
            }`}
          >
            Contact Analysis
          </button>
          <button suppressHydrationWarning
            type="button"
            onClick={() => setSubTab("detailed")}
            className={`border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
              subTab === "detailed"
                ? "border-[#1a56db] bg-[#1a56db] text-white"
                : "border-transparent text-[#1a56db] hover:bg-gray-50"
            }`}
          >
            Detailed List
          </button>
        </div>
        <div className="flex shrink-0 items-center pr-3">
          <button suppressHydrationWarning
            type="button"
            className={`flex h-9 w-9 items-center justify-center rounded text-white transition-colors ${ORANGE_BTN}`}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="pb-6">{subTab === "analysis" ? <ContactAnalysisTab /> : <DetailedListTab />}</div>
    </div>
  );
}
