"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftRight,
  ArrowUpDown,
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  Filter,
  MoreVertical,
  RefreshCw,
  Search,
  Upload,
  type LucideIcon,
  User,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useLeads, useUsers } from "@/hooks/use-leads";

import { DetailedLeadDrawer } from "./detailed-lead-drawer";
import { BulkUploadModal } from "./bulk-upload-modal";
import { ExportLeadsModal } from "./export-leads-modal";
import { TransferLeadsModal } from "./transfer-leads-modal";

const PRIMARY = "bg-[#1a56db] hover:bg-blue-700";
const ORANGE_BTN = "bg-[#f97316] hover:bg-orange-600";

const STAGE_RING_TEMPLATE = [
  { key: "NEW LEAD", label: "NEW LEAD", color: "#2aa3ff" },
  { key: "OPEN", label: "OPEN", color: "#00d4d4" },
  { key: "FOLLOW UP", label: "FOLLOW UP", color: "#34d399" },
  { key: "CALL BACK", label: "CALL BACK", color: "#fb923c" },
  { key: "PROSPECT", label: "PROSPECT", color: "#f97316" },
  { key: "WORKABLE", label: "WORKABLE", color: "#0ea5e9" },
  { key: "ALREADY TAGGED", label: "ALREADY TAGGED", color: "#8b5cf6" },
  { key: "BOOKED", label: "BOOKED", color: "#2563eb" },
] as const;

/** Options for the Leads table “Select Advance Filter” control (reference CRM). */
const ADVANCED_FILTER_OPTIONS = [
  "Unassigned",
  "New",
  "Untouched",
  "No Reminder",
  "Returned Untouched",
  "Fresh",
  "Returning",
  "Over Due Leads",
] as const;

const MOCK_PROJECTS = ["Balaji Symphony", "Silver Heights", "Prime Towers", "Nerul Generic"];

const LEADS_MORE_ACTIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "sync", label: "Sync Leads", icon: RefreshCw },
  { id: "transfer", label: "Transfer Leads", icon: ArrowLeftRight },
  { id: "bulkUpload", label: "Bulk Upload", icon: Upload },
  { id: "bulkDownloadTask", label: "Bulk Download with Task", icon: Download },
  { id: "bulkDownload", label: "Bulk Download", icon: Download },
  { id: "bulkDownloadUpdate", label: "Bulk Download for Update", icon: Download },
  { id: "tableDownload", label: "Table Download", icon: Download },
];

const LEAD_ROWS = [
  {
    id: 15413,
    date: "Apr 22, 2026, 1:39 PM",
    assignedDate: "Apr 22, 2026, 1:40 PM",
    status: ["Delay - 2 Mins"],
    name: "Subhjit Chandra",
    phone: "+91-9831097756",
    stage: "Follow Up",
    reason: "-",
    source: "Ig",
    project: "Nerul Generic",
    tags: "Generic Residency",
    preSales: "-",
    sales: "Priya Jagtap",
    channel: "-",
    sourcing: "-",
    requirement: "-",
    location: "-",
    budget: "-",
    remark: "Nerul, \"City\": \"Navi Mu...",
    siteVisit: "-",
    lastActivity: "Apr 23, 2026",
    ethnicity: "-",
  },
  {
    id: 15516,
    date: "Apr 26, 2026, 11:04 AM",
    assignedDate: "Apr 26, 2026, 11:04 AM",
    status: ["New", "Delay - 1 Mins"],
    name: "Avinash Mandavkar",
    phone: "+91-9920191674",
    stage: "Prospect",
    reason: "Site Visit Proposed",
    source: "Fb",
    project: "Renucorp Generic",
    tags: "Generic",
    preSales: "-",
    sales: "Ajay Jaiswal",
    channel: "-",
    sourcing: "-",
    requirement: "-",
    location: "-",
    budget: "-",
    remark: "Panvel, \"City\": \"Mumb...",
    siteVisit: "-",
    lastActivity: "Apr 26, 2026",
    ethnicity: "-",
  },
  {
    id: 15512,
    date: "Apr 26, 2026, 8:48 AM",
    assignedDate: "Apr 26, 2026, 8:48 AM",
    status: ["New", "Delay - 6 Mins"],
    name: "Suniel Pradhan",
    phone: "+91-8369883426",
    stage: "Follow Up",
    reason: "-",
    source: "Fb",
    project: "Renucorp Generic",
    tags: "Generic",
    preSales: "-",
    sales: "Ajay Jaiswal",
    channel: "-",
    sourcing: "-",
    requirement: "-",
    location: "-",
    budget: "-",
    remark: "Panvel, \"City\": \"Mumb...",
    siteVisit: "-",
    lastActivity: "Apr 26, 2026",
    ethnicity: "-",
  },
  {
    id: 15402,
    date: "Apr 21, 2026, 7:01 PM",
    assignedDate: "Apr 21, 2026, 7:37 PM",
    status: ["Delay - 16 Hours"],
    name: "Ravi Singh",
    phone: "+91-8299071826",
    stage: "Follow Up",
    reason: "-",
    source: "Ig",
    project: "Nerul Generic",
    tags: "Generic Residency",
    preSales: "-",
    sales: "Priya Jagtap",
    channel: "-",
    sourcing: "-",
    requirement: "-",
    location: "-",
    budget: "-",
    remark: "Nerul, \"Your_prefered...",
    siteVisit: "-",
    lastActivity: "Apr 26, 2026",
    ethnicity: "-",
  },
];

