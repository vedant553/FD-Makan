"use client";

import { useState, type ReactNode } from "react";
import { CalendarDays, ChevronDown, X } from "lucide-react";

const PRIMARY = "bg-[#1a56db] hover:bg-blue-700";

const COUNTRY_CODES = ["91 (IN) 🇮🇳", "1 (US)", "44 (UK)"];

const MOCK_AGENTS = ["Aman Dubey", "Ajay Jaiswal", "Sakshi Pagare", "Priya Jagtap"];
const MOCK_PROJECTS = ["Balaji Symphony", "Silver Heights", "Prime Towers", "Nerul Generic"];

const fieldClass =
  "w-full rounded border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800 shadow-sm outline-none transition-colors focus:border-[#1a56db]";
const labelClass = "mb-1.5 block text-[13px] font-bold text-gray-700";

function DlSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-gray-100 bg-white p-4 shadow-sm">
      <h3 className="mb-4 border-b border-gray-100 pb-2 text-base font-bold text-gray-800">{title}</h3>
      {children}
    </section>
  );
}

function DlSelect({
  label,
  value,
  onChange,
  placeholder,
  options,
  allowClear,
}: {
  label: ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
  allowClear?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className={labelClass}>{label}</span>
      <div className="relative">
        <select
          suppressHydrationWarning
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClass} appearance-none ${allowClear && value ? "pr-20" : "pr-9"}`}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {allowClear && value ? (
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => onChange("")}
            className="absolute right-8 top-1/2 z-10 -translate-y-1/2 rounded p-0.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Clear selection"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}

function DlInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col">
      <label className={labelClass}>{label}</label>
      <input suppressHydrationWarning type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={fieldClass} />
    </div>
  );
}

function DlDateRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col">
      <label className={labelClass}>{label}</label>
      <div className="flex overflow-hidden rounded border border-gray-300 shadow-sm">
        <input suppressHydrationWarning type="date" value={value} onChange={(e) => onChange(e.target.value)} className="min-w-0 flex-1 border-0 px-3 py-2 text-[13px] text-gray-800 outline-none" />
        <button suppressHydrationWarning type="button" className="border-l border-gray-300 bg-gray-50 px-3 text-gray-600 hover:bg-gray-100" aria-label="Open calendar" tabIndex={-1}>
          <CalendarDays className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function DlPhoneBlock({
  label,
  cc,
  phone,
  onCc,
  onPhone,
  placeholder,
}: {
  label: string;
  cc: string;
  phone: string;
  onCc: (v: string) => void;
  onPhone: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col">
      <label className={labelClass}>{label}</label>
      <div className="flex gap-2">
        <div className="relative w-[min(140px,38%)] shrink-0">
          <select suppressHydrationWarning value={cc} onChange={(e) => onCc(e.target.value)} className={`${fieldClass} appearance-none pr-8`}>
            {COUNTRY_CODES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        </div>
        <input suppressHydrationWarning type="tel" value={phone} onChange={(e) => onPhone(e.target.value)} placeholder={placeholder} className={`${fieldClass} min-w-0 flex-1`} />
      </div>
    </div>
  );
}

function DlTextarea({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div className="flex flex-col">
      <label className={labelClass}>{label}</label>
      <textarea suppressHydrationWarning value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={`${fieldClass} resize-y`} />
    </div>
  );
}

export type DetailedLeadDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function DetailedLeadDrawer({ open, onClose }: DetailedLeadDrawerProps) {
  const [contactSearch, setContactSearch] = useState("");
  const [leadDate, setLeadDate] = useState("2026-04-26");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [primaryCc, setPrimaryCc] = useState(COUNTRY_CODES[0]);
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [secondaryCc, setSecondaryCc] = useState(COUNTRY_CODES[0]);
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [alternateNumbers, setAlternateNumbers] = useState("");
  const [visitorType, setVisitorType] = useState("");
  const [leadStage, setLeadStage] = useState("");
  const [leadCategory, setLeadCategory] = useState("");
  const [channelPartner, setChannelPartner] = useState("");
  const [sourcingManager, setSourcingManager] = useState("");
  const [source, setSource] = useState("");
  const [preSalesAgent, setPreSalesAgent] = useState("");
  const [salesAgent, setSalesAgent] = useState("Aman Dubey");
  const [coOwner, setCoOwner] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [dob, setDob] = useState("");
  const [anniversary, setAnniversary] = useState("");
  const [tags, setTags] = useState("");
  const [relatedSource, setRelatedSource] = useState<"yes" | "no">("no");

  const [propertyType, setPropertyType] = useState("");
  const [furnishRequirement, setFurnishRequirement] = useState("Furnished");
  const [requirement, setRequirement] = useState("Sale");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");
  const [areaMetric, setAreaMetric] = useState("Sq. Ft");
  const [requirementsRemark, setRequirementsRemark] = useState("");

  const [searchLocation, setSearchLocation] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [location, setLocation] = useState("");
  const [subLocation, setSubLocation] = useState("");
  const [areaField, setAreaField] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [stateField, setStateField] = useState("");
  const [countryLoc, setCountryLoc] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [interestedProject, setInterestedProject] = useState("");
  const [timeline, setTimeline] = useState("");

  const [employmentType, setEmploymentType] = useState("");
  const [income, setIncome] = useState("");
  const [designation, setDesignation] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [ethnicity, setEthnicity] = useState("");

  if (!open) return null;

  const grid3 = "grid grid-cols-1 gap-4 lg:grid-cols-3";

  return (
    <div className={`fixed inset-0 z-[90] transition-all duration-300 ${open ? "pointer-events-auto bg-black/35" : "pointer-events-none bg-black/0"}`}>
      <button suppressHydrationWarning type="button" onClick={onClose} className="absolute inset-0 h-full w-full cursor-default" aria-label="Close drawer backdrop" />
      <div
        className={`absolute right-0 top-0 flex h-full w-full max-w-5xl flex-col overflow-hidden bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-gray-200 px-4 py-3 md:px-6">
          <h2 className="min-w-0 flex-1 text-lg font-semibold text-gray-800">Lead Details (New)</h2>
          <div className="relative min-w-[200px] max-w-[min(100%,280px)] flex-1 md:flex-initial">
            <select
              suppressHydrationWarning
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              className={`${fieldClass} appearance-none pr-9 text-gray-500`}
            >
              <option value="">Search & Select Contacts</option>
              <option value="existing1">Existing Contact A</option>
              <option value="existing2">Existing Contact B</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          <button suppressHydrationWarning type="button" onClick={onClose} className="shrink-0 rounded border border-gray-500 p-1 text-gray-600 hover:bg-gray-100" aria-label="Close detailed lead drawer">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6">
          <div className="space-y-6 pb-4">
            <div className={grid3}>
              <DlDateRow label="Date" value={leadDate} onChange={setLeadDate} />
              <DlInput label="First Name" value={firstName} onChange={setFirstName} placeholder="First Name" />
              <DlInput label="Last Name" value={lastName} onChange={setLastName} placeholder="Last Name" />
            </div>

            <div className={grid3}>
              <DlInput label="Email" value={email} onChange={setEmail} placeholder="Email" type="email" />
              <DlPhoneBlock
                label="Primary Phone"
                cc={primaryCc}
                phone={primaryPhone}
                onCc={setPrimaryCc}
                onPhone={setPrimaryPhone}
                placeholder="Primary Phone Number (9767654343)"
              />
              <DlPhoneBlock
                label="Secondary Phone"
                cc={secondaryCc}
                phone={secondaryPhone}
                onCc={setSecondaryCc}
                onPhone={setSecondaryPhone}
                placeholder="Secondary Phone Number (9999555500)"
              />
            </div>

            <div className={grid3}>
              <DlInput label="Alternate Numbers" value={alternateNumbers} onChange={setAlternateNumbers} placeholder="Phone number (9767654343,9876543210)" />
              <DlSelect label="Type of Visitor" value={visitorType} onChange={setVisitorType} placeholder="Type of Visitor" options={["Owner", "Broker", "Investor", "Other"]} />
              <DlSelect label="Lead Stage" value={leadStage} onChange={setLeadStage} placeholder="Select Lead Stage" options={["New", "Follow Up", "Prospect", "Booked"]} />
            </div>

            <div className={grid3}>
              <DlSelect label="Lead Category" value={leadCategory} onChange={setLeadCategory} placeholder="Select Lead Category" options={["Hot", "Warm", "Cold", "Unqualified"]} />
              <DlSelect
                label={
                  <span className="inline-flex flex-wrap items-center gap-0.5">
                    <span>Channel Partner (</span>
                    <button suppressHydrationWarning type="button" className="font-bold text-[#1a56db] hover:underline" onClick={() => {}}>
                      + Add Channel Partner
                    </button>
                    <span>)</span>
                  </span>
                }
                value={channelPartner}
                onChange={setChannelPartner}
                placeholder="Search & Select Channel Partner"
                options={["Partner A", "Partner B", "Partner C"]}
              />
              <DlSelect label="Sourcing Manager" value={sourcingManager} onChange={setSourcingManager} placeholder="Select Sourcing Manager" options={MOCK_AGENTS} />
            </div>

            <div className={grid3}>
              <DlSelect label="Source" value={source} onChange={setSource} placeholder="Select Source" options={["FB", "IG", "Walk-in", "Magicbricks", "Other"]} />
              <DlSelect label="Pre Sales Agent" value={preSalesAgent} onChange={setPreSalesAgent} placeholder="Select Pre Sales Agent" options={MOCK_AGENTS} />
              <DlSelect label="Sales Agent" value={salesAgent} onChange={setSalesAgent} placeholder="Select Sales Agent" options={MOCK_AGENTS} allowClear />
            </div>

            <div className={grid3}>
              <DlSelect label="Co-Owner" value={coOwner} onChange={setCoOwner} placeholder="Select Co-Owner" options={MOCK_AGENTS} />
              <DlInput label="Address" value={address} onChange={setAddress} placeholder="Address" />
              <DlSelect label="Country" value={country} onChange={setCountry} placeholder="Select Lead Country" options={["India", "United States", "United Kingdom", "UAE"]} />
            </div>

            <div className={grid3}>
              <DlDateRow label="Date Of Birth" value={dob} onChange={setDob} />
              <DlDateRow label="Date of Anniversary" value={anniversary} onChange={setAnniversary} />
              <div className="hidden lg:block" aria-hidden />
            </div>

            <div>
              <DlInput label="Tags" value={tags} onChange={setTags} placeholder="Select Or Enter Tags" />
            </div>

            <div className="rounded-md border border-gray-100 bg-white p-4 shadow-sm">
              <span className={labelClass}>Is Related Source?</span>
              <div className="mt-2 flex flex-wrap items-center gap-6">
                <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-gray-700">
                  <input suppressHydrationWarning type="radio" name="relatedSource" checked={relatedSource === "yes"} onChange={() => setRelatedSource("yes")} className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500" />
                  Yes
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-gray-700">
                  <input suppressHydrationWarning type="radio" name="relatedSource" checked={relatedSource === "no"} onChange={() => setRelatedSource("no")} className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500" />
                  No
                </label>
              </div>
            </div>

            <DlSection title="Requirements">
              <div className="space-y-4">
                <div className={grid3}>
                  <DlSelect label="Property Type" value={propertyType} onChange={setPropertyType} placeholder="Select Property Type" options={["Apartment", "Villa", "Plot", "Commercial"]} />
                  <DlSelect label="Furnish Requirement" value={furnishRequirement} onChange={setFurnishRequirement} placeholder="Select Furnish" options={["Furnished", "Semi-Furnished", "Unfurnished"]} allowClear />
                  <DlSelect label="Requirement" value={requirement} onChange={setRequirement} placeholder="Select Requirement" options={["Sale", "Rent", "Lease"]} allowClear />
                </div>
                <div className={grid3}>
                  <DlSelect label="Budget Min" value={budgetMin} onChange={setBudgetMin} placeholder="Select Budget Minimum" options={["50L", "75L", "1Cr", "1.5Cr"]} />
                  <DlSelect label="Budget Max" value={budgetMax} onChange={setBudgetMax} placeholder="Select Budget Maximum" options={["75L", "1Cr", "1.5Cr", "2Cr+"]} />
                  <DlSelect label="Minimum Area In Sq. Ft" value={minArea} onChange={setMinArea} placeholder="Select Minimum Area" options={["500", "750", "1000", "1500"]} />
                </div>
                <div className={grid3}>
                  <DlSelect label="Maximum Area In Sq. Ft" value={maxArea} onChange={setMaxArea} placeholder="Select Maximum Area" options={["1000", "1500", "2000", "3000+"]} />
                  <DlSelect label="Area Metric" value={areaMetric} onChange={setAreaMetric} placeholder="Select Metric" options={["Sq. Ft", "Sq. M", "Acres"]} allowClear />
                  <div className="hidden lg:block" />
                </div>
                <DlTextarea label="Remark" value={requirementsRemark} onChange={setRequirementsRemark} placeholder="Add Remark" rows={4} />
              </div>
            </DlSection>

            <DlSection title="Location Detail">
              <div className="space-y-4">
                <DlInput label="Search Location" value={searchLocation} onChange={setSearchLocation} placeholder="Enter your address" />
                <div className={grid3}>
                  <DlTextarea label="Street Address" value={streetAddress} onChange={setStreetAddress} placeholder="Address" rows={4} />
                  <DlInput label="Location" value={location} onChange={setLocation} placeholder="Location" />
                  <DlInput label="Sub Location" value={subLocation} onChange={setSubLocation} placeholder="Sub Location" />
                </div>
                <div className={grid3}>
                  <DlInput label="Area" value={areaField} onChange={setAreaField} placeholder="Area" />
                  <DlInput label="Landmark" value={landmark} onChange={setLandmark} placeholder="Landmark" />
                  <DlInput label="Pincode" value={pincode} onChange={setPincode} placeholder="Pincode" />
                </div>
                <div className={grid3}>
                  <DlInput label="State" value={stateField} onChange={setStateField} placeholder="State" />
                  <DlInput label="Country" value={countryLoc} onChange={setCountryLoc} placeholder="Country" />
                  <DlInput label="Latitude" value={latitude} onChange={setLatitude} placeholder="Latitude" />
                </div>
                <div className="grid grid-cols-1 gap-4 lg:max-w-[calc(33.333%-0.5rem)]">
                  <DlInput label="Longitude" value={longitude} onChange={setLongitude} placeholder="Longitude" />
                </div>
              </div>
            </DlSection>

            <DlSection title="Interested Projects">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <div className="min-w-0 flex-1">
                  <DlSelect label="Project" value={interestedProject} onChange={setInterestedProject} placeholder="Search & Select Project" options={MOCK_PROJECTS} />
                </div>
                <button suppressHydrationWarning type="button" className={`shrink-0 rounded px-4 py-2 text-[13px] font-medium text-white ${PRIMARY}`}>
                  + Add Project
                </button>
                <div className="min-w-0 flex-1">
                  <DlSelect label="Timeline" value={timeline} onChange={setTimeline} placeholder="Select Timeline" options={["Immediate", "1–3 months", "3–6 months", "6+ months"]} />
                </div>
              </div>
            </DlSection>

            <DlSection title={"Employment & Other Details"}>
              <div className="space-y-4">
                <div className={grid3}>
                  <DlSelect label="Employment Type" value={employmentType} onChange={setEmploymentType} placeholder="Select EmploymentType" options={["Salaried", "Self-employed", "Business", "Retired", "Other"]} />
                  <DlInput label="Income" value={income} onChange={setIncome} placeholder="Income" />
                  <DlInput label="Designation" value={designation} onChange={setDesignation} placeholder="Designation" />
                </div>
                <div className={grid3}>
                  <DlInput label="Company Name" value={companyName} onChange={setCompanyName} placeholder="Company Name" />
                  <DlSelect label="Ethnicity" value={ethnicity} onChange={setEthnicity} placeholder="Select Ethnicity" options={["—", "Asian", "European", "Other"]} />
                  <div className="hidden lg:block" />
                </div>
              </div>
            </DlSection>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 bg-white px-4 py-4 md:px-6">
          <button suppressHydrationWarning type="button" onClick={onClose} className="bg-[#d9dde4] px-6 py-2 text-[15px] font-medium text-[#3a3f52] transition-colors hover:bg-[#cdd2db]">
            Cancel
          </button>
          <button suppressHydrationWarning type="button" onClick={onClose} className={`px-6 py-2 text-[15px] font-medium text-white transition-colors ${PRIMARY}`}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
