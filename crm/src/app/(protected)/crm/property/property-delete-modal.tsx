"use client";

import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useState } from "react";
import { X } from "lucide-react";

import type { PropertyInfoRow } from "./property-information-modal";

const DANGER_BTN = "rounded-md bg-rose-600 px-5 py-2 text-sm font-medium text-white hover:bg-rose-700";
const SECONDARY = "rounded-md border border-gray-300 bg-gray-100 px-5 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200";

export function PropertyDeleteModal({
  open,
  onClose,
  row,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  row: PropertyInfoRow | null;
  onConfirm: () => void;
}) {
  const [mainEl, setMainEl] = useState<HTMLElement | null>(null);

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

  if (!open || !mainEl || !row) return null;

  return createPortal(
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]" role="presentation" onClick={onClose}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-property-title"
        aria-describedby="delete-property-desc"
        className="w-full max-w-md rounded-lg border border-gray-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 id="delete-property-title" className="text-lg font-semibold text-gray-900">
            Delete inventory
          </h2>
          <button suppressHydrationWarning type="button" onClick={onClose} className="rounded p-1 text-gray-500 hover:bg-gray-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-5">
          <p id="delete-property-desc" className="text-[13px] leading-relaxed text-gray-700">
            Are you sure you want to delete this record? This action cannot be undone.
          </p>
          <p className="mt-3 rounded border border-gray-100 bg-gray-50 px-3 py-2 text-[13px] font-medium text-gray-900">
            {row.propertyId}
            <span className="mt-0.5 block font-normal text-gray-600">{row.details}</span>
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 px-5 py-4">
          <button suppressHydrationWarning type="button" onClick={onClose} className={SECONDARY}>
            Cancel
          </button>
          <button suppressHydrationWarning type="button" className={DANGER_BTN} onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>,
    mainEl,
  );
}