type LeadApiRow = {
  id: string;
  createdAt: string;
  leadNumber?: string | null;
  leadDate?: string | null;
  assignedDate?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  source: string;
  subSource?: string | null;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED";
  stageLabel?: string | null;
  stageReason?: string | null;
  projectNames?: string | null;
  campaignName?: string | null;
  presalesUserName?: string | null;
  channelPartnerName?: string | null;
  sourcingManager?: string | null;
  location?: string | null;
  subLocation?: string | null;
  minBudget?: number | null;
  maxBudget?: number | null;
  remark?: string | null;
  lastActivity?: string | null;
  lastActivityDate?: string | null;
  ethnicity?: string | null;
  returningCount?: number | null;
  pendingTaskCount?: number | null;
  assignedTo?: { id: string; name: string; email: string } | null;
  campaign?: { id: string; name: string; source: string } | null;
};

type UserApiRow = {
  id: string;
  name: string;
  email: string;
  role: string;
};

function Donut({ total, segments }: { total: number; segments: { ringPct: number; color: string }[] }) {
  let acc = 0;
  const gradient = segments
    .map((s) => {
      const start = acc;
      acc += s.ringPct;
      return `${s.color} ${(start / 100) * 360}deg ${(acc / 100) * 360}deg`;
    })
    .join(", ");

  return (
    <div className="flex items-center gap-4">
      <div
        className="h-[100px] w-[100px] rounded-full"
        style={{
          background: `conic-gradient(${gradient})`,
          mask: "radial-gradient(farthest-side, transparent calc(58% - 1px), #000 58%)",
          WebkitMask: "radial-gradient(farthest-side, transparent calc(58% - 1px), #000 58%)",
        }}
      />
      <div>
        <p className="text-xl font-semibold leading-none text-gray-700">{total.toLocaleString()}</p>
        <p className="text-sm font-medium text-gray-500">Total</p>
      </div>
    </div>
  );
}

function LeadMetricCard({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="relative flex flex-col py-2 pl-4 pr-2">
      <div className="absolute bottom-0 left-0 top-0 w-1.5 bg-[#1a56db]" />
      <div className="flex items-start justify-between">
        <div className="min-w-0 pr-2">
          <p className="mb-2 text-[15px] font-medium text-gray-600">{title}</p>
          <p className="text-xl font-semibold text-gray-700">{value}</p>
          <p className="mt-1 text-xs leading-snug text-gray-500">{note}</p>
        </div>
        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e5efff] text-blue-500 shadow-sm">
          <User className="h-5 w-5 fill-current" />
        </div>
      </div>
    </div>
  );
}

