"use client";

import { useCallback, useMemo, useState } from "react";
import { PageShell, Panel, PanelHeader } from "@/components/crm/page-shell";

const roles = [
  { id: "admin", label: "Admin" },
  { id: "salesmen", label: "Salesmen" },
  { id: "manager", label: "Sales Manager" },
] as const;

const modulePermissionMap: Record<string, string[]> = {
  Dashboard: ["Dashboard"],
  Task: ["Mytasks"],
  CRM: ["Contacts", "Projects", "Leads", "Property", "Lead Activity", "Channel Partner", "Active Leads", "Lead Logs"],
  Bookings: ["Deals", "Received Payments", "Bookedlist"],
  Campaign: ["Campaign"],
  Account: ["Account Ledger", "Account Voucher"],
  Manage: ["Attendance", "Employees", "Settings", "Templates", "Triggers", "Company Info", "Company Subscription", "Apidocs", "Banner"],
  Report: ["Call Logs", "Virtual Call", "Tracking", "Agent Performance", "Notification Logs", "Advance Dashboard", "Visit Analysis", "Webhook Logs", "CP Analysis", "Lead Stage/Source", "Stage History", "Call Analysis", "Qualified Stage"],
};

const actions = ["View", "Create", "Update", "Delete"] as const;
type Action = (typeof actions)[number];
type ModuleName = keyof typeof modulePermissionMap;

type PermissionMatrix = Record<string, Record<string, Record<string, Record<Action, boolean>>>>;

function buildEmptyMatrix(): PermissionMatrix {
  const m: PermissionMatrix = {};
  for (const r of roles) {
    m[r.id] = {};
    for (const mod of Object.keys(modulePermissionMap) as ModuleName[]) {
      m[r.id][mod] = {};
      for (const sub of modulePermissionMap[mod]) {
        m[r.id][mod][sub] = { View: false, Create: false, Update: false, Delete: false };
      }
    }
  }
  return m;
}

function PermissionCheckbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button suppressHydrationWarning type="button" role="checkbox" aria-checked={checked} onClick={onToggle} className="mx-auto flex h-5 w-5 items-center justify-center rounded border border-gray-300 bg-white text-[10px] font-bold text-[#1a56db] hover:border-[#1a56db]">
      {checked ? "✓" : ""}
    </button>
  );
}

export default function ManagePermissionsPage() {
  const [activeRole, setActiveRole] = useState<(typeof roles)[number]["id"]>("admin");
  const [activeModule, setActiveModule] = useState<ModuleName>("CRM");
  const [matrix, setMatrix] = useState<PermissionMatrix>(buildEmptyMatrix);

  const subs = modulePermissionMap[activeModule];

  const toggleCell = useCallback((sub: string, action: Action) => {
    setMatrix((prev) => {
      const next = structuredClone(prev) as PermissionMatrix;
      const cell = next[activeRole]?.[activeModule]?.[sub]?.[action];
      if (cell !== undefined) next[activeRole][activeModule][sub][action] = !cell;
      return next;
    });
  }, [activeRole, activeModule]);

  const moduleKeys = useMemo(() => Object.keys(modulePermissionMap) as ModuleName[], []);

  return (
    <PageShell>
      <Panel>
        <PanelHeader className="px-3 py-2">
          <h1 className="text-xs font-medium text-[#3f4658]">Permissions</h1>
        </PanelHeader>

        <div className="grid grid-cols-1 border-t border-gray-200 lg:grid-cols-[180px_1fr]">
          <aside className="border-b border-gray-200 bg-[#f7f8fb] p-3 lg:border-b-0 lg:border-r">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Role</p>
            <div className="space-y-1">
              {roles.map((r) => (
                <button
                  suppressHydrationWarning
                  key={r.id}
                  type="button"
                  onClick={() => setActiveRole(r.id)}
                  className={`w-full rounded px-3 py-2 text-left text-xs font-medium ${activeRole === r.id ? "bg-[#1a56db] text-white" : "text-[#2f4f76] hover:bg-gray-200"}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-gray-500">Select a role, then set module access. Changes are local until you connect an API.</p>
          </aside>

          <main className="min-w-0 p-3 md:p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-[#3f4658]">
                Module access — <span className="text-[#1a56db]">{roles.find((r) => r.id === activeRole)?.label}</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                  Save
                </button>
                <button suppressHydrationWarning type="button" onClick={() => setMatrix(buildEmptyMatrix())} className="rounded bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300">
                  Reset draft
                </button>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-1 rounded border border-gray-200 bg-white p-1">
              {moduleKeys.map((mod) => (
                <button
                  suppressHydrationWarning
                  key={mod}
                  type="button"
                  onClick={() => setActiveModule(mod)}
                  className={`rounded px-3 py-1.5 text-xs font-medium ${activeModule === mod ? "bg-[#1a56db] text-white" : "text-[#3f4658] hover:bg-gray-100"}`}
                >
                  {mod}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto rounded border border-gray-200 bg-white">
              <table className="w-full min-w-[640px] text-left text-xs text-[#4a5165]">
                <thead className="bg-gray-50 text-[11px] font-semibold uppercase text-gray-600">
                  <tr>
                    <th className="border-b border-r border-gray-200 px-3 py-2.5">Screen / feature</th>
                    {actions.map((a) => (
                      <th key={a} className="border-b border-r border-gray-200 px-2 py-2.5 text-center last:border-r-0">
                        {a}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subs.map((sub) => (
                    <tr key={`${activeModule}-${sub}`} className="hover:bg-gray-50/80">
                      <td className="border-b border-r border-gray-100 px-3 py-2 font-medium text-[#3f4658]">{sub}</td>
                      {actions.map((action) => (
                        <td key={action} className="border-b border-r border-gray-100 px-2 py-2 text-center last:border-r-0">
                          <PermissionCheckbox checked={matrix[activeRole]?.[activeModule]?.[sub]?.[action] === true} onToggle={() => toggleCell(sub, action)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </Panel>
    </PageShell>
  );
}
