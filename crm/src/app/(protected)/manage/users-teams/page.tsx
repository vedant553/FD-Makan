"use client";

import { useState } from "react";
import { ArrowLeft, Building2, ChevronDown, Copy, Filter, MapPin, Pencil, Plus, Search, SquareArrowOutUpRight, Trash2, Users, X } from "lucide-react";
import { PageShell, Panel } from "@/components/crm/page-shell";

const topTabs = ["Users", "Teams", "Chart", "Distribution", "Deleted Users"] as const;

const users = [
  { created: "03/10/2025 05:19:46", name: "Ajay Jaiswal", login: "28/04/2026 06:07:13", email: "rudra.fdm11@gmail.com", mobile: "7039414026", role: "Salesmen", designation: "Sales", region: "-", username: "fdmajay", team: "Panvel Team", call: "On", sync: "Apr 28, 2026, 11:24:48 AM", status: "Active", inactive: "" },
  { created: "29/04/2025 14:32:08", name: "Aman Dubey", login: "Apr 27 2026 9:48PM", email: "aman.fdmps@gmail.com", mobile: "9987401146", role: "Admin", designation: "Director", region: "-", username: "fdmaman", team: "-", call: "On", sync: "Mar 29, 2026, 12:41:52 PM", status: "Active", inactive: "" },
  { created: "13/11/2025 06:31:55", name: "Aniket Surwade", login: "Apr 26 2026 12:23PM", email: "prathamesh.fdm11@gmail.com", mobile: "8652894517", role: "Salesmen", designation: "Sales Executive", region: "-", username: "fdmaniket", team: "Kharghar Team", call: "On", sync: "Apr 26, 2026, 12:23:46 PM", status: "Inactive", inactive: "28/04/2026 11:35:29" },
  { created: "04/04/2026 08:00:49", name: "Arbaaz Patel", login: "Apr 26 2026 10:50AM", email: "arbazfdm11@gmail.com", mobile: "9152644594", role: "Salesmen", designation: "Sales Executive", region: "-", username: "fdmarbaaz", team: "Kharghar Team", call: "On", sync: "Apr 28, 2026, 11:25:42 AM", status: "Active", inactive: "" },
  { created: "17/09/2025 07:38:31", name: "Avishi Pandey", login: "Apr 25 2026 6:04PM", email: "avishipandey.fdm@gmail.com", mobile: "9167838763", role: "Salesmen", designation: "Sales Executive", region: "-", username: "fdmavishi", team: "Kharghar Team", call: "On", sync: "Apr 25, 2026, 6:07:08 PM", status: "On Holiday", inactive: "" },
  { created: "15/04/2026 10:34:52", name: "Kajal Jadhav", login: "Apr 25 2026 1:34PM", email: "welockgroup@gmail.com", mobile: "8693002318", role: "Salesmen", designation: "Sales Executive", region: "-", username: "fdmkajal", team: "Panvel Team", call: "On", sync: "Apr 25, 2026, 1:37:44 PM", status: "Active", inactive: "" },
  { created: "13/11/2025 06:39:07", name: "Pranay Waghmare", login: "Apr 26 2026 11:01PM", email: "pranay.fdm11@gmail.com", mobile: "7045924965", role: "Salesmen", designation: "Sales Executive", region: "-", username: "fdmpranay", team: "Kharghar Team", call: "On", sync: "Apr 28, 2026, 11:53:45 AM", status: "Active", inactive: "" },
  { created: "15/04/2026 10:47:19", name: "Priya Jagtap", login: "15/04/2026 10:51:46", email: "priyajagtapfdm14@gmail.com", mobile: "8689883445", role: "Salesmen", designation: "Sales Executive", region: "-", username: "fdmpriya", team: "Nerul", call: "On", sync: "-", status: "Active", inactive: "" },
  { created: "13/11/2025 06:37:17", name: "Sakshi Pagare", login: "Apr 27 2026 12:52PM", email: "sakshi.fdm11@gmail.com", mobile: "9152709139", role: "Salesmen", designation: "Sales Executive", region: "-", username: "fdmsakshi", team: "Panvel Team", call: "On", sync: "Apr 27, 2026, 12:52:59 PM", status: "On Holiday", inactive: "" },
  { created: "06/12/2025 09:26:35", name: "Vishal Shukla", login: "Apr 26 2026 2:16PM", email: "vishal.fdm02@gmail.com", mobile: "9930235983", role: "Salesmen", designation: "Sales Executive", region: "-", username: "fdmvishal", team: "Kharghar Team", call: "On", sync: "Apr 26, 2026, 6:27:52 PM", status: "Inactive", inactive: "28/04/2026 11:35:23" },
] as const;

