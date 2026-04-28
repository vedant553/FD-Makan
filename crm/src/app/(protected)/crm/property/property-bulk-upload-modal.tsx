"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, CloudUpload, X } from "lucide-react";

const BULK_ENTITY_OPTIONS = ["Inventories"] as const;

function FullscreenPage({ children }: { children: React.ReactNode }) {
  const [mainEl, setMainEl] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    setMainEl(document.getElementById("app-main"));
  }, []);
  if (!mainEl) return null;
  return createPortal(
    <div className="absolute inset-0 z-[100] flex min-h-0 flex-col bg-[#f4f7f6]">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 md:p-6">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">{children}</div>
      </div>
    </div>,
    mainEl,
  );
}

/** Property kebab — Bulk Upload: step 1 Add Excel, entity Inventories, sample file + Next. */
export function PropertyBulkUploadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [entity, setEntity] = useState<(typeof BULK_ENTITY_OPTIONS)[number]>("Inventories");
  const [entityMenuOpen, setEntityMenuOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const entityRef = useRef<HTMLDivElement>(null);

  const onPickFile = useCallback((list: FileList | null) => {
    const f = list?.[0];
    if (f) setFile(f);
  }, []);

  useEffect(() => {
    if (!open || !entityMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (entityRef.current && !entityRef.current.contains(e.target as Node)) setEntityMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, entityMenuOpen]);

  useEffect(() => {
    if (!open) {
      setEntityMenuOpen(false);
      setFile(null);
      setEntity("Inventories");
    }
  }, [open]);

  if (!open) return null;

  return (
    <FullscreenPage>
      <div role="dialog" aria-modal="true" aria-labelledby="property-bulk-upload-title" className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <h2 id="property-bulk-upload-title" className="text-lg font-semibold text-gray-900">
            Bulk Upload
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div ref={entityRef} className="relative flex min-w-[180px] max-w-[260px] items-stretch rounded border border-gray-300 bg-white text-sm shadow-sm">
              <button
                suppressHydrationWarning
                type="button"
                aria-expanded={entityMenuOpen}
                aria-haspopup="listbox"
                className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left hover:bg-gray-50"
                onClick={() => setEntityMenuOpen((o) => !o)}
              >
                <span className="truncate rounded-md bg-[#e5efff] px-2 py-0.5 text-[13px] font-medium text-[#1a56db]">{entity}</span>
              </button>
              <button
                suppressHydrationWarning
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEntity("Inventories");
                }}
                className="shrink-0 border-l border-gray-200 px-2.5 text-gray-500 hover:bg-gray-50"
                aria-label="Reset entity"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setEntityMenuOpen((o) => !o)}
                className="shrink-0 border-l border-gray-200 px-2.5 text-gray-400 hover:bg-gray-50"
                aria-label="Open list"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              {entityMenuOpen ? (
                <ul
                  role="listbox"
                  className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
                >
                  {BULK_ENTITY_OPTIONS.map((opt) => (
                    <li key={opt}>
                      <button
                        suppressHydrationWarning
                        type="button"
                        role="option"
                        className="w-full px-3 py-2.5 text-left text-[13px] text-gray-800 hover:bg-blue-50"
                        onClick={() => {
                          setEntity(opt);
                          setEntityMenuOpen(false);
                        }}
                      >
                        {opt}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <button suppressHydrationWarning type="button" onClick={onClose} className="rounded border border-gray-400 p-1 text-gray-600 hover:bg-gray-100" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
          <div className="rounded-md border border-gray-100 bg-gray-50/50 p-5 shadow-sm md:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a56db] text-sm font-bold text-white">1</div>
              <span className="text-[15px] font-semibold text-[#1a56db]">Add Excel File</span>
            </div>

            <input suppressHydrationWarning ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => onPickFile(e.target.files)} />

            <button
              suppressHydrationWarning
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPickFile(e.dataTransfer.files);
              }}
              className="flex min-h-[220px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#93c5fd] bg-[#eff6ff]/90 px-4 py-10 transition-colors hover:border-[#1a56db]/60 hover:bg-[#dbeafe]/50"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a56db] shadow-md md:h-20 md:w-20">
                <CloudUpload className="h-9 w-9 text-white md:h-10 md:w-10" strokeWidth={1.75} aria-hidden />
              </div>
              {file ? (
                <p className="text-center text-[13px] font-medium text-gray-800">{file.name}</p>
              ) : (
                <p className="text-center text-[13px] text-gray-600">
                  Drag and drop your Excel file here, or click to browse
                </p>
              )}
            </button>

            <p className="mt-6 max-w-3xl text-[13px] leading-relaxed text-gray-600">
              Download a{" "}
              <button suppressHydrationWarning type="button" className="font-medium text-[#1a56db] underline hover:text-blue-800">
                Sample file
              </button>{" "}
              and compare it to your import file to ensure you have file perfect for import.
            </p>

            <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
              <button
                suppressHydrationWarning
                type="button"
                className="inline-flex items-center gap-2 rounded border border-[#1a56db] bg-white px-5 py-2 text-sm font-medium text-[#1a56db] shadow-sm transition-colors hover:bg-blue-50"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </FullscreenPage>
  );
}
