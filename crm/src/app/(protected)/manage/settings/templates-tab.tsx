"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Plus, Search, Trash2, X } from "lucide-react";

const templateCategories = ["Property Template", "Project Template", "Offline WhatsApp Template"] as const;
type TemplateCategory = (typeof templateCategories)[number];

const PROPERTY_WA_DEFAULT =
  "*@Url_Title*  @Url_Description  👉 *Super Buildup Area :* @Total_Area 👉 *Buildup Area :* @Buildup_Area 👉 *Carpet Area :* @Carpet_Area 👉 *Furnished :* @Furnish_Status 👉 *Address :* @Property_Address For more details contact *@Company_Name* 👨‍💼 @Executive_Name 📱 @Executive_Mobile";

const PROJECT_WA_DEFAULT =
  "💐 Greetings from @Company_Name 🙏 *@Project_Name* ✅ RERA Registered @Rera_Number ✅ @Project_Type @Project_SubType ***** @Units ***** Amenities @Amenities ***** Highlights @Highlight Project Location @Project_Address @Map_Link @Video_Urls Thanks and Regards 🤝 *@Contact_Person* 📲 @Mobile*";

const OFFLINE_TEMPLATE_NAMES = [
  "Converted To Follow Up",
  "Follow Up - Haware Dombivali",
  "Follow Up Hindi - Haware Dombivali",
  "Lead Stage - Call Back",
  "Lead Stage - Ringing - Magicbricks",
  "Lead Stage - Ringing - Meta Leads",
  "No Call - First Whatsapps - Meta Ads",
  "No Call - Whatsapp First - Magicbricks",
  "Ringing - Haware Launch",
  "Ringing - Haware Launch Hindi Message",
  "Site Visit Follow Up",
  "Tomorrow Visit Reminder",
] as const;

const UPDATE_SAMPLE_MESSAGE = `Hello @CustomerName,

@SalesAgentName here, we just had a conversation on call regarding your requirements for the property.

I will be sharing the details with you right away of the projects we discussed.

Let me know if you have any query.

Thanks & Regards`;

function SimpleModal({
  title,
  children,
  onClose,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[190] bg-black/55 p-3 sm:p-4">
      <div className="mx-auto mt-6 w-full max-w-[520px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-xl font-semibold text-[#3f4658]">{title}</h3>
          <button suppressHydrationWarning type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 py-4">{children}</div>
        <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-3">{footer}</div>
      </div>
    </div>
  );
}

