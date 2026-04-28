"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useId, useState } from "react";
import { Calendar, ChevronDown, Minus, Plus } from "lucide-react";

import { PageShell, Panel } from "@/components/crm/page-shell";
import { cn } from "@/lib/utils";

const PRIMARY = "bg-primary text-primary-foreground hover:opacity-90";

const inputClass =
  "w-full rounded-md border border-border bg-card py-2 pl-3 pr-9 text-[13px] text-foreground shadow-sm outline-none focus:border-primary";
const inputNoChevron =
  "w-full rounded-md border border-border bg-card px-3 py-2 text-[13px] text-foreground shadow-sm outline-none focus:border-primary";

function SelectField({
  id,
  label,
  placeholder,
  defaultValue,
  children,
}: {
  id: string;
  label: ReactNode;
  placeholder: string;
  defaultValue?: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[13px] font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <select id={id} defaultValue={defaultValue ?? ""} className={inputClass}>
          {!defaultValue ? <option value="">{placeholder}</option> : null}
          {defaultValue ? <option value={defaultValue}>{defaultValue}</option> : null}
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}

export default function AddBookingPage() {
  const baseId = useId();
  const [subAgentRows, setSubAgentRows] = useState(() => [{ id: `${baseId}-0` }]);

  const addSubRow = useCallback(() => {
    setSubAgentRows((rows) => [...rows, { id: `${baseId}-${rows.length}-${Date.now()}` }]);
  }, [baseId]);

  const removeSubRow = useCallback((id: string) => {
    setSubAgentRows((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.id !== id)));
  }, []);

  return (
    <PageShell>
      <Panel className="mx-auto max-w-[1200px]">
        <div className="border-b border-border px-4 py-4 md:px-6">
          <h1 className="text-lg font-semibold text-foreground">Booking Details</h1>
        </div>

        <form
          className="p-4 md:p-6"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label htmlFor="bk-date" className="mb-1 block text-[13px] font-medium text-muted-foreground">
                Booking Date
              </label>
              <div className="relative">
                <input id="bk-date" type="date" className={cn(inputNoChevron, "pr-10")} />
                <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <div>
              <label htmlFor="bk-form" className="mb-1 block text-[13px] font-medium text-muted-foreground">
                Form / Application No.
              </label>
              <input id="bk-form" type="text" placeholder="Form Number" className={inputNoChevron} />
            </div>
            <SelectField id="bk-type" label="Type" placeholder="Select" defaultValue="Sale" />
            <SelectField id="bk-mode" label="Mode" placeholder="Select" defaultValue="Project" />
            <SelectField id="bk-lead" label="Booked Lead" placeholder="Select Booked Lead" />
            <div>
              <label htmlFor="bk-project" className="mb-1 block text-[13px] font-medium text-muted-foreground">
                Project <span className="font-normal text-red-600">*required.</span>
              </label>
              <div className="relative">
                <select id="bk-project" defaultValue="" className={inputClass}>
                  <option value="">Search &amp; Select Project</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <SelectField id="bk-presales" label="Pre Sales Agent" placeholder="Select Pre Sales Agent" />
            <SelectField id="bk-sales" label="Sales Agent" placeholder="Select Sales Agent" />
            <div>
              <label htmlFor="bk-agreement" className="mb-1 block text-[13px] font-medium text-muted-foreground">
                Agreement Amount
              </label>
              <input id="bk-agreement" type="text" inputMode="decimal" placeholder="Amount" className={inputNoChevron} />
            </div>
            <div>
              <label htmlFor="bk-cp" className="mb-1 block text-[13px] font-medium text-muted-foreground">
                Channel Partner
              </label>
              <div className="relative">
                <select id="bk-cp" defaultValue="" className={inputClass}>
                  <option value="">Search &amp; Select Channel Partner</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <div>
              <label htmlFor="bk-cp-brk-pct" className="mb-1 block text-[13px] font-medium text-muted-foreground">
                Channel Partner Brokerage %
              </label>
              <input
                id="bk-cp-brk-pct"
                type="text"
                inputMode="decimal"
                placeholder="Enter Brokerage in percentage"
                className={inputNoChevron}
              />
            </div>
            <div>
              <label htmlFor="bk-brk-pct" className="mb-1 block text-[13px] font-medium text-muted-foreground">
                Brokerage (%)
              </label>
              <input id="bk-brk-pct" type="text" inputMode="decimal" placeholder="Brokerage in percentage" className={inputNoChevron} />
            </div>
            <div>
              <label htmlFor="bk-brk" className="mb-1 block text-[13px] font-medium text-muted-foreground">
                Brokerage
              </label>
              <input id="bk-brk" type="text" inputMode="decimal" placeholder="Brokerage" className={inputNoChevron} />
            </div>
            <div>
              <label htmlFor="bk-area" className="mb-1 block text-[13px] font-medium text-muted-foreground">
                Saleable Area
              </label>
              <input id="bk-area" type="text" placeholder="Saleable Area" className={inputNoChevron} />
            </div>
            <div className="md:col-span-2 xl:col-span-4">
              <label htmlFor="bk-remark" className="mb-1 block text-[13px] font-medium text-muted-foreground">
                Remark
              </label>
              <textarea
                id="bk-remark"
                rows={4}
                placeholder="Remark"
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-[13px] text-foreground shadow-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-4">
            <button type="button" onClick={addSubRow} className={cn("inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm", PRIMARY)}>
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Add Sub Agent
            </button>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <p className="mb-3 text-[13px] font-semibold text-foreground">Sub Sales Agent Incentive</p>
            <div className="space-y-4">
              {subAgentRows.map((row) => (
                <div key={row.id} className="grid gap-4 md:grid-cols-2 lg:grid-cols-12 lg:items-end">
                  <div className="lg:col-span-4">
                    <label htmlFor={`${row.id}-exec`} className="mb-1 block text-[13px] font-medium text-muted-foreground">
                      Sub Sales Agent
                    </label>
                    <div className="relative">
                      <select id={`${row.id}-exec`} defaultValue="" className={inputClass}>
                        <option value="">Select Executive</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="lg:col-span-3">
                    <label htmlFor={`${row.id}-pct`} className="mb-1 block text-[13px] font-medium text-muted-foreground">
                      Incentive (%)
                    </label>
                    <input id={`${row.id}-pct`} type="text" inputMode="decimal" placeholder="Incentive in percentage" className={inputNoChevron} />
                  </div>
                  <div className="lg:col-span-3">
                    <label htmlFor={`${row.id}-amt`} className="mb-1 block text-[13px] font-medium text-muted-foreground">
                      Incentive
                    </label>
                    <input id={`${row.id}-amt`} type="text" inputMode="decimal" placeholder="Executive Incentive Amount" className={inputNoChevron} />
                  </div>
                  <div className="lg:col-span-2">
                    <span className="mb-1 block text-[13px] font-medium text-muted-foreground">Action</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addSubRow}
                        className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white shadow-sm", PRIMARY)}
                        aria-label="Add row"
                      >
                        <Plus className="h-4 w-4" strokeWidth={2.5} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSubRow(row.id)}
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-600 text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40",
                        )}
                        aria-label="Remove row"
                        disabled={subAgentRows.length <= 1}
                      >
                        <Minus className="h-4 w-4" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-end gap-2 border-t border-border pt-6">
            <button type="submit" className={cn("rounded-md px-8 py-2 text-sm font-medium text-primary-foreground shadow-sm", PRIMARY)}>
              Submit
            </button>
            <Link
              href="/bookings/deals"
              className="rounded-md border border-border bg-muted px-8 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted/80"
            >
              Cancel
            </Link>
          </div>
        </form>
      </Panel>
    </PageShell>
  );
}