function StatusPill({ text }: { text: string }) {
  const isNew = text.toLowerCase() === "new";
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold text-white ${isNew ? "bg-[#1a56db]" : "bg-[#ef4444]"}`}>
      {text}
    </span>
  );
}

function QlTextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "tel";
}) {
  return (
    <div className="flex flex-col">
      <label className="mb-1.5 text-[13px] font-bold text-gray-700">{label}</label>
      <input suppressHydrationWarning
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none transition-colors focus:border-[#1a56db]"
      />
    </div>
  );
}

function QlSelectField({
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
    <div className="flex flex-col">
      <label className="mb-1.5 text-[13px] font-bold text-gray-700">{label}</label>
      <div className="relative">
        <select suppressHydrationWarning
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2 pr-9 text-[13px] text-gray-700 shadow-sm outline-none transition-colors focus:border-[#1a56db]"
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

const LEAD_QUALITY_OPTS = [
  { value: "Cold", dotClass: "bg-blue-500" },
  { value: "Warm", dotClass: "bg-orange-500" },
  { value: "Hot", dotClass: "bg-red-500" },
] as const;

function LeadQualityPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const selected = LEAD_QUALITY_OPTS.find((o) => o.value === value);

  return (
    <div className="flex flex-col" ref={wrapRef}>
      <span className="mb-1.5 text-[13px] font-bold text-gray-700">Lead Quality</span>
      <div className="relative">
        <button suppressHydrationWarning
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded border border-gray-300 bg-white px-3 py-2 text-left text-[13px] text-gray-700 shadow-sm outline-none transition-colors focus:border-[#1a56db]"
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className="flex items-center gap-2">
            {selected ? (
              <>
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${selected.dotClass}`} aria-hidden />
                {selected.value}
              </>
            ) : (
              <span className="text-gray-500">Select Lead Quality</span>
            )}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        </button>
        {open ? (
          <ul
            role="listbox"
            className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
          >
            {LEAD_QUALITY_OPTS.map((opt) => (
              <li key={opt.value}>
                <button suppressHydrationWarning
                  type="button"
                  role="option"
                  aria-selected={value === opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-gray-800 hover:bg-blue-50"
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${opt.dotClass}`} aria-hidden />
                  {opt.value}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function QuickLeadModal({
  open,
  onClose,
  agentOptions,
  projectOptions,
  onSubmit,
  isSubmitting,
  submitError,
}: {
  open: boolean;
  onClose: () => void;
  agentOptions: { label: string; value: string }[];
  projectOptions: string[];
  onSubmit: (payload: { name: string; phone: string; source: string; assignedToId?: string }) => void;
  isSubmitting: boolean;
  submitError?: string;
}) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [altMobile, setAltMobile] = useState("");
  const [requirement, setRequirement] = useState("");
  const [subRequirement, setSubRequirement] = useState("");
  const [budget, setBudget] = useState("");
  const [source, setSource] = useState("");
  const [leadQuality, setLeadQuality] = useState("");
  const [project, setProject] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-lead-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-md border border-gray-100 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 id="quick-lead-title" className="text-lg font-semibold text-gray-800">
            Quick Lead
          </h2>
          <button suppressHydrationWarning
            type="button"
            onClick={onClose}
            className="rounded border border-gray-400 p-1 text-gray-600 transition-colors hover:bg-gray-100"
            aria-label="Close quick lead"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-140px)] overflow-y-auto px-5 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-5 md:gap-y-4">
            <QlTextField label="Customer Name" value={customerName} onChange={setCustomerName} placeholder="Customer Name" />
            <QlTextField label="Phone" value={phone} onChange={setPhone} placeholder="Phone" type="tel" />
            <QlTextField label="Alternate Mobile" value={altMobile} onChange={setAltMobile} placeholder="Alternate Mobile" type="tel" />
            <QlSelectField
              label="Requirement"
              value={requirement}
              onChange={setRequirement}
              placeholder="Select Requirement"
              options={["1 BHK", "2 BHK", "3 BHK", "4+ BHK", "Plot / Land", "Commercial"]}
            />
            <QlSelectField
              label="Sub Requirement"
              value={subRequirement}
              onChange={setSubRequirement}
              placeholder="Select Sub Requirement"
              options={["Corner unit", "Garden facing", "Sea view", "High floor", "Parking"]}
            />
            <QlSelectField
              label="Budget"
              value={budget}
              onChange={setBudget}
              placeholder="Select Budget"
              options={["Under 50L", "50L – 75L", "75L – 1Cr", "1Cr – 1.5Cr", "1.5Cr+"]}
            />
            <QlSelectField
              label="Source"
              value={source}
              onChange={setSource}
              placeholder="Select Source"
              options={["FB", "IG", "Walk-in", "Magicbricks", "Channel Partner", "Other"]}
            />
            <div className="md:col-span-1">
              <LeadQualityPicker value={leadQuality} onChange={setLeadQuality} />
            </div>
            <QlSelectField
              label="Project"
              value={project}
              onChange={setProject}
              placeholder="Search & Select Project"
              options={projectOptions}
            />
            <QlSelectField
              label="Assigned to"
              value={assignedTo}
              onChange={setAssignedTo}
              placeholder="Select Sales Agent"
              options={agentOptions.map((a) => a.label)}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 bg-white px-5 py-4">
          {submitError ? <p className="mb-2 text-sm text-red-600">{submitError}</p> : null}
          <div className="flex justify-end gap-2">
          <button suppressHydrationWarning
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button suppressHydrationWarning
            type="button"
            onClick={() => {
              if (!customerName.trim() || !phone.trim() || !source.trim()) return;
              const assigned = agentOptions.find((a) => a.label === assignedTo);
              onSubmit({
                name: customerName.trim(),
                phone: phone.trim(),
                source: source.trim(),
                assignedToId: assigned?.value,
              });
            }}
            disabled={isSubmitting}
            className={`rounded px-5 py-2 text-sm font-medium text-white transition-colors ${PRIMARY}`}
          >
            {isSubmitting ? "Saving..." : "Submit"}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CrmLeadsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [quickLeadOpen, setQuickLeadOpen] = useState(false);
  const [detailedLeadOpen, setDetailedLeadOpen] = useState(false);
  const [leadMoreOpen, setLeadMoreOpen] = useState(false);
  const [transferLeadsOpen, setTransferLeadsOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [exportLeadsOpen, setExportLeadsOpen] = useState(false);
  const [leadStageAnalysisVisible, setLeadStageAnalysisVisible] = useState(true);
  const queryClient = useQueryClient();
  const leadsQuery = useLeads({ page, pageSize });
  const usersQuery = useUsers();
  const addMenuRef = useRef<HTMLDivElement>(null);
  const leadMoreRef = useRef<HTMLDivElement>(null);

  const createLeadMutation = useMutation({
    mutationFn: async (payload: { name: string; phone: string; source: string; assignedToId?: string }) => {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to create lead" }));
        throw new Error(err?.message || "Failed to create lead");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setQuickLeadOpen(false);
    },
  });

  const agentOptions = ((usersQuery.data?.users as UserApiRow[] | undefined) ?? []).map((u) => ({
    label: u.name,
    value: u.id,
  }));

  const dbLeads = ((leadsQuery.data?.leads as LeadApiRow[] | undefined) ?? []).map((lead) => ({
    id: lead.leadNumber || lead.id.slice(-6),
    date: lead.leadDate ? new Date(lead.leadDate).toLocaleString() : new Date(lead.createdAt).toLocaleString(),
    assignedDate: lead.assignedDate
      ? new Date(lead.assignedDate).toLocaleString()
      : new Date(lead.createdAt).toLocaleString(),
    status: [lead.status === "NEW" ? "New" : lead.status, ...(lead.pendingTaskCount ? [`Delay - ${lead.pendingTaskCount}`] : [])],
    name: lead.name,
    phone: lead.phone,
    stage: lead.stageLabel || (lead.status === "NEW" ? "New Lead" : lead.status.replace("_", " ")),
    reason: lead.stageReason || "-",
    source: lead.source,
    project: lead.projectNames || lead.campaignName || lead.campaign?.name || "-",
    tags: lead.subSource || lead.campaign?.source || "-",
    preSales: lead.presalesUserName || "-",
    sales: lead.assignedTo?.name ?? "-",
    channel: lead.channelPartnerName || "-",
    sourcing: lead.sourcingManager || "-",
    requirement: "-",
    location: lead.subLocation || lead.location || "-",
    budget:
      lead.minBudget || lead.maxBudget
        ? `${lead.minBudget ? Number(lead.minBudget).toLocaleString() : "0"} - ${lead.maxBudget ? Number(lead.maxBudget).toLocaleString() : "0"}`
        : "-",
    remark: lead.remark || lead.email || "-",
    siteVisit: "-",
    lastActivity: lead.lastActivityDate
      ? new Date(lead.lastActivityDate).toLocaleDateString()
      : lead.lastActivity || new Date(lead.createdAt).toLocaleDateString(),
    ethnicity: lead.ethnicity || "-",
    returningCount: lead.returningCount ?? 0,
    pendingTaskCount: lead.pendingTaskCount ?? 0,
  }));

  const visibleLeadRows = dbLeads;
  const pagination = leadsQuery.data?.pagination as
    | { page: number; pageSize?: number; limit?: number; total: number; totalPages: number }
    | undefined;
  const totalLeads = pagination?.total ?? visibleLeadRows.length;
  const totalPages = pagination?.totalPages ?? 1;

  const stageRing = useMemo(() => {
    const total = dbLeads.length || 1;
    return STAGE_RING_TEMPLATE.map((stage) => {
      const value = dbLeads.filter((lead) => lead.stage.toUpperCase() === stage.key).length;
      return {
        ...stage,
        value,
        displayPct: Number(((value / total) * 100).toFixed(2)),
        ringPct: Math.max(1, Math.round((value / total) * 100)),
      };
    });
  }, [dbLeads]);

  const summaryCards = useMemo(
    () => [
      {
        title: "Untouched Leads",
        value: dbLeads.filter((lead) => lead.stage.toUpperCase() === "NEW LEAD").length,
        note: "Leads claimed but not contacted",
      },
      {
        title: "No Followps Leads",
        value: dbLeads.filter((lead) => !lead.lastActivity || lead.lastActivity === "-").length,
        note: "Contacted but no future followups",
      },
      {
        title: "Returning Leads",
        value: dbLeads.filter((lead) => (lead.returningCount ?? 0) > 0).length,
        note: "Leads returning again",
      },
      {
        title: "Returning No FollowUp Leads",
        value: dbLeads.filter((lead) => (lead.returningCount ?? 0) > 0 && (!lead.lastActivity || lead.lastActivity === "-")).length,
        note: "Returned leads but no future followups",
      },
      {
        title: "Over Due Task Leads",
        value: dbLeads.filter((lead) => lead.status.some((s) => s.toLowerCase().includes("delay"))).length,
        note: "Leads with overdue followups",
      },
    ],
    [dbLeads],
  );

  useEffect(() => {
    if (!addMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [addMenuOpen]);

  useEffect(() => {
    if (!leadMoreOpen) return;
    const onDown = (e: MouseEvent) => {
      if (leadMoreRef.current && !leadMoreRef.current.contains(e.target as Node)) {
        setLeadMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [leadMoreOpen]);

  return (
    <>
    <div className="min-h-screen bg-[#f4f7f6] p-4 font-sans text-gray-800 md:p-6">
      <div className="space-y-6 pb-6">
        {leadStageAnalysisVisible ? (
          <section className="overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 p-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
              <h2 className="text-lg font-semibold text-gray-700">Lead Stage Analysis</h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[200px]">
                  <select suppressHydrationWarning className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm outline-none">
                    <option>Active Lead</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="relative min-w-[200px]">
                  <select suppressHydrationWarning className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-500 shadow-sm outline-none">
                    <option>Select Team</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="relative min-w-[200px]">
                  <select suppressHydrationWarning className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-500 shadow-sm outline-none">
                    <option>Select Sales Agent</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
                <Donut total={dbLeads.length} segments={stageRing} />
                <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                  {stageRing.map((s) => (
                    <div key={s.label} className="border-l-2 pl-2" style={{ borderColor: s.color }}>
                      <p className="text-xl font-semibold leading-none text-gray-700">{s.value}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-600">{s.label}</p>
                      <p className="text-xs text-gray-500">{s.displayPct}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="grid grid-cols-1 gap-4 rounded-md border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
          {summaryCards.map((card) => (
            <LeadMetricCard key={card.title} title={card.title} value={String(card.value)} note={card.note} />
          ))}
        </section>

        <section className="overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 p-4">
            <h3 className="text-lg font-semibold text-gray-700">Leads ( {totalLeads} )</h3>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] max-w-[260px]">
                <select suppressHydrationWarning
                  className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-1.5 text-[13px] text-gray-700 shadow-sm outline-none"
                  defaultValue=""
                  aria-label="Select advance filter"
                >
                  <option value="" className="text-gray-500">
                    Select Advance Filter
                  </option>
                  {ADVANCED_FILTER_OPTIONS.map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
              <div className="relative" ref={addMenuRef}>
                <button suppressHydrationWarning
                  type="button"
                  onClick={() => setAddMenuOpen((o) => !o)}
                  className={`inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-sm font-medium text-white transition-colors ${PRIMARY}`}
                  aria-expanded={addMenuOpen}
                  aria-haspopup="menu"
                >
                  Add
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-95" />
                </button>
                {addMenuOpen ? (
                  <div
                    role="menu"
                    className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-md border border-gray-200 bg-white py-1 shadow-lg"
                  >
                    <button suppressHydrationWarning
                      type="button"
                      role="menuitem"
                      className="block w-full px-4 py-2.5 text-left text-[13px] text-gray-700 transition-colors hover:bg-blue-50"
                      onClick={() => {
                        setAddMenuOpen(false);
                        setDetailedLeadOpen(false);
                        setQuickLeadOpen(true);
                      }}
                    >
                      Quick Lead
                    </button>
                    <button suppressHydrationWarning
                      type="button"
                      role="menuitem"
                      className="block w-full px-4 py-2.5 text-left text-[13px] text-gray-700 transition-colors hover:bg-blue-50"
                      onClick={() => {
                        setAddMenuOpen(false);
                        setQuickLeadOpen(false);
                        setDetailedLeadOpen(true);
                      }}
                    >
                      Detailed Lead
                    </button>
                  </div>
                ) : null}
              </div>
              <div ref={leadMoreRef} className="relative z-30">
                <button suppressHydrationWarning
                  type="button"
                  onClick={() => setLeadMoreOpen((o) => !o)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded border border-[#1a56db] shadow-sm transition-colors",
                    leadMoreOpen ? "bg-[#1a56db] text-white hover:bg-blue-800" : "bg-white text-[#1a56db] hover:bg-blue-50",
                  )}
                  aria-expanded={leadMoreOpen}
                  aria-haspopup="menu"
                  aria-label="More lead actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {leadMoreOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-1 min-w-[260px] rounded-md border border-gray-200 bg-white py-1 shadow-lg"
                  >
                    {LEADS_MORE_ACTIONS.map(({ id, label, icon: Icon }) => (
                      <button suppressHydrationWarning
                        key={id}
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-blue-50"
                        onClick={() => {
                          setLeadMoreOpen(false);
                          if (id === "transfer") setTransferLeadsOpen(true);
                          if (id === "bulkUpload") setBulkUploadOpen(true);
                          if (id === "tableDownload") setExportLeadsOpen(true);
                        }}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-gray-600" aria-hidden />
                        {label}
                      </button>
                    ))}
                    <button suppressHydrationWarning
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-blue-50"
                      onClick={() => {
                        setLeadStageAnalysisVisible((v) => !v);
                        setLeadMoreOpen(false);
                      }}
                    >
                      {leadStageAnalysisVisible ? (
                        <EyeOff className="h-4 w-4 shrink-0 text-gray-600" aria-hidden />
                      ) : (
                        <Eye className="h-4 w-4 shrink-0 text-gray-600" aria-hidden />
                      )}
                      {leadStageAnalysisVisible ? "Hide Lead Stage Analysis" : "Show Lead Stage Analysis"}
                    </button>
                  </div>
                ) : null}
              </div>
              <button suppressHydrationWarning className={`flex h-8 w-8 items-center justify-center rounded text-white ${ORANGE_BTN}`}>
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 p-4">
            <div className="flex overflow-hidden rounded border border-gray-300 text-sm shadow-sm">
              <button
                suppressHydrationWarning
                className="border-r border-gray-300 bg-gray-50 px-3 py-1.5 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button suppressHydrationWarning className="border-r border-[#1a56db] bg-[#1a56db] px-3 py-1.5 text-white">
                {page}
              </button>
              <button
                suppressHydrationWarning
                className="px-3 py-1.5 text-[#1a56db] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
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
              <button suppressHydrationWarning className="flex h-8 w-8 items-center justify-center rounded border border-[#1a56db] bg-white text-[#1a56db] hover:bg-blue-50">
                <ArrowUpDown className="h-3.5 w-3.5" />
              </button>
              <div className="flex overflow-hidden rounded border border-gray-300 shadow-sm">
                <input suppressHydrationWarning placeholder="Search" className="w-48 px-3 py-1.5 text-sm text-gray-600 outline-none" />
                <button suppressHydrationWarning type="button" className="flex items-center justify-center bg-[#5978de] px-3 py-1.5 text-white transition-colors hover:bg-blue-600">
                  <Search className="h-4 w-4" />
                </button>
                <button suppressHydrationWarning type="button" className="flex items-center justify-center border-l border-gray-300 bg-gray-100 px-3 py-1.5 text-gray-500 transition-colors hover:bg-gray-200">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="relative">
                <select
                  suppressHydrationWarning
                  className="w-16 appearance-none rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm outline-none"
                  value={pageSize}
                  onChange={(e) => {
                    setPage(1);
                    setPageSize(Number(e.target.value));
                  }}
                >
                  {[20, 50, 100, 200].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="min-h-[200px] overflow-x-auto">
            <table className="w-full min-w-[2400px] text-left text-sm whitespace-nowrap text-gray-700">
              <thead className="border-b border-gray-200 bg-white text-[12px] font-bold uppercase tracking-wide text-gray-700">
                <tr>
                  <th className="w-10 border-r border-gray-100 px-4 py-3">
                    <input suppressHydrationWarning type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="border-r border-gray-100 px-4 py-3">#</th>
                  <th className="border-r border-gray-100 px-4 py-3">Lead ID</th>
                  <th className="border-r border-gray-100 px-4 py-3">Date</th>
                  <th className="border-r border-gray-100 px-4 py-3">Assigned Date</th>
                  <th className="border-r border-gray-100 px-4 py-3">Status</th>
                  <th className="border-r border-gray-100 px-4 py-3">Name</th>
                  <th className="border-r border-gray-100 px-4 py-3">Primary No</th>
                  <th className="border-r border-gray-100 px-4 py-3">Lead Stage</th>
                  <th className="border-r border-gray-100 px-4 py-3">Stage Reason</th>
                  <th className="border-r border-gray-100 px-4 py-3">Source</th>
                  <th className="border-r border-gray-100 px-4 py-3">Project</th>
                  <th className="border-r border-gray-100 px-4 py-3">Tags</th>
                  <th className="border-r border-gray-100 px-4 py-3">Pre Sales Agent</th>
                  <th className="border-r border-gray-100 px-4 py-3">Sales Agent</th>
                  <th className="border-r border-gray-100 px-4 py-3">Channel Partner</th>
                  <th className="border-r border-gray-100 px-4 py-3">Sourcing Manager</th>
                  <th className="border-r border-gray-100 px-4 py-3">Requirement</th>
                  <th className="border-r border-gray-100 px-4 py-3">Sub Location</th>
                  <th className="border-r border-gray-100 px-4 py-3">Budget</th>
                  <th className="border-r border-gray-100 px-4 py-3">Remark</th>
                  <th className="border-r border-gray-100 px-4 py-3">Site Visit</th>
                  <th className="border-r border-gray-100 px-4 py-3">Last Activity</th>
                  <th className="border-r border-gray-100 px-4 py-3">Ethnicity</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleLeadRows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="border-r border-gray-100 px-4 py-3">
                      <input suppressHydrationWarning type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="border-r border-gray-100 px-4 py-3">{idx + 1}</td>
                    <td className="border-r border-gray-100 px-4 py-3">{row.id}</td>
                    <td className="border-r border-gray-100 px-4 py-3 whitespace-nowrap">{row.date}</td>
                    <td className="border-r border-gray-100 px-4 py-3 whitespace-nowrap">{row.assignedDate}</td>
                    <td className="border-r border-gray-100 px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {row.status.map((s) => (
                          <StatusPill key={s} text={s} />
                        ))}
                      </div>
                    </td>
                    <td className="border-r border-gray-100 px-4 py-3">
                      <a href="#" className="text-[#1a56db] underline">
                        {row.name}
                      </a>
                    </td>
                    <td className="border-r border-gray-100 px-4 py-3 whitespace-nowrap">{row.phone}</td>
                    <td className="border-r border-gray-100 px-4 py-3">{row.stage}</td>
                    <td className="border-r border-gray-100 px-4 py-3">{row.reason}</td>
                    <td className="border-r border-gray-100 px-4 py-3">{row.source}</td>
                    <td className="border-r border-gray-100 px-4 py-3">{row.project}</td>
                    <td className="border-r border-gray-100 px-4 py-3">{row.tags}</td>
                    <td className="border-r border-gray-100 px-4 py-3">{row.preSales}</td>
                    <td className="border-r border-gray-100 px-4 py-3">{row.sales}</td>
                    <td className="border-r border-gray-100 px-4 py-3">{row.channel}</td>
                    <td className="border-r border-gray-100 px-4 py-3">{row.sourcing}</td>
                    <td className="border-r border-gray-100 px-4 py-3">{row.requirement}</td>
                    <td className="border-r border-gray-100 px-4 py-3">{row.location}</td>
                    <td className="border-r border-gray-100 px-4 py-3">{row.budget}</td>
                    <td className="max-w-[220px] truncate border-r border-gray-100 px-4 py-3" title={row.remark}>
                      {row.remark}
                    </td>
                    <td className="border-r border-gray-100 px-4 py-3">{row.siteVisit}</td>
                    <td className="border-r border-gray-100 px-4 py-3">{row.lastActivity}</td>
                    <td className="border-r border-gray-100 px-4 py-3">{row.ethnicity}</td>
                    <td className="px-4 py-3">
                      <button suppressHydrationWarning className="flex h-6 w-6 items-center justify-center rounded bg-[#1a56db] text-white hover:bg-blue-700">
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
                {!leadsQuery.isLoading && visibleLeadRows.length === 0 ? (
                  <tr>
                    <td colSpan={25} className="px-4 py-10 text-center text-sm text-gray-500">
                      No leads found in database. Import your Excel and refresh.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
    <QuickLeadModal
      open={quickLeadOpen}
      onClose={() => setQuickLeadOpen(false)}
      agentOptions={agentOptions}
      projectOptions={MOCK_PROJECTS}
      isSubmitting={createLeadMutation.isPending}
      submitError={createLeadMutation.error instanceof Error ? createLeadMutation.error.message : undefined}
      onSubmit={(payload) => createLeadMutation.mutate(payload)}
    />
    <DetailedLeadDrawer open={detailedLeadOpen} onClose={() => setDetailedLeadOpen(false)} />
    <TransferLeadsModal open={transferLeadsOpen} onClose={() => setTransferLeadsOpen(false)} />
    <BulkUploadModal open={bulkUploadOpen} onClose={() => setBulkUploadOpen(false)} />
    <ExportLeadsModal open={exportLeadsOpen} onClose={() => setExportLeadsOpen(false)} />
    </>
  );
}