function AccordionRow({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded border border-gray-200 bg-white">
      <button suppressHydrationWarning type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-2 bg-gray-50 px-3 py-2.5 text-left text-xs font-semibold text-[#1a56db] hover:bg-gray-100">
        <span>{title}</span>
        {open ? <ChevronDown className="h-4 w-4 shrink-0 text-gray-600" /> : <ChevronRight className="h-4 w-4 shrink-0 text-gray-600" />}
      </button>
      {open && children ? <div className="border-t border-gray-200 p-3">{children}</div> : null}
    </div>
  );
}

export function SettingsTemplatesTab() {
  const [category, setCategory] = useState<TemplateCategory>("Property Template");

  const [propOpenWa, setPropOpenWa] = useState(true);
  const [propOpenBus, setPropOpenBus] = useState(false);
  const [propWaBody, setPropWaBody] = useState(PROPERTY_WA_DEFAULT);
  const [propBusinessChoice, setPropBusinessChoice] = useState("");

  const [projOpenWa, setProjOpenWa] = useState(true);
  const [projOpenBus, setProjOpenBus] = useState(false);
  const [projWaBody, setProjWaBody] = useState(PROJECT_WA_DEFAULT);
  const [projBusinessChoice, setProjBusinessChoice] = useState("");

  const [offlineRows, setOfflineRows] = useState<{ name: string; message: string }[]>(() =>
    OFFLINE_TEMPLATE_NAMES.map((name) => ({
      name,
      message: name === "Converted To Follow Up" ? UPDATE_SAMPLE_MESSAGE : "",
    })),
  );
  const [offlineSearch, setOfflineSearch] = useState("");
  const [offlineModal, setOfflineModal] = useState<null | { mode: "add" } | { mode: "edit"; index: number }>(null);
  const [offlineForm, setOfflineForm] = useState({ name: "", message: "" });

  const filteredOffline = useMemo(() => {
    const q = offlineSearch.trim().toLowerCase();
    const withIndex = offlineRows.map((r, originalIndex) => ({ ...r, originalIndex }));
    if (!q) return withIndex;
    return withIndex.filter((r) => r.name.toLowerCase().includes(q));
  }, [offlineRows, offlineSearch]);

  const openAdd = () => {
    setOfflineForm({ name: "", message: "" });
    setOfflineModal({ mode: "add" });
  };

  const openEdit = (index: number) => {
    const row = offlineRows[index];
    if (!row) return;
    setOfflineForm({ name: row.name, message: row.message || UPDATE_SAMPLE_MESSAGE });
    setOfflineModal({ mode: "edit", index });
  };

  const saveOfflineModal = () => {
    const name = offlineForm.name.trim();
    if (!name) return;
    if (offlineModal?.mode === "add") {
      setOfflineRows((p) => [...p, { name, message: offlineForm.message }]);
    } else if (offlineModal?.mode === "edit") {
      const idx = offlineModal.index;
      setOfflineRows((p) => p.map((r, i) => (i === idx ? { name, message: offlineForm.message } : r)));
    }
    setOfflineModal(null);
  };

  const deleteOffline = (index: number) => {
    if (!confirm("Delete this template?")) return;
    setOfflineRows((p) => p.filter((_, i) => i !== index));
  };

  const Pagination = ({ className = "" }: { className?: string }) => (
    <div className={`flex rounded border border-gray-300 text-xs w-fit ${className}`}>
      <button suppressHydrationWarning type="button" className="border-r border-gray-300 px-3 py-1 text-gray-500">
        Previous
      </button>
      <button suppressHydrationWarning type="button" className="border-r border-gray-300 bg-[#1a56db] px-3 py-1 text-white">
        1
      </button>
      <button suppressHydrationWarning type="button" className="px-3 py-1 text-gray-500">
        Next
      </button>
    </div>
  );

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-[#3f4658]">Templates</h2>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[200px_1fr]">
        <div className="rounded border border-gray-200 bg-white">
          <div className="max-h-[640px] overflow-y-auto p-2">
            {templateCategories.map((item) => (
              <button
                key={item}
                suppressHydrationWarning
                type="button"
                onClick={() => setCategory(item)}
                className={`mb-1 block w-full rounded px-3 py-2 text-left text-xs font-medium ${category === item ? "bg-[#1a56db] text-white" : "text-[#2f4f76] hover:bg-gray-100"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0 space-y-3">
          {category === "Property Template" ? (
            <div className="space-y-3 rounded border border-gray-200 bg-white p-3">
              <AccordionRow title="Property WhatsApp Template" open={propOpenWa} onToggle={() => setPropOpenWa((v) => !v)}>
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-[#3f4658]">Property WhatsApp Template</h4>
                  <textarea
                    suppressHydrationWarning
                    value={propWaBody}
                    onChange={(e) => setPropWaBody(e.target.value)}
                    rows={8}
                    className="w-full resize-y rounded border border-gray-300 px-3 py-2 text-xs leading-relaxed text-[#3f4658] outline-none focus:border-[#1a56db]"
                  />
                  <div className="flex justify-end gap-2">
                    <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                      Submit
                    </button>
                    <button suppressHydrationWarning type="button" className="rounded bg-gray-200 px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300">
                      Cancel
                    </button>
                  </div>
                </div>
              </AccordionRow>
              <AccordionRow title="Business WhatsApp Template" open={propOpenBus} onToggle={() => setPropOpenBus((v) => !v)}>
                <div className="space-y-3">
                  <h4 className="border-b border-gray-100 pb-2 text-xs font-semibold text-[#3f4658]">Business WhatsApp Template</h4>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-[#3f4658]">Choose Template</label>
                    <div className="flex flex-wrap items-end gap-2">
                      <select
                        suppressHydrationWarning
                        value={propBusinessChoice}
                        onChange={(e) => setPropBusinessChoice(e.target.value)}
                        className="h-9 min-w-[200px] flex-1 rounded border border-gray-300 bg-white px-2 text-xs text-[#3f4658] outline-none focus:border-[#1a56db]"
                      >
                        <option value="">Select Template</option>
                        <option value="t1">Standard business</option>
                        <option value="t2">Launch campaign</option>
                      </select>
                      <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </AccordionRow>
            </div>
          ) : null}

          {category === "Project Template" ? (
            <div className="space-y-3 rounded border border-gray-200 bg-white p-3">
              <AccordionRow title="Project WhatsApp Template" open={projOpenWa} onToggle={() => setProjOpenWa((v) => !v)}>
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-[#3f4658]">Project WhatsApp Template</h4>
                  <textarea
                    suppressHydrationWarning
                    value={projWaBody}
                    onChange={(e) => setProjWaBody(e.target.value)}
                    rows={10}
                    className="w-full resize-y rounded border border-gray-300 px-3 py-2 text-xs leading-relaxed text-[#3f4658] outline-none focus:border-[#1a56db]"
                  />
                  <div className="flex justify-end gap-2">
                    <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                      Submit
                    </button>
                    <button suppressHydrationWarning type="button" className="rounded bg-gray-200 px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300">
                      Cancel
                    </button>
                  </div>
                </div>
              </AccordionRow>
              <AccordionRow title="Business WhatsApp Template" open={projOpenBus} onToggle={() => setProjOpenBus((v) => !v)}>
                <div className="space-y-3">
                  <h4 className="border-b border-gray-100 pb-2 text-xs font-semibold text-[#3f4658]">Business WhatsApp Template</h4>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-[#3f4658]">Choose Template</label>
                    <div className="flex flex-wrap items-end gap-2">
                      <select
                        suppressHydrationWarning
                        value={projBusinessChoice}
                        onChange={(e) => setProjBusinessChoice(e.target.value)}
                        className="h-9 min-w-[200px] flex-1 rounded border border-gray-300 bg-white px-2 text-xs text-[#3f4658] outline-none focus:border-[#1a56db]"
                      >
                        <option value="">Select Template</option>
                        <option value="t1">Standard business</option>
                        <option value="t2">Launch campaign</option>
                      </select>
                      <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </AccordionRow>
            </div>
          ) : null}

          {category === "Offline WhatsApp Template" ? (
            <div className="rounded border border-gray-200 bg-white p-3">
              <h3 className="mb-3 border-b border-gray-100 pb-2 text-sm font-semibold text-[#3f4658]">Offline WhatsApp Template</h3>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <Pagination />
                <button suppressHydrationWarning type="button" onClick={openAdd} className="inline-flex items-center gap-1.5 rounded bg-[#1a56db] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                  <Plus className="h-3.5 w-3.5" /> Create Template
                </button>
              </div>
              <div className="mb-3 flex max-w-md items-center gap-1">
                <div className="relative flex-1">
                  <input
                    suppressHydrationWarning
                    value={offlineSearch}
                    onChange={(e) => setOfflineSearch(e.target.value)}
                    placeholder="Search Template"
                    className="h-9 w-full rounded border border-gray-300 pr-16 pl-2 text-xs text-[#3f4658] outline-none focus:border-[#1a56db]"
                  />
                  <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
                    {offlineSearch ? (
                      <button suppressHydrationWarning type="button" onClick={() => setOfflineSearch("")} className="rounded p-1 text-gray-500 hover:bg-gray-100" aria-label="Clear">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                    <span className="rounded bg-[#1a56db] p-1.5 text-white">
                      <Search className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
              <Pagination className="mb-2" />
              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="w-full min-w-[480px] text-center text-xs text-[#4a5165]">
                  <thead className="bg-gray-50 text-[11px] font-semibold uppercase text-gray-600">
                    <tr>
                      <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                      <th className="border-b border-r border-gray-200 px-2 py-2">Name</th>
                      <th className="border-b border-gray-200 px-2 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOffline.length === 0 ? (
                      <tr>
                        <td className="border-b border-gray-100 px-2 py-6 text-center text-sm text-gray-500" colSpan={3}>
                          No templates match your search.
                        </td>
                      </tr>
                    ) : (
                      filteredOffline.map((row, j) => (
                        <tr key={`${row.name}-${row.originalIndex}`} className={j % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                          <td className="border-b border-r border-gray-100 px-2 py-2 text-left">{j + 1}</td>
                          <td className="border-b border-r border-gray-100 px-2 py-2 text-left font-medium text-[#3f4658]">{row.name}</td>
                          <td className="border-b border-gray-100 px-2 py-2">
                            <div className="flex items-center justify-center gap-1">
                              <button suppressHydrationWarning type="button" onClick={() => openEdit(row.originalIndex)} className="inline-flex h-6 w-6 items-center justify-center rounded bg-[#14c8b4] text-white hover:opacity-90" aria-label="Edit">
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button suppressHydrationWarning type="button" onClick={() => deleteOffline(row.originalIndex)} className="inline-flex h-6 w-6 items-center justify-center rounded bg-rose-500 text-white hover:opacity-90" aria-label="Delete">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 flex justify-end">
                <Pagination />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {offlineModal?.mode === "add" ? (
        <SimpleModal
          title="Add Template"
          onClose={() => setOfflineModal(null)}
          footer={
            <>
              <button suppressHydrationWarning type="button" onClick={saveOfflineModal} className="rounded bg-[#1a56db] px-5 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                Submit
              </button>
              <button suppressHydrationWarning type="button" onClick={() => setOfflineModal(null)} className="rounded bg-gray-200 px-5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300">
                Cancel
              </button>
            </>
          }
        >
          <div className="space-y-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#3f4658]">Name</label>
              <input suppressHydrationWarning value={offlineForm.name} onChange={(e) => setOfflineForm((p) => ({ ...p, name: e.target.value }))} placeholder="Enter Name" className="h-10 w-full rounded border border-gray-300 px-3 text-sm text-[#3f4658] outline-none focus:border-[#1a56db]" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#3f4658]">Message</label>
              <textarea suppressHydrationWarning value={offlineForm.message} onChange={(e) => setOfflineForm((p) => ({ ...p, message: e.target.value }))} placeholder="Enter Message" rows={8} className="w-full resize-y rounded border border-gray-300 px-3 py-2 text-sm text-[#3f4658] outline-none focus:border-[#1a56db]" />
            </div>
          </div>
        </SimpleModal>
      ) : null}

      {offlineModal?.mode === "edit" ? (
        <SimpleModal
          title="Update Template"
          onClose={() => setOfflineModal(null)}
          footer={
            <>
              <button suppressHydrationWarning type="button" onClick={saveOfflineModal} className="rounded bg-[#1a56db] px-5 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                Update
              </button>
              <button suppressHydrationWarning type="button" onClick={() => setOfflineModal(null)} className="rounded bg-gray-200 px-5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300">
                Cancel
              </button>
            </>
          }
        >
          <div className="space-y-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#3f4658]">Name</label>
              <input suppressHydrationWarning value={offlineForm.name} onChange={(e) => setOfflineForm((p) => ({ ...p, name: e.target.value }))} className="h-10 w-full rounded border border-gray-300 px-3 text-sm text-[#3f4658] outline-none focus:border-[#1a56db]" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#3f4658]">Message</label>
              <textarea suppressHydrationWarning value={offlineForm.message} onChange={(e) => setOfflineForm((p) => ({ ...p, message: e.target.value }))} rows={10} className="w-full resize-y rounded border border-gray-300 px-3 py-2 text-sm text-[#3f4658] outline-none focus:border-[#1a56db]" />
            </div>
          </div>
        </SimpleModal>
      ) : null}
    </div>
  );
}
