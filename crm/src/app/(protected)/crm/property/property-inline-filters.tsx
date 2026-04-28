"use client";

import { useCallback, useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const PRIMARY = "rounded-md bg-[#1a56db] px-6 py-2 text-sm font-medium text-white hover:bg-blue-700";
const CLEAR_BTN = "rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50";

const labelClass = "mb-1.5 block text-[13px] font-bold text-gray-700";
const selectClass =
  "w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2 pr-9 text-[13px] text-gray-800 shadow-sm outline-none focus:border-[#1a56db]";

const AVAILABILITY_TYPES = ["Sale", "Rent", "Lease", "Both"] as const;
const PROPERTY_TYPES = ["Residential", "Commercial", "Plot", "Industrial"] as const;
const PROJECTS = ["Godrej City", "Balaji Symphony", "Silver Heights", "House Demo"] as const;
const STAGES = ["New", "Active", "Negotiation", "Closed"] as const;
const LOCATIONS = ["Mumbai", "Thane", "Navi Mumbai", "Panvel", "Vashi"] as const;
const SUB_LOCS = ["Panvel", "Vashi", "Andheri", "Kharghar"] as const;
const BUDGET_MIN = ["₹10 Lac", "₹25 Lac", "₹50 Lac", "₹1 Cr"] as const;
const BUDGET_MAX = ["₹50 Lac", "₹1 Cr", "₹2 Cr", "₹5 Cr"] as const;
const AREA_TYPES = ["Carpet", "Built-up", "Super Built-up"] as const;
const AREA_METRICS = ["Sq. Ft", "Sq. M"] as const;
const FURNISH = ["Unfurnished", "Semi-Furnished", "Furnished"] as const;
const SALES_AGENTS = ["Aman Dubey", "Ajay Jaiswal", "Priya Jagtap"] as const;
const STATUS_YESNO = ["Yes", "No"] as const;
const ORDER_BY = ["Created Date", "Updated Date", "Price", "Area"] as const;
const ALLOWED_FOR = ["Any", "Family", "Bachelor", "Company"] as const;

function Select({
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: readonly string[];
}) {
  return (
    <div className="flex flex-col">
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <select suppressHydrationWarning value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; id: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className={labelClass}>{label}</span>
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
            "pointer-events-none inline-block h-6 w-6 translate-y-px rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-[1.35rem]" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

type FormState = {
  availableFor: string;
  propertyType: string;
  project: string;
  stages: string;
  location: string;
  subLocation: string;
  minBudget: string;
  maxBudget: string;
  areaType: string;
  minArea: string;
  maxArea: string;
  areaMetric: string;
  furnishStatus: string;
  salesAgent: string;
  isFeatured: string;
  isPublish: string;
  orderBy: string;
  allowedFor: string;
  sortAscending: boolean;
  showUnassigned: boolean;
};

const initialForm: FormState = {
  availableFor: "",
  propertyType: "",
  project: "",
  stages: "",
  location: "",
  subLocation: "",
  minBudget: "",
  maxBudget: "",
  areaType: "",
  minArea: "",
  maxArea: "",
  areaMetric: "",
  furnishStatus: "",
  salesAgent: "",
  isFeatured: "",
  isPublish: "",
  orderBy: "Created Date",
  allowedFor: "",
  sortAscending: false,
  showUnassigned: false,
};

export function PropertyInlineFilters() {
  const [form, setForm] = useState<FormState>(initialForm);

  const patch = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const handleClear = useCallback(() => setForm(initialForm), []);

  const handleApply = useCallback(() => {
    // Hook to table query when API exists
  }, []);

  return (
    <section className="mb-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm md:p-5" aria-label="Property filters">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          label="Available For"
          value={form.availableFor}
          onChange={(v) => patch("availableFor", v)}
          placeholder="Select Availability Type"
          options={AVAILABILITY_TYPES}
        />
        <Select
          label="Type of Property"
          value={form.propertyType}
          onChange={(v) => patch("propertyType", v)}
          placeholder="Select Property Type"
          options={PROPERTY_TYPES}
        />
        <Select label="Project" value={form.project} onChange={(v) => patch("project", v)} placeholder="Select Project Name" options={PROJECTS} />
        <Select label="Stages" value={form.stages} onChange={(v) => patch("stages", v)} placeholder="Select Stage" options={STAGES} />

        <Select label="Location" value={form.location} onChange={(v) => patch("location", v)} placeholder="Select Location" options={LOCATIONS} />
        <Select label="Sub Location" value={form.subLocation} onChange={(v) => patch("subLocation", v)} placeholder="Select Sub Location" options={SUB_LOCS} />
        <Select label="Min Budget" value={form.minBudget} onChange={(v) => patch("minBudget", v)} placeholder="Select Min Budget" options={BUDGET_MIN} />
        <Select label="Max Budget" value={form.maxBudget} onChange={(v) => patch("maxBudget", v)} placeholder="Select Max Budget" options={BUDGET_MAX} />

        <Select label="Area Type" value={form.areaType} onChange={(v) => patch("areaType", v)} placeholder="Select Area Type" options={AREA_TYPES} />
        <Select label="Min Area" value={form.minArea} onChange={(v) => patch("minArea", v)} placeholder="Select Minimum Area" options={["500", "750", "1000", "1500"]} />
        <Select label="Max Area" value={form.maxArea} onChange={(v) => patch("maxArea", v)} placeholder="Select Maximum Area" options={["1500", "2000", "3000", "5000"]} />
        <Select label="Area Metric" value={form.areaMetric} onChange={(v) => patch("areaMetric", v)} placeholder="Select Area Metric" options={AREA_METRICS} />

        <Select
          label="Furnish Status"
          value={form.furnishStatus}
          onChange={(v) => patch("furnishStatus", v)}
          placeholder="Select Furnish Status"
          options={FURNISH}
        />
        <Select label="Sales Agent" value={form.salesAgent} onChange={(v) => patch("salesAgent", v)} placeholder="Select Sales Agent" options={SALES_AGENTS} />
        <Select label="Is Featured" value={form.isFeatured} onChange={(v) => patch("isFeatured", v)} placeholder="Select Status" options={STATUS_YESNO} />
        <Select label="Is Publish" value={form.isPublish} onChange={(v) => patch("isPublish", v)} placeholder="Select Status" options={STATUS_YESNO} />

        <Select label="Order By" value={form.orderBy} onChange={(v) => patch("orderBy", v)} placeholder="Order By" options={ORDER_BY} />
        <Select label="Allowed For" value={form.allowedFor} onChange={(v) => patch("allowedFor", v)} placeholder="Select Allowed For" options={ALLOWED_FOR} />
        <Toggle id="sort-asc" label="Sort Ascending" checked={form.sortAscending} onChange={(v) => patch("sortAscending", v)} />
        <Toggle id="show-unassigned" label="Show Unassigned" checked={form.showUnassigned} onChange={(v) => patch("showUnassigned", v)} />
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-4">
        <button suppressHydrationWarning type="button" onClick={handleApply} className={PRIMARY}>
          Apply
        </button>
        <button suppressHydrationWarning type="button" onClick={handleClear} className={CLEAR_BTN}>
          Clear
        </button>
      </div>
    </section>
  );
}
