"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Download, Plus, Search, X } from "lucide-react";

type VoucherRow = {
  id: number;
  date: string;
  ledgerFrom: string;
  ledgerTo: string;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountInWords: string;
  paymentType: string;
};

type VoucherForm = {
  voucherDetails: string;
  date: string;
  paymentMode: string;
  accountFrom: string;
  accountTo: string;
  amount: string;
  tdsPercent: string;
  tdsAmount: string;
  taxType: string;
  narration: string;
};

const EMPTY_FORM: VoucherForm = {
  voucherDetails: "",
  date: "",
  paymentMode: "",
  accountFrom: "",
  accountTo: "",
  amount: "0",
  tdsPercent: "0",
  tdsAmount: "0",
  taxType: "",
  narration: "",
};

export default function AccountsVoucherPage() {
  const [vouchers, setVouchers] = useState<VoucherRow[]>([]);
  const [search, setSearch] = useState("");
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [mode, setMode] = useState<"list" | "create">("list");
  const [form, setForm] = useState<VoucherForm>(EMPTY_FORM);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return vouchers;
    return vouchers.filter((row) => row.ledgerFrom.toLowerCase().includes(term) || row.ledgerTo.toLowerCase().includes(term));
  }, [vouchers, search]);

  const netAmount = Number(form.amount || 0);
  const tdsAmount = Number(form.tdsAmount || 0);
  const taxAmount = Math.max(netAmount - tdsAmount, 0);
  const totalAmount = netAmount;

  const toWords = (amount: number) => {
    if (amount <= 0) return "Zero";
    return `${amount.toLocaleString("en-IN")} only`;
  };

  const resetForm = () => setForm(EMPTY_FORM);

  const onSubmit = () => {
    const next: VoucherRow = {
      id: Date.now(),
      date: form.date || new Date().toISOString().slice(0, 10),
      ledgerFrom: form.accountFrom || "-",
      ledgerTo: form.accountTo || "-",
      netAmount,
      taxAmount,
      totalAmount,
      amountInWords: toWords(totalAmount),
      paymentType: form.paymentMode || "-",
    };
    setVouchers((prev) => [next, ...prev]);
    setMode("list");
    resetForm();
  };

  return (
    <div className="space-y-4">
      {mode === "create" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="rounded border bg-white">
            <div className="border-b px-4 py-3 text-xl font-semibold text-[#2f3b52]">Create Voucher</div>
            <div className="space-y-3 p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <SelectField
                  label="Voucher Details *"
                  value={form.voucherDetails}
                  onChange={(v) => setForm((s) => ({ ...s, voucherDetails: v }))}
                  options={["Payment", "Receipt", "Journal"]}
                  placeholder="Select Voucher Detail"
                />
                <Field label="Date *" value={form.date} onChange={(v) => setForm((s) => ({ ...s, date: v }))} placeholder="Select Date" />
                <SelectField
                  label="Payment Mode *"
                  value={form.paymentMode}
                  onChange={(v) => setForm((s) => ({ ...s, paymentMode: v }))}
                  options={["Cash", "Bank", "UPI", "Cheque"]}
                  placeholder="Select Payment Mode"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <SelectField
                  label="Account Name (From)"
                  value={form.accountFrom}
                  onChange={(v) => setForm((s) => ({ ...s, accountFrom: v }))}
                  options={["Ashish Vaykar", "Kanchan Gupta", "Michael Antony"]}
                  placeholder="Select From Account"
                />
                <SelectField
                  label="Account Name (To)"
                  value={form.accountTo}
                  onChange={(v) => setForm((s) => ({ ...s, accountTo: v }))}
                  options={["FDM", "Direct Income", "Bank Account"]}
                  placeholder="Select or Search To Account"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <Field label="Amount" value={form.amount} onChange={(v) => setForm((s) => ({ ...s, amount: v }))} placeholder="0" />
                <Field label="TDS (%)" value={form.tdsPercent} onChange={(v) => setForm((s) => ({ ...s, tdsPercent: v }))} placeholder="0" />
                <Field label="TDS Amount" value={form.tdsAmount} onChange={(v) => setForm((s) => ({ ...s, tdsAmount: v }))} placeholder="0" />
                <SelectField
                  label="Tax Type"
                  value={form.taxType}
                  onChange={(v) => setForm((s) => ({ ...s, taxType: v }))}
                  options={["GST", "TDS", "None"]}
                  placeholder="Select Tax Type"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#2f3b52]">Narration *</label>
                <textarea
                  value={form.narration}
                  onChange={(e) => setForm((s) => ({ ...s, narration: e.target.value }))}
                  placeholder="Narration"
                  rows={3}
                  className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-[#0f66c3]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onSubmit}
                  className="rounded bg-[#0f66c3] px-4 py-2 text-sm font-medium text-white hover:bg-[#0c58a8]"
                >
                  Create Voucher
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("list");
                    resetForm();
                  }}
                  className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <div className="rounded border bg-white">
            <div className="border-b px-4 py-3 text-lg font-semibold text-[#2f3b52]">Voucher Snapshot</div>
            <div className="space-y-3 p-4 text-sm">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-semibold text-[#2f3b52]">Net Amount</span>
                <span>{netAmount}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-semibold text-[#2f3b52]">Tax Details</span>
                <span>0</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-semibold text-[#2f3b52]">Tax Amount</span>
                <span>{taxAmount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#2f3b52]">Total Amount</span>
                <span>{totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === "list" && (
        <div className="rounded border bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
            <h1 className="text-xl font-semibold text-[#2f3b52]">Voucher ({filtered.length})</h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode("create")}
                className="inline-flex items-center gap-2 rounded bg-[#0f66c3] px-3 py-2 text-sm font-medium text-white hover:bg-[#0c58a8]"
              >
                <Plus className="h-4 w-4" /> Add Voucher
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDownloadMenu((v) => !v)}
                  className="rounded border border-[#0f66c3] p-2 text-[#0f66c3] hover:bg-blue-50"
                  aria-label="Download menu"
                >
                  ⋮
                </button>
                {showDownloadMenu && (
                  <div className="absolute right-0 top-10 z-20 min-w-[180px] rounded border bg-white py-1 shadow">
                    <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50">
                      <Download className="h-4 w-4" /> Table Download
                    </button>
                    <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50">
                      <Download className="h-4 w-4" /> Bulk Download
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-1 text-xs">
              <button className="rounded border px-2 py-1 text-gray-600">Previous</button>
              <button className="rounded bg-[#0f66c3] px-2 py-1 text-white">1</button>
              <button className="rounded border px-2 py-1 text-gray-600">Next</button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex overflow-hidden rounded border">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Vouchers"
                  className="px-3 py-1.5 text-sm outline-none"
                />
                <button type="button" className="bg-[#0f66c3] px-2 text-white">
                  <Search className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setSearch("")} className="bg-gray-100 px-2 text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <select className="rounded border px-2 py-1.5 text-sm">
                <option>50</option>
                <option>20</option>
                <option>10</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-sm">
              <thead>
                <tr className="border-y bg-gray-50 text-left text-xs font-semibold uppercase text-gray-700">
                  <th className="px-4 py-2">Sr.No</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Ledger From Name</th>
                  <th className="px-4 py-2">Ledger To Name</th>
                  <th className="px-4 py-2">Net Amount</th>
                  <th className="px-4 py-2">Tax Amount</th>
                  <th className="px-4 py-2">Total Amount</th>
                  <th className="px-4 py-2">Total Amount In Words</th>
                  <th className="px-4 py-2">Payment Type</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-4 text-center text-gray-500">
                      No data found
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, idx) => (
                    <tr key={row.id} className="border-b text-gray-700 hover:bg-gray-50">
                      <td className="px-4 py-2">{idx + 1}</td>
                      <td className="px-4 py-2">{row.date}</td>
                      <td className="px-4 py-2">{row.ledgerFrom}</td>
                      <td className="px-4 py-2">{row.ledgerTo}</td>
                      <td className="px-4 py-2">{row.netAmount}</td>
                      <td className="px-4 py-2">{row.taxAmount}</td>
                      <td className="px-4 py-2">{row.totalAmount}</td>
                      <td className="px-4 py-2">{row.amountInWords}</td>
                      <td className="px-4 py-2">{row.paymentType}</td>
                      <td className="px-4 py-2">-</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3">
            <div className="flex items-center gap-1 text-xs">
              <button className="rounded border px-2 py-1 text-gray-600">Previous</button>
              <button className="rounded bg-[#0f66c3] px-2 py-1 text-white">1</button>
              <button className="rounded border px-2 py-1 text-gray-600">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-[#2f3b52]">{label}</label>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-[#0f66c3]"
        />
        {label === "Date *" ? (
          <span className="pointer-events-none absolute right-3 top-2.5 text-gray-500">
            <CalendarDays className="h-4 w-4" />
          </span>
        ) : null}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-[#2f3b52]">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border bg-white px-3 py-2 text-sm outline-none focus:border-[#0f66c3]"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
