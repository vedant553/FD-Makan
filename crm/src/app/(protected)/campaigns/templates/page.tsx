"use client";

import Link from "next/link";
import { ChevronDown, Eye, Info, Pencil, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { PageShell, PageTitle, Panel, PanelHeader } from "@/components/crm/page-shell";

type Channel = "EMAIL" | "SMS" | "WhatsApp";
type EmailTemplateMode = "design" | "plain";

type EmailTemplateRow = {
  id: string;
  title: string;
  fromName: string;
  type: "Design" | "Plain Text";
  updatedDate: string;
};

type SmsTemplateRow = {
  id: string;
  name: string;
  updatedDate: string;
  sender: string;
  title: string;
  templateId: string;
  smsType: string;
  isDefaultOtp: boolean;
  message: string;
};

type SmsForm = {
  sender: string;
  title: string;
  templateId: string;
  smsType: string;
  isDefaultOtp: boolean;
  message: string;
};

const CHANNELS: Channel[] = ["EMAIL", "SMS", "WhatsApp"];
const SMS_SEGMENT_LIMIT = 160;

const INITIAL_SMS_TEMPLATES: SmsTemplateRow[] = [
  {
    id: "sms-1",
    name: "Lead transfer to sales agent",
    updatedDate: "29-04-2025",
    sender: "BUIDSK",
    title: "Lead transfer to sales agent",
    templateId: "",
    smsType: "",
    isDefaultOtp: true,
    message: "Hi #ExecutiveName, \\r\\n #LeadTransferCount new lead has been assigned to you on #CurrentDate by #AssignedBy. Login to CRM \\r\\n Buildesk",
  },
  { id: "sms-2", name: "Lead creation to sales agent", updatedDate: "29-04-2025", sender: "BUIDSK", title: "Lead creation to sales agent", templateId: "", smsType: "", isDefaultOtp: false, message: "A new lead has been created and assigned to your queue." },
  { id: "sms-3", name: "New Reservation Creation To Reservation Customer", updatedDate: "29-04-2025", sender: "BUIDSK", title: "New Reservation Creation To Reservation Customer", templateId: "", smsType: "", isDefaultOtp: false, message: "Your reservation has been created successfully." },
  { id: "sms-4", name: "New User Creation To User", updatedDate: "29-04-2025", sender: "BUIDSK", title: "New User Creation To User", templateId: "", smsType: "", isDefaultOtp: false, message: "Your account has been created in the CRM." },
  { id: "sms-5", name: "New booking creation", updatedDate: "29-04-2025", sender: "BUIDSK", title: "New booking creation", templateId: "", smsType: "", isDefaultOtp: false, message: "A new booking has been created." },
  { id: "sms-6", name: "Payment creation to customer", updatedDate: "29-04-2025", sender: "BUIDSK", title: "Payment creation to customer", templateId: "", smsType: "", isDefaultOtp: false, message: "Payment recorded successfully." },
  { id: "sms-7", name: "Site visit scheduled to lead", updatedDate: "29-04-2025", sender: "BUIDSK", title: "Site visit scheduled to lead", templateId: "", smsType: "", isDefaultOtp: false, message: "Your site visit has been scheduled." },
  { id: "sms-8", name: "Followup reminder to executive", updatedDate: "29-04-2025", sender: "BUIDSK", title: "Followup reminder to executive", templateId: "", smsType: "", isDefaultOtp: false, message: "Followup reminder for assigned lead." },
  { id: "sms-9", name: "Site visit completion to Lead", updatedDate: "29-04-2025", sender: "BUIDSK", title: "Site visit completion to Lead", templateId: "", smsType: "", isDefaultOtp: false, message: "Thank you for completing your site visit." },
  { id: "sms-10", name: "New lead creation to lead", updatedDate: "29-04-2025", sender: "BUIDSK", title: "New lead creation to lead", templateId: "", smsType: "", isDefaultOtp: false, message: "Your inquiry has been registered." },
  { id: "sms-11", name: "Sitevisit reminder to lead", updatedDate: "29-04-2025", sender: "BUIDSK", title: "Sitevisit reminder to lead", templateId: "", smsType: "", isDefaultOtp: false, message: "Friendly reminder for your upcoming site visit." },
];


function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}

function EmptyStateRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-6 text-center text-xs text-muted-foreground">
        {message}
      </td>
    </tr>
  );
}

