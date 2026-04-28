"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  HardDrive,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type { PropertyInfoRow } from "./property-information-modal";

const PRIMARY = "rounded-md bg-[#1a56db] px-5 py-2 text-sm font-medium text-white hover:bg-blue-700";
const SECONDARY = "rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50";
const ORANGE_BTN = "rounded-md bg-[#f97316] px-4 py-2 text-sm font-medium text-white hover:bg-orange-600";
const DANGER_CLEAR = "rounded-md bg-rose-100 px-5 py-2 text-sm font-medium text-rose-800 hover:bg-rose-200";

const fieldClass =
  "w-full rounded border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none transition-colors focus:border-[#1a56db]";
const labelClass = "mb-1.5 block text-[13px] font-bold text-gray-700";

const CC_OPTS = ["91 (IN)", "1 (US)", "44 (UK)"];
const MOCK_CONTACTS = ["Existing — Aman Dubey", "Existing — Priya S."];
const COMPANIES = ["Balaji Realty Pvt Ltd", "Silver Developers", "Prime Estates"];
const EXECS = ["Aman Dubey", "Ajay Jaiswal", "Priya Jagtap"];
const STAGES = ["OPEN", "New", "Active", "Negotiation", "Closed"];
const SUB_TYPES = ["Flat", "Villa", "Shop", "Office", "Plot"];
const UNIT_TYPES = ["1bhk", "2bhk", "3bhk", "4bhk", "Other"];
const PROP_TYPES = ["Residential", "Commercial", "Plot", "Industrial"];
const AVAIL_FOR = ["Sale", "Rent", "Lease"];
const ALLOWED_FOR = ["Any", "Family", "Bachelor", "Company"];
const FACING = ["East", "West", "North", "South", "North-East"];
const FURNISH = ["Unfurnished", "Semi-Furnished", "Furnished"];
const AREA_METRICS = ["Sq. Ft", "Sq. M", "Acres"];
const PROJECTS = ["Balaji Symphony", "Silver Heights", "House Demo"];
const AUTHORITIES = ["Select authority", "Municipal", "Developer", "Other"];
const LAND_ZONES = ["Select Land Zone", "Residential", "Commercial", "Industrial"];

const SAMPLE_EDIT_IMAGE = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=320&q=80";

function parseDMY(s: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s.trim());
  if (!m) return "";
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}

function digitsFromMobile(m: string): string {
  return m.replace(/^\+91-?/, "").replace(/\D/g, "");
}

function expectationDigits(exp: string): string {
  return exp.replace(/[₹,\s]/g, "").replace(/[^\d.]/g, "") || "";
}

function formatINRFromDigits(d: string): string {
  const n = Number(d);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);
}

function amountWordsDemo(n: number): string {
  if (n === 5_800_000) return "fifty eight lakh";
  return "";
}

function socialDescFromRow(row: PropertyInfoRow): string {
  if (row.sr === 1) {
    return `** 🏠 *Super Buildup Area :* 750 Sq. Ft 🏠 *Buildup Area :* 750 Sq. Ft 🏠 *Carpet Area :* 493 Sq. Ft 🛋️ *Furnished :* UNFURNISHED 🏠 *Address :* Marathon Nexzone, Panvel, Navi Mumbai, Maharashtra 410221, India For more details contact *FD Makan* 🤵 Aman Dubey 📞 9987401146`;
  }
  return `${row.details} — ${row.propertyId}. Contact ${row.ownerName}.`;
}

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

