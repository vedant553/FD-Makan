"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  CloudUpload,
  Minus,
  Plus,
  Search,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

const PRIMARY = "rounded-md bg-[#1a56db] px-6 py-2 text-sm font-medium text-white hover:bg-blue-700";
const CANCEL_BTN = "rounded-md bg-gray-200 px-6 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300";
const SECONDARY_BLUE = "rounded-md bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-blue-600";

const SOURCING_OPTS = ["Aman Dubey", "Ajay Jaiswal", "Priya Jagtap", "Supriya Jadhav"];
const STAGE_OPTS = ["New", "Follow Up", "Active", "Inactive", "Closed"];
const MOCK_COMPANIES = ["Balaji Realty Pvt Ltd", "Silver Developers", "Prime Estates", "Renucorp Holdings"];

const COMPANY_CATEGORY_OPTS = ["Residential", "Commercial", "Industrial", "Plot / Land", "Mixed"];

const COMPANY_TABLE_HEADERS = [
  "SR. NO.",
  "COMPANY ID",
  "COMPANY",
  "OWNER",
  "MOBILE",
  "EMAIL",
  "CATEGORY",
  "RERA NUMBER",
  "ADDRESS",
  "ACTION",
] as const;

export type ChannelPartnerKebabModal = null | "addPartner" | "company" | "bulkUpload";

/**
 * Renders over the main content column only (below navbar, beside sidebar).
 * Uses portal into `#app-main` from Shell so the shell chrome stays visible.
 */
function FullscreenPage({ children }: { children: React.ReactNode }) {
  const [mainEl, setMainEl] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setMainEl(document.getElementById("app-main"));
  }, []);

  if (!mainEl) return null;

  return createPortal(
    <div className="absolute inset-0 z-[90] flex min-h-0 flex-col bg-[#f4f7f6]">
      <div className="flex min-h-0 flex-1 flex-col p-4 md:p-6">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
          {children}
        </div>
      </div>
    </div>,
    mainEl,
  );
}

/** Centered dialog over `#app-main` (navbar + sidebar stay visible). */
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
        className="flex max-h-[min(92vh,800px)] w-full max-w-4xl flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-2xl"
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

