"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Bell, ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

/** Aligns with Property table row shape */
export type PropertyInfoRow = {
  sr: number;
  propertyId: string;
  details: string;
  inventoryType: string;
  location: string;
  visibility: string;
  ownerName: string;
  ownerEmail: string;
  ownerMobile: string;
  projectDetails: string;
  floor: string;
  availableFor: string;
  expectation: string;
  status: string | null;
  allowedFor: string;
  availability: string;
  availableFrom: string;
  createdDate: string;
};

type KVLine = { label: string; value: string };

type InventoryDetailView = {
  pageTitle: string;
  priceDisplay: string;
  galleryImages: readonly string[];
  ownerDetails: KVLine[];
  propertyDetails: KVLine[];
  dimension: KVLine[];
  amenities: KVLine[];
  locationDetails: KVLine[];
  preLeased: KVLine[];
  externalComment: string;
  internalComment: string;
};

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=960&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=960&q=80",
] as const;

const SUGGESTED_LEADS_COLUMNS = [
  "#",
  "LEAD DATE",
  "LEAD DETAILS",
  "LEAD STAGE",
  "SOURCE",
  "PROJECT",
  "SALES AGENT",
  "REQUIREMENT",
  "BUDGET",
  "REMARK",
] as const;

function formatMobile(m: string) {
  return m.replace(/^\+91-?/, "").replace(/\s/g, "");
}

function inventoryDetailForRow(row: PropertyInfoRow): InventoryDetailView {
  const mobile = formatMobile(row.ownerMobile);

  if (row.sr === 1) {
    return {
      pageTitle: "UNFURNISHED 2BHK Flat For Sale",
      priceDisplay: "₹5,800,000.00",
      galleryImages: DEFAULT_IMAGES,
      ownerDetails: [
        { label: "Name", value: row.ownerName },
        { label: "Phone", value: mobile },
        { label: "Secondary No.", value: "NA" },
        { label: "Email", value: "NA" },
        { label: "Address", value: "NA" },
        { label: "OwnerShip", value: "NA" },
        { label: "Company", value: "NA" },
      ],
      propertyDetails: [
        { label: "Property Type", value: row.inventoryType },
        { label: "SubType", value: "Flat" },
        { label: "Unit Type", value: "2bhk" },
        { label: "Available For", value: row.availableFor },
        { label: "Allowed For", value: row.allowedFor },
        { label: "Entrance Facing", value: "East" },
        { label: "Building Facing", value: "East" },
        { label: "Available From", value: row.availableFrom },
        { label: "Lock In", value: "NA" },
        { label: "Furnish", value: "Unfurnished" },
      ],
      dimension: [
        { label: "Carpet Area", value: "493 Sq. Ft" },
        { label: "Buildup Area", value: "750 Sq. Ft" },
        { label: "Super Buildup Area", value: "750 Sq. Ft" },
        { label: "Terrace Area", value: "NA" },
        { label: "Loading", value: "52.12981744421907" },
        { label: "Plot Length", value: "NA" },
        { label: "Plot Breadth", value: "NA" },
      ],
      amenities: [
        { label: "Amenities", value: "NA" },
        { label: "Bed Rooms", value: "1" },
        { label: "Bath Room", value: "2" },
        { label: "Floor On", value: row.floor },
        { label: "Total Floors", value: "27" },
        { label: "Balconies", value: "1" },
        { label: "Property Age", value: "NA" },
        { label: "Key With", value: "NA" },
        { label: "Number Of Parking", value: "1" },
        { label: "Vastu Compliant", value: "No" },
      ],
      locationDetails: [
        { label: "Project Name", value: "NA" },
        { label: "Unit Name", value: "NA" },
        { label: "Wing Name", value: "NA" },
        {
          label: "Street Address",
          value: "Marathon Nexzone, Panvel, Navi Mumbai, Maharashtra 410221, India",
        },
        { label: "Location", value: "Navi Mumbai" },
        { label: "SubLocation", value: "Panvel" },
        { label: "Area", value: "Marathon Nexzone" },
        { label: "Landmark", value: "NA" },
        { label: "Pincode", value: "410221" },
        { label: "State", value: "Maharashtra" },
        { label: "Country", value: "India" },
      ],
      preLeased: [
        { label: "Tenant Name", value: "NA" },
        { label: "Lease Start Date", value: "" },
        { label: "Lease End Date", value: "" },
        { label: "Monthly Rent", value: "NA" },
        { label: "PreLeases-Security Deposit", value: "NA" },
        { label: "Occupant Details", value: "NA" },
      ],
      externalComment: "vsycuvs",
      internalComment: "cydwvcyuw",
    };
  }

  const street =
    row.projectDetails !== "—"
      ? `${row.projectDetails}, ${row.location}, Maharashtra, India`
      : `${row.location}, Maharashtra, India`;

  return {
    pageTitle: row.details,
    priceDisplay: row.expectation,
    galleryImages: DEFAULT_IMAGES,
    ownerDetails: [
      { label: "Name", value: row.ownerName },
      { label: "Phone", value: mobile },
      { label: "Secondary No.", value: "NA" },
      { label: "Email", value: row.ownerEmail || "NA" },
      { label: "Address", value: "NA" },
      { label: "OwnerShip", value: "NA" },
      { label: "Company", value: "NA" },
    ],
    propertyDetails: [
      { label: "Property Type", value: row.inventoryType },
      { label: "SubType", value: "Flat" },
      { label: "Unit Type", value: "—" },
      { label: "Available For", value: row.availableFor },
      { label: "Allowed For", value: row.allowedFor },
      { label: "Entrance Facing", value: "NA" },
      { label: "Building Facing", value: "NA" },
      { label: "Available From", value: row.availableFrom },
      { label: "Lock In", value: "NA" },
      { label: "Furnish", value: "NA" },
    ],
    dimension: [
      { label: "Carpet Area", value: "1500 Sq. Ft" },
      { label: "Buildup Area", value: "0 Sq. Ft" },
      { label: "Super Buildup Area", value: "0 Sq. Ft" },
      { label: "Terrace Area", value: "NA" },
      { label: "Loading", value: "NA" },
      { label: "Plot Length", value: "NA" },
      { label: "Plot Breadth", value: "NA" },
    ],
    amenities: [
      { label: "Amenities", value: "NA" },
      { label: "Bed Rooms", value: "—" },
      { label: "Bath Room", value: "—" },
      { label: "Floor On", value: row.floor },
      { label: "Total Floors", value: "NA" },
      { label: "Balconies", value: "NA" },
      { label: "Property Age", value: "NA" },
      { label: "Key With", value: "NA" },
      { label: "Number Of Parking", value: "NA" },
      { label: "Vastu Compliant", value: "NA" },
    ],
    locationDetails: [
      { label: "Project Name", value: row.projectDetails !== "—" ? row.projectDetails : "NA" },
      { label: "Unit Name", value: "NA" },
      { label: "Wing Name", value: "NA" },
      { label: "Street Address", value: street },
      { label: "Location", value: row.location.split(",")[0]?.trim() ?? row.location },
      { label: "SubLocation", value: row.location.split(",")[1]?.trim() ?? "NA" },
      { label: "Area", value: row.projectDetails !== "—" ? row.projectDetails : "NA" },
      { label: "Landmark", value: "NA" },
      { label: "Pincode", value: "NA" },
      { label: "State", value: "Maharashtra" },
      { label: "Country", value: "India" },
    ],
    preLeased: [
      { label: "Tenant Name", value: "NA" },
      { label: "Lease Start Date", value: "" },
      { label: "Lease End Date", value: "" },
      { label: "Monthly Rent", value: "NA" },
      { label: "PreLeases-Security Deposit", value: "NA" },
      { label: "Occupant Details", value: "NA" },
    ],
    externalComment: "—",
    internalComment: "—",
  };
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 border-b border-gray-100 pb-2 text-[15px] font-semibold text-gray-900">{title}</h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function KVRows({ rows }: { rows: KVLine[] }) {
  return (
    <>
      {rows.map(({ label, value }) => (
        <p key={label} className="text-[13px] leading-snug text-gray-800">
          <span className="font-semibold text-gray-800">{label} :</span>{" "}
          <span className={value === "" ? "text-gray-400" : ""}>{value === "" ? "\u00a0" : value}</span>
        </p>
      ))}
    </>
  );
}

