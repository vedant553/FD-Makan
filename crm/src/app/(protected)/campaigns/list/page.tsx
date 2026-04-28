"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { ChevronDown, Plus, Search, X } from "lucide-react";

import { PageShell, Panel } from "@/components/crm/page-shell";
import { cn } from "@/lib/utils";

const PRIMARY = "bg-primary text-primary-foreground hover:opacity-90";

const LIST_COUNT = 0;

const TABLE_COLUMNS = ["#", "List Name", "Email", "Mobile", "Created Date", "Updated Date", "Action"] as const;

const controlBorder = "border border-border bg-card focus:border-primary";

function PaginationBar() {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <button type="button" className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40" disabled>
        Previous
      </button>
      <button type="button" className="min-w-[2rem] rounded bg-primary px-2 py-1 text-sm font-medium text-primary-foreground">
        1
      </button>
      <button type="button" className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40" disabled>
        Next
      </button>
    </div>
  );
}

export default function CampaignListPage() {
  const [tableSearch, setTableSearch] = useState("");
  const [pageSize, setPageSize] = useState("20");
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRemark, setNewRemark] = useState("");

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  function closeModal() {
    setModalOpen(false);
    setNewName("");
    setNewRemark("");
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    closeModal();
  }

  return (
    <PageShell>
      <Link href="/campaigns" className="mb-4 inline-block text-sm font-medium text-primary hover:underline">
        ← Campaign
      </Link>

      <Panel>
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Campaign List (<span className="tabular-nums">{LIST_COUNT}</span>)
          </h2>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className={cn("inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium shadow-sm", PRIMARY)}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            New List/Segment
          </button>
        </div>

        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <PaginationBar />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex min-w-0 max-w-full items-stretch rounded border border-border bg-card shadow-sm">
              <input
                type="search"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search"
                className="min-w-[120px] max-w-[200px] flex-1 border-0 bg-transparent px-3 py-2 text-[13px] text-foreground outline-none sm:max-w-[260px]"
              />
              <button type="button" className={cn("flex shrink-0 items-center justify-center px-3 py-2", PRIMARY)} aria-label="Search">
                <Search className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setTableSearch("")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-border bg-muted text-muted-foreground hover:bg-muted/80"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative min-w-[4.5rem]">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className={cn("w-full appearance-none rounded py-2 pl-2 pr-8 text-[13px] text-foreground shadow-sm outline-none", controlBorder)}
              >
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-sm">
            <thead className="bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                {TABLE_COLUMNS.map((col) => (
                  <th key={col} className={cn("border-b border-border px-3 py-3 whitespace-nowrap", col === "#" && "w-12")}>
                    {col === "#" ? "#" : col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={TABLE_COLUMNS.length} className="py-16 text-center text-sm font-medium text-muted-foreground">
                  No Data Found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border-t border-border px-4 py-3">
          <PaginationBar />
        </div>
      </Panel>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/45" aria-label="Close modal overlay" onClick={closeModal} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-list-title"
            className="relative z-10 w-full max-w-lg rounded-lg border border-border bg-card text-card-foreground shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 id="add-list-title" className="text-base font-semibold text-foreground">
                Add New List
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="space-y-4 px-5 py-5">
                <div>
                  <label htmlFor="new-list-name" className="mb-1 block text-[13px] font-medium text-muted-foreground">
                    Name
                  </label>
                  <input
                    id="new-list-name"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Name"
                    className={cn("w-full rounded-md px-3 py-2 text-[13px] text-foreground shadow-sm outline-none", controlBorder)}
                  />
                </div>
                <div>
                  <label htmlFor="new-list-remark" className="mb-1 block text-[13px] font-medium text-muted-foreground">
                    Remark
                  </label>
                  <textarea
                    id="new-list-remark"
                    rows={4}
                    value={newRemark}
                    onChange={(e) => setNewRemark(e.target.value)}
                    placeholder="Add Remark"
                    className={cn("w-full resize-y rounded-md px-3 py-2 text-[13px] text-foreground shadow-sm outline-none", controlBorder)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
                <button type="submit" className={cn("rounded-md px-6 py-2 text-sm font-medium text-primary-foreground shadow-sm", PRIMARY)}>
                  Save
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md border border-border bg-muted px-6 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