function EmailListView({
  onOpenCreate,
  templates,
}: {
  onOpenCreate: (mode: EmailTemplateMode) => void;
  templates: EmailTemplateRow[];
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState("20");

  const filteredTemplates = useMemo(
    () =>
      templates.filter((item) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return [item.title, item.fromName, item.type, item.updatedDate].some((field) => field.toLowerCase().includes(query));
      }),
    [search, templates],
  );

  return (
    <Panel>
      <PanelHeader className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">Email Templates ({filteredTemplates.length})</h2>

        <div className="relative">
          <button suppressHydrationWarning
            type="button"
            onClick={() => setShowMenu((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-md border border-[#1a56db] bg-[#1a56db] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#184dbf]"
          >
            Add Email Template
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {showMenu ? (
            <div className="absolute right-0 z-20 mt-1 w-40 rounded-md border border-border bg-white p-1 text-sm shadow-lg">
              <button suppressHydrationWarning
                type="button"
                className="block w-full rounded px-3 py-2 text-left hover:bg-muted"
                onClick={() => {
                  setShowMenu(false);
                  onOpenCreate("design");
                }}
              >
                Design
              </button>
              <button suppressHydrationWarning
                type="button"
                className="block w-full rounded px-3 py-2 text-left hover:bg-muted"
                onClick={() => {
                  setShowMenu(false);
                  onOpenCreate("plain");
                }}
              >
                Plain Text
              </button>
            </div>
          ) : null}
        </div>
      </PanelHeader>

      <div className="border-b border-border p-3">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex overflow-hidden rounded-md border border-border bg-white">
            <input suppressHydrationWarning
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-48 border-0 px-2 py-1.5 text-xs outline-none"
            />
            <button suppressHydrationWarning type="button" className="border-l border-border px-2 text-[#1a56db]">
              <Search className="h-3.5 w-3.5" />
            </button>
            <button suppressHydrationWarning type="button" onClick={() => setSearch("")} className="border-l border-border px-2 text-muted-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <select suppressHydrationWarning
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
            className="rounded-md border border-border bg-white px-2 py-1.5 text-xs outline-none"
          >
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-semibold">#</th>
              <th className="px-3 py-2 font-semibold">TITLE</th>
              <th className="px-3 py-2 font-semibold">FROM NAME</th>
              <th className="px-3 py-2 font-semibold">TYPE</th>
              <th className="px-3 py-2 font-semibold">UPDATED DATE</th>
              <th className="px-3 py-2 font-semibold">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredTemplates.length === 0 ? (
              <EmptyStateRow colSpan={6} message="No Data Found" />
            ) : (
              filteredTemplates.map((item, index) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="px-3 py-2">{index + 1}</td>
                  <td className="px-3 py-2">{item.title}</td>
                  <td className="px-3 py-2">{item.fromName}</td>
                  <td className="px-3 py-2">{item.type}</td>
                  <td className="px-3 py-2">{item.updatedDate}</td>
                  <td className="px-3 py-2">
                    <button suppressHydrationWarning type="button" className="rounded border border-border p-1 text-muted-foreground hover:bg-muted" aria-label="Preview">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function EmailDesignEditor({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[1200] bg-black/50 p-3 md:p-5">
        <Panel className="mx-auto h-full max-w-[1400px] overflow-hidden">
          <PanelHeader className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Email Information</h3>
            <div className="flex items-center gap-2">
              <button suppressHydrationWarning type="button" className="rounded-md bg-[#1a56db] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#184dbf]">
                Save Design
              </button>
              <button suppressHydrationWarning type="button" onClick={onClose} className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                Go Back
              </button>
            </div>
          </PanelHeader>

          <div className="grid gap-3 border-b border-border p-4 md:grid-cols-3">
        <label className="space-y-1 text-xs">
          <span className="font-semibold">Title <span className="text-rose-500">*</span></span>
          <input suppressHydrationWarning className="w-full rounded border border-border px-2 py-2 outline-none" placeholder="Title" />
        </label>
        <label className="space-y-1 text-xs">
          <span className="font-semibold">From Name</span>
          <input suppressHydrationWarning className="w-full rounded border border-border px-2 py-2 outline-none" placeholder="ex.devant" />
        </label>
        <label className="space-y-1 text-xs">
          <span className="font-semibold">From Email <span className="text-rose-500">*</span></span>
          <input suppressHydrationWarning className="w-full rounded border border-border px-2 py-2 outline-none" placeholder="ex.devant@gmail.com" />
        </label>
        <label className="space-y-1 text-xs">
          <span className="font-semibold">Reply To Email <span className="text-rose-500">*</span></span>
          <input suppressHydrationWarning className="w-full rounded border border-border px-2 py-2 outline-none" placeholder="ex.devant@gmail.com" />
        </label>
        <label className="space-y-1 text-xs md:col-span-1">
          <span className="font-semibold">Subject <span className="text-rose-500">*</span></span>
          <input suppressHydrationWarning className="w-full rounded border border-border px-2 py-2 outline-none" placeholder="Subject" />
        </label>
      </div>

          <div className="p-4">
            <p className="mb-2 text-xs font-semibold">Email Editor</p>
            <div className="grid min-h-[420px] grid-cols-1 overflow-hidden rounded border border-border lg:grid-cols-[1fr_260px]">
              <div className="bg-[#f5f5f5] p-4">
                <div className="mx-auto mt-4 w-full max-w-md rounded border border-[#c2dbe7] bg-[#d8edf7] p-10 text-center text-xs text-slate-600">
                  No content here. Drag content from right.
                </div>
              </div>
              <aside className="border-l border-border bg-white p-3">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {["Columns", "Button", "Divider", "Heading", "Paragraph", "Image", "Social", "Menu", "HTML"].map((item) => (
                    <button suppressHydrationWarning key={item} type="button" className="rounded border border-border px-2 py-4 text-center hover:bg-muted">
                      {item}
                    </button>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </Panel>
      </div>
    </ModalPortal>
  );
}

function PlainTextEmailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [editingLinkRow, setEditingLinkRow] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[1200] bg-black/45 p-3 md:p-8">
      <div className="mx-auto max-h-[92vh] w-full max-w-6xl overflow-auto rounded-lg bg-white">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">Email Template</h3>
          <button suppressHydrationWarning type="button" onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-xs">
              <span className="font-semibold">Title</span>
              <input suppressHydrationWarning className="w-full rounded border border-border px-2 py-2 outline-none" placeholder="Title" />
            </label>
            <label className="space-y-1 text-xs">
              <span className="font-semibold">From Name</span>
              <input suppressHydrationWarning className="w-full rounded border border-border px-2 py-2 outline-none" placeholder="ex.devant" />
            </label>
            <label className="space-y-1 text-xs">
              <span className="font-semibold">Mail To</span>
              <input suppressHydrationWarning className="w-full rounded border border-border px-2 py-2 outline-none" placeholder="ex.devant@gmail.com" />
            </label>
            <label className="space-y-1 text-xs">
              <span className="font-semibold">Reply To</span>
              <input suppressHydrationWarning className="w-full rounded border border-border px-2 py-2 outline-none" placeholder="ex.devant@gmail.com" />
            </label>
          </div>

          <label className="block space-y-1 text-xs">
            <span className="font-semibold">Company Variable</span>
            <select suppressHydrationWarning className="w-full rounded border border-border px-2 py-2 outline-none">
              <option value=""></option>
            </select>
          </label>

          <label className="block space-y-1 text-xs">
            <span className="font-semibold">Subject</span>
            <input suppressHydrationWarning className="w-full rounded border border-border px-2 py-2 outline-none" placeholder="Subject" />
          </label>

          <div>
            <p className="mb-1 text-xs font-semibold">Message</p>
            <div className="rounded border border-border">
              <div className="flex flex-wrap gap-1 border-b border-border p-2 text-xs">
                {["B", "I", "U", "S", "</>", "\"", "Ã???Ã??Ã?Â¢?Ã???Ã??Ã?Â¢", "1.", "Heading", "v", "A", "="].map((item) => (
                  <button suppressHydrationWarning key={item} type="button" className="rounded border border-border px-2 py-0.5 hover:bg-muted">
                    {item}
                  </button>
                ))}
              </div>
              <textarea suppressHydrationWarning className="h-40 w-full resize-none p-3 text-sm outline-none" placeholder="Compose Mail" />
            </div>
          </div>

          <div className="rounded border border-border">
            <div className="border-b border-border px-3 py-2">
              <p className="text-sm font-semibold">Upload Documents</p>
            </div>
            <div className="p-3">
              {editingLinkRow ? (
                <div className="space-y-3">
                  <table className="min-w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-2 py-2 text-left font-semibold">#</th>
                        <th className="px-2 py-2 text-left font-semibold">Url</th>
                        <th className="px-2 py-2 text-left font-semibold">Description</th>
                        <th className="px-2 py-2 text-left font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="px-2 py-2">1</td>
                        <td className="px-2 py-2">
                          <input suppressHydrationWarning className="w-full rounded border border-border px-2 py-1.5" placeholder="Url eg. https://www.example.com/" />
                        </td>
                        <td className="px-2 py-2">
                          <input suppressHydrationWarning className="w-full rounded border border-border px-2 py-1.5" placeholder="Enter Link description" />
                        </td>
                        <td className="px-2 py-2">?? +</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="grid gap-2 md:grid-cols-2">
                    <button suppressHydrationWarning type="button" className="rounded bg-emerald-500 px-3 py-2 text-xs font-semibold text-white">Save</button>
                    <button suppressHydrationWarning type="button" onClick={() => setEditingLinkRow(false)} className="rounded bg-rose-500 px-3 py-2 text-xs font-semibold text-white">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <table className="min-w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-2 py-2 text-left font-semibold">#</th>
                        <th className="px-2 py-2 text-left font-semibold">Preview</th>
                        <th className="px-2 py-2 text-left font-semibold">Description</th>
                        <th className="px-2 py-2 text-left font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <EmptyStateRow colSpan={4} message="No Documents Founds" />
                    </tbody>
                  </table>
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-4 py-2 text-xs font-semibold text-white hover:bg-[#184dbf]">Choose</button>
                    <button suppressHydrationWarning type="button" onClick={() => setEditingLinkRow(true)} className="rounded bg-[#f97316] px-4 py-2 text-xs font-semibold text-white hover:bg-[#ea580c]">Add Link Url</button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-3">
            <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-4 py-2 text-xs font-semibold text-white hover:bg-[#184dbf]">Submit</button>
            <button suppressHydrationWarning type="button" onClick={onClose} className="rounded bg-muted px-4 py-2 text-xs font-semibold hover:bg-muted/80">Cancel</button>
          </div>
        </div>
      </div>
      </div>
    </ModalPortal>
  );
}

function SmsTemplateModal({
  open,
  onClose,
  initialValue,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  initialValue?: SmsTemplateRow | null;
  onSubmit: (form: SmsForm) => void;
}) {
  const [form, setForm] = useState<SmsForm>({
    sender: "",
    title: "",
    templateId: "",
    smsType: "",
    isDefaultOtp: false,
    message: "",
  });

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (initialValue) {
      setForm({
        sender: initialValue.sender,
        title: initialValue.title,
        templateId: initialValue.templateId,
        smsType: initialValue.smsType,
        isDefaultOtp: initialValue.isDefaultOtp,
        message: initialValue.message,
      });
      return;
    }
    setForm({
      sender: "",
      title: "",
      templateId: "",
      smsType: "",
      isDefaultOtp: false,
      message: "",
    });
  }, [open, initialValue]);

  if (!open) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[1200] bg-black/50 p-3 md:p-8">
        <div className="mx-auto max-h-[92vh] w-full max-w-6xl overflow-auto rounded-lg border border-border bg-white">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-[34px] font-semibold leading-none text-[#3b4258] md:text-[36px]">SMS Template</h3>
            <button suppressHydrationWarning type="button" onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-xs">
                <span className="font-semibold">Sender</span>
                <input suppressHydrationWarning value={form.sender} onChange={(e) => setForm((prev) => ({ ...prev, sender: e.target.value }))} className="w-full rounded border border-border px-3 py-2 outline-none" placeholder="Enter Sender Name" />
              </label>
              <label className="space-y-1 text-xs">
                <span className="font-semibold">Title</span>
                <input suppressHydrationWarning value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className="w-full rounded border border-border px-3 py-2 outline-none" placeholder="Please Enter Title" />
              </label>
              <label className="space-y-1 text-xs">
                <span className="font-semibold">Template Id</span>
                <input suppressHydrationWarning value={form.templateId} onChange={(e) => setForm((prev) => ({ ...prev, templateId: e.target.value }))} className="w-full rounded border border-border px-3 py-2 outline-none" placeholder="Please Enter Template Id" />
              </label>
              <label className="space-y-1 text-xs">
                <span className="font-semibold">SMS Type</span>
                <input suppressHydrationWarning value={form.smsType} onChange={(e) => setForm((prev) => ({ ...prev, smsType: e.target.value }))} className="w-full rounded border border-border px-3 py-2 outline-none" placeholder="Please Enter SMS Type" />
              </label>
            </div>

            <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#3b4258]">
              Make this default OTP template
              <input suppressHydrationWarning type="checkbox" checked={form.isDefaultOtp} onChange={(e) => setForm((prev) => ({ ...prev, isDefaultOtp: e.target.checked }))} className="h-3.5 w-3.5" />
            </label>

            <label className="block space-y-1 text-xs">
              <span className="font-semibold">Message</span>
              <textarea suppressHydrationWarning value={form.message} onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))} className="h-80 w-full resize-none rounded border border-border p-3 outline-none" placeholder="Enter Message" />
            </label>

            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p>You have used {form.message.length} characters.</p>
                <p>Messages over {SMS_SEGMENT_LIMIT} characters will be sent as 2 texts.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button suppressHydrationWarning type="button" onClick={() => onSubmit(form)} className="rounded bg-[#1a56db] px-4 py-2 text-xs font-semibold text-white hover:bg-[#184dbf]">
                Submit
              </button>
              <button suppressHydrationWarning type="button" onClick={onClose} className="rounded bg-muted px-4 py-2 text-xs font-semibold hover:bg-muted/80">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function SmsListView({
  templates,
  onOpenAdd,
  onEdit,
  onDelete,
}: {
  templates: SmsTemplateRow[];
  onOpenAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [openActionForId, setOpenActionForId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState("20");

  return (
    <Panel>
      <PanelHeader className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">SMS Templates ({templates.length})</h2>

        <div className="relative">
          <button suppressHydrationWarning type="button" onClick={() => setShowAddMenu((prev) => !prev)} className="inline-flex items-center gap-2 rounded-md border border-[#1a56db] bg-[#1a56db] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#184dbf]">
            Add &amp; Sync Template
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {showAddMenu ? (
            <div className="absolute right-0 z-20 mt-1 w-40 rounded-md border border-border bg-white p-1 text-sm shadow-lg">
              <button suppressHydrationWarning type="button" className="block w-full rounded px-3 py-2 text-left hover:bg-muted" onClick={() => { setShowAddMenu(false); onOpenAdd(); }}>
                Add
              </button>
              <button suppressHydrationWarning type="button" className="block w-full rounded px-3 py-2 text-left hover:bg-muted" onClick={() => setShowAddMenu(false)}>
                Sync Template
              </button>
            </div>
          ) : null}
        </div>
      </PanelHeader>

      <div className="border-b border-border px-3 py-2 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex overflow-hidden rounded border border-border">
            <button suppressHydrationWarning type="button" className="bg-muted px-2 py-1 text-muted-foreground">Previous</button>
            <button suppressHydrationWarning type="button" className="bg-[#1a56db] px-2 py-1 text-white">1</button>
            <button suppressHydrationWarning type="button" className="bg-muted px-2 py-1 text-muted-foreground">Next</button>
          </div>
          <select suppressHydrationWarning value={pageSize} onChange={(e) => setPageSize(e.target.value)} className="rounded border border-border bg-white px-2 py-1.5 text-xs outline-none">
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-semibold">#</th>
              <th className="px-3 py-2 font-semibold">NAME</th>
              <th className="px-3 py-2 font-semibold">UPDATED DATE</th>
              <th className="px-3 py-2 font-semibold">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((item, idx) => (
              <tr key={item.id} className="border-t border-border">
                <td className="px-3 py-2">{idx + 1}</td>
                <td className="px-3 py-2">{item.name}</td>
                <td className="px-3 py-2">{item.updatedDate}</td>
                <td className="relative px-3 py-2">
                  <button suppressHydrationWarning type="button" onClick={() => setOpenActionForId((prev) => (prev === item.id ? null : item.id))} className="rounded bg-[#1a56db] px-2 py-1 text-white hover:bg-[#184dbf]">
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  {openActionForId === item.id ? (
                    <div className="absolute right-3 top-9 z-30 w-32 rounded border border-border bg-white p-1 shadow-lg">
                      <button suppressHydrationWarning type="button" className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-muted" onClick={() => { setOpenActionForId(null); onEdit(item.id); }}>
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button suppressHydrationWarning type="button" className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-muted" onClick={() => { setOpenActionForId(null); onDelete(item.id); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border px-3 py-2 text-xs">
        <div className="inline-flex overflow-hidden rounded border border-border">
          <button suppressHydrationWarning type="button" className="bg-muted px-2 py-1 text-muted-foreground">Previous</button>
          <button suppressHydrationWarning type="button" className="bg-[#1a56db] px-2 py-1 text-white">1</button>
          <button suppressHydrationWarning type="button" className="bg-muted px-2 py-1 text-muted-foreground">Next</button>
        </div>
      </div>
    </Panel>
  );
}

function WhatsAppListView() {
  const [pageSize, setPageSize] = useState("20");

  return (
    <Panel>
      <PanelHeader className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">WhatsApp Templates (0)</h2>
        <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#184dbf]">
          Sync Template
        </button>
      </PanelHeader>

      <div className="border-b border-border px-3 py-2">
        <div className="flex justify-end">
          <select suppressHydrationWarning value={pageSize} onChange={(e) => setPageSize(e.target.value)} className="rounded border border-border bg-white px-2 py-1.5 text-xs outline-none">
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-semibold">#</th>
              <th className="px-3 py-2 font-semibold">NAME</th>
              <th className="px-3 py-2 font-semibold">UPDATED DATE</th>
            </tr>
          </thead>
          <tbody>
            <EmptyStateRow colSpan={3} message="No Data Found" />
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export default function CampaignTemplatesPage() {
  const [activeChannel, setActiveChannel] = useState<Channel>("EMAIL");
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [showPlainModal, setShowPlainModal] = useState(false);
  const [smsTemplates, setSmsTemplates] = useState<SmsTemplateRow[]>(INITIAL_SMS_TEMPLATES);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [editingSmsId, setEditingSmsId] = useState<string | null>(null);

  const emailTemplates: EmailTemplateRow[] = [];

  const handleOpenCreate = (mode: EmailTemplateMode) => {
    if (mode === "design") {
      setShowDesignModal(true);
      return;
    }
    setShowPlainModal(true);
  };

  const editingSmsTemplate = editingSmsId ? smsTemplates.find((item) => item.id === editingSmsId) ?? null : null;

  const handleSaveSms = (form: SmsForm) => {
    if (editingSmsId) {
      setSmsTemplates((prev) =>
        prev.map((item) =>
          item.id === editingSmsId
            ? {
                ...item,
                name: form.title || item.name,
                title: form.title,
                sender: form.sender,
                templateId: form.templateId,
                smsType: form.smsType,
                isDefaultOtp: form.isDefaultOtp,
                message: form.message,
                updatedDate: "29-04-2025",
              }
            : item,
        ),
      );
    } else {
      const id = `sms-${Date.now()}`;
      setSmsTemplates((prev) => [
        ...prev,
        {
          id,
          name: form.title || `New SMS Template ${prev.length + 1}`,
          updatedDate: "29-04-2025",
          sender: form.sender,
          title: form.title,
          templateId: form.templateId,
          smsType: form.smsType,
          isDefaultOtp: form.isDefaultOtp,
          message: form.message,
        },
      ]);
    }
    setShowSmsModal(false);
    setEditingSmsId(null);
  };

  return (
    <PageShell>
      <Link href="/campaigns" className="mb-2 inline-block text-sm font-medium text-primary hover:underline">
        Back to Campaign
      </Link>
      <PageTitle className="mb-3">Templates</PageTitle>

      <div className="mb-3 inline-flex rounded-md border border-border bg-white p-1">
        {CHANNELS.map((channel) => (
          <button suppressHydrationWarning
            key={channel}
            type="button"
            onClick={() => {
              setActiveChannel(channel);
              setShowDesignModal(false);
            }}
            className={`rounded px-3 py-1.5 text-xs font-semibold ${activeChannel === channel ? "bg-[#1a56db] text-white" : "text-[#3b4258] hover:bg-muted"}`}
          >
            {channel}
          </button>
        ))}
      </div>

      {activeChannel === "EMAIL" ? (
        <EmailListView onOpenCreate={handleOpenCreate} templates={emailTemplates} />
      ) : activeChannel === "SMS" ? (
        <SmsListView
          templates={smsTemplates}
          onOpenAdd={() => {
            setEditingSmsId(null);
            setShowSmsModal(true);
          }}
          onEdit={(id) => {
            setEditingSmsId(id);
            setShowSmsModal(true);
          }}
          onDelete={(id) => setSmsTemplates((prev) => prev.filter((item) => item.id !== id))}
        />
      ) : (
        <WhatsAppListView />
      )}

      <PlainTextEmailModal open={showPlainModal} onClose={() => setShowPlainModal(false)} />
      <EmailDesignEditor open={showDesignModal} onClose={() => setShowDesignModal(false)} />
      <SmsTemplateModal open={showSmsModal} onClose={() => { setShowSmsModal(false); setEditingSmsId(null); }} initialValue={editingSmsTemplate} onSubmit={handleSaveSms} />
    </PageShell>
  );
}
