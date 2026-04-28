import { KeyRound, CalendarDays, Users, Clock3, Info } from "lucide-react";
import { PageShell, Panel, PanelHeader } from "@/components/crm/page-shell";

const subscriptionStats = [
  { icon: KeyRound, label: "API Key", value: "1a5eb9b7-cde0-4420-8057-830b1b5cd5eb" },
  { icon: CalendarDays, label: "Tenure Start", value: "2025-04-29" },
  { icon: CalendarDays, label: "Tenure End", value: "2026-05-08" },
  { icon: Users, label: "Number Of Users", value: "12" },
  { icon: Clock3, label: "Days Remaining", value: "9" },
  { icon: Info, label: "Status", value: "" },
] as const;

export default function ManageSubscriptionsPage() {
  return (
    <PageShell>
      <Panel>
        <PanelHeader className="px-3 py-2">
          <h1 className="text-sm font-medium text-[#3f4658]">FD Makan</h1>
        </PanelHeader>

        <div className="grid grid-cols-1 gap-4 p-3 lg:grid-cols-[330px_1fr]">
          <div className="rounded border border-gray-200 bg-white p-3">
            <ul className="space-y-3">
              {subscriptionStats.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className="flex items-start gap-2 text-xs text-[#3f4658]">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eef3ff] text-[#1a56db]">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="font-semibold">{item.label}:</span>{" "}
                      <span className="break-all text-[#4a5165]">{item.value}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded border border-gray-200 bg-white p-3">
            <h2 className="mb-3 text-xs font-semibold text-[#3f4658]">Subscriptions</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-xs text-[#4a5165]">
                <thead className="border border-gray-200 bg-gray-50 uppercase">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Number Of Users</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Tenure Start</th>
                    <th className="px-3 py-2">Tenure End</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border border-gray-200">
                    <td className="px-3 py-2"></td>
                    <td className="px-3 py-2"></td>
                    <td className="px-3 py-2"></td>
                    <td className="px-3 py-2">No Data Found</td>
                    <td className="px-3 py-2"></td>
                    <td className="px-3 py-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Panel>
    </PageShell>
  );
}
