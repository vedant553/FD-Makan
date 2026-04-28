"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  Bold,
  Calendar,
  ChevronDown,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Plus,
  Quote,
  Redo2,
  Save,
  Strikethrough,
  Trash2,
  Underline,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { findProjectRow } from "../../project-mocks";

const PRIMARY = "bg-[#1a56db] hover:bg-blue-700 text-white";
const ORANGE = "bg-[#f97316] hover:bg-orange-600 text-white";
const fieldClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db]";
const labelClass = "mb-1.5 block text-[13px] font-bold text-gray-700";

function Req({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span className="text-red-500">*</span>
      {children}
    </>
  );
}

function SelectChevron() {
  return <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />;
}

function FakeRichToolbar() {
  const btn = "rounded p-1.5 text-gray-600 hover:bg-gray-100";
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1">
      <button type="button" className={btn} aria-label="Bold">
        <Bold className="h-4 w-4" />
      </button>
      <button type="button" className={btn} aria-label="Italic">
        <Italic className="h-4 w-4" />
      </button>
      <button type="button" className={btn} aria-label="Underline">
        <Underline className="h-4 w-4" />
      </button>
      <button type="button" className={btn} aria-label="Strikethrough">
        <Strikethrough className="h-4 w-4" />
      </button>
      <button type="button" className={btn} aria-label="Code">
        <span className="font-mono text-xs">&lt;&gt;</span>
      </button>
      <button type="button" className={btn} aria-label="Quote">
        <Quote className="h-4 w-4" />
      </button>
      <button type="button" className={btn} aria-label="Bullet list">
        <List className="h-4 w-4" />
      </button>
      <button type="button" className={btn} aria-label="Numbered list">
        <ListOrdered className="h-4 w-4" />
      </button>
      <select className="ml-1 rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700" aria-label="Heading">
        <option>Heading</option>
      </select>
      <button type="button" className={btn} aria-label="Link">
        <LinkIcon className="h-4 w-4" />
      </button>
      <button type="button" className={btn} aria-label="Redo">
        <Redo2 className="h-4 w-4" />
      </button>
      <span className="ml-auto flex gap-1">
        <button type="button" className={btn} aria-label="Align left">
          <span className="text-xs font-semibold">≡</span>
        </button>
        <button type="button" className={btn} aria-label="Align center">
          <span className="text-xs font-semibold">≡</span>
        </button>
        <button type="button" className={btn} aria-label="Align right">
          <span className="text-xs font-semibold">≡</span>
        </button>
      </span>
    </div>
  );
}

type UnitRow = {
  id: string;
  unitType: string;
  superBuilt: string;
  carpet: string;
  metric: string;
  rate: string;
  price: string;
};

function newUnitRow(): UnitRow {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    unitType: "2bhk",
    superBuilt: "0",
    carpet: "",
    metric: "Sq. Ft",
    rate: "",
    price: "",
  };
}

const UNITS_91: UnitRow[] = [
  { id: "u1", unitType: "2bhk", superBuilt: "0", carpet: "698", metric: "Sq. Ft", rate: "", price: "99.99 lacs" },
  { id: "u2", unitType: "2bhk", superBuilt: "0", carpet: "737", metric: "Sq. Ft", rate: "", price: "1.06 cr" },
  { id: "u3", unitType: "3bhk", superBuilt: "0", carpet: "928", metric: "Sq. Ft", rate: "", price: "1.36 cr" },
  { id: "u4", unitType: "3bhk", superBuilt: "0", carpet: "952", metric: "Sq. Ft", rate: "", price: "1.45 cr" },
];

const AMENITIES_91 = [
  "Swimming Pool",
  "Garden",
  "Gym",
  "Gazebo At Rooftop",
  "Meditation Zone",
  "Party Deck At Roof",
  "Kids Play Area",
  "24/7 Security",
];

const HIGHLIGHTS_91 = [
  "Navi Mumbai Airport-15 Mins",
  "Kharghar RLY STN-20 Mins",
  "Mumbai Pune Expressway-15 Mins",
  "Atal Setu-30 Mins",
  "Amandoot Metro STN-3 Mins",
  "Proposed Kharghar Turbhe Linked Road-15 Mins",
];

const SALES_AGENTS_91 = ["Avishi Pandey", "Aniket Surwade", "Pranay Waghmare", "Vishal Shukla", "Arbaaz Patel"];

