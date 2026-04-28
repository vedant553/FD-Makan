"use client";

import { ChevronDown } from "lucide-react";
import { PageShell, Panel, PanelHeader } from "@/components/crm/page-shell";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-xs font-semibold text-[#3f4658]">{children}</label>;
}

function TextField({ value, placeholder = "" }: { value: string; placeholder?: string }) {
  return (
    <input
      suppressHydrationWarning
      value={value}
      placeholder={placeholder}
      readOnly
      className="h-8 w-full rounded border border-gray-300 bg-white px-2 text-xs text-[#3f4658] outline-none"
    />
  );
}

function SelectField({ value }: { value: string }) {
  return (
    <div className="relative">
      <input
        suppressHydrationWarning
        value={value}
        readOnly
        className="h-8 w-full rounded border border-gray-300 bg-white px-2 pr-14 text-xs text-[#3f4658] outline-none"
      />
      <span className="pointer-events-none absolute right-7 top-1/2 -translate-y-1/2 text-gray-400">×</span>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
  );
}

export default function ManageCompanyInfoPage() {
  return (
    <PageShell>
      <Panel>
        <PanelHeader className="px-3 py-2">
          <h1 className="text-xs font-medium text-[#3f4658]">Company</h1>
        </PanelHeader>

        <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr]">
          <aside className="border-r border-gray-200 bg-[#f7f8fb] p-3">
            <button
              suppressHydrationWarning
              type="button"
              className="w-full rounded bg-[#1a56db] px-3 py-2 text-left text-xs font-semibold text-white"
            >
              Company Profile
            </button>
          </aside>

          <main className="p-3 md:p-4">
            <Panel className="rounded border border-gray-200 shadow-none">
              <div className="p-3 md:p-4">
                <h2 className="mb-3 text-xs font-semibold text-[#3f4658]">Your Logo</h2>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-14 w-20 items-center justify-center rounded border border-dashed border-gray-300 bg-white text-[10px] text-gray-500">
                    FD MAKAN
                  </div>
                  <button
                    suppressHydrationWarning
                    type="button"
                    className="rounded bg-[#1a56db] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    Update Logo
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
                  <div>
                    <FieldLabel>Name</FieldLabel>
                    <TextField value="FD Makan" />
                  </div>
                  <div>
                    <FieldLabel>Address</FieldLabel>
                    <TextField value="Kharghar" />
                  </div>
                  <div>
                    <FieldLabel>Gst Number</FieldLabel>
                    <TextField value="" placeholder="Gst Number" />
                  </div>
                  <div>
                    <FieldLabel>Rera Number</FieldLabel>
                    <TextField value="A52000014064" />
                  </div>
                  <div>
                    <FieldLabel>Website</FieldLabel>
                    <TextField value="www.fdmakan.com" />
                  </div>
                  <div>
                    <FieldLabel>Contact Person</FieldLabel>
                    <TextField value="Aman Dubey" />
                  </div>
                  <div>
                    <FieldLabel>Mobile</FieldLabel>
                    <TextField value="9987401146" />
                  </div>
                  <div>
                    <FieldLabel>Landline</FieldLabel>
                    <TextField value="7045190486" />
                  </div>
                  <div>
                    <FieldLabel>Abbreviation</FieldLabel>
                    <TextField value="fm" />
                  </div>
                </div>

                <div className="mt-5 border-t border-gray-200 pt-4">
                  <h3 className="mb-3 text-sm font-semibold text-[#3f4658]">Other Details</h3>
                  <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
                    <div>
                      <FieldLabel>Currency</FieldLabel>
                      <SelectField value="Indian rupee  (₹)" />
                    </div>
                    <div>
                      <FieldLabel>Google Country Code</FieldLabel>
                      <SelectField value="India" />
                    </div>
                    <div>
                      <FieldLabel>Time Offset</FieldLabel>
                      <SelectField value="(GMT +5:30) Bombay, Calcutta, Madras, New Delhi" />
                    </div>
                    <div>
                      <FieldLabel>Default Area Metric</FieldLabel>
                      <SelectField value="Sq. Ft" />
                    </div>
                    <div>
                      <FieldLabel>Dial Code</FieldLabel>
                      <SelectField value="91 (IN)" />
                    </div>
                    <div></div>
                    <div>
                      <FieldLabel>Working Hours From</FieldLabel>
                      <TextField value="10:00 AM" />
                    </div>
                    <div>
                      <FieldLabel>To</FieldLabel>
                      <TextField value="7:00 PM" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    suppressHydrationWarning
                    type="button"
                    className="rounded bg-[#1a56db] px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </Panel>
          </main>
        </div>
      </Panel>
    </PageShell>
  );
}