const permissionBadges = [
  "Create",
  "Read",
  "Update",
  "Delete",
  "Export",
  "Mask Contact",
  "Mask Source",
  "Mask Property Contact",
  "Co Owner",
  "Show Lead Delay",
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

function StatCard({ title, subtitle, value, color }: { title: string; subtitle: string; value: string; color: string }) {
  return (
    <div className="rounded border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-3 py-2 text-sm font-semibold text-[#3f4658]">{title}</div>
      <div className="flex items-center justify-between px-3 py-3">
        <p className="text-xs text-[#4a5165]">{subtitle}</p>
        <span className={`inline-flex min-w-6 items-center justify-center rounded px-2 py-1 text-xs font-semibold text-white ${color}`}>{value}</span>
      </div>
    </div>
  );
}

export default function ManageUsersTeamsPage() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [activeTopTab, setActiveTopTab] = useState<(typeof topTabs)[number]>("Users");

  return (
    <PageShell className="space-y-3">
      <Panel className="overflow-visible">
        <div className="flex flex-wrap gap-1 border-b border-gray-200 px-2 py-1">
          {topTabs.map((tab, idx) => (
            <button
              suppressHydrationWarning
              key={tab}
              type="button"
              onClick={() => setActiveTopTab(tab)}
              className={`rounded px-3 py-1.5 text-xs ${activeTopTab === tab || (idx === 0 && activeTopTab === "Users") ? "bg-[#1a56db] text-white" : "text-[#3f4658] hover:bg-gray-100"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </Panel>

      {activeTopTab === "Users" ? (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total" subtitle="Total Users" value="10" color="bg-[#1a56db]" />
            <StatCard title="Active" subtitle="Total Active Users" value="8" color="bg-emerald-500" />
            <StatCard title="Inactive" subtitle="Total Inactive Users" value="2" color="bg-rose-500" />
            <StatCard title="On Holiday" subtitle="Total Users On Holiday" value="5" color="bg-cyan-500" />
          </div>

          <Panel>
            <div className="space-y-3 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-[#3f4658]">Users (10)</h2>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-[170px]">
                <input suppressHydrationWarning readOnly value="Select Team" className="h-8 w-full rounded border border-gray-300 bg-white px-2 pr-7 text-xs text-gray-500" />
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
              <div className="relative w-[190px]">
                <input suppressHydrationWarning readOnly value="Select Designation" className="h-8 w-full rounded border border-gray-300 bg-white px-2 pr-7 text-xs text-gray-500" />
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
              <button suppressHydrationWarning type="button" className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#1a56db] text-[#1a56db] hover:bg-blue-50">⋮</button>
              <button suppressHydrationWarning type="button" onClick={() => setIsAddUserOpen(true)} className="inline-flex items-center gap-2 rounded bg-[#1a56db] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                <Plus className="h-3.5 w-3.5" /> Add User
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex rounded border border-gray-300 text-xs">
              <button suppressHydrationWarning className="border-r border-gray-300 px-3 py-1 text-gray-500">Previous</button>
              <button suppressHydrationWarning className="border-r border-gray-300 bg-[#1a56db] px-3 py-1 text-white">1</button>
              <button suppressHydrationWarning className="px-3 py-1 text-gray-500">Next</button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded border border-gray-300 overflow-hidden">
                <input suppressHydrationWarning readOnly value="Search" className="h-8 w-28 bg-white px-2 text-xs text-gray-500 outline-none" />
                <button suppressHydrationWarning className="h-8 border-l border-gray-300 bg-[#1a56db] px-2 text-white"><Search className="h-3.5 w-3.5" /></button>
                <button suppressHydrationWarning className="h-8 border-l border-gray-300 bg-gray-100 px-2 text-gray-500"><X className="h-3.5 w-3.5" /></button>
              </div>
              <div className="relative w-16">
                <input suppressHydrationWarning readOnly value="50" className="h-8 w-full rounded border border-gray-300 bg-white px-2 pr-6 text-xs text-gray-600" />
                <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="w-full min-w-[1480px] text-left text-xs text-[#4a5165]">
              <thead className="bg-gray-50 uppercase text-[11px] text-gray-600">
                <tr>
                  <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                  <th className="border-b border-r border-gray-200 px-2 py-2">Created Date</th>
                  <th className="border-b border-r border-gray-200 px-2 py-2">Name</th>
                  <th className="border-b border-r border-gray-200 px-2 py-2">Last Login</th>
                  <th className="border-b border-r border-gray-200 px-2 py-2">Email & Mobile</th>
                  <th className="border-b border-r border-gray-200 px-2 py-2">Role</th>
                  <th className="border-b border-r border-gray-200 px-2 py-2">Designation</th>
                  <th className="border-b border-r border-gray-200 px-2 py-2">Region</th>
                  <th className="border-b border-r border-gray-200 px-2 py-2">User Name</th>
                  <th className="border-b border-r border-gray-200 px-2 py-2">Team</th>
                  <th className="border-b border-r border-gray-200 px-2 py-2">Call Log Sync</th>
                  <th className="border-b border-r border-gray-200 px-2 py-2">Current Location</th>
                  <th className="border-b border-r border-gray-200 px-2 py-2">Status</th>
                  <th className="border-b border-r border-gray-200 px-2 py-2">Inactive Date</th>
                  <th className="border-b border-gray-200 px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={`${user.name}-${user.created}`} className="hover:bg-gray-50">
                    <td className="border-b border-r border-gray-100 px-2 py-2">{index + 1}</td>
                    <td className="border-b border-r border-gray-100 px-2 py-2 whitespace-nowrap">{user.created}</td>
                    <td className="border-b border-r border-gray-100 px-2 py-2 font-semibold text-[#3f4658]">{user.name}</td>
                    <td className="border-b border-r border-gray-100 px-2 py-2 whitespace-nowrap">{user.login}</td>
                    <td className="border-b border-r border-gray-100 px-2 py-2">
                      <p>{user.email}</p>
                      <p>{user.mobile}</p>
                    </td>
                    <td className="border-b border-r border-gray-100 px-2 py-2">{user.role}</td>
                    <td className="border-b border-r border-gray-100 px-2 py-2">{user.designation}</td>
                    <td className="border-b border-r border-gray-100 px-2 py-2">{user.region}</td>
                    <td className="border-b border-r border-gray-100 px-2 py-2">
                      <span className="inline-flex items-center gap-1 text-[#1a56db]">
                        {user.username} <SquareArrowOutUpRight className="h-3 w-3" />
                      </span>
                    </td>
                    <td className="border-b border-r border-gray-100 px-2 py-2">{user.team}</td>
                    <td className="border-b border-r border-gray-100 px-2 py-2">
                      <p className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span> {user.call}</p>
                      <p className="text-[10px] text-gray-400">(Last sync at: {user.sync})</p>
                    </td>
                    <td className="border-b border-r border-gray-100 px-2 py-2">
                      <button suppressHydrationWarning type="button" className="text-[#1a56db]"><MapPin className="h-4 w-4" /></button>
                    </td>
                    <td className="border-b border-r border-gray-100 px-2 py-2">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold text-white ${user.status === "Active" ? "bg-emerald-500" : user.status === "Inactive" ? "bg-rose-500" : "bg-cyan-500"}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="border-b border-r border-gray-100 px-2 py-2 whitespace-nowrap">{user.inactive}</td>
                    <td className="border-b border-gray-100 px-2 py-2">
                      <div className="relative inline-block group">
                        <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-2 py-1 text-[10px] text-white hover:bg-blue-700">▼</button>
                        <div className="absolute right-0 top-full z-20 mt-1 hidden min-w-[200px] rounded border border-gray-200 bg-white py-1 shadow-md group-hover:block">
                          <button
                            suppressHydrationWarning
                            type="button"
                            onClick={() => setIsEditUserOpen(true)}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-[#2f374b] hover:bg-gray-50"
                          >
                            <Pencil className="h-4 w-4" /> Update
                          </button>
                          <button suppressHydrationWarning type="button" className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-[#2f374b] hover:bg-gray-50">
                            <Copy className="h-4 w-4" /> Clone Sales Agent
                          </button>
                          <button suppressHydrationWarning type="button" className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-[#2f374b] hover:bg-gray-50">
                            <X className="h-4 w-4" /> Make Inactive
                          </button>
                          <button suppressHydrationWarning type="button" className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-[#2f374b] hover:bg-gray-50">
                            <span className="inline-flex h-4 w-4 items-center justify-center text-xs font-bold">✓</span> On Holiday
                          </button>
                          <button suppressHydrationWarning type="button" className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-[#2f374b] hover:bg-gray-50">
                            <span className="inline-flex h-4 w-4 items-center justify-center text-xs font-bold">✓</span> Set Assignee
                          </button>
                          <button suppressHydrationWarning type="button" className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-[#2f374b] hover:bg-gray-50">
                            <X className="h-4 w-4" /> Turn Off Call Log Sync
                          </button>
                          <button suppressHydrationWarning type="button" className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-[#2f374b] hover:bg-gray-50">
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
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
          </Panel>
        </>
      ) : null}

      {activeTopTab === "Teams" ? <TeamsSection /> : null}
      {activeTopTab === "Chart" ? <ChartSection /> : null}
      {activeTopTab === "Distribution" ? <DistributionSection /> : null}
      {activeTopTab === "Deleted Users" ? <DeletedUsersSection /> : null}

      {isAddUserOpen ? <AddUserModal mode="add" onClose={() => setIsAddUserOpen(false)} /> : null}
      {isEditUserOpen ? <AddUserModal mode="edit" onClose={() => setIsEditUserOpen(false)} /> : null}
    </PageShell>
  );
}

function ChartSection() {
  return (
    <Panel>
      <div className="space-y-3 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[#3f4658]">Chart Representation</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-2 py-1 text-[10px] font-medium text-white hover:bg-blue-700">Expand All</button>
            <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-2 py-1 text-[10px] font-medium text-white hover:bg-blue-700">Collapse All</button>
            <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-2 py-1 text-[10px] font-medium text-white hover:bg-blue-700">Fit To The Screen</button>
            <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-2 py-1 text-[10px] font-medium text-white hover:bg-blue-700">Export</button>
            <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-2 py-1 text-[10px] font-medium text-white hover:bg-blue-700">Horizontal</button>
            <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-2 py-1 text-[10px] font-medium text-white hover:bg-blue-700">Vertical</button>
            <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-2 py-1 text-[10px] font-medium text-white hover:bg-blue-700">Reset</button>
            <input
              suppressHydrationWarning
              readOnly
              value="Search by name"
              className="h-6 w-[150px] rounded border border-gray-300 bg-white px-2 text-[11px] text-gray-400"
            />
          </div>
        </div>

        <div className="relative min-h-[420px] overflow-x-auto rounded border border-gray-200 bg-gray-50">
          <div className="mx-auto min-w-[760px] py-8">
            <div className="flex flex-col items-center">
              <OrgNode title="Fd Makan" subtitle="Company" type="company" />
              <div className="h-8 w-px bg-gray-300" />

              <div className="relative flex items-start justify-center gap-6">
                <div className="absolute left-1/2 top-0 h-px w-[310px] -translate-x-1/2 bg-gray-300" />
                <div className="flex flex-col items-center">
                  <div className="h-5 w-px bg-gray-300" />
                  <OrgNode title="Kharghar Team" subtitle="Team" type="team" />
                  <div className="h-7 w-px bg-gray-300" />
                  <OrgNode title="Panvel Team" subtitle="Team" type="team" />
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-5 w-px bg-gray-300" />
                  <OrgNode title="Nerul" subtitle="Team" type="team" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function OrgNode({ title, subtitle, type }: { title: string; subtitle: string; type: "company" | "team" }) {
  return (
    <div className="relative w-[170px] rounded-md border border-gray-200 bg-white px-3 py-3 shadow-sm">
      <span className="absolute right-2 top-2 text-[10px] text-gray-500">{subtitle}</span>
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
            type === "company" ? "bg-blue-100 text-[#1a56db]" : "bg-orange-100 text-orange-600"
          }`}
        >
          {type === "company" ? <Building2 className="h-4 w-4" /> : <Users className="h-4 w-4" />}
        </span>
        <p className="text-sm font-medium text-[#2f374b]">{title}</p>
      </div>
    </div>
  );
}

function DistributionSection() {
  const [activeSubTab, setActiveSubTab] = useState<"distribution" | "history">("distribution");
  const [showFilters, setShowFilters] = useState(true);
  const [isAddDistributionOpen, setIsAddDistributionOpen] = useState(false);

  return (
    <Panel>
      <div className="space-y-3 p-3">
        {showFilters ? (
          <div className="grid grid-cols-1 gap-3 border-b border-gray-200 pb-3 md:grid-cols-2 xl:grid-cols-4">
            <SelectField label="Distribution Type *" value="Distribution Type" />
            <SelectField label="Distribution Sub Type *" value="Distribution Sub Type" />
            <SelectField label="Teams" value="Select Team" />
            <div className="space-y-1">
              <SelectField label="Sales Agent" value="Select Sales Agent" />
              <div className="flex justify-end gap-2">
                <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                  Apply
                </button>
                <button suppressHydrationWarning type="button" className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                  Clear
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <div className="flex items-center gap-1">
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setActiveSubTab("distribution")}
              className={`rounded px-3 py-1.5 text-xs ${activeSubTab === "distribution" ? "bg-[#1a56db] text-white" : "text-[#3f4658] hover:bg-gray-100"}`}
            >
              Distribution
            </button>
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setActiveSubTab("history")}
              className={`rounded px-3 py-1.5 text-xs ${activeSubTab === "history" ? "bg-[#1a56db] text-white" : "text-[#3f4658] hover:bg-gray-100"}`}
            >
              History
            </button>
          </div>
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="inline-flex h-8 w-8 items-center justify-center rounded bg-[#f97316] text-white hover:bg-orange-600"
            aria-label="Toggle filters"
            title="Toggle filters"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>

        {activeSubTab === "distribution" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#3f4658]">Distribution List (0)</h3>
              <div className="flex items-center gap-2">
                <button suppressHydrationWarning type="button" onClick={() => setIsAddDistributionOpen(true)} className="inline-flex items-center gap-2 rounded bg-[#1a56db] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                  <Plus className="h-3.5 w-3.5" /> Add Distribution
                </button>
                <button suppressHydrationWarning type="button" className="inline-flex h-7 w-7 items-center justify-center rounded bg-[#f97316] text-white hover:bg-orange-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <DistributionTable variant="distribution" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#3f4658]">Distribution History (0)</h3>
              <button suppressHydrationWarning type="button" className="inline-flex h-7 w-7 items-center justify-center rounded bg-[#f97316] text-white hover:bg-orange-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <DistributionTable variant="history" />
          </div>
        )}
      </div>

      {isAddDistributionOpen ? <AddDistributionModal onClose={() => setIsAddDistributionOpen(false)} /> : null}
    </Panel>
  );
}

function DistributionTable({ variant }: { variant: "distribution" | "history" }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex overflow-hidden rounded border border-gray-300">
          <input suppressHydrationWarning readOnly value="Search" className="h-8 w-32 bg-white px-2 text-xs text-gray-500 outline-none" />
          <button suppressHydrationWarning className="h-8 border-l border-gray-300 bg-[#5f8fcb] px-2 text-white">
            <Search className="h-3.5 w-3.5" />
          </button>
          <button suppressHydrationWarning className="h-8 border-l border-gray-300 bg-gray-100 px-2 text-gray-500">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="relative w-16">
          <input suppressHydrationWarning readOnly value="50" className="h-8 w-full rounded border border-gray-300 bg-white px-2 pr-6 text-xs text-gray-600" />
          <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full min-w-[820px] text-left text-xs text-[#4a5165]">
          <thead className="bg-gray-50 uppercase text-[11px] text-gray-600">
            {variant === "distribution" ? (
              <tr>
                <th className="border-b border-r border-gray-200 px-2 py-2">
                  <input suppressHydrationWarning type="checkbox" className="h-3 w-3 rounded border-gray-300" />
                </th>
                <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                <th className="border-b border-r border-gray-200 px-2 py-2">Sales Agent</th>
                <th className="border-b border-r border-gray-200 px-2 py-2">Assignment Order</th>
                <th className="border-b border-gray-200 px-2 py-2">Action</th>
              </tr>
            ) : (
              <tr>
                <th className="border-b border-r border-gray-200 px-2 py-2">
                  <input suppressHydrationWarning type="checkbox" className="h-3 w-3 rounded border-gray-300" />
                </th>
                <th className="border-b border-r border-gray-200 px-2 py-2">Lead</th>
                <th className="border-b border-r border-gray-200 px-2 py-2">Created Date</th>
                <th className="border-b border-gray-200 px-2 py-2">Sales Agent</th>
              </tr>
            )}
          </thead>
          <tbody>
            {variant === "distribution" ? (
              <tr>
                <td className="border-b border-r border-gray-100 px-2 py-2">-</td>
                <td className="border-b border-r border-gray-100 px-2 py-2">-</td>
                <td className="border-b border-r border-gray-100 px-2 py-2">No Data Found</td>
                <td className="border-b border-r border-gray-100 px-2 py-2">-</td>
                <td className="border-b border-gray-100 px-2 py-2">-</td>
              </tr>
            ) : (
              <tr>
                <td className="border-b border-r border-gray-100 px-2 py-2">-</td>
                <td className="border-b border-r border-gray-100 px-2 py-2">-</td>
                <td className="border-b border-r border-gray-100 px-2 py-2">No Data Found</td>
                <td className="border-b border-gray-100 px-2 py-2">-</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddDistributionModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[180] bg-black/50 p-4">
      <div className="mx-auto mt-12 w-full max-w-5xl overflow-hidden rounded border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-2xl font-semibold text-[#3f4658]">Add Distribution</h3>
          <button suppressHydrationWarning type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close add distribution">
            <X className="h-8 w-8" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 px-6 py-6 md:grid-cols-2">
          <SelectField label="Distribution Type" value="Distribution Type" />
          <SelectField label="Distribution Sub Type" value="Distribution Sub Type" />
          <SelectField label="Sales Agent" value="Select Sales Agent" />
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-5">
          <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-5 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Submit
          </button>
          <button suppressHydrationWarning type="button" onClick={onClose} className="rounded bg-gray-200 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function DeletedUsersSection() {
  const deletedUsers = [
    { created: "10/06/2025 13:27:20", name: "Aditya Jumledar", login: "12/08/2025 05:40:26", mobile: "9167706965", role: "Salesmen", designation: "Sales Executive", region: "-", team: "-", inactive: "-", deleted: "16/09/2025 06:09:34" },
    { created: "30/04/2025 07:31:04", name: "Aditya Pawar", login: "-", mobile: "9321558043", role: "Salesmen", designation: "Sales Executive", region: "-", team: "-", inactive: "-", deleted: "02/05/2025 13:25:32" },
    { created: "10/05/2025 06:48:43", name: "Ajay Jaiswar", login: "05/06/2025 06:17:51", mobile: "8692951860", role: "Salesmen", designation: "Sales Executive", region: "-", team: "-", inactive: "-", deleted: "01/07/2025 10:06:41" },
    { created: "10/06/2025 14:06:28", name: "Anthony Das", login: "28/08/2025 13:25:14", mobile: "9867976985", role: "Salesmen", designation: "Sales Executive", region: "-", team: "-", inactive: "16/09/2025 08:36:56", deleted: "25/09/2025 10:57:57" },
    { created: "30/04/2025 07:23:03", name: "Ashwini Naik", login: "-", mobile: "8369086470", role: "Salesmen", designation: "Sales Executive", region: "-", team: "-", inactive: "-", deleted: "10/06/2025 07:26:19" },
    { created: "03/10/2025 06:06:57", name: "Dec Caller 2", login: "Nov 4 2025 12:12PM", mobile: "9152797103", role: "Salesmen", designation: "Pre Sales", region: "-", team: "-", inactive: "-", deleted: "13/11/2025 11:02:20" },
    { created: "03/10/2025 06:04:43", name: "Dev Caller 1", login: "Nov 2 2025 11:35AM", mobile: "7045190486", role: "Salesmen", designation: "Pre Sales", region: "-", team: "-", inactive: "-", deleted: "04/11/2025 12:25:50" },
    { created: "30/04/2025 07:35:00", name: "Kajal Jadhav", login: "Apr 15 2026 3:12PM", mobile: "7039073817", role: "Salesmen", designation: "Pre Sales", region: "-", team: "Panvel Team", inactive: "-", deleted: "15/04/2026 16:14:57" },
    { created: "30/04/2025 07:26:50", name: "Kunal Bodekar", login: "Oct 15 2025 5:24PM", mobile: "8928684983", role: "Salesmen", designation: "Sales Executive", region: "-", team: "-", inactive: "-", deleted: "21/10/2025 12:21:11" },
    { created: "03/12/2025 07:06:12", name: "Laxmi Rathod", login: "Feb 7 2026 10:12AM", mobile: "9152173305", role: "Salesmen", designation: "Sales Executive", region: "-", team: "-", inactive: "11/02/2026 18:18:47", deleted: "18/02/2026 13:08:48" },
    { created: "13/11/2025 06:34:37", name: "Maninder Singh", login: "Feb 3 2026 5:53PM", mobile: "9702437139", role: "Salesmen", designation: "Sales Executive", region: "-", team: "-", inactive: "11/02/2026 18:18:43", deleted: "18/02/2026 13:05:09" },
    { created: "30/04/2025 07:09:06", name: "Nikita Budhd", login: "30/04/2025 07:10:35", mobile: "8369008538", role: "Salesmen", designation: "Sales Executive", region: "-", team: "-", inactive: "-", deleted: "10/06/2025 11:02:50" },
    { created: "08/07/2025 11:36:35", name: "Nitesh Verma", login: "23/07/2025 13:06:00", mobile: "9152644805", role: "Salesmen", designation: "Sales Executive", region: "-", team: "-", inactive: "-", deleted: "09/08/2025 11:16:15" },
    { created: "30/04/2025 07:18:23", name: "Pooja Londhe", login: "10/06/2025 04:55:40", mobile: "9769550762", role: "Salesmen", designation: "Sales Executive", region: "-", team: "-", inactive: "-", deleted: "01/07/2025 09:54:14" },
    { created: "29/04/2025 10:21:27", name: "Priyanshu Pandey", login: "28/08/2025 07:30:21", mobile: "9321141877", role: "Salesmen", designation: "Sales Executive", region: "-", team: "-", inactive: "10/09/2025 05:05:08", deleted: "25/09/2025 11:05:54" },
    { created: "30/04/2025 07:20:33", name: "Rajiv Lashkar", login: "11/06/2025 06:36:52", mobile: "9152362382", role: "Salesmen", designation: "Sales Executive", region: "-", team: "-", inactive: "-", deleted: "01/07/2025 10:06:21" },
    { created: "30/04/2025 07:37:11", name: "Saeeda Khan", login: "05/06/2025 06:16:37", mobile: "9321143716", role: "Salesmen", designation: "Pre Sales", region: "-", team: "-", inactive: "-", deleted: "01/07/2025 10:11:33" },
    { created: "01/07/2025 10:01:16", name: "Sandeep Pandey", login: "06/08/2025 04:43:40", mobile: "9769037851", role: "Salesmen", designation: "Sales Executive", region: "-", team: "-", inactive: "-", deleted: "16/09/2025 06:18:20" },
    { created: "13/11/2025 06:55:08", name: "Sayon Bhattacharya", login: "Feb 10 2026 1:54PM", mobile: "7506375196", role: "Salesmen", designation: "Sales Executive", region: "-", team: "-", inactive: "11/02/2026 18:15:59", deleted: "24/02/2026 11:25:03" },
    { created: "10/06/2025 13:25:51", name: "Sharan Atwal", login: "07/08/2025 05:51:50", mobile: "8879146019", role: "Salesmen", designation: "Sales Executive", region: "-", team: "-", inactive: "-", deleted: "16/09/2025 06:13:54" },
    { created: "09/10/2025 08:40:38", name: "Shriraj Patil", login: "Apr 8 2026 10:43AM", mobile: "9167489449", role: "Salesmen", designation: "Sales Executive", region: "-", team: "Nerul", inactive: "08/04/2026 18:41:22", deleted: "09/04/2026 12:16:40" },
    { created: "04/11/2025 06:53:36", name: "Vishal Shukla", login: "Nov 13 2025 2:49PM", mobile: "9594361153", role: "Salesmen", designation: "Sales Executive", region: "-", team: "Kharghar Team", inactive: "-", deleted: "03/12/2025 12:37:12" },
    { created: "30/04/2025 07:33:25", name: "Vrushali Jadhav", login: "Oct 9 2025 2:08PM", mobile: "7045889835", role: "Salesmen", designation: "Pre Sales", region: "-", team: "-", inactive: "-", deleted: "09/10/2025 14:14:01" },
  ] as const;

  return (
    <Panel>
      <div className="space-y-3 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[#3f4658]">Deleted Users (23)</h2>
          <div className="flex items-center gap-2">
            <button suppressHydrationWarning type="button" className="inline-flex items-center gap-1 rounded bg-[#1a56db] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
              <ArrowLeft className="h-3.5 w-3.5" /> Go Back
            </button>
            <button suppressHydrationWarning type="button" className="inline-flex h-7 w-7 items-center justify-center rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
              <span className="text-base leading-none">⋮</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex rounded border border-gray-300 text-xs">
            <button suppressHydrationWarning className="border-r border-gray-300 px-3 py-1 text-gray-500">Previous</button>
            <button suppressHydrationWarning className="border-r border-gray-300 bg-[#1a56db] px-3 py-1 text-white">1</button>
            <button suppressHydrationWarning className="px-3 py-1 text-gray-500">Next</button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex overflow-hidden rounded border border-gray-300">
              <input suppressHydrationWarning readOnly value="Search" className="h-8 w-32 bg-white px-2 text-xs text-gray-500 outline-none" />
              <button suppressHydrationWarning className="h-8 border-l border-gray-300 bg-[#5f8fcb] px-2 text-white">
                <Search className="h-3.5 w-3.5" />
              </button>
              <button suppressHydrationWarning className="h-8 border-l border-gray-300 bg-gray-100 px-2 text-gray-500">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="relative w-16">
              <input suppressHydrationWarning readOnly value="50" className="h-8 w-full rounded border border-gray-300 bg-white px-2 pr-6 text-xs text-gray-600" />
              <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded border border-gray-200">
          <table className="w-full min-w-[1520px] text-left text-xs text-[#4a5165]">
            <thead className="bg-gray-50 uppercase text-[11px] text-gray-600">
              <tr>
                <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                <th className="border-b border-r border-gray-200 px-2 py-2">Created Date</th>
                <th className="border-b border-r border-gray-200 px-2 py-2">Name</th>
                <th className="border-b border-r border-gray-200 px-2 py-2">Last Login</th>
                <th className="border-b border-r border-gray-200 px-2 py-2">Mobile</th>
                <th className="border-b border-r border-gray-200 px-2 py-2">Role</th>
                <th className="border-b border-r border-gray-200 px-2 py-2">Designation</th>
                <th className="border-b border-r border-gray-200 px-2 py-2">Region</th>
                <th className="border-b border-r border-gray-200 px-2 py-2">Team</th>
                <th className="border-b border-r border-gray-200 px-2 py-2">Inactive Date</th>
                <th className="border-b border-gray-200 px-2 py-2">Deleted Date</th>
              </tr>
            </thead>
            <tbody>
              {deletedUsers.map((user, idx) => (
                <tr key={`${user.name}-${user.created}`} className="hover:bg-gray-50">
                  <td className="border-b border-r border-gray-100 px-2 py-2">{idx + 1}</td>
                  <td className="border-b border-r border-gray-100 px-2 py-2 whitespace-nowrap">{user.created}</td>
                  <td className="border-b border-r border-gray-100 px-2 py-2 font-semibold text-[#2f374b]">{user.name}</td>
                  <td className="border-b border-r border-gray-100 px-2 py-2 whitespace-nowrap">{user.login}</td>
                  <td className="border-b border-r border-gray-100 px-2 py-2">{user.mobile}</td>
                  <td className="border-b border-r border-gray-100 px-2 py-2">{user.role}</td>
                  <td className="border-b border-r border-gray-100 px-2 py-2">{user.designation}</td>
                  <td className="border-b border-r border-gray-100 px-2 py-2">{user.region}</td>
                  <td className="border-b border-r border-gray-100 px-2 py-2">{user.team}</td>
                  <td className="border-b border-r border-gray-100 px-2 py-2 whitespace-nowrap">{user.inactive}</td>
                  <td className="border-b border-gray-100 px-2 py-2 whitespace-nowrap">{user.deleted}</td>
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
    </Panel>
  );
}

function TeamsSection() {
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");

  const teamRows = [
    { created: "13/11/2025 06:46:46", name: "Kharghar Team", users: "5", manager: "-", lead: "-" },
    { created: "02/04/2026 12:43:06", name: "Nerul", users: "1", manager: "-", lead: "Priya Jagtap" },
    { created: "06/12/2025 09:31:59", name: "Panvel Team", users: "3", manager: "-", lead: "-" },
  ] as const;

  const editMembers = [
    "Avishi Pandey",
    "Aniket Surwade",
    "Pranay Waghmare",
    "Vishal Shukla",
    "Arbaaz Patel",
  ] as const;

  if (mode === "list") {
    return (
      <Panel>
        <div className="space-y-3 p-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#3f4658]">Teams</h2>
            <button suppressHydrationWarning type="button" onClick={() => setMode("create")} className="inline-flex items-center gap-2 rounded bg-[#1a56db] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
              <Plus className="h-3.5 w-3.5" /> Add Team
            </button>
          </div>

          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="w-full min-w-[920px] text-left text-xs text-[#4a5165]">
              <thead className="bg-gray-50 uppercase text-[11px] text-gray-600">
                <tr>
                  <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                  <th className="border-b border-r border-gray-200 px-2 py-2">Created Date</th>
                  <th className="border-b border-r border-gray-200 px-2 py-2">Team Name</th>
                  <th className="border-b border-r border-gray-200 px-2 py-2">No Of Users</th>
                  <th className="border-b border-r border-gray-200 px-2 py-2">Manager</th>
                  <th className="border-b border-r border-gray-200 px-2 py-2">Team Lead</th>
                  <th className="border-b border-gray-200 px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {teamRows.map((row, idx) => (
                  <tr key={`${row.name}-${row.created}`} className="hover:bg-gray-50">
                    <td className="border-b border-r border-gray-100 px-2 py-2">{idx + 1}</td>
                    <td className="border-b border-r border-gray-100 px-2 py-2 whitespace-nowrap">{row.created}</td>
                    <td className="border-b border-r border-gray-100 px-2 py-2">{row.name}</td>
                    <td className="border-b border-r border-gray-100 px-2 py-2">{row.users}</td>
                    <td className="border-b border-r border-gray-100 px-2 py-2">{row.manager}</td>
                    <td className="border-b border-r border-gray-100 px-2 py-2">{row.lead}</td>
                    <td className="border-b border-gray-100 px-2 py-2">
                      <div className="flex items-center gap-1">
                        <button suppressHydrationWarning type="button" onClick={() => setMode("edit")} className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#16c9b3] text-white"><Pencil className="h-3 w-3" /></button>
                        <button suppressHydrationWarning type="button" className="inline-flex h-5 w-5 items-center justify-center rounded bg-rose-500 text-white"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Panel>
    );
  }

  const isEdit = mode === "edit";
  const formTitle = isEdit ? "Edit Team" : "Create Team";

  return (
    <Panel>
      <div className="space-y-3 p-3">
        <h2 className="text-sm font-semibold text-[#3f4658]">{formTitle}</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Team Name" value={isEdit ? "Kharghar Team" : ""} placeholder="Team Name" />
          <SelectField label="Select Manager" value="Select Manager" />
          <SelectField label="Select User" value="Select User" />
        </div>

        <div className="flex justify-end">
          <button suppressHydrationWarning type="button" className="inline-flex items-center gap-2 rounded bg-[#5f8fcb] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#4f7fba]">
            <Plus className="h-3.5 w-3.5" /> Add Team Member
          </button>
        </div>

        <div className="overflow-x-auto rounded border border-gray-200">
          <table className="w-full min-w-[760px] text-left text-xs text-[#4a5165]">
            <thead className="bg-gray-50 uppercase text-[11px] text-gray-600">
              <tr>
                <th className="border-b border-r border-gray-200 px-2 py-2">#</th>
                <th className="border-b border-r border-gray-200 px-2 py-2">Name</th>
                <th className="border-b border-r border-gray-200 px-2 py-2">Team Lead</th>
                <th className="border-b border-gray-200 px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isEdit
                ? editMembers.map((member, idx) => (
                    <tr key={member} className="hover:bg-gray-50">
                      <td className="border-b border-r border-gray-100 px-2 py-2">{idx + 1}</td>
                      <td className="border-b border-r border-gray-100 px-2 py-2">{member}</td>
                      <td className="border-b border-r border-gray-100 px-2 py-2">
                        <span className="relative inline-flex h-4 w-7 items-center rounded-full bg-gray-300">
                          <span className="inline-block h-3 w-3 translate-x-0.5 rounded-full bg-white" />
                        </span>
                      </td>
                      <td className="border-b border-gray-100 px-2 py-2">
                        <button suppressHydrationWarning type="button" className="inline-flex h-5 w-5 items-center justify-center rounded bg-rose-500 text-white">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                : (
                  <tr>
                    <td className="border-b border-gray-100 px-2 py-2 text-center text-sm" colSpan={4}>No Data Found</td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2">
          <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700">{isEdit ? "Save" : "Submit"}</button>
          <button suppressHydrationWarning type="button" onClick={() => setMode("list")} className="rounded bg-gray-200 px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300">Cancel</button>
        </div>
      </div>
    </Panel>
  );
}

function AddUserModal({ mode, onClose }: { mode: "add" | "edit"; onClose: () => void }) {
  const [activeModuleTab, setActiveModuleTab] = useState<keyof typeof modulePermissionMap>("Dashboard");

  return (
    <div className="fixed inset-0 z-[180] bg-black/50 p-2">
      <div className="h-full overflow-y-auto rounded border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-xl font-semibold text-[#3f4658]">{mode === "edit" ? "Edit User" : "Create User"}</h3>
          <button suppressHydrationWarning type="button" onClick={onClose} className="inline-flex items-center gap-1 rounded bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600">
            <span>↩</span> Go Back
          </button>
        </div>

        <div className="space-y-4 p-3">
          <Panel className="border border-gray-200 shadow-none">
            <div className="grid grid-cols-1 gap-x-4 gap-y-2 p-3 md:grid-cols-3">
              <Field label="Name" value="" placeholder="Name" />
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#3f4658]">Contact Number</label>
                <div className="grid grid-cols-[102px_1fr] gap-1">
                  <SelectLike value="91 (IN)" clearable />
                  <input suppressHydrationWarning readOnly value="" placeholder="Contact Number" className="h-8 w-full rounded border border-gray-300 px-2 text-xs text-gray-500" />
                </div>
              </div>
              <SelectField label="Designation" value="Select Designation" />
              <SelectField label="Role" value="Select Role" />
              <SelectField label="Region" value="Select Region" />
              <Field label="Email" value="" placeholder="Email" />
              <Field label="Username" value="" placeholder="Username" />
              <div className="flex items-end pb-1">
                <ToggleRow label="Disabled Screenshot" checked={false} />
              </div>
              <Field label="Password" value="" placeholder="Password" />
              <Field label="Confirm Password" value="" placeholder="Confirm Password" />
            </div>
          </Panel>

          <Panel className="border border-gray-200 shadow-none">
            <div className="flex justify-end gap-2 border-b border-gray-200 px-3 py-2">
              <button suppressHydrationWarning className="rounded bg-[#1a56db] px-4 py-1.5 text-xs font-medium text-white">Submit</button>
              <button suppressHydrationWarning className="rounded bg-gray-200 px-4 py-1.5 text-xs font-medium text-gray-700">Cancel</button>
            </div>
            <div className="p-3">
              <h4 className="mb-3 text-xs font-semibold text-[#3f4658]">Permissions</h4>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {permissionBadges.map((permission) => (
                  <button key={permission} suppressHydrationWarning className="w-fit rounded bg-[#16c9b3] px-3 py-1 text-[10px] font-semibold uppercase text-white">
                    {permission} ✓
                  </button>
                ))}
              </div>
            </div>
          </Panel>

          <Panel className="border border-gray-200 shadow-none">
            <div className="flex flex-wrap gap-1 border-b border-gray-200 px-2 py-1">
              {Object.keys(modulePermissionMap).map((moduleName) => (
                <button
                  suppressHydrationWarning
                  key={moduleName}
                  type="button"
                  onClick={() => setActiveModuleTab(moduleName as keyof typeof modulePermissionMap)}
                  className={`rounded px-3 py-1.5 text-xs ${activeModuleTab === moduleName ? "bg-[#1a56db] text-white" : "text-[#3f4658] hover:bg-gray-100"}`}
                >
                  {moduleName}
                </button>
              ))}
            </div>
            <div className="p-3">
              <label className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#3f4658]">
                <input suppressHydrationWarning type="checkbox" checked readOnly className="h-3 w-3 rounded border-gray-300" />
                {activeModuleTab.toUpperCase()}
              </label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {modulePermissionMap[activeModuleTab].map((permission) => (
                  <button key={permission} suppressHydrationWarning className="w-fit rounded bg-[#16c9b3] px-3 py-1 text-[10px] font-semibold uppercase text-white">
                    {permission} ✓
                  </button>
                ))}
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, placeholder }: { label: string; value: string; placeholder: string }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-[#3f4658]">{label}</label>
      <input suppressHydrationWarning readOnly value={value} placeholder={placeholder} className="h-8 w-full rounded border border-gray-300 px-2 text-xs text-gray-500" />
    </div>
  );
}

function SelectLike({ value, clearable = false }: { value: string; clearable?: boolean }) {
  return (
    <div className="relative">
      <input suppressHydrationWarning readOnly value={value} className="h-8 w-full rounded border border-gray-300 bg-white px-2 pr-8 text-xs text-[#4a5165]" />
      {clearable ? <span className="pointer-events-none absolute right-7 top-1/2 -translate-y-1/2 text-gray-400">×</span> : null}
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
  );
}

function SelectField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-[#3f4658]">{label}</label>
      <SelectLike value={value} />
    </div>
  );
}

function ToggleRow({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold text-[#3f4658]">{label}</span>
      <span className={`relative inline-flex h-5 w-9 items-center rounded-full ${checked ? "bg-[#1a56db]" : "bg-gray-300"}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </span>
    </div>
  );
}
