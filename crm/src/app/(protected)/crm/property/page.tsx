"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpDown,
  Binoculars,
  Building2,
  ChevronDown,
  Download,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Share2,
  Table2,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { PropertyInformationModal, type PropertyInfoRow } from "./property-information-modal";
import { AddPropertyModal } from "./add-property-modal";
import { PropertyInlineFilters } from "./property-inline-filters";
import { PropertyMapModal } from "./property-map-modal";
import { PropertyShareModal } from "./property-share-modal";
import { PropertyAddBookingModal } from "./property-add-booking-modal";
import { PropertyDeleteModal } from "./property-delete-modal";
import { PropertySuggestedLeadsModal } from "./property-suggested-leads-modal";
import { PropertyUpdateStatusModal } from "./property-update-status-modal";
import { PropertyKebabModals, type PropertyKebabModal } from "./property-kebab-modals";

const PRIMARY = "bg-[#1a56db] hover:bg-blue-700";
const ORANGE = "bg-[#f97316] hover:bg-orange-600";

const COLUMN_PRESETS = ["Default", "All columns", "Minimal"] as const;

const PROPERTY_KEBAB_ACTIONS: { id: Exclude<PropertyKebabModal, null>; label: string; Icon: LucideIcon }[] = [
  { id: "addProperty", label: "Add Property", Icon: Plus },
  { id: "addPropertyProject", label: "Add Property Project", Icon: Building2 },
  { id: "tableDownload", label: "Table Download", Icon: Download },
  { id: "bulkDownload", label: "Bulk Download", Icon: Download },
  { id: "bulkUpload", label: "Bulk Upload", Icon: Upload },
];

type RowActionId = "share" | "view" | "edit" | "updateStatus" | "suggestedLeads" | "addBooking" | "delete";

const ROW_ACTION_ITEMS: { id: RowActionId; label: string; Icon: LucideIcon; destructive?: boolean }[] = [
  { id: "share", label: "Share", Icon: Share2 },
  { id: "view", label: "View", Icon: Binoculars },
  { id: "edit", label: "Edit", Icon: Pencil },
  { id: "updateStatus", label: "Update Status", Icon: Pencil },
  { id: "suggestedLeads", label: "Suggested Leads", Icon: Table2 },
  { id: "addBooking", label: "Add Booking", Icon: Plus },
  { id: "delete", label: "Delete", Icon: Trash2, destructive: true },
];

const ROW_MENU_MIN_WIDTH = 200;
/** Approximate menu height for flip-above when near viewport bottom */
const ROW_MENU_EST_HEIGHT = 280;

function computeRowMenuPosition(trigger: DOMRectReadOnly) {
  let top = trigger.bottom + 4;
  if (top + ROW_MENU_EST_HEIGHT > window.innerHeight - 8) {
    top = Math.max(8, trigger.top - ROW_MENU_EST_HEIGHT - 4);
  }
  const left = Math.max(8, trigger.right - ROW_MENU_MIN_WIDTH);
  return { top, left };
}

const INITIAL_PROPERTY_ROWS: PropertyInfoRow[] = [
  {
    sr: 1,
    propertyId: "INV-24001",
    details: "2BHK Flat Available for SALE at Navi Mumbai",
    inventoryType: "Residential",
    location: "Navi Mumbai, Panvel",
    visibility: "",
    ownerName: "Aman Dubey",
    ownerEmail: "",
    ownerMobile: "+91-7045190486",
    projectDetails: "—",
    floor: "15",
    availableFor: "Sale",
    expectation: "₹58,00,000",
    status: "Open",
    allowedFor: "Any",
    availability: "Available",
    availableFrom: "01/12/2026",
    createdDate: "29/04/2025",
  },
  {
    sr: 2,
    propertyId: "INV-24002",
    details: "Available for Rent at Navi Mumbai",
    inventoryType: "Residential",
    location: "Navi Mumbai, Vashi",
    visibility: "",
    ownerName: "John Doe (Demo)",
    ownerEmail: "john@gmail.com",
    ownerMobile: "9999988888",
    projectDetails: "House Demo",
    floor: "3",
    availableFor: "Rent",
    expectation: "₹10,000",
    status: "Open",
    allowedFor: "Any",
    availability: "Available",
    availableFrom: "01/12/2026",
    createdDate: "29/04/2025",
  },
];

