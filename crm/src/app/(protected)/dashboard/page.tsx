"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Users, User, RefreshCcw, Hand, UserMinus, ClipboardList, Home, Phone, PhoneCall, Handshake, MoreVertical, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageShell, PageTitle, Panel, PanelHeader } from "@/components/crm/page-shell";

const selectClassName =
  "h-10 min-w-[150px] rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("Tasks");

  return (
    <PageShell className="space-y-6">
      <PageTitle>Dashboard</PageTitle>
      {/* All Leads Section */}
      <Panel>
        <PanelHeader className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-base font-semibold text-foreground">All Leads</h2>
          <div className="flex flex-wrap gap-2">
            <select className={selectClassName}>
              <option>Select Team</option>
            </select>
            <select className={selectClassName}>
              <option>Select Sales Agent</option>
            </select>
          </div>
        </PanelHeader>
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 md:p-5">
          <Link href="/crm/leads" className="block">
            <MetricCard title="Total Leads" value="8665" icon={<Users className="w-5 h-5 text-indigo-600" />} iconBg="bg-indigo-100" />
          </Link>
          <Link href="/crm/leads" className="block">
            <MetricCard title="Fresh Leads" value="7874" icon={<User className="w-5 h-5 text-blue-500" />} iconBg="bg-blue-100" />
          </Link>
          <Link href="/crm/leads" className="block">
            <MetricCard title="Returning" value="791" icon={<RefreshCcw className="w-5 h-5 text-red-400" />} iconBg="bg-red-100" />
          </Link>
          <Link href="/crm/leads" className="block">
            <MetricCard title="Untouched" value="0" icon={<Hand className="w-5 h-5 text-yellow-500" />} iconBg="bg-yellow-100" />
          </Link>
          <Link href="/crm/leads" className="block">
            <MetricCard title="Unassigned" value="0" icon={<UserMinus className="w-5 h-5 text-green-500" />} iconBg="bg-green-100" />
          </Link>
        </div>
      </Panel>

      {/* Today&apos;s Leads Section */}
      <Panel>
        <PanelHeader className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-base font-semibold text-foreground">Today&apos;s Leads</h2>
          <div className="flex flex-wrap gap-2">
            <select className={selectClassName}>
              <option>Select Team</option>
            </select>
            <select className={selectClassName}>
              <option>Select Sales Agent</option>
            </select>
          </div>
        </PanelHeader>
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 md:p-5">
          <Link href="/crm/leads" className="block">
            <MetricCard title="Leads" value="7" icon={<Users className="w-5 h-5 text-indigo-600" />} iconBg="bg-indigo-100" />
          </Link>
          <Link href="/crm/leads" className="block">
            <MetricCard title="Fresh Leads" value="7" icon={<User className="w-5 h-5 text-blue-500" />} iconBg="bg-blue-100" />
          </Link>
          <Link href="/crm/leads" className="block">
            <MetricCard title="Returning" value="1" icon={<RefreshCcw className="w-5 h-5 text-red-400" />} iconBg="bg-red-100" />
          </Link>
          <Link href="/tasks?tab=tasks" className="block">
            <MetricCard title="Tasks" value="34" icon={<ClipboardList className="w-5 h-5 text-yellow-500" />} iconBg="bg-yellow-100" />
          </Link>
          <Link href="/tasks?tab=site-visit" className="block">
            <MetricCard title="Site Visits" value="0" icon={<Home className="w-5 h-5 text-green-500" />} iconBg="bg-green-100" />
          </Link>
        </div>
      </Panel>

      {/* Today&apos;s Activities Report */}
      <Panel>
        <div className="p-4 md:p-5">
          <h2 className="mb-3 text-base font-semibold text-foreground">Today&apos;s Activities Report</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <select className={selectClassName}>
              <option>Select Team</option>
            </select>
            <select className={selectClassName}>
              <option>Select Sales Agent</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
            <Link href="/crm/activities" className="block">
              <ActivityItem title="Tasks" value="26" icon={<ClipboardList className="w-4 h-4 text-yellow-500" />} iconBg="bg-yellow-100" />
            </Link>
            <Link href="/crm/activities" className="block">
              <ActivityItem title="Total Offline Calls" value="0" icon={<Phone className="w-4 h-4 text-blue-500" />} iconBg="bg-blue-100" />
            </Link>
            <Link href="/crm/activities" className="block">
              <ActivityItem title="Total IVR Calls" value="0" icon={<PhoneCall className="w-4 h-4 text-indigo-500" />} iconBg="bg-indigo-100" />
            </Link>
            
            <Link href="/crm/activities" className="block">
              <ActivityItem title="Meetings" value="0" icon={<Handshake className="w-4 h-4 text-cyan-500" />} iconBg="bg-cyan-100" />
            </Link>
            <Link href="/crm/activities" className="block">
              <ActivityItem title="Calls To Lead" value="0" icon={<Users className="w-4 h-4 text-purple-500" />} iconBg="bg-purple-100" />
            </Link>
            <Link href="/crm/activities" className="block">
              <ActivityItem title="Calls To Lead" value="0" icon={<Users className="w-4 h-4 text-purple-500" />} iconBg="bg-purple-100" />
            </Link>
            
            <Link href="/crm/activities" className="block">
              <ActivityItem title="Site Visit Scheduled" value="0" icon={<Home className="w-4 h-4 text-green-500" />} iconBg="bg-green-100" />
            </Link>
            <Link href="/crm/activities" className="block">
              <ActivityItem title="Calls To Contact" value="0" icon={<User className="w-4 h-4 text-blue-500" />} iconBg="bg-blue-100" />
            </Link>
            <Link href="/crm/activities" className="block">
              <ActivityItem title="Calls To Contact" value="0" icon={<User className="w-4 h-4 text-blue-500" />} iconBg="bg-blue-100" />
            </Link>
            
            <Link href="/crm/activities" className="block">
              <ActivityItem title="Site Visit Completed" value="0" icon={<Home className="w-4 h-4 text-green-500" />} iconBg="bg-green-100" />
            </Link>
            <Link href="/crm/activities" className="block">
              <ActivityItem title="Calls To Channel Partner" value="0" icon={<MoreVertical className="w-4 h-4 text-gray-500" />} iconBg="bg-gray-100" />
            </Link>
            <Link href="/crm/activities" className="block">
              <ActivityItem title="Calls To Channel Partner" value="0" icon={<MoreVertical className="w-4 h-4 text-gray-500" />} iconBg="bg-gray-100" />
            </Link>
          </div>
        </div>
      </Panel>

      {/* Tabs Section */}
      <Panel>
        <div className="flex border-b border-border p-2">
          <Button
            variant={activeTab === "Tasks" ? "default" : "ghost"}
            className="rounded-md"
            onClick={() => setActiveTab("Tasks")}
          >
            Tasks
          </Button>
          <Button
            variant={activeTab === "Site Visit" ? "default" : "ghost"}
            className="rounded-md"
            onClick={() => setActiveTab("Site Visit")}
          >
            Site Visit
          </Button>
        </div>

        <div className="p-4 md:p-5">
          {activeTab === "Tasks" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium text-foreground">Task (34)</h3>
                <select className={selectClassName}>
                  <option>Today</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="border-y bg-muted/40 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="py-3 px-4 font-semibold">#</th>
                      <th className="py-3 px-4 font-semibold">DETAILS</th>
                      <th className="py-3 px-4 font-semibold">TYPE</th>
                      <th className="py-3 px-4 font-semibold min-w-[140px]">SCHEDULE DATE</th>
                      <th className="py-3 px-4 font-semibold min-w-[250px]">AGENDA</th>
                      <th className="py-3 px-4 font-semibold">ACTIVITY TYPE</th>
                      <th className="py-3 px-4 font-semibold min-w-[120px]">SALES AGENT</th>
                      <th className="py-3 px-4 font-semibold">STATUS</th>
                      <th className="py-3 px-4 font-semibold">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <TaskRow id="1" details="Prasad Na" date="Apr 25, 2026, 10:03:52 AM" agenda="Ringing" agent="Supriya Jadhav" />
                    <TaskRow id="2" details="Mohd Arif" date="Apr 25, 2026, 10:15:11 AM" agenda="Saturday arrange VC by 11AM" agent="Supriya Jadhav" />
                    <TaskRow id="3" details="Vijay Patil" date="Apr 25, 2026, 10:16:39 AM" agenda="Switch off" agent="Supriya Jadhav" />
                    <TaskRow id="4" details="Dada Sargar" date="Apr 25, 2026, 10:23:38 AM" agenda="Cross call back Ajay - call back after some time" agent="Supriya Jadhav" />
                    <TaskRow id="5" details="Anita Kunder" date="Apr 25, 2026, 10:26:34 AM" agenda="Client looking 2bhk budget 50L , ok with under construction . call cut . need cross call" agent="Supriya Jadhav" />
                    <TaskRow id="6" details="Bharat Shah" date="Apr 25, 2026, 10:37:07 AM" agenda="Client looking 1bhk 35l. buaget max, and want carpet area is 450+ , stay" agent="Supriya Jadhav" />
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "Site Visit" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium text-foreground">Site Visit (0)</h3>
                <select className={selectClassName}>
                  <option>Today</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="border-y bg-muted/40 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="py-3 px-4 font-semibold">#</th>
                      <th className="py-3 px-4 font-semibold">DETAIL</th>
                      <th className="py-3 px-4 font-semibold">TYPE</th>
                      <th className="py-3 px-4 font-semibold">VISIT FREQUENCY</th>
                      <th className="py-3 px-4 font-semibold">PROJECT</th>
                      <th className="py-3 px-4 font-semibold">SCH. DATE</th>
                      <th className="py-3 px-4 font-semibold">SCH. FOR</th>
                      <th className="py-3 px-4 font-semibold">AGENDA</th>
                      <th className="py-3 px-4 font-semibold">FEEDBACK</th>
                      <th className="py-3 px-4 font-semibold">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={10} className="border-b py-4 text-center text-muted-foreground">No Data Found</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Panel>

      {/* Executive Lead Analysis */}
      <Panel>
        <PanelHeader className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-base font-semibold text-foreground">Executive Lead Analysis</h2>
          <div className="flex flex-wrap gap-2">
            <select className={selectClassName}>
              <option>Select Team</option>
            </select>
            <select className={selectClassName}>
              <option>Select Sales Agent</option>
            </select>
          </div>
        </PanelHeader>
      </Panel>
    </PageShell>
  );
}

