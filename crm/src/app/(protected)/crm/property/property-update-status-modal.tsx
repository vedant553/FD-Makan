"use client";

import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";

import type { PropertyInfoRow } from "./property-information-modal";

const PRIMARY = "rounded-md bg-[#1a56db] px-5 py-2 text-sm font-medium text-white hover:bg-blue-700";
const SECONDARY = "rounded-md border border-gray-300 bg-gray-100 px-5 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200";

/** Inventory status values (dropdown scrolls when list is long). */
export const PROPERTY_STATUS_OPTIONS = [
  "Open",
  "Booked",
  "Inactive",
  "On Hold",
  "Closed",
  "Negotiation",
  "Deal Done",
  "Archived",
  "Suspended",
  "Marketing",
  "Inspection",
  "Rejected",
  "Approved",
  "Listed",
  "Sold",
  "Rented",
] as const;

export function PropertyUpdateStatusModal({
  open,
  onClose,
  row,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  row: PropertyInfoRow | null;
  /** Called with the chosen status when the user clicks Submit (optional stub until API exists). */
  onSubmit?: (propertyId: string, status: string) => void;
}) {
  const [mainEl, setMainEl] = useState<HTMLElement | null>(null);
  const [status, setStatus] = useState("");

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
    if (!open || !row) return;
    setStatus(row.status ?? "");
  }, [open, row]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mainEl || !row) return null;

  const selectClass =
    "w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2.5 pr-10 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]";

  const handleSubmit = () => {
    const next = status.trim();
    if (!next) return;
    onSubmit?.(row.propertyId, next);
    onClose();
  };

  return createPortal(
    <div
      className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-status-title"
        className="w-full max-w-md rounded-lg border border-gray-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 id="update-status-title" className="text-lg font-semibold text-gray-900">
            Update Status
          </h2>
          <button
            suppressHydrationWarning
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-5">
          <label htmlFor="update-status-select" className="mb-2 block text-[13px] font-bold text-gray-800">
            Update Status
          </label>
          <div className="relative">
            <select
              suppressHydrationWarning
              id="update-status-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={selectClass}
            >
              <option value="">Select Status</option>
              {PROPERTY_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 px-5 py-4">
          <button suppressHydrationWarning type="button" onClick={onClose} className={SECONDARY}>
            Cancel
          </button>
          <button
            suppressHydrationWarning
            type="button"
            onClick={handleSubmit}
            disabled={!status.trim()}
            className={`${PRIMARY} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>,
    mainEl,
  );
}