function PaginationBar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        suppressHydrationWarning
        type="button"
        className="text-sm font-medium text-gray-500 hover:text-gray-800 disabled:opacity-40"
        disabled
      >
        Previous
      </button>
      <button
        suppressHydrationWarning
        type="button"
        className="min-w-[2rem] rounded bg-[#1a56db] px-2 py-1 text-sm font-medium text-white"
      >
        1
      </button>
      <button
        suppressHydrationWarning
        type="button"
        className="text-sm font-medium text-gray-500 hover:text-gray-800 disabled:opacity-40"
        disabled
      >
        Next
      </button>
    </div>
  );
}

export default function CrmPropertyPage() {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState("20");
  const [columnPreset, setColumnPreset] = useState("");
  const [kebabOpen, setKebabOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [rowMenu, setRowMenu] = useState<{ sr: number; top: number; left: number } | null>(null);
  const [propertyKebabModal, setPropertyKebabModal] = useState<PropertyKebabModal>(null);
  const [propertyInfoRow, setPropertyInfoRow] = useState<PropertyInfoRow | null>(null);
  const [shareRow, setShareRow] = useState<PropertyInfoRow | null>(null);
  const [editRow, setEditRow] = useState<PropertyInfoRow | null>(null);
  const [updateStatusRow, setUpdateStatusRow] = useState<PropertyInfoRow | null>(null);
  const [suggestedLeadsRow, setSuggestedLeadsRow] = useState<PropertyInfoRow | null>(null);
  const [addBookingRow, setAddBookingRow] = useState<PropertyInfoRow | null>(null);
  const [deleteRow, setDeleteRow] = useState<PropertyInfoRow | null>(null);
  const [tableRows, setTableRows] = useState<PropertyInfoRow[]>(() => INITIAL_PROPERTY_ROWS.map((r) => ({ ...r })));
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const kebabRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const rowActionTriggerRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const rowActionMenuRef = useRef<HTMLDivElement>(null);

  const rowCount = tableRows.length;

  const confirmDeleteProperty = useCallback(() => {
    if (!deleteRow) return;
    const pid = deleteRow.propertyId;
    setTableRows((rows) =>
      rows.filter((r) => r.propertyId !== pid).map((r, i) => ({ ...r, sr: i + 1 })),
    );
    setPropertyInfoRow((r) => (r?.propertyId === pid ? null : r));
    setShareRow((r) => (r?.propertyId === pid ? null : r));
    setEditRow((r) => (r?.propertyId === pid ? null : r));
    setUpdateStatusRow((r) => (r?.propertyId === pid ? null : r));
    setSuggestedLeadsRow((r) => (r?.propertyId === pid ? null : r));
    setAddBookingRow((r) => (r?.propertyId === pid ? null : r));
    setDeleteRow(null);
  }, [deleteRow]);

  const handleRowAction = (row: PropertyInfoRow, id: RowActionId) => {
    setRowMenu(null);
    if (id === "view") {
      setPropertyInfoRow(row);
      return;
    }
    if (id === "share") {
      setShareRow(row);
      return;
    }
    if (id === "edit") {
      setEditRow(row);
      return;
    }
    if (id === "updateStatus") {
      setUpdateStatusRow(row);
      return;
    }
    if (id === "suggestedLeads") {
      setSuggestedLeadsRow(row);
      return;
    }
    if (id === "addBooking") {
      setAddBookingRow(row);
      return;
    }
    if (id === "delete") {
      setDeleteRow(row);
    }
  };

  useEffect(() => {
    if (viewMode !== "list") setRowMenu(null);
  }, [viewMode]);

  useEffect(() => {
    if (!kebabOpen) return;
    const onDown = (e: MouseEvent) => {
      if (kebabRef.current && !kebabRef.current.contains(e.target as Node)) setKebabOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [kebabOpen]);

  useEffect(() => {
    if (!rowMenu) return;
    const updatePosition = () => {
      const btn = rowActionTriggerRefs.current.get(rowMenu.sr);
      if (!btn) return;
      const pos = computeRowMenuPosition(btn.getBoundingClientRect());
      setRowMenu((m) => (m ? { ...m, ...pos } : null));
    };
    updatePosition();
    const scrollEl = tableScrollRef.current;
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    scrollEl?.addEventListener("scroll", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      scrollEl?.removeEventListener("scroll", updatePosition);
    };
  }, [rowMenu?.sr]);

  useEffect(() => {
    if (!rowMenu) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rowActionMenuRef.current?.contains(t)) return;
      const trig = rowActionTriggerRefs.current.get(rowMenu.sr);
      if (trig?.contains(t)) return;
      setRowMenu(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [rowMenu]);

  useEffect(() => {
    if (!rowMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRowMenu(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [rowMenu]);

  const rowMenuActiveRow = rowMenu ? tableRows.find((r) => r.sr === rowMenu.sr) : undefined;

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 font-sans text-gray-800 md:p-6">
      <h1 className="mb-4 text-lg font-semibold text-gray-800">Property</h1>

      {filtersExpanded ? <PropertyInlineFilters /> : null}

      <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-gray-800">
            Property ( {rowCount} )
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setMapModalOpen(true)}
              className="rounded border border-[#1a56db] bg-white px-4 py-2 text-sm font-medium text-[#1a56db] shadow-sm hover:bg-blue-50"
            >
              Show On Map
            </button>
            <div className="relative" ref={kebabRef}>
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setKebabOpen((o) => !o)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 shadow-sm hover:bg-gray-50"
                aria-label="More actions"
                aria-expanded={kebabOpen}
                aria-haspopup="menu"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {kebabOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-40 mt-1 min-w-[260px] rounded-md border border-gray-200 bg-white py-1 shadow-lg"
                >
                  {PROPERTY_KEBAB_ACTIONS.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      suppressHydrationWarning
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] text-gray-800 hover:bg-sky-50"
                      onClick={() => {
                        setKebabOpen(false);
                        setPropertyKebabModal(id);
                      }}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-gray-600" strokeWidth={2.25} aria-hidden />
                      {label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setFiltersExpanded((v) => !v)}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded text-white transition-shadow",
                ORANGE,
                filtersExpanded && "ring-2 ring-orange-300 ring-offset-2",
              )}
              aria-label={filtersExpanded ? "Hide filters" : "Show filters"}
              aria-expanded={filtersExpanded}
              aria-pressed={filtersExpanded}
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <PaginationBar />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="relative min-w-[140px]">
              <select
                suppressHydrationWarning
                value={columnPreset}
                onChange={(e) => setColumnPreset(e.target.value)}
                className="w-full appearance-none rounded border border-gray-300 bg-white py-2 pl-3 pr-9 text-[13px] text-gray-700 shadow-sm outline-none focus:border-[#1a56db]"
              >
                <option value="">Select Columns</option>
                {COLUMN_PRESETS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
            <button
              suppressHydrationWarning
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[#1a56db] bg-white text-[#1a56db] hover:bg-blue-50"
              aria-label="Column order"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
            <div className="flex min-w-0 max-w-full items-stretch rounded border border-gray-300 bg-white shadow-sm">
              <input
                suppressHydrationWarning
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Inventories"
                className="min-w-[120px] max-w-[200px] flex-1 border-0 bg-transparent px-3 py-2 text-[13px] text-gray-800 outline-none sm:max-w-[260px]"
              />
              <button
                suppressHydrationWarning
                type="button"
                className={cn("flex shrink-0 items-center justify-center px-3 py-2 text-white", PRIMARY)}
                aria-label="Search"
              >
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
            <div className="flex gap-1 border-l border-gray-200 pl-2">
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded border shadow-sm",
                  viewMode === "grid"
                    ? "border-[#1a56db] bg-[#e5efff] text-[#1a56db]"
                    : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50",
                )}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded border shadow-sm",
                  viewMode === "list"
                    ? "border-[#1a56db] bg-[#e5efff] text-[#1a56db]"
                    : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50",
                )}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {viewMode === "list" ? (
          <div ref={tableScrollRef} className="overflow-x-auto">
            <table className="w-full min-w-[2400px] border-collapse text-sm">
              <thead className="bg-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                <tr>
                  <th rowSpan={2} className="w-10 border-b border-gray-200 px-2 py-2.5 align-middle">
                    <span className="sr-only">Select</span>
                    <input suppressHydrationWarning type="checkbox" className="rounded border-gray-300" aria-label="Select all" />
                  </th>
                  <th rowSpan={2} className="border-b border-gray-200 px-3 py-2.5">
                    SR. NO.
                  </th>
                  <th rowSpan={2} className="border-b border-gray-200 px-3 py-2.5">
                    PROPERTY ID
                  </th>
                  <th rowSpan={2} className="border-b border-gray-200 px-3 py-2.5">
                    DETAILS
                  </th>
                  <th rowSpan={2} className="border-b border-gray-200 px-3 py-2.5">
                    INVENTORY TYPE
                  </th>
                  <th rowSpan={2} className="border-b border-gray-200 px-3 py-2.5">
                    LOCATION
                  </th>
                  <th rowSpan={2} className="border-b border-gray-200 px-3 py-2.5">
                    VISIBILITY
                  </th>
                  <th colSpan={3} className="border-b border-gray-200 px-3 py-2 text-center">
                    OWNER DETAILS
                  </th>
                  <th rowSpan={2} className="border-b border-gray-200 px-3 py-2.5">
                    PROJECT DETAILS
                  </th>
                  <th rowSpan={2} className="border-b border-gray-200 px-3 py-2.5">
                    FLOOR
                  </th>
                  <th rowSpan={2} className="border-b border-gray-200 px-3 py-2.5">
                    AVAILABLE FOR
                  </th>
                  <th rowSpan={2} className="border-b border-gray-200 px-3 py-2.5">
                    EXPECTATION
                  </th>
                  <th rowSpan={2} className="border-b border-gray-200 px-3 py-2.5">
                    STATUS
                  </th>
                  <th rowSpan={2} className="border-b border-gray-200 px-3 py-2.5">
                    ALLOWED FOR
                  </th>
                  <th rowSpan={2} className="border-b border-gray-200 px-3 py-2.5">
                    AVAILABILITY
                  </th>
                  <th rowSpan={2} className="border-b border-gray-200 px-3 py-2.5">
                    AVAILABLE FROM
                  </th>
                  <th rowSpan={2} className="border-b border-gray-200 px-3 py-2.5">
                    CREATED DATE
                  </th>
                  <th rowSpan={2} className="border-b border-gray-200 px-3 py-2.5">
                    ACTION
                  </th>
                </tr>
                <tr>
                  <th className="border-b border-gray-200 px-3 py-2">NAME</th>
                  <th className="border-b border-gray-200 px-3 py-2">EMAIL</th>
                  <th className="border-b border-gray-200 px-3 py-2">PRIMARY MOBILE</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row.propertyId} className="border-b border-gray-100 hover:bg-gray-50/80">
                    <td className="px-2 py-2.5 align-middle">
                      <input suppressHydrationWarning type="checkbox" className="rounded border-gray-300" aria-label={`Select row ${row.sr}`} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-gray-700">{row.sr}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-gray-700">{row.propertyId}</td>
                    <td className="max-w-[280px] px-3 py-2.5">
                      <button
                        suppressHydrationWarning
                        type="button"
                        className="text-left text-[13px] font-medium text-[#1a56db] hover:underline"
                        onClick={() => setPropertyInfoRow(row)}
                      >
                        {row.details}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">{row.inventoryType}</td>
                    <td className="min-w-[160px] px-3 py-2.5">{row.location}</td>
                    <td className="px-3 py-2.5 text-gray-400">{row.visibility || "—"}</td>
                    <td className="whitespace-nowrap px-3 py-2.5">{row.ownerName}</td>
                    <td className="max-w-[180px] truncate px-3 py-2.5">{row.ownerEmail || "—"}</td>
                    <td className="whitespace-nowrap px-3 py-2.5">{row.ownerMobile}</td>
                    <td className="px-3 py-2.5">{row.projectDetails}</td>
                    <td className="whitespace-nowrap px-3 py-2.5">{row.floor}</td>
                    <td className="whitespace-nowrap px-3 py-2.5">{row.availableFor}</td>
                    <td className="whitespace-nowrap px-3 py-2.5">{row.expectation}</td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {row.status ? (
                        <span className="inline-flex rounded-full bg-teal-500 px-2.5 py-0.5 text-xs font-semibold text-white">{row.status}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">{row.allowedFor}</td>
                    <td className="whitespace-nowrap px-3 py-2.5">{row.availability}</td>
                    <td className="whitespace-nowrap px-3 py-2.5">{row.availableFrom}</td>
                    <td className="whitespace-nowrap px-3 py-2.5">{row.createdDate}</td>
                    <td className="px-2 py-2.5">
                      <div className="inline-block">
                        <button
                          suppressHydrationWarning
                          type="button"
                          ref={(el) => {
                            if (el) rowActionTriggerRefs.current.set(row.sr, el);
                            else rowActionTriggerRefs.current.delete(row.sr);
                          }}
                          onClick={(e) => {
                            const btn = e.currentTarget;
                            const r = btn.getBoundingClientRect();
                            setRowMenu((prev) => {
                              if (prev?.sr === row.sr) return null;
                              const pos = computeRowMenuPosition(r);
                              return { sr: row.sr, ...pos };
                            });
                          }}
                          className={cn("flex h-8 w-8 items-center justify-center rounded text-white", PRIMARY)}
                          aria-label="Row actions"
                          aria-haspopup="menu"
                          aria-expanded={rowMenu?.sr === row.sr}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {tableRows.map((row) => (
              <div key={row.propertyId} className="flex flex-col rounded-md border border-gray-200 bg-white p-4 shadow-sm">
                <button
                  suppressHydrationWarning
                  type="button"
                  className="mb-2 text-left text-sm font-semibold text-[#1a56db] hover:underline"
                  onClick={() => setPropertyInfoRow(row)}
                >
                  {row.details}
                </button>
                <p className="text-xs text-gray-500">{row.propertyId}</p>
                <div className="mt-3 space-y-1 text-[13px] text-gray-700">
                  <p className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                    {row.location}
                  </p>
                  <p>
                    <span className="text-gray-500">Expectation: </span>
                    {row.expectation}
                  </p>
                  <p>
                    <span className="text-gray-500">For: </span>
                    {row.availableFor}
                  </p>
                </div>
                {row.status ? (
                  <span className="mt-3 inline-flex w-fit rounded-full bg-teal-500 px-2.5 py-0.5 text-xs font-semibold text-white">{row.status}</span>
                ) : null}
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-gray-200 px-4 py-3">
          <PaginationBar />
        </div>
      </div>

      <AddPropertyModal open={editRow !== null} onClose={() => setEditRow(null)} editRow={editRow} />
      <PropertyKebabModals active={propertyKebabModal} onClose={() => setPropertyKebabModal(null)} />
      <PropertyInformationModal open={propertyInfoRow !== null} onClose={() => setPropertyInfoRow(null)} row={propertyInfoRow} />
      <PropertyShareModal open={shareRow !== null} onClose={() => setShareRow(null)} row={shareRow} />
      <PropertyUpdateStatusModal open={updateStatusRow !== null} onClose={() => setUpdateStatusRow(null)} row={updateStatusRow} />
      <PropertySuggestedLeadsModal open={suggestedLeadsRow !== null} onClose={() => setSuggestedLeadsRow(null)} row={suggestedLeadsRow} />
      <PropertyAddBookingModal open={addBookingRow !== null} onClose={() => setAddBookingRow(null)} row={addBookingRow} />
      <PropertyDeleteModal open={deleteRow !== null} onClose={() => setDeleteRow(null)} row={deleteRow} onConfirm={confirmDeleteProperty} />
      <PropertyMapModal open={mapModalOpen} onClose={() => setMapModalOpen(false)} rows={tableRows} />

      {rowMenu && rowMenuActiveRow && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={rowActionMenuRef}
              role="menu"
              className="fixed z-[100] min-w-[200px] rounded-md border border-gray-200 bg-white py-1 shadow-lg"
              style={{ top: rowMenu.top, left: rowMenu.left }}
            >
              {ROW_ACTION_ITEMS.map(({ id: actionId, label, Icon, destructive }) => (
                <button
                  key={actionId}
                  suppressHydrationWarning
                  type="button"
                  role="menuitem"
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] hover:bg-sky-50",
                    destructive ? "text-rose-700 hover:bg-rose-50" : "text-gray-800",
                  )}
                  onClick={() => handleRowAction(rowMenuActiveRow, actionId)}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", destructive ? "text-rose-600" : "text-gray-600")} strokeWidth={2.25} aria-hidden />
                  {label}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
