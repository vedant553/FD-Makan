"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, Plus, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

const PRIMARY = "rounded-md bg-[#1a56db] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700";
const SECONDARY = "rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50";

const fieldClass =
  "w-full rounded border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]";

type ProjectRow = { id: string; sr: number; name: string; code: string };

const INITIAL_ROWS: ProjectRow[] = [{ id: "p1", sr: 1, name: "Godrej City", code: "GODREJ CITY" }];

function FullscreenShell({ children }: { children: React.ReactNode }) {
  const [mainEl, setMainEl] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    setMainEl(document.getElementById("app-main"));
  }, []);
  if (!mainEl) return null;
  return createPortal(
    <div className="absolute inset-0 z-[100] flex min-h-0 flex-col bg-[#f4f7f6]">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 md:p-6">{children}</div>
    </div>,
    mainEl,
  );
}

function PaginationBar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button suppressHydrationWarning type="button" className="text-sm font-medium text-gray-500 hover:text-gray-800 disabled:opacity-40" disabled>
        Previous
      </button>
      <button suppressHydrationWarning type="button" className="min-w-[2rem] rounded bg-[#1a56db] px-2 py-1 text-sm font-medium text-white">
        1
      </button>
      <button suppressHydrationWarning type="button" className="text-sm font-medium text-gray-500 hover:text-gray-800 disabled:opacity-40" disabled>
        Next
      </button>
    </div>
  );
}

function AddProjectModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}) {
  const [mainEl, setMainEl] = useState<HTMLElement | null>(null);
  const [name, setName] = useState("");

  useLayoutEffect(() => {
    setMainEl(document.getElementById("app-main"));
  }, []);

  useEffect(() => {
    if (!open) setName("");
  }, [open]);

  if (!open || !mainEl) return null;

  return createPortal(
    <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/35 p-4 backdrop-blur-md" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-project-title"
        className="flex w-full max-w-md flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 id="add-project-title" className="text-lg font-semibold text-[#1e293b]">
            Add Project
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
        <div className="px-5 py-5">
          <label className="mb-1.5 block text-[13px] font-bold text-[#1e293b]" htmlFor="add-project-name">
            Name
          </label>
          <input
            suppressHydrationWarning
            id="add-project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className={fieldClass}
          />
        </div>
        <div className="flex shrink-0 justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <button
            suppressHydrationWarning
            type="button"
            className={PRIMARY}
            onClick={() => {
              const n = name.trim();
              if (!n) return;
              onSubmit(n);
              onClose();
            }}
          >
            Submit
          </button>
          <button suppressHydrationWarning type="button" className={SECONDARY} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>,
    mainEl,
  );
}

export function InventoryProjectsView({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [rows, setRows] = useState<ProjectRow[]>(INITIAL_ROWS);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState("50");
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [rowMenuId, setRowMenuId] = useState<string | null>(null);
  const rowMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rowMenuRef.current && !rowMenuRef.current.contains(e.target as Node)) setRowMenuId(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, rowMenuId]);

  const handleAddProject = useCallback((name: string) => {
    setRows((r) => {
      const nextSr = r.length ? Math.max(...r.map((x) => x.sr)) + 1 : 1;
      const id = `p-${Date.now()}`;
      return [...r, { id, sr: nextSr, name, code: name.toUpperCase().replace(/\s+/g, " ") }];
    });
  }, []);

  if (!open) return null;

  const filtered = rows.filter((row) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return row.name.toLowerCase().includes(q) || row.code.toLowerCase().includes(q);
  });

  return (
    <FullscreenShell>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 md:px-5">
          <h2 className="text-base font-semibold text-gray-800">
            Inventory Projects ( {rows.length} )
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <button suppressHydrationWarning type="button" onClick={() => setAddProjectOpen(true)} className={`${PRIMARY} inline-flex items-center gap-2`}>
              <Plus className="h-4 w-4" />
              Add Project
            </button>
            <button suppressHydrationWarning type="button" onClick={onClose} className={`${PRIMARY} inline-flex items-center gap-2`}>
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 md:flex-row md:flex-wrap md:items-center md:justify-between md:px-5">
          <PaginationBar />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex min-w-0 max-w-full items-stretch rounded border border-gray-300 bg-white shadow-sm">
              <input
                suppressHydrationWarning
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Project"
                className="min-w-[140px] max-w-[240px] flex-1 border-0 bg-transparent px-3 py-2 text-[13px] outline-none"
              />
              <button suppressHydrationWarning type="button" className={cn("flex shrink-0 items-center justify-center px-3 py-2 text-white", PRIMARY)} aria-label="Search">
                <Search className="h-4 w-4" />
              </button>
            </div>
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setSearch("")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative min-w-[4.5rem]">
              <select
                suppressHydrationWarning
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className="w-full appearance-none rounded border border-gray-300 bg-white py-2 pl-3 pr-8 text-[13px] text-gray-700 shadow-sm outline-none focus:border-[#1a56db]"
              >
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead className="sticky top-0 bg-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
              <tr>
                <th className="border-b border-gray-200 px-4 py-3">SR. NO.</th>
                <th className="border-b border-gray-200 px-4 py-3">NAME</th>
                <th className="border-b border-gray-200 px-4 py-3">CODE</th>
                <th className="border-b border-gray-200 px-4 py-3">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                    No projects found
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-800">{row.sr}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{row.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">{row.code}</td>
                    <td className="px-4 py-3">
                      <div className="relative inline-block" ref={rowMenuId === row.id ? rowMenuRef : null}>
                        <button
                          suppressHydrationWarning
                          type="button"
                          onClick={() => setRowMenuId((id) => (id === row.id ? null : row.id))}
                          className={cn("flex h-8 w-8 items-center justify-center rounded text-white", PRIMARY)}
                          aria-expanded={rowMenuId === row.id}
                          aria-label="Row actions"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        {rowMenuId === row.id ? (
                          <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                            <button
                              suppressHydrationWarning
                              type="button"
                              className="block w-full px-3 py-2 text-left text-[13px] hover:bg-sky-50"
                              onClick={() => setRowMenuId(null)}
                            >
                              Edit
                            </button>
                            <button
                              suppressHydrationWarning
                              type="button"
                              className="block w-full px-3 py-2 text-left text-[13px] text-red-700 hover:bg-red-50"
                              onClick={() => setRowMenuId(null)}
                            >
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="shrink-0 border-t border-gray-200 px-4 py-3 md:px-5">
          <PaginationBar />
        </div>
      </div>

      <AddProjectModal open={addProjectOpen} onClose={() => setAddProjectOpen(false)} onSubmit={handleAddProject} />
    </FullscreenShell>
  );
}
