"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import { PageShell, Panel } from "@/components/crm/page-shell";
import { SettingsPermissionTab } from "./permission-tab";
import { SettingsTemplatesTab } from "./templates-tab";

const settingTabs = ["Masters", "Communication", "Permission", "Templates"] as const;
const masterItems = [
  "Amenities",
  "Area Range",
  "Banners",
  "Budget Range",
  "CP Company Category",
  "CP Stages",
  "Contact Category",
  "Contact Stage",
  "Contact Sub Category",
  "Contact Tags",
  "Contact Type",
  "Lead Category",
  "Lead Sources",
  "Lead Stages",
  "Lead Tags",
  "Property Stages",
  "Property Type",
  "Regions",
] as const;

type Master = (typeof masterItems)[number];

const commChannels = ["Email", "SMS", "WhatsApp", "IVR"] as const;
type CommChannel = (typeof commChannels)[number];

const ivrProviders: { id: string; name: string }[] = [
  { id: "mcube", name: "MCube" },
  { id: "knowlarity", name: "Knowlarity" },
  { id: "airson", name: "Airson" },
  { id: "exotel", name: "Exotel" },
  { id: "vanni", name: "Vanni" },
  { id: "airphone", name: "Airphone" },
  { id: "myoperator", name: "My Operator" },
  { id: "voxpro", name: "VoxPro" },
];

type BudgetRow = { name: string; amount: number };
type CpCompanyRow = { name: string; order: string };
type CpStageRow = { name: string; order: string; stage: "Start" | "Win" | "Inactive" };
type ContactCategoryRow = { name: string; code: string };
type ContactSubCategoryRow = { name: string; code: string };
type ContactTagRow = { name: string; code?: string };
type ContactTypeRow = { name: string };
type ContactStageRow = { name: string; stage: "Open" | "Prospect" | "Unqualified" };
type LeadCategoryRow = { name: string; order: string; createDate?: string; code: string };
type LeadSourceRow = { name: string; code: string };
type LeadStageRow = { name: string; order: string; stage?: "(Start)" | "(Win)" | "(Inactive)" | "(Qualified)"; category?: string };
type LeadTagRow = { name: string; code?: string };
type PropertyStageRow = { name: string; code: string; order: string; stage: "(Start)" | "(Win)" | "(Inactive)" };
type PropertyTypeRow = { name: string };
type RegionRow = { region: string };

const INITIAL_AREA = [
  "10", "20", "30", "40", "50", "60", "70", "80", "90", "100", "150", "200", "250", "300", "350", "400", "450",
  "500", "600", "700", "800", "900", "1000", "1250", "1500", "1750", "2000", "3000", "4000", "5000", "10000",
  "25000", "50000", "75000", "100000",
];

const INITIAL_BUDGET_ROWS: BudgetRow[] = (
  [
    ["5 Lac", 500000], ["10 Lac", 1000000], ["15 Lac", 1500000], ["20 Lac", 2000000], ["25 Lac", 2500000], ["30 Lac", 3000000],
    ["35 Lac", 3500000], ["40 Lac", 4000000], ["45 Lac", 4500000], ["50 Lac", 5000000], ["55 Lac", 5500000], ["60 Lac", 6000000],
    ["65 Lac", 6500000], ["70 Lac", 7000000], ["75 Lac", 7500000], ["80 Lac", 8000000], ["85 Lac", 8500000], ["90 Lac", 9000000],
    ["95 Lac", 9500000], ["1 Cr", 10000000], ["1.5 Cr", 15000000], ["2 Cr", 20000000], ["2.5 Cr", 25000000], ["3 Cr", 30000000],
    ["3.5 Cr", 35000000], ["4 Cr", 40000000], ["4.5 Cr", 45000000], ["5 Cr", 50000000], ["10 Cr", 100000000], ["15 Cr", 150000000],
    ["20 Cr", 200000000], ["30 Cr", 300000000], ["40 Cr", 400000000], ["50 Cr", 500000000],
  ] as const satisfies readonly (readonly [string, number])[]
).map(([name, amount]) => ({ name, amount }));