function MetricCard({ title, value, icon, iconBg }: { title: string, value: string, icon: React.ReactNode, iconBg: string }) {
  return (
    <div className="relative flex items-center justify-between overflow-hidden rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary"></div>
      <div className="pl-2">
        <p className="mb-1 text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-semibold text-foreground">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
    </div>
  );
}

function ActivityItem({ title, value, icon, iconBg }: { title: string, value: string, icon: React.ReactNode, iconBg: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function TaskRow({ id, details, date, agenda, agent }: { id: string, details: string, date: string, agenda: string, agent: string }) {
  const [isActionOpen, setIsActionOpen] = useState(false);
  const actionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionRef.current && !actionRef.current.contains(event.target as Node)) {
        setIsActionOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <tr className="hover:bg-muted/30">
      <td className="py-3 px-4">{id}</td>
      <td className="py-3 px-4 text-foreground">{details}</td>
      <td className="py-3 px-4">
        <Badge className="rounded-md border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-primary">
          Lead
        </Badge>
      </td>
      <td className="whitespace-nowrap py-3 px-4 text-muted-foreground">
        {date.split(',')[0]},<br />{date.split(',')[1]}
      </td>
      <td className="max-w-xs truncate py-3 px-4 text-muted-foreground" title={agenda}>{agenda}</td>
      <td className="py-3 px-4 text-muted-foreground">Call</td>
      <td className="py-3 px-4 text-muted-foreground">{agent}</td>
      <td className="py-3 px-4">
        <Badge className="w-max gap-1 rounded-md border-red-200 bg-red-500 px-2 py-1 text-[10px] font-medium text-white">
          <span className="h-2 w-2 rounded-full bg-white/50"></span> To Do
        </Badge>
      </td>
      <td className="py-3 px-4">
        <div className="relative inline-block text-left" ref={actionRef}>
          <Button
            size="icon"
            className="h-8 w-8 rounded-md"
            onClick={() => setIsActionOpen(!isActionOpen)}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
          {isActionOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg border border-border bg-card py-1 shadow-sm">
              <button
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50"
                onClick={() => setIsActionOpen(false)}
              >
                Mark as done
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-muted/50"
                onClick={() => setIsActionOpen(false)}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}



