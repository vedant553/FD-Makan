"use client";

import Link from "next/link";
import { ChevronDown, Pencil, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { PageShell, PageTitle, Panel, PanelHeader } from "@/components/crm/page-shell";

type TriggerTab = "LEAD" | "BOOKING" | "OTHERS" | "TRIGGER TEMPLATES";
type TriggerChannel = "Email" | "SMS" | "WhatsApp";

type LeadTriggerRow = {
  id: string;
  name: string;
  createdDate: string;
  enabled: boolean;
  emailTemplate: string;
  smsTemplate: string;
  whatsappTemplate: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  emailPreview: string;
};

const TRIGGER_TABS: TriggerTab[] = ["LEAD", "BOOKING", "OTHERS", "TRIGGER TEMPLATES"];

const INITIAL_LEAD_TRIGGERS: LeadTriggerRow[] = [
  { id: "lt-1", name: "New lead creation to lead (Manual Entry)", createdDate: "29-04-2025", enabled: true, emailTemplate: "New Lead Creation To Lead", smsTemplate: "Lead creation to sales agent", whatsappTemplate: "Lead creation WA", emailEnabled: true, smsEnabled: false, whatsappEnabled: false, emailPreview: "Dear #LeadName,\n\nThank you for contacting #ProjectName project. One of our colleagues will keep in touch with you.\n\nRegards #ProjectName\nSent from Buildesk" },
  { id: "lt-2", name: "Sitevisit reminder to lead", createdDate: "29-04-2025", enabled: true, emailTemplate: "Sitevisit Reminder", smsTemplate: "Sitevisit reminder to lead", whatsappTemplate: "Sitevisit reminder WA", emailEnabled: true, smsEnabled: false, whatsappEnabled: false, emailPreview: "Site visit reminder preview." },
  { id: "lt-3", name: "Completion of site visit to lead", createdDate: "29-04-2025", enabled: true, emailTemplate: "Site Visit Completion", smsTemplate: "Site visit completion to Lead", whatsappTemplate: "Site visit completion WA", emailEnabled: true, smsEnabled: false, whatsappEnabled: false, emailPreview: "Completion preview." },
  { id: "lt-4", name: "Task reminder to sales agent", createdDate: "29-04-2025", enabled: true, emailTemplate: "Task Reminder", smsTemplate: "Followup reminder to executive", whatsappTemplate: "Task reminder WA", emailEnabled: true, smsEnabled: false, whatsappEnabled: false, emailPreview: "Task reminder preview." },
  { id: "lt-5", name: "Site visit scheduled to lead", createdDate: "29-04-2025", enabled: true, emailTemplate: "Site Visit Scheduled", smsTemplate: "Site visit scheduled to lead", whatsappTemplate: "Site visit scheduled WA", emailEnabled: true, smsEnabled: false, whatsappEnabled: false, emailPreview: "Site visit scheduled preview." },
  { id: "lt-6", name: "Lead transfer to Sales Agent", createdDate: "29-04-2025", enabled: true, emailTemplate: "Lead Transfer", smsTemplate: "Lead transfer to sales agent", whatsappTemplate: "Lead transfer WA", emailEnabled: true, smsEnabled: false, whatsappEnabled: false, emailPreview: "Lead transfer preview." },
  { id: "lt-7", name: "Lead creation to Sales Agent", createdDate: "29-04-2025", enabled: true, emailTemplate: "Lead Creation SA", smsTemplate: "Lead creation to sales agent", whatsappTemplate: "Lead creation SA WA", emailEnabled: true, smsEnabled: false, whatsappEnabled: false, emailPreview: "Lead creation sales agent preview." },
  { id: "lt-8", name: "Lead creation to admin", createdDate: "29-04-2025", enabled: true, emailTemplate: "Lead Creation Admin", smsTemplate: "Lead creation to admin", whatsappTemplate: "Lead creation admin WA", emailEnabled: true, smsEnabled: false, whatsappEnabled: false, emailPreview: "Lead creation admin preview." },
  { id: "lt-9", name: "Daily summary report to admin", createdDate: "29-04-2025", enabled: true, emailTemplate: "Daily Summary", smsTemplate: "Daily summary report", whatsappTemplate: "Daily summary WA", emailEnabled: true, smsEnabled: false, whatsappEnabled: false, emailPreview: "Daily summary preview." },
  { id: "lt-10", name: "New lead creation to lead via external sources (Webhook, lvr, campaign etc)", createdDate: "29-04-2025", enabled: true, emailTemplate: "External Source Lead", smsTemplate: "New lead creation to lead", whatsappTemplate: "External source WA", emailEnabled: true, smsEnabled: false, whatsappEnabled: false, emailPreview: "External source preview." },
  { id: "lt-11", name: "Lead returned to sales agent", createdDate: "29-04-2025", enabled: true, emailTemplate: "Lead Returned", smsTemplate: "Lead returned to sales agent", whatsappTemplate: "Lead returned WA", emailEnabled: true, smsEnabled: false, whatsappEnabled: false, emailPreview: "Lead returned preview." },
  { id: "lt-12", name: "Lead creation to Channel Partner", createdDate: "29-04-2025", enabled: true, emailTemplate: "Lead to Channel Partner", smsTemplate: "Lead creation to Channel Partner", whatsappTemplate: "Lead to channel partner WA", emailEnabled: true, smsEnabled: false, whatsappEnabled: false, emailPreview: "Lead to CP preview." },
  { id: "lt-13", name: "CP assigned to sales agent", createdDate: "29-04-2025", enabled: true, emailTemplate: "CP Assigned", smsTemplate: "CP assigned to sales agent", whatsappTemplate: "CP assigned WA", emailEnabled: true, smsEnabled: false, whatsappEnabled: false, emailPreview: "CP assigned preview." },
  { id: "lt-14", name: "CP transfer to sales agent", createdDate: "29-04-2025", enabled: true, emailTemplate: "CP Transfer", smsTemplate: "CP transfer to sales agent", whatsappTemplate: "CP transfer WA", emailEnabled: true, smsEnabled: false, whatsappEnabled: false, emailPreview: "CP transfer preview." },
  { id: "lt-15", name: "Lead Stage Changed To Lead", createdDate: "29-04-2025", enabled: false, emailTemplate: "Lead Stage Change", smsTemplate: "Lead stage changed", whatsappTemplate: "Lead stage changed WA", emailEnabled: false, smsEnabled: false, whatsappEnabled: false, emailPreview: "Lead stage changed preview." },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      suppressHydrationWarning
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-4.5 w-10 items-center rounded-full transition-colors ${checked ? "bg-[#1a56db]" : "bg-gray-300"}`}
      aria-pressed={checked}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

function TriggerEditModal({
  open,
  onClose,
  trigger,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  trigger: LeadTriggerRow | null;
  onSave: (row: LeadTriggerRow) => void;
}) {
  const [local, setLocal] = useState<LeadTriggerRow | null>(null);
  const [channel, setChannel] = useState<TriggerChannel>("Email");

  useEffect(() => {
    if (!open || !trigger) return;
    setLocal(trigger);
    setChannel("Email");
  }, [open, trigger]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !local) return null;

  const channelLabel = channel === "Email" ? "Email" : channel === "SMS" ? "SMS" : "WhatsApp";
  const selectedTemplate = channel === "Email" ? local.emailTemplate : channel === "SMS" ? local.smsTemplate : local.whatsappTemplate;
  const channelEnabled = channel === "Email" ? local.emailEnabled : channel === "SMS" ? local.smsEnabled : local.whatsappEnabled;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[1200] bg-black/50 p-3 md:p-8">
        <div className="mx-auto max-h-[92vh] w-full max-w-5xl overflow-auto rounded-lg border border-border bg-white">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-xl font-semibold text-[#3b4258]">Trigger</h3>
            <button suppressHydrationWarning type="button" onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-6 p-4">
            <input
              suppressHydrationWarning
              value={local.name}
              onChange={(e) => setLocal((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
              className="w-full rounded border border-border px-3 py-2 text-lg leading-tight outline-none"
            />

            <div className="flex gap-2 border-b border-border pb-4">
              {(["Email", "SMS", "WhatsApp"] as TriggerChannel[]).map((item) => (
                <button
                  suppressHydrationWarning
                  key={item}
                  type="button"
                  onClick={() => setChannel(item)}
                  className={`rounded px-5 py-2 text-base font-semibold ${channel === item ? "bg-[#1a56db] text-white" : "text-[#1a56db] hover:bg-muted"}`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="grid gap-5 md:grid-cols-[1fr_320px]">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-[#3b4258]">Choose {channelLabel} Template</p>
                <div className="relative">
                  <select
                    suppressHydrationWarning
                    value={selectedTemplate}
                    onChange={(e) =>
                      setLocal((prev) => {
                        if (!prev) return prev;
                        if (channel === "Email") return { ...prev, emailTemplate: e.target.value };
                        if (channel === "SMS") return { ...prev, smsTemplate: e.target.value };
                        return { ...prev, whatsappTemplate: e.target.value };
                      })
                    }
                    className="w-full appearance-none rounded border border-border px-3 py-2 pr-10 text-base outline-none"
                  >
                    <option value="">Select Template</option>
                    <option value="New Lead Creation To Lead">New Lead Creation To Lead</option>
                    <option value="Lead transfer to sales agent">Lead transfer to sales agent</option>
                    <option value="Sitevisit reminder to lead">Sitevisit reminder to lead</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-lg font-semibold text-[#3b4258]">Status</p>
                <div className="flex items-center gap-4 pt-1">
                  <span className="text-base text-[#3b4258]">Start / Stop</span>
                  <Toggle
                    checked={channelEnabled}
                    onChange={(next) =>
                      setLocal((prev) => {
                        if (!prev) return prev;
                        if (channel === "Email") return { ...prev, emailEnabled: next };
                        if (channel === "SMS") return { ...prev, smsEnabled: next };
                        return { ...prev, whatsappEnabled: next };
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {channel === "Email" ? (
              <pre className="whitespace-pre-wrap rounded text-sm leading-relaxed text-[#3b4258]">{local.emailPreview}</pre>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => {
                  onSave(local);
                  onClose();
                }}
                className="rounded bg-[#1a56db] px-4 py-2 text-base font-semibold text-white hover:bg-[#184dbf]"
              >
                Submit
              </button>
              <button suppressHydrationWarning type="button" onClick={onClose} className="rounded bg-muted px-4 py-2 text-sm font-semibold hover:bg-muted/80">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

export default function CampaignTriggersPage() {
  const [activeTab, setActiveTab] = useState<TriggerTab>("LEAD");
  const [leadRows, setLeadRows] = useState<LeadTriggerRow[]>(INITIAL_LEAD_TRIGGERS);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingTrigger = useMemo(() => (editingId ? leadRows.find((row) => row.id === editingId) ?? null : null), [editingId, leadRows]);

  return (
    <PageShell>
      <Link href="/campaigns" className="mb-2 inline-block text-sm font-medium text-primary hover:underline">
        Back to Campaign
      </Link>
      <PageTitle className="mb-3">Triggers</PageTitle>

      <div className="mb-3 inline-flex rounded-md border border-border bg-white p-1">
        {TRIGGER_TABS.map((tab) => (
          <button
            suppressHydrationWarning
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded px-3 py-1.5 text-xs font-semibold ${activeTab === tab ? "bg-[#1a56db] text-white" : "text-[#3b4258] hover:bg-muted"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "LEAD" ? (
        <Panel>
          <PanelHeader>
            <h2 className="text-sm font-semibold text-foreground">Lead Triggers ({leadRows.length})</h2>
          </PanelHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-semibold">#</th>
                  <th className="px-3 py-2 font-semibold">NAME</th>
                  <th className="px-3 py-2 font-semibold">CREATED DATE</th>
                  <th className="px-3 py-2 font-semibold">STATUS</th>
                  <th className="px-3 py-2 font-semibold">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {leadRows.map((row, idx) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-3 py-2">{idx + 1}</td>
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2">{row.createdDate}</td>
                    <td className="px-3 py-2">
                      <Toggle
                        checked={row.enabled}
                        onChange={(next) => setLeadRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, enabled: next } : item)))}
                      />
                    </td>
                    <td className="relative px-3 py-2">
                      <button
                        suppressHydrationWarning
                        type="button"
                        onClick={() => setOpenActionId((prev) => (prev === row.id ? null : row.id))}
                        className="rounded bg-[#1a56db] px-2 py-1 text-white hover:bg-[#184dbf]"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      {openActionId === row.id ? (
                        <div className="absolute right-3 top-9 z-30 w-32 rounded border border-border bg-white p-1 shadow-lg">
                          <button
                            suppressHydrationWarning
                            type="button"
                            className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-muted"
                            onClick={() => {
                              setOpenActionId(null);
                              setEditingId(row.id);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : (
        <Panel>
          <PanelHeader>
            <h2 className="text-sm font-semibold text-foreground">{activeTab}</h2>
          </PanelHeader>
          <div className="p-4 text-sm text-muted-foreground">{activeTab} tab will be implemented next.</div>
        </Panel>
      )}

      <TriggerEditModal
        open={Boolean(editingTrigger)}
        onClose={() => setEditingId(null)}
        trigger={editingTrigger}
        onSave={(updated) => setLeadRows((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))}
      />
    </PageShell>
  );
}