function TagInput({
  label,
  placeholder,
  tags,
  onAdd,
  onRemove,
}: {
  label: string;
  placeholder: string;
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const t = draft.trim();
      if (t) {
        onAdd(t);
        setDraft("");
      }
    }
  };
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex min-h-[42px] flex-wrap gap-2 rounded-md border border-gray-300 px-2 py-1.5 focus-within:border-[#1a56db] focus-within:ring-1 focus-within:ring-[#1a56db]">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-md bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-900">
            {t}
            <button type="button" className="rounded p-0.5 hover:bg-sky-200" aria-label={`Remove ${t}`} onClick={() => onRemove(t)}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="min-w-[160px] flex-1 border-0 bg-transparent py-1 text-sm outline-none placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}

function ToggleRow({ label, pressed, onToggle }: { label: string; pressed: boolean; onToggle: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={pressed} onClick={onToggle} className="flex items-center gap-3 text-left">
      <span
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full border border-transparent transition-colors",
          pressed ? "bg-[#1a56db]" : "bg-gray-300",
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform",
            pressed ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </span>
      <span className="text-sm font-medium text-gray-800">{label}</span>
    </button>
  );
}

type TabId = "info" | "images" | "videos";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const row = useMemo(() => findProjectRow(projectId), [projectId]);

  const [tab, setTab] = useState<TabId>("info");
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (!row) return;
    setFeatured(row.featured);
    setPublished(row.published);
  }, [row]);
  const [units, setUnits] = useState<UnitRow[]>(() => (projectId === "91" ? UNITS_91.map((u) => ({ ...u })) : [newUnitRow()]));

  const [amenities, setAmenities] = useState<string[]>(() => (projectId === "91" ? [...AMENITIES_91] : ["Lift"]));
  const [highlights, setHighlights] = useState<string[]>(() => (projectId === "91" ? [...HIGHLIGHTS_91] : ["Near Railway Station"]));
  const [salesAgents, setSalesAgents] = useState<string[]>(() => (projectId === "91" ? [...SALES_AGENTS_91] : []));

  const [imageLinkRows, setImageLinkRows] = useState<{ id: string; url: string; description: string; category: string }[]>([
    { id: "img1", url: "", description: "", category: "" },
  ]);
  const [videoRows, setVideoRows] = useState<{ id: string; url: string }[]>([{ id: "v1", url: "" }]);

  const addAmenity = useCallback((t: string) => setAmenities((s) => (s.includes(t) ? s : [...s, t])), []);
  const removeAmenity = useCallback((t: string) => setAmenities((s) => s.filter((x) => x !== t)), []);
  const addHighlight = useCallback((t: string) => setHighlights((s) => (s.includes(t) ? s : [...s, t])), []);
  const removeHighlight = useCallback((t: string) => setHighlights((s) => s.filter((x) => x !== t)), []);
  const addSales = useCallback((t: string) => setSalesAgents((s) => (s.includes(t) ? s : [...s, t])), []);
  const removeSales = useCallback((t: string) => setSalesAgents((s) => s.filter((x) => x !== t)), []);

  const updateUnit = (id: string, patch: Partial<UnitRow>) =>
    setUnits((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  const removeUnit = (id: string) => setUnits((prev) => (prev.length <= 1 ? prev : prev.filter((u) => u.id !== id)));
  const addUnitAfter = (index: number) =>
    setUnits((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, newUnitRow());
      return next;
    });

  if (!row) {
    return (
      <div className="min-h-screen bg-[#f4f7f6] p-8">
        <p className="text-gray-700">Project not found.</p>
        <Link href="/crm/projects" className="mt-4 inline-block text-[#1a56db] hover:underline">
          Back to Projects
        </Link>
      </div>
    );
  }

  const tabBtn = (id: TabId, label: string) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={cn(
        "rounded-t-md px-5 py-2.5 text-sm font-semibold transition-colors",
        tab === id ? "bg-[#1a56db] text-white" : "bg-white text-[#1a56db] hover:bg-gray-50",
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f4f7f6] pb-28 font-sans text-gray-900">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex flex-wrap gap-1">
            {tabBtn("info", "Project Information")}
            {tabBtn("images", "Images")}
            {tabBtn("videos", "Videos")}
          </div>
          <button type="button" className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#f97316] text-white shadow-sm hover:bg-orange-600" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 md:px-6">
        <div>
          <Link href="/crm/projects" className="text-sm font-medium text-[#1a56db] hover:underline">
            ← Back to Projects
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-gray-900">Edit Information</h1>
        </div>

        {tab === "info" ? (
          <>
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-gray-900">Edit Project</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className={labelClass}>
                    <Req>Project Name</Req>
                  </label>
                  <input className={fieldClass} defaultValue={projectId === "91" ? "RAINBOW LIFE" : row.name} />
                </div>
                <div>
                  <label className={labelClass}>Developer Name</label>
                  <input className={fieldClass} defaultValue={projectId === "91" ? "Ellora" : ""} placeholder="Developer Name" />
                </div>
                <div>
                  <label className={labelClass}>
                    <Req>Project Type</Req>
                  </label>
                  <div className="relative">
                    <select className={cn(fieldClass, "appearance-none pr-9")} defaultValue="Residential">
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                    <SelectChevron />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Sub Type</label>
                  <div className="relative">
                    <select className={cn(fieldClass, "appearance-none pr-9")} defaultValue="Flat">
                      <option value="Flat">Flat</option>
                      <option value="Villa">Villa</option>
                    </select>
                    <SelectChevron />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-8 border-t border-gray-100 pt-6">
                <ToggleRow label="Mark As IsFeatured" pressed={featured} onToggle={() => setFeatured((v) => !v)} />
                <ToggleRow label="Mark As IsPublished" pressed={published} onToggle={() => setPublished((v) => !v)} />
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-gray-900">Unit Type</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-sm">
                  <thead className="bg-gray-100 text-left text-xs font-semibold uppercase text-gray-700">
                    <tr>
                      <th className="border-b px-2 py-2">Select Unit Type</th>
                      <th className="border-b px-2 py-2">Super Buildup Area</th>
                      <th className="border-b px-2 py-2">Carpet Area</th>
                      <th className="border-b px-2 py-2">Area Metric</th>
                      <th className="border-b px-2 py-2">Rate Per Area</th>
                      <th className="border-b px-2 py-2">Price</th>
                      <th className="border-b px-2 py-2 w-28">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.map((u, index) => (
                      <tr key={u.id} className="border-b border-gray-100">
                        <td className="px-2 py-2">
                          <div className="relative">
                            <select
                              className={cn(fieldClass, "appearance-none py-1.5 pr-8 text-[13px]")}
                              value={u.unitType}
                              onChange={(e) => updateUnit(u.id, { unitType: e.target.value })}
                            >
                              <option value="2bhk">2bhk</option>
                              <option value="3bhk">3bhk</option>
                              <option value="1bhk">1bhk</option>
                            </select>
                            <SelectChevron />
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <input className={fieldClass} value={u.superBuilt} onChange={(e) => updateUnit(u.id, { superBuilt: e.target.value })} />
                        </td>
                        <td className="px-2 py-2">
                          <input className={fieldClass} value={u.carpet} onChange={(e) => updateUnit(u.id, { carpet: e.target.value })} />
                        </td>
                        <td className="px-2 py-2">
                          <div className="relative">
                            <select
                              className={cn(fieldClass, "appearance-none py-1.5 pr-8 text-[13px]")}
                              value={u.metric}
                              onChange={(e) => updateUnit(u.id, { metric: e.target.value })}
                            >
                              <option>Sq. Ft</option>
                              <option>Sq. M</option>
                            </select>
                            <SelectChevron />
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <input className={fieldClass} placeholder="Rate Per Area" value={u.rate} onChange={(e) => updateUnit(u.id, { rate: e.target.value })} />
                        </td>
                        <td className="px-2 py-2">
                          <input className={fieldClass} value={u.price} onChange={(e) => updateUnit(u.id, { price: e.target.value })} />
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex gap-1">
                            {index === units.length - 1 ? (
                              <button
                                type="button"
                                className={cn("inline-flex h-8 w-8 items-center justify-center rounded text-white", PRIMARY)}
                                aria-label="Add row"
                                onClick={() => addUnitAfter(index)}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded bg-red-600 text-white hover:bg-red-700"
                              aria-label="Remove row"
                              onClick={() => removeUnit(u.id)}
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
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-gray-900">Additional Information</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <TagInput label="Amenities" placeholder="+ Amenities (Press Enter)" tags={amenities} onAdd={addAmenity} onRemove={removeAmenity} />
                <TagInput label="Highlights" placeholder="+ Highlights (Press Enter)" tags={highlights} onAdd={addHighlight} onRemove={removeHighlight} />
              </div>
              <div className="mt-6 grid gap-4 border-t border-gray-100 pt-6 md:grid-cols-3">
                <div>
                  <label className={labelClass}>Total Towers</label>
                  <input className={fieldClass} defaultValue={projectId === "91" ? "1" : ""} />
                </div>
                <div>
                  <label className={labelClass}>Number Of Floors</label>
                  <input className={fieldClass} defaultValue={projectId === "91" ? "37" : ""} />
                </div>
                <div>
                  <label className={labelClass}>Number of Units</label>
                  <input className={fieldClass} defaultValue={projectId === "91" ? "0" : ""} />
                </div>
                <div>
                  <label className={labelClass}>Floor Wise Flat</label>
                  <input className={fieldClass} defaultValue={projectId === "91" ? "0" : ""} />
                </div>
                <div>
                  <label className={labelClass}>Floor Wise Lift</label>
                  <input className={fieldClass} defaultValue={projectId === "91" ? "0" : ""} />
                </div>
                <div>
                  <label className={labelClass}>Types Of Parking</label>
                  <input className={fieldClass} defaultValue={projectId === "91" ? "Stilt Parking" : ""} />
                </div>
                <div>
                  <label className={labelClass}>Starting Amount</label>
                  <input className={fieldClass} defaultValue={projectId === "91" ? "1.12 crore" : ""} />
                </div>
                <div>
                  <label className={labelClass}>Rera Number</label>
                  <input className={fieldClass} defaultValue={projectId === "91" ? "P52000078843" : ""} />
                </div>
                <div>
                  <label className={labelClass}>Gst Number</label>
                  <input className={fieldClass} placeholder="Gst Number" />
                </div>
                <div>
                  <label className={labelClass}>Consultant</label>
                  <input className={fieldClass} placeholder="Consultant -e.g.( John )" />
                </div>
                <div>
                  <label className={labelClass}>Architect</label>
                  <input className={fieldClass} placeholder="Architect -e.g.( John )" />
                </div>
                <div>
                  <label className={labelClass}>Url Title</label>
                  <input className={fieldClass} placeholder="Url Title -e.g.( CCT Tower )" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Url Description</label>
                  <input className={fieldClass} placeholder="Url Description -e.g.( 1BHk,2BHk, Prime Location Mumbai )" />
                </div>
                <div>
                  <label className={labelClass}>Microsite colour</label>
                  <input type="color" defaultValue="#166534" className="h-11 w-full cursor-pointer rounded-md border border-gray-300" />
                </div>
              </div>
              <div className="mt-6 border-t border-gray-100 pt-6">
                <label className="mb-2 block text-sm font-semibold text-gray-900">Description</label>
                <div className="overflow-hidden rounded-md border border-gray-300">
                  <FakeRichToolbar />
                  <textarea placeholder="Description" rows={8} className="w-full resize-y border-0 px-3 py-3 text-sm outline-none placeholder:text-gray-400" />
                </div>
              </div>
              <div className="mt-6 border-t border-gray-100 pt-6">
                <label className="mb-2 block text-sm font-semibold text-gray-900">Terms</label>
                <textarea placeholder="Terms" rows={5} className={cn(fieldClass, "resize-y")} />
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-gray-900">User Details</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className={labelClass}>Contact Person</label>
                  <input className={fieldClass} defaultValue="Aman Dubey" />
                </div>
                <div>
                  <label className={labelClass}>Mobile</label>
                  <div className="flex gap-2">
                    <div className="relative min-w-[130px]">
                      <select className={cn(fieldClass, "appearance-none pr-8")}>
                        <option>91 (🇮🇳)</option>
                      </select>
                      <SelectChevron />
                    </div>
                    <input className={fieldClass} defaultValue={projectId === "91" ? "9152797103" : ""} placeholder="Mobile" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Landline</label>
                  <input className={fieldClass} placeholder="Landline" />
                </div>
                <div className="md:col-span-3 lg:col-span-1">
                  <label className={labelClass}>Email</label>
                  <input className={fieldClass} type="email" placeholder="Email" />
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Virtual Number & Teams</label>
                  <div className="relative">
                    <select className={cn(fieldClass, "appearance-none pr-9")}>
                      <option value="">Select Virtual Number</option>
                    </select>
                    <SelectChevron />
                  </div>
                </div>
                <div className="md:col-span-2 lg:col-span-1">
                  <TagInput label="Sales Agent" placeholder="Add agent (Press Enter)" tags={salesAgents} onAdd={addSales} onRemove={removeSales} />
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className={labelClass}>Launch Date</label>
                  <div className="relative">
                    <input type="date" className={cn(fieldClass, "pr-10")} />
                    <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Completion Date</label>
                  <div className="relative">
                    <input type="date" className={cn(fieldClass, "pr-10")} />
                    <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Possession Date</label>
                  <div className="relative">
                    <input type="date" className={cn(fieldClass, "pr-10")} />
                    <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Construction Status</label>
                  <div className="relative">
                    <select className={cn(fieldClass, "appearance-none pr-9")}>
                      <option value="">Select ConstructionStatus</option>
                    </select>
                    <SelectChevron />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-gray-900">Location Detail</h2>
              <div>
                <label className={labelClass}>Search Location</label>
                <input className={fieldClass} placeholder="Enter your address" />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <label className={labelClass}>Street Address</label>
                  <textarea placeholder="Address" rows={3} className={cn(fieldClass, "resize-y")} />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input className={fieldClass} placeholder="Location" />
                </div>
                <div>
                  <label className={labelClass}>Sub Location</label>
                  <input className={fieldClass} placeholder="Sub Location" />
                </div>
                <div>
                  <label className={labelClass}>Area</label>
                  <input className={fieldClass} placeholder="Area" />
                </div>
                <div>
                  <label className={labelClass}>Landmark</label>
                  <input className={fieldClass} placeholder="Landmark" />
                </div>
                <div>
                  <label className={labelClass}>Pincode</label>
                  <input className={fieldClass} placeholder="Pincode" />
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input className={fieldClass} placeholder="State" />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <input className={fieldClass} placeholder="Country" />
                </div>
                <div>
                  <label className={labelClass}>Latitude</label>
                  <input className={fieldClass} defaultValue="0" />
                </div>
                <div>
                  <label className={labelClass}>Longitude</label>
                  <input className={fieldClass} defaultValue="0" />
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-gray-900">Message Template</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className={labelClass}>Email Template</label>
                  <div className="relative">
                    <select className={cn(fieldClass, "appearance-none pr-9")}>
                      <option value="">Select Email Template</option>
                    </select>
                    <SelectChevron />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>SMS Template</label>
                  <div className="relative">
                    <select className={cn(fieldClass, "appearance-none pr-9")}>
                      <option value="">Select SMS Template</option>
                    </select>
                    <SelectChevron />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>WhatsApp Template</label>
                  <div className="relative">
                    <select className={cn(fieldClass, "appearance-none pr-9")}>
                      <option value="">Select WhatsApp Template</option>
                    </select>
                    <SelectChevron />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-gray-900">Social Description</h2>
                <div className="flex gap-2">
                  <button type="button" className={cn("rounded-md px-3 py-1.5 text-xs font-medium text-white shadow-sm", PRIMARY)}>
                    Auto Fill
                  </button>
                  <button type="button" className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50">
                    Clear
                  </button>
                </div>
              </div>
              <textarea placeholder="Enter Social Description" rows={6} className={cn(fieldClass, "resize-y")} />
            </section>
          </>
        ) : null}

        {tab === "images" ? (
          <div className="space-y-5">
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-gray-900">Upload Images</h2>
              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <tr>
                      <th className="border-b px-3 py-2">#</th>
                      <th className="border-b px-3 py-2">Preview</th>
                      <th className="border-b px-3 py-2">Description</th>
                      <th className="border-b px-3 py-2">Category</th>
                      <th className="border-b px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                        No Documents Founds
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button type="button" className={cn("rounded-md px-4 py-2 text-sm font-medium shadow-sm", PRIMARY)}>
                  Choose
                </button>
                <button type="button" className={cn("rounded-md px-4 py-2 text-sm font-medium shadow-sm", ORANGE)}>
                  Add Link Url
                </button>
              </div>
              <p className="mt-8 text-center text-sm text-gray-500">No Project Images..!</p>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Image links</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-600">
                    <tr>
                      <th className="border-b px-2 py-2">#</th>
                      <th className="border-b px-2 py-2">Url</th>
                      <th className="border-b px-2 py-2">Description</th>
                      <th className="border-b px-2 py-2">Category</th>
                      <th className="border-b px-2 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {imageLinkRows.map((r, i) => (
                      <tr key={r.id} className="border-b border-gray-100">
                        <td className="px-2 py-2">{i + 1}</td>
                        <td className="px-2 py-2">
                          <input
                            className={fieldClass}
                            placeholder="Url eg. https://www.cravingcodetech.com/"
                            value={r.url}
                            onChange={(e) =>
                              setImageLinkRows((rows) => rows.map((x) => (x.id === r.id ? { ...x, url: e.target.value } : x)))
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            className={fieldClass}
                            placeholder="Enter Link description"
                            value={r.description}
                            onChange={(e) =>
                              setImageLinkRows((rows) => rows.map((x) => (x.id === r.id ? { ...x, description: e.target.value } : x)))
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          <div className="relative">
                            <select
                              className={cn(fieldClass, "appearance-none py-1.5 pr-8 text-[13px]")}
                              value={r.category}
                              onChange={(e) =>
                                setImageLinkRows((rows) => rows.map((x) => (x.id === r.id ? { ...x, category: e.target.value } : x)))
                              }
                            >
                              <option value="">Select</option>
                              <option value="exterior">Exterior</option>
                              <option value="amenities">Amenities</option>
                            </select>
                            <SelectChevron />
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                              aria-label="Delete row"
                              onClick={() => setImageLinkRows((rows) => rows.filter((x) => x.id !== r.id))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className={cn("inline-flex h-8 w-8 items-center justify-center rounded text-white", PRIMARY)}
                              aria-label="Add row"
                              onClick={() =>
                                setImageLinkRows((rows) => {
                                  const next = [...rows];
                                  next.splice(i + 1, 0, { id: `img-${Date.now()}`, url: "", description: "", category: "" });
                                  return next;
                                })
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button type="button" className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                  <Save className="h-4 w-4" />
                  Save
                </button>
                <button type="button" className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
              <p className="mt-6 text-center text-sm text-gray-500">No Project Images..!</p>
            </section>
          </div>
        ) : null}

        {tab === "videos" ? (
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-900">Upload Videos</h2>
            <div className="overflow-x-auto rounded border border-gray-200">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  <tr>
                    <th className="border-b px-3 py-2 whitespace-nowrap">SR. NO.</th>
                    <th className="border-b px-3 py-2">URL</th>
                    <th className="border-b px-3 py-2 w-36">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {videoRows.map((row, i) => (
                    <tr key={row.id} className="border-b border-gray-100">
                      <td className="px-3 py-3 align-middle">{i + 1}</td>
                      <td className="px-3 py-2">
                        <input
                          type="url"
                          className={fieldClass}
                          value={row.url}
                          onChange={(e) =>
                            setVideoRows((rows) => rows.map((r) => (r.id === row.id ? { ...r, url: e.target.value } : r)))
                          }
                          placeholder="https://"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className={cn("inline-flex h-8 w-8 items-center justify-center rounded text-white", PRIMARY)}
                            aria-label="Add row"
                            onClick={() =>
                              setVideoRows((rows) => {
                                const next = [...rows];
                                next.splice(i + 1, 0, { id: `v-${Date.now()}`, url: "" });
                                return next;
                              })
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded bg-red-600 text-white hover:bg-red-700"
                            aria-label="Remove row"
                            onClick={() => setVideoRows((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.id !== row.id)))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button type="button" className={cn("inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm", PRIMARY)}>
                <Save className="h-4 w-4" />
                Save
              </button>
              <button type="button" className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                <X className="h-4 w-4" />
                Clear
              </button>
            </div>
          </section>
        ) : null}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur-sm md:px-6">
        <div className="mx-auto flex max-w-6xl justify-end gap-3">
          <button type="button" className={cn("rounded-md px-6 py-2.5 text-sm font-medium shadow-sm", PRIMARY)} onClick={() => router.push("/crm/projects")}>
            Submit
          </button>
          <Link href="/crm/projects" className="rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
