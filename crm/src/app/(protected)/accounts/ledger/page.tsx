"use client";

import { useMemo, useState } from "react";
import { Download, Pencil, Plus, Search, Trash2, X } from "lucide-react";

type LedgerRow = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  openingBalance: string;
  type: string;
  group: string;
  gstNo: string;
};

const MOCK_LEDGERS: LedgerRow[] = [
  { id: 1, name: "Ashish Vaykar", email: "", mobile: "8433169254", openingBalance: "₹0", type: "", group: "Direct Income", gstNo: "" },
  { id: 2, name: "Abhilash Nair", email: "", mobile: "8286975383", openingBalance: "₹0", type: "", group: "Direct Income", gstNo: "" },
  { id: 3, name: "Aseef Mukadam", email: "", mobile: "8433797151", openingBalance: "₹0", type: "", group: "Direct Income", gstNo: "" },
  { id: 4, name: "Kanchan Gupta", email: "", mobile: "8355885129", openingBalance: "₹0", type: "", group: "Direct Income", gstNo: "" },
  { id: 5, name: "Kuldeep Sngh Sharad", email: "", mobile: "9833700843", openingBalance: "₹0", type: "", group: "Direct Income", gstNo: "" },
  { id: 6, name: "Michael Antony", email: "", mobile: "9004701964", openingBalance: "₹0", type: "", group: "Direct Income", gstNo: "" },
];

const GROUP_OPTIONS = ["Direct Income", "Indirect Income", "Sundry Creditors", "Sundry Debtors"] as const;

type LedgerForm = {
  name: string;
  contact: string;
  email: string;
  openingBalance: string;
  group: string;
  gstNo: string;
};

const EMPTY_FORM: LedgerForm = {
  name: "",
  contact: "",
  email: "",
  openingBalance: "0",
  group: "",
  gstNo: "",
};

export default function AccountsLedgerPage() {
  const [ledgers, setLedgers] = useState<LedgerRow[]>(MOCK_LEDGERS);
  const [search, setSearch] = useState("");
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [mode, setMode] = useState<"list" | "create" | "update">("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<LedgerForm>(EMPTY_FORM);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return ledgers;
    return ledgers.filter((row) => row.name.toLowerCase().includes(term) || row.mobile.includes(term));
  }, [ledgers, search]);

  const onCreate = () => {
    setMode("create");
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const onEdit = (row: LedgerRow) => {
    setMode("update");
    setEditingId(row.id);
    setForm({
      name: row.name,
      contact: row.mobile,
      email: row.email,
      openingBalance: row.openingBalance.replace("₹", "") || "0",
      group: row.group,
      gstNo: row.gstNo,
    });
  };

  const onDelete = (id: number) => {
    setLedgers((prev) => prev.filter((x) => x.id !== id));
  };

  const onSubmit = () => {
    if (!form.name.trim()) return;

    if (mode === "create") {
      const next: LedgerRow = {
        id: Date.now(),
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: form.contact.trim(),
        openingBalance: `₹${form.openingBalance || "0"}`,
        type: "",
        group: form.group,
        gstNo: form.gstNo.trim(),
      };
      setLedgers((prev) => [next, ...prev]);
    } else if (mode === "update" && editingId) {
      setLedgers((prev) =>
        prev.map((row) =>
          row.id === editingId
            ? {
                ...row,
                name: form.name.trim(),
                email: form.email.trim(),
                mobile: form.contact.trim(),
                openingBalance: `₹${form.openingBalance || "0"}`,
                group: form.group,
                gstNo: form.gstNo.trim(),
              }
            : row,
        ),
      );
    }

    setMode("list");
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="space-y-4">
      {(mode === "create" || mode === "update") && (
        <div className="rounded border bg-white p-4">
          <h2 className="mb-4 text-xl font-semibold text-[#2f3b52]">{mode === "create" ? "Create Ledger" : "Update Ledger"}</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Ledger Name" value={form.name} onChange={(v) => setForm((s) => ({ ...s, name: v }))} placeholder="Ledger Name" />
            <Field label="Ledger Contact" value={form.contact} onChange={(v) => setForm((s) => ({ ...s, contact: v }))} placeholder="Phone number" />
            <Field label="Email" value={form.email} onChange={(v) => setForm((s) => ({ ...s, email: v }))} placeholder="Email" />
            <SelectField label="Group" value={form.group} onChange={(v) => setForm((s) => ({ ...s, group: v }))} options={GROUP_OPTIONS} />
            <Field label="Opening Balance" value={form.openingBalance} onChange={(v) => setForm((s) => ({ ...s, openingBalance: v }))} placeholder="0" />
            <Field label="GST No." value={form.gstNo} onChange={(v) => setForm((s) => ({ ...s, gstNo: v }))} placeholder="G.S.T No." />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onSubmit}
              className="rounded bg-[#0f66c3] px-4 py-2 text-sm font-medium text-white hover:bg-[#0c58a8]"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("list");
                setEditingId(null);
                setForm(EMPTY_FORM);
              }}
              className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {mode === "list" && (
        <div className="rounded border bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
            <h1 className="text-xl font-semibold text-[#2f3b52]">Ledgers ({filtered.length})</h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCreate}
                className="inline-flex items-center gap-2 rounded bg-[#0f66c3] px-3 py-2 text-sm font-medium text-white hover:bg-[#0c58a8]"
              >
                <Plus className="h-4 w-4" /> Add Ledger
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
              <button className="rounded border px-2 py-1 text-gray-600">2</button>
              <button className="rounded border px-2 py-1 text-gray-600">3</button>
              <button className="rounded border px-2 py-1 text-gray-600">Next</button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex overflow-hidden rounded border">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Ledger"
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
            <table className="w-full min-w-[950px] text-sm">
              <thead>
                <tr className="border-y bg-gray-50 text-left text-xs font-semibold uppercase text-gray-700">
                  <th className="px-4 py-2">Sr. No.</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Mobile</th>
                  <th className="px-4 py-2">Opening Balance</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr key={row.id} className="border-b text-gray-700 hover:bg-gray-50">
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2">{row.name}</td>
                    <td className="px-4 py-2">{row.email || "-"}</td>
                    <td className="px-4 py-2">{row.mobile}</td>
                    <td className="px-4 py-2">{row.openingBalance}</td>
                    <td className="px-4 py-2">{row.type || ""}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          className="rounded bg-cyan-500 p-1 text-white hover:bg-cyan-600"
                          aria-label="Edit ledger"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(row.id)}
                          className="rounded bg-pink-500 p-1 text-white hover:bg-pink-600"
                          aria-label="Delete ledger"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3">
            <div className="flex items-center gap-1 text-xs">
              <button className="rounded border px-2 py-1 text-gray-600">Previous</button>
              <button className="rounded bg-[#0f66c3] px-2 py-1 text-white">1</button>
              <button className="rounded border px-2 py-1 text-gray-600">2</button>
              <button className="rounded border px-2 py-1 text-gray-600">3</button>
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
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded border px-3 py-2 text-sm outline-none focus:border-[#0f66c3]"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-[#2f3b52]">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border bg-white px-3 py-2 text-sm outline-none focus:border-[#0f66c3]"
      >
        <option value="">Select Group</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
