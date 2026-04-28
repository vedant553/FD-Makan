"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  Bold,
  Calendar,
  ChevronDown,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Plus,
  Quote,
  Redo2,
  Save,
  Strikethrough,
  Underline,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

const PRIMARY = "bg-[#1a56db] hover:bg-blue-700 text-white";
const ORANGE = "bg-[#f97316] hover:bg-orange-600 text-white";

function Req({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span className="text-red-500">*</span>
      {children}
    </>
  );
}

function SectionCard({ title, subtitle, children }: { title?: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {title ? (
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

function TextField({
  id,
  label,
  placeholder,
  defaultValue,
}: {
  id: string;
  label: React.ReactNode;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type="text"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db]"
      />
    </div>
  );
}

function SelectField({
  id,
  label,
  placeholder,
}: {
  id: string;
  label: React.ReactNode;
  placeholder: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          defaultValue=""
          className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm text-gray-900 outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db]"
        >
          <option value="">{placeholder}</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}

function DateField({ id, label }: { id: string; label: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="date"
          className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm text-gray-900 outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db]"
        />
        <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700" aria-hidden />
      </div>
    </div>
  );
}

function ToggleRow({ label, pressed, onToggle }: { label: string; pressed: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      onClick={onToggle}
      className="flex items-center gap-3 text-left"
    >
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
          <span key={t} className="inline-flex items-center gap-1 rounded-md bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-800">
            {t}
            <button type="button" className="rounded p-0.5 hover:bg-gray-300" aria-label={`Remove ${t}`} onClick={() => onRemove(t)}>
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

export default function CreateDetailedProjectPage() {
  const router = useRouter();
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);
  const [amenities, setAmenities] = useState<string[]>(["Lift"]);
  const [highlights, setHighlights] = useState<string[]>(["Near Railway Station"]);
  const [videoRows, setVideoRows] = useState<{ id: string; url: string }[]>([{ id: "1", url: "" }]);

  const addAmenity = useCallback((t: string) => setAmenities((s) => (s.includes(t) ? s : [...s, t])), []);
  const removeAmenity = useCallback((t: string) => setAmenities((s) => s.filter((x) => x !== t)), []);
  const addHighlight = useCallback((t: string) => setHighlights((s) => (s.includes(t) ? s : [...s, t])), []);
  const removeHighlight = useCallback((t: string) => setHighlights((s) => s.filter((x) => x !== t)), []);

  return (
    <div className="min-h-screen bg-[#f4f7f6] pb-28 font-sans text-gray-900">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-6 md:px-6">
        <div>
          <Link href="/crm/projects" className="text-sm font-medium text-[#1a56db] hover:underline">
            ← Back to Projects
          </Link>
        </div>

        <SectionCard title="Create Project">
          <div className="grid gap-4 md:grid-cols-3">
            <TextField id="project-name" label={<Req>Project Name</Req>} placeholder="Project Name" />
            <TextField id="developer-name" label="Developer Name" placeholder="Developer Name" />
            <SelectField id="project-type" label={<Req>Project Type</Req>} placeholder="Select Project Type" />
          </div>
          <div className="mt-6 flex flex-wrap gap-8 border-t border-gray-100 pt-6">
            <ToggleRow label="Mark As IsFeatured" pressed={featured} onToggle={() => setFeatured((v) => !v)} />
            <ToggleRow label="Mark As IsPublished" pressed={published} onToggle={() => setPublished((v) => !v)} />
          </div>
        </SectionCard>

        <SectionCard>
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField id="virtual-number" label="Virtual Number & Teams" placeholder="Select Virtual Number" />
            <SelectField id="sales-agent" label="Sales Agent" placeholder="Select Sales Agent" />
          </div>
        </SectionCard>

        <SectionCard title="Timeline & Status">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DateField id="launch-date" label="Launch Date" />
            <DateField id="completion-date" label="Completion Date" />
            <DateField id="possession-date" label="Possession Date" />
            <SelectField id="construction-status" label="Construction Status" placeholder="Select Construction Status" />
          </div>
        </SectionCard>

        <SectionCard title="Additional Information">
          <div className="grid gap-6 md:grid-cols-2">
            <TagInput
              label="Amenities"
              placeholder="+ Amenities (Press Enter)"
              tags={amenities}
              onAdd={addAmenity}
              onRemove={removeAmenity}
            />
            <TagInput
              label="Highlights"
              placeholder="+ Highlights (Press Enter)"
              tags={highlights}
              onAdd={addHighlight}
              onRemove={removeHighlight}
            />
          </div>

          <div className="mt-6 grid gap-4 border-t border-gray-100 pt-6 md:grid-cols-3">
            <TextField id="total-towers" label="Total Towers" placeholder="Total Towers" />
            <TextField id="num-floors" label="Number Of Floors" placeholder="Number Of Floors" />
            <TextField id="num-units" label="Number of Units" placeholder="Number of Units" />
            <TextField id="flat-per-floor" label="Flat Per Floor" placeholder="Flat Per Floor" />
            <TextField id="lift-per-floor" label="Lift Per Floor" placeholder="Lift Per Floor" />
            <TextField id="parking-types" label="Types Of Parking" placeholder="Types Of Parking" />
            <TextField
              id="starting-amount"
              label="Starting Amount"
              placeholder="Starting Amount - e.g. (1.5 Cr Or 25Lakhs)"
            />
            <TextField id="rera" label="Rera Number" placeholder="Rera Number" />
            <TextField id="gst" label="GST Number" placeholder="GST Number" />
            <TextField id="consultant" label="Consultant" placeholder="Consultant - e.g.( John )" />
            <TextField id="architect" label="Architect" placeholder="Architect - e.g.( John )" />
            <TextField id="url-title" label="Url Title" defaultValue="FD Makan" />
            <TextField id="url-description" label="Url Description" defaultValue="FD Makan" />
            <div>
              <label htmlFor="microsite-colour" className="mb-1 block text-sm font-medium text-gray-700">
                Microsite colour
              </label>
              <input
                id="microsite-colour"
                type="color"
                defaultValue="#166534"
                className="h-11 w-full cursor-pointer rounded-md border border-gray-300 bg-white"
              />
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <label className="mb-2 block text-sm font-semibold text-gray-900">Description</label>
            <div className="overflow-hidden rounded-md border border-gray-300">
              <FakeRichToolbar />
              <textarea
                placeholder="Description"
                rows={8}
                className="w-full resize-y border-0 px-3 py-3 text-sm outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <label htmlFor="terms" className="mb-2 block text-sm font-semibold text-gray-900">
              Terms
            </label>
            <textarea
              id="terms"
              placeholder="Terms"
              rows={5}
              className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db]"
            />
          </div>
        </SectionCard>

        <SectionCard title="Contact Details">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <TextField id="contact-person" label="Contact Person" placeholder="Contact Person" defaultValue="Aman Dubey" />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Mobile</label>
              <div className="flex gap-2">
                <div className="relative min-w-[140px]">
                  <select className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm outline-none focus:border-[#1a56db]">
                    <option>91 (🇮🇳 IN)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                <input
                  type="tel"
                  placeholder="Please Enter 10 Digit Number"
                  className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db]"
                />
              </div>
            </div>
            <TextField id="landline" label="Landline" placeholder="Landline" />
            <div className="md:col-span-2 lg:col-span-1">
              <TextField id="email" label="Email" placeholder="Email" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Location">
          <TextField id="search-location" label="Search Location" placeholder="Enter your address" />
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <label htmlFor="street-address" className="mb-1 block text-sm font-medium text-gray-700">
                Street Address
              </label>
              <textarea
                id="street-address"
                placeholder="Address"
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db]"
              />
            </div>
            <TextField id="loc" label="Location" placeholder="Location" />
            <TextField id="sub-loc" label="Sub Location" placeholder="Sub Location" />
            <TextField id="area" label="Area" placeholder="Area" />
            <TextField id="landmark" label="Landmark" placeholder="Landmark" />
            <TextField id="pincode" label="Pincode" placeholder="Pincode" />
            <TextField id="state" label="State" placeholder="State" />
            <TextField id="country" label="Country" placeholder="Country" />
            <TextField id="latitude" label="Latitude" placeholder="Latitude" />
            <TextField id="longitude" label="Longitude" placeholder="Longitude" />
          </div>
        </SectionCard>

        <SectionCard title="Upload Images">
          <div className="overflow-x-auto rounded-md border border-gray-200">
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
                  <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
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
        </SectionCard>

        <SectionCard title="Upload Videos">
          <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="border-b px-3 py-2 whitespace-nowrap">SR. NO.</th>
                  <th className="border-b px-3 py-2">URL</th>
                  <th className="border-b px-3 py-2 w-24">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {videoRows.map((row, i) => (
                  <tr key={row.id} className="border-b border-gray-100">
                    <td className="px-3 py-3 align-middle text-gray-700">{i + 1}</td>
                    <td className="px-3 py-2">
                      <input
                        type="url"
                        value={row.url}
                        onChange={(e) =>
                          setVideoRows((rows) => rows.map((r) => (r.id === row.id ? { ...r, url: e.target.value } : r)))
                        }
                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#1a56db]"
                        placeholder="https://"
                      />
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <button
                        type="button"
                        className={cn("inline-flex h-8 w-8 items-center justify-center rounded text-white", PRIMARY)}
                        aria-label="Add row"
                        onClick={() =>
                          setVideoRows((rows) => [...rows, { id: `${Date.now()}`, url: "" }])
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button type="button" className={cn("inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-sm", PRIMARY)}>
              <Save className="h-4 w-4" />
              Save
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Message Template">
          <div className="grid gap-4 md:grid-cols-3">
            <SelectField id="email-template" label="Email Template" placeholder="Select Email Template" />
            <SelectField id="sms-template" label="SMS Template" placeholder="Select SMS Template" />
            <SelectField id="wa-template" label="WhatsApp Template" placeholder="Select WhatsApp Template" />
          </div>
        </SectionCard>

        <SectionCard title="Social Description">
          <div className="mb-3 flex flex-wrap justify-end gap-2">
            <button type="button" className={cn("rounded-md px-3 py-1.5 text-xs font-medium shadow-sm", PRIMARY)}>
              Auto Fill
            </button>
            <button
              type="button"
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
          <textarea
            placeholder="Enter Social Description"
            rows={6}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db]"
          />
        </SectionCard>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur-sm md:px-6">
        <div className="mx-auto flex max-w-6xl justify-end gap-3">
          <button
            type="button"
            className={cn("rounded-md px-6 py-2.5 text-sm font-medium shadow-sm", PRIMARY)}
            onClick={() => router.push("/crm/projects")}
          >
            Submit
          </button>
          <Link
            href="/crm/projects"
            className="rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
