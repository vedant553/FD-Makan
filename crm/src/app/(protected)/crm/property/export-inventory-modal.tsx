"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

import { cn } from "@/lib/utils";

const PRIMARY = "bg-[#1a56db] hover:bg-blue-700";

/** Inventory / Property table export: 18 column options, 17 selected by default (Secondary Number off), matching “17 columns are selected” + reference mock. */
const EXPORT_INVENTORY_COLUMN_DEFS = [
  { id: "propertyId", label: "Property Id" },
  { id: "details", label: "Details" },
  { id: "inventoryType", label: "Inventory Type" },
  { id: "location", label: "Location" },
  { id: "visibility", label: "Visibility" },
  { id: "ownerName", label: "Name" },
  { id: "email", label: "Email" },
  { id: "primaryNumber", label: "Primary Number" },
  { id: "secondaryNumber", label: "Secondary Number" },
  { id: "projectDetails", label: "Project Details" },
  { id: "floor", label: "Floor" },
  { id: "availableFor", label: "Available For" },
  { id: "expectation", label: "Expectation" },
  { id: "status", label: "Status" },
  { id: "allowedFor", label: "Allowed For" },
  { id: "availability", label: "Availability" },
  { id: "availableFrom", label: "Available From" },
  { id: "createdDate", label: "Created Date" },
] as const;

function buildInitialSelection() {
  return new Set<string>(
    EXPORT_INVENTORY_COLUMN_DEFS.filter((c) => c.id !== "secondaryNumber").map((c) => c.id),
  );
}

export function ExportInventoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mainEl, setMainEl] = useState<HTMLElement | null>(null);
  const [fileName, setFileName] = useState("Inventory");
  const [showDetails, setShowDetails] = useState<"yes" | "no">("yes");
  const [fileType, setFileType] = useState<"xlsx" | "csv" | "pdf">("xlsx");
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(buildInitialSelection);
  const [columnsExpanded, setColumnsExpanded] = useState(true);

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

  const selectedCount = selectedColumns.size;

  const selectAll = useCallback(() => {
    setSelectedColumns(new Set(EXPORT_INVENTORY_COLUMN_DEFS.map((c) => c.id)));
  }, []);

  const clearAll = useCallback(() => {
    setSelectedColumns(new Set());
  }, []);

  const toggleColumn = useCallback((id: string) => {
    setSelectedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    if (open) return;
    setFileName("Inventory");
    setShowDetails("yes");
    setFileType("xlsx");
    setSelectedColumns(buildInitialSelection());
    setColumnsExpanded(true);
  }, [open]);

  if (!open || !mainEl) return null;

  return createPortal(
    <div
      className="absolute inset-0 z-[100] flex items-center justify-center bg-black/35 p-4 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-inventory-title"
        className="flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-md border border-gray-100 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 id="export-inventory-title" className="text-lg font-semibold text-[#1e293b]">
            Export Inventory Data
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

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div>
            <label className="mb-1.5 block text-[13px] font-bold text-[#1e293b]" htmlFor="export-inv-file-name">
              File Name
            </label>
            <input
              suppressHydrationWarning
              id="export-inv-file-name"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
            />
          </div>

          <div>
            <span className="mb-2 block text-[13px] font-bold text-[#1e293b]">Show Details</span>
            <div className="flex flex-wrap gap-6">
              {(["yes", "no"] as const).map((v) => (
                <label key={v} className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-gray-800">
                  <input
                    suppressHydrationWarning
                    type="radio"
                    name="invShowDetails"
                    checked={showDetails === v}
                    onChange={() => setShowDetails(v)}
                    className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  {v === "yes" ? "Yes" : "No"}
                </label>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-[13px] font-bold text-[#1e293b]">Select File Type</span>
            <div className="flex flex-wrap gap-6">
              {(
                [
                  { v: "xlsx" as const, label: "XLSX" },
                  { v: "csv" as const, label: "CSV" },
                  { v: "pdf" as const, label: "PDF" },
                ] as const
              ).map(({ v, label }) => (
                <label key={v} className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-gray-800">
                  <input
                    suppressHydrationWarning
                    type="radio"
                    name="invFileType"
                    checked={fileType === v}
                    onChange={() => setFileType(v)}
                    className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[13px] font-bold text-[#1e293b]">Select Columns</span>
              <div className="flex gap-3 text-[13px] font-medium">
                <button suppressHydrationWarning type="button" onClick={selectAll} className="text-[#1a56db] hover:underline">
                  Select All
                </button>
                <button suppressHydrationWarning type="button" onClick={clearAll} className="text-[#1a56db] hover:underline">
                  Clear All
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-md border border-gray-200">
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setColumnsExpanded((e) => !e)}
                className="flex w-full items-center justify-between gap-2 border-b border-gray-100 bg-[#f8fafc] px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
              >
                <span className="rounded-full bg-[#e5efff] px-3 py-0.5 text-xs font-semibold text-[#1a56db]">
                  {selectedCount} columns are selected
                </span>
                {columnsExpanded ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
                )}
              </button>
              {columnsExpanded ? (
                <div className="max-h-[min(280px,40vh)] overflow-y-auto">
                  {EXPORT_INVENTORY_COLUMN_DEFS.map((col, index) => {
                    const checked = selectedColumns.has(col.id);
                    return (
                      <label
                        key={col.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 border-b border-gray-100 px-3 py-2.5 text-[13px] text-gray-800 last:border-b-0",
                          checked ? "bg-[#ebf5ff]" : index % 2 === 1 ? "bg-white" : "bg-[#f8fafc]/80",
                        )}
                      >
                        <input
                          suppressHydrationWarning
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleColumn(col.id)}
                          className="h-4 w-4 rounded border-gray-300 text-[#1a56db] focus:ring-[#1a56db]"
                        />
                        {col.label}
                      </label>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 px-5 py-4">
          <button
            suppressHydrationWarning
            type="button"
            onClick={onClose}
            className="rounded border border-[#1a56db] bg-white px-5 py-2 text-sm font-medium text-[#1a56db] shadow-sm transition-colors hover:bg-blue-50"
          >
            Cancel
          </button>
          <button
            suppressHydrationWarning
            type="button"
            onClick={onClose}
            className={cn("rounded px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors", PRIMARY)}
          >
            Export Your Data
          </button>
        </div>
      </div>
    </div>,
    mainEl,
  );
}
