"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Binoculars,
  ChevronDown,
  ClipboardCopy,
  Download,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  Share2,
  SquarePen,
  Table,
  Trash2,
  X,
} from "lucide-react";

import { PageShell, PageTitle } from "@/components/crm/page-shell";
import { cn } from "@/lib/utils";

import { MOCK_PROJECTS as MOCK_PROJECTS_SEED, type ProjectTableRow } from "./project-mocks";
import { ProjectAddBookingModal } from "./project-add-booking-modal";
import { ProjectSuggestedLeadsDrawer } from "./project-suggested-leads-drawer";

export type { ProjectTableRow } from "./project-mocks";

const PRIMARY = "bg-primary text-primary-foreground hover:opacity-90";
const ORANGE = "bg-accent text-accent-foreground hover:opacity-90";

/** Total projects (reference UI). */
const PROJECT_LIST_TOTAL = 128;

function copyText(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    void navigator.clipboard.writeText(text);
  }
}

function ProjectsFilterField({ id, label, placeholder }: { id: string; label: string; placeholder: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[13px] font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          defaultValue=""
          className="w-full appearance-none rounded border border-gray-300 bg-white py-2 pl-3 pr-8 text-[13px] text-gray-700 shadow-sm outline-none focus:border-primary"
        >
          <option value="">{placeholder}</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}

function unitTypeChips(unitTypes: string): string[] {
  const cleaned = unitTypes.replace(/^["']+|["']+$/g, "").trim();
  if (!cleaned || cleaned === "-" || cleaned === '""') return [];
  return cleaned.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 6);
}

function PaginationPages() {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <button suppressHydrationWarning type="button" className="text-sm font-medium text-gray-500 hover:text-gray-800 disabled:opacity-40" disabled>
        Previous
      </button>
      {[1, 2, 3, 4].map((p) => (
        <button
          key={p}
          suppressHydrationWarning
          type="button"
          className={cn(
            "min-w-[2rem] rounded px-2 py-1 text-sm font-medium",
            p === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
          )}
        >
          {p}
        </button>
      ))}
      <button suppressHydrationWarning type="button" className="text-sm font-medium text-gray-500 hover:text-gray-800">
        Next
      </button>
    </div>
  );
}

export default function CrmProjectsPage() {
  const router = useRouter();
  const [mainEl, setMainEl] = useState<HTMLElement | null>(null);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState("20");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [quickProjectOpen, setQuickProjectOpen] = useState(false);
  const [quickProjectName, setQuickProjectName] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [suggestedLeadsOpen, setSuggestedLeadsOpen] = useState(false);
  const [addBookingOpen, setAddBookingOpen] = useState(false);
  const [bookingProjectRow, setBookingProjectRow] = useState<ProjectTableRow | null>(null);
  const [projects, setProjects] = useState<ProjectTableRow[]>(() => MOCK_PROJECTS_SEED.map((p) => ({ ...p })));
  const [projectListTotal, setProjectListTotal] = useState(PROJECT_LIST_TOTAL);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedMapProjectId, setSelectedMapProjectId] = useState<string>("116");
  const [rowMenu, setRowMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const addProjectRef = useRef<HTMLDivElement>(null);
  const overflowMenuRef = useRef<HTMLDivElement>(null);
  const rowMenuRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useLayoutEffect(() => {
    setMainEl(document.getElementById("app-main"));
  }, []);

  useEffect(() => {
    if (!addProjectOpen) return;
    const onDown = (e: MouseEvent) => {
      if (addProjectRef.current && !addProjectRef.current.contains(e.target as Node)) setAddProjectOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [addProjectOpen]);

  useEffect(() => {
    if (!overflowMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (overflowMenuRef.current && !overflowMenuRef.current.contains(e.target as Node)) setOverflowMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [overflowMenuOpen]);

  useEffect(() => {
    if (!rowMenu) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rowMenuRef.current?.contains(t)) return;
      const trig = triggerRefs.current.get(rowMenu.id);
      if (trig?.contains(t)) return;
      setRowMenu(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [rowMenu]);

  useEffect(() => {
    if (!quickProjectOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setQuickProjectOpen(false);
        setQuickProjectName("");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [quickProjectOpen]);

  useEffect(() => {
    if (!shareModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShareModalOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shareModalOpen]);

  useEffect(() => {
    if (!deleteConfirmId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDeleteConfirmId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [deleteConfirmId]);

  const filtered = projects.filter(
    (p) =>
      search.trim() === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.projectId.includes(search) ||
      p.uuid.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <PageShell>
      <PageTitle>Projects</PageTitle>

      <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-gray-800">
            Projects ( {projectListTotal} )
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative" ref={addProjectRef}>
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setAddProjectOpen((o) => !o)}
                className={cn(
                  "inline-flex items-center gap-1 rounded px-4 py-2 text-sm font-medium text-white shadow-sm",
                  PRIMARY,
                )}
                aria-expanded={addProjectOpen}
                aria-haspopup="menu"
              >
                Add Project
                <ChevronDown className="h-4 w-4 shrink-0 text-white" />
              </button>
              {addProjectOpen ? (
                <div
                  role="menu"
                  className="absolute left-0 top-full z-40 mt-1 min-w-[200px] rounded-md border border-gray-200 bg-white py-1 shadow-md"
                >
                  <button
                    suppressHydrationWarning
                    type="button"
                    role="menuitem"
                    className="block w-full px-3 py-2.5 text-left text-[13px] text-gray-800 hover:bg-sky-50"
                    onClick={() => {
                      setAddProjectOpen(false);
                      setQuickProjectName("");
                      setQuickProjectOpen(true);
                    }}
                  >
                    Quick Project
                  </button>
                  <Link
                    href="/crm/projects/create-detailed"
                    role="menuitem"
                    className="block w-full px-3 py-2.5 text-left text-[13px] text-gray-800 hover:bg-sky-50"
                    onClick={() => setAddProjectOpen(false)}
                  >
                    Detailed Project
                  </Link>
                </div>
              ) : null}
            </div>
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setMapOpen(true)}
              className="shrink-0 rounded border border-border bg-card px-4 py-2 text-sm font-medium text-primary shadow-sm hover:bg-muted"
            >
              Show On Map
            </button>
            <div className="relative" ref={overflowMenuRef}>
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setOverflowMenuOpen((o) => !o)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 shadow-sm hover:bg-gray-50"
                aria-label="More actions"
                aria-expanded={overflowMenuOpen}
                aria-haspopup="menu"
              >
                <MoreVertical className="h-5 w-5 text-gray-700" />
              </button>
              {overflowMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-40 mt-1 min-w-[200px] rounded-md border border-gray-200 bg-white py-1 shadow-md"
                >
                  <button
                    suppressHydrationWarning
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-gray-800 hover:bg-sky-50"
                    onClick={() => setOverflowMenuOpen(false)}
                  >
                    <Download className="h-4 w-4 shrink-0 text-gray-600" />
                    Bulk Download
                  </button>
                  <button
                    suppressHydrationWarning
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-gray-800 hover:bg-sky-50"
                    onClick={() => setOverflowMenuOpen(false)}
                  >
                    <Download className="h-4 w-4 shrink-0 text-gray-600" />
                    Table Download
                  </button>
                </div>
              ) : null}
            </div>
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setFiltersExpanded((v) => !v)}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white transition-shadow",
                ORANGE,
                filtersExpanded && "ring-2 ring-accent/40 ring-offset-2",
              )}
              aria-label={filtersExpanded ? "Hide filters" : "Show filters"}
              aria-expanded={filtersExpanded}
            >
              <Filter className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {filtersExpanded ? (
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ProjectsFilterField id="pf-location" label="Location" placeholder="Select Location" />
              <ProjectsFilterField id="pf-sub-location" label="Sub Location" placeholder="Select Sub Location" />
              <ProjectsFilterField id="pf-property-type" label="Type of Property" placeholder="Select PropertyType" />
              <ProjectsFilterField id="pf-min-budget" label="Min Budget" placeholder="Select Min Budget" />
              <ProjectsFilterField id="pf-max-budget" label="Max Budget" placeholder="Select Max Budget" />
              <ProjectsFilterField id="pf-min-area" label="Min Area" placeholder="Select Minimum Area" />
              <ProjectsFilterField id="pf-max-area" label="Max Area" placeholder="Select Maximum Area" />
              <ProjectsFilterField id="pf-area-metric" label="Area Metric" placeholder="Select Area Metric" />
              <ProjectsFilterField id="pf-featured" label="Is Featured" placeholder="Select Status" />
              <ProjectsFilterField id="pf-publish" label="Is Publish" placeholder="Select Status" />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button suppressHydrationWarning type="button" className={cn("rounded px-5 py-2 text-sm font-medium text-white shadow-sm", PRIMARY)}>
                Apply
              </button>
              <button
                suppressHydrationWarning
                type="button"
                className="rounded border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <PaginationPages />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex min-w-0 max-w-full items-stretch rounded border border-gray-300 bg-white shadow-sm">
              <input
                suppressHydrationWarning
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Projects"
                className="min-w-[120px] max-w-[220px] flex-1 border-0 bg-transparent px-3 py-2 text-[13px] text-gray-800 outline-none sm:max-w-[280px]"
              />
              <button suppressHydrationWarning type="button" className={cn("flex shrink-0 items-center justify-center px-3 py-2 text-white", PRIMARY)} aria-label="Search">
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
                className="w-full appearance-none rounded border border-gray-300 bg-white py-2 pl-2 pr-8 text-[13px] text-gray-700 shadow-sm outline-none focus:border-primary"
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
                  viewMode === "grid" ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-muted-foreground hover:bg-muted",
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
                  viewMode === "list" ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-muted-foreground hover:bg-muted",
                )}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {viewMode === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-sm">
              <thead className="bg-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                <tr>
                  <th className="border-b border-gray-200 px-3 py-3">#</th>
                  <th className="border-b border-gray-200 px-3 py-3 whitespace-nowrap">PROJECT ID</th>
                  <th className="border-b border-gray-200 px-3 py-3">PROJECT NAME</th>
                  <th className="min-w-[220px] border-b border-gray-200 px-3 py-3">ADDRESS</th>
                  <th className="border-b border-gray-200 px-3 py-3">TYPE</th>
                  <th className="border-b border-gray-200 px-3 py-3">UNIT TYPE</th>
                  <th className="border-b border-gray-200 px-3 py-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.projectId} className="border-b border-gray-100 hover:bg-gray-50/80">
                    <td className="whitespace-nowrap px-3 py-3 text-gray-700">{i + 1}</td>
                    <td className="whitespace-nowrap px-3 py-3 font-medium text-gray-800">{row.projectId}</td>
                    <td className="max-w-[320px] px-3 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[15px] font-bold uppercase tracking-tight text-primary">{row.name}</span>
                        {row.featured ? (
                          <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">Featured</span>
                        ) : null}
                        {row.published ? (
                          <span className="rounded bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">Published</span>
                        ) : null}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="break-all font-mono text-[11px] leading-snug text-gray-500">{row.uuid}</span>
                        <button
                          suppressHydrationWarning
                          type="button"
                          className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-primary"
                          aria-label="Copy UUID"
                          onClick={() => copyText(row.uuid)}
                        >
                          <ClipboardCopy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          suppressHydrationWarning
                          type="button"
                          className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-primary"
                          aria-label="Copy project name"
                          onClick={() => copyText(row.name)}
                        >
                          <ClipboardCopy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="max-w-[280px] px-3 py-3 text-[13px] text-gray-700">{row.address.trim() ? row.address : "\u2014"}</td>
                    <td className="px-3 py-3">
                      <p className="text-[13px] font-medium text-gray-800">{row.category}</p>
                      <span className="mt-1 inline-block rounded border border-orange-400 px-2 py-0.5 text-[11px] font-semibold uppercase text-orange-600">{row.subType}</span>
                    </td>
                    <td className="max-w-[200px] px-3 py-3 font-mono text-[12px] text-gray-700">{row.unitTypes}</td>
                    <td className="px-3 py-3 text-right">
                      <button
                        suppressHydrationWarning
                        type="button"
                        ref={(el) => {
                          if (el) triggerRefs.current.set(row.projectId, el);
                          else triggerRefs.current.delete(row.projectId);
                        }}
                        onClick={(e) => {
                          const btn = e.currentTarget;
                          const r = btn.getBoundingClientRect();
                          setRowMenu((prev) =>
                            prev?.id === row.projectId ? null : { id: row.projectId, top: r.bottom + 4, left: Math.max(8, r.right - 232) },
                          );
                        }}
                        className={cn("inline-flex h-8 w-8 items-center justify-center rounded text-white", PRIMARY)}
                        aria-label="Row actions"
                        aria-expanded={rowMenu?.id === row.projectId}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((row) => (
              <div key={row.projectId} className="flex flex-col rounded-md border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start gap-2">
                  <h3 className="text-base font-bold uppercase tracking-tight text-primary">{row.name}</h3>
                  {row.featured ? <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">Featured</span> : null}
                  {row.published ? <span className="rounded bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">Published</span> : null}
                </div>
                <p className="mt-1 font-mono text-[11px] text-gray-500">{row.uuid}</p>
                <p className="mt-2 text-xs text-gray-500">ID {row.projectId}</p>
                <p className="mt-2 flex items-start gap-1 text-[13px] text-gray-700">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                  {row.address.trim() ? row.address : "\u2014"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-[13px] font-medium text-gray-800">{row.category}</span>
                  <span className="rounded border border-orange-400 px-2 py-0.5 text-[11px] font-semibold text-orange-600">{row.subType}</span>
                </div>
                <p className="mt-2 font-mono text-xs text-gray-600">{row.unitTypes}</p>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-gray-200 px-4 py-3">
          <PaginationPages />
        </div>
      </div>

      {shareModalOpen && mainEl
        ? createPortal(
            <div
              className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
              role="presentation"
              onClick={() => setShareModalOpen(false)}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="share-project-link-title"
                className="w-full max-w-lg overflow-hidden border border-gray-200 bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5">
                  <h2 id="share-project-link-title" className="text-base font-semibold text-slate-700">
                    Share Project Link
                  </h2>
                  <button
                    suppressHydrationWarning
                    type="button"
                    className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Close"
                    onClick={() => setShareModalOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="px-6 py-14">
                  <p className="text-center text-base font-semibold text-slate-700">No Social Description Found For This Project</p>
                </div>
              </div>
            </div>,
            mainEl,
          )
        : null}

      {quickProjectOpen && mainEl
        ? createPortal(
            <div
              className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
              role="presentation"
              onClick={() => {
                setQuickProjectOpen(false);
                setQuickProjectName("");
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="quick-project-title"
                className="w-full max-w-md overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                  <h2 id="quick-project-title" className="text-lg font-semibold text-slate-800">
                    Add New Project
                  </h2>
                  <button
                    suppressHydrationWarning
                    type="button"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 shadow-sm hover:bg-gray-50"
                    aria-label="Close"
                    onClick={() => {
                      setQuickProjectOpen(false);
                      setQuickProjectName("");
                    }}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="px-6 py-6">
                  <label htmlFor="quick-project-name" className="mb-2 block text-sm font-semibold text-slate-800">
                    Project Name
                  </label>
                  <input
                    suppressHydrationWarning
                    id="quick-project-name"
                    type="text"
                    autoFocus
                    value={quickProjectName}
                    onChange={(e) => setQuickProjectName(e.target.value)}
                    placeholder="Project Name"
                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-slate-800 placeholder:text-gray-400 placeholder:italic outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
                  <button
                    suppressHydrationWarning
                    type="button"
                    className={cn("rounded-md px-5 py-2 text-sm font-medium text-white shadow-sm", PRIMARY)}
                    onClick={() => {
                      setQuickProjectOpen(false);
                      setQuickProjectName("");
                    }}
                  >
                    Submit
                  </button>
                  <button
                    suppressHydrationWarning
                    type="button"
                    className="rounded-md bg-gray-200 px-5 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-gray-300"
                    onClick={() => {
                      setQuickProjectOpen(false);
                      setQuickProjectName("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>,
            mainEl,
          )
        : null}

      {deleteConfirmId && mainEl
        ? createPortal(
            <div
              className="absolute inset-0 z-[105] flex items-center justify-center bg-black/40 p-4"
              role="presentation"
              onClick={() => setDeleteConfirmId(null)}
            >
              <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="delete-project-title"
                aria-describedby="delete-project-desc"
                className="w-full max-w-md overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b border-gray-200 px-5 py-4">
                  <h2 id="delete-project-title" className="text-lg font-semibold text-gray-900">
                    Delete project
                  </h2>
                </div>
                <div className="px-5 py-4">
                  <p id="delete-project-desc" className="text-sm text-gray-700">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-gray-900">
                      {projects.find((p) => p.projectId === deleteConfirmId)?.name ?? "this project"}
                    </span>
                    {deleteConfirmId ? (
                      <>
                        {" "}
                        <span className="text-gray-600">(Project ID: {deleteConfirmId})</span>
                      </>
                    ) : null}
                    ? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
                  <button
                    suppressHydrationWarning
                    type="button"
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
                    onClick={() => setDeleteConfirmId(null)}
                  >
                    Cancel
                  </button>
                  <button
                    suppressHydrationWarning
                    type="button"
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
                    onClick={() => {
                      const id = deleteConfirmId;
                      if (!id) return;
                      setProjects((prev) => {
                        const next = prev.filter((p) => p.projectId !== id);
                        setSelectedMapProjectId((cur) => {
                          if (cur !== id) return cur;
                          return next[0]?.projectId ?? "";
                        });
                        return next;
                      });
                      setProjectListTotal((t) => Math.max(0, t - 1));
                      setDeleteConfirmId(null);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>,
            mainEl,
          )
        : null}

      {mapOpen && mainEl
        ? createPortal(
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 sm:p-4" role="presentation" onClick={() => setMapOpen(false)}>
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="projects-map-title"
                className="flex max-h-[min(92vh,900px)] w-full max-w-[1400px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3">
                  <h2 id="projects-map-title" className="text-base font-semibold text-gray-900">
                    View Projects in Map
                  </h2>
                  <button
                    suppressHydrationWarning
                    type="button"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 shadow-sm hover:bg-gray-50"
                    onClick={() => setMapOpen(false)}
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:divide-x lg:divide-gray-200">
                  {/* Map — ~50% */}
                  <div className="relative min-h-[min(42vh,360px)] flex-[1.15] bg-gray-100 lg:min-h-[min(78vh,640px)]">
                    <iframe
                      title="Map"
                      className="absolute inset-0 h-full w-full border-0"
                      loading="lazy"
                      src="https://www.openstreetmap.org/export/embed.html?bbox=72.96%2C19.05%2C73.25%2C19.28&layer=mapnik"
                    />
                    <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex justify-center sm:left-8 sm:right-auto">
                      <div className="rounded border border-gray-200 bg-white/95 px-3 py-1.5 text-center text-[11px] font-bold uppercase tracking-wide text-gray-900 shadow-sm">
                        {projects.find((p) => p.projectId === selectedMapProjectId)?.name ?? "—"}
                      </div>
                    </div>
                  </div>

                  {/* Project list — ~25% */}
                  <div className="flex min-h-[200px] w-full min-w-0 flex-col border-t border-gray-200 lg:w-[28%] lg:max-w-[320px] lg:border-t-0">
                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
                      {projects.map((row) => {
                        const selected = row.projectId === selectedMapProjectId;
                        const chips = unitTypeChips(row.unitTypes);
                        const addr = row.address.trim();
                        const showAddr = addr.length > 0 && addr !== "\u2014";
                        return (
                          <div
                            key={row.projectId}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedMapProjectId(row.projectId)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedMapProjectId(row.projectId);
                              }
                            }}
                            className={cn(
                              "w-full cursor-pointer rounded border bg-white p-3 text-left shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                              selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-muted-foreground/30",
                            )}
                          >
                            <div className="flex gap-3">
                              <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 px-1 text-center text-[9px] leading-tight text-gray-400">
                                example-image
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-[13px] font-bold uppercase leading-snug text-gray-900">{row.name}</span>
                                  <button
                                    suppressHydrationWarning
                                    type="button"
                                    className="shrink-0 rounded p-0.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    aria-label={`Share ${row.name}`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Share2 className="h-4 w-4" />
                                  </button>
                                </div>
                                {showAddr ? (
                                  <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-600">
                                    <MapPin className="h-3 w-3 shrink-0 text-gray-500" />
                                    <span className="line-clamp-2">{row.address}</span>
                                  </p>
                                ) : null}
                                {chips.length > 0 ? (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {chips.map((chip) => (
                                      <span
                                        key={`${row.projectId}-${chip}`}
                                        className="rounded bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground"
                                      >
                                        {chip}
                                      </span>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Filters — ~25% */}
                  <div className="flex w-full min-w-0 flex-col border-t border-gray-200 lg:w-[28%] lg:max-w-[300px] lg:border-t-0">
                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                      <ProjectsFilterField id="mf-min-budget" label="Min Budget" placeholder="Select Min Budget" />
                      <ProjectsFilterField id="mf-max-budget" label="Max Budget" placeholder="Select Max Budget" />
                      <ProjectsFilterField id="mf-min-area" label="Min Area" placeholder="Select Minimum Area" />
                      <ProjectsFilterField id="mf-max-area" label="Max Area" placeholder="Select Maximum Area" />
                      <ProjectsFilterField id="mf-area-metric" label="Area Metric" placeholder="Select Area Metric" />
                      <ProjectsFilterField id="mf-featured" label="Is Featured" placeholder="Select Status" />
                      <ProjectsFilterField id="mf-publish" label="Is Publish" placeholder="Select Status" />
                    </div>
                    <div className="flex shrink-0 gap-2 border-t border-gray-200 p-4">
                      <button suppressHydrationWarning type="button" className={cn("flex-1 rounded px-4 py-2 text-sm font-medium text-white shadow-sm", PRIMARY)}>
                        Apply
                      </button>
                      <button
                        suppressHydrationWarning
                        type="button"
                        className="flex-1 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            mainEl,
          )
        : null}

      {rowMenu && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={rowMenuRef}
              role="menu"
              className="fixed z-[100] min-w-[220px] rounded-md border border-gray-200 bg-white py-1 shadow-lg"
              style={{ top: rowMenu.top, left: rowMenu.left }}
            >
              <button
                suppressHydrationWarning
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-gray-800 hover:bg-sky-50"
                onClick={() => {
                  setRowMenu(null);
                  setShareModalOpen(true);
                }}
              >
                <Share2 className="h-4 w-4 shrink-0 text-gray-700" />
                Share
              </button>
              <button
                suppressHydrationWarning
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-gray-800 hover:bg-sky-50"
                onClick={() => {
                  const id = rowMenu.id;
                  setRowMenu(null);
                  window.open(`/crm/projects/${encodeURIComponent(id)}/view`, "_blank", "noopener,noreferrer");
                }}
              >
                <Binoculars className="h-4 w-4 shrink-0 text-gray-700" />
                View
              </button>
              <button
                suppressHydrationWarning
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-gray-800 hover:bg-sky-50"
                onClick={() => {
                  setRowMenu(null);
                  setSuggestedLeadsOpen(true);
                }}
              >
                <Table className="h-4 w-4 shrink-0 text-gray-700" />
                Suggested Leads
              </button>
              <button
                suppressHydrationWarning
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-gray-800 hover:bg-sky-50"
                onClick={() => {
                  const p = projects.find((r) => r.projectId === rowMenu.id);
                  setRowMenu(null);
                  if (p) {
                    setBookingProjectRow(p);
                    setAddBookingOpen(true);
                  }
                }}
              >
                <Plus className="h-4 w-4 shrink-0 text-gray-700" />
                Add Booking
              </button>
              <button
                suppressHydrationWarning
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-gray-800 hover:bg-sky-50"
                onClick={() => {
                  const id = rowMenu.id;
                  setRowMenu(null);
                  router.push(`/crm/projects/${encodeURIComponent(id)}/edit`);
                }}
              >
                <SquarePen className="h-4 w-4 shrink-0 text-gray-700" />
                Edit
              </button>
              <button
                suppressHydrationWarning
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-rose-700 hover:bg-rose-50"
                onClick={() => {
                  const id = rowMenu.id;
                  setRowMenu(null);
                  setDeleteConfirmId(id);
                }}
              >
                <Trash2 className="h-4 w-4 shrink-0 text-rose-700" />
                Delete
              </button>
            </div>,
            document.body,
          )
        : null}

      <ProjectSuggestedLeadsDrawer open={suggestedLeadsOpen} onClose={() => setSuggestedLeadsOpen(false)} />
      <ProjectAddBookingModal
        open={addBookingOpen}
        onClose={() => {
          setAddBookingOpen(false);
          setBookingProjectRow(null);
        }}
        projectRow={bookingProjectRow}
      />
    </PageShell>
  );
}
