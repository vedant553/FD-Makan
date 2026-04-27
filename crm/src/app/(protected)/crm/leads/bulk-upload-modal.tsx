"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, CloudUpload, X } from "lucide-react";

const ENTITY_OPTIONS = ["Leads", "Contacts", "Tasks"] as const;

export function BulkUploadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [entity, setEntity] = useState<string>("Leads");
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
      if (entityRef.current && !entityRef.current.contains(e.target as Node)) {
        setEntityMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, entityMenuOpen]);

  useEffect(() => {
    if (!open) {
      setEntityMenuOpen(false);
      setFile(null);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-upload-title"
        className="w-full max-w-2xl overflow-hidden rounded-md border border-gray-100 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <h2 id="bulk-upload-title" className="text-lg font-semibold text-gray-900">
            Bulk Upload
          </h2>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div ref={entityRef} className="relative flex min-w-[180px] max-w-[240px] items-stretch rounded border border-gray-300 bg-white text-sm shadow-sm">
              <button suppressHydrationWarning
                type="button"
                aria-expanded={entityMenuOpen}
                aria-haspopup="listbox"
                aria-label="Upload entity type"
                className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1a56db]/30"
                onClick={() => setEntityMenuOpen((o) => !o)}
              >
                {entity ? (
                  <span className="truncate rounded-md bg-[#e5efff] px-2 py-0.5 text-[13px] font-medium text-[#1a56db]">{entity}</span>
                ) : (
                  <span className="text-[13px] text-gray-500">Select type</span>
                )}
              </button>
              {entity ? (
                <button suppressHydrationWarning
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEntity("");
                  }}
                  className="shrink-0 border-l border-gray-200 px-2.5 text-gray-500 hover:bg-gray-50"
                  aria-label="Clear selection"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
              <button suppressHydrationWarning
                type="button"
                onClick={() => setEntityMenuOpen((o) => !o)}
                className="shrink-0 border-l border-gray-200 px-2.5 text-gray-400 hover:bg-gray-50"
                aria-label="Open entity list"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              {entityMenuOpen ? (
                <ul
                  role="listbox"
                  className="absolute left-0 right-0 z-10 mt-1 max-h-48 overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
                >
                  {ENTITY_OPTIONS.map((opt) => (
                    <li key={opt}>
                      <button suppressHydrationWarning
                        type="button"
                        role="option"
                        aria-selected={entity === opt}
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

        <div className="px-5 py-6">
          <div className="rounded-md border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a56db] text-sm font-bold text-white">1</div>
              <span className="text-[15px] font-semibold text-[#1a56db]">Add Excel File</span>
            </div>

            <input suppressHydrationWarning ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => onPickFile(e.target.files)} />

            <button suppressHydrationWarning
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
              className="flex min-h-[220px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/80 px-4 py-10 transition-colors hover:border-[#1a56db]/50 hover:bg-gray-50"
            >
              <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1a56db] shadow-sm">
                <CloudUpload className="h-10 w-10 text-white" strokeWidth={1.75} />
              </div>
              {file ? (
                <p className="text-center text-[13px] font-medium text-gray-800">{file.name}</p>
              ) : (
                <p className="text-center text-[13px] text-gray-500">Drag and drop your Excel file here, or click to browse</p>
              )}
            </button>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-[13px] leading-relaxed text-gray-600">
                Download a{" "}
                <button suppressHydrationWarning type="button" className="font-medium text-[#1a56db] underline hover:text-blue-800">
                  Sample file
                </button>{" "}
                and compare it to your import file to ensure you have file perfect for import.
              </p>
              <button suppressHydrationWarning
                type="button"
                className="inline-flex shrink-0 items-center gap-2 self-end rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50 sm:self-auto"
              >
                <ArrowRight className="h-4 w-4" />
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
