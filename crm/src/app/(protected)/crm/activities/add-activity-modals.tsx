"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, X } from "lucide-react";

import { cn } from "@/lib/utils";

const PRIMARY = "rounded-md bg-[#1a56db] px-5 py-2 text-sm font-medium text-white hover:bg-blue-700";
const CANCEL_BTN = "rounded-md bg-gray-200 px-5 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300";

const MOCK_LEADS = [
  "Subhjit Chandra",
  "Avinash Mandavkar",
  "Suniel Pradhan",
  "Ravi Singh",
  "Mohd Arif",
  "Vijay Patil",
] as const;

const EXECUTIVES = ["Aman Dubey", "Ajay Jaiswal", "Priya Jagtap", "Supriya Jadhav"] as const;

export type ActivityActionModalId = "completedTask" | "offlineCall" | "meeting";

function formatTitleDateTime(d: Date): string {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function ModalShell({
  open,
  titleId,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  titleId: string;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[min(92vh,760px)] w-full max-w-2xl flex-col overflow-hidden rounded-md border border-gray-100 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-gray-800">
            {title}
          </h2>
          <button
            suppressHydrationWarning
            type="button"
            onClick={onClose}
            className="rounded border border-gray-400 p-1 text-gray-600 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-gray-200 px-5 py-4">{footer}</div>
      </div>
    </div>
  );
}

function ModalSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-gray-700">{label}</label>
      <div className="relative">
        <select
          suppressHydrationWarning
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2 pr-9 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
        >
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

function ClearableSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-gray-700">{label}</label>
      <div className="relative">
        <select
          suppressHydrationWarning
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full appearance-none rounded border border-gray-300 bg-white py-2 pl-3 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]",
            value ? "pr-16" : "pr-9",
          )}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {value ? (
          <button
            suppressHydrationWarning
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onChange("");
            }}
            className="absolute right-8 top-1/2 z-[1] -translate-y-1/2 rounded p-0.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}

function DatetimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-gray-700">{label}</label>
      <div className="relative flex">
        <input
          suppressHydrationWarning
          ref={inputRef}
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 flex-1 rounded border border-gray-300 bg-white py-2 pl-3 pr-11 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
        />
        <button
          suppressHydrationWarning
          type="button"
          onClick={() => inputRef.current?.showPicker?.() ?? inputRef.current?.focus()}
          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
          aria-label="Open calendar"
        >
          <CalendarDays className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function SearchableLeadField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
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

  const filtered = MOCK_LEADS.filter((n) => n.toLowerCase().includes(value.toLowerCase()));

  return (
    <div className="flex flex-col gap-1.5" ref={wrapRef}>
      <span className="text-[13px] font-medium text-gray-700">
        Select Lead <span className="font-normal text-red-500">*required.</span>
      </span>
      <div className="relative">
        <input
          suppressHydrationWarning
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search & Select Lead"
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 pr-9 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
        />
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        {open && filtered.length > 0 ? (
          <ul
            className="absolute left-0 right-0 z-20 mt-1 max-h-44 overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
            role="listbox"
          >
            {filtered.map((name) => (
              <li key={name}>
                <button
                  suppressHydrationWarning
                  type="button"
                  className="w-full px-3 py-2 text-left text-[13px] text-gray-800 hover:bg-blue-50"
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function ModalFooter({ onSubmit, onCancel }: { onSubmit: () => void; onCancel: () => void }) {
  return (
    <>
      <button suppressHydrationWarning type="button" className={PRIMARY} onClick={onSubmit}>
        Submit
      </button>
      <button suppressHydrationWarning type="button" className={CANCEL_BTN} onClick={onCancel}>
        Cancel
      </button>
    </>
  );
}

const ACTIVITY_TYPES = ["Call", "Task", "Meeting", "Site Visit"] as const;
const ENTITY_TYPES = ["Lead", "Contact", "Channel Partner"] as const;
const LOCATION_TYPES = ["Office", "Site", "Client Location", "Virtual"] as const;

export function AddCompletedTaskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activityType, setActivityType] = useState("Call");
  const [executive, setExecutive] = useState("Aman Dubey");
  const [entityType, setEntityType] = useState("Lead");
  const [lead, setLead] = useState("");
  const [title, setTitle] = useState("");
  const [remark, setRemark] = useState("");
  const [dueDate, setDueDate] = useState("");

  const reset = useCallback(() => {
    const now = new Date();
    setActivityType("Call");
    setExecutive("Aman Dubey");
    setEntityType("Lead");
    setLead("");
    setRemark("");
    setDueDate(toDatetimeLocalValue(now));
    setTitle(`Call at ${formatTitleDateTime(now)}`);
  }, []);

  useEffect(() => {
    if (!open) return;
    reset();
  }, [open, reset]);

  useEffect(() => {
    if (!open || !dueDate) return;
    const d = new Date(dueDate);
    if (Number.isNaN(d.getTime())) return;
    setTitle(`${activityType} at ${formatTitleDateTime(d)}`);
  }, [activityType, dueDate, open]);

  return (
    <ModalShell
      open={open}
      titleId="add-completed-task-title"
      title="Add Completed Task"
      onClose={onClose}
      footer={<ModalFooter onSubmit={onClose} onCancel={onClose} />}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ModalSelect label="Select Activity Type" value={activityType} onChange={setActivityType} options={ACTIVITY_TYPES} />
          <ClearableSelect
            label="Select Executive"
            value={executive}
            onChange={setExecutive}
            options={EXECUTIVES}
            placeholder="Select Executive"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ClearableSelect
            label="Select Type"
            value={entityType}
            onChange={setEntityType}
            options={ENTITY_TYPES}
            placeholder="Select Type"
          />
          <SearchableLeadField value={lead} onChange={setLead} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700" htmlFor="act-task-title">
            Title
          </label>
          <input
            suppressHydrationWarning
            id="act-task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700" htmlFor="act-task-remark">
            Remark
          </label>
          <textarea
            suppressHydrationWarning
            id="act-task-remark"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Enter Remark"
            rows={4}
            className="w-full resize-y rounded border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
          />
        </div>
        <DatetimeField label="Select Due Date" value={dueDate} onChange={setDueDate} />
      </div>
    </ModalShell>
  );
}

export function AddOfflineCallModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [executive, setExecutive] = useState("Aman Dubey");
  const [entityType, setEntityType] = useState("Lead");
  const [lead, setLead] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [duration, setDuration] = useState("");

  const reset = useCallback(() => {
    const now = new Date();
    setExecutive("Aman Dubey");
    setEntityType("Lead");
    setLead("");
    setDueDate(toDatetimeLocalValue(now));
    setDuration("");
  }, []);

  useEffect(() => {
    if (!open) return;
    reset();
  }, [open, reset]);

  return (
    <ModalShell
      open={open}
      titleId="add-offline-call-title"
      title="Add Offline Call"
      onClose={onClose}
      footer={<ModalFooter onSubmit={onClose} onCancel={onClose} />}
    >
      <div className="space-y-4">
        <ClearableSelect
          label="Select Executive"
          value={executive}
          onChange={setExecutive}
          options={EXECUTIVES}
          placeholder="Select Executive"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ClearableSelect
            label="Select Type"
            value={entityType}
            onChange={setEntityType}
            options={ENTITY_TYPES}
            placeholder="Select Type"
          />
          <SearchableLeadField value={lead} onChange={setLead} />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DatetimeField label="Select Due Date" value={dueDate} onChange={setDueDate} />
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-700" htmlFor="offline-duration">
              Duration in Second&apos;s
            </label>
            <input
              suppressHydrationWarning
              id="offline-duration"
              type="text"
              inputMode="numeric"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Duration"
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
            />
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

export function AddMeetingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [executive, setExecutive] = useState("Aman Dubey");
  const [entityType, setEntityType] = useState("Lead");
  const [lead, setLead] = useState("");
  const [locationType, setLocationType] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [title, setTitle] = useState("");
  const [remark, setRemark] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const reset = useCallback(() => {
    const now = new Date();
    const out = new Date(now.getTime() + 30 * 60 * 1000);
    setExecutive("Aman Dubey");
    setEntityType("Lead");
    setLead("");
    setLocationType("");
    setLocationAddress("");
    setTitle(`Call at ${formatTitleDateTime(out)}`);
    setRemark("");
    setCheckIn(toDatetimeLocalValue(now));
    setCheckOut(toDatetimeLocalValue(out));
  }, []);

  useEffect(() => {
    if (!open) return;
    reset();
  }, [open, reset]);

  return (
    <ModalShell
      open={open}
      titleId="add-meeting-title"
      title="Add Meeting"
      onClose={onClose}
      footer={<ModalFooter onSubmit={onClose} onCancel={onClose} />}
    >
      <div className="space-y-4">
        <ClearableSelect
          label="Select Executive"
          value={executive}
          onChange={setExecutive}
          options={EXECUTIVES}
          placeholder="Select Executive"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ClearableSelect
            label="Select Type"
            value={entityType}
            onChange={setEntityType}
            options={ENTITY_TYPES}
            placeholder="Select Type"
          />
          <SearchableLeadField value={lead} onChange={setLead} />
        </div>
        <div className="rounded-md border border-gray-300 bg-gray-50/80 p-4 space-y-4">
          <ClearableSelect
            label="Select Location Type"
            value={locationType}
            onChange={setLocationType}
            options={LOCATION_TYPES}
            placeholder="Select LocationType"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-700" htmlFor="meeting-loc-addr">
              Location Address
            </label>
            <textarea
              suppressHydrationWarning
              id="meeting-loc-addr"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              placeholder="Enter Location Address"
              rows={4}
              className="w-full resize-y rounded border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700" htmlFor="meeting-title">
            Title
          </label>
          <input
            suppressHydrationWarning
            id="meeting-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700" htmlFor="meeting-remark">
            Remark
          </label>
          <textarea
            suppressHydrationWarning
            id="meeting-remark"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Enter Remark"
            rows={4}
            className="w-full resize-y rounded border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DatetimeField label="Check-In" value={checkIn} onChange={setCheckIn} />
          <DatetimeField label="Check-Out" value={checkOut} onChange={setCheckOut} />
        </div>
      </div>
    </ModalShell>
  );
}

export function ActivityActionModals({
  active,
  onClose,
}: {
  active: ActivityActionModalId | null;
  onClose: () => void;
}) {
  return (
    <>
      <AddCompletedTaskModal open={active === "completedTask"} onClose={onClose} />
      <AddOfflineCallModal open={active === "offlineCall"} onClose={onClose} />
      <AddMeetingModal open={active === "meeting"} onClose={onClose} />
    </>
  );
}
