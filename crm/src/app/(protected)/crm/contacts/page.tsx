"use client";

import { useState } from "react";
import { Bell, ChevronDown, Download, Filter, ArrowUpDown, Search, X, MoreVertical } from "lucide-react";

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
    <div className="rounded-md border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid min-w-[320px] flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="relative">
            <select suppressHydrationWarning className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-500 shadow-sm outline-none">
              <option>Select Team</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="relative">
            <select suppressHydrationWarning className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-500 shadow-sm outline-none">
              <option>Select Sales Agent</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
] as const;

const DETAILED_LIST_ROWS = [
  { date: "Nov 7, 2025", name: "Prathamesh Shelar Na", email: "pshelar297@gmail.com", phone: "+91-9821504870", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
  { date: "Nov 7, 2025", name: "Akhilesh Gupta Na", email: "ajyamaldikar@gmail.com", phone: "+91-9326773377", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
  { date: "Nov 7, 2025", name: "Nanda", email: "-", phone: "+91-8452086469", stage: "Open", source: "FB", tags: "-", preSales: "-" },
  { date: "Nov 6, 2025", name: "Priti Priti", email: "preetipandey9461@gmail.com", phone: "+91-9987694857", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
  { date: "Nov 6, 2025", name: "Dsfds Dsfds", email: "-", phone: "+91-7666266114", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
  { date: "Nov 6, 2025", name: "Seventeen Seventeen", email: "sushmakusumkar1975@gmail.com", phone: "+91-8652503954", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
  { date: "Nov 6, 2025", name: "Roshni Albin Na", email: "roshnisandhyamoney@gmail.com", phone: "+91-9879740027", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
  { date: "Nov 6, 2025", name: "Abhijeet Na", email: "abhijeet.borulkar01@gmail.com", phone: "+91-9421368712", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
  { date: "Nov 6, 2025", name: "Javed Shaikh", email: "-", phone: "+91-9022484285", stage: "Open", source: "FB", tags: "-", preSales: "-" },
  { date: "Nov 6, 2025", name: "Shailesh Shailesh", email: "shailesh.tnayyar9@gmail.com", phone: "+91-8657215836", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
  { date: "Nov 6, 2025", name: "Suprita Ratish Na", email: "suprita.1333@gmail.com", phone: "+91-9594658133", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
  { date: "Nov 6, 2025", name: "Ashyanaarchitects Ashyanaarchitectics", email: "atreyagovind@gmail.com", phone: "+91-8193078742", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
  { date: "Nov 6, 2025", name: "Shanmugasundaram Subramanian", email: "-", phone: "+91-9920931467", stage: "Open", source: "FB", tags: "-", preSales: "-" },
  { date: "Nov 6, 2025", name: "Kelvin Kelvin", email: "kelvinsheerathiya1@gmail.com", phone: "+91-9619972944", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
  { date: "Nov 6, 2025", name: "Vinod Bairagi", email: "-", phone: "+91-9322293351", stage: "Open", source: "IG", tags: "-", preSales: "-" },
  { date: "Nov 6, 2025", name: "Deepak Agrawal", email: "-", phone: "+91-9833409941", stage: "Open", source: "IG", tags: "-", preSales: "-" },
  { date: "Nov 5, 2025", name: "Dhirendra Tiwari", email: "-", phone: "+91-9004521299", stage: "Open", source: "FB", tags: "-", preSales: "-" },
  { date: "Nov 5, 2025", name: "Sonia Sonia", email: "9769095818@indiatimes.com.joysonia69@gmail.com", phone: "+91-9769095818", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
  { date: "Nov 4, 2025", name: "Prema Prema Na", email: "prshetly1@yahoo.com", phone: "+91-9967553903", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
  { date: "Nov 4, 2025", name: "Ashok Mistry Ashok Mistry", email: "amist5557@gmail.com", phone: "+91-9323952938", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
  { date: "Nov 4, 2025", name: "Ghanshyam", email: "shyamharijadhav@gmail.com", phone: "+91-9920728578", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
  { date: "Nov 4, 2025", name: "Anjum Patel", email: "-", phone: "+91-9302122564", stage: "Open", source: "IG", tags: "-", preSales: "-" },
  { date: "Nov 2, 2025", name: "Nilesh Gomes", email: "-", phone: "+91-9833412514", stage: "Open", source: "FB", tags: "-", preSales: "-" },
  { date: "Nov 2, 2025", name: "Ravi Ravi", email: "raviswam@usa.net", phone: "+93-885594", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
  { date: "Nov 2, 2025", name: "Priyanka J Mathews", email: "-", phone: "+91-9223182038", stage: "Open", source: "IG", tags: "-", preSales: "-" },
  { date: "Nov 2, 2025", name: "Jolly Varughese", email: "jolly.varughese@gmail.com", phone: "+91-9633560983", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
  { date: "Nov 1, 2025", name: "Imran", email: "imran.mechanical@gmail.com", phone: "+91-8788287603", stage: "Open", source: "IG", tags: "-", preSales: "-" },
  { date: "Nov 1, 2025", name: "Munishchawla Munishchawla", email: "munishchawla526@gmail.com", phone: "+91-9781702594", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
  { date: "Oct 31, 2025", name: "Mangal Soni", email: "-", phone: "+91-9867774905", stage: "Open", source: "FB", tags: "-", preSales: "-" },
  { date: "Oct 31, 2025", name: "Margaret Maben Margaret Maben", email: "504833497@timesgroup.com", phone: "+504-833497", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
  { date: "Oct 31, 2025", name: "Sudesh Chiparkar Sudesh Chiparkar", email: "sdchiparkar@rediffmail.com", phone: "+91-8007779024", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
  { date: "Oct 31, 2025", name: "Maruti D Lohar Maruti D Lohar", email: "loharmaruti83@gmail.com", phone: "+91-8411898016", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
  { date: "Oct 31, 2025", name: "Sandeh S Chawan", email: "-", phone: "+91-9892328029", stage: "Open", source: "FB", tags: "-", preSales: "-" },
  { date: "Oct 31, 2025", name: "Shirish Nikumbh", email: "-", phone: "+91-9867375673", stage: "Open", source: "FB", tags: "-", preSales: "-" },
  { date: "Oct 31, 2025", name: "Shraddha Dubey", email: "-", phone: "+91-8451824087", stage: "Open", source: "FB", tags: "-", preSales: "-" },
  { date: "Oct 31, 2025", name: "Nazarine Nazarine", email: "iyanah123@gmail.com", phone: "+677-85924", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
  { date: "Oct 31, 2025", name: "Shruti Shruti", email: "shrutikasawant43@gmail.com", phone: "+51-45747397", stage: "Open", source: "MAGICBRICKS", tags: "-", preSales: "-" },
];

function DetailedListTab() {
  const contactCount = 17_322;

  return (
    <div className="space-y-6">
      <FilterBar />

      <div className="overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4">
          <h3 className="mb-4 text-lg font-medium text-gray-700">Contact Stage Analysis</h3>
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Donut
              segments={[
                { pct: 96, color: "#1565d8" },
                { pct: 0.05, color: "#10b981" },
                { pct: 3.95, color: "#4f46e5" },
              ]}
              holePct={72}
            />
            <div className="flex flex-col gap-2 text-gray-700">
              <div>
                <p className="text-4xl leading-tight font-medium">{contactCount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="border-l-2 border-[#1565d8] pl-2">
                  <p className="text-sm font-semibold">16,672</p>
                  <p className="text-[11px] text-gray-500">Open</p>
                  <p className="text-[11px] text-gray-500">96%</p>
                </div>
                <div className="border-l-2 border-[#10b981] pl-2">
                  <p className="text-sm font-semibold">9</p>
                  <p className="text-[11px] text-gray-500">Prospect</p>
                  <p className="text-[11px] text-gray-500">0.05%</p>
                </div>
                <div className="border-l-2 border-[#4f46e5] pl-2">
                  <p className="text-sm font-semibold">641</p>
                  <p className="text-[11px] text-gray-500">Unqualified</p>
                  <p className="text-[11px] text-gray-500">3.7%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-700">Contacts ( {contactCount} )</h2>
          <button
            suppressHydrationWarning
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
            aria-label="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4">
          <div className="flex items-center gap-1 text-sm">
            <button suppressHydrationWarning type="button" className="rounded border border-gray-300 bg-gray-50 px-2.5 py-1 text-gray-500">
              Previous
            </button>
            <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-2.5 py-1 text-white">
              1
            </button>
            <button suppressHydrationWarning type="button" className="rounded px-2.5 py-1 text-[#1a56db] hover:bg-blue-50">
              2
            </button>
            <button suppressHydrationWarning type="button" className="rounded px-2.5 py-1 text-[#1a56db] hover:bg-blue-50">
              3
            </button>
            <button suppressHydrationWarning type="button" className="rounded px-2.5 py-1 text-[#1a56db] hover:bg-blue-50">
              4
            </button>
            <button suppressHydrationWarning type="button" className="rounded border border-gray-300 bg-gray-50 px-2.5 py-1 text-[#1a56db]">
              Next
            </button>
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
          <table className="w-full min-w-[1400px] text-left text-sm whitespace-nowrap text-gray-700">
            <thead className="border-b border-gray-200 bg-white text-[12px] font-bold uppercase tracking-wide text-gray-700">
              <tr>
                <th className="w-10 border-r border-gray-100 px-3 py-2">
                  <input suppressHydrationWarning type="checkbox" className="rounded border-gray-300" aria-label="Select all" />
                </th>
                {DETAILED_LIST_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`whitespace-nowrap border-r border-gray-100 px-3 py-2.5 last:border-r-0 ${col.minW}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {DETAILED_LIST_ROWS.map((row, idx) => (
                <tr key={`${row.email}-${idx}`} className="hover:bg-gray-50">
                  <td className="border-r border-gray-100 px-3 py-2">
                    <input suppressHydrationWarning type="checkbox" className="rounded border-gray-300" aria-label={`Select row ${idx + 1}`} />
                  </td>
                  <td className="border-r border-gray-100 px-3 py-2">{idx + 1}</td>
                  <td className="border-r border-gray-100 px-3 py-2">{row.date}</td>
                  <td className="border-r border-gray-100 px-3 py-2 text-[#1a56db]">{row.name}</td>
                  <td className="max-w-[260px] border-r border-gray-100 px-3 py-2">{row.email}</td>
                  <td className="border-r border-gray-100 px-3 py-2">{row.phone}</td>
                  <td className="border-r border-gray-100 px-3 py-2">-</td>
                  <td className="border-r border-gray-100 px-3 py-2">{row.stage}</td>
                  <td className="border-r border-gray-100 px-3 py-2">{row.source}</td>
                  <td className="border-r border-gray-100 px-3 py-2">{row.tags}</td>
                  <td className="px-3 py-2">{row.preSales}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-1 border-t border-gray-100 p-3 text-sm">
          <button suppressHydrationWarning type="button" className="rounded border border-gray-300 bg-gray-50 px-2.5 py-1 text-gray-500">
            Previous
          </button>
          <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-2.5 py-1 text-white">
            1
          </button>
          <button suppressHydrationWarning type="button" className="rounded px-2.5 py-1 text-[#1a56db] hover:bg-blue-50">
            2
          </button>
          <button suppressHydrationWarning type="button" className="rounded px-2.5 py-1 text-[#1a56db] hover:bg-blue-50">
            3
          </button>
          <button suppressHydrationWarning type="button" className="rounded px-2.5 py-1 text-[#1a56db] hover:bg-blue-50">
            4
          </button>
          <button suppressHydrationWarning type="button" className="rounded border border-gray-300 bg-gray-50 px-2.5 py-1 text-[#1a56db]">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CrmContactsPage() {
  const [subTab, setSubTab] = useState<ContactTab>("detailed");

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