/** Add Company — centered modal from “+ Add Company” on Channel Partner (New). */
export function AddCompanyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [countryCode, setCountryCode] = useState("91");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [alternateNumbers, setAlternateNumbers] = useState("");
  const [pan, setPan] = useState("");
  const [rera, setRera] = useState("");
  const [gst, setGst] = useState("");
  const [cin, setCin] = useState("");
  const [category, setCategory] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");

  const reset = useCallback(() => {
    setCompanyName("");
    setOwnerName("");
    setCountryCode("91");
    setMobile("");
    setEmail("");
    setAlternateNumbers("");
    setPan("");
    setRera("");
    setGst("");
    setCin("");
    setCategory("");
    setWebsite("");
    setAddress("");
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      titleId="add-company-title"
      title="Add Company"
      footer={
        <>
          <button suppressHydrationWarning type="button" className={PRIMARY} onClick={onClose}>
            Submit
          </button>
          <button suppressHydrationWarning type="button" className={CANCEL_BTN} onClick={onClose}>
            Cancel
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-gray-700">Company Name</label>
          <input
            suppressHydrationWarning
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company Name"
            className="rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-gray-700">Owner Name</label>
          <input
            suppressHydrationWarning
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Owner Name"
            className="rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-gray-700">Mobile No.</label>
          <div className="flex rounded border border-gray-300 bg-white shadow-sm">
            <div className="relative flex shrink-0 items-center border-r border-gray-300">
              <select
                suppressHydrationWarning
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="appearance-none bg-transparent py-2 pl-2 pr-7 text-[13px] text-gray-800 outline-none"
              >
                <option value="">Code</option>
                <option value="91">🇮🇳 91 (IN)</option>
                <option value="1">🇺🇸 1 (US)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setCountryCode("")}
                className="border-l border-gray-200 px-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                disabled={!countryCode}
                aria-label="Clear country code"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              suppressHydrationWarning
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Mobile No."
              className="min-w-0 flex-1 border-0 px-3 py-2 text-[13px] text-gray-800 outline-none"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-gray-700">Email Id</label>
          <input
            suppressHydrationWarning
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Id"
            className="rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-gray-700">Alternate Numbers</label>
          <input
            suppressHydrationWarning
            value={alternateNumbers}
            onChange={(e) => setAlternateNumbers(e.target.value)}
            placeholder="Alternate Numbers"
            className="rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-gray-700">PAN</label>
          <input
            suppressHydrationWarning
            value={pan}
            onChange={(e) => setPan(e.target.value)}
            placeholder="PAN"
            className="rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-gray-700">Rera No.</label>
          <input
            suppressHydrationWarning
            value={rera}
            onChange={(e) => setRera(e.target.value)}
            placeholder="Rera No.(Ex.12345)"
            className="rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-gray-700">GST</label>
          <input
            suppressHydrationWarning
            value={gst}
            onChange={(e) => setGst(e.target.value)}
            placeholder="GST"
            className="rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-gray-700">CIN</label>
          <input
            suppressHydrationWarning
            value={cin}
            onChange={(e) => setCin(e.target.value)}
            placeholder="CIN"
            className="rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-gray-700">Category</label>
          <div className="relative">
            <select
              suppressHydrationWarning
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2 pr-9 text-[13px] text-gray-700 shadow-sm outline-none focus:border-[#1a56db]"
            >
              <option value="">Select Category</option>
              {COMPANY_CATEGORY_OPTS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-1">
          <label className="text-[13px] font-bold text-gray-700">Website</label>
          <input
            suppressHydrationWarning
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="Website"
            className="rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
          />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-[13px] font-bold text-gray-700">Company Address</label>
          <textarea
            suppressHydrationWarning
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Company Address"
            rows={4}
            className="w-full resize-y rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
          />
        </div>
      </div>
    </CenteredModal>
  );
}

type LocationRow = { id: string; location: string; subLocation: string; state: string };

/** Channel Partner (New) — add single channel partner */
export function AddChannelPartnerModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);
  const [showLocationSection, setShowLocationSection] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [locationRows, setLocationRows] = useState<LocationRow[]>(() => [
    { id: "loc-1", location: "", subLocation: "", state: "" },
  ]);

  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("91");
  const [mobile, setMobile] = useState("");
  const [sourcingManager, setSourcingManager] = useState("");
  const [stage, setStage] = useState("");
  const [rera, setRera] = useState("");
  const [alternateNumbers, setAlternateNumbers] = useState("");
  const [pan, setPan] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [gst, setGst] = useState("");

  const reset = useCallback(() => {
    setAddCompanyOpen(false);
    setShowLocationSection(false);
    setLocationSearch("");
    setLocationRows([{ id: "loc-1", location: "", subLocation: "", state: "" }]);
    setCompany("");
    setName("");
    setEmail("");
    setCountryCode("91");
    setMobile("");
    setSourcingManager("");
    setStage("");
    setRera("");
    setAlternateNumbers("");
    setPan("");
    setAadhar("");
    setGst("");
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const addLocationRow = () => {
    setLocationRows((r) => [...r, { id: `loc-${Date.now()}`, location: "", subLocation: "", state: "" }]);
  };

  const removeLocationRow = (id: string) => {
    setLocationRows((r) => (r.length <= 1 ? r : r.filter((row) => row.id !== id)));
  };

  const patchLocationRow = (id: string, field: keyof Omit<LocationRow, "id">, value: string) => {
    setLocationRows((r) => r.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  if (!open) return null;

  return (
    <>
    <FullscreenPage>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cp-new-title"
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 id="cp-new-title" className="text-lg font-semibold text-gray-800">
            Channel Partner (New)
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

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1.5 lg:col-span-1">
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-[13px] font-bold text-gray-700">Company Name</label>
                <button
                  suppressHydrationWarning
                  type="button"
                  className="text-[13px] font-semibold text-[#1a56db] hover:underline"
                  onClick={() => setAddCompanyOpen(true)}
                >
                  + Add Company
                </button>
              </div>
              <div className="relative">
                <select
                  suppressHydrationWarning
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2 pr-9 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
                >
                  <option value="">Search & Select Company Name</option>
                  {MOCK_COMPANIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">Name</label>
              <input
                suppressHydrationWarning
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">Email</label>
              <input
                suppressHydrationWarning
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">Mobile No.</label>
              <div className="flex rounded border border-gray-300 bg-white shadow-sm">
                <div className="relative flex shrink-0 items-center border-r border-gray-300">
                  <select
                    suppressHydrationWarning
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="appearance-none bg-transparent py-2 pl-2 pr-7 text-[13px] text-gray-800 outline-none"
                  >
                    <option value="">Code</option>
                    <option value="91">91 (🇮🇳)</option>
                    <option value="1">1 (🇺🇸)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => setCountryCode("")}
                    className="border-l border-gray-200 px-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                    disabled={!countryCode}
                    aria-label="Clear country code"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <input
                  suppressHydrationWarning
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Mo. Number (9767654343)"
                  className="min-w-0 flex-1 border-0 px-3 py-2 text-[13px] text-gray-800 outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">Sourcing Manager</label>
              <div className="relative">
                <select
                  suppressHydrationWarning
                  value={sourcingManager}
                  onChange={(e) => setSourcingManager(e.target.value)}
                  className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2 pr-9 text-[13px] text-gray-700 shadow-sm outline-none focus:border-[#1a56db]"
                >
                  <option value="">Select Sourcing Manager</option>
                  {SOURCING_OPTS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">Stage</label>
              <div className="relative">
                <select
                  suppressHydrationWarning
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2 pr-9 text-[13px] text-gray-700 shadow-sm outline-none focus:border-[#1a56db]"
                >
                  <option value="">Select Stage</option>
                  {STAGE_OPTS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">Rera No.</label>
              <input
                suppressHydrationWarning
                value={rera}
                onChange={(e) => setRera(e.target.value)}
                placeholder="Rera No.(Ex.12345)"
                className="rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">Alternate Numbers</label>
              <input
                suppressHydrationWarning
                value={alternateNumbers}
                onChange={(e) => setAlternateNumbers(e.target.value)}
                placeholder="Phone number (9767654343,9876543210)"
                className="rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">PAN</label>
              <input
                suppressHydrationWarning
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                placeholder="Pan"
                className="rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">Aadhar</label>
              <input
                suppressHydrationWarning
                value={aadhar}
                onChange={(e) => setAadhar(e.target.value)}
                placeholder="Aadhar"
                className="rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">GST</label>
              <input
                suppressHydrationWarning
                value={gst}
                onChange={(e) => setGst(e.target.value)}
                placeholder="GST"
                className="rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              suppressHydrationWarning
              type="button"
              className={cn(SECONDARY_BLUE, "px-5")}
              onClick={() => setShowLocationSection(true)}
            >
              Add Location
            </button>
          </div>

          {showLocationSection ? (
            <div className="mt-6 rounded-md border border-gray-200 bg-white p-4 shadow-sm md:p-5">
              <label className="mb-2 block text-[13px] font-bold text-gray-700">Search & Add Location</label>
              <input
                suppressHydrationWarning
                type="text"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                placeholder="Enter your address"
                className="w-full rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]"
              />
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead className="bg-gray-100 text-left text-xs font-semibold uppercase text-gray-700">
                    <tr>
                      <th className="border-b border-gray-200 px-2 py-2">SR.NO</th>
                      <th className="border-b border-gray-200 px-2 py-2">LOCATION</th>
                      <th className="border-b border-gray-200 px-2 py-2">SUB LOCATION</th>
                      <th className="border-b border-gray-200 px-2 py-2">STATE</th>
                      <th className="border-b border-gray-200 px-2 py-2">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locationRows.map((row, idx) => (
                      <tr key={row.id} className="border-b border-gray-100">
                        <td className="px-2 py-2 align-middle text-gray-700">{idx + 1}</td>
                        <td className="px-2 py-2">
                          <input
                            suppressHydrationWarning
                            value={row.location}
                            onChange={(e) => patchLocationRow(row.id, "location", e.target.value)}
                            placeholder="Location"
                            className="w-full min-w-[100px] rounded border border-gray-300 px-2 py-1.5 text-[13px] outline-none focus:border-[#1a56db]"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            suppressHydrationWarning
                            value={row.subLocation}
                            onChange={(e) => patchLocationRow(row.id, "subLocation", e.target.value)}
                            placeholder="Sub Location"
                            className="w-full min-w-[100px] rounded border border-gray-300 px-2 py-1.5 text-[13px] outline-none focus:border-[#1a56db]"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            suppressHydrationWarning
                            value={row.state}
                            onChange={(e) => patchLocationRow(row.id, "state", e.target.value)}
                            placeholder="State"
                            className="w-full min-w-[80px] rounded border border-gray-300 px-2 py-1.5 text-[13px] outline-none focus:border-[#1a56db]"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              suppressHydrationWarning
                              type="button"
                              onClick={addLocationRow}
                              className="flex h-8 w-8 items-center justify-center rounded bg-[#1a56db] text-white hover:bg-blue-700"
                              aria-label="Add row"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              suppressHydrationWarning
                              type="button"
                              onClick={() => removeLocationRow(row.id)}
                              disabled={locationRows.length <= 1}
                              className="flex h-8 w-8 items-center justify-center rounded bg-red-500 text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="Remove row"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <button suppressHydrationWarning type="button" className={PRIMARY} onClick={onClose}>
            Submit
          </button>
          <button suppressHydrationWarning type="button" className={CANCEL_BTN} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </FullscreenPage>
    <AddCompanyModal open={addCompanyOpen} onClose={() => setAddCompanyOpen(false)} />
    </>
  );
}

function CompanyPaginationBar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button suppressHydrationWarning type="button" className="text-sm font-medium text-gray-400" disabled>
        Previous
      </button>
      <button suppressHydrationWarning type="button" className="min-w-[2rem] rounded bg-[#1a56db] px-2 py-1 text-sm font-medium text-white">
        1
      </button>
      <button suppressHydrationWarning type="button" className="text-sm font-medium text-gray-400" disabled>
        Next
      </button>
    </div>
  );
}

/** Channel Partner Company list — full-width modal */
export function ChannelPartnerCompanyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState("50");
  const rowCount = 0;
  const colCount = COMPANY_TABLE_HEADERS.length;

  useEffect(() => {
    if (!open) {
      setAddCompanyOpen(false);
      setSearch("");
      setPageSize("50");
    }
  }, [open]);

  if (!open) return null;

  return (
    <>
    <FullscreenPage>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cp-company-title"
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="flex shrink-0 flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="cp-company-title" className="text-lg font-semibold text-gray-800">
            Channel Partner Company ( {rowCount} )
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              suppressHydrationWarning
              type="button"
              className={cn("inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white", PRIMARY)}
              onClick={() => setAddCompanyOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Company
            </button>
            <button
              suppressHydrationWarning
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#153e75] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f2f5c]"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <CompanyPaginationBar />
            <div className="flex flex-wrap items-center justify-end gap-2">
              <div className="flex min-w-0 max-w-full items-stretch rounded border border-gray-300 bg-white shadow-sm">
                <input
                  suppressHydrationWarning
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search"
                  className="min-w-[120px] max-w-[200px] flex-1 border-0 bg-transparent px-3 py-2 text-[13px] outline-none"
                />
                <button
                  suppressHydrationWarning
                  type="button"
                  className="flex shrink-0 items-center justify-center bg-[#1a56db] px-3 py-2 text-white hover:bg-blue-700"
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
                aria-label="Clear"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="relative">
                <select
                  suppressHydrationWarning
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value)}
                  className="appearance-none rounded border border-gray-300 bg-white py-2 pl-3 pr-8 text-[13px] text-gray-700 shadow-sm outline-none focus:border-[#1a56db]"
                >
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full min-w-[960px] border-collapse text-sm">
            <thead className="sticky top-0 bg-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
              <tr>
                {COMPANY_TABLE_HEADERS.map((h) => (
                  <th key={h} className="whitespace-nowrap border-b border-gray-200 px-3 py-2.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={colCount} className="px-3 py-12 text-center text-gray-500">
                  No Data Found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="shrink-0 border-t border-gray-200 px-5 py-3">
          <CompanyPaginationBar />
        </div>
      </div>
    </FullscreenPage>
    <AddCompanyModal open={addCompanyOpen} onClose={() => setAddCompanyOpen(false)} />
    </>
  );
}

const BULK_ENTITY_OPTIONS = ["Channel Partners"] as const;

/** Bulk upload — entity Channel Partners, step 1 */
export function ChannelPartnerBulkUploadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [entity, setEntity] = useState("Channel Partners");
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
      setEntity("Channel Partners");
    }
  }, [open]);

  if (!open) return null;

  return (
    <FullscreenPage>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cp-bulk-upload-title"
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <h2 id="cp-bulk-upload-title" className="text-lg font-semibold text-gray-900">
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
                {entity ? (
                  <span className="truncate rounded-md bg-[#e5efff] px-2 py-0.5 text-[13px] font-medium text-[#1a56db]">{entity}</span>
                ) : (
                  <span className="text-[13px] text-gray-500">Select type</span>
                )}
              </button>
              <button
                suppressHydrationWarning
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEntity("");
                }}
                className="shrink-0 border-l border-gray-200 px-2.5 text-gray-500 hover:bg-gray-50"
                aria-label="Clear"
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
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
          <div className="rounded-md border border-gray-100 bg-gray-50/50 p-5 shadow-sm md:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a56db] text-sm font-bold text-white">
                1
              </div>
              <span className="text-[15px] font-semibold text-[#1a56db]">Add Excel File</span>
            </div>

            <input
              suppressHydrationWarning
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => onPickFile(e.target.files)}
            />

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
              className="flex min-h-[220px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/80 px-4 py-10 transition-colors hover:border-[#1a56db]/50 hover:bg-gray-50"
            >
              <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1a56db] shadow-sm">
                <CloudUpload className="h-10 w-10 text-white" strokeWidth={1.75} />
              </div>
              {file ? (
                <p className="text-center text-[13px] font-medium text-gray-800">{file.name}</p>
              ) : (
                <p className="text-center text-[13px] text-gray-500">
                  Drag and drop your Excel file here, or click to browse
                </p>
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
              <button
                suppressHydrationWarning
                type="button"
                className="inline-flex shrink-0 items-center gap-2 self-end rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 sm:self-auto"
              >
                <ArrowRight className="h-4 w-4" />
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </FullscreenPage>
  );
}

export function ChannelPartnerKebabModals({
  active,
  onClose,
}: {
  active: ChannelPartnerKebabModal;
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
      <AddChannelPartnerModal open={active === "addPartner"} onClose={onClose} />
      <ChannelPartnerCompanyModal open={active === "company"} onClose={onClose} />
      <ChannelPartnerBulkUploadModal open={active === "bulkUpload"} onClose={onClose} />
    </>
  );
}
