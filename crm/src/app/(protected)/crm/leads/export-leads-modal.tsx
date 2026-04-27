"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

import { cn } from "@/lib/utils";

const PRIMARY = "bg-[#1a56db] hover:bg-blue-700";

/** Exportable columns (merged from Table Download / CRM lead export references). */
const EXPORT_COLUMN_DEFS = [
  { id: "leadId", label: "Lead Id" },
  { id: "date", label: "Date" },
  { id: "assignedDate", label: "Assigned Date" },
  { id: "status", label: "Status" },
  { id: "name", label: "Name" },
  { id: "primaryNo", label: "Primary No" },
  { id: "secondaryNo", label: "Secondary No" },
  { id: "email", label: "Email" },
  { id: "leadStage", label: "Lead Stage" },
  { id: "companyStageReason", label: "Company Stage Reason" },
  { id: "source", label: "Source" },
  { id: "subSource", label: "Sub Source" },
  { id: "project", label: "Project" },
  { id: "tags", label: "Tags" },
  { id: "preSalesAgent", label: "Pre Sales Agent" },
  { id: "salesAgent", label: "Sales Agent" },
  { id: "coOwners", label: "Co-Owners" },
  { id: "channelPartner", label: "Channel Partner" },
  { id: "sourcingManager", label: "Sourcing Manager" },
  { id: "category", label: "Category" },
  { id: "visitorType", label: "Visitor Type" },
  { id: "requirement", label: "Requirement" },
  { id: "subLocation", label: "Sub Location" },
  { id: "budget", label: "Budget" },
  { id: "remark", label: "Remark" },
  { id: "siteVisit", label: "Site Visit" },
  { id: "lastActivity", label: "Last Activity" },
  { id: "lastAssigned", label: "Last Assigned" },
  { id: "employmentType", label: "Employment Type" },
  { id: "income", label: "Income" },
  { id: "designation", label: "Designation" },
  { id: "ethnicity", label: "Ethnicity" },
  { id: "companyName", label: "Company Name" },
  { id: "companyAddress", label: "Company Address" },
  { id: "campaign", label: "Campaign" },
  { id: "campaignChannel", label: "Campaign Channel" },
  { id: "adName", label: "Ad Name" },
  { id: "utmParameter", label: "UTM Parameter" },
  { id: "firstStageName", label: "First Stage Name" },
  { id: "firstStageUpdatedDate", label: "First Stage Updated Date" },
] as const;

const DEFAULT_SELECTED_IDS = EXPORT_COLUMN_DEFS.slice(0, 22).map((c) => c.id);

function buildInitialSelection() {
  return new Set<string>(DEFAULT_SELECTED_IDS);
}

export function ExportLeadsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [fileName, setFileName] = useState("Leads");
  const [showDetails, setShowDetails] = useState<"yes" | "no">("yes");
  const [fileType, setFileType] = useState<"xlsx" | "csv" | "pdf">("xlsx");
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(buildInitialSelection);
  const [columnsExpanded, setColumnsExpanded] = useState(true);

  const selectedCount = selectedColumns.size;

  const selectAll = useCallback(() => {
    setSelectedColumns(new Set(EXPORT_COLUMN_DEFS.map((c) => c.id)));
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
    setFileName("Leads");
    setShowDetails("yes");
    setFileType("xlsx");
    setSelectedColumns(buildInitialSelection());
    setColumnsExpanded(true);
  }, [open]);

  const allIds = useMemo(() => new Set(EXPORT_COLUMN_DEFS.map((c) => c.id)), []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-leads-title"
        className="flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-md border border-gray-100 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 id="export-leads-title" className="text-lg font-semibold text-[#1e293b]">
            Export Leads Data
          </h2>
          <button suppressHydrationWarning type="button" onClick={onClose} className="rounded border border-gray-400 p-1 text-gray-600 hover:bg-gray-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div>
            <label className="mb-1.5 block text-[13px] font-bold text-[#1e293b]" htmlFor="export-file-name">
              File Name
            </label>
            <input suppressHydrationWarning
              id="export-file-name"
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
                  <input suppressHydrationWarning
                    type="radio"
                    name="showDetails"
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
                  <input suppressHydrationWarning
                    type="radio"
                    name="fileType"
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
              <button suppressHydrationWarning
                type="button"
                onClick={() => setColumnsExpanded((e) => !e)}
                className="flex w-full items-center justify-between gap-2 border-b border-gray-100 bg-[#f8fafc] px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
              >
                <span className="rounded-full bg-[#e5efff] px-3 py-0.5 text-xs font-semibold text-[#1a56db]">
                  {selectedCount} columns are selected
                </span>
                {columnsExpanded ? <ChevronUp className="h-4 w-4 shrink-0 text-gray-500" /> : <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />}
              </button>
              {columnsExpanded ? (
                <div className="max-h-[min(280px,40vh)] overflow-y-auto">
                  {EXPORT_COLUMN_DEFS.map((col, index) => {
                    const checked = selectedColumns.has(col.id);
                    return (
                      <label
                        key={col.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 border-b border-gray-100 px-3 py-2.5 text-[13px] text-gray-800 last:border-b-0",
                          checked ? "bg-[#ebf5ff]" : index % 2 === 1 ? "bg-white" : "bg-[#f8fafc]/80",
                        )}
                      >
                        <input suppressHydrationWarning
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
          <button suppressHydrationWarning type="button" onClick={onClose} className="rounded border border-[#1a56db] bg-white px-5 py-2 text-sm font-medium text-[#1a56db] shadow-sm transition-colors hover:bg-blue-50">
            Cancel
          </button>
          <button suppressHydrationWarning type="button" onClick={onClose} className={`rounded px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors ${PRIMARY}`}>
            Export Your Data
          </button>
        </div>
      </div>
    </div>
  );
}