function formatBudgetAmount(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}.000`;
}

const INITIAL_CONTACT_TAGS: ContactTagRow[] = [
  { name: "Daimond" },
  { name: "Daimond2.0" },
  { name: "Livedata" },
  { name: "Oct21 - April25" },
];

const INITIAL_CONTACT_TYPES: ContactTypeRow[] = [
  "Buyer", "Owner", "Broker", "Other", "Builder", "Investor", "Leasee", "Builder Sales Manager", "Contractor", "Banker",
  "Existing Clients", "Team", "Doctor", "Ca / Cs", "Advocate", "IT / Ites", "Mnc.", "Business Man", "Government Employee",
].map((name) => ({ name }));

const INITIAL_LEAD_CATEGORIES: LeadCategoryRow[] = [
  { name: "Lost", order: "0", code: "5" },
  { name: "Cold", order: "0", code: "4" },
  { name: "Warm", order: "0", code: "3" },
  { name: "Hot", order: "0", code: "2" },
  { name: "Prospect", order: "0", code: "1" },
];

const INITIAL_LEAD_SOURCES: LeadSourceRow[] = [
  { name: "Buildeskmicrosite", code: "Bui" },
  { name: "Contact - Data", code: "6" },
  { name: "Fb", code: "FB" },
  { name: "Ig", code: "IG" },
  { name: "Magicbricks", code: "Maq" },
  { name: "Other", code: "OTH" },
  { name: "Portal", code: "1" },
];

const INITIAL_LEAD_STAGES: LeadStageRow[] = [
  { name: "New Lead", order: "1", stage: "(Start)" },
  { name: "Open", order: "2" },
  { name: "Follow Up", order: "3" },
  { name: "Call Back", order: "3" },
  { name: "Prospect", order: "5", stage: "(Qualified)" },
  { name: "Workable", order: "6", stage: "(Inactive)" },
  { name: "Already Tagged", order: "7" },
  { name: "Dead", order: "9", stage: "(Inactive)" },
  { name: "Booked", order: "10", stage: "(Win)" },
];

const INITIAL_PROPERTY_STAGES: PropertyStageRow[] = [
  { name: "Open", code: "OPEN", order: "0", stage: "(Start)" },
  { name: "Booked", code: "BOOKED", order: "0", stage: "(Win)" },
  { name: "Inactive", code: "INACTIVE", order: "0", stage: "(Inactive)" },
];

const INITIAL_PROPERTY_TYPES: PropertyTypeRow[] = [{ name: "Residential" }];

const INITIAL_UNIT_TYPES = [
  "1RK", "1BHK", "1.5BHK", "2BHK", "2.5BHK", "3BHK", "3.5BHK", "4BHK", "4.5BHK", "5BHK",
  "5+BHK", "1+1BHK", "Duplex", "3+1BHK", "2+1BHK", "4+BHK", "OTHER", "2+2BHK",
];

const INITIAL_SUB_TYPES = [
  "Flat", "Duplex Flat", "Bunglow", "Duplex Bunglow", "Villa", "Independent House", "Penthouse", "Guest House", "Row House & Tenament", "Other",
];

export default function ManageSettingsPage() {
  const [activeTab, setActiveTab] = useState<(typeof settingTabs)[number]>("Masters");
  const [activeMaster, setActiveMaster] = useState<Master>("Amenities");
  const [commChannel, setCommChannel] = useState<CommChannel>("Email");
  const [emailPref, setEmailPref] = useState({ name: "FD Makan", emailFrom: "aman.fdmps@gmail.com", replyTo: "aman.fdmps@gmail.com" });
  const [sendGridOn, setSendGridOn] = useState(false);
  const [smtpOn, setSmtpOn] = useState(false);
  const [textlocalOn, setTextlocalOn] = useState(false);
  const [watiOn, setWatiOn] = useState(false);
  const [watiConfigureOpen, setWatiConfigureOpen] = useState(false);
  const [watiConfig, setWatiConfig] = useState({ accessToken: "", apiEndpoint: "" });
  const [ivrEnabled, setIvrEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ivrProviders.map((p) => [p.id, false])),
  );

  const [emailProviderModal, setEmailProviderModal] = useState<null | "sendgrid" | "smtp" | "sms-textlocal">(null);
  const [smtpModalTab, setSmtpModalTab] = useState<"standard" | "userwise">("standard");
  const [sendGridApiKey, setSendGridApiKey] = useState("");
  const [textlocalApiKey, setTextlocalApiKey] = useState("");
  const [smtpBasic, setSmtpBasic] = useState({ host: "", port: "", userName: "", password: "" });
  const [smtpUserWise, setSmtpUserWise] = useState({
    salesAgentWise: false,
    accountType: "",
    hostUrl: "smtp.domain.com",
    hostPort: "0",
    email: "",
    password: "",
  });

  const [amenities, setAmenities] = useState<string[]>(["Garden", "Swimming Pool"]);
  const [areaRange, setAreaRange] = useState<string[]>(INITIAL_AREA);
  const [budgetRows, setBudgetRows] = useState<BudgetRow[]>(INITIAL_BUDGET_ROWS);
  const [cpCompanyRows, setCpCompanyRows] = useState<CpCompanyRow[]>([]);
  const [cpStageRows, setCpStageRows] = useState<CpStageRow[]>([
    { name: "Active", order: "2", stage: "Win" },
    { name: "Not Active", order: "3", stage: "Inactive" },
    { name: "Open", order: "1", stage: "Start" },
  ]);
  const [contactCategoryRows, setContactCategoryRows] = useState<ContactCategoryRow[]>([]);
  const [contactStageRows, setContactStageRows] = useState<ContactStageRow[]>([
    { name: "Unqualified", stage: "Unqualified" },
    { name: "Prospect", stage: "Prospect" },
    { name: "Open", stage: "Open" },
  ]);
  const [contactSubCategoryRows, setContactSubCategoryRows] = useState<ContactSubCategoryRow[]>([]);
  const [contactTagRows, setContactTagRows] = useState<ContactTagRow[]>(INITIAL_CONTACT_TAGS);
  const [contactTypeRows, setContactTypeRows] = useState<ContactTypeRow[]>(INITIAL_CONTACT_TYPES);
  const [leadCategoryRows, setLeadCategoryRows] = useState<LeadCategoryRow[]>(INITIAL_LEAD_CATEGORIES);
  const [leadSourceRows, setLeadSourceRows] = useState<LeadSourceRow[]>(INITIAL_LEAD_SOURCES);
  const [leadStageRows, setLeadStageRows] = useState<LeadStageRow[]>(INITIAL_LEAD_STAGES);
  const [leadTagRows, setLeadTagRows] = useState<LeadTagRow[]>([]);
  const [propertyStageRows, setPropertyStageRows] = useState<PropertyStageRow[]>(INITIAL_PROPERTY_STAGES);
  const [propertyTypeRows, setPropertyTypeRows] = useState<PropertyTypeRow[]>(INITIAL_PROPERTY_TYPES);
  const [regionRows, setRegionRows] = useState<RegionRow[]>([]);

  const [singleModal, setSingleModal] = useState<{ open: boolean; mode: "add" | "update"; value: string; index: number | null }>({
    open: false,
    mode: "add",
    value: "",
    index: null,
  });
  const [budgetModal, setBudgetModal] = useState<{ open: boolean; mode: "add" | "update"; index: number | null; name: string; amount: string }>({
    open: false,
    mode: "add",
    index: null,
    name: "",
    amount: "",
  });
  const [cpCompanyModal, setCpCompanyModal] = useState<{ open: boolean; mode: "add" | "update"; index: number | null; name: string; order: string }>({
    open: false,
    mode: "add",
    index: null,
    name: "",
    order: "",
  });
  const [cpStageModal, setCpStageModal] = useState<{ open: boolean; mode: "add" | "update"; index: number | null; name: string; order: string; stage: "Start" | "Win" | "Inactive" }>({
    open: false,
    mode: "add",
    index: null,
    name: "",
    order: "0",
    stage: "Start",
  });
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerActive, setBannerActive] = useState(false);
  const [contactCategoryModal, setContactCategoryModal] = useState<{ open: boolean; mode: "add" | "update"; index: number | null; name: string; code: string }>({
    open: false, mode: "add", index: null, name: "", code: "",
  });
  const [contactSubCategoryModal, setContactSubCategoryModal] = useState<{ open: boolean; mode: "add" | "update"; index: number | null; name: string; code: string }>({
    open: false, mode: "add", index: null, name: "", code: "",
  });
  const [contactTagModal, setContactTagModal] = useState<{ open: boolean; mode: "add" | "update"; index: number | null; name: string }>({
    open: false, mode: "add", index: null, name: "",
  });
  const [contactTypeModal, setContactTypeModal] = useState<{ open: boolean; mode: "add" | "update"; index: number | null; name: string }>({
    open: false, mode: "add", index: null, name: "",
  });
  const [contactStageModal, setContactStageModal] = useState<{ open: boolean; mode: "add" | "update"; index: number | null; name: string; stage: "Open" | "Prospect" | "Unqualified" }>({
    open: false, mode: "add", index: null, name: "", stage: "Open",
  });
  const [leadCategoryModal, setLeadCategoryModal] = useState<{ open: boolean; mode: "add" | "update"; index: number | null; name: string; code: string; order: string }>({
    open: false, mode: "add", index: null, name: "", code: "", order: "0",
  });
  const [leadSourceModal, setLeadSourceModal] = useState<{ open: boolean; mode: "add" | "update"; index: number | null; name: string; code: string }>({
    open: false, mode: "add", index: null, name: "", code: "",
  });
  const [leadSourceSubModal, setLeadSourceSubModal] = useState<{ open: boolean; value: string }>({ open: false, value: "" });
  const [leadStageModal, setLeadStageModal] = useState<{ open: boolean; mode: "add" | "update"; index: number | null; name: string; order: string; category: string; stage: "Start" | "Win" | "Inactive"; qualified: boolean }>({
    open: false, mode: "add", index: null, name: "", order: "", category: "", stage: "Start", qualified: false,
  });
  const [leadStageReasonModal, setLeadStageReasonModal] = useState<{ open: boolean; value: string }>({ open: false, value: "" });
  const [leadTagModal, setLeadTagModal] = useState<{ open: boolean; mode: "add" | "update"; index: number | null; name: string }>({
    open: false, mode: "add", index: null, name: "",
  });
  const [propertyStageModal, setPropertyStageModal] = useState<{ open: boolean; mode: "add" | "update"; index: number | null; name: string; order: string; stage: "Start" | "Win" | "Inactive" }>({
    open: false, mode: "add", index: null, name: "", order: "", stage: "Start",
  });
  const [propertyTypeModal, setPropertyTypeModal] = useState<{ open: boolean; mode: "add" | "update"; index: number | null; name: string }>({
    open: false, mode: "add", index: null, name: "",
  });
  const [unitTypeModal, setUnitTypeModal] = useState<{ open: boolean; value: string; rows: string[] }>({ open: false, value: "", rows: INITIAL_UNIT_TYPES });
  const [subTypeModal, setSubTypeModal] = useState<{ open: boolean; value: string; rows: string[] }>({ open: false, value: "", rows: INITIAL_SUB_TYPES });
  const [regionModal, setRegionModal] = useState<{ open: boolean; mode: "add" | "update"; index: number | null; value: string }>({
    open: false, mode: "add", index: null, value: "",
  });

  const count = useMemo(() => {
    if (activeMaster === "Amenities") return amenities.length;
    if (activeMaster === "Area Range") return areaRange.length;
    if (activeMaster === "Budget Range") return budgetRows.length;
    if (activeMaster === "CP Company Category") return cpCompanyRows.length;
    if (activeMaster === "CP Stages") return cpStageRows.length;
    if (activeMaster === "Contact Category") return contactCategoryRows.length;
    if (activeMaster === "Contact Stage") return contactStageRows.length;
    if (activeMaster === "Contact Sub Category") return contactSubCategoryRows.length;
    if (activeMaster === "Contact Tags") return contactTagRows.length;
    if (activeMaster === "Contact Type") return contactTypeRows.length;
    if (activeMaster === "Lead Category") return leadCategoryRows.length;
    if (activeMaster === "Lead Sources") return leadSourceRows.length;
    if (activeMaster === "Lead Stages") return leadStageRows.length;
    if (activeMaster === "Lead Tags") return leadTagRows.length;
    if (activeMaster === "Property Stages") return propertyStageRows.length;
    if (activeMaster === "Property Type") return propertyTypeRows.length;
    if (activeMaster === "Regions") return regionRows.length;
    return 0;
  }, [activeMaster, amenities, areaRange, budgetRows, cpCompanyRows, cpStageRows, contactCategoryRows.length, contactStageRows.length, contactSubCategoryRows.length, contactTagRows.length, contactTypeRows.length, leadCategoryRows.length, leadSourceRows.length, leadStageRows.length, leadTagRows.length, propertyStageRows.length, propertyTypeRows.length, regionRows.length]);

  const createLabel = useMemo(() => {
    if (activeMaster === "Amenities") return "Create Amenities";
    if (activeMaster === "Area Range") return "Create Area";
    if (activeMaster === "Banners") return "Add Banner";
    if (activeMaster === "Budget Range") return "Create Budget";
    if (activeMaster === "CP Company Category") return "Create CP Company Category";
    if (activeMaster === "CP Stages") return "Create CP Stage";
    if (activeMaster === "Contact Category") return "Create Contact Category";
    if (activeMaster === "Contact Stage") return "Create Contact Stage";
    if (activeMaster === "Contact Sub Category") return "Create Contact Sub Category";
    if (activeMaster === "Contact Tags") return "Create Contact Tags";
    if (activeMaster === "Contact Type") return "Create Contact Type";
    if (activeMaster === "Lead Category") return "Create Lead Category";
    if (activeMaster === "Lead Sources") return "Create Lead Source";
    if (activeMaster === "Lead Stages") return "Create Lead Stage";
    if (activeMaster === "Lead Tags") return "Create Lead Tags";
    if (activeMaster === "Property Stages") return "Create Property Stage";
    if (activeMaster === "Property Type") return "Create Property Type";
    if (activeMaster === "Regions") return "Create Region";
    return `Create ${activeMaster}`;
  }, [activeMaster]);

  const onCreate = () => {
    if (activeMaster === "Amenities" || activeMaster === "Area Range") {
      setSingleModal({ open: true, mode: "add", value: "", index: null });
      return;
    }
    if (activeMaster === "Banners") {
      setBannerUrl("");
      setBannerActive(false);
      setBannerModalOpen(true);
      return;
    }
    if (activeMaster === "Budget Range") {
      setBudgetModal({ open: true, mode: "add", index: null, name: "", amount: "" });
      return;
    }
    if (activeMaster === "CP Company Category") {
      setCpCompanyModal({ open: true, mode: "add", index: null, name: "", order: "" });
      return;
    }
    if (activeMaster === "CP Stages") {
      setCpStageModal({ open: true, mode: "add", index: null, name: "", order: "0", stage: "Start" });
      return;
    }
    if (activeMaster === "Contact Category") {
      setContactCategoryModal({ open: true, mode: "add", index: null, name: "", code: "" });
      return;
    }
    if (activeMaster === "Contact Stage") {
      setContactStageModal({ open: true, mode: "add", index: null, name: "", stage: "Open" });
      return;
    }
    if (activeMaster === "Contact Sub Category") {
      setContactSubCategoryModal({ open: true, mode: "add", index: null, name: "", code: "" });
      return;
    }
    if (activeMaster === "Contact Tags") {
      setContactTagModal({ open: true, mode: "add", index: null, name: "" });
      return;
    }
    if (activeMaster === "Contact Type") {
      setContactTypeModal({ open: true, mode: "add", index: null, name: "" });
      return;
    }
    if (activeMaster === "Lead Category") {
      setLeadCategoryModal({ open: true, mode: "add", index: null, name: "", code: "", order: "0" });
      return;
    }
    if (activeMaster === "Lead Sources") {
      setLeadSourceModal({ open: true, mode: "add", index: null, name: "", code: "" });
      return;
    }
    if (activeMaster === "Lead Stages") {
      setLeadStageModal({ open: true, mode: "add", index: null, name: "", order: "", category: "", stage: "Start", qualified: false });
      return;
    }
    if (activeMaster === "Lead Tags") {
      setLeadTagModal({ open: true, mode: "add", index: null, name: "" });
      return;
    }
    if (activeMaster === "Property Stages") {
      setPropertyStageModal({ open: true, mode: "add", index: null, name: "", order: "", stage: "Start" });
      return;
    }
    if (activeMaster === "Property Type") {
      setPropertyTypeModal({ open: true, mode: "add", index: null, name: "" });
      return;
    }
    if (activeMaster === "Regions") {
      setRegionModal({ open: true, mode: "add", index: null, value: "" });
    }
  };

  const onDelete = (index: number) => {
    if (activeMaster === "Amenities") setAmenities((p) => p.filter((_, i) => i !== index));
    else if (activeMaster === "Area Range") setAreaRange((p) => p.filter((_, i) => i !== index));
    else if (activeMaster === "Budget Range") setBudgetRows((p) => p.filter((_, i) => i !== index));
    else if (activeMaster === "CP Company Category") setCpCompanyRows((p) => p.filter((_, i) => i !== index));
    else if (activeMaster === "Contact Category") setContactCategoryRows((p) => p.filter((_, i) => i !== index));
    else if (activeMaster === "Contact Stage") setContactStageRows((p) => p.filter((_, i) => i !== index));
    else if (activeMaster === "Contact Sub Category") setContactSubCategoryRows((p) => p.filter((_, i) => i !== index));
    else if (activeMaster === "Contact Tags") setContactTagRows((p) => p.filter((_, i) => i !== index));
    else if (activeMaster === "Contact Type") setContactTypeRows((p) => p.filter((_, i) => i !== index));
    else if (activeMaster === "Lead Category") setLeadCategoryRows((p) => p.filter((_, i) => i !== index));
    else if (activeMaster === "Lead Sources") setLeadSourceRows((p) => p.filter((_, i) => i !== index));
    else if (activeMaster === "Lead Stages") setLeadStageRows((p) => p.filter((_, i) => i !== index));
    else if (activeMaster === "Lead Tags") setLeadTagRows((p) => p.filter((_, i) => i !== index));
    else if (activeMaster === "Property Stages") setPropertyStageRows((p) => p.filter((_, i) => i !== index));
    else if (activeMaster === "Property Type") setPropertyTypeRows((p) => p.filter((_, i) => i !== index));
    else if (activeMaster === "Regions") setRegionRows((p) => p.filter((_, i) => i !== index));
  };

  return (
    <PageShell className="space-y-3">
      <Panel className="overflow-hidden">
        <div className="flex flex-wrap gap-1 border-b border-gray-200 px-2 py-1">
          {settingTabs.map((tab) => (
            <button key={tab} suppressHydrationWarning type="button" onClick={() => setActiveTab(tab)} className={`rounded px-3 py-1.5 text-xs ${activeTab === tab ? "bg-[#1a56db] text-white" : "text-[#3f4658] hover:bg-gray-100"}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="p-3">
          {activeTab === "Masters" ? (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-[#3f4658]">Masters</h2>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[200px_1fr]">
                <div className="rounded border border-gray-200 bg-white">
                  <div className="max-h-[640px] overflow-y-auto p-2">
                    {masterItems.map((item) => (
                      <button key={item} suppressHydrationWarning type="button" onClick={() => setActiveMaster(item)} className={`mb-1 block w-full rounded px-3 py-2 text-left text-xs font-medium ${activeMaster === item ? "bg-[#1a56db] text-white" : "text-[#2f4f76] hover:bg-gray-100"}`}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded border border-gray-200 bg-white p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[#3f4658]">
                      {activeMaster === "CP Company Category" ? "Channel Partner Company Category" : activeMaster} ({count})
                    </h3>
                    {["Amenities", "Area Range", "Banners", "Budget Range", "CP Company Category", "CP Stages", "Contact Category", "Contact Stage", "Contact Sub Category", "Contact Tags", "Contact Type", "Lead Category", "Lead Sources", "Lead Stages", "Lead Tags", "Property Stages", "Property Type", "Regions"].includes(activeMaster) ? (
                      <button suppressHydrationWarning type="button" onClick={onCreate} className="inline-flex items-center gap-2 rounded bg-[#1a56db] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                        <Plus className="h-3.5 w-3.5" /> {createLabel}
                      </button>
                    ) : null}
                  </div>

                  {(activeMaster === "Amenities" || activeMaster === "Area Range" || activeMaster === "Budget Range") && (
                    <div className="mb-2 flex rounded border border-gray-300 text-xs w-fit">
                      <button suppressHydrationWarning className="border-r border-gray-300 px-3 py-1 text-gray-500">Previous</button>
                      <button suppressHydrationWarning className="border-r border-gray-300 bg-[#1a56db] px-3 py-1 text-white">1</button>
                      <button suppressHydrationWarning className="px-3 py-1 text-gray-500">Next</button>
                    </div>
                  )}

                  {activeMaster === "Banners" ? (
                    <div className="rounded border border-gray-200">
                      <table className="w-full text-left text-xs text-[#4a5165]">
                        <thead className="bg-gray-50 uppercase text-[11px] text-gray-600">
                          <tr>
                            <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                            <th className="border-b border-r border-gray-200 px-2 py-2">Name</th>
                            <th className="border-b border-gray-200 px-2 py-2">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border-b border-gray-100 px-2 py-3 text-center text-sm text-gray-500" colSpan={3}>No Data Found</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : activeMaster === "Budget Range" ? (
                    <div className="overflow-x-auto rounded border border-gray-200">
                      <table className="w-full min-w-[780px] text-left text-xs text-[#4a5165]">
                        <thead className="bg-gray-50 uppercase text-[11px] text-gray-600">
                          <tr>
                            <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                            <th className="border-b border-r border-gray-200 px-2 py-2">Name</th>
                            <th className="border-b border-r border-gray-200 px-2 py-2">Amount</th>
                            <th className="border-b border-gray-200 px-2 py-2">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {budgetRows.map((row, i) => (
                            <tr key={`${row.name}-${i}`} className="hover:bg-gray-50">
                              <td className="border-b border-r border-gray-100 px-2 py-2">{i + 1}</td>
                              <td className="border-b border-r border-gray-100 px-2 py-2">{row.name}</td>
                              <td className="border-b border-r border-gray-100 px-2 py-2">{formatBudgetAmount(row.amount)}</td>
                              <td className="border-b border-gray-100 px-2 py-2">
                                <div className="flex items-center gap-1">
                                  <button suppressHydrationWarning type="button" onClick={() => setBudgetModal({ open: true, mode: "update", index: i, name: row.name, amount: String(row.amount) })} className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#14c8b4] text-white"><Pencil className="h-3 w-3" /></button>
                                  <button suppressHydrationWarning type="button" onClick={() => onDelete(i)} className="inline-flex h-5 w-5 items-center justify-center rounded bg-rose-500 text-white"><Trash2 className="h-3 w-3" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : activeMaster === "CP Company Category" ? (
                    <div className="overflow-x-auto rounded border border-gray-200">
                      <table className="w-full min-w-[780px] text-left text-xs text-[#4a5165]">
                        <thead className="bg-gray-50 uppercase text-[11px] text-gray-600">
                          <tr>
                            <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                            <th className="border-b border-r border-gray-200 px-2 py-2">Name</th>
                            <th className="border-b border-r border-gray-200 px-2 py-2">Order</th>
                            <th className="border-b border-gray-200 px-2 py-2">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cpCompanyRows.length === 0 ? (
                            <tr><td className="border-b border-gray-100 px-2 py-3 text-center text-sm text-gray-500" colSpan={4}>No Data Found</td></tr>
                          ) : cpCompanyRows.map((row, i) => (
                            <tr key={`${row.name}-${i}`} className="hover:bg-gray-50">
                              <td className="border-b border-r border-gray-100 px-2 py-2">{i + 1}</td>
                              <td className="border-b border-r border-gray-100 px-2 py-2">{row.name}</td>
                              <td className="border-b border-r border-gray-100 px-2 py-2">{row.order}</td>
                              <td className="border-b border-gray-100 px-2 py-2">
                                <div className="flex items-center gap-1">
                                  <button suppressHydrationWarning type="button" onClick={() => setCpCompanyModal({ open: true, mode: "update", index: i, name: row.name, order: row.order })} className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#14c8b4] text-white"><Pencil className="h-3 w-3" /></button>
                                  <button suppressHydrationWarning type="button" onClick={() => onDelete(i)} className="inline-flex h-5 w-5 items-center justify-center rounded bg-rose-500 text-white"><Trash2 className="h-3 w-3" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : activeMaster === "CP Stages" ? (
                    <div className="overflow-x-auto rounded border border-gray-200">
                      <table className="w-full min-w-[780px] text-left text-xs text-[#4a5165]">
                        <thead className="bg-gray-50 uppercase text-[11px] text-gray-600">
                          <tr>
                            <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                            <th className="border-b border-r border-gray-200 px-2 py-2">Name</th>
                            <th className="border-b border-r border-gray-200 px-2 py-2">Order</th>
                            <th className="border-b border-r border-gray-200 px-2 py-2">Stage</th>
                            <th className="border-b border-gray-200 px-2 py-2">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cpStageRows.map((row, i) => (
                            <tr key={`${row.name}-${i}`} className="hover:bg-gray-50">
                              <td className="border-b border-r border-gray-100 px-2 py-2">{i + 1}</td>
                              <td className="border-b border-r border-gray-100 px-2 py-2">{row.name}</td>
                              <td className="border-b border-r border-gray-100 px-2 py-2">{row.order}</td>
                              <td className="border-b border-r border-gray-100 px-2 py-2">({row.stage})</td>
                              <td className="border-b border-gray-100 px-2 py-2">
                                <button suppressHydrationWarning type="button" onClick={() => setCpStageModal({ open: true, mode: "update", index: i, name: row.name, order: row.order, stage: row.stage })} className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#14c8b4] text-white"><Pencil className="h-3 w-3" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : activeMaster === "Contact Category" ? (
                    <div className="space-y-2">
                      <div className="flex rounded border border-gray-300 text-xs w-fit">
                        <button suppressHydrationWarning className="border-r border-gray-300 px-3 py-1 text-gray-500">Previous</button>
                        <button suppressHydrationWarning className="border-r border-gray-300 bg-[#1a56db] px-3 py-1 text-white">1</button>
                        <button suppressHydrationWarning className="px-3 py-1 text-gray-500">Next</button>
                      </div>
                      <div className="overflow-x-auto rounded border border-gray-200">
                        <table className="w-full min-w-[780px] text-left text-xs text-[#4a5165]">
                          <thead className="bg-gray-50 uppercase text-[11px] text-gray-600">
                            <tr>
                              <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                              <th className="border-b border-r border-gray-200 px-2 py-2">Name</th>
                              <th className="border-b border-r border-gray-200 px-2 py-2">Code</th>
                              <th className="border-b border-gray-200 px-2 py-2">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {contactCategoryRows.length === 0 ? (
                              <tr><td className="border-b border-gray-100 px-2 py-3 text-center text-sm text-gray-500" colSpan={4}>No Data Found</td></tr>
                            ) : contactCategoryRows.map((row, i) => (
                              <tr key={`${row.name}-${i}`} className="hover:bg-gray-50">
                                <td className="border-b border-r border-gray-100 px-2 py-2">{i + 1}</td>
                                <td className="border-b border-r border-gray-100 px-2 py-2">{row.name}</td>
                                <td className="border-b border-r border-gray-100 px-2 py-2">{row.code}</td>
                                <td className="border-b border-gray-100 px-2 py-2">
                                  <div className="flex items-center gap-1">
                                    <button suppressHydrationWarning type="button" onClick={() => setContactCategoryModal({ open: true, mode: "update", index: i, name: row.name, code: row.code })} className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#14c8b4] text-white"><Pencil className="h-3 w-3" /></button>
                                    <button suppressHydrationWarning type="button" onClick={() => onDelete(i)} className="inline-flex h-5 w-5 items-center justify-center rounded bg-rose-500 text-white"><Trash2 className="h-3 w-3" /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex rounded border border-gray-300 text-xs w-fit">
                        <button suppressHydrationWarning className="border-r border-gray-300 px-3 py-1 text-gray-500">Previous</button>
                        <button suppressHydrationWarning className="border-r border-gray-300 bg-[#1a56db] px-3 py-1 text-white">1</button>
                        <button suppressHydrationWarning className="px-3 py-1 text-gray-500">Next</button>
                      </div>
                    </div>
                  ) : activeMaster === "Contact Stage" ? (
                    <div className="overflow-x-auto rounded border border-gray-200">
                      <table className="w-full min-w-[780px] text-left text-xs text-[#4a5165]">
                        <thead className="bg-gray-50 uppercase text-[11px] text-gray-600">
                          <tr>
                            <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                            <th className="border-b border-r border-gray-200 px-2 py-2">Name</th>
                            <th className="border-b border-r border-gray-200 px-2 py-2">Stage</th>
                            <th className="border-b border-gray-200 px-2 py-2">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contactStageRows.map((row, i) => (
                            <tr key={`${row.name}-${i}`} className="hover:bg-gray-50">
                              <td className="border-b border-r border-gray-100 px-2 py-2">{i + 1}</td>
                              <td className="border-b border-r border-gray-100 px-2 py-2">{row.name}</td>
                              <td className="border-b border-r border-gray-100 px-2 py-2">({row.stage})</td>
                              <td className="border-b border-gray-100 px-2 py-2">
                                <div className="flex items-center gap-1">
                                  <button suppressHydrationWarning type="button" onClick={() => setContactStageModal({ open: true, mode: "update", index: i, name: row.name, stage: row.stage })} className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#14c8b4] text-white"><Pencil className="h-3 w-3" /></button>
                                  <button suppressHydrationWarning type="button" onClick={() => onDelete(i)} className="inline-flex h-5 w-5 items-center justify-center rounded bg-rose-500 text-white"><Trash2 className="h-3 w-3" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : activeMaster === "Contact Sub Category" ? (
                    <div className="space-y-2">
                      <div className="flex rounded border border-gray-300 text-xs w-fit">
                        <button suppressHydrationWarning className="border-r border-gray-300 px-3 py-1 text-gray-500">Previous</button>
                        <button suppressHydrationWarning className="border-r border-gray-300 bg-[#1a56db] px-3 py-1 text-white">1</button>
                        <button suppressHydrationWarning className="px-3 py-1 text-gray-500">Next</button>
                      </div>
                      <div className="overflow-x-auto rounded border border-gray-200">
                        <table className="w-full min-w-[780px] text-left text-xs text-[#4a5165]">
                          <thead className="bg-gray-50 uppercase text-[11px] text-gray-600">
                            <tr>
                              <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                              <th className="border-b border-r border-gray-200 px-2 py-2">Name</th>
                              <th className="border-b border-r border-gray-200 px-2 py-2">Code</th>
                              <th className="border-b border-gray-200 px-2 py-2">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {contactSubCategoryRows.length === 0 ? (
                              <tr><td className="border-b border-gray-100 px-2 py-3 text-center text-sm text-gray-500" colSpan={4}>No Data Found</td></tr>
                            ) : contactSubCategoryRows.map((row, i) => (
                              <tr key={`${row.name}-${i}`} className="hover:bg-gray-50">
                                <td className="border-b border-r border-gray-100 px-2 py-2">{i + 1}</td>
                                <td className="border-b border-r border-gray-100 px-2 py-2">{row.name}</td>
                                <td className="border-b border-r border-gray-100 px-2 py-2">{row.code}</td>
                                <td className="border-b border-gray-100 px-2 py-2">
                                  <div className="flex items-center gap-1">
                                    <button suppressHydrationWarning type="button" onClick={() => setContactSubCategoryModal({ open: true, mode: "update", index: i, name: row.name, code: row.code })} className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#14c8b4] text-white"><Pencil className="h-3 w-3" /></button>
                                    <button suppressHydrationWarning type="button" onClick={() => onDelete(i)} className="inline-flex h-5 w-5 items-center justify-center rounded bg-rose-500 text-white"><Trash2 className="h-3 w-3" /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex rounded border border-gray-300 text-xs w-fit">
                        <button suppressHydrationWarning className="border-r border-gray-300 px-3 py-1 text-gray-500">Previous</button>
                        <button suppressHydrationWarning className="border-r border-gray-300 bg-[#1a56db] px-3 py-1 text-white">1</button>
                        <button suppressHydrationWarning className="px-3 py-1 text-gray-500">Next</button>
                      </div>
                    </div>
                  ) : activeMaster === "Contact Tags" ? (
                    <div className="space-y-2">
                      <div className="flex rounded border border-gray-300 text-xs w-fit">
                        <button suppressHydrationWarning className="border-r border-gray-300 px-3 py-1 text-gray-500">Previous</button>
                        <button suppressHydrationWarning className="border-r border-gray-300 bg-[#1a56db] px-3 py-1 text-white">1</button>
                        <button suppressHydrationWarning className="px-3 py-1 text-gray-500">Next</button>
                      </div>
                      <div className="overflow-x-auto rounded border border-gray-200">
                        <table className="w-full min-w-[780px] text-left text-xs text-[#4a5165]">
                          <thead className="bg-gray-50 uppercase text-[11px] text-gray-600">
                            <tr>
                              <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                              <th className="border-b border-r border-gray-200 px-2 py-2">Name</th>
                              <th className="border-b border-r border-gray-200 px-2 py-2">Code</th>
                              <th className="border-b border-gray-200 px-2 py-2">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {contactTagRows.map((row, i) => (
                              <tr key={`${row.name}-${i}`} className="hover:bg-gray-50">
                                <td className="border-b border-r border-gray-100 px-2 py-2">{i + 1}</td>
                                <td className="border-b border-r border-gray-100 px-2 py-2">{row.name}</td>
                                <td className="border-b border-r border-gray-100 px-2 py-2">{row.code ?? ""}</td>
                                <td className="border-b border-gray-100 px-2 py-2">
                                  <div className="flex items-center gap-1">
                                    <button suppressHydrationWarning type="button" onClick={() => setContactTagModal({ open: true, mode: "update", index: i, name: row.name })} className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#14c8b4] text-white"><Pencil className="h-3 w-3" /></button>
                                    <button suppressHydrationWarning type="button" onClick={() => onDelete(i)} className="inline-flex h-5 w-5 items-center justify-center rounded bg-rose-500 text-white"><Trash2 className="h-3 w-3" /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex rounded border border-gray-300 text-xs w-fit">
                        <button suppressHydrationWarning className="border-r border-gray-300 px-3 py-1 text-gray-500">Previous</button>
                        <button suppressHydrationWarning className="border-r border-gray-300 bg-[#1a56db] px-3 py-1 text-white">1</button>
                        <button suppressHydrationWarning className="px-3 py-1 text-gray-500">Next</button>
                      </div>
                    </div>
                  ) : activeMaster === "Contact Type" ? (
                    <div className="overflow-x-auto rounded border border-gray-200">
                      <table className="w-full min-w-[780px] text-left text-xs text-[#4a5165]">
                        <thead className="bg-gray-50 uppercase text-[11px] text-gray-600">
                          <tr>
                            <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                            <th className="border-b border-r border-gray-200 px-2 py-2">Name</th>
                            <th className="border-b border-gray-200 px-2 py-2">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contactTypeRows.map((row, i) => (
                            <tr key={`${row.name}-${i}`} className="hover:bg-gray-50">
                              <td className="border-b border-r border-gray-100 px-2 py-2">{i + 1}</td>
                              <td className="border-b border-r border-gray-100 px-2 py-2">{row.name}</td>
                              <td className="border-b border-gray-100 px-2 py-2">
                                <div className="flex items-center gap-1">
                                  <button suppressHydrationWarning type="button" onClick={() => setContactTypeModal({ open: true, mode: "update", index: i, name: row.name })} className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#14c8b4] text-white"><Pencil className="h-3 w-3" /></button>
                                  <button suppressHydrationWarning type="button" onClick={() => onDelete(i)} className="inline-flex h-5 w-5 items-center justify-center rounded bg-rose-500 text-white"><Trash2 className="h-3 w-3" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : activeMaster === "Lead Category" ? (
                    <div className="space-y-2">
                      <div className="flex rounded border border-gray-300 text-xs w-fit">
                        <button suppressHydrationWarning className="border-r border-gray-300 px-3 py-1 text-gray-500">Previous</button>
                        <button suppressHydrationWarning className="border-r border-gray-300 bg-[#1a56db] px-3 py-1 text-white">1</button>
                        <button suppressHydrationWarning className="px-3 py-1 text-gray-500">Next</button>
                      </div>
                      <div className="overflow-x-auto rounded border border-gray-200">
                        <table className="w-full min-w-[900px] text-left text-xs text-[#4a5165]">
                          <thead className="bg-gray-50 uppercase text-[11px] text-gray-600">
                            <tr>
                              <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                              <th className="border-b border-r border-gray-200 px-2 py-2">Name</th>
                              <th className="border-b border-r border-gray-200 px-2 py-2">Order</th>
                              <th className="border-b border-r border-gray-200 px-2 py-2">Create Date</th>
                              <th className="border-b border-r border-gray-200 px-2 py-2">Code</th>
                              <th className="border-b border-gray-200 px-2 py-2">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leadCategoryRows.map((row, i) => (
                              <tr key={`${row.name}-${i}`} className="hover:bg-gray-50">
                                <td className="border-b border-r border-gray-100 px-2 py-2">{i + 1}</td>
                                <td className="border-b border-r border-gray-100 px-2 py-2">{row.name}</td>
                                <td className="border-b border-r border-gray-100 px-2 py-2">{row.order}</td>
                                <td className="border-b border-r border-gray-100 px-2 py-2">{row.createDate ?? ""}</td>
                                <td className="border-b border-r border-gray-100 px-2 py-2">{row.code}</td>
                                <td className="border-b border-gray-100 px-2 py-2">
                                  <div className="flex items-center gap-1">
                                    <button suppressHydrationWarning type="button" onClick={() => setLeadCategoryModal({ open: true, mode: "update", index: i, name: row.name, code: row.code, order: row.order })} className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#14c8b4] text-white"><Pencil className="h-3 w-3" /></button>
                                    <button suppressHydrationWarning type="button" onClick={() => onDelete(i)} className="inline-flex h-5 w-5 items-center justify-center rounded bg-rose-500 text-white"><Trash2 className="h-3 w-3" /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex rounded border border-gray-300 text-xs w-fit">
                        <button suppressHydrationWarning className="border-r border-gray-300 px-3 py-1 text-gray-500">Previous</button>
                        <button suppressHydrationWarning className="border-r border-gray-300 bg-[#1a56db] px-3 py-1 text-white">1</button>
                        <button suppressHydrationWarning className="px-3 py-1 text-gray-500">Next</button>
                      </div>
                    </div>
                  ) : activeMaster === "Lead Sources" ? (
                    <div className="space-y-2">
                      <div className="flex rounded border border-gray-300 text-xs w-fit">
                        <button suppressHydrationWarning className="border-r border-gray-300 px-3 py-1 text-gray-500">Previous</button>
                        <button suppressHydrationWarning className="border-r border-gray-300 bg-[#1a56db] px-3 py-1 text-white">1</button>
                        <button suppressHydrationWarning className="px-3 py-1 text-gray-500">Next</button>
                      </div>
                      <div className="overflow-x-auto rounded border border-gray-200">
                        <table className="w-full min-w-[980px] text-left text-xs text-[#4a5165]">
                          <thead className="bg-gray-50 uppercase text-[11px] text-gray-600">
                            <tr>
                              <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                              <th className="border-b border-r border-gray-200 px-2 py-2">Name</th>
                              <th className="border-b border-r border-gray-200 px-2 py-2">Code</th>
                              <th className="border-b border-r border-gray-200 px-2 py-2">Lead Sub Source</th>
                              <th className="border-b border-gray-200 px-2 py-2">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leadSourceRows.map((row, i) => (
                              <tr key={`${row.name}-${i}`} className="hover:bg-gray-50">
                                <td className="border-b border-r border-gray-100 px-2 py-2">{i + 1}</td>
                                <td className="border-b border-r border-gray-100 px-2 py-2">{row.name}</td>
                                <td className="border-b border-r border-gray-100 px-2 py-2">{row.code}</td>
                                <td className="border-b border-r border-gray-100 px-2 py-2">
                                  <button suppressHydrationWarning type="button" onClick={() => setLeadSourceSubModal({ open: true, value: "" })} className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#1a56db] text-white">
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </td>
                                <td className="border-b border-gray-100 px-2 py-2">
                                  <div className="flex items-center gap-1">
                                    <button suppressHydrationWarning type="button" onClick={() => setLeadSourceModal({ open: true, mode: "update", index: i, name: row.name.toUpperCase(), code: row.code })} className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#14c8b4] text-white"><Pencil className="h-3 w-3" /></button>
                                    <button suppressHydrationWarning type="button" onClick={() => onDelete(i)} className="inline-flex h-5 w-5 items-center justify-center rounded bg-rose-500 text-white"><Trash2 className="h-3 w-3" /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex rounded border border-gray-300 text-xs w-fit">
                        <button suppressHydrationWarning className="border-r border-gray-300 px-3 py-1 text-gray-500">Previous</button>
                        <button suppressHydrationWarning className="border-r border-gray-300 bg-[#1a56db] px-3 py-1 text-white">1</button>
                        <button suppressHydrationWarning className="px-3 py-1 text-gray-500">Next</button>
                      </div>
                    </div>
                  ) : activeMaster === "Lead Stages" ? (
                    <div className="overflow-x-auto rounded border border-gray-200">
                      <table className="w-full min-w-[1080px] text-left text-xs text-[#4a5165]">
                        <thead className="bg-gray-50 uppercase text-[11px] text-gray-600">
                          <tr>
                            <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                            <th className="border-b border-r border-gray-200 px-2 py-2">Name</th>
                            <th className="border-b border-r border-gray-200 px-2 py-2">Order</th>
                            <th className="border-b border-r border-gray-200 px-2 py-2">Stage</th>
                            <th className="border-b border-r border-gray-200 px-2 py-2">Category</th>
                            <th className="border-b border-r border-gray-200 px-2 py-2">Add Reasons</th>
                            <th className="border-b border-gray-200 px-2 py-2">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leadStageRows.map((row, i) => (
                            <tr key={`${row.name}-${i}`} className="hover:bg-gray-50">
                              <td className="border-b border-r border-gray-100 px-2 py-2">{i + 1}</td>
                              <td className="border-b border-r border-gray-100 px-2 py-2">{row.name}</td>
                              <td className="border-b border-r border-gray-100 px-2 py-2">{row.order}</td>
                              <td className="border-b border-r border-gray-100 px-2 py-2">{row.stage ?? ""}</td>
                              <td className="border-b border-r border-gray-100 px-2 py-2">{row.category ?? ""}</td>
                              <td className="border-b border-r border-gray-100 px-2 py-2">
                                <button suppressHydrationWarning type="button" onClick={() => setLeadStageReasonModal({ open: true, value: "" })} className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#1a56db] text-white">
                                  <Plus className="h-3 w-3" />
                                </button>
                              </td>
                              <td className="border-b border-gray-100 px-2 py-2">
                                <div className="flex items-center gap-1">
                                  <button suppressHydrationWarning type="button" onClick={() => setLeadStageModal({ open: true, mode: "update", index: i, name: row.name.toUpperCase(), order: row.order, category: row.category ?? "", stage: row.stage === "(Win)" ? "Win" : row.stage === "(Inactive)" ? "Inactive" : "Start", qualified: row.stage === "(Qualified)" })} className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#14c8b4] text-white"><Pencil className="h-3 w-3" /></button>
                                  {i < 7 ? <button suppressHydrationWarning type="button" onClick={() => onDelete(i)} className="inline-flex h-5 w-5 items-center justify-center rounded bg-rose-500 text-white"><Trash2 className="h-3 w-3" /></button> : null}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : activeMaster === "Lead Tags" ? (
                    <div className="space-y-2">
                      <div className="flex rounded border border-gray-300 text-xs w-fit">
                        <button suppressHydrationWarning className="border-r border-gray-300 px-3 py-1 text-gray-500">Previous</button>
                        <button suppressHydrationWarning className="border-r border-gray-300 bg-[#1a56db] px-3 py-1 text-white">1</button>
                        <button suppressHydrationWarning className="px-3 py-1 text-gray-500">Next</button>
                      </div>
                      <div className="overflow-x-auto rounded border border-gray-200">
                        <table className="w-full min-w-[780px] text-left text-xs text-[#4a5165]">
                          <thead className="bg-gray-50 uppercase text-[11px] text-gray-600">
                            <tr>
                              <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                              <th className="border-b border-r border-gray-200 px-2 py-2">Name</th>
                              <th className="border-b border-r border-gray-200 px-2 py-2">Code</th>
                              <th className="border-b border-gray-200 px-2 py-2">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leadTagRows.length === 0 ? (
                              <tr><td className="border-b border-gray-100 px-2 py-3 text-center text-sm text-gray-500" colSpan={4}>No Data Found</td></tr>
                            ) : leadTagRows.map((row, i) => (
                              <tr key={`${row.name}-${i}`} className="hover:bg-gray-50">
                                <td className="border-b border-r border-gray-100 px-2 py-2">{i + 1}</td>
                                <td className="border-b border-r border-gray-100 px-2 py-2">{row.name}</td>
                                <td className="border-b border-r border-gray-100 px-2 py-2">{row.code ?? ""}</td>
                                <td className="border-b border-gray-100 px-2 py-2">
                                  <div className="flex items-center gap-1">
                                    <button suppressHydrationWarning type="button" onClick={() => setLeadTagModal({ open: true, mode: "update", index: i, name: row.name })} className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#14c8b4] text-white"><Pencil className="h-3 w-3" /></button>
                                    <button suppressHydrationWarning type="button" onClick={() => onDelete(i)} className="inline-flex h-5 w-5 items-center justify-center rounded bg-rose-500 text-white"><Trash2 className="h-3 w-3" /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex rounded border border-gray-300 text-xs w-fit">
                        <button suppressHydrationWarning className="border-r border-gray-300 px-3 py-1 text-gray-500">Previous</button>
                        <button suppressHydrationWarning className="border-r border-gray-300 bg-[#1a56db] px-3 py-1 text-white">1</button>
                        <button suppressHydrationWarning className="px-3 py-1 text-gray-500">Next</button>
                      </div>
                    </div>
                  ) : activeMaster === "Property Stages" ? (
                    <div className="overflow-x-auto rounded border border-gray-200">
                      <table className="w-full min-w-[980px] text-left text-xs text-[#4a5165]">
                        <thead className="bg-gray-50 uppercase text-[11px] text-gray-600">
                          <tr>
                            <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                            <th className="border-b border-r border-gray-200 px-2 py-2">Name</th>
                            <th className="border-b border-r border-gray-200 px-2 py-2">Code</th>
                            <th className="border-b border-r border-gray-200 px-2 py-2">Order</th>
                            <th className="border-b border-r border-gray-200 px-2 py-2">Stage</th>
                            <th className="border-b border-gray-200 px-2 py-2">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {propertyStageRows.map((row, i) => (
                            <tr key={`${row.name}-${i}`} className="hover:bg-gray-50">
                              <td className="border-b border-r border-gray-100 px-2 py-2">{i + 1}</td>
                              <td className="border-b border-r border-gray-100 px-2 py-2">{row.name}</td>
                              <td className="border-b border-r border-gray-100 px-2 py-2">{row.code}</td>
                              <td className="border-b border-r border-gray-100 px-2 py-2">{row.order}</td>
                              <td className="border-b border-r border-gray-100 px-2 py-2">{row.stage}</td>
                              <td className="border-b border-gray-100 px-2 py-2">
                                <div className="flex items-center gap-1">
                                  <button suppressHydrationWarning type="button" onClick={() => setPropertyStageModal({ open: true, mode: "update", index: i, name: row.code, order: row.order, stage: row.stage === "(Win)" ? "Win" : row.stage === "(Inactive)" ? "Inactive" : "Start" })} className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#14c8b4] text-white"><Pencil className="h-3 w-3" /></button>
                                  <button suppressHydrationWarning type="button" onClick={() => onDelete(i)} className="inline-flex h-5 w-5 items-center justify-center rounded bg-rose-500 text-white"><Trash2 className="h-3 w-3" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : activeMaster === "Property Type" ? (
                    <div className="overflow-x-auto rounded border border-gray-200">
                      <table className="w-full min-w-[780px] text-left text-xs text-[#4a5165]">
                        <thead className="bg-gray-50 uppercase text-[11px] text-gray-600">
                          <tr>
                            <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                            <th className="border-b border-r border-gray-200 px-2 py-2">Name</th>
                            <th className="border-b border-gray-200 px-2 py-2">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {propertyTypeRows.map((row, i) => (
                            <tr key={`${row.name}-${i}`} className="hover:bg-gray-50">
                              <td className="border-b border-r border-gray-100 px-2 py-2">{i + 1}</td>
                              <td className="border-b border-r border-gray-100 px-2 py-2">{row.name}</td>
                              <td className="border-b border-gray-100 px-2 py-2">
                                <div className="flex items-center gap-1">
                                  <button suppressHydrationWarning type="button" onClick={() => setPropertyTypeModal({ open: true, mode: "update", index: i, name: row.name })} className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#14c8b4] text-white"><Pencil className="h-3 w-3" /></button>
                                  <button suppressHydrationWarning type="button" onClick={() => onDelete(i)} className="inline-flex h-5 w-5 items-center justify-center rounded bg-rose-500 text-white"><Trash2 className="h-3 w-3" /></button>
                                  <button suppressHydrationWarning type="button" onClick={() => setUnitTypeModal((p) => ({ ...p, open: true }))} className="rounded bg-[#1a56db] px-2 py-1 text-[10px] text-white">Unit</button>
                                  <button suppressHydrationWarning type="button" onClick={() => setSubTypeModal((p) => ({ ...p, open: true }))} className="rounded bg-[#5f8fcb] px-2 py-1 text-[10px] text-white">Sub</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : activeMaster === "Regions" ? (
                    <div className="space-y-2">
                      <div className="flex rounded border border-gray-300 text-xs w-fit">
                        <button suppressHydrationWarning className="border-r border-gray-300 px-3 py-1 text-gray-500">Previous</button>
                        <button suppressHydrationWarning className="border-r border-gray-300 bg-[#1a56db] px-3 py-1 text-white">1</button>
                        <button suppressHydrationWarning className="px-3 py-1 text-gray-500">Next</button>
                      </div>
                      <div className="overflow-x-auto rounded border border-gray-200">
                        <table className="w-full min-w-[780px] text-left text-xs text-[#4a5165]">
                          <thead className="bg-gray-50 uppercase text-[11px] text-gray-600">
                            <tr>
                              <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                              <th className="border-b border-r border-gray-200 px-2 py-2">Region</th>
                              <th className="border-b border-gray-200 px-2 py-2">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {regionRows.length === 0 ? (
                              <tr><td className="border-b border-gray-100 px-2 py-3 text-center text-sm text-gray-500" colSpan={3}>No Data Found</td></tr>
                            ) : regionRows.map((row, i) => (
                              <tr key={`${row.region}-${i}`} className="hover:bg-gray-50">
                                <td className="border-b border-r border-gray-100 px-2 py-2">{i + 1}</td>
                                <td className="border-b border-r border-gray-100 px-2 py-2">{row.region}</td>
                                <td className="border-b border-gray-100 px-2 py-2">
                                  <div className="flex items-center gap-1">
                                    <button suppressHydrationWarning type="button" onClick={() => setRegionModal({ open: true, mode: "update", index: i, value: row.region })} className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#14c8b4] text-white"><Pencil className="h-3 w-3" /></button>
                                    <button suppressHydrationWarning type="button" onClick={() => onDelete(i)} className="inline-flex h-5 w-5 items-center justify-center rounded bg-rose-500 text-white"><Trash2 className="h-3 w-3" /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex rounded border border-gray-300 text-xs w-fit">
                        <button suppressHydrationWarning className="border-r border-gray-300 px-3 py-1 text-gray-500">Previous</button>
                        <button suppressHydrationWarning className="border-r border-gray-300 bg-[#1a56db] px-3 py-1 text-white">1</button>
                        <button suppressHydrationWarning className="px-3 py-1 text-gray-500">Next</button>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded border border-gray-200">
                      <table className="w-full min-w-[640px] text-left text-xs text-[#4a5165]">
                        <thead className="bg-gray-50 uppercase text-[11px] text-gray-600">
                          <tr>
                            <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                            <th className="border-b border-r border-gray-200 px-2 py-2">{activeMaster === "Area Range" ? "Area" : "Name"}</th>
                            <th className="border-b border-gray-200 px-2 py-2">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(activeMaster === "Amenities" ? amenities : areaRange).map((name, index) => (
                            <tr key={`${activeMaster}-${name}-${index}`} className="hover:bg-gray-50">
                              <td className="border-b border-r border-gray-100 px-2 py-2">{index + 1}</td>
                              <td className="border-b border-r border-gray-100 px-2 py-2">{name}</td>
                              <td className="border-b border-gray-100 px-2 py-2">
                                <div className="flex items-center gap-1">
                                  <button suppressHydrationWarning type="button" onClick={() => setSingleModal({ open: true, mode: "update", value: name, index })} className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#14c8b4] text-white"><Pencil className="h-3 w-3" /></button>
                                  <button suppressHydrationWarning type="button" onClick={() => onDelete(index)} className="inline-flex h-5 w-5 items-center justify-center rounded bg-rose-500 text-white"><Trash2 className="h-3 w-3" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {(activeMaster === "Amenities" || activeMaster === "Area Range" || activeMaster === "Budget Range") && (
                    <div className="mt-2 flex rounded border border-gray-300 text-xs w-fit">
                      <button suppressHydrationWarning className="border-r border-gray-300 px-3 py-1 text-gray-500">Previous</button>
                      <button suppressHydrationWarning className="border-r border-gray-300 bg-[#1a56db] px-3 py-1 text-white">1</button>
                      <button suppressHydrationWarning className="px-3 py-1 text-gray-500">Next</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === "Communication" ? (
            <div className="space-y-3">
              <div className="rounded border border-gray-200 bg-[#f5f6f8] px-3 py-2 text-sm font-semibold text-[#3f4658]">Company</div>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[200px_1fr]">
                <div className="rounded border border-gray-200 bg-white">
                  <div className="max-h-[640px] overflow-y-auto p-2">
                    {commChannels.map((ch) => (
                      <button key={ch} suppressHydrationWarning type="button" onClick={() => setCommChannel(ch)} className={`mb-1 block w-full rounded px-3 py-2 text-left text-xs font-medium ${commChannel === ch ? "bg-[#1a56db] text-white" : "text-[#2f4f76] hover:bg-gray-100"}`}>
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-w-0 space-y-4">
                  {commChannel === "Email" ? (
                    <>
                      <div className="rounded border border-gray-200 bg-white p-4">
                        <h3 className="mb-4 text-sm font-semibold text-[#3f4658]">Send Email Preference</h3>
                        <div className="space-y-3 text-xs">
                          <label className="block">
                            <span className="mb-1 block text-[11px] font-medium text-gray-600">Name</span>
                            <input value={emailPref.name} onChange={(e) => setEmailPref((p) => ({ ...p, name: e.target.value }))} className="w-full rounded border border-gray-300 px-2 py-2 text-[#3f4658] outline-none focus:border-[#1a56db]" />
                          </label>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <label className="block">
                              <span className="mb-1 block text-[11px] font-medium text-gray-600">Email From</span>
                              <input value={emailPref.emailFrom} onChange={(e) => setEmailPref((p) => ({ ...p, emailFrom: e.target.value }))} className="w-full rounded border border-gray-300 px-2 py-2 text-[#3f4658] outline-none focus:border-[#1a56db]" />
                            </label>
                            <label className="block">
                              <span className="mb-1 block text-[11px] font-medium text-gray-600">Reply To</span>
                              <input value={emailPref.replyTo} onChange={(e) => setEmailPref((p) => ({ ...p, replyTo: e.target.value }))} className="w-full rounded border border-gray-300 px-2 py-2 text-[#3f4658] outline-none focus:border-[#1a56db]" />
                            </label>
                          </div>
                          <div className="flex justify-end pt-1">
                            <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-4 py-2 text-xs font-medium text-white hover:bg-blue-700">
                              Submit
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded border border-gray-200 bg-white p-3">
                          <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-9 items-center rounded bg-gray-100 px-2 text-[10px] font-bold tracking-tight text-[#1a73e8]">SendGrid</span>
                              <span className="text-[11px] text-gray-500">Twilio SendGrid</span>
                            </div>
                            <button suppressHydrationWarning type="button" role="switch" aria-checked={sendGridOn} onClick={() => setSendGridOn((v) => !v)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${sendGridOn ? "bg-[#1a56db]" : "bg-gray-300"}`}>
                              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${sendGridOn ? "translate-x-5" : ""}`} />
                            </button>
                          </div>
                          <div className="border-b border-gray-100 py-3 text-sm text-[#3f4658]">SendGrid</div>
                          <div className="flex justify-end pt-3">
                            <button suppressHydrationWarning type="button" onClick={() => setEmailProviderModal("sendgrid")} className="rounded bg-[#1a56db] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                              Configure
                            </button>
                          </div>
                        </div>
                        <div className="rounded border border-gray-200 bg-white p-3">
                          <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-9 w-9 items-center justify-center rounded bg-red-50 text-lg text-red-600">✉</span>
                              <span className="text-[11px] text-gray-500">SMTP</span>
                            </div>
                            <button suppressHydrationWarning type="button" role="switch" aria-checked={smtpOn} onClick={() => setSmtpOn((v) => !v)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${smtpOn ? "bg-[#1a56db]" : "bg-gray-300"}`}>
                              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${smtpOn ? "translate-x-5" : ""}`} />
                            </button>
                          </div>
                          <div className="border-b border-gray-100 py-3 text-sm text-[#3f4658]">
                            SMTP <span className="align-top text-[10px] font-medium text-red-500">Beta Version</span>
                          </div>
                          <div className="flex justify-end pt-3">
                            <button suppressHydrationWarning type="button" onClick={() => { setSmtpModalTab("standard"); setEmailProviderModal("smtp"); }} className="rounded bg-[#1a56db] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                              Configure
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null}

                  {commChannel === "SMS" ? (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-[#3f4658]">Buy Credits and Send SMS Notification</h3>
                      <div className="rounded border border-gray-200 bg-white p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1a56db] text-sm font-bold text-white">B</span>
                          <span className="text-sm font-semibold text-[#1a56db]">Buildesk</span>
                        </div>
                        <div className="border-t border-gray-100 pt-3 text-xs leading-relaxed text-[#4a5165]">
                          I&apos;d like to send SMS with Buildesk branding enabling this option will add the &quot;Buildesk&quot; label to all the SMS notifications you send to your customers.
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-xs">
                          <span className="text-gray-500">You have 0 credits available from BuildDesk.</span>
                          <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                            Buy Credits
                          </button>
                        </div>
                      </div>

                      <h3 className="text-sm font-semibold text-[#3f4658]">External SMS Providers</h3>
                      <div className="rounded border border-gray-200 bg-white p-4">
                        <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-9 items-center rounded-lg bg-[#1a56db] px-2 text-[10px] font-semibold leading-tight text-white">
                              text
                              <br />
                              local
                            </span>
                            <span className="text-[11px] text-gray-500">textlocal</span>
                          </div>
                          <button suppressHydrationWarning type="button" role="switch" aria-checked={textlocalOn} onClick={() => setTextlocalOn((v) => !v)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${textlocalOn ? "bg-[#1a56db]" : "bg-gray-300"}`}>
                            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${textlocalOn ? "translate-x-5" : ""}`} />
                          </button>
                        </div>
                        <div className="border-t border-gray-100 pt-3 text-xs leading-relaxed text-[#4a5165]">
                          Buildesk is an external SMS provider that can enable you to receive and send message to your customers.
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-xs">
                          <span className="text-gray-500">You have 0 credits available.</span>
                          <button suppressHydrationWarning type="button" onClick={() => setEmailProviderModal("sms-textlocal")} className="rounded bg-[#1a56db] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                            Configure
                          </button>
                        </div>
                      </div>

                      <div className="rounded border border-gray-200 bg-white p-4 text-xs leading-relaxed">
                        <p className="mb-2 font-semibold text-[#3f4658]">Update DLT registration details to continue sending SMS</p>
                        <p className="text-[#4a5165]">
                          In compliance with the revised Telecom Regulatory Authority of India (TRAI) regulations, you will have to register with a DLT operator to send SMS to your customers.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {commChannel === "WhatsApp" ? (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold leading-snug text-[#3f4658]">Integrate WhatsApp Business API, Send Messages &amp; Notification from Buildesk</h3>
                      <div className="rounded border border-gray-200 bg-white p-4">
                        <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">W</span>
                            <span className="text-sm font-semibold text-[#1a56db]">WATI</span>
                          </div>
                          <button suppressHydrationWarning type="button" role="switch" aria-checked={watiOn} onClick={() => setWatiOn((v) => !v)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${watiOn ? "bg-[#1a56db]" : "bg-gray-300"}`}>
                            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${watiOn ? "translate-x-5" : ""}`} />
                          </button>
                        </div>
                        <div className="border-t border-gray-100 py-3 text-xs leading-relaxed text-[#4a5165]">Whatsapp Business API, Send automated notification, broadcast messages to your leads, contact &amp; customer.</div>
                        <div className="flex justify-end border-t border-gray-100 pt-3">
                          <button suppressHydrationWarning type="button" onClick={() => setWatiConfigureOpen(true)} className="rounded bg-[#1a56db] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                            Configure
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {commChannel === "IVR" ? (
                    <div className="max-h-[720px] space-y-3 overflow-y-auto pr-1">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {ivrProviders.map((p) => (
                          <div key={p.id} className="rounded border border-gray-200 bg-white p-3">
                            <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                              <span className="inline-flex h-10 min-w-[4rem] items-center justify-center rounded bg-gray-50 px-2 text-[11px] font-bold text-[#2f4f76]">{p.name}</span>
                              <button suppressHydrationWarning type="button" role="switch" aria-checked={ivrEnabled[p.id] === true} onClick={() => setIvrEnabled((prev) => ({ ...prev, [p.id]: !prev[p.id] }))} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${ivrEnabled[p.id] ? "bg-[#1a56db]" : "bg-gray-300"}`}>
                                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${ivrEnabled[p.id] ? "translate-x-5" : ""}`} />
                              </button>
                            </div>
                            <div className="border-b border-gray-100 py-3 text-sm text-[#3f4658]">{p.name}</div>
                            <div className="flex justify-end pt-3">
                              <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                                Configure
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : activeTab === "Permission" ? (
            <SettingsPermissionTab />
          ) : activeTab === "Templates" ? (
            <SettingsTemplatesTab />
          ) : (
            <div className="rounded border border-gray-200 bg-white p-6 text-sm text-gray-500">{activeTab} section UI can be added next.</div>
          )}
        </div>
      </Panel>

      {emailProviderModal === "sendgrid" || emailProviderModal === "sms-textlocal" ? (
        <ApiKeyConfigureModal
          apiKey={emailProviderModal === "sendgrid" ? sendGridApiKey : textlocalApiKey}
          onApiKeyChange={emailProviderModal === "sendgrid" ? setSendGridApiKey : setTextlocalApiKey}
          onClose={() => setEmailProviderModal(null)}
          onSubmit={() => setEmailProviderModal(null)}
        />
      ) : null}

      {emailProviderModal === "smtp" ? (
        <SmtpConfigureModal
          tab={smtpModalTab}
          onTabChange={setSmtpModalTab}
          basic={smtpBasic}
          onBasicChange={setSmtpBasic}
          userWise={smtpUserWise}
          onUserWiseChange={setSmtpUserWise}
          onClose={() => setEmailProviderModal(null)}
          onSubmit={() => setEmailProviderModal(null)}
        />
      ) : null}

      {watiConfigureOpen ? (
        <WhatsAppWatiConfigureModal
          accessToken={watiConfig.accessToken}
          apiEndpoint={watiConfig.apiEndpoint}
          onAccessTokenChange={(v) => setWatiConfig((p) => ({ ...p, accessToken: v }))}
          onApiEndpointChange={(v) => setWatiConfig((p) => ({ ...p, apiEndpoint: v }))}
          onClose={() => setWatiConfigureOpen(false)}
          onSubmit={() => setWatiConfigureOpen(false)}
        />
      ) : null}

      {singleModal.open && (activeMaster === "Amenities" || activeMaster === "Area Range") ? (
        <SingleFieldModal
          title={`${singleModal.mode === "add" ? "Add" : "Update"} ${activeMaster === "Area Range" ? "Area" : "Amenity"}`}
          label={activeMaster === "Area Range" ? "Area Value" : "Name"}
          value={singleModal.value}
          onChange={(value) => setSingleModal((p) => ({ ...p, value }))}
          onClose={() => setSingleModal((p) => ({ ...p, open: false }))}
          onSubmit={() => {
            const value = singleModal.value.trim();
            if (!value) return;
            if (activeMaster === "Amenities") {
              if (singleModal.mode === "add") setAmenities((p) => [...p, value]);
              else if (singleModal.index !== null) setAmenities((p) => p.map((x, i) => (i === singleModal.index ? value : x)));
            } else {
              if (singleModal.mode === "add") setAreaRange((p) => [...p, value]);
              else if (singleModal.index !== null) setAreaRange((p) => p.map((x, i) => (i === singleModal.index ? value : x)));
            }
            setSingleModal((p) => ({ ...p, open: false }));
          }}
        />
      ) : null}

      {budgetModal.open ? (
        <BudgetModal
          title={`${budgetModal.mode === "add" ? "Add" : "Update"} Budget`}
          name={budgetModal.name}
          amount={budgetModal.amount}
          onNameChange={(name) => setBudgetModal((p) => ({ ...p, name }))}
          onAmountChange={(amount) => setBudgetModal((p) => ({ ...p, amount }))}
          onClose={() => setBudgetModal((p) => ({ ...p, open: false }))}
          onSubmit={() => {
            const name = budgetModal.name.trim();
            const amount = Number(budgetModal.amount);
            if (!name || Number.isNaN(amount)) return;
            if (budgetModal.mode === "add") setBudgetRows((p) => [...p, { name, amount }]);
            else if (budgetModal.index !== null) setBudgetRows((p) => p.map((r, i) => (i === budgetModal.index ? { name, amount } : r)));
            setBudgetModal((p) => ({ ...p, open: false }));
          }}
        />
      ) : null}

      {cpCompanyModal.open ? (
        <CpCompanyModal
          title={`${cpCompanyModal.mode === "add" ? "Add" : "Update"} CP Company Category`}
          name={cpCompanyModal.name}
          order={cpCompanyModal.order}
          onNameChange={(name) => setCpCompanyModal((p) => ({ ...p, name }))}
          onOrderChange={(order) => setCpCompanyModal((p) => ({ ...p, order }))}
          onClose={() => setCpCompanyModal((p) => ({ ...p, open: false }))}
          onSubmit={() => {
            const name = cpCompanyModal.name.trim();
            const order = cpCompanyModal.order.trim();
            if (!name) return;
            if (cpCompanyModal.mode === "add") setCpCompanyRows((p) => [...p, { name, order }]);
            else if (cpCompanyModal.index !== null) setCpCompanyRows((p) => p.map((r, i) => (i === cpCompanyModal.index ? { name, order } : r)));
            setCpCompanyModal((p) => ({ ...p, open: false }));
          }}
        />
      ) : null}

      {cpStageModal.open ? (
        <CpStageModal
          title={`${cpStageModal.mode === "add" ? "Add" : "Update"} CP Stage`}
          name={cpStageModal.name}
          order={cpStageModal.order}
          stage={cpStageModal.stage}
          onNameChange={(name) => setCpStageModal((p) => ({ ...p, name }))}
          onOrderChange={(order) => setCpStageModal((p) => ({ ...p, order }))}
          onStageChange={(stage) => setCpStageModal((p) => ({ ...p, stage }))}
          onClose={() => setCpStageModal((p) => ({ ...p, open: false }))}
          onSubmit={() => {
            const name = cpStageModal.name.trim();
            const order = cpStageModal.order.trim();
            if (!name) return;
            if (cpStageModal.mode === "add") setCpStageRows((p) => [...p, { name, order, stage: cpStageModal.stage }]);
            else if (cpStageModal.index !== null) setCpStageRows((p) => p.map((r, i) => (i === cpStageModal.index ? { name, order, stage: cpStageModal.stage } : r)));
            setCpStageModal((p) => ({ ...p, open: false }));
          }}
        />
      ) : null}

      {bannerModalOpen ? (
        <BannerModal
          redirectionUrl={bannerUrl}
          active={bannerActive}
          onUrlChange={setBannerUrl}
          onActiveChange={setBannerActive}
          onClose={() => setBannerModalOpen(false)}
          onSubmit={() => setBannerModalOpen(false)}
        />
      ) : null}

      {contactCategoryModal.open ? (
        <ContactCategoryModal
          title={`${contactCategoryModal.mode === "add" ? "Add" : "Update"} Contact Category`}
          name={contactCategoryModal.name}
          code={contactCategoryModal.code}
          onNameChange={(name) => setContactCategoryModal((p) => ({ ...p, name }))}
          onCodeChange={(code) => setContactCategoryModal((p) => ({ ...p, code }))}
          onClose={() => setContactCategoryModal((p) => ({ ...p, open: false }))}
          onSubmit={() => {
            const name = contactCategoryModal.name.trim();
            const code = contactCategoryModal.code.trim();
            if (!name) return;
            if (contactCategoryModal.mode === "add") setContactCategoryRows((p) => [...p, { name, code }]);
            else if (contactCategoryModal.index !== null) setContactCategoryRows((p) => p.map((r, i) => (i === contactCategoryModal.index ? { name, code } : r)));
            setContactCategoryModal((p) => ({ ...p, open: false }));
          }}
        />
      ) : null}

      {contactSubCategoryModal.open ? (
        <ContactSubCategoryModal
          title={`${contactSubCategoryModal.mode === "add" ? "Add" : "Update"} Contact Sub Category`}
          name={contactSubCategoryModal.name}
          code={contactSubCategoryModal.code}
          onNameChange={(name) => setContactSubCategoryModal((p) => ({ ...p, name }))}
          onCodeChange={(code) => setContactSubCategoryModal((p) => ({ ...p, code }))}
          onClose={() => setContactSubCategoryModal((p) => ({ ...p, open: false }))}
          onSubmit={() => {
            const name = contactSubCategoryModal.name.trim();
            const code = contactSubCategoryModal.code.trim();
            if (!name) return;
            if (contactSubCategoryModal.mode === "add") setContactSubCategoryRows((p) => [...p, { name, code }]);
            else if (contactSubCategoryModal.index !== null) setContactSubCategoryRows((p) => p.map((r, i) => (i === contactSubCategoryModal.index ? { name, code } : r)));
            setContactSubCategoryModal((p) => ({ ...p, open: false }));
          }}
        />
      ) : null}

      {contactTagModal.open ? (
        <ContactTagModal
          title={`${contactTagModal.mode === "add" ? "Add" : "Update"} Contact Tag`}
          name={contactTagModal.name}
          onNameChange={(name) => setContactTagModal((p) => ({ ...p, name }))}
          onClose={() => setContactTagModal((p) => ({ ...p, open: false }))}
          onSubmit={() => {
            const name = contactTagModal.name.trim();
            if (!name) return;
            if (contactTagModal.mode === "add") setContactTagRows((p) => [...p, { name }]);
            else if (contactTagModal.index !== null) setContactTagRows((p) => p.map((r, i) => (i === contactTagModal.index ? { ...r, name } : r)));
            setContactTagModal((p) => ({ ...p, open: false }));
          }}
        />
      ) : null}

      {contactTypeModal.open ? (
        <ContactTypeModal
          title={`${contactTypeModal.mode === "add" ? "Add" : "Update"} Contact Type`}
          name={contactTypeModal.name}
          onNameChange={(name) => setContactTypeModal((p) => ({ ...p, name }))}
          onClose={() => setContactTypeModal((p) => ({ ...p, open: false }))}
          onSubmit={() => {
            const name = contactTypeModal.name.trim();
            if (!name) return;
            if (contactTypeModal.mode === "add") setContactTypeRows((p) => [...p, { name }]);
            else if (contactTypeModal.index !== null) setContactTypeRows((p) => p.map((r, i) => (i === contactTypeModal.index ? { name } : r)));
            setContactTypeModal((p) => ({ ...p, open: false }));
          }}
        />
      ) : null}

      {contactStageModal.open ? (
        <ContactStageModal
          title={`${contactStageModal.mode === "add" ? "Add" : "Update"} Contact Stage`}
          name={contactStageModal.name}
          stage={contactStageModal.stage}
          onNameChange={(name) => setContactStageModal((p) => ({ ...p, name }))}
          onStageChange={(stage) => setContactStageModal((p) => ({ ...p, stage }))}
          onClose={() => setContactStageModal((p) => ({ ...p, open: false }))}
          onSubmit={() => {
            const name = contactStageModal.name.trim();
            if (!name) return;
            if (contactStageModal.mode === "add") setContactStageRows((p) => [...p, { name, stage: contactStageModal.stage }]);
            else if (contactStageModal.index !== null) setContactStageRows((p) => p.map((r, i) => (i === contactStageModal.index ? { name, stage: contactStageModal.stage } : r)));
            setContactStageModal((p) => ({ ...p, open: false }));
          }}
          submitLabel={contactStageModal.mode === "update" ? "Update" : "Submit"}
        />
      ) : null}

      {leadCategoryModal.open ? (
        <LeadCategoryModal
          title={`${leadCategoryModal.mode === "add" ? "Add" : "Update"} Lead Category`}
          name={leadCategoryModal.name}
          code={leadCategoryModal.code}
          order={leadCategoryModal.order}
          onNameChange={(name) => setLeadCategoryModal((p) => ({ ...p, name }))}
          onCodeChange={(code) => setLeadCategoryModal((p) => ({ ...p, code }))}
          onOrderChange={(order) => setLeadCategoryModal((p) => ({ ...p, order }))}
          onClose={() => setLeadCategoryModal((p) => ({ ...p, open: false }))}
          onSubmit={() => {
            const name = leadCategoryModal.name.trim();
            if (!name) return;
            const row = { name, code: leadCategoryModal.code, order: leadCategoryModal.order };
            if (leadCategoryModal.mode === "add") setLeadCategoryRows((p) => [...p, row]);
            else if (leadCategoryModal.index !== null) setLeadCategoryRows((p) => p.map((r, i) => (i === leadCategoryModal.index ? row : r)));
            setLeadCategoryModal((p) => ({ ...p, open: false }));
          }}
        />
      ) : null}

      {leadSourceModal.open ? (
        <LeadSourceModal
          title={`${leadSourceModal.mode === "add" ? "Add" : "Update"} Lead Source`}
          name={leadSourceModal.name}
          code={leadSourceModal.code}
          onNameChange={(name) => setLeadSourceModal((p) => ({ ...p, name }))}
          onCodeChange={(code) => setLeadSourceModal((p) => ({ ...p, code }))}
          onClose={() => setLeadSourceModal((p) => ({ ...p, open: false }))}
          onSubmit={() => {
            const name = leadSourceModal.name.trim();
            if (!name) return;
            const row = { name, code: leadSourceModal.code };
            if (leadSourceModal.mode === "add") setLeadSourceRows((p) => [...p, row]);
            else if (leadSourceModal.index !== null) setLeadSourceRows((p) => p.map((r, i) => (i === leadSourceModal.index ? row : r)));
            setLeadSourceModal((p) => ({ ...p, open: false }));
          }}
          submitLabel={leadSourceModal.mode === "update" ? "Update" : "Submit"}
        />
      ) : null}

      {leadSourceSubModal.open ? (
        <LeadSourceSubModal
          value={leadSourceSubModal.value}
          onValueChange={(value) => setLeadSourceSubModal((p) => ({ ...p, value }))}
          onClose={() => setLeadSourceSubModal((p) => ({ ...p, open: false }))}
          onAdd={() => setLeadSourceSubModal((p) => ({ ...p, value: "" }))}
        />
      ) : null}

      {leadStageModal.open ? (
        <LeadStageModal
          title={`${leadStageModal.mode === "add" ? "Add" : "Update"} Lead Stage`}
          name={leadStageModal.name}
          order={leadStageModal.order}
          category={leadStageModal.category}
          stage={leadStageModal.stage}
          qualified={leadStageModal.qualified}
          onNameChange={(name) => setLeadStageModal((p) => ({ ...p, name }))}
          onOrderChange={(order) => setLeadStageModal((p) => ({ ...p, order }))}
          onCategoryChange={(category) => setLeadStageModal((p) => ({ ...p, category }))}
          onStageChange={(stage) => setLeadStageModal((p) => ({ ...p, stage }))}
          onQualifiedChange={(qualified) => setLeadStageModal((p) => ({ ...p, qualified }))}
          onClose={() => setLeadStageModal((p) => ({ ...p, open: false }))}
          onSubmit={() => {
            const name = leadStageModal.name.trim();
            if (!name) return;
            const stage = leadStageModal.qualified ? "(Qualified)" : leadStageModal.stage === "Win" ? "(Win)" : leadStageModal.stage === "Inactive" ? "(Inactive)" : "(Start)";
            const row: LeadStageRow = { name, order: leadStageModal.order, stage, category: leadStageModal.category || "" };
            if (leadStageModal.mode === "add") setLeadStageRows((p) => [...p, row]);
            else if (leadStageModal.index !== null) setLeadStageRows((p) => p.map((r, i) => (i === leadStageModal.index ? row : r)));
            setLeadStageModal((p) => ({ ...p, open: false }));
          }}
        />
      ) : null}

      {leadStageReasonModal.open ? (
        <LeadStageReasonModal
          value={leadStageReasonModal.value}
          onValueChange={(value) => setLeadStageReasonModal((p) => ({ ...p, value }))}
          onClose={() => setLeadStageReasonModal((p) => ({ ...p, open: false }))}
          onAdd={() => setLeadStageReasonModal((p) => ({ ...p, value: "" }))}
        />
      ) : null}

      {leadTagModal.open ? (
        <LeadTagModal
          title={`${leadTagModal.mode === "add" ? "Add" : "Update"} Lead Tag`}
          name={leadTagModal.name}
          onNameChange={(name) => setLeadTagModal((p) => ({ ...p, name }))}
          onClose={() => setLeadTagModal((p) => ({ ...p, open: false }))}
          onSubmit={() => {
            const name = leadTagModal.name.trim();
            if (!name) return;
            if (leadTagModal.mode === "add") setLeadTagRows((p) => [...p, { name }]);
            else if (leadTagModal.index !== null) setLeadTagRows((p) => p.map((r, i) => (i === leadTagModal.index ? { ...r, name } : r)));
            setLeadTagModal((p) => ({ ...p, open: false }));
          }}
        />
      ) : null}

      {propertyStageModal.open ? (
        <PropertyStageModal
          title={`${propertyStageModal.mode === "add" ? "Add" : "Update"} Property Stage`}
          name={propertyStageModal.name}
          order={propertyStageModal.order}
          stage={propertyStageModal.stage}
          onNameChange={(name) => setPropertyStageModal((p) => ({ ...p, name }))}
          onOrderChange={(order) => setPropertyStageModal((p) => ({ ...p, order }))}
          onStageChange={(stage) => setPropertyStageModal((p) => ({ ...p, stage }))}
          onClose={() => setPropertyStageModal((p) => ({ ...p, open: false }))}
          onSubmit={() => {
            const name = propertyStageModal.name.trim();
            if (!name) return;
            const code = name.toUpperCase();
            const stage = propertyStageModal.stage === "Win" ? "(Win)" : propertyStageModal.stage === "Inactive" ? "(Inactive)" : "(Start)";
            const row: PropertyStageRow = { name, code, order: propertyStageModal.order, stage };
            if (propertyStageModal.mode === "add") setPropertyStageRows((p) => [...p, row]);
            else if (propertyStageModal.index !== null) setPropertyStageRows((p) => p.map((r, i) => (i === propertyStageModal.index ? row : r)));
            setPropertyStageModal((p) => ({ ...p, open: false }));
          }}
        />
      ) : null}

      {propertyTypeModal.open ? (
        <PropertyTypeModal
          title={`${propertyTypeModal.mode === "add" ? "Add" : "Update"} Property Type`}
          name={propertyTypeModal.name}
          onNameChange={(name) => setPropertyTypeModal((p) => ({ ...p, name }))}
          onClose={() => setPropertyTypeModal((p) => ({ ...p, open: false }))}
          onSubmit={() => {
            const name = propertyTypeModal.name.trim();
            if (!name) return;
            if (propertyTypeModal.mode === "add") setPropertyTypeRows((p) => [...p, { name }]);
            else if (propertyTypeModal.index !== null) setPropertyTypeRows((p) => p.map((r, i) => (i === propertyTypeModal.index ? { name } : r)));
            setPropertyTypeModal((p) => ({ ...p, open: false }));
          }}
        />
      ) : null}

      {unitTypeModal.open ? (
        <MasterListModal
          title="Unit Type"
          fieldLabel="Name"
          value={unitTypeModal.value}
          rows={unitTypeModal.rows}
          onValueChange={(value) => setUnitTypeModal((p) => ({ ...p, value }))}
          onClose={() => setUnitTypeModal((p) => ({ ...p, open: false }))}
          onAdd={() => {
            const v = unitTypeModal.value.trim();
            if (!v) return;
            setUnitTypeModal((p) => ({ ...p, rows: [...p.rows, v], value: "" }));
          }}
          onDelete={(index) => setUnitTypeModal((p) => ({ ...p, rows: p.rows.filter((_, i) => i !== index) }))}
        />
      ) : null}

      {subTypeModal.open ? (
        <MasterListModal
          title="Sub Type"
          fieldLabel="Name"
          value={subTypeModal.value}
          rows={subTypeModal.rows}
          onValueChange={(value) => setSubTypeModal((p) => ({ ...p, value }))}
          onClose={() => setSubTypeModal((p) => ({ ...p, open: false }))}
          onAdd={() => {
            const v = subTypeModal.value.trim();
            if (!v) return;
            setSubTypeModal((p) => ({ ...p, rows: [...p.rows, v], value: "" }));
          }}
          onDelete={(index) => setSubTypeModal((p) => ({ ...p, rows: p.rows.filter((_, i) => i !== index) }))}
        />
      ) : null}

      {regionModal.open ? (
        <SingleFieldModal
          title={`${regionModal.mode === "add" ? "Add" : "Update"} Region`}
          label="Region Value"
          value={regionModal.value}
          onChange={(value) => setRegionModal((p) => ({ ...p, value }))}
          onClose={() => setRegionModal((p) => ({ ...p, open: false }))}
          onSubmit={() => {
            const region = regionModal.value.trim();
            if (!region) return;
            if (regionModal.mode === "add") setRegionRows((p) => [...p, { region }]);
            else if (regionModal.index !== null) setRegionRows((p) => p.map((r, i) => (i === regionModal.index ? { region } : r)));
            setRegionModal((p) => ({ ...p, open: false }));
          }}
        />
      ) : null}
    </PageShell>
  );
}

function ModalFrame({ title, children, onClose, footer }: { title: string; children: React.ReactNode; onClose: () => void; footer: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[180] bg-black/55 p-3 sm:p-4">
      <div className="mx-auto mt-6 w-full max-w-[620px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-xl font-semibold text-[#3f4658]">{title}</h3>
          <button suppressHydrationWarning type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-4 py-4">{children}</div>
        <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-3">{footer}</div>
      </div>
    </div>
  );
}

function ModalButtons({ onSubmit, onClose, submitLabel = "Submit" }: { onSubmit: () => void; onClose: () => void; submitLabel?: string }) {
  return (
    <>
      <button suppressHydrationWarning type="button" onClick={onSubmit} className="rounded bg-[#1a56db] px-5 py-1.5 text-sm font-medium text-white hover:bg-blue-700">{submitLabel}</button>
      <button suppressHydrationWarning type="button" onClick={onClose} className="rounded bg-gray-200 px-5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300">Cancel</button>
    </>
  );
}

function ApiKeyConfigureModal({ apiKey, onApiKeyChange, onClose, onSubmit }: { apiKey: string; onApiKeyChange: (v: string) => void; onClose: () => void; onSubmit: () => void }) {
  return (
    <ModalFrame title="Configure" onClose={onClose} footer={<ModalButtons onSubmit={onSubmit} onClose={onClose} />}>
      <label className="mb-2 block text-sm font-semibold text-[#243656]">API Key</label>
      <input suppressHydrationWarning value={apiKey} onChange={(e) => onApiKeyChange(e.target.value)} placeholder="Please Enter API key" className="h-10 w-full rounded border border-gray-300 px-3 text-sm text-[#3f4658] placeholder:text-gray-400 outline-none focus:border-[#1a56db]" />
    </ModalFrame>
  );
}

function WhatsAppWatiConfigureModal({
  accessToken,
  apiEndpoint,
  onAccessTokenChange,
  onApiEndpointChange,
  onClose,
  onSubmit,
}: {
  accessToken: string;
  apiEndpoint: string;
  onAccessTokenChange: (v: string) => void;
  onApiEndpointChange: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <ModalFrame title="Configure" onClose={onClose} footer={<ModalButtons onSubmit={onSubmit} onClose={onClose} />}>
      <div className="space-y-4 text-sm">
        <div>
          <label className="mb-2 block font-semibold text-[#334155]">Access Token</label>
          <input suppressHydrationWarning value={accessToken} onChange={(e) => onAccessTokenChange(e.target.value)} placeholder="Please Enter Access Token" className="h-10 w-full rounded border border-gray-300 px-3 text-sm text-[#3f4658] placeholder:text-gray-400 outline-none focus:border-[#1a56db]" />
        </div>
        <div>
          <label className="mb-2 block font-semibold text-[#334155]">API Endpoint</label>
          <input suppressHydrationWarning value={apiEndpoint} onChange={(e) => onApiEndpointChange(e.target.value)} placeholder="Please Enter API Endpoint" className="h-10 w-full rounded border border-gray-300 px-3 text-sm text-[#3f4658] placeholder:text-gray-400 outline-none focus:border-[#1a56db]" />
        </div>
      </div>
    </ModalFrame>
  );
}

function SmtpConfigureModal({
  tab,
  onTabChange,
  basic,
  onBasicChange,
  userWise,
  onUserWiseChange,
  onClose,
  onSubmit,
}: {
  tab: "standard" | "userwise";
  onTabChange: (t: "standard" | "userwise") => void;
  basic: { host: string; port: string; userName: string; password: string };
  onBasicChange: (p: { host: string; port: string; userName: string; password: string }) => void;
  userWise: { salesAgentWise: boolean; accountType: string; hostUrl: string; hostPort: string; email: string; password: string };
  onUserWiseChange: (p: { salesAgentWise: boolean; accountType: string; hostUrl: string; hostPort: string; email: string; password: string }) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const title = tab === "userwise" ? "Configure UserWise SMTP" : "Configure";
  return (
    <ModalFrame title={title} onClose={onClose} footer={<ModalButtons onSubmit={onSubmit} onClose={onClose} />}>
      <div className="mb-4 flex gap-1 rounded border border-gray-200 bg-gray-50 p-0.5 text-xs">
        <button suppressHydrationWarning type="button" onClick={() => onTabChange("standard")} className={`flex-1 rounded px-2 py-1.5 font-medium ${tab === "standard" ? "bg-white text-[#1a56db] shadow-sm" : "text-gray-600 hover:text-[#3f4658]"}`}>
          Standard SMTP
        </button>
        <button suppressHydrationWarning type="button" onClick={() => onTabChange("userwise")} className={`flex-1 rounded px-2 py-1.5 font-medium ${tab === "userwise" ? "bg-white text-[#1a56db] shadow-sm" : "text-gray-600 hover:text-[#3f4658]"}`}>
          User-wise SMTP
        </button>
      </div>
      {tab === "standard" ? (
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold text-[#243656]">Host</label>
            <input suppressHydrationWarning value={basic.host} onChange={(e) => onBasicChange({ ...basic, host: e.target.value })} placeholder="Please Enter Host" className="h-10 w-full rounded border border-gray-300 px-3 text-sm text-[#3f4658] placeholder:text-gray-400 outline-none focus:border-[#1a56db]" />
          </div>
          <div>
            <label className="mb-2 block font-semibold text-[#243656]">Port</label>
            <input suppressHydrationWarning value={basic.port} onChange={(e) => onBasicChange({ ...basic, port: e.target.value })} placeholder="Please Enter Port" className="h-10 w-full rounded border border-gray-300 px-3 text-sm text-[#3f4658] placeholder:text-gray-400 outline-none focus:border-[#1a56db]" />
          </div>
          <div>
            <label className="mb-2 block font-semibold text-[#243656]">User Name</label>
            <input suppressHydrationWarning value={basic.userName} onChange={(e) => onBasicChange({ ...basic, userName: e.target.value })} placeholder="Please Enter User Name" className="h-10 w-full rounded border border-gray-300 px-3 text-sm text-[#3f4658] placeholder:text-gray-400 outline-none focus:border-[#1a56db]" />
          </div>
          <div>
            <label className="mb-2 block font-semibold text-[#243656]">Password</label>
            <input suppressHydrationWarning type="password" value={basic.password} onChange={(e) => onBasicChange({ ...basic, password: e.target.value })} placeholder="Please Enter Password" className="h-10 w-full rounded border border-gray-300 px-3 text-sm text-[#3f4658] placeholder:text-gray-400 outline-none focus:border-[#1a56db]" />
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-[#243656]">Sales Agent Wise Configure</span>
            <button suppressHydrationWarning type="button" role="switch" aria-checked={userWise.salesAgentWise} onClick={() => onUserWiseChange({ ...userWise, salesAgentWise: !userWise.salesAgentWise })} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${userWise.salesAgentWise ? "bg-[#1a56db]" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${userWise.salesAgentWise ? "translate-x-5" : ""}`} />
            </button>
          </div>
          <div>
            <label className="mb-2 block font-semibold text-[#243656]">Select Account Type</label>
            <select suppressHydrationWarning value={userWise.accountType} onChange={(e) => onUserWiseChange({ ...userWise, accountType: e.target.value })} className="h-10 w-full rounded border border-gray-300 bg-white px-3 text-sm text-[#3f4658] outline-none focus:border-[#1a56db]">
              <option value="">Select Account Type</option>
              <option value="gmail">Gmail</option>
              <option value="outlook">Outlook</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block font-semibold text-[#243656]">Host Url</label>
            <input suppressHydrationWarning value={userWise.hostUrl} onChange={(e) => onUserWiseChange({ ...userWise, hostUrl: e.target.value })} placeholder="smtp.domain.com" className="h-10 w-full rounded border border-gray-300 bg-gray-100 px-3 text-sm text-[#3f4658] placeholder:text-gray-400 outline-none focus:border-[#1a56db]" />
          </div>
          <div>
            <label className="mb-2 block font-semibold text-[#243656]">Host Port</label>
            <input suppressHydrationWarning value={userWise.hostPort} onChange={(e) => onUserWiseChange({ ...userWise, hostPort: e.target.value })} placeholder="0" className="h-10 w-full rounded border border-gray-300 bg-gray-100 px-3 text-sm text-[#3f4658] placeholder:text-gray-400 outline-none focus:border-[#1a56db]" />
          </div>
          <div>
            <label className="mb-2 block font-semibold text-[#243656]">Email</label>
            <input suppressHydrationWarning value={userWise.email} onChange={(e) => onUserWiseChange({ ...userWise, email: e.target.value })} placeholder="Email" className="h-10 w-full rounded border border-gray-300 bg-white px-3 text-sm text-[#3f4658] placeholder:text-gray-400 outline-none focus:border-[#1a56db]" />
          </div>
          <div>
            <label className="mb-2 block font-semibold text-[#243656]">Password</label>
            <input suppressHydrationWarning type="password" value={userWise.password} onChange={(e) => onUserWiseChange({ ...userWise, password: e.target.value })} placeholder="Password" className="h-10 w-full rounded border border-gray-300 bg-white px-3 text-sm text-[#3f4658] placeholder:text-gray-400 outline-none focus:border-[#1a56db]" />
          </div>
        </div>
      )}
    </ModalFrame>
  );
}

function SingleFieldModal({ title, label, value, onChange, onClose, onSubmit }: { title: string; label: string; value: string; onChange: (v: string) => void; onClose: () => void; onSubmit: () => void }) {
  return (
    <ModalFrame title={title} onClose={onClose} footer={<ModalButtons onSubmit={onSubmit} onClose={onClose} />}>
      <label className="mb-2 block text-sm font-semibold text-[#3f4658]">{label}</label>
      <input suppressHydrationWarning value={value} onChange={(e) => onChange(e.target.value)} placeholder={label === "Area Value" ? "Enter Value" : "Enter Name"} className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" />
    </ModalFrame>
  );
}

function BudgetModal({ title, name, amount, onNameChange, onAmountChange, onClose, onSubmit }: { title: string; name: string; amount: string; onNameChange: (v: string) => void; onAmountChange: (v: string) => void; onClose: () => void; onSubmit: () => void }) {
  return (
    <ModalFrame title={title} onClose={onClose} footer={<ModalButtons onSubmit={onSubmit} onClose={onClose} />}>
      <div className="space-y-3">
        <div><label className="mb-2 block text-sm font-semibold text-[#3f4658]">Name</label><input suppressHydrationWarning value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Enter Name" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" /></div>
        <div><label className="mb-2 block text-sm font-semibold text-[#3f4658]">Amount</label><input suppressHydrationWarning value={amount} onChange={(e) => onAmountChange(e.target.value)} placeholder="Enter Amount" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" /></div>
      </div>
    </ModalFrame>
  );
}

function CpCompanyModal({ title, name, order, onNameChange, onOrderChange, onClose, onSubmit }: { title: string; name: string; order: string; onNameChange: (v: string) => void; onOrderChange: (v: string) => void; onClose: () => void; onSubmit: () => void }) {
  return (
    <ModalFrame title={title} onClose={onClose} footer={<ModalButtons onSubmit={onSubmit} onClose={onClose} />}>
      <div className="space-y-3">
        <div><label className="mb-2 block text-sm font-semibold text-[#3f4658]">Name</label><input suppressHydrationWarning value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Name" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" /></div>
        <div><label className="mb-2 block text-sm font-semibold text-[#3f4658]">Order</label><input suppressHydrationWarning value={order} onChange={(e) => onOrderChange(e.target.value)} placeholder="Order" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" /></div>
      </div>
    </ModalFrame>
  );
}

function CpStageModal({ title, name, order, stage, onNameChange, onOrderChange, onStageChange, onClose, onSubmit }: { title: string; name: string; order: string; stage: "Start" | "Win" | "Inactive"; onNameChange: (v: string) => void; onOrderChange: (v: string) => void; onStageChange: (v: "Start" | "Win" | "Inactive") => void; onClose: () => void; onSubmit: () => void }) {
  return (
    <ModalFrame title={title} onClose={onClose} footer={<ModalButtons onSubmit={onSubmit} onClose={onClose} />}>
      <div className="space-y-3">
        <div><label className="mb-2 block text-sm font-semibold text-[#3f4658]">Name</label><input suppressHydrationWarning value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Stage Name" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" /></div>
        <div><label className="mb-2 block text-sm font-semibold text-[#3f4658]">Order</label><input suppressHydrationWarning value={order} onChange={(e) => onOrderChange(e.target.value)} className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" /></div>
        <div className="space-y-2">
          {(["Start", "Win", "Inactive"] as const).map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-[#3f4658]">
              <input suppressHydrationWarning type="checkbox" checked={stage === opt} onChange={() => onStageChange(opt)} className="h-4 w-4 rounded border-gray-300 text-[#1a56db]" />
              {opt}
            </label>
          ))}
        </div>
      </div>
    </ModalFrame>
  );
}

function ContactCategoryModal({ title, name, code, onNameChange, onCodeChange, onClose, onSubmit }: { title: string; name: string; code: string; onNameChange: (v: string) => void; onCodeChange: (v: string) => void; onClose: () => void; onSubmit: () => void }) {
  return (
    <ModalFrame title={title} onClose={onClose} footer={<ModalButtons onSubmit={onSubmit} onClose={onClose} />}>
      <div className="space-y-3">
        <div><label className="mb-2 block text-sm font-semibold text-[#3f4658]">Name</label><input suppressHydrationWarning value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Name" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" /></div>
        <div><label className="mb-2 block text-sm font-semibold text-[#3f4658]">Code</label><input suppressHydrationWarning value={code} onChange={(e) => onCodeChange(e.target.value)} placeholder="Code" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" /></div>
      </div>
    </ModalFrame>
  );
}

function ContactSubCategoryModal({ title, name, code, onNameChange, onCodeChange, onClose, onSubmit }: { title: string; name: string; code: string; onNameChange: (v: string) => void; onCodeChange: (v: string) => void; onClose: () => void; onSubmit: () => void }) {
  return (
    <ModalFrame title={title} onClose={onClose} footer={<ModalButtons onSubmit={onSubmit} onClose={onClose} />}>
      <div className="space-y-3">
        <div><label className="mb-2 block text-sm font-semibold text-[#3f4658]">Name</label><input suppressHydrationWarning value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Name" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" /></div>
        <div><label className="mb-2 block text-sm font-semibold text-[#3f4658]">Code</label><input suppressHydrationWarning value={code} onChange={(e) => onCodeChange(e.target.value)} placeholder="Code" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" /></div>
      </div>
    </ModalFrame>
  );
}

function ContactTagModal({ title, name, onNameChange, onClose, onSubmit }: { title: string; name: string; onNameChange: (v: string) => void; onClose: () => void; onSubmit: () => void }) {
  return (
    <ModalFrame title={title} onClose={onClose} footer={<ModalButtons onSubmit={onSubmit} onClose={onClose} />}>
      <label className="mb-2 block text-sm font-semibold text-[#3f4658]">Name</label>
      <input suppressHydrationWarning value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Name" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" />
    </ModalFrame>
  );
}

function ContactTypeModal({ title, name, onNameChange, onClose, onSubmit }: { title: string; name: string; onNameChange: (v: string) => void; onClose: () => void; onSubmit: () => void }) {
  return (
    <ModalFrame title={title} onClose={onClose} footer={<ModalButtons onSubmit={onSubmit} onClose={onClose} />}>
      <label className="mb-2 block text-sm font-semibold text-[#3f4658]">Name</label>
      <input suppressHydrationWarning value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Enter Name" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" />
    </ModalFrame>
  );
}

function ContactStageModal({ title, name, stage, onNameChange, onStageChange, onClose, onSubmit, submitLabel = "Submit" }: { title: string; name: string; stage: "Open" | "Prospect" | "Unqualified"; onNameChange: (v: string) => void; onStageChange: (v: "Open" | "Prospect" | "Unqualified") => void; onClose: () => void; onSubmit: () => void; submitLabel?: string }) {
  return (
    <ModalFrame title={title} onClose={onClose} footer={<ModalButtons onSubmit={onSubmit} onClose={onClose} submitLabel={submitLabel} />}>
      <div className="space-y-3">
        <div><label className="mb-2 block text-sm font-semibold text-[#3f4658]">Stage Name</label><input suppressHydrationWarning value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Stage Name" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" /></div>
        <div className="space-y-2">
          {(["Open", "Prospect", "Unqualified"] as const).map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-[#3f4658]">
              <input suppressHydrationWarning type="checkbox" checked={stage === opt} onChange={() => onStageChange(opt)} className="h-4 w-4 rounded border-gray-300 text-[#1a56db]" />
              {opt}
            </label>
          ))}
        </div>
      </div>
    </ModalFrame>
  );
}

function LeadCategoryModal({ title, name, code, order, onNameChange, onCodeChange, onOrderChange, onClose, onSubmit }: { title: string; name: string; code: string; order: string; onNameChange: (v: string) => void; onCodeChange: (v: string) => void; onOrderChange: (v: string) => void; onClose: () => void; onSubmit: () => void }) {
  return (
    <ModalFrame title={title} onClose={onClose} footer={<ModalButtons onSubmit={onSubmit} onClose={onClose} />}>
      <div className="space-y-3">
        <div><label className="mb-2 block text-sm font-semibold text-[#3f4658]">Name</label><input suppressHydrationWarning value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Name" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" /></div>
        <div><label className="mb-2 block text-sm font-semibold text-[#3f4658]">Code</label><input suppressHydrationWarning value={code} onChange={(e) => onCodeChange(e.target.value)} placeholder="Code" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" /></div>
        <div><label className="mb-2 block text-sm font-semibold text-[#3f4658]">Order</label><input suppressHydrationWarning value={order} onChange={(e) => onOrderChange(e.target.value)} placeholder="0" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" /></div>
      </div>
    </ModalFrame>
  );
}

function LeadSourceModal({ title, name, code, onNameChange, onCodeChange, onClose, onSubmit, submitLabel = "Submit" }: { title: string; name: string; code: string; onNameChange: (v: string) => void; onCodeChange: (v: string) => void; onClose: () => void; onSubmit: () => void; submitLabel?: string }) {
  return (
    <ModalFrame title={title} onClose={onClose} footer={<ModalButtons onSubmit={onSubmit} onClose={onClose} submitLabel={submitLabel} />}>
      <div className="space-y-3">
        <div><label className="mb-2 block text-sm font-semibold text-[#3f4658]">Name</label><input suppressHydrationWarning value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Name" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" /></div>
        <div><label className="mb-2 block text-sm font-semibold text-[#3f4658]">Code</label><input suppressHydrationWarning value={code} onChange={(e) => onCodeChange(e.target.value)} placeholder="Code" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" /></div>
      </div>
    </ModalFrame>
  );
}

function LeadSourceSubModal({ value, onValueChange, onClose, onAdd }: { value: string; onValueChange: (v: string) => void; onClose: () => void; onAdd: () => void }) {
  return (
    <ModalFrame title="Add Sub Source" onClose={onClose} footer={
      <>
        <button suppressHydrationWarning type="button" onClick={onAdd} className="rounded bg-[#1a56db] px-5 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Add</button>
        <button suppressHydrationWarning type="button" onClick={onClose} className="rounded bg-gray-200 px-5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300">Cancel</button>
      </>
    }>
      <div className="space-y-3">
        <div><label className="mb-2 block text-sm font-semibold text-[#3f4658]">Lead Sub Source</label><input suppressHydrationWarning value={value} onChange={(e) => onValueChange(e.target.value)} placeholder="Enter Sub Source" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" /></div>
        <div className="overflow-x-auto rounded border border-gray-200">
          <table className="w-full min-w-[760px] text-left text-xs text-[#4a5165]">
            <thead className="bg-gray-50 uppercase text-[11px] text-gray-600"><tr><th className="border-b border-r border-gray-200 px-2 py-2">#</th><th className="border-b border-r border-gray-200 px-2 py-2">Name</th><th className="border-b border-gray-200 px-2 py-2">Action</th></tr></thead>
            <tbody><tr><td className="border-b border-gray-100 px-2 py-3 text-center text-sm text-gray-500" colSpan={3}>No Data Found</td></tr></tbody>
          </table>
        </div>
      </div>
    </ModalFrame>
  );
}

function LeadStageModal({ title, name, order, category, stage, qualified, onNameChange, onOrderChange, onCategoryChange, onStageChange, onQualifiedChange, onClose, onSubmit }: { title: string; name: string; order: string; category: string; stage: "Start" | "Win" | "Inactive"; qualified: boolean; onNameChange: (v: string) => void; onOrderChange: (v: string) => void; onCategoryChange: (v: string) => void; onStageChange: (v: "Start" | "Win" | "Inactive") => void; onQualifiedChange: (v: boolean) => void; onClose: () => void; onSubmit: () => void }) {
  return (
    <ModalFrame title={title} onClose={onClose} footer={<ModalButtons onSubmit={onSubmit} onClose={onClose} />}>
      <div className="space-y-3">
        <div><label className="mb-2 block text-sm font-semibold text-[#3f4658]">Name</label><input suppressHydrationWarning value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Name" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" /></div>
        <div><label className="mb-2 block text-sm font-semibold text-[#3f4658]">Order</label><input suppressHydrationWarning value={order} onChange={(e) => onOrderChange(e.target.value)} placeholder="Order" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" /></div>
        <div><label className="mb-2 block text-sm font-semibold text-[#3f4658]">Lead Category</label><input suppressHydrationWarning value={category} onChange={(e) => onCategoryChange(e.target.value)} placeholder="Select Lead Category" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" /></div>
        <div className="space-y-2">
          {(["Start", "Win", "Inactive"] as const).map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-[#3f4658]">
              <input suppressHydrationWarning type="checkbox" checked={stage === opt} onChange={() => onStageChange(opt)} className="h-4 w-4 rounded border-gray-300 text-[#1a56db]" />
              {opt}
            </label>
          ))}
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-[#3f4658]">Qualified/Unqualified</p>
          <label className="flex items-center gap-2 text-sm text-[#3f4658]">
            <input suppressHydrationWarning type="checkbox" checked={qualified} onChange={(e) => onQualifiedChange(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#1a56db]" />
            Qualified
          </label>
        </div>
      </div>
    </ModalFrame>
  );
}

function LeadStageReasonModal({ value, onValueChange, onClose, onAdd }: { value: string; onValueChange: (v: string) => void; onClose: () => void; onAdd: () => void }) {
  return (
    <ModalFrame title="Lead Stage Reasons" onClose={onClose} footer={
      <>
        <button suppressHydrationWarning type="button" onClick={onAdd} className="rounded bg-[#1a56db] px-5 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Add</button>
        <button suppressHydrationWarning type="button" onClick={onClose} className="rounded bg-gray-200 px-5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300">Cancel</button>
      </>
    }>
      <label className="mb-2 block text-sm font-semibold text-[#3f4658]">Stage Reason</label>
      <input suppressHydrationWarning value={value} onChange={(e) => onValueChange(e.target.value)} placeholder="Enter Reason" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" />
    </ModalFrame>
  );
}

function LeadTagModal({ title, name, onNameChange, onClose, onSubmit }: { title: string; name: string; onNameChange: (v: string) => void; onClose: () => void; onSubmit: () => void }) {
  return (
    <ModalFrame title={title} onClose={onClose} footer={<ModalButtons onSubmit={onSubmit} onClose={onClose} />}>
      <label className="mb-2 block text-sm font-semibold text-[#3f4658]">Name</label>
      <input suppressHydrationWarning value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Name" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" />
    </ModalFrame>
  );
}

function PropertyStageModal({ title, name, order, stage, onNameChange, onOrderChange, onStageChange, onClose, onSubmit }: { title: string; name: string; order: string; stage: "Start" | "Win" | "Inactive"; onNameChange: (v: string) => void; onOrderChange: (v: string) => void; onStageChange: (v: "Start" | "Win" | "Inactive") => void; onClose: () => void; onSubmit: () => void }) {
  return (
    <ModalFrame title={title} onClose={onClose} footer={<ModalButtons onSubmit={onSubmit} onClose={onClose} />}>
      <div className="space-y-3">
        <div><label className="mb-2 block text-sm font-semibold text-[#3f4658]">Name</label><input suppressHydrationWarning value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Enter Name" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" /></div>
        <div><label className="mb-2 block text-sm font-semibold text-[#3f4658]">Order</label><input suppressHydrationWarning value={order} onChange={(e) => onOrderChange(e.target.value)} placeholder="Enter Order" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" /></div>
        <div className="space-y-2">
          {(["Start", "Win", "Inactive"] as const).map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-[#3f4658]">
              <input suppressHydrationWarning type="checkbox" checked={stage === opt} onChange={() => onStageChange(opt)} className="h-4 w-4 rounded border-gray-300 text-[#1a56db]" />
              {opt}
            </label>
          ))}
        </div>
      </div>
    </ModalFrame>
  );
}

function PropertyTypeModal({ title, name, onNameChange, onClose, onSubmit }: { title: string; name: string; onNameChange: (v: string) => void; onClose: () => void; onSubmit: () => void }) {
  return (
    <ModalFrame title={title} onClose={onClose} footer={<ModalButtons onSubmit={onSubmit} onClose={onClose} />}>
      <label className="mb-2 block text-sm font-semibold text-[#3f4658]">Name</label>
      <input suppressHydrationWarning value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Enter Name" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" />
    </ModalFrame>
  );
}

function MasterListModal({ title, fieldLabel, value, rows, onValueChange, onClose, onAdd, onDelete }: { title: string; fieldLabel: string; value: string; rows: string[]; onValueChange: (v: string) => void; onClose: () => void; onAdd: () => void; onDelete: (index: number) => void }) {
  return (
    <div className="fixed inset-0 z-[180] bg-black/55 p-3 sm:p-4">
      <div className="mx-auto mt-2 w-full max-w-[900px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-xl font-semibold text-[#3f4658]">{title}</h3>
          <button suppressHydrationWarning type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3 px-4 py-4">
          <label className="block text-sm font-semibold text-[#3f4658]">{fieldLabel}</label>
          <input suppressHydrationWarning value={value} onChange={(e) => onValueChange(e.target.value)} placeholder="Type & Press Enter" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" />
          <div className="flex justify-end gap-2">
            <button suppressHydrationWarning type="button" onClick={onAdd} className="rounded bg-[#5f8fcb] px-5 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Add</button>
            <button suppressHydrationWarning type="button" onClick={onClose} className="rounded bg-gray-200 px-5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300">Cancel</button>
          </div>
          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="w-full min-w-[760px] text-left text-xs text-[#4a5165]">
              <thead className="bg-gray-50 uppercase text-[11px] text-gray-600"><tr><th className="border-b border-r border-gray-200 px-2 py-2">#</th><th className="border-b border-r border-gray-200 px-2 py-2">Name</th><th className="border-b border-gray-200 px-2 py-2">Action</th></tr></thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={`${row}-${i}`} className="hover:bg-gray-50">
                    <td className="border-b border-r border-gray-100 px-2 py-2">{i + 1}</td>
                    <td className="border-b border-r border-gray-100 px-2 py-2">{row}</td>
                    <td className="border-b border-gray-100 px-2 py-2">
                      <div className="flex items-center gap-1">
                        <button suppressHydrationWarning type="button" className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#14c8b4] text-white"><Pencil className="h-3 w-3" /></button>
                        <button suppressHydrationWarning type="button" onClick={() => onDelete(i)} className="inline-flex h-5 w-5 items-center justify-center rounded bg-rose-500 text-white"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function BannerModal({ redirectionUrl, active, onUrlChange, onActiveChange, onClose, onSubmit }: { redirectionUrl: string; active: boolean; onUrlChange: (v: string) => void; onActiveChange: (v: boolean) => void; onClose: () => void; onSubmit: () => void }) {
  return (
    <div className="fixed inset-0 z-[180] bg-black/55 p-3 sm:p-4">
      <div className="mx-auto mt-6 w-full max-w-[980px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-xl font-semibold text-[#3f4658]">Add Banner</h3>
          <button suppressHydrationWarning type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4 px-4 py-4">
          <div className="grid grid-cols-[1fr_auto] items-end gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#3f4658]">Redirection Url</label>
              <input suppressHydrationWarning value={redirectionUrl} onChange={(e) => onUrlChange(e.target.value)} placeholder="Add Redirection Url" className="h-10 w-full rounded border border-gray-300 px-3 text-xl text-[#3f4658] outline-none focus:border-[#1a56db]" />
            </div>
            <label className="mb-2 flex items-center gap-2 text-sm text-[#3f4658]">
              <input suppressHydrationWarning type="checkbox" checked={active} onChange={(e) => onActiveChange(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
              Active
            </label>
          </div>
          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="w-full min-w-[760px] text-left text-xs text-[#4a5165]">
              <thead className="bg-gray-50 text-[11px] uppercase text-gray-600">
                <tr>
                  <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                  <th className="border-b border-r border-gray-200 px-2 py-2">Preview</th>
                  <th className="border-b border-r border-gray-200 px-2 py-2">Description</th>
                  <th className="border-b border-gray-200 px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-r border-gray-100 px-2 py-2"></td>
                  <td className="border-b border-r border-gray-100 px-2 py-2"></td>
                  <td className="border-b border-r border-gray-100 px-2 py-2 text-sm text-[#3f4658]">No Documents Founds</td>
                  <td className="border-b border-gray-100 px-2 py-2"></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-16 py-2 text-sm font-medium text-white hover:bg-blue-700">Choose</button>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-3">
          <button suppressHydrationWarning type="button" onClick={onSubmit} className="rounded bg-[#1a56db] px-5 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Add Banner</button>
          <button suppressHydrationWarning type="button" onClick={onClose} className="rounded bg-gray-200 px-5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300">Cancel</button>
        </div>
      </div>
    </div>
  );
}

