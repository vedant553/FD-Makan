"use client";

import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useState } from "react";
import { X } from "lucide-react";

import { AddPropertyModal } from "./add-property-modal";
import { ExportInventoryModal } from "./export-inventory-modal";
import { InventoryProjectsView } from "./inventory-projects";
import { PropertyBulkUploadModal } from "./property-bulk-upload-modal";

const PRIMARY = "rounded-md bg-[#1a56db] px-6 py-2 text-sm font-medium text-white hover:bg-blue-700";
const CANCEL_BTN = "rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50";

export type PropertyKebabModal = null | "addProperty" | "addPropertyProject" | "tableDownload" | "bulkDownload" | "bulkUpload";

function CenteredModal({
  open,
  onClose,
  titleId,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  titleId: string;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const [mainEl, setMainEl] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setMainEl(document.getElementById("app-main"));
  }, []);

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
        aria-labelledby={titleId}
        className="flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-gray-800">
            {title}
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
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-gray-200 px-5 py-4">{footer}</div>
      </div>
    </div>,
    mainEl,
  );
}

function PlaceholderModal({
  open,
  onClose,
  titleId,
  title,
  description,
}: {
  open: boolean;
  onClose: () => void;
  titleId: string;
  title: string;
  description: string;
}) {
  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      titleId={titleId}
      title={title}
      footer={
        <>
          <button suppressHydrationWarning type="button" onClick={onClose} className={CANCEL_BTN}>
            Close
          </button>
          <button suppressHydrationWarning type="button" className={PRIMARY}>
            Continue
          </button>
        </>
      }
    >
      <p className="text-[13px] leading-relaxed text-gray-600">{description}</p>
    </CenteredModal>
  );
}

export function PropertyKebabModals({
  active,
  onClose,
}: {
  active: PropertyKebabModal;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!active) return;
    const main = document.getElementById("app-main");
    if (!main) return;
    const prev = main.style.overflow;
    main.style.overflow = "hidden";
    return () => {
      main.style.overflow = prev;
    };
  }, [active]);

  return (
    <>
      <AddPropertyModal open={active === "addProperty"} onClose={onClose} />
      <InventoryProjectsView open={active === "addPropertyProject"} onClose={onClose} />
      <ExportInventoryModal open={active === "tableDownload"} onClose={onClose} />
      <PlaceholderModal
        open={active === "bulkDownload"}
        onClose={onClose}
        titleId="property-bulk-download-title"
        title="Bulk Download"
        description="Download property data in bulk for offline use or reporting."
      />
      <PropertyBulkUploadModal open={active === "bulkUpload"} onClose={onClose} />
    </>
  );
}
