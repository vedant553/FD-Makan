"use client";

import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useState } from "react";
import { Bell, CalendarDays, ChevronDown, Minus, Plus, X } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ProjectTableRow } from "./project-mocks";

const PRIMARY_BTN = "rounded-md bg-[#1a56db] px-5 py-2 text-sm font-medium text-white hover:bg-blue-700";
const SECONDARY_BTN = "rounded-md border border-gray-300 bg-gray-100 px-5 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200";
const PRIMARY = "bg-[#1a56db] hover:bg-blue-700";

const fieldClass =
  "w-full rounded border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none transition-colors focus:border-[#1a56db]";
const labelClass = "mb-1.5 block text-[13px] font-bold text-gray-700";

const BOOKING_TYPES = ["Sale", "Rent", "Lease"] as const;
const BOOKING_MODES = ["Project", "Inventory"] as const;
const MOCK_LEADS = ["Lead — Priya Sharma", "Lead — Rahul Mehta", "Lead — New Inquiry"];
const PRE_SALES_AGENTS = ["Ajay Jaiswal", "Neha Patil"];
const SALES_AGENTS = ["Aman Dubey", "Priya Jagtap"];
const EXECUTIVES = ["Executive A", "Executive B", "Executive C"];

function SelectChevron() {
  return <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />;
}

type SubAgentRow = { id: string; executive: string; pct: string; incentive: string };

function newSubRow(): SubAgentRow {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, executive: "", pct: "", incentive: "" };
}

type Props = {
  open: boolean;
  onClose: () => void;
  projectRow: ProjectTableRow | null;
};

