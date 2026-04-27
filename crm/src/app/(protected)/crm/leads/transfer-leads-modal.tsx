"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown, Download, Search, Upload, X } from "lucide-react";

const PRIMARY = "bg-[#1a56db] hover:bg-blue-700";

const fieldSelect = "w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2 pr-9 text-[13px] text-gray-700 shadow-sm outline-none transition-colors focus:border-[#1a56db]";
const labelClass = "mb-1.5 block text-[13px] font-bold text-gray-700";

const MOCK_AGENTS = ["Aman Dubey", "Ajay Jaiswal", "Sakshi Pagare", "Priya Jagtap"];
const MOCK_PROJECTS = ["Balaji Symphony", "Silver Heights", "Prime Towers", "Nerul Generic"];

function TlSelect({
  label,
  value,
  onChange,
  placeholder,
  options,
  requiredMark,
  hideLabel,
  ariaLabel,
  includeEmptyOption = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
  requiredMark?: boolean;
  hideLabel?: boolean;
  ariaLabel?: string;
  includeEmptyOption?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      {hideLabel ? (
        <>
          <label className={`${labelClass} text-transparent select-none`} aria-hidden="true">
            {label}
          </label>
          <span className="sr-only">{ariaLabel ?? label}</span>
        </>
      ) : (
        <label className={labelClass}>
          {label}
          {requiredMark ? <span className="text-red-500"> *</span> : null}
        </label>
      )}
      <div className="relative">
        <select
          suppressHydrationWarning
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={fieldSelect}
          aria-label={hideLabel ? (ariaLabel ?? label) : undefined}
        >
          {includeEmptyOption ? (
            <option value="">{placeholder}</option>
          ) : null}
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

function TlDateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex min-w-0 flex-col">
      <label className={labelClass}>{label}</label>
      <div className="flex overflow-hidden rounded border border-gray-300 shadow-sm">
        <input suppressHydrationWarning type="date" value={value} onChange={(e) => onChange(e.target.value)} className="min-w-0 flex-1 border-0 px-3 py-2 text-[13px] text-gray-800 outline-none" />
        <button suppressHydrationWarning type="button" tabIndex={-1} className="border-l border-gray-300 bg-gray-50 px-2.5 text-gray-600 hover:bg-gray-100" aria-label="Calendar">
          <CalendarDays className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function TransferLeadsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [unassigned, setUnassigned] = useState("UnAssigned");
  const [filterAgent, setFilterAgent] = useState("");
  const [filterStage, setFilterStage] = useState("");
  const [leadDateType, setLeadDateType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [source, setSource] = useState("");
  const [project, setProject] = useState("");
  const [leftSearch, setLeftSearch] = useState("");
  const [leftPageSize, setLeftPageSize] = useState("50");

  const [fromAgent, setFromAgent] = useState("");
  const [toAgent, setToAgent] = useState("");
  const [transferStage, setTransferStage] = useState("");
  const [transferProject, setTransferProject] = useState("");
  const [transferPendingTasks, setTransferPendingTasks] = useState(false);

  const leadPickCount = 0;
  const transferPreviewCount = 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 md:p-6" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-leads-title"
        className="flex max-h-[min(92vh,900px)] w-full max-w-[min(1320px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-md border border-gray-100 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3 md:px-6">
          <h2 id="transfer-leads-title" className="text-lg font-semibold text-gray-800">
            Transfer Leads
          </h2>
          <button suppressHydrationWarning type="button" onClick={onClose} className="rounded border border-gray-400 p-1 text-gray-600 hover:bg-gray-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
            {/* Left: lead selection */}
            <div className="rounded-md border border-gray-100 bg-white p-4 shadow-sm">
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <TlSelect
                    label="Assignment"
                    hideLabel
                    ariaLabel="UnAssigned filter"
                    includeEmptyOption={false}
                    value={unassigned}
                    onChange={setUnassigned}
                    placeholder=""
                    options={["UnAssigned", "Assigned", "All"]}
                  />
                  <TlSelect label="Sales Agent" value={filterAgent} onChange={setFilterAgent} placeholder="Select Sales Agent" options={MOCK_AGENTS} />
                  <TlSelect label="Lead Stage" value={filterStage} onChange={setFilterStage} placeholder="Select Lead Stage" options={["New", "Follow Up", "Prospect", "Booked"]} />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <TlSelect label="Lead Date" value={leadDateType} onChange={setLeadDateType} placeholder="Lead Date" options={["Created Date", "Assigned Date", "Last Activity"]} />
                  <TlDateField label="Select From Date" value={fromDate} onChange={setFromDate} />
                  <TlDateField label="Select To Date" value={toDate} onChange={setToDate} />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                  <div className="min-w-[160px] flex-1 sm:max-w-[200px]">
                    <TlSelect label="Source" value={source} onChange={setSource} placeholder="Select Source" options={["FB", "IG", "Walk-in", "Other"]} />
                  </div>
                  <div className="min-w-[180px] flex-1 sm:max-w-[240px]">
                    <TlSelect label="Project" value={project} onChange={setProject} placeholder="Search & Select Project" options={MOCK_PROJECTS} />
                  </div>
                  <div className="flex flex-wrap gap-2 sm:ml-auto">
                    <button suppressHydrationWarning type="button" className={`rounded px-4 py-2 text-[13px] font-medium text-white ${PRIMARY}`}>
                      Apply
                    </button>
                    <button suppressHydrationWarning type="button" className="rounded border border-gray-300 bg-white px-4 py-2 text-[13px] font-medium text-[#1a56db] shadow-sm hover:bg-gray-50">
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-gray-100 pt-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-gray-800">Leads ({leadPickCount})</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex overflow-hidden rounded border border-gray-300 text-sm shadow-sm">
                      <button suppressHydrationWarning type="button" className="border-r border-gray-300 bg-gray-50 px-3 py-1.5 text-gray-500 hover:bg-gray-100">
                        Previous
                      </button>
                      <button suppressHydrationWarning type="button" className="border-r border-[#1a56db] bg-[#1a56db] px-3 py-1.5 text-white">
                        1
                      </button>
                      <button suppressHydrationWarning type="button" className="px-3 py-1.5 text-[#1a56db] hover:bg-blue-50">
                        Next
                      </button>
                    </div>
                    <div className="flex overflow-hidden rounded border border-gray-300 shadow-sm">
                      <input suppressHydrationWarning value={leftSearch} onChange={(e) => setLeftSearch(e.target.value)} placeholder="Search" className="w-36 px-2.5 py-1.5 text-sm text-gray-700 outline-none md:w-40" />
                      <button suppressHydrationWarning type="button" className="flex items-center justify-center bg-[#5978de] px-2.5 text-white hover:bg-blue-600" aria-label="Search">
                        <Search className="h-4 w-4" />
                      </button>
                      <button suppressHydrationWarning type="button" className="flex items-center justify-center border-l border-gray-300 bg-gray-100 px-2.5 text-gray-500 hover:bg-gray-200" aria-label="Clear">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="relative">
                      <select suppressHydrationWarning value={leftPageSize} onChange={(e) => setLeftPageSize(e.target.value)} className="w-16 appearance-none rounded border border-gray-300 bg-white py-1.5 pl-2 pr-7 text-sm text-gray-700 shadow-sm outline-none">
                        <option>50</option>
                        <option>20</option>
                        <option>100</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded border border-gray-200">
                  <table className="w-full min-w-[720px] text-left text-sm text-gray-700">
                    <thead className="border-b border-gray-200 bg-white text-[11px] font-bold uppercase tracking-wide text-gray-700">
                      <tr>
                        <th className="border-r border-gray-100 px-3 py-2.5">SR NO.</th>
                        <th className="border-r border-gray-100 px-3 py-2.5">Name</th>
                        <th className="border-r border-gray-100 px-3 py-2.5">Sales Agent</th>
                        <th className="border-r border-gray-100 px-3 py-2.5">Co-Owners</th>
                        <th className="border-r border-gray-100 px-3 py-2.5">Contact No.</th>
                        <th className="border-r border-gray-100 px-3 py-2.5">Project</th>
                        <th className="border-r border-gray-100 px-3 py-2.5">Source</th>
                        <th className="px-3 py-2.5">Transfer</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-sm text-gray-500">
                          No Data Found
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right: transfer config + preview */}
            <div className="flex flex-col gap-5">
              <div className="rounded-md border border-gray-100 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TlSelect label="From" value={fromAgent} onChange={setFromAgent} placeholder="Select Sales Agent" options={MOCK_AGENTS} />
                  <TlSelect label="To" value={toAgent} onChange={setToAgent} placeholder="Select Sales Agent" options={MOCK_AGENTS} requiredMark />
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TlSelect label="Lead Stage" value={transferStage} onChange={setTransferStage} placeholder="Select Lead Stage" options={["New", "Follow Up", "Prospect", "Booked"]} />
                  <TlSelect label="Project" value={transferProject} onChange={setTransferProject} placeholder="Search & Select Project" options={MOCK_PROJECTS} />
                </div>
                <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-t border-gray-100 pt-4">
                  <div className="min-w-0 max-w-[85%]">
                    <p className="text-[13px] font-bold text-gray-800">Transfer pending tasks</p>
                    <p className="mt-1 text-xs leading-snug text-gray-500">(If pending task are not transfered it will be auto marked as completed)</p>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 pt-0.5">
                    <input suppressHydrationWarning type="checkbox" checked={transferPendingTasks} onChange={(e) => setTransferPendingTasks(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#1a56db] focus:ring-[#1a56db]" />
                    <span className="sr-only">Transfer pending tasks</span>
                  </label>
                </div>
                <div className="mt-4 flex justify-end">
                  <button suppressHydrationWarning type="button" className={`rounded px-6 py-2 text-sm font-medium text-white ${PRIMARY}`}>
                    Transfer
                  </button>
                </div>
              </div>

              <div className="rounded-md border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-gray-800">Transfer Leads ({transferPreviewCount})</h3>
                  <div className="flex items-center gap-2">
                    <button suppressHydrationWarning type="button" className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 shadow-sm hover:bg-gray-50" title="Import" aria-label="Import">
                      <Upload className="h-4 w-4" />
                    </button>
                    <button suppressHydrationWarning type="button" className="flex items-center gap-1.5 rounded border border-[#1a56db] bg-white px-3 py-1.5 text-sm font-medium text-[#1a56db] shadow-sm hover:bg-blue-50">
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto rounded border border-gray-200">
                  <table className="w-full min-w-[640px] text-left text-sm text-gray-700">
                    <thead className="border-b border-gray-200 bg-white text-[11px] font-bold uppercase tracking-wide text-gray-700">
                      <tr>
                        <th className="border-r border-gray-100 px-3 py-2.5">Action</th>
                        <th className="border-r border-gray-100 px-3 py-2.5">SR NO.</th>
                        <th className="border-r border-gray-100 px-3 py-2.5">Name</th>
                        <th className="border-r border-gray-100 px-3 py-2.5">Sales Agent</th>
                        <th className="border-r border-gray-100 px-3 py-2.5">Co-Owners</th>
                        <th className="border-r border-gray-100 px-3 py-2.5">Contact No.</th>
                        <th className="border-r border-gray-100 px-3 py-2.5">Project</th>
                        <th className="px-3 py-2.5">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-sm text-gray-500">
                          No Data Found
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