export function PropertyInformationModal({
  open,
  onClose,
  row,
}: {
  open: boolean;
  onClose: () => void;
  row: PropertyInfoRow | null;
}) {
  const [mainEl, setMainEl] = useState<HTMLElement | null>(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [leadSearch, setLeadSearch] = useState("");
  const [leadPageSize, setLeadPageSize] = useState("50");

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

  useEffect(() => {
    if (!open || !row) return;
    setImgIndex(0);
    setLeadSearch("");
    setLeadPageSize("50");
  }, [open, row]);

  const nextImg = useCallback(
    (n: number, len: number) => {
      setImgIndex((i) => (i + n + len) % len);
    },
    [],
  );

  if (!open || !mainEl || !row) return null;

  const d = inventoryDetailForRow(row);

  return createPortal(
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 backdrop-blur-[2px]" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inventory-details-heading"
        className="flex max-h-[min(94vh,920px)] w-full max-w-6xl flex-col overflow-hidden rounded-lg border border-gray-200 bg-[#f4f7f6] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 border-b border-gray-200 bg-white px-5 py-4">
          <div className="mb-1 flex items-start justify-between gap-3">
            <p className="text-xs font-medium text-gray-500">Inventory Details</p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                suppressHydrationWarning
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded bg-[#f97316] text-white shadow-sm hover:bg-orange-600"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
              <button
                suppressHydrationWarning
                type="button"
                onClick={onClose}
                className="rounded border border-gray-300 p-1.5 text-gray-600 hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <h2 id="inventory-details-heading" className="text-xl font-bold leading-tight text-gray-900">
              {d.pageTitle}
            </h2>
            <p className="shrink-0 text-xl font-bold text-gray-900 sm:text-right">{d.priceDisplay}</p>
          </div>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-4">
            {/* Row 1 */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <DetailCard title="Gallery">
                <div className="relative overflow-hidden rounded-md bg-gray-100">
                  <div className="relative aspect-[16/10] w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.galleryImages[imgIndex]} alt="" className="h-full w-full object-cover" />
                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={() => nextImg(-1, d.galleryImages.length)}
                      className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-gray-400/80 text-white hover:bg-gray-500/90"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={() => nextImg(1, d.galleryImages.length)}
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-gray-400/80 text-white hover:bg-gray-500/90"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex gap-2 border-t border-gray-200 bg-white p-2">
                    {d.galleryImages.map((src, i) => (
                      <button
                        suppressHydrationWarning
                        key={src}
                        type="button"
                        onClick={() => setImgIndex(i)}
                        className={cn(
                          "h-14 w-20 shrink-0 overflow-hidden rounded border-2 transition-colors",
                          i === imgIndex ? "border-[#1a56db]" : "border-transparent opacity-80 hover:opacity-100",
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </DetailCard>

              <DetailCard title="Owner Details">
                <KVRows rows={d.ownerDetails} />
              </DetailCard>

              <DetailCard title="Property Details">
                <KVRows rows={d.propertyDetails} />
              </DetailCard>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <DetailCard title="Dimension">
                <KVRows rows={d.dimension} />
              </DetailCard>
              <DetailCard title="Amenities">
                <KVRows rows={d.amenities} />
              </DetailCard>
              <DetailCard title="Location Details">
                <KVRows rows={d.locationDetails} />
              </DetailCard>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <DetailCard title="Pre Leased">
                <KVRows rows={d.preLeased} />
              </DetailCard>
              <DetailCard title="External Comments">
                <p className="min-h-[4rem] whitespace-pre-wrap rounded border border-gray-100 bg-gray-50/80 p-3 text-[13px] text-gray-800">
                  {d.externalComment}
                </p>
              </DetailCard>
              <DetailCard title="Internal Comments">
                <p className="min-h-[4rem] whitespace-pre-wrap rounded border border-gray-100 bg-gray-50/80 p-3 text-[13px] text-gray-800">
                  {d.internalComment}
                </p>
              </DetailCard>
            </div>

            {/* Suggested Leads */}
            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-[15px] font-semibold text-gray-900">Suggested Leads (0)</h3>
                <div className="flex flex-wrap items-center gap-2 text-[13px]">
                  <span className="font-medium text-gray-700">Filter By</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(["Location", "Budget", "Unit", "Sub Type"] as const).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded border border-gray-300 bg-gray-50 px-2 py-0.5 text-xs text-gray-700"
                      >
                        {tag} <span className="text-gray-400">×</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-3 flex flex-col gap-2 border-b border-gray-100 pb-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    suppressHydrationWarning
                    type="button"
                    className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-40"
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
                    className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-40"
                    disabled
                  >
                    Next
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex min-w-0 max-w-full items-stretch rounded border border-gray-300 bg-white shadow-sm">
                    <input
                      suppressHydrationWarning
                      type="search"
                      value={leadSearch}
                      onChange={(e) => setLeadSearch(e.target.value)}
                      placeholder="Search"
                      className="min-w-[100px] max-w-[200px] flex-1 border-0 bg-transparent px-3 py-1.5 text-[13px] outline-none"
                    />
                    <button
                      suppressHydrationWarning
                      type="button"
                      className={cn("flex shrink-0 items-center justify-center px-3 py-1.5 text-white", "bg-[#1a56db] hover:bg-blue-700")}
                      aria-label="Search leads"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => setLeadSearch("")}
                    className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="relative">
                    <select
                      suppressHydrationWarning
                      value={leadPageSize}
                      onChange={(e) => setLeadPageSize(e.target.value)}
                      className="appearance-none rounded border border-gray-300 bg-white py-1.5 pl-2 pr-8 text-[13px] text-gray-700"
                    >
                      <option value="50">50</option>
                      <option value="20">20</option>
                      <option value="100">100</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                  <thead className="bg-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-700">
                    <tr>
                      <th className="w-10 border-b border-gray-200 px-2 py-2.5">
                        <input suppressHydrationWarning type="checkbox" className="rounded border-gray-300" aria-label="Select all leads" />
                      </th>
                      {SUGGESTED_LEADS_COLUMNS.map((col) => (
                        <th key={col} className="border-b border-gray-200 px-3 py-2.5 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={11} className="px-4 py-10 text-center text-[13px] text-gray-600">
                        No Data Found
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                <button suppressHydrationWarning type="button" className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-40" disabled>
                  Previous
                </button>
                <button suppressHydrationWarning type="button" className="min-w-[2rem] rounded bg-[#1a56db] px-2 py-1 text-sm font-medium text-white">
                  1
                </button>
                <button suppressHydrationWarning type="button" className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-40" disabled>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    mainEl,
  );
}