export function ProjectAddBookingModal({ open, onClose, projectRow }: Props) {
  const [mainEl, setMainEl] = useState<HTMLElement | null>(null);

  const [bookingDate, setBookingDate] = useState("");
  const [formNo, setFormNo] = useState("");
  const [bookingType, setBookingType] = useState("Sale");
  const [mode, setMode] = useState("Project");
  const [bookedLead, setBookedLead] = useState("");
  const [projectField, setProjectField] = useState("");
  const [preSalesAgent, setPreSalesAgent] = useState("");
  const [salesAgent, setSalesAgent] = useState("");
  const [agreementAmount, setAgreementAmount] = useState("");
  const [channelPartner, setChannelPartner] = useState("");
  const [cpBrokeragePct, setCpBrokeragePct] = useState("");
  const [brokeragePct, setBrokeragePct] = useState("");
  const [brokerageAmt, setBrokerageAmt] = useState("");
  const [saleableArea, setSaleableArea] = useState("");
  const [remark, setRemark] = useState("");
  const [subAgents, setSubAgents] = useState<SubAgentRow[]>([]);

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
    if (!open || !projectRow) return;
    setBookingDate("");
    setFormNo("");
    setBookingType("Sale");
    setMode("Project");
    setBookedLead("");
    setProjectField(projectRow.name);
    setPreSalesAgent("");
    setSalesAgent("");
    setAgreementAmount("");
    setChannelPartner("");
    setCpBrokeragePct("");
    setBrokeragePct("");
    setBrokerageAmt("");
    setSaleableArea("");
    setRemark("");
    setSubAgents([]);
  }, [open, projectRow]);

  const addSubAgentSection = () => setSubAgents((prev) => [...prev, newSubRow()]);

  const insertRowAfter = (index: number) => {
    setSubAgents((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, newSubRow());
      return next;
    });
  };

  const removeRow = (index: number) => setSubAgents((prev) => prev.filter((_, i) => i !== index));

  const updateSubAgent = (index: number, patch: Partial<SubAgentRow>) =>
    setSubAgents((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  if (!open || !mainEl || !projectRow) return null;

  const selectWrap = "relative";
  const selectField = cn(fieldClass, "appearance-none pr-9");

  return createPortal(
    <div className="absolute inset-0 z-[103] flex min-h-0 flex-col bg-[#f4f7f6]">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 md:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-booking-title"
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h2 id="project-booking-title" className="text-lg font-semibold text-gray-900">
                Booking Details
              </h2>
              <p className="mt-0.5 text-[13px] text-gray-500">{projectRow.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                suppressHydrationWarning
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded bg-[#f97316] text-white shadow-sm hover:bg-orange-600"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
              <button
                suppressHydrationWarning
                type="button"
                onClick={onClose}
                className="rounded border border-gray-300 p-1.5 text-gray-600 hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[#f4f7f6] px-4 py-5 md:px-6">
            <div className="mx-auto max-w-6xl rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="flex flex-col">
                  <label className={labelClass}>Booking Date</label>
                  <div className="flex overflow-hidden rounded border border-gray-300 shadow-sm">
                    <input
                      suppressHydrationWarning
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="min-w-0 flex-1 border-0 px-3 py-2 text-[13px] outline-none placeholder:text-gray-400"
                    />
                    <button suppressHydrationWarning type="button" tabIndex={-1} className="border-l border-gray-300 bg-gray-50 px-3">
                      <CalendarDays className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Form / Application No.</label>
                  <input suppressHydrationWarning value={formNo} onChange={(e) => setFormNo(e.target.value)} placeholder="Form Number" className={fieldClass} />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Type</label>
                  <div className={selectWrap}>
                    <select suppressHydrationWarning value={bookingType} onChange={(e) => setBookingType(e.target.value)} className={selectField}>
                      {BOOKING_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <SelectChevron />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Mode</label>
                  <div className={selectWrap}>
                    <select suppressHydrationWarning value={mode} onChange={(e) => setMode(e.target.value)} className={selectField}>
                      {BOOKING_MODES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <SelectChevron />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className={labelClass}>Booked Lead</label>
                  <div className={selectWrap}>
                    <select suppressHydrationWarning value={bookedLead} onChange={(e) => setBookedLead(e.target.value)} className={selectField}>
                      <option value="">Select Booked Lead</option>
                      {MOCK_LEADS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <SelectChevron />
                  </div>
                </div>
                <div className="flex flex-col md:col-span-1">
                  <label className={labelClass}>Project</label>
                  <div className="relative">
                    <input
                      suppressHydrationWarning
                      value={projectField}
                      onChange={(e) => setProjectField(e.target.value)}
                      placeholder="Select Project"
                      className={cn(fieldClass, projectField ? "pr-9" : "")}
                    />
                    {projectField ? (
                      <button
                        suppressHydrationWarning
                        type="button"
                        onClick={() => setProjectField("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        aria-label="Clear project"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Pre Sales Agent</label>
                  <div className={selectWrap}>
                    <select suppressHydrationWarning value={preSalesAgent} onChange={(e) => setPreSalesAgent(e.target.value)} className={selectField}>
                      <option value="">Select Pre Sales Agent</option>
                      {PRE_SALES_AGENTS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <SelectChevron />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Sales Agent</label>
                  <div className={selectWrap}>
                    <select suppressHydrationWarning value={salesAgent} onChange={(e) => setSalesAgent(e.target.value)} className={selectField}>
                      <option value="">Select Sales Agent</option>
                      {SALES_AGENTS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <SelectChevron />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className={labelClass}>Agreement Amount</label>
                  <input suppressHydrationWarning value={agreementAmount} onChange={(e) => setAgreementAmount(e.target.value)} placeholder="Amount" className={fieldClass} />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Channel Partner</label>
                  <div className={selectWrap}>
                    <select suppressHydrationWarning value={channelPartner} onChange={(e) => setChannelPartner(e.target.value)} className={selectField}>
                      <option value="">Search &amp; Select Channel Partner</option>
                      <option value="partner1">Prime Realtors</option>
                      <option value="partner2">Metro Associates</option>
                    </select>
                    <SelectChevron />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Channel Partner Brokerage %</label>
                  <input
                    suppressHydrationWarning
                    value={cpBrokeragePct}
                    onChange={(e) => setCpBrokeragePct(e.target.value)}
                    placeholder="Enter Brokerage in percentage"
                    className={fieldClass}
                  />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Brokerage (%)</label>
                  <input suppressHydrationWarning value={brokeragePct} onChange={(e) => setBrokeragePct(e.target.value)} placeholder="Brokerage in percentage" className={fieldClass} />
                </div>

                <div className="flex flex-col">
                  <label className={labelClass}>Brokerage</label>
                  <input suppressHydrationWarning value={brokerageAmt} onChange={(e) => setBrokerageAmt(e.target.value)} placeholder="Brokerage" className={fieldClass} />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Saleable Area</label>
                  <input suppressHydrationWarning value={saleableArea} onChange={(e) => setSaleableArea(e.target.value)} placeholder="Saleable Area" className={fieldClass} />
                </div>
              </div>

              <div className="mt-4 flex flex-col">
                <label className={labelClass}>Remark</label>
                <textarea suppressHydrationWarning value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Remark" rows={4} className={cn(fieldClass, "resize-y")} />
              </div>

              <div className="mt-4">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={addSubAgentSection}
                  className={cn("inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm", PRIMARY)}
                >
                  <Plus className="h-4 w-4" />
                  Add Sub Agent
                </button>
              </div>

              {subAgents.length > 0 ? (
                <div className="mt-6 space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  {subAgents.map((row, index) => (
                    <div
                      key={row.id}
                      className={cn(
                        "grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end",
                        index > 0 && "border-t border-gray-100 pt-4",
                      )}
                    >
                      <div className="flex flex-col">
                        <label className={labelClass}>Sub Sales Agent</label>
                        <div className={selectWrap}>
                          <select
                            suppressHydrationWarning
                            value={row.executive}
                            onChange={(e) => updateSubAgent(index, { executive: e.target.value })}
                            className={selectField}
                          >
                            <option value="">Select Executive</option>
                            {EXECUTIVES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                          <SelectChevron />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label className={labelClass}>Incentive (%)</label>
                        <input
                          suppressHydrationWarning
                          value={row.pct}
                          onChange={(e) => updateSubAgent(index, { pct: e.target.value })}
                          placeholder="Incentive in percentage"
                          className={fieldClass}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className={labelClass}>Incentive</label>
                        <input
                          suppressHydrationWarning
                          value={row.incentive}
                          onChange={(e) => updateSubAgent(index, { incentive: e.target.value })}
                          placeholder="Executive Incentive Amount"
                          className={fieldClass}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className={labelClass}>Action</label>
                        <div className="flex gap-2">
                          <button
                            suppressHydrationWarning
                            type="button"
                            className={cn("inline-flex h-9 w-9 items-center justify-center rounded text-white", PRIMARY)}
                            aria-label="Add row"
                            onClick={() => insertRowAfter(index)}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            suppressHydrationWarning
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded bg-red-600 text-white hover:bg-red-700"
                            aria-label="Remove row"
                            onClick={() => removeRow(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
                <button suppressHydrationWarning type="button" className={PRIMARY_BTN} onClick={onClose}>
                  Submit
                </button>
                <button suppressHydrationWarning type="button" onClick={onClose} className={SECONDARY_BTN}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    mainEl,
  );
}