function Req({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children} <span className="text-red-500">*</span>
    </>
  );
}

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      suppressHydrationWarning
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 rounded-full border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:ring-offset-1",
        checked ? "bg-[#1a56db]" : "bg-gray-300",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-6 w-6 translate-y-px rounded-full bg-white shadow ring-0 transition-transform",
          checked ? "translate-x-[1.35rem]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function PhoneField({
  label,
  required,
  cc,
  phone,
  onCc,
  onPhone,
  placeholder,
}: {
  label: React.ReactNode;
  required?: boolean;
  cc: string;
  phone: string;
  onCc: (v: string) => void;
  onPhone: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col">
      <label className={labelClass}>{required ? <Req>{label}</Req> : label}</label>
      <div className="flex rounded border border-gray-300 bg-white shadow-sm">
        <select
          suppressHydrationWarning
          value={cc}
          onChange={(e) => onCc(e.target.value)}
          className="max-w-[7rem] shrink-0 rounded-l border-0 border-r border-gray-300 bg-gray-50 px-2 py-2 text-[12px] text-gray-800 outline-none"
        >
          {CC_OPTS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          suppressHydrationWarning
          type="tel"
          value={phone}
          onChange={(e) => onPhone(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-r border-0 px-3 py-2 text-[13px] text-gray-800 outline-none"
        />
      </div>
    </div>
  );
}

function SectionCard({ title, headerRight, children }: { title: string; headerRight?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h3 className="text-[15px] font-bold text-gray-800">{title}</h3>
        {headerRight}
      </div>
      <div className="p-4 md:p-5">{children}</div>
    </section>
  );
}

function RichToolbar() {
  const btns = ["B", "I", "U", "S", "</>", '"', "•", "1.", "Heading", "🔗", "A", "≡"];
  return (
    <div className="mb-2 flex flex-wrap gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1.5">
      {btns.map((b) => (
        <button
          suppressHydrationWarning
          key={b}
          type="button"
          className="rounded px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-200"
        >
          {b}
        </button>
      ))}
    </div>
  );
}

export function AddPropertyModal({
  open,
  onClose,
  editRow = null,
}: {
  open: boolean;
  onClose: () => void;
  editRow?: PropertyInfoRow | null;
}) {
  const isEdit = Boolean(editRow);

  const [contactPick, setContactPick] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerCc, setOwnerCc] = useState("91 (IN)");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [secCc, setSecCc] = useState("91 (IN)");
  const [secPhone, setSecPhone] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [email, setEmail] = useState("");
  const [ownership, setOwnership] = useState("");
  const [company, setCompany] = useState("");
  const [salesAgent, setSalesAgent] = useState("");
  const [stage, setStage] = useState("");
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);

  const [subType, setSubType] = useState("");
  const [unitType, setUnitType] = useState("");
  const [salesExpectation, setSalesExpectation] = useState("");
  const [pricePerSqftSaleable, setPricePerSqftSaleable] = useState("");
  const [pricePerSqftCarpet, setPricePerSqftCarpet] = useState("");
  const [perSqFtLumpsum, setPerSqFtLumpsum] = useState("");
  const [termsDetail, setTermsDetail] = useState("");
  const [authority, setAuthority] = useState("");
  const [landApproval, setLandApproval] = useState("");
  const [landZone, setLandZone] = useState("");
  const [imgDesc, setImgDesc] = useState("");
  const [imgCategory, setImgCategory] = useState("");

  const [propType, setPropType] = useState("");
  const [availFor, setAvailFor] = useState("");
  const [allowedFor, setAllowedFor] = useState("");
  const [buildFace, setBuildFace] = useState("");
  const [entFace, setEntFace] = useState("");
  const [availFrom, setAvailFrom] = useState("");
  const [furnish, setFurnish] = useState("Unfurnished");
  const [urlTitle, setUrlTitle] = useState("");
  const [urlDesc, setUrlDesc] = useState("");

  const [areaMetric, setAreaMetric] = useState("Sq. Ft");
  const [superBuilt, setSuperBuilt] = useState("");
  const [builtUp, setBuiltUp] = useState("");
  const [carpet, setCarpet] = useState("");
  const [terrace, setTerrace] = useState("");
  const [loading, setLoading] = useState("");
  const [plotL, setPlotL] = useState("");
  const [plotB, setPlotB] = useState("");

  const [amenities, setAmenities] = useState("");
  const [floorOn, setFloorOn] = useState("");
  const [bedRooms, setBedRooms] = useState("");
  const [totalFloors, setTotalFloors] = useState("");
  const [bath, setBath] = useState("");
  const [balconies, setBalconies] = useState("");
  const [propAge, setPropAge] = useState("");
  const [parking, setParking] = useState("");
  const [keyWith, setKeyWith] = useState("");
  const [vastu, setVastu] = useState(false);

  const [searchLoc, setSearchLoc] = useState("");
  const [projectName, setProjectName] = useState("");
  const [unitNo, setUnitNo] = useState("");
  const [wing, setWing] = useState("");
  const [street, setStreet] = useState("");
  const [location, setLocation] = useState("");
  const [subLoc, setSubLoc] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [country, setCountry] = useState("");
  const [lat, setLat] = useState("19.2184");
  const [lng, setLng] = useState("73.0867");

  const [tenantName, setTenantName] = useState("");
  const [leaseStart, setLeaseStart] = useState("");
  const [leaseEnd, setLeaseEnd] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [occupant, setOccupant] = useState("");

  const [externalComments, setExternalComments] = useState("");
  const [internalComments, setInternalComments] = useState("");
  const [socialDesc, setSocialDesc] = useState("");

  const [videoRows, setVideoRows] = useState<{ id: string; url: string }[]>([{ id: "v1", url: "" }]);

  const reset = useCallback(() => {
    setContactPick("");
    setOwnerName("");
    setOwnerCc("91 (IN)");
    setOwnerPhone("");
    setSecCc("91 (IN)");
    setSecPhone("");
    setOwnerAddress("");
    setEmail("");
    setOwnership("");
    setCompany("");
    setSalesAgent("");
    setStage("");
    setFeatured(false);
    setPublished(false);
    setSubType("");
    setUnitType("");
    setSalesExpectation("");
    setPricePerSqftSaleable("");
    setPricePerSqftCarpet("");
    setPerSqFtLumpsum("");
    setTermsDetail("");
    setAuthority("");
    setLandApproval("");
    setLandZone("");
    setImgDesc("");
    setImgCategory("");
    setPropType("");
    setAvailFor("");
    setAllowedFor("");
    setBuildFace("");
    setEntFace("");
    setAvailFrom("");
    setFurnish("Unfurnished");
    setUrlTitle("");
    setUrlDesc("");
    setAreaMetric("Sq. Ft");
    setSuperBuilt("");
    setBuiltUp("");
    setCarpet("");
    setTerrace("");
    setLoading("");
    setPlotL("");
    setPlotB("");
    setAmenities("");
    setFloorOn("");
    setBedRooms("");
    setTotalFloors("");
    setBath("");
    setBalconies("");
    setPropAge("");
    setParking("");
    setKeyWith("");
    setVastu(false);
    setSearchLoc("");
    setProjectName("");
    setUnitNo("");
    setWing("");
    setStreet("");
    setLocation("");
    setSubLoc("");
    setArea("");
    setLandmark("");
    setPincode("");
    setStateVal("");
    setCountry("");
    setLat("19.2184");
    setLng("73.0867");
    setTenantName("");
    setLeaseStart("");
    setLeaseEnd("");
    setMonthlyRent("");
    setDeposit("");
    setOccupant("");
    setExternalComments("");
    setInternalComments("");
    setSocialDesc("");
    setVideoRows([{ id: "v1", url: "" }]);
  }, []);

  const hydrateFromRow = useCallback((row: PropertyInfoRow) => {
    setContactPick("");
    setOwnerName(row.ownerName);
    setOwnerCc("91 (IN)");
    setOwnerPhone(digitsFromMobile(row.ownerMobile));
    setSecCc("91 (IN)");
    setSecPhone("");
    setOwnerAddress("");
    setEmail(row.ownerEmail || "");
    setOwnership("");
    setCompany("");
    setSalesAgent("");
    setFeatured(false);
    setPublished(false);

    setPropType(row.inventoryType);
    setAvailFor(row.availableFor);
    setAllowedFor(row.allowedFor);
    setAvailFrom(parseDMY(row.availableFrom));
    setFurnish(row.sr === 1 ? "Unfurnished" : "Unfurnished");
    setUrlTitle("");
    setUrlDesc("");

    setSalesExpectation(expectationDigits(row.expectation));

    if (row.sr === 1) {
      setStage("OPEN");
      setSubType("Flat");
      setUnitType("2bhk");
      setBuildFace("East");
      setEntFace("East");
      setPricePerSqftSaleable("");
      setPricePerSqftCarpet("");
      setPerSqFtLumpsum("");
      setTermsDetail("");
      setAuthority("");
      setAreaMetric("Sq. Ft");
      setSuperBuilt("750");
      setBuiltUp("750");
      setCarpet("493");
      setTerrace("");
      setLoading("52.13");
      setPlotL("");
      setPlotB("");
      setAmenities("");
      setFloorOn("15");
      setBedRooms("1");
      setTotalFloors("27");
      setBath("2");
      setBalconies("1");
      setPropAge("");
      setParking("1");
      setKeyWith("");
      setVastu(false);
      setLandApproval("");
      setLandZone("");
      setSearchLoc("");
      setProjectName("");
      setUnitNo("");
      setWing("");
      setStreet("Marathon Nexzone, Panvel, Navi Mumbai, Maharashtra 410221, India");
      setLocation("Navi Mumbai");
      setSubLoc("Panvel");
      setArea("Marathon Nexzone");
      setLandmark("");
      setPincode("410221");
      setStateVal("Maharashtra");
      setCountry("India");
      setLat("18.9656615");
      setLng("73.128322");
      setTenantName("");
      setLeaseStart("1901-01-01");
      setLeaseEnd("1901-01-01");
      setMonthlyRent("");
      setDeposit("");
      setOccupant("");
      setExternalComments("vsycuvs");
      setInternalComments("cydwvcyuw");
      setSocialDesc("");
      setImgDesc("");
      setImgCategory("");
      setVideoRows([{ id: "v1", url: "" }]);
      return;
    }

    setStage(row.status === "Open" ? "OPEN" : "");
    setSubType("Flat");
    setUnitType("");
    setBuildFace("");
    setEntFace("");
    setPricePerSqftSaleable("");
    setPricePerSqftCarpet("");
    setPerSqFtLumpsum("");
    setTermsDetail("");
    setAuthority("");
    setAreaMetric("Sq. Ft");
    setSuperBuilt("");
    setBuiltUp("");
    setCarpet("");
    setTerrace("");
    setLoading("");
    setPlotL("");
    setPlotB("");
    setAmenities("");
    setFloorOn(row.floor);
    setBedRooms("");
    setTotalFloors("");
    setBath("");
    setBalconies("");
    setPropAge("");
    setParking("");
    setKeyWith("");
    setVastu(false);
    setLandApproval("");
    setLandZone("");
    setSearchLoc("");
    setProjectName(row.projectDetails !== "—" ? row.projectDetails : "");
    setUnitNo("");
    setWing("");
    setStreet(
      row.projectDetails !== "—"
        ? `${row.projectDetails}, ${row.location}, Maharashtra, India`
        : `${row.location}, Maharashtra, India`,
    );
    const locParts = row.location.split(",").map((s) => s.trim());
    setLocation(locParts[0] ?? "");
    setSubLoc(locParts[1] ?? "");
    setArea(row.projectDetails !== "—" ? row.projectDetails : "");
    setLandmark("");
    setPincode("");
    setStateVal("Maharashtra");
    setCountry("India");
    setLat("19.2184");
    setLng("73.0867");
    setTenantName("");
    setLeaseStart("");
    setLeaseEnd("");
    setMonthlyRent("");
    setDeposit("");
    setOccupant("");
    setExternalComments("");
    setInternalComments("");
    setSocialDesc("");
    setImgDesc("");
    setImgCategory("");
    setVideoRows([{ id: "v1", url: "" }]);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (editRow) hydrateFromRow(editRow);
    else reset();
  }, [open, editRow, hydrateFromRow, reset]);

  const addVideoRow = () => setVideoRows((r) => [...r, { id: `v-${Date.now()}`, url: "" }]);

  const salesNum = Number(salesExpectation.replace(/\D/g, ""));
  const salesFormatted = formatINRFromDigits(salesExpectation.replace(/\D/g, ""));
  const salesWords = Number.isFinite(salesNum) ? amountWordsDemo(salesNum) : "";

  if (!open) return null;

  const selectClasses = `${fieldClass} appearance-none pr-9`;

  return (
    <FullscreenPage>
      <div role="dialog" aria-modal="true" aria-labelledby="add-property-title" className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <h2 id="add-property-title" className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Property" : "Add Property"}
          </h2>
          <div className="flex items-center gap-2">
            {isEdit ? (
              <button
                suppressHydrationWarning
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded bg-[#f97316] text-white shadow-sm hover:bg-orange-600"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
            ) : null}
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

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6">
          <div className="mx-auto max-w-6xl space-y-5 pb-28">
            <SectionCard
              title={isEdit ? "Owner Details (Edit)" : "Owner Details (Create)"}
              headerRight={
                <div className="relative min-w-[200px] max-w-full sm:min-w-[260px]">
                  <select
                    suppressHydrationWarning
                    value={contactPick}
                    onChange={(e) => setContactPick(e.target.value)}
                    className={selectClasses}
                  >
                    <option value="">Search & Select Contacts</option>
                    {MOCK_CONTACTS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              }
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex flex-col">
                  <label className={labelClass}>
                    <Req>Owner Name</Req>
                  </label>
                  <input
                    suppressHydrationWarning
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Owner Name"
                    className={fieldClass}
                  />
                </div>
                <PhoneField
                  label="Owner Contact"
                  required
                  cc={ownerCc}
                  phone={ownerPhone}
                  onCc={setOwnerCc}
                  onPhone={setOwnerPhone}
                  placeholder="Phone number (9767654343)"
                />
                <PhoneField
                  label="Secondary Contact"
                  cc={secCc}
                  phone={secPhone}
                  onCc={setSecCc}
                  onPhone={setSecPhone}
                  placeholder="Phone number (9767654343, 9876543210)"
                />
                <div className="flex flex-col">
                  <label className={labelClass}>Owner Address</label>
                  <input
                    suppressHydrationWarning
                    value={ownerAddress}
                    onChange={(e) => setOwnerAddress(e.target.value)}
                    placeholder="Owner Address"
                    className={fieldClass}
                  />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Email</label>
                  <input
                    suppressHydrationWarning
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email - abc@xyz.com"
                    className={fieldClass}
                  />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Ownership</label>
                  <input
                    suppressHydrationWarning
                    value={ownership}
                    onChange={(e) => setOwnership(e.target.value)}
                    placeholder="Ownership"
                    className={fieldClass}
                  />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Company</label>
                  <div className="relative">
                    <select suppressHydrationWarning value={company} onChange={(e) => setCompany(e.target.value)} className={selectClasses}>
                      <option value="">Select Company</option>
                      {COMPANIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Sales Agent</label>
                  <div className="relative">
                    <select suppressHydrationWarning value={salesAgent} onChange={(e) => setSalesAgent(e.target.value)} className={selectClasses}>
                      <option value="">Select Executive</option>
                      {EXECS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Select Stage</label>
                  <div className="relative">
                    <select suppressHydrationWarning value={stage} onChange={(e) => setStage(e.target.value)} className={selectClasses}>
                      <option value="">Select Stage</option>
                      {STAGES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="flex flex-col gap-2 md:col-span-1">
                  <span className={labelClass}>Mark As IsFeatured</span>
                  <Toggle id="feat" checked={featured} onChange={setFeatured} />
                </div>
                <div className="flex flex-col gap-2 md:col-span-1">
                  <span className={labelClass}>Mark As Published</span>
                  <Toggle id="pub" checked={published} onChange={setPublished} />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Property Details">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex flex-col">
                  <label className={labelClass}>
                    <Req>Type of Property</Req>
                  </label>
                  <div className="relative">
                    <select suppressHydrationWarning value={propType} onChange={(e) => setPropType(e.target.value)} className={selectClasses}>
                      <option value="">Select Property Type</option>
                      {PROP_TYPES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Sub Type</label>
                  <div className="relative">
                    <select suppressHydrationWarning value={subType} onChange={(e) => setSubType(e.target.value)} className={selectClasses}>
                      <option value="">Select Sub Type</option>
                      {SUB_TYPES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Unit Type</label>
                  <div className="relative">
                    <select suppressHydrationWarning value={unitType} onChange={(e) => setUnitType(e.target.value)} className={selectClasses}>
                      <option value="">Select Unit Type</option>
                      {UNIT_TYPES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>
                    <Req>Available For</Req>
                  </label>
                  <div className="relative">
                    <select suppressHydrationWarning value={availFor} onChange={(e) => setAvailFor(e.target.value)} className={selectClasses}>
                      <option value="">Available For</option>
                      {AVAIL_FOR.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Allowed For</label>
                  <div className="relative">
                    <select suppressHydrationWarning value={allowedFor} onChange={(e) => setAllowedFor(e.target.value)} className={selectClasses}>
                      <option value="">Select Allowed For</option>
                      {ALLOWED_FOR.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Building Facing</label>
                  <div className="relative">
                    <select suppressHydrationWarning value={buildFace} onChange={(e) => setBuildFace(e.target.value)} className={selectClasses}>
                      <option value="">Select Building Facing</option>
                      {FACING.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Entrance Facing</label>
                  <div className="relative">
                    <select suppressHydrationWarning value={entFace} onChange={(e) => setEntFace(e.target.value)} className={selectClasses}>
                      <option value="">Select Facing</option>
                      {FACING.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Available From Date</label>
                  <div className="flex overflow-hidden rounded border border-gray-300 shadow-sm">
                    <input
                      suppressHydrationWarning
                      type="date"
                      value={availFrom}
                      onChange={(e) => setAvailFrom(e.target.value)}
                      className="min-w-0 flex-1 border-0 px-3 py-2 text-[13px] outline-none"
                    />
                    <button suppressHydrationWarning type="button" tabIndex={-1} className="border-l border-gray-300 bg-gray-50 px-3 text-gray-600">
                      <CalendarDays className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Furnish Status</label>
                  <div className="relative">
                    <select suppressHydrationWarning value={furnish} onChange={(e) => setFurnish(e.target.value)} className={`${selectClasses} pr-16`}>
                      <option value="">—</option>
                      {FURNISH.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <button
                      suppressHydrationWarning
                      type="button"
                      className="absolute right-8 top-1/2 z-10 -translate-y-1/2 rounded p-0.5 text-gray-500 hover:bg-gray-100"
                      onClick={() => setFurnish("")}
                      aria-label="Clear furnish"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="mb-1.5 flex items-center gap-2">
                    <label className="text-[13px] font-bold text-gray-700">Url Title</label>
                    <button suppressHydrationWarning type="button" className="text-[#1a56db] hover:opacity-80" aria-label="Refresh URL title">
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    suppressHydrationWarning
                    value={urlTitle}
                    onChange={(e) => setUrlTitle(e.target.value)}
                    placeholder="Url Title - e.g.( CCT Tower )"
                    className={fieldClass}
                  />
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label className={labelClass}>Url Description</label>
                  <input
                    suppressHydrationWarning
                    value={urlDesc}
                    onChange={(e) => setUrlDesc(e.target.value)}
                    placeholder="Url Description - e.g.( 1Bhk,2BHk, Prime Location Mumbai )"
                    className={fieldClass}
                  />
                </div>
              </div>
            </SectionCard>

            {isEdit ? (
              <SectionCard title="Terms Details">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex flex-col">
                    <label className={labelClass}>
                      Sales Expectation{" "}
                      <span className="font-normal text-gray-600">
                        ({salesFormatted !== "—" ? salesFormatted : "₹0.00"})
                      </span>
                    </label>
                    <input
                      suppressHydrationWarning
                      inputMode="numeric"
                      value={salesExpectation}
                      onChange={(e) => setSalesExpectation(e.target.value)}
                      placeholder="5800000"
                      className={fieldClass}
                    />
                    {salesWords ? <p className="mt-1 text-[12px] text-gray-600">{salesWords}</p> : null}
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Price Per SqFt Saleable Area</label>
                    <input
                      suppressHydrationWarning
                      value={pricePerSqftSaleable}
                      onChange={(e) => setPricePerSqftSaleable(e.target.value)}
                      placeholder="Price Per SqFt By SaleableArea"
                      className={fieldClass}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Price Per SqFt Carpet Area</label>
                    <input
                      suppressHydrationWarning
                      value={pricePerSqftCarpet}
                      onChange={(e) => setPricePerSqftCarpet(e.target.value)}
                      placeholder="Price Per SqFt By CarpetArea"
                      className={fieldClass}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Sq.ft./Lumpsum</label>
                    <input
                      suppressHydrationWarning
                      value={perSqFtLumpsum}
                      onChange={(e) => setPerSqFtLumpsum(e.target.value)}
                      placeholder="Per Sq.ft./Lumpsum"
                      className={fieldClass}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Terms</label>
                    <input
                      suppressHydrationWarning
                      value={termsDetail}
                      onChange={(e) => setTermsDetail(e.target.value)}
                      placeholder="Terms"
                      className={fieldClass}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Authority</label>
                    <div className="relative">
                      <select suppressHydrationWarning value={authority} onChange={(e) => setAuthority(e.target.value)} className={selectClasses}>
                        {AUTHORITIES.map((c) => (
                          <option key={c} value={c === "Select authority" ? "" : c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>
              </SectionCard>
            ) : null}

            <SectionCard title="Dimension">
              <div className="grid grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className={labelClass}>Area Metric</label>
                    <div className="relative">
                      <select suppressHydrationWarning value={areaMetric} onChange={(e) => setAreaMetric(e.target.value)} className={`${selectClasses} pr-14`}>
                        <option value="">—</option>
                        {AREA_METRICS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <button
                        suppressHydrationWarning
                        type="button"
                        className="absolute right-8 top-1/2 z-10 -translate-y-1/2 rounded p-0.5 text-gray-500 hover:bg-gray-100"
                        onClick={() => setAreaMetric("")}
                        aria-label="Clear area metric"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Super Buildup Area/Total Area</label>
                    <input suppressHydrationWarning value={superBuilt} onChange={(e) => setSuperBuilt(e.target.value)} placeholder="Super Buildup Area" className={fieldClass} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Buildup Area</label>
                    <input suppressHydrationWarning value={builtUp} onChange={(e) => setBuiltUp(e.target.value)} placeholder="Buildup Area" className={fieldClass} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Carpet Area</label>
                    <input suppressHydrationWarning value={carpet} onChange={(e) => setCarpet(e.target.value)} placeholder="Carpet Area" className={fieldClass} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Terrace Area</label>
                    <input suppressHydrationWarning value={terrace} onChange={(e) => setTerrace(e.target.value)} placeholder="Terrace Area" className={fieldClass} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className={labelClass}>Loading</label>
                    <input suppressHydrationWarning value={loading} onChange={(e) => setLoading(e.target.value)} placeholder="Loading" className={fieldClass} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Plot Length</label>
                    <input suppressHydrationWarning value={plotL} onChange={(e) => setPlotL(e.target.value)} placeholder="Dimension Length" className={fieldClass} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Plot Breadth</label>
                    <input suppressHydrationWarning value={plotB} onChange={(e) => setPlotB(e.target.value)} placeholder="Dimension Breadth" className={fieldClass} />
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Amenities">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex flex-col">
                  <label className={labelClass}>Amenities</label>
                  <div className="relative">
                    <select suppressHydrationWarning value={amenities} onChange={(e) => setAmenities(e.target.value)} className={selectClasses}>
                      <option value="">Select Amenities</option>
                      <option value="pool">Swimming Pool</option>
                      <option value="gym">Gym</option>
                      <option value="club">Clubhouse</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Bed Rooms</label>
                  <input suppressHydrationWarning value={bedRooms} onChange={(e) => setBedRooms(e.target.value)} placeholder="Bed Rooms" className={fieldClass} />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Bathroom</label>
                  <input suppressHydrationWarning value={bath} onChange={(e) => setBath(e.target.value)} placeholder="Bathroom" className={fieldClass} />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Floor On</label>
                  <input suppressHydrationWarning value={floorOn} onChange={(e) => setFloorOn(e.target.value)} placeholder="Floor On" className={fieldClass} />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Total Floors</label>
                  <input suppressHydrationWarning value={totalFloors} onChange={(e) => setTotalFloors(e.target.value)} placeholder="Total Floors" className={fieldClass} />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Balconies</label>
                  <input suppressHydrationWarning value={balconies} onChange={(e) => setBalconies(e.target.value)} placeholder="Balconies" className={fieldClass} />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Property Age</label>
                  <input suppressHydrationWarning value={propAge} onChange={(e) => setPropAge(e.target.value)} placeholder="Property Age (eg. 3)" className={fieldClass} />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Number Of Parking</label>
                  <input suppressHydrationWarning value={parking} onChange={(e) => setParking(e.target.value)} placeholder="Number Of Parking" className={fieldClass} />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Key With</label>
                  <input suppressHydrationWarning value={keyWith} onChange={(e) => setKeyWith(e.target.value)} placeholder="Key With" className={fieldClass} />
                </div>
                <div className="flex flex-col gap-2">
                  <span className={labelClass}>Vastu Compliant</span>
                  <Toggle id="vastu" checked={vastu} onChange={setVastu} />
                </div>
              </div>
            </SectionCard>

            {isEdit ? (
              <SectionCard title="Residential">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col">
                    <label className={labelClass}>Land Approval Status</label>
                    <input
                      suppressHydrationWarning
                      value={landApproval}
                      onChange={(e) => setLandApproval(e.target.value)}
                      placeholder="Land Approval Status"
                      className={fieldClass}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Land Zone</label>
                    <div className="relative">
                      <select suppressHydrationWarning value={landZone} onChange={(e) => setLandZone(e.target.value)} className={selectClasses}>
                        {LAND_ZONES.map((c) => (
                          <option key={c} value={c.startsWith("Select") ? "" : c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>
              </SectionCard>
            ) : null}

            <SectionCard title="Location Detail">
              <div className="mb-4 flex flex-col">
                <label className={labelClass}>Search Location</label>
                <input
                  suppressHydrationWarning
                  value={searchLoc}
                  onChange={(e) => setSearchLoc(e.target.value)}
                  placeholder="Enter your address"
                  className={fieldClass}
                />
              </div>
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="flex flex-col sm:col-span-1">
                    <label className={labelClass}>Project Name</label>
                    <div className="relative">
                      <select suppressHydrationWarning value={projectName} onChange={(e) => setProjectName(e.target.value)} className={selectClasses}>
                        <option value="">Select Project Name</option>
                        {PROJECTS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Unit No. / Name</label>
                    <input suppressHydrationWarning value={unitNo} onChange={(e) => setUnitNo(e.target.value)} placeholder="House/Office/PlotNo..etc" className={fieldClass} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Wing Name</label>
                    <input suppressHydrationWarning value={wing} onChange={(e) => setWing(e.target.value)} placeholder="Wing Name" className={fieldClass} />
                  </div>
                  <div className="flex flex-col sm:col-span-1">
                    <label className={labelClass}>Street Address</label>
                    <textarea suppressHydrationWarning value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Address" rows={3} className={`${fieldClass} resize-y`} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Location</label>
                    <input suppressHydrationWarning value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className={fieldClass} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Sub Location</label>
                    <input suppressHydrationWarning value={subLoc} onChange={(e) => setSubLoc(e.target.value)} placeholder="Sub Location" className={fieldClass} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Area</label>
                    <input suppressHydrationWarning value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area" className={fieldClass} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Landmark</label>
                    <input suppressHydrationWarning value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Landmark" className={fieldClass} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Pincode</label>
                    <input suppressHydrationWarning value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Pincode" className={fieldClass} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>State</label>
                    <input suppressHydrationWarning value={stateVal} onChange={(e) => setStateVal(e.target.value)} placeholder="State" className={fieldClass} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Country</label>
                    <input suppressHydrationWarning value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" className={fieldClass} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Latitude</label>
                    <input suppressHydrationWarning value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude" className={fieldClass} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Longitude</label>
                    <input suppressHydrationWarning value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Longitude" className={fieldClass} />
                  </div>
                </div>
                <div className="min-h-[280px] overflow-hidden rounded-md border border-gray-300 bg-gray-100">
                  <iframe
                    title="Location map"
                    className="h-[min(360px,50vh)] w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=72.96%2C19.17%2C73.21%2C19.26&layer=mapnik"
                  />
                  <p className="border-t border-gray-200 bg-gray-50 px-3 py-2 text-center text-[11px] text-gray-500">Map preview (OpenStreetMap)</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Pre Leased">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex flex-col">
                  <label className={labelClass}>Tenant Name</label>
                  <input suppressHydrationWarning value={tenantName} onChange={(e) => setTenantName(e.target.value)} placeholder="Tenant Name" className={fieldClass} />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Lease Start Date</label>
                  <div className="flex overflow-hidden rounded border border-gray-300 shadow-sm">
                    <input suppressHydrationWarning type="date" value={leaseStart} onChange={(e) => setLeaseStart(e.target.value)} className="min-w-0 flex-1 border-0 px-3 py-2 text-[13px] outline-none" />
                    <button suppressHydrationWarning type="button" tabIndex={-1} className="border-l border-gray-300 bg-gray-50 px-3">
                      <CalendarDays className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Lease End Date</label>
                  <div className="flex overflow-hidden rounded border border-gray-300 shadow-sm">
                    <input suppressHydrationWarning type="date" value={leaseEnd} onChange={(e) => setLeaseEnd(e.target.value)} className="min-w-0 flex-1 border-0 px-3 py-2 text-[13px] outline-none" />
                    <button suppressHydrationWarning type="button" tabIndex={-1} className="border-l border-gray-300 bg-gray-50 px-3">
                      <CalendarDays className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Monthly Rent</label>
                  <input suppressHydrationWarning value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} placeholder="Monthly Rent" className={fieldClass} />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>PreLeases-Security Deposit</label>
                  <input suppressHydrationWarning value={deposit} onChange={(e) => setDeposit(e.target.value)} placeholder="Security Deposit" className={fieldClass} />
                </div>
                <div className="flex flex-col md:col-span-1">
                  <label className={labelClass}>Occupant Details</label>
                  <textarea suppressHydrationWarning value={occupant} onChange={(e) => setOccupant(e.target.value)} placeholder="Enter Occupant Details" rows={4} className={`${fieldClass} resize-y`} />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button suppressHydrationWarning type="button" className={`${PRIMARY} inline-flex items-center gap-2`}>
                  <Save className="h-4 w-4" />
                  Save
                </button>
                <button suppressHydrationWarning type="button" className={`${DANGER_CLEAR} inline-flex items-center gap-2`}>
                  <XCircle className="h-4 w-4" />
                  Clear
                </button>
              </div>
            </SectionCard>

            <SectionCard title="Description">
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>External Comments</label>
                  <RichToolbar />
                  <textarea
                    suppressHydrationWarning
                    value={externalComments}
                    onChange={(e) => setExternalComments(e.target.value)}
                    placeholder="Description"
                    rows={6}
                    className={`${fieldClass} resize-y`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Internal Comments</label>
                  <RichToolbar />
                  <textarea
                    suppressHydrationWarning
                    value={internalComments}
                    onChange={(e) => setInternalComments(e.target.value)}
                    placeholder="Internal Comments"
                    rows={6}
                    className={`${fieldClass} resize-y`}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Upload Images">
              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="w-full min-w-[600px] border-collapse text-[13px]">
                  <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-700">
                    <tr>
                      <th className="border-b border-gray-200 px-3 py-2">#</th>
                      <th className="border-b border-gray-200 px-3 py-2">Preview</th>
                      <th className="border-b border-gray-200 px-3 py-2">Description</th>
                      <th className="border-b border-gray-200 px-3 py-2">Category</th>
                      <th className="border-b border-gray-200 px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isEdit && editRow?.sr === 1 ? (
                      <tr className="border-b border-gray-100">
                        <td className="px-3 py-2 align-middle">1</td>
                        <td className="px-3 py-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={SAMPLE_EDIT_IMAGE} alt="" className="h-16 w-24 rounded border border-gray-200 object-cover" />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            suppressHydrationWarning
                            value={imgDesc}
                            onChange={(e) => setImgDesc(e.target.value)}
                            placeholder="Description"
                            className={fieldClass}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="relative">
                            <select
                              suppressHydrationWarning
                              value={imgCategory}
                              onChange={(e) => setImgCategory(e.target.value)}
                              className={selectClasses}
                            >
                              <option value="">Select Category</option>
                              <option value="exterior">Exterior</option>
                              <option value="bedroom">Bedroom</option>
                              <option value="living">Living</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <button
                            suppressHydrationWarning
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded bg-rose-600 text-white hover:bg-rose-700"
                            aria-label="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ) : null}
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                        No Documents Found
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button suppressHydrationWarning type="button" className={`${PRIMARY} inline-flex items-center gap-2`}>
                  <HardDrive className="h-4 w-4" />
                  Choose
                </button>
                <button suppressHydrationWarning type="button" className={`${ORANGE_BTN} inline-flex items-center gap-2`}>
                  Add Link Url
                </button>
              </div>
            </SectionCard>

            <SectionCard
              title="Upload Videos"
              headerRight={
                <div className="flex gap-2">
                  <button suppressHydrationWarning type="button" className={`${PRIMARY} inline-flex items-center gap-2`}>
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                  <button suppressHydrationWarning type="button" className={`${DANGER_CLEAR} inline-flex items-center gap-2`}>
                    <XCircle className="h-4 w-4" />
                    Clear
                  </button>
                </div>
              }
            >
              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="w-full min-w-[480px] border-collapse text-[13px]">
                  <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-700">
                    <tr>
                      <th className="border-b border-gray-200 px-3 py-2">SR. NO.</th>
                      <th className="border-b border-gray-200 px-3 py-2">URL</th>
                      <th className="border-b border-gray-200 px-3 py-2">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videoRows.map((row, i) => (
                      <tr key={row.id} className="border-b border-gray-100">
                        <td className="px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2">
                          <input
                            suppressHydrationWarning
                            value={row.url}
                            onChange={(e) =>
                              setVideoRows((rows) => rows.map((r) => (r.id === row.id ? { ...r, url: e.target.value } : r)))
                            }
                            placeholder="https://"
                            className={fieldClass}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <button
                            suppressHydrationWarning
                            type="button"
                            onClick={addVideoRow}
                            className="flex h-8 w-8 items-center justify-center rounded bg-[#1a56db] text-white hover:bg-blue-700"
                            aria-label="Add video row"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard
              title="Social Description"
              headerRight={
                <div className="flex gap-2">
                  <button
                    suppressHydrationWarning
                    type="button"
                    className={PRIMARY}
                    onClick={() => editRow && setSocialDesc(socialDescFromRow(editRow))}
                  >
                    Auto Fill
                  </button>
                  <button suppressHydrationWarning type="button" className={SECONDARY} onClick={() => setSocialDesc("")}>
                    Clear
                  </button>
                </div>
              }
            >
              <textarea
                suppressHydrationWarning
                value={socialDesc}
                onChange={(e) => setSocialDesc(e.target.value)}
                placeholder="Enter Social Description"
                rows={5}
                className={`${fieldClass} resize-y`}
              />
            </SectionCard>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-gray-200 bg-white px-5 py-4">
          <button suppressHydrationWarning type="button" onClick={onClose} className={SECONDARY}>
            Cancel
          </button>
          <button suppressHydrationWarning type="button" className={PRIMARY}>
            Submit
          </button>
        </div>
      </div>
    </FullscreenPage>
  );
}
