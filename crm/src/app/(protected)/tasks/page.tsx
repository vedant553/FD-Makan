"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User, Search, X, MoreVertical, ChevronDown, Download, CalendarDays, Menu, LayoutGrid, Plus, MessageCircle, PencilLine, Mail, Phone, ClipboardList, Check, Pencil, Trash2, RefreshCw } from "lucide-react";
import { getTaskActionPermissions, type TaskRole } from "@/lib/rbac/tasks";
import { request } from "@/lib/api-client/request";
import { tasksApi } from "@/lib/api-client/tasks-api";
import { invalidateTasksModuleQueries } from "@/lib/query/tasks-query";

type TaskEditPayload = {
  lead: string;
  salesAgent: string;
  title: string;
  dueDate: string;
  activityType: string;
};

export default function TasksPage() {
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const role = ((session?.user?.role as TaskRole | undefined) ?? "AGENT");
  const authReady = sessionStatus !== "loading";
  const taskPermissions = authReady ? getTaskActionPermissions(role) : null;
  const [permissionMessage, setPermissionMessage] = useState<string | null>(null);
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    initialTab === "site-visit" ? "Site Visit" : "Tasks",
  );
  const [calendarView, setCalendarView] = useState("Week");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSiteVisitModalOpen, setIsSiteVisitModalOpen] = useState(false);
  const [isCalendarAddModalOpen, setIsCalendarAddModalOpen] = useState(false);
  const [showTaskAnalysis, setShowTaskAnalysis] = useState(false);
  const [taskAnalysisView, setTaskAnalysisView] = useState<"chart" | "table">("chart");
  const [showSiteVisitAnalysis, setShowSiteVisitAnalysis] = useState(false);
  const [siteVisitAnalysisView, setSiteVisitAnalysisView] = useState<"chart" | "table">("chart");
  const [taskLeadDrawerOpen, setTaskLeadDrawerOpen] = useState(false);
  const [selectedLeadName, setSelectedLeadName] = useState("Saumittra Mathur");
  const [taskEditData, setTaskEditData] = useState<TaskEditPayload | null>(null);
  const [taskTableDownloadOpen, setTaskTableDownloadOpen] = useState(false);
  const [taskExportShowDetails, setTaskExportShowDetails] = useState<"yes" | "no">("yes");
  const [taskExportFileType, setTaskExportFileType] = useState<"xlsx" | "csv" | "pdf">("xlsx");
  const [taskExportColumnsOpen, setTaskExportColumnsOpen] = useState(true);
  const [taskExportFileName, setTaskExportFileName] = useState("User-Task");
  const TASK_EXPORT_COLUMNS = [
    "Created Date",
    "Lead",
    "Mobile",
    "Type",
    "Assigned By",
    "Assigned To",
    "Pre Sales Agent",
    "Schedule Date",
    "Title",
    "Remark",
    "Activity Type",
    "Stage",
    "Status",
    "Completed On",
    "Completed By",
  ] as const;
  const [taskSelectedColumns, setTaskSelectedColumns] = useState<Set<string>>(new Set(TASK_EXPORT_COLUMNS));

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "tasks") setActiveTab("Tasks");
    else if (tab === "site-visit") setActiveTab("Site Visit");
  }, [searchParams]);

  useEffect(() => {
    const handler = () => {
      setPermissionMessage("You do not have permission to perform this action.");
      setTimeout(() => setPermissionMessage(null), 3500);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("tasks-api-forbidden", handler as EventListener);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("tasks-api-forbidden", handler as EventListener);
      }
    };
  }, []);

  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-[#f4f7f6] p-6">
        <div className="mx-auto max-w-3xl rounded-md border border-gray-200 bg-white p-6 text-center text-gray-600 shadow-sm">
          Checking your task permissions...
        </div>
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#f4f7f6] p-6">
        <div className="mx-auto max-w-3xl rounded-md border border-gray-200 bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-700">Session expired</p>
          <p className="mt-2 text-sm text-gray-600">Please sign in again to continue managing tasks.</p>
          <a
            href="/login"
            className="mt-4 inline-flex rounded bg-[#1a56db] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-gray-800 p-4 md:p-6 bg-[#f4f7f6]">
      {permissionMessage ? (
        <div className="fixed right-4 top-4 z-[220] rounded border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800 shadow-sm">
          {permissionMessage}
        </div>
      ) : null}
      {/* Top Tabs */}
      <div className="flex border-b border-gray-200 bg-white shadow-sm mb-4">
        <button suppressHydrationWarning 
          className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Tasks' ? 'bg-[#1a56db] text-white border-[#1a56db]' : 'text-[#1a56db] hover:bg-gray-50 border-transparent'}`}
          onClick={() => setActiveTab('Tasks')}
        >
          Tasks
        </button>
        <button suppressHydrationWarning 
          className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Site Visit' ? 'bg-[#1a56db] text-white border-[#1a56db]' : 'text-[#1a56db] hover:bg-gray-50 border-transparent'}`}
          onClick={() => setActiveTab('Site Visit')}
        >
          Site Visit
        </button>
        <button suppressHydrationWarning 
          className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Calendar' ? 'bg-[#1a56db] text-white border-[#1a56db]' : 'text-[#1a56db] hover:bg-gray-50 border-transparent'}`}
          onClick={() => setActiveTab('Calendar')}
        >
          Calendar
        </button>
      </div>
      <div className="mb-4 rounded border border-blue-100 bg-blue-50 px-4 py-2 text-xs text-blue-700">
        {role === "ADMIN"
          ? "Viewing all tasks within your organization."
          : role === "MANAGER"
            ? "Viewing team-scoped tasks within your organization."
            : "Viewing tasks assigned to you or created by you."}
      </div>

      <div className="pb-6">
        {activeTab === 'Tasks' && (
          <div className="space-y-6">
            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-md border border-gray-100 shadow-sm">
              <MetricCard title="Today's Task" value="35" />
              <MetricCard title="Upcoming Task" value="20" />
              <MetricCard title="Pending Task" value="516" />
              <MetricCard title="Completed Task" value="1059" />
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-md border border-gray-100 shadow-sm space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 bg-[#4c51bf] hover:bg-[#434190] cursor-pointer text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors shadow-sm">
                  1595 <User className="w-3.5 h-3.5 fill-current" />
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                <FilterSelect label="Project" placeholder="Search & Select Project" />
                <FilterSelect label="Activity type" placeholder="Select Activity Types" />
                <FilterSelect label="Date Range" placeholder="Current Month" />
                <FilterSelect label="Pre Sales Agent" placeholder="Select Pre Sales Agent" />
                <FilterSelect label="Teams" placeholder="Select Team" />
                <FilterSelect label="Assigned To" placeholder="Select Sales Agent" />
                <FilterSelect label="Status" placeholder="Select Status" />
                <FilterSelect label="Assigned By" placeholder="Select Sales Agent" />
                <FilterSelect label="Entity Type" placeholder="Select Entity Type" />
              </div>

              <div className="flex flex-wrap justify-end items-center gap-2 pt-4 mt-4">
                <button suppressHydrationWarning className="bg-[#1a56db] hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors">Search</button>
                <button suppressHydrationWarning className="bg-[#1a56db] hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors">Clear</button>
                {taskPermissions?.create ? (
                  <button suppressHydrationWarning
                    className="bg-[#1a56db] hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
                    onClick={() => setIsTaskModalOpen(true)}
                  >
                    Add
                  </button>
                ) : null}
                <button suppressHydrationWarning
                  className="bg-[#1a56db] hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
                  onClick={() => {
                    setShowTaskAnalysis((isVisible) => {
                      const nextVisible = !isVisible;
                      if (nextVisible) {
                        setTaskAnalysisView("chart");
                      }
                      return nextVisible;
                    });
                  }}
                >
                  Analysis
                </button>
                <div className="relative group">
                  <button suppressHydrationWarning className="border border-[#1a56db] text-[#1a56db] p-1.5 rounded flex items-center justify-center hover:bg-blue-50 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg py-1 hidden group-hover:block z-50 min-w-[160px]">
                    {taskPermissions?.export ? (
                      <>
                        <button
                          suppressHydrationWarning
                          className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          onClick={() => setTaskTableDownloadOpen(true)}
                        >
                          <Download className="w-4 h-4 text-gray-600" />
                          Table Download
                        </button>
                        <button suppressHydrationWarning className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Download className="w-4 h-4 text-gray-600" /> Bulk Download
                        </button>
                      </>
                    ) : (
                      <span className="block px-4 py-2 text-[12px] text-gray-500">No export permission</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {showTaskAnalysis && (
              <TaskAnalysisReport
                view={taskAnalysisView}
                onToggleView={() =>
                  setTaskAnalysisView((currentView) => (currentView === "chart" ? "table" : "chart"))
                }
              />
            )}

            {/* Table Area */}
            <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden">
              {/* Table Header Controls */}
              <div className="p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                <div className="flex rounded border border-gray-300 overflow-hidden text-sm shadow-sm">
                  <button suppressHydrationWarning className="px-3 py-1.5 bg-gray-50 text-gray-500 hover:bg-gray-100 border-r border-gray-300 transition-colors">Previous</button>
                  <button suppressHydrationWarning className="px-3 py-1.5 bg-[#1a56db] text-white border-r border-[#1a56db]">1</button>
                  <button suppressHydrationWarning className="px-3 py-1.5 text-[#1a56db] hover:bg-blue-50 border-r border-gray-300 transition-colors">2</button>
                  <button suppressHydrationWarning className="px-3 py-1.5 text-[#1a56db] hover:bg-blue-50 border-r border-gray-300 transition-colors">3</button>
                  <button suppressHydrationWarning className="px-3 py-1.5 text-[#1a56db] hover:bg-blue-50 border-r border-gray-300 transition-colors">4</button>
                  <button suppressHydrationWarning className="px-3 py-1.5 text-[#1a56db] hover:bg-blue-50 transition-colors">Next</button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <select suppressHydrationWarning className="border border-gray-300 rounded shadow-sm text-sm px-3 py-1.5 text-gray-500 outline-none w-40 appearance-none bg-white">
                      <option>Select Columns</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="flex border border-gray-300 shadow-sm rounded overflow-hidden">
                    <input suppressHydrationWarning type="text" placeholder="Search" className="px-3 py-1.5 text-sm outline-none w-48 text-gray-600" />
                    <button suppressHydrationWarning className="bg-[#5978de] text-white px-3 py-1.5 flex items-center justify-center hover:bg-blue-600 transition-colors">
                      <Search className="w-4 h-4" />
                    </button>
                    <button suppressHydrationWarning className="bg-gray-100 text-gray-500 px-3 py-1.5 border-l border-gray-300 flex items-center justify-center hover:bg-gray-200 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative">
                    <select suppressHydrationWarning className="border border-gray-300 rounded shadow-sm text-sm px-3 py-1.5 text-gray-700 outline-none w-16 appearance-none bg-white">
                      <option>20</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-white text-gray-700 font-bold border-b border-gray-200 text-[12px] uppercase tracking-wide">
                    <tr>
                      <th className="py-3 px-4 w-10 border-r border-gray-100"><input suppressHydrationWarning type="checkbox" className="rounded border-gray-300" /></th>
                      <th className="py-3 px-3 border-r border-gray-100">#</th>
                      <th className="py-3 px-4 border-r border-gray-100">CREATED DATE</th>
                      <th className="py-3 px-4 border-r border-gray-100">LEAD</th>
                      <th className="py-3 px-4 border-r border-gray-100">MOBILE</th>
                      <th className="py-3 px-4 border-r border-gray-100">TYPE</th>
                      <th className="py-3 px-4 border-r border-gray-100">ASSIGNED BY</th>
                      <th className="py-3 px-4 border-r border-gray-100">ASSIGNED TO</th>
                      <th className="py-3 px-4 border-r border-gray-100">PRE SALES AGENT</th>
                      <th className="py-3 px-4 border-r border-gray-100">SCHEDULE DATE</th>
                      <th className="py-3 px-4 border-r border-gray-100">TITLE</th>
                      <th className="py-3 px-4 border-r border-gray-100">REMARK</th>
                      <th className="py-3 px-4 border-r border-gray-100">ACTIVITY TYPE</th>
                      <th className="py-3 px-4 border-r border-gray-100">STAGE</th>
                      <th className="py-3 px-4 border-r border-gray-100">STATUS</th>
                      <th className="py-3 px-4 border-r border-gray-100">COMPLETED ON</th>
                      <th className="py-3 px-4 border-r border-gray-100">COMPLETED BY</th>
                      <th className="py-3 px-4">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <TaskTableRow no="1" date="Apr 1, 2026, 11:11:11 AM" lead="Saumittra Mathur" mobile="+91-9970094776" assignedBy="Ajay Jaiswal" assignedTo="Ajay Jaiswal" schDate="Apr 1, 2026, 11:41:01 AM" title="Call At Apr 1, 2026, 11:41 Am" onLeadClick={(lead) => { setSelectedLeadName(lead); setTaskLeadDrawerOpen(true); }} onUpdateClick={(payload) => setTaskEditData(payload)} />
                    <TaskTableRow no="2" date="Mar 31, 2026, 8:45:57 PM" lead="Ghanshyam Maniya" mobile="+91-7016561147" assignedBy="Sakshi Pagare" assignedTo="Sakshi Pagare" schDate="Apr 1, 2026, 11:45:00 AM" title="Call With Ghanshyam Maniya @ Apr..." onLeadClick={(lead) => { setSelectedLeadName(lead); setTaskLeadDrawerOpen(true); }} onUpdateClick={(payload) => setTaskEditData(payload)} />
                    <TaskTableRow no="3" date="Apr 1, 2026, 11:50:49 AM" lead="Bikram Pradhan Na" mobile="+91-7021681952" assignedBy="Aniket Surwade" assignedTo="Aniket Surwade" schDate="Apr 1, 2026, 11:50:00 AM" title="Followp Task With Bikram Pradhan Na" onLeadClick={(lead) => { setSelectedLeadName(lead); setTaskLeadDrawerOpen(true); }} onUpdateClick={(payload) => setTaskEditData(payload)} />
                    <TaskTableRow no="4" date="Apr 1, 2026, 11:57:09 AM" lead="Prakash Pandey" mobile="+91-9967446180" assignedBy="Sakshi Pagare" assignedTo="Sakshi Pagare" schDate="Apr 1, 2026, 12:27:10 PM" title="Call At Apr 1, 2026, 12:27 Pm" onLeadClick={(lead) => { setSelectedLeadName(lead); setTaskLeadDrawerOpen(true); }} onUpdateClick={(payload) => setTaskEditData(payload)} />
                    <TaskTableRow no="5" date="Jul 23, 2025, 12:37:50 PM" lead="Dhiraj Tripathi" mobile="+91-8268996594" assignedBy="Kajal Jadhav" assignedTo="Supriya Jadhav" schDate="Apr 1, 2026, 12:37:00 PM" title="Followp Task With Dhiraj Tripathi" onLeadClick={(lead) => { setSelectedLeadName(lead); setTaskLeadDrawerOpen(true); }} onUpdateClick={(payload) => setTaskEditData(payload)} />
                    <TaskTableRow no="6" date="Apr 1, 2026, 11:10:19 AM" lead="Sunanda Kadam" mobile="+91-8108333619" assignedBy="Avishi Pandey" assignedTo="Avishi Pandey" schDate="Apr 1, 2026, 12:40:11 PM" title="Call At Apr 1, 2026, 12:40 Pm" onLeadClick={(lead) => { setSelectedLeadName(lead); setTaskLeadDrawerOpen(true); }} onUpdateClick={(payload) => setTaskEditData(payload)} />
                    <TaskTableRow no="7" date="Apr 1, 2026, 11:13:27 AM" lead="Manisha Katkar" mobile="+91-9820176618" assignedBy="Avishi Pandey" assignedTo="Avishi Pandey" schDate="Apr 1, 2026, 12:43:21 PM" title="Call At Apr 1, 2026, 12:43 Pm" onLeadClick={(lead) => { setSelectedLeadName(lead); setTaskLeadDrawerOpen(true); }} onUpdateClick={(payload) => setTaskEditData(payload)} />
                    <TaskTableRow no="8" date="Apr 1, 2026, 11:16:54 AM" lead="Rajeev" mobile="+91-7727011444" assignedBy="Avishi Pandey" assignedTo="Avishi Pandey" schDate="Apr 1, 2026, 12:46:36 PM" title="Call At Apr 1, 2026, 12:46 Pm" onLeadClick={(lead) => { setSelectedLeadName(lead); setTaskLeadDrawerOpen(true); }} onUpdateClick={(payload) => setTaskEditData(payload)} />
                    <TaskTableRow no="9" date="Apr 1, 2026, 12:06:29 PM" lead="Narendra Na" mobile="+91-7738028305" assignedBy="Avishi Pandey" assignedTo="Avishi Pandey" schDate="Apr 1, 2026, 1:00:56 PM" title="Call At Apr 1, 2026, 1:00 Pm" onLeadClick={(lead) => { setSelectedLeadName(lead); setTaskLeadDrawerOpen(true); }} onUpdateClick={(payload) => setTaskEditData(payload)} />
                    <TaskTableRow no="10" date="Apr 1, 2026, 12:11:50 PM" lead="Arun Rajoriya" mobile="+91-9424787840" assignedBy="Avishi Pandey" assignedTo="Avishi Pandey" schDate="Apr 1, 2026, 1:01:20 PM" title="Call At Apr 1, 2026, 1:01 Pm" onLeadClick={(lead) => { setSelectedLeadName(lead); setTaskLeadDrawerOpen(true); }} onUpdateClick={(payload) => setTaskEditData(payload)} />
                    <TaskTableRow no="11" date="Apr 1, 2026, 11:11:48 AM" lead="Santoshdevjichougule Na" mobile="+91-7975178292" assignedBy="Sakshi Pagare" assignedTo="Sakshi Pagare" schDate="Apr 1, 2026, 1:11:00 PM" title="Followp Task With Santoshdevjichou..." onLeadClick={(lead) => { setSelectedLeadName(lead); setTaskLeadDrawerOpen(true); }} onUpdateClick={(payload) => setTaskEditData(payload)} />
                    <TaskTableRow no="12" date="Apr 1, 2026, 11:53:28 AM" lead="Pathan Afjalkhan Alamkhan" mobile="+1-5392792428" assignedBy="Sakshi Pagare" assignedTo="Sakshi Pagare" schDate="Apr 1, 2026, 1:23:22 PM" title="Call At Apr 1, 2026, 1:23 Pm" onLeadClick={(lead) => { setSelectedLeadName(lead); setTaskLeadDrawerOpen(true); }} onUpdateClick={(payload) => setTaskEditData(payload)} />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Site Visit' && (
          <div className="space-y-6">
            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-md border border-gray-100 shadow-sm">
              <MetricCard title="Today's Site Visit" value="0" />
              <MetricCard title="Upcoming Site Visit" value="0" />
              <MetricCard title="Pending Site Visit" value="0" />
              <MetricCard title="Completed Site Visit" value="1" />
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-md border border-gray-100 shadow-sm space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 bg-[#4c51bf] hover:bg-[#434190] cursor-pointer text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors shadow-sm">
                  1 <User className="w-3.5 h-3.5 fill-current" />
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <FilterSelect label="Project" placeholder="Search & Select Project" />
                <FilterSelect label="Lead Source" placeholder="Select Source" />
                <FilterSelect label="Pre Sales Agent" placeholder="Select Pre Sales Agent" />
                <FilterSelect label="Teams" placeholder="Select Team" />
                <FilterSelect label="Assigned To" placeholder="Select Sales Agent" />
                <FilterSelect label="Channel Partner" placeholder="Search & Select Channel Partner" />
                
                <FilterSelect label="Sourcing Manager" placeholder="Select Sourcing Manager" />
                <FilterSelect label="Status" placeholder="Select Status" />
                <FilterSelect label="Site Visit Status" placeholder="Select Site Visit Status" />
                <FilterSelect label="Select Site Visit Type" placeholder="Select Site Visit Type" />
                <FilterSelect label="Entity Type" placeholder="Select Entity Type" />
                <FilterSelect label="Assigned By" placeholder="Select Sales Agent" />
                
                <FilterSelect label="Visit Frequency" placeholder="Select Visit Frequency" />
                <FilterSelect label="CP Present" placeholder="All" />
                <FilterSelect label="Date Range" placeholder="Current Month" />
              </div>

              <div className="flex flex-wrap justify-end items-center gap-2 pt-4 mt-4 border-t border-gray-100">
                <button suppressHydrationWarning className="bg-[#1a56db] hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors">Search</button>
                <button suppressHydrationWarning className="bg-[#1a56db] hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors">Clear</button>
                <button suppressHydrationWarning
                  className="bg-[#1a56db] hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
                  onClick={() => setIsSiteVisitModalOpen(true)}
                >
                  Add
                </button>
                <button
                  suppressHydrationWarning
                  className="bg-[#1a56db] hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
                  onClick={() => {
                    setShowSiteVisitAnalysis((isVisible) => {
                      const nextVisible = !isVisible;
                      if (nextVisible) {
                        setSiteVisitAnalysisView("chart");
                      }
                      return nextVisible;
                    });
                  }}
                >
                  Analysis
                </button>
                <div className="relative group">
                  <button suppressHydrationWarning className="border border-[#1a56db] text-[#1a56db] p-1.5 rounded flex items-center justify-center hover:bg-blue-50 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg py-1 hidden group-hover:block z-50 min-w-[160px]">
                    <button suppressHydrationWarning className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <Download className="w-4 h-4 text-gray-600" /> Table Download
                    </button>
                    <button suppressHydrationWarning className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <Download className="w-4 h-4 text-gray-600" /> Bulk Download
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {showSiteVisitAnalysis && (
              <SiteVisitAnalysisReport
                view={siteVisitAnalysisView}
                onToggleView={() =>
                  setSiteVisitAnalysisView((currentView) => (currentView === "chart" ? "table" : "chart"))
                }
              />
            )}

            {/* Table Area */}
            <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden">
              {/* Table Header Controls */}
              <div className="p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                <div className="flex rounded border border-gray-300 overflow-hidden text-sm shadow-sm">
                  <button suppressHydrationWarning className="px-3 py-1.5 bg-gray-50 text-gray-500 hover:bg-gray-100 border-r border-gray-300 transition-colors">Previous</button>
                  <button suppressHydrationWarning className="px-3 py-1.5 bg-[#1a56db] text-white border-r border-[#1a56db]">1</button>
                  <button suppressHydrationWarning className="px-3 py-1.5 text-[#1a56db] hover:bg-blue-50 transition-colors">Next</button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <select suppressHydrationWarning className="border border-gray-300 rounded shadow-sm text-sm px-3 py-1.5 text-gray-500 outline-none w-40 appearance-none bg-white">
                      <option>Select Columns</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="flex border border-gray-300 shadow-sm rounded overflow-hidden">
                    <input suppressHydrationWarning type="text" placeholder="Search" className="px-3 py-1.5 text-sm outline-none w-48 text-gray-600" />
                    <button suppressHydrationWarning className="bg-[#5978de] text-white px-3 py-1.5 flex items-center justify-center hover:bg-blue-600 transition-colors">
                      <Search className="w-4 h-4" />
                    </button>
                    <button suppressHydrationWarning className="bg-gray-100 text-gray-500 px-3 py-1.5 border-l border-gray-300 flex items-center justify-center hover:bg-gray-200 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative">
                    <select suppressHydrationWarning className="border border-gray-300 rounded shadow-sm text-sm px-3 py-1.5 text-gray-700 outline-none w-16 appearance-none bg-white">
                      <option>20</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-white text-gray-700 font-bold border-b border-gray-200 text-[12px] uppercase tracking-wide">
                    <tr>
                      <th className="py-3 px-4 w-10 border-r border-gray-100"><input suppressHydrationWarning type="checkbox" className="rounded border-gray-300" /></th>
                      <th className="py-3 px-3 border-r border-gray-100">#</th>
                      <th className="py-3 px-4 border-r border-gray-100">CREATED DATE</th>
                      <th className="py-3 px-4 border-r border-gray-100">LEAD</th>
                      <th className="py-3 px-4 border-r border-gray-100">MOBILE</th>
                      <th className="py-3 px-4 border-r border-gray-100">TYPE</th>
                      <th className="py-3 px-4 border-r border-gray-100">VISIT FREQUENCY</th>
                      <th className="py-3 px-4 border-r border-gray-100">PROJECT</th>
                      <th className="py-3 px-4 border-r border-gray-100">SCHEDULE DATE</th>
                      <th className="py-3 px-4 border-r border-gray-100">TITLE</th>
                      <th className="py-3 px-4 border-r border-gray-100 whitespace-nowrap">REMARK</th>
                      <th className="py-3 px-4 border-r border-gray-100 whitespace-nowrap">ASSIGNED BY</th>
                      <th className="py-3 px-4 border-r border-gray-100 whitespace-nowrap">ASSIGNED TO</th>
                      <th className="py-3 px-4 border-r border-gray-100 whitespace-nowrap">PRE SALES AGENT</th>
                      <th className="py-3 px-4 border-r border-gray-100 whitespace-nowrap">CHANNEL PARTNER</th>
                      <th className="py-3 px-4 border-r border-gray-100 whitespace-nowrap">IS CP PRESENT</th>
                      <th className="py-3 px-4 border-r border-gray-100 whitespace-nowrap">SOURCING AGENT</th>
                      <th className="py-3 px-4 border-r border-gray-100 whitespace-nowrap">VISIT TYPE</th>
                      <th className="py-3 px-4 border-r border-gray-100 whitespace-nowrap">STAGE</th>
                      <th className="py-3 px-4 border-r border-gray-100 whitespace-nowrap">SOURCE</th>
                      <th className="py-3 px-4 border-r border-gray-100 whitespace-nowrap">FEEDBACK STATUS</th>
                      <th className="py-3 px-4 border-r border-gray-100 whitespace-nowrap">FEEDBACK</th>
                      <th className="py-3 px-4 border-r border-gray-100 whitespace-nowrap">STATUS</th>
                      <th className="py-3 px-4 border-r border-gray-100 whitespace-nowrap">COMPLETED ON</th>
                      <th className="py-3 px-4 border-r border-gray-100 whitespace-nowrap">COMPLETED BY</th>
                      <th className="py-3 px-4 whitespace-nowrap">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <SiteVisitTableRow 
                      no="1" 
                      date="Apr 22, 2026, 10:55:10 AM" 
                      lead="Ghansham D Ghorpade" 
                      mobile="+91-9867069534" 
                      frequency="" 
                      project="BALAJI SYMPHONY" 
                      schDate="Apr 22, 2026, 10:51:43 AM" 
                      title="Visit at Apr 22, 2026, 10:5..." 
                      remark="2bhk Booked In Tower D (..." 
                      assignedBy="Kajal Jadhav"
                      assignedTo="Kajal Jadhav" 
                      preSalesAgent=""
                      channelPartner=""
                      isCpPresent=""
                      sourcingAgent=""
                      visitType="VISIT"
                      stage="BOOKED"
                      source="IG"
                      feedbackStatus="Conducted"
                      feedback="1L token done"
                      status="Completed"
                      completedOn="Apr 22, 2026, 10:55 AM"
                      completedBy="Kajal Jadhav"
                      onLeadClick={(lead) => { setSelectedLeadName(lead); setTaskLeadDrawerOpen(true); }}
                    />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Calendar' && (
          <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-700">Calendar</h2>
              <button
                suppressHydrationWarning
                onClick={() => setIsCalendarAddModalOpen(true)}
                className="bg-[#1a56db] hover:bg-blue-700 text-white px-5 py-1.5 rounded text-sm font-medium transition-colors shadow-sm"
              >
                Add
              </button>
            </div>
            
            {/* Sub-header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/30">
              <div className="flex rounded border border-[#1a56db] overflow-hidden text-sm shadow-sm">
                <button suppressHydrationWarning 
                  className={`px-4 py-1.5 font-medium transition-colors ${calendarView === 'Month' ? 'bg-[#1a56db] text-white' : 'text-[#1a56db] bg-white border-r border-[#1a56db] hover:bg-blue-50'}`}
                  onClick={() => setCalendarView('Month')}
                >Month</button>
                <button suppressHydrationWarning 
                  className={`px-4 py-1.5 font-medium transition-colors ${calendarView === 'Week' ? 'bg-[#1a56db] text-white' : 'text-[#1a56db] bg-white border-r border-[#1a56db] hover:bg-blue-50'}`}
                  onClick={() => setCalendarView('Week')}
                >Week</button>
                <button suppressHydrationWarning 
                  className={`px-4 py-1.5 font-medium transition-colors ${calendarView === 'Day' ? 'bg-[#1a56db] text-white' : 'text-[#1a56db] bg-white hover:bg-blue-50'}`}
                  onClick={() => setCalendarView('Day')}
                >Day</button>
              </div>
              
              <div className="font-semibold text-gray-700 text-[15px]">
                {calendarView === 'Day' && '25 April 2026'}
                {calendarView === 'Week' && '19 Apr - 25 Apr 2026'}
                {calendarView === 'Month' && 'April 2026'}
              </div>
              
              <div className="flex rounded border border-[#1a56db] overflow-hidden text-sm shadow-sm">
                <button suppressHydrationWarning className="px-4 py-1.5 text-[#1a56db] bg-white border-r border-[#1a56db] hover:bg-blue-50 transition-colors font-medium">Previous</button>
                <button suppressHydrationWarning className="px-4 py-1.5 text-[#1a56db] bg-white border-r border-[#1a56db] hover:bg-blue-50 transition-colors font-medium">Today</button>
                <button suppressHydrationWarning className="px-4 py-1.5 text-[#1a56db] bg-white hover:bg-blue-50 transition-colors font-medium">Next</button>
              </div>
            </div>

            {/* View Area */}
            {calendarView === 'Day' && (
              <div className="flex-1 overflow-y-auto bg-white min-h-[600px] relative pb-10">
                {/* 7 AM to 9 AM */}
                <TimeSlot time="7 AM" />
                <TimeSlot time="8 AM" />
                <TimeSlot time="9 AM" />
                
                {/* 10 AM */}
                <div className="relative border-t border-gray-200 min-h-[140px] flex">
                  <div className="w-16 shrink-0 py-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-100">10 AM</div>
                  <div className="flex-1 relative bg-white">
                    <div className="absolute inset-0 border-b border-gray-100 border-dashed top-1/2"></div>
                    <div className="relative z-10 p-1 space-y-1">
                      <CalendarEvent text="CALL | Prasad Na | Apr 25, 2026, 10:03:52 AM | Supriya Jadhav" />
                      <div className="flex gap-1">
                        <CalendarEvent text="CALL | Mohd Arif | Apr 25, 2026, 10:15:11 AM | Supriya Jadhav" className="flex-[0.6]" />
                        <CalendarEvent text="CALL | Vijay Patil | Apr 25, 2026, 10:15:39 AM | Supriya Jadhav" className="flex-[0.4]" />
                      </div>
                      <div className="flex gap-1">
                        <CalendarEvent text="CALL | Dada Sargar | Apr 25, 2026, 10:23:38 AM | Supriya Jadhav" className="flex-[0.6]" />
                        <CalendarEvent text="CALL | Anita Kunder | Apr 25, 2026, 10:26:34 AM | Supriya Jadhav" className="flex-[0.4]" />
                      </div>
                      <div className="flex gap-1 h-12">
                        <CalendarEvent text="CALL | Vijay Jaiswal | Apr 25, 2026, 10:48:00 AM | Ajay Jai..." className="flex-1" />
                        <CalendarEvent text="CALL | Jayshree Mahesh Patil | Apr 25, 2026, 10:50:00 A..." className="flex-1" />
                        <div className="flex-1 flex flex-col gap-1">
                          <CalendarEvent text="CALL | Bharat Shah | Apr 25, 2026, 10:37:07 AM | Supriya ..." className="flex-1" />
                          <CalendarEvent text="CALL | Satish Katkar | Apr 25, 2026, 10:59:00 AM | Ajay Ja..." className="flex-1" />
                        </div>
                        <CalendarEvent text="CALL | Sahil Munot | Apr 25, 2026, 11:00:00 AM | Ajay Jai..." className="flex-1" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 11 AM */}
                <div className="relative border-t border-gray-200 min-h-[140px] flex">
                  <div className="w-16 shrink-0 py-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-100">11 AM</div>
                  <div className="flex-1 relative bg-white">
                    <div className="absolute inset-0 border-b border-gray-100 border-dashed top-1/2"></div>
                    <div className="relative z-10 p-1 flex gap-1 h-full">
                      <div className="flex flex-col gap-1 flex-[0.3]">
                        <CalendarEvent text="CALL | Gunjan singh | Apr 25, 2026, 10:56:57 AM | Ajay Ja..." />
                        <CalendarEvent text="CALL | Susmita Patil | Apr 25, 2026, 11:01:42 AM | Ajay Ja..." />
                        <CalendarEvent text="CALL | Satish Katkar | Apr 25, 2026, 11:06:10 AM | Ajay Ja..." />
                        <CalendarEvent text="CALL | Mangesh T Sancar | Apr 25, 2026, 11:11:07 AM | Aj..." />
                      </div>
                      <CalendarEvent text="CALL | Rakesh Chitte | Apr 25, 2026, 11:14:00 AM | Ajay Jaiswal" className="flex-[0.7]" />
                    </div>
                  </div>
                </div>
                
                {/* 12 PM */}
                <div className="relative border-t border-gray-200 min-h-[120px] flex">
                  <div className="w-16 shrink-0 py-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-100">12 PM</div>
                  <div className="flex-1 relative bg-white">
                    <div className="absolute inset-0 border-b border-gray-100 border-dashed top-1/2"></div>
                    <div className="relative z-10 p-1 space-y-1">
                      <CalendarEvent text="CALL | Arvind Ramesh Tanpure | Apr 25, 2026, 12:37:00 PM | Ajay Jaiswal" className="h-10" />
                      <div className="flex gap-1">
                        <CalendarEvent text="CALL | Asim | Apr 25, 2026, 12:39:00 PM | Aniket Surwade" className="flex-1" />
                        <CalendarEvent text="CALL | Mahendra Patel | Apr 25, 2026, 12:40:00 PM | Supriya Jadhav" className="flex-1" />
                        <CalendarEvent text="CALL | Nilesh Monde | Apr 25, 2026, 12:40:00 PM | Supriya Jadhav" className="flex-1" />
                      </div>
                      <div className="flex gap-1">
                        <CalendarEvent text="CALL | Ratnakant Sawant | Apr 25, 2026, 12:50:00 PM | Sakshi Pagare" className="flex-1" />
                        <CalendarEvent text="CALL | Shane | Apr 25, 2026, 12:51:00 PM | Sakshi Pagare" className="flex-1" />
                        <CalendarEvent text="CALL | Pritam Dhende | Apr 25, 2026, 12:53:52 PM | Ajay Jaiswal" className="flex-1" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1 PM */}
                <div className="relative border-t border-gray-200 min-h-[100px] flex">
                  <div className="w-16 shrink-0 py-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-100">1 PM</div>
                  <div className="flex-1 relative bg-white">
                    <div className="absolute inset-0 border-b border-gray-100 border-dashed top-1/2"></div>
                    <div className="relative z-10 p-1 space-y-1">
                      <CalendarEvent text="CALL | Rupesh | Apr 25, 2026, 1:04:00 PM | Vishal Shukla" />
                      <div className="flex gap-1">
                        <CalendarEvent text="CALL | Gunjan singh | Apr 25, 2026, 1:09:55 PM | Ajay Jaiswal" className="flex-1" />
                        <CalendarEvent text="CALL | Krushna | Apr 25, 2026, 1:13:43 PM | Pranay Waghmare" className="flex-1 translate-y-3" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 2 PM */}
                <div className="relative border-t border-gray-200 min-h-[100px] flex">
                  {/* Red Time Indicator Line */}
                  <div className="absolute top-16 left-16 right-0 border-b border-red-500 z-20"></div>
                  
                  <div className="w-16 shrink-0 py-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-100">2 PM</div>
                  <div className="flex-1 relative bg-white">
                    <div className="absolute inset-0 border-b border-gray-100 border-dashed top-1/2"></div>
                    <div className="relative z-10 p-1 space-y-1">
                      <CalendarEvent text="CALL | Rajendransingh Na | Apr 25, 2026, 2:15:32 PM | Pranay Waghmare" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {calendarView === 'Week' && (
              <div className="flex-1 overflow-x-auto overflow-y-auto bg-white relative pb-10 min-h-[600px]">
                {/* Week Grid Header */}
                <div className="flex border-b border-gray-200 sticky top-0 bg-white z-30 shadow-sm text-center text-[13px] font-semibold">
                  <div className="w-16 shrink-0 border-r border-gray-100 py-3 bg-white"></div>
                  <div className="flex-1 py-3 border-r border-gray-100 min-w-[120px]">
                    <div className="text-gray-800">Sunday</div>
                    <div className="text-gray-400 font-normal mt-0.5">Apr 19</div>
                  </div>
                  <div className="flex-1 py-3 border-r border-gray-100 min-w-[120px]">
                    <div className="text-gray-800">Monday</div>
                    <div className="text-gray-400 font-normal mt-0.5">Apr 20</div>
                  </div>
                  <div className="flex-1 py-3 border-r border-gray-100 min-w-[120px]">
                    <div className="text-gray-800">Tuesday</div>
                    <div className="text-gray-400 font-normal mt-0.5">Apr 21</div>
                  </div>
                  <div className="flex-1 py-3 border-r border-gray-100 min-w-[120px]">
                    <div className="text-gray-800">Wednesday</div>
                    <div className="text-gray-400 font-normal mt-0.5">Apr 22</div>
                  </div>
                  <div className="flex-1 py-3 border-r border-gray-100 min-w-[120px]">
                    <div className="text-gray-800">Thursday</div>
                    <div className="text-gray-400 font-normal mt-0.5">Apr 23</div>
                  </div>
                  <div className="flex-1 py-3 border-r border-gray-100 min-w-[120px]">
                    <div className="text-gray-800">Friday</div>
                    <div className="text-gray-400 font-normal mt-0.5">Apr 24</div>
                  </div>
                  <div className="flex-1 py-3 bg-[#e8faee] min-w-[120px]">
                    <div className="text-gray-800">Saturday</div>
                    <div className="text-[#59b876] font-normal mt-0.5">Apr 25</div>
                  </div>
                </div>

                {/* Grid Body */}
                <div className="relative min-w-[900px]">
                  {/* Red Time Indicator Line at 3 PM approximate */}
                  <div className="absolute top-[850px] left-16 right-0 border-b border-red-500 z-20"></div>

                  {[7, 8, 9, 10, 11, 12, 1, 2, 3].map((hour) => (
                    <div key={hour} className="flex border-b border-gray-200 min-h-[100px] relative">
                      <div className="w-16 shrink-0 py-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-100 bg-white z-10">
                        {hour} {hour === 12 || hour < 6 ? 'PM' : 'AM'}
                      </div>
                      
                      {/* 7 Columns */}
                      {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                        <div key={day} className={`flex-1 border-r border-gray-100 relative p-1 ${day === 6 ? 'bg-[#e8faee]/30' : 'bg-white'}`}>
                          <div className="absolute inset-0 border-b border-gray-100 border-dashed top-1/2 pointer-events-none"></div>
                          
                          {/* Sample Events to simulate the density shown in screenshot */}
                          {hour === 10 && day === 3 && (
                            <div className="relative z-10 flex flex-wrap gap-1">
                               <CalendarEvent text="CALL | Govind Bishnoi" className="w-full" />
                               <div className="bg-[#bdf3cf] border border-[#7ed8a0] text-[#1e8a44] text-[11px] px-2 py-4 rounded font-medium mt-1 w-full text-center">SITE VISIT...</div>
                            </div>
                          )}
                          {hour === 11 && day === 1 && (
                            <div className="relative z-10 space-y-1">
                               <CalendarEvent text="CALL | Vinay Kumar" />
                               <CalendarEvent text="CALL | Puneet" />
                            </div>
                          )}
                          {hour === 12 && day === 0 && (
                            <div className="relative z-10 pt-4">
                               <CalendarEvent text="CALL | Ghansham D Ghorpade | Apr 19..." className="py-2" />
                            </div>
                          )}
                          {hour === 1 && day === 4 && (
                            <div className="relative z-10 space-y-1">
                               <CalendarEvent text="CALL | Jatin Gon..." />
                               <CalendarEvent text="CALL | Bhavin N..." />
                            </div>
                          )}
                          {hour === 2 && day === 6 && (
                            <div className="relative z-10 pt-6">
                               <CalendarEvent text="CALL | Rajendransingh Na | Apr 25, 2026..." />
                            </div>
                          )}
                          {hour === 3 && day === 0 && (
                            <div className="relative z-10 flex flex-wrap gap-1">
                               <CalendarEvent text="CAL..." className="w-8 h-8" />
                               <CalendarEvent text="CAL..." className="w-8 h-8" />
                               <CalendarEvent text="CAL..." className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {calendarView === 'Month' && (
              <div className="flex-1 overflow-x-auto overflow-y-auto bg-white relative min-h-[600px] flex flex-col">
                {/* Month Grid Header */}
                <div className="flex border-b border-gray-200 sticky top-0 bg-white z-30 shadow-sm text-center text-[13px] font-semibold">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                    <div key={day} className="flex-1 py-3 border-r border-gray-100 min-w-[140px] text-gray-700">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Month Grid Body */}
                <div className="flex-1 flex flex-col min-w-[980px]">
                  {[
                    // Row 1
                    [ { date: 29, type: 'prev', count: 66, hasGreen: false }, { date: 30, type: 'prev', count: 40, hasGreen: false }, { date: 31, type: 'prev', count: 38, hasGreen: true }, { date: 1, type: 'curr', count: 59, hasGreen: false }, { date: 2, type: 'curr', count: 52, hasGreen: false }, { date: 3, type: 'curr', count: 66, hasGreen: false }, { date: 4, type: 'curr', count: 87, hasGreen: false } ],
                    // Row 2
                    [ { date: 5, type: 'curr', count: 76, hasGreen: false }, { date: 6, type: 'curr', count: 60, hasGreen: false }, { date: 7, type: 'curr', count: 122, hasGreen: false }, { date: 8, type: 'curr', count: 114, hasGreen: false }, { date: 9, type: 'curr', count: 52, hasGreen: false }, { date: 10, type: 'curr', count: 109, hasGreen: false }, { date: 11, type: 'curr', count: 79, hasGreen: false } ],
                    // Row 3
                    [ { date: 12, type: 'curr', count: 48, hasGreen: false }, { date: 13, type: 'curr', count: 34, hasGreen: false }, { date: 14, type: 'curr', count: 65, hasGreen: false }, { date: 15, type: 'curr', count: 64, hasGreen: false }, { date: 16, type: 'curr', count: 78, hasGreen: false }, { date: 17, type: 'curr', count: 55, hasGreen: false }, { date: 18, type: 'curr', count: 30, hasGreen: false } ],
                    // Row 4
                    [ { date: 19, type: 'curr', count: 18, hasGreen: false }, { date: 20, type: 'curr', count: 5, hasGreen: false }, { date: 21, type: 'curr', count: 54, hasGreen: false }, { date: 22, type: 'curr', count: 67, hasGreen: true }, { date: 23, type: 'curr', count: 73, hasGreen: false }, { date: 24, type: 'curr', count: 71, hasGreen: false }, { date: 25, type: 'curr', count: 42, isToday: true, hasGreen: false } ],
                    // Row 5
                    [ { date: 26, type: 'curr', count: 1, hasGreen: false }, { date: 27, type: 'curr', count: 2, hasGreen: false }, { date: 28, type: 'curr', count: 8, hasGreen: false }, { date: 29, type: 'curr', count: 1, hasGreen: false }, { date: 30, type: 'curr', count: 5, hasGreen: false }, { date: 1, type: 'next', count: 3, hasGreen: false }, { date: 2, type: 'next', count: 0, hasGreen: false } ]
                  ].map((week, rowIdx) => (
                    <div key={rowIdx} className="flex flex-1 border-b border-gray-100 min-h-[160px]">
                      {week.map((day, colIdx) => (
                        <div key={colIdx} className={`flex-1 border-r border-gray-100 p-2 flex flex-col ${day.isToday ? 'bg-[#e8faee]' : 'bg-white'}`}>
                          <div className="flex justify-between items-start mb-2">
                            {day.count > 0 ? (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full text-white font-medium ${day.type === 'curr' || day.isToday ? 'bg-[#b94a4a]' : 'bg-[#e5a0a0]'}`}>
                                {day.count}
                              </span>
                            ) : <div></div>}
                            <span className={`text-[15px] ${day.type === 'curr' ? 'text-gray-400' : 'text-gray-200'} ${day.isToday ? 'text-[#b94a4a] text-[18px] font-semibold' : ''}`}>
                              {day.date}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-[4px] gap-y-[4px] mt-auto">
                            {Array.from({ length: day.count }).map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-[6px] h-[6px] rounded-full ${
                                  day.hasGreen && i === Math.floor(day.count / 2) ? 'bg-[#1e8a44]' : 
                                  (day.type === 'curr' || day.isToday ? 'bg-[#1a85ff]' : 'bg-[#a3cdff]')
                                }`}
                              ></div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {isTaskModalOpen && <CreateTaskModal open={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} canAssign={Boolean(taskPermissions?.assign)} />}
      {isCalendarAddModalOpen && <CalendarAddModal open={isCalendarAddModalOpen} onClose={() => setIsCalendarAddModalOpen(false)} />}
      {taskEditData && (
        <EditTaskModal
          open={Boolean(taskEditData)}
          data={taskEditData}
          canAssign={Boolean(taskPermissions?.reassign)}
          onClose={() => setTaskEditData(null)}
        />
      )}
      {isSiteVisitModalOpen && (
        <CreateSiteVisitModal open={isSiteVisitModalOpen} onClose={() => setIsSiteVisitModalOpen(false)} />
      )}
      {taskTableDownloadOpen ? (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-3 sm:p-4">
          <div className="flex max-h-[90vh] w-full max-w-[620px] flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-2xl font-semibold text-[#3a3f5a]">Export User-Task Data</h3>
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setTaskTableDownloadOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded border-2 border-gray-600 bg-white text-gray-700 hover:bg-gray-50"
                aria-label="Close export modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto px-6 py-5">
              <div>
                <label className="mb-2 block text-[17px] font-semibold text-[#3a3f5a]">File Name</label>
                <input
                  suppressHydrationWarning
                  value={taskExportFileName}
                  onChange={(e) => setTaskExportFileName(e.target.value)}
                  className="w-full rounded border border-gray-300 px-4 py-2.5 text-[22px] text-[#3a3f5a] outline-none focus:border-[#1a56db]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                <span className="text-[17px] font-semibold text-[#3a3f5a]">Show Details</span>
                <label className="inline-flex items-center gap-2 text-[20px] text-[#3a3f5a]">
                  <input
                    suppressHydrationWarning
                    type="radio"
                    name="task-show-details"
                    checked={taskExportShowDetails === "yes"}
                    onChange={() => setTaskExportShowDetails("yes")}
                    className="h-4 w-4 accent-[#b84fff]"
                  />
                  Yes
                </label>
                <label className="inline-flex items-center gap-2 text-[20px] text-[#3a3f5a]">
                  <input
                    suppressHydrationWarning
                    type="radio"
                    name="task-show-details"
                    checked={taskExportShowDetails === "no"}
                    onChange={() => setTaskExportShowDetails("no")}
                    className="h-4 w-4 accent-[#b84fff]"
                  />
                  No
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                <span className="text-[17px] font-semibold text-[#3a3f5a]">Select File Type</span>
                {(["xlsx", "csv", "pdf"] as const).map((t) => (
                  <label key={t} className="inline-flex items-center gap-2 text-[20px] text-[#3a3f5a]">
                    <input
                      suppressHydrationWarning
                      type="radio"
                      name="task-file-type"
                      checked={taskExportFileType === t}
                      onChange={() => setTaskExportFileType(t)}
                      className="h-4 w-4 accent-[#b84fff]"
                    />
                    {t.toUpperCase()}
                  </label>
                ))}
              </div>

              <div>
                <div className="mb-2 flex items-center gap-4">
                  <span className="text-[17px] font-semibold text-[#3a3f5a]">Select Columns</span>
                  <button
                    suppressHydrationWarning
                    type="button"
                    className="text-[16px] text-[#1a56db] hover:underline"
                    onClick={() => setTaskSelectedColumns(new Set(TASK_EXPORT_COLUMNS))}
                  >
                    Select All
                  </button>
                  <button
                    suppressHydrationWarning
                    type="button"
                    className="text-[16px] text-[#1a56db] hover:underline"
                    onClick={() => setTaskSelectedColumns(new Set())}
                  >
                    Clear All
                  </button>
                </div>

                <div className="overflow-hidden rounded border border-gray-300">
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => setTaskExportColumnsOpen((v) => !v)}
                    className="flex w-full items-center justify-between border-b border-gray-200 bg-white px-3 py-2 text-left"
                  >
                    <span className="rounded bg-blue-50 px-2 py-1 text-[16px] text-[#1f2f4d]">{taskSelectedColumns.size} columns are selected</span>
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${taskExportColumnsOpen ? "rotate-180" : ""}`} />
                  </button>
                  {taskExportColumnsOpen ? (
                    <div className="max-h-[300px] overflow-y-auto">
                      {TASK_EXPORT_COLUMNS.map((col) => {
                        const checked = taskSelectedColumns.has(col);
                        return (
                          <label
                            key={col}
                            className={`flex cursor-pointer items-center gap-3 border-b border-gray-100 px-4 py-2.5 text-[24px] text-[#2e344f] last:border-b-0 ${checked ? "bg-[#f4f9ff]" : "bg-white"}`}
                          >
                            <input
                              suppressHydrationWarning
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setTaskSelectedColumns((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(col)) next.delete(col);
                                  else next.add(col);
                                  return next;
                                });
                              }}
                              className="h-5 w-5 rounded border-gray-300 accent-[#1565d8]"
                            />
                            {col}
                          </label>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setTaskTableDownloadOpen(false)}
                className="rounded border-2 border-[#1a56db] bg-white px-5 py-2 text-[28px] font-medium text-[#1a56db] hover:bg-blue-50"
              >
                Cancel
              </button>
              <button
                suppressHydrationWarning
                type="button"
                className="rounded bg-[#1a56db] px-5 py-2 text-[28px] font-medium text-white hover:bg-blue-700"
              >
                Export Your Data
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <TaskLeadInfoDrawer open={taskLeadDrawerOpen} onClose={() => setTaskLeadDrawerOpen(false)} leadName={selectedLeadName} />
    </div>
  );
}

type TaskAnalysisDatum = {
  salesAgent: string;
  overdue: number;
  upcoming: number;
  completed: number;
};

const TASK_ANALYSIS_DATA: TaskAnalysisDatum[] = [
  { salesAgent: "Sakshi Pagare", overdue: 60, upcoming: 7, completed: 151 },
  { salesAgent: "Pranay Waghmare", overdue: 116, upcoming: 6, completed: 251 },
  { salesAgent: "Vishal Shukla", overdue: 23, upcoming: 0, completed: 4 },
  { salesAgent: "Kajal Jadhav", overdue: 49, upcoming: 1, completed: 214 },
  { salesAgent: "Avishi Pandey", overdue: 93, upcoming: 1, completed: 221 },
  { salesAgent: "Ajay Jaiswal", overdue: 142, upcoming: 5, completed: 204 },
  { salesAgent: "Aniket Surwade", overdue: 29, upcoming: 0, completed: 7 },
  { salesAgent: "Arbaaz Patel", overdue: 7, upcoming: 1, completed: 13 },
  { salesAgent: "Priya Jagtap", overdue: 3, upcoming: 1, completed: 5 },
];

const SITE_VISIT_ANALYSIS_DATA: TaskAnalysisDatum[] = [
  { salesAgent: "Kajal Jadhav", overdue: 0, upcoming: 0, completed: 1 },
];

function TaskAnalysisReport({
  view,
  onToggleView,
}: {
  view: "chart" | "table";
  onToggleView: () => void;
}) {
  const maxTotal = Math.max(...TASK_ANALYSIS_DATA.map((item) => item.overdue + item.upcoming + item.completed), 1);
  const yAxisMax = Math.ceil(maxTotal / 50) * 50;
  const yTicks = Array.from({ length: yAxisMax / 50 + 1 }, (_, index) => yAxisMax - index * 50);

  return (
    <div className="rounded-md border border-gray-100 bg-white shadow-sm">
      <div className="flex justify-end gap-3 px-5 pt-4">
        {view === "table" && (
          <button suppressHydrationWarning className="inline-flex items-center gap-2 rounded bg-[#19c6a6] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#14b293]">
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        )}
        <button suppressHydrationWarning
          type="button"
          onClick={onToggleView}
          className="rounded border border-gray-300 p-1.5 text-gray-600 transition-colors hover:bg-gray-100"
          title={view === "chart" ? "Show table report" : "Show chart report"}
          aria-label={view === "chart" ? "Show table report" : "Show chart report"}
        >
          {view === "chart" ? <Menu className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
        </button>
      </div>

      {view === "chart" ? (
        <div className="px-4 pb-5 pt-2">
          <h3 className="mb-6 text-center text-xl font-medium text-gray-700">Task Analysis</h3>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[52px_1fr_130px]">
            <div className="relative hidden h-[340px] lg:block">
              <span className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-xs text-gray-600">
                Completed/Pending/Upcoming
              </span>
              {yTicks.map((tick) => (
                <span
                  key={tick}
                  className="absolute right-0 -translate-y-1/2 text-[11px] text-gray-500"
                  style={{ top: `${100 - (tick / yAxisMax) * 100}%` }}
                >
                  {tick}
                </span>
              ))}
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[820px]">
                <div className="relative h-[340px] border-b border-gray-300">
                  {yTicks
                    .filter((tick) => tick !== 0)
                    .map((tick) => (
                      <div
                        key={tick}
                        className="absolute left-0 right-0 border-t border-gray-100"
                        style={{ top: `${100 - (tick / yAxisMax) * 100}%` }}
                      />
                    ))}

                  <div className="absolute inset-0 flex items-end gap-4 px-3">
                    {TASK_ANALYSIS_DATA.map((item) => {
                      const total = item.overdue + item.upcoming + item.completed;
                      const totalHeight = (total / yAxisMax) * 100;
                      const completedHeight = (item.completed / yAxisMax) * 100;
                      const overdueHeight = (item.overdue / yAxisMax) * 100;
                      const upcomingHeight = (item.upcoming / yAxisMax) * 100;

                      return (
                        <div key={item.salesAgent} className="flex min-w-[72px] flex-1 flex-col items-center justify-end">
                          <div
                            className="flex w-full flex-col overflow-hidden rounded-sm border border-gray-200 shadow-sm"
                            style={{ height: `${totalHeight}%` }}
                          >
                            <div
                              className="flex items-center justify-center bg-[#3e5b7a] text-[11px] text-white"
                              style={{ height: `${completedHeight}%` }}
                            >
                              {item.completed >= 10 ? item.completed : ""}
                            </div>
                            <div
                              className="flex items-center justify-center bg-[#e4544f] text-[11px] text-white"
                              style={{ height: `${overdueHeight}%` }}
                            >
                              {item.overdue >= 10 ? item.overdue : item.overdue > 0 ? item.overdue : ""}
                            </div>
                            <div
                              className="flex items-center justify-center bg-[#d9d9d9] text-[11px] text-gray-700"
                              style={{ height: `${upcomingHeight}%` }}
                            >
                              {item.upcoming > 0 ? item.upcoming : ""}
                            </div>
                          </div>
                          <p className="mt-2 w-full truncate text-center text-[11px] text-gray-600" title={item.salesAgent}>
                            {item.salesAgent}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="min-w-[130px] space-y-1 pt-2 text-xs text-gray-700">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 bg-[#d9d9d9]" />
                Upcoming
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 bg-[#e4544f]" />
                Over Due
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 bg-[#3e5b7a]" />
                Completed
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 pb-5 pt-2">
          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="w-full min-w-[880px] text-left text-[13px] text-gray-700">
              <thead className="bg-gray-50 text-[12px] font-semibold uppercase text-gray-600">
                <tr>
                  <th className="border-b border-gray-200 px-3 py-2">#</th>
                  <th className="border-b border-gray-200 px-3 py-2">Sales Agent</th>
                  <th className="border-b border-gray-200 px-3 py-2">Overdue Task</th>
                  <th className="border-b border-gray-200 px-3 py-2">Upcoming Task</th>
                  <th className="border-b border-gray-200 px-3 py-2">Completed Task</th>
                  <th className="border-b border-gray-200 px-3 py-2">Total Task</th>
                </tr>
              </thead>
              <tbody>
                {[...TASK_ANALYSIS_DATA]
                  .reverse()
                  .map((item, index) => {
                    const total = item.overdue + item.upcoming + item.completed;
                    return (
                      <tr key={item.salesAgent} className="hover:bg-gray-50">
                        <td className="border-b border-gray-100 px-3 py-2">{index + 1}</td>
                        <td className="border-b border-gray-100 px-3 py-2">{item.salesAgent}</td>
                        <td className="border-b border-gray-100 px-3 py-2">{item.overdue}</td>
                        <td className="border-b border-gray-100 px-3 py-2">{item.upcoming}</td>
                        <td className="border-b border-gray-100 px-3 py-2">{item.completed}</td>
                        <td className="border-b border-gray-100 px-3 py-2">{total}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SiteVisitAnalysisReport({
  view,
  onToggleView,
}: {
  view: "chart" | "table";
  onToggleView: () => void;
}) {
  const maxTotal = Math.max(...SITE_VISIT_ANALYSIS_DATA.map((item) => item.overdue + item.upcoming + item.completed), 1);
  const yAxisMax = Math.max(1, Math.ceil(maxTotal));
  const yTicks = [1, 0];

  return (
    <div className="rounded-md border border-gray-100 bg-white shadow-sm">
      <div className="flex justify-end gap-3 px-5 pt-4">
        {view === "table" && (
          <button suppressHydrationWarning className="inline-flex items-center gap-2 rounded bg-[#19c6a6] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#14b293]">
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        )}
        <button suppressHydrationWarning
          type="button"
          onClick={onToggleView}
          className="rounded border border-gray-300 p-1.5 text-gray-600 transition-colors hover:bg-gray-100"
          title={view === "chart" ? "Show table report" : "Show chart report"}
          aria-label={view === "chart" ? "Show table report" : "Show chart report"}
        >
          {view === "chart" ? <Menu className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
        </button>
      </div>

      {view === "chart" ? (
        <div className="px-4 pb-5 pt-2">
          <h3 className="mb-6 text-center text-lg font-medium text-gray-700">Site Visit Analysis</h3>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[52px_1fr_130px]">
            <div className="relative hidden h-[300px] lg:block">
              <span className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-xs text-gray-600">
                Completed/Pending/Upcoming
              </span>
              {yTicks.map((tick) => (
                <span
                  key={tick}
                  className="absolute right-0 -translate-y-1/2 text-[11px] text-gray-500"
                  style={{ top: `${100 - (tick / yAxisMax) * 100}%` }}
                >
                  {tick}
                </span>
              ))}
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[560px]">
                <div className="relative h-[300px] border-b border-gray-300">
                  <div className="absolute inset-0 flex items-end justify-center px-6">
                    {SITE_VISIT_ANALYSIS_DATA.map((item) => {
                      const total = item.overdue + item.upcoming + item.completed;
                      const totalHeight = (total / yAxisMax) * 100;
                      return (
                        <div key={item.salesAgent} className="flex w-full max-w-[620px] flex-col items-center justify-end">
                          <div
                            className="flex w-full items-start justify-center rounded-sm border border-gray-200 bg-[#3e5b7a] pt-1 text-[11px] text-white shadow-sm"
                            style={{ height: `${Math.max(totalHeight, 2)}%` }}
                          >
                            {item.completed}
                          </div>
                          <p className="mt-2 w-full truncate text-center text-[11px] text-gray-600" title={item.salesAgent}>
                            {item.salesAgent}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="min-w-[130px] space-y-1 pt-2 text-xs text-gray-700">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 bg-[#d9d9d9]" />
                Upcoming
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 bg-[#e4544f]" />
                Over Due
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 bg-[#3e5b7a]" />
                Completed
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 pb-5 pt-2">
          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="w-full min-w-[880px] text-left text-[13px] text-gray-700">
              <thead className="bg-gray-50 text-[12px] font-semibold uppercase text-gray-600">
                <tr>
                  <th className="border-b border-gray-200 px-3 py-2">#</th>
                  <th className="border-b border-gray-200 px-3 py-2">Sales Agent</th>
                  <th className="border-b border-gray-200 px-3 py-2">Overdue Site Visit</th>
                  <th className="border-b border-gray-200 px-3 py-2">Upcoming Site Visit</th>
                  <th className="border-b border-gray-200 px-3 py-2">Completed Site Visit</th>
                  <th className="border-b border-gray-200 px-3 py-2">Total Site Visit</th>
                </tr>
              </thead>
              <tbody>
                {SITE_VISIT_ANALYSIS_DATA.map((item, index) => {
                  const total = item.overdue + item.upcoming + item.completed;
                  return (
                    <tr key={item.salesAgent} className="hover:bg-gray-50">
                      <td className="border-b border-gray-100 px-3 py-2">{index + 1}</td>
                      <td className="border-b border-gray-100 px-3 py-2">{item.salesAgent}</td>
                      <td className="border-b border-gray-100 px-3 py-2">{item.overdue}</td>
                      <td className="border-b border-gray-100 px-3 py-2">{item.upcoming}</td>
                      <td className="border-b border-gray-100 px-3 py-2">{item.completed}</td>
                      <td className="border-b border-gray-100 px-3 py-2">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateTaskModal({ open, onClose, canAssign }: { open: boolean; onClose: () => void; canAssign: boolean }) {
  const queryClient = useQueryClient();
  const [activityType, setActivityType] = useState("Call");
  const [salesAgent, setSalesAgent] = useState("");
  const [lead, setLead] = useState("");
  const [title, setTitle] = useState("Call at Apr 25, 2026, 7:53 PM");
  const [remark, setRemark] = useState("");
  const [remindMe, setRemindMe] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [dueDate, setDueDate] = useState("Apr 25, 2026, 7:53 PM");
  const [reminder, setReminder] = useState("15 Minute");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const { data: leadsData } = useQuery({
    queryKey: ["tasks-modal", "leads"],
    queryFn: () =>
      request<{ leads: Array<{ id: string; name: string }> }>("/api/leads", {
        method: "GET",
        retries: 1,
      }),
    enabled: open,
  });

  const { data: usersData } = useQuery({
    queryKey: ["tasks-modal", "users"],
    queryFn: () =>
      request<{ users: Array<{ id: string; name: string }> }>("/api/users", {
        method: "GET",
        retries: 1,
      }),
    enabled: open && canAssign,
  });

  useEffect(() => {
    if (!open) return;
    if (canAssign && usersData?.users?.length && !salesAgent) {
      setSalesAgent(usersData.users[0].id);
    }
  }, [open, canAssign, usersData, salesAgent]);

  const createTaskMutation = useMutation({
    mutationFn: (payload: {
      title: string;
      description?: string | null;
      leadId: string;
      assignedToId?: string | null;
      priority?: "LOW" | "MEDIUM" | "HIGH";
      status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
      dueDate: string;
      reminderTime?: string | null;
    }) => tasksApi.create(payload),
    onSuccess: async () => {
      setFormSuccess("Task created successfully.");
      setFormError(null);
      await invalidateTasksModuleQueries(queryClient);
      setTimeout(() => {
        setFormSuccess(null);
        onClose();
      }, 600);
    },
    onError: (error: unknown) => {
      setFormSuccess(null);
      setFormError(error instanceof Error ? error.message : "Failed to create task.");
    },
  });

  const parseDateToIso = (value: string) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  };

  const computeReminderIso = (dueIso: string) => {
    const due = new Date(dueIso).getTime();
    const offsets: Record<string, number> = {
      "15 Minute": 15 * 60 * 1000,
      "30 Minute": 30 * 60 * 1000,
      "1 Hour": 60 * 60 * 1000,
      "1 Day": 24 * 60 * 60 * 1000,
    };
    const offset = offsets[reminder] ?? 15 * 60 * 1000;
    return new Date(due - offset).toISOString();
  };

  const handleSubmit = () => {
    setFormError(null);
    setFormSuccess(null);

    if (!lead) {
      setFormError("Please select a lead.");
      return;
    }

    const dueIso = parseDateToIso(dueDate);
    if (!dueIso) {
      setFormError("Please enter a valid due date.");
      return;
    }

    createTaskMutation.mutate({
      title: title.trim(),
      description: remark.trim() ? remark.trim() : null,
      leadId: lead,
      assignedToId: canAssign && salesAgent ? salesAgent : null,
      priority: "MEDIUM",
      status: completed ? "COMPLETED" : "PENDING",
      dueDate: dueIso,
      reminderTime: remindMe ? computeReminderIso(dueIso) : null,
    });
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[90] transition-all duration-300 ${open ? "pointer-events-auto bg-black/35" : "pointer-events-none bg-black/0"}`}
    >
      <button suppressHydrationWarning
        type="button"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
        aria-label="Close drawer backdrop"
      />
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-2xl overflow-hidden bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-[18px] font-semibold leading-none text-[#3a3f52]">Create Your Task</h2>
          <button suppressHydrationWarning
            type="button"
            onClick={onClose}
            className="rounded border border-gray-500 p-1 text-gray-600 transition-colors hover:bg-gray-100"
            aria-label="Close create task modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="h-[calc(100vh-142px)] space-y-6 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <ModalSelect
              label="Select Activity Type"
              value={activityType}
              onChange={(event) => setActivityType(event.target.value)}
              options={["Call", "Follow Up", "Meeting"]}
            />
            <ModalSelect
              label="Select Sales Agent"
              value={salesAgent}
              onChange={(event) => setSalesAgent(event.target.value)}
              options={(usersData?.users ?? []).map((u) => ({ value: u.id, label: u.name }))}
              disabled={!canAssign}
            />
          </div>

          <ModalSelect
            label="Select Lead"
            value={lead}
            onChange={(event) => setLead(event.target.value)}
            options={(leadsData?.leads ?? []).map((l) => ({ value: l.id, label: l.name }))}
            placeholder="Search & Select Lead"
          />

          <ModalTextInput
            label="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <div className="flex flex-col">
            <label className="mb-2 text-[15px] font-semibold text-[#3a3f52]">Remark</label>
            <textarea
              value={remark}
              onChange={(event) => setRemark(event.target.value)}
              placeholder="Enter Remark"
              rows={3}
              className="w-full rounded border border-gray-300 px-4 py-3 text-[15px] text-[#3a3f52] outline-none transition-colors focus:border-[#1a56db]"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <ModalToggle label="Remind me?" checked={remindMe} onChange={setRemindMe} />
            <ModalToggle label="Completed?" checked={completed} onChange={setCompleted} />
          </div>

          <div className="grid grid-cols-1 gap-5 pb-2 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="mb-2 text-[15px] font-semibold text-[#3a3f52]">Select Due Date</label>
              <div className="flex overflow-hidden rounded border border-gray-300">
                <input suppressHydrationWarning
                  type="text"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="w-full px-4 py-3 text-[15px] text-[#3a3f52] outline-none"
                />
                <button suppressHydrationWarning
                  type="button"
                  className="border-l border-gray-300 bg-gray-100 px-4 text-gray-600 transition-colors hover:bg-gray-200"
                  aria-label="Select due date"
                >
                  <CalendarDays className="h-6 w-6" />
                </button>
              </div>
            </div>
            <ModalSelect
              label="Reminder"
              value={reminder}
              onChange={(event) => setReminder(event.target.value)}
              options={["15 Minute", "30 Minute", "1 Hour", "1 Day"]}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4">
          {formError ? <span className="mr-auto text-sm text-rose-600">{formError}</span> : null}
          {formSuccess ? <span className="mr-auto text-sm text-emerald-600">{formSuccess}</span> : null}
          <button suppressHydrationWarning
            type="button"
            onClick={handleSubmit}
            disabled={createTaskMutation.isPending}
            className="bg-[#1a56db] px-6 py-2 text-[15px] font-medium text-white transition-colors hover:bg-blue-700"
          >
            {createTaskMutation.isPending ? "Submitting..." : "Submit"}
          </button>
          <button suppressHydrationWarning
            type="button"
            onClick={onClose}
            className="bg-[#d9dde4] px-6 py-2 text-[15px] font-medium text-[#3a3f52] transition-colors hover:bg-[#cdd2db]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function CalendarAddModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activityType, setActivityType] = useState("Call");
  const [salesAgent, setSalesAgent] = useState("Aman Dubey");
  const [lead, setLead] = useState("");
  const [title, setTitle] = useState("Call at Apr 28, 2026, 4:15 PM");
  const [remark, setRemark] = useState("");
  const [remindMe, setRemindMe] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [dueDate, setDueDate] = useState("Apr 28, 2026, 4:15 PM");
  const [reminder, setReminder] = useState("15 Minute");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/60 p-2">
      <div className="w-full max-w-[900px] rounded border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h4 className="text-4xl font-semibold text-[#3a3f52]">Add</h4>
          <button suppressHydrationWarning type="button" onClick={onClose} className="rounded border border-gray-600 p-1 text-gray-700 hover:bg-gray-100" aria-label="Close add calendar task modal">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="mb-2 text-[15px] font-semibold text-[#3a3f52]">Select Activity Type</label>
              <div className="relative">
                <input suppressHydrationWarning value={activityType} onChange={(event) => setActivityType(event.target.value)} className="w-full rounded border border-gray-300 px-4 py-3 pr-8 text-[15px] text-[#3a3f52] outline-none" />
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-[15px] font-semibold text-[#3a3f52]">Select Sales Agent</label>
              <div className="relative">
                <input suppressHydrationWarning value={salesAgent} onChange={(event) => setSalesAgent(event.target.value)} className="w-full rounded border border-gray-300 px-4 py-3 pr-14 text-[15px] text-[#3a3f52] outline-none" />
                <X className="pointer-events-none absolute right-8 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-[15px] font-semibold text-[#3a3f52]">Select Lead</label>
            <div className="relative">
              <input suppressHydrationWarning value={lead} onChange={(event) => setLead(event.target.value)} placeholder="Search & Select Lead" className="w-full rounded border border-gray-300 px-4 py-3 pr-8 text-[15px] text-[#3a3f52] outline-none" />
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <ModalTextInput label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />

          <div className="flex flex-col">
            <label className="mb-2 text-[15px] font-semibold text-[#3a3f52]">Remark</label>
            <textarea
              value={remark}
              onChange={(event) => setRemark(event.target.value)}
              placeholder="Enter Remark"
              rows={3}
              className="w-full rounded border border-gray-300 px-4 py-3 text-[15px] text-[#3a3f52] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <ModalToggle label="Remind me?" checked={remindMe} onChange={setRemindMe} />
            <ModalToggle label="Completed?" checked={completed} onChange={setCompleted} />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="mb-2 text-[15px] font-semibold text-[#3a3f52]">Select Due Date</label>
              <div className="flex overflow-hidden rounded border border-gray-300">
                <input suppressHydrationWarning value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="w-full px-4 py-3 text-[15px] text-[#3a3f52] outline-none" />
                <button suppressHydrationWarning type="button" className="border-l border-gray-300 bg-gray-100 px-4 text-gray-600 hover:bg-gray-200" aria-label="Select due date">
                  <CalendarDays className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-[15px] font-semibold text-[#3a3f52]">Reminder</label>
              <div className="relative">
                <input suppressHydrationWarning value={reminder} onChange={(event) => setReminder(event.target.value)} className="w-full rounded border border-gray-300 px-4 py-3 pr-14 text-[15px] text-[#3a3f52] outline-none" />
                <X className="pointer-events-none absolute right-8 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4">
          <button suppressHydrationWarning type="button" className="bg-[#1a56db] px-6 py-2 text-[15px] font-medium text-white hover:bg-blue-700">Submit</button>
          <button suppressHydrationWarning type="button" onClick={onClose} className="bg-[#d9dde4] px-6 py-2 text-[15px] font-medium text-[#3a3f52] hover:bg-[#cdd2db]">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function CreateSiteVisitModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activityType, setActivityType] = useState("Site Visit");
  const [salesAgent, setSalesAgent] = useState("Aman Dubey");
  const [project, setProject] = useState("");
  const [siteVisitType, setSiteVisitType] = useState("Visit");
  const [confirmation, setConfirmation] = useState("Confirmed");
  const [lead, setLead] = useState("");
  const [title, setTitle] = useState("Visit at Apr 26, 2026, 12:58 AM");
  const [remark, setRemark] = useState("");
  const [participants, setParticipants] = useState("");
  const [remindMe, setRemindMe] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [startDate, setStartDate] = useState("Apr 26, 2026, 12:58 AM");
  const [endDate, setEndDate] = useState("Apr 26, 2026, 1:28 AM");
  const [reminder, setReminder] = useState("15 Minute");

  if (!open) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[90] transition-all duration-300 ${
        open ? "pointer-events-auto bg-black/35" : "pointer-events-none bg-black/0"
      }`}
    >
      <button suppressHydrationWarning
        type="button"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
        aria-label="Close site visit drawer backdrop"
      />
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-4xl overflow-hidden bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-[18px] font-semibold leading-none text-[#3a3f52]">Create Site Visit</h2>
          <button suppressHydrationWarning
            type="button"
            onClick={onClose}
            className="rounded border border-gray-500 p-1 text-gray-600 transition-colors hover:bg-gray-100"
            aria-label="Close create site visit modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="h-[calc(100vh-142px)] space-y-5 overflow-y-auto px-6 py-5">
          <ModalSelect
            label="Select Activity Type"
            value={activityType}
            onChange={(event) => setActivityType(event.target.value)}
            options={["Site Visit"]}
          />

          <div className="rounded border border-gray-200 p-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_1fr_auto]">
              <ModalSelect
                label="Select Sales Agent"
                value={salesAgent}
                onChange={(event) => setSalesAgent(event.target.value)}
                options={["Aman Dubey", "Ajay Jaiswal", "Sakshi Pagare"]}
              />
              <ModalSelect
                label="Select Project"
                value={project}
                onChange={(event) => setProject(event.target.value)}
                options={["", "Balaji Symphony", "Silver Heights", "Prime Towers"]}
                placeholder="Search & Select Project"
              />
              <div className="flex flex-col">
                <label className="mb-2 text-[15px] font-semibold text-[#3a3f52]">Add Project</label>
                <button suppressHydrationWarning
                  type="button"
                  className="h-[50px] w-[50px] rounded bg-[#1a56db] text-white transition-colors hover:bg-blue-700"
                  aria-label="Add project"
                >
                  <Plus className="mx-auto h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
              <ModalSelect
                label="Select Site Visit Type"
                value={siteVisitType}
                onChange={(event) => setSiteVisitType(event.target.value)}
                options={["Visit", "Revisit"]}
              />
              <ModalSelect
                label="Confirmation"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                options={["Confirmed", "Tentative", "Not Confirmed"]}
              />
            </div>

            <div className="mt-4">
              <ModalSelect
                label="Select Lead"
                value={lead}
                onChange={(event) => setLead(event.target.value)}
                options={["", "Saumittra Mathur", "Ghanshyam Maniya", "Prakash Pandey"]}
                placeholder="Search & Select Lead"
              />
            </div>

            <div className="mt-4">
              <ModalTextInput label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>

            <div className="mt-4 flex flex-col">
              <label className="mb-2 text-[15px] font-semibold text-[#3a3f52]">Remark</label>
              <textarea
                value={remark}
                onChange={(event) => setRemark(event.target.value)}
                placeholder="Enter Remark"
                rows={3}
                className="w-full rounded border border-gray-300 px-4 py-3 text-[15px] text-[#3a3f52] outline-none transition-colors focus:border-[#1a56db]"
              />
            </div>

            <div className="mt-4">
              <ModalSelect
                label="Select Participants"
                value={participants}
                onChange={(event) => setParticipants(event.target.value)}
                options={["", "Aman Dubey", "Ajay Jaiswal", "Sakshi Pagare"]}
                placeholder="Select Participants"
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <ModalToggle label="Remind me?" checked={remindMe} onChange={setRemindMe} />
              <ModalToggle label="Mark As Completed?" checked={completed} onChange={setCompleted} />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="flex flex-col">
                <label className="mb-2 text-[15px] font-semibold text-[#3a3f52]">Select Start Date</label>
                <div className="flex overflow-hidden rounded border border-gray-300">
                  <input suppressHydrationWarning
                    type="text"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="w-full px-4 py-3 text-[15px] text-[#3a3f52] outline-none"
                  />
                  <button suppressHydrationWarning
                    type="button"
                    className="border-l border-gray-300 bg-gray-100 px-4 text-gray-600 transition-colors hover:bg-gray-200"
                    aria-label="Select start date"
                  >
                    <CalendarDays className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-[15px] font-semibold text-[#3a3f52]">Select End Date</label>
                <div className="flex overflow-hidden rounded border border-gray-300">
                  <input suppressHydrationWarning
                    type="text"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="w-full px-4 py-3 text-[15px] text-[#3a3f52] outline-none"
                  />
                  <button suppressHydrationWarning
                    type="button"
                    className="border-l border-gray-300 bg-gray-100 px-4 text-gray-600 transition-colors hover:bg-gray-200"
                    aria-label="Select end date"
                  >
                    <CalendarDays className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 max-w-[320px]">
              <ModalSelect
                label="Reminder"
                value={reminder}
                onChange={(event) => setReminder(event.target.value)}
                options={["15 Minute", "30 Minute", "1 Hour", "1 Day"]}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4">
          <button suppressHydrationWarning
            type="button"
            className="bg-[#1a56db] px-6 py-2 text-[15px] font-medium text-white transition-colors hover:bg-blue-700"
          >
            Submit
          </button>
          <button suppressHydrationWarning
            type="button"
            onClick={onClose}
            className="bg-[#d9dde4] px-6 py-2 text-[15px] font-medium text-[#3a3f52] transition-colors hover:bg-[#cdd2db]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  options: Array<string | { value: string; label: string }>;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 text-[15px] font-semibold text-[#3a3f52]">{label}</label>
      <div className="relative">
        <select suppressHydrationWarning
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full appearance-none rounded border border-gray-300 bg-white px-4 py-3 pr-10 text-[15px] text-[#3a3f52] outline-none transition-colors focus:border-[#1a56db] ${disabled ? "cursor-not-allowed bg-gray-100 text-gray-500" : ""}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options
            .filter((option) =>
              typeof option === "string" ? option.length > 0 : option.value.length > 0,
            )
            .map((option) => {
              const optionValue = typeof option === "string" ? option : option.value;
              const optionLabel = typeof option === "string" ? option : option.label;
              return (
                <option key={optionValue} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })
          }
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}

function ModalTextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 text-[15px] font-semibold text-[#3a3f52]">{label}</label>
      <input suppressHydrationWarning
        type="text"
        value={value}
        onChange={onChange}
        className="w-full rounded border border-gray-300 px-4 py-3 text-[15px] text-[#3a3f52] outline-none transition-colors focus:border-[#1a56db]"
      />
    </div>
  );
}

function ModalToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between pr-6">
      <span className="text-[15px] font-semibold text-[#3a3f52]">{label}</span>
      <button suppressHydrationWarning
        type="button"
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a56db]/40 ${
          checked ? "border-[#1a56db] bg-[#1a56db]" : "border-gray-300 bg-gray-300"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function EditTaskModal({ open, data, onClose, canAssign }: { open: boolean; data: TaskEditPayload; onClose: () => void; canAssign: boolean }) {
  const [activityType, setActivityType] = useState(data.activityType || "Call");
  const [salesAgent, setSalesAgent] = useState(data.salesAgent || "");
  const [lead, setLead] = useState(data.lead ? `${data.lead} (${data.salesAgent})` : "");
  const [title, setTitle] = useState(data.title || "");
  const [remark, setRemark] = useState("");
  const [remindMe, setRemindMe] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [dueDate, setDueDate] = useState(data.dueDate || "");
  const [reminder, setReminder] = useState("15 Minute");

  useEffect(() => {
    if (!open) return;
    setActivityType(data.activityType || "Call");
    setSalesAgent(data.salesAgent || "");
    setLead(data.lead ? `${data.lead} (${data.salesAgent})` : "");
    setTitle(data.title || "");
    setDueDate(data.dueDate || "");
    setRemark("");
    setRemindMe(true);
    setCompleted(false);
    setReminder("15 Minute");
  }, [open, data]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 p-2">
      <div className="w-full max-w-[900px] rounded border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h4 className="text-[38px] font-semibold text-[#3a3f52]">Edit Task For {data.lead}</h4>
          <button suppressHydrationWarning type="button" onClick={onClose} className="rounded border border-gray-600 p-1 text-gray-700 hover:bg-gray-100" aria-label="Close edit task modal">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="mb-2 text-[15px] font-semibold text-[#3a3f52]">Select Activity Type</label>
              <div className="relative">
                <input suppressHydrationWarning value={activityType} onChange={(event) => setActivityType(event.target.value)} className="w-full rounded border border-gray-300 px-4 py-3 pr-8 text-[15px] text-[#3a3f52] outline-none" />
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-[15px] font-semibold text-[#3a3f52]">Select Sales Agent</label>
              <div className="relative">
                <input suppressHydrationWarning value={salesAgent} onChange={(event) => setSalesAgent(event.target.value)} disabled={!canAssign} className={`w-full rounded border border-gray-300 px-4 py-3 pr-14 text-[15px] text-[#3a3f52] outline-none ${!canAssign ? "cursor-not-allowed bg-gray-100 text-gray-500" : ""}`} />
                <X className="pointer-events-none absolute right-8 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-[15px] font-semibold text-[#3a3f52]">Select Lead</label>
            <div className="relative">
              <input suppressHydrationWarning value={lead} onChange={(event) => setLead(event.target.value)} className="w-full rounded border border-gray-300 px-4 py-3 pr-14 text-[15px] text-[#3a3f52] outline-none" />
              <X className="pointer-events-none absolute right-8 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <ModalTextInput label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />

          <div className="flex flex-col">
            <label className="mb-2 text-[15px] font-semibold text-[#3a3f52]">Remark</label>
            <textarea
              value={remark}
              onChange={(event) => setRemark(event.target.value)}
              placeholder="Enter Remark"
              rows={3}
              className="w-full rounded border border-gray-300 px-4 py-3 text-[15px] text-[#3a3f52] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <ModalToggle label="Remind me?" checked={remindMe} onChange={setRemindMe} />
            <ModalToggle label="Completed?" checked={completed} onChange={setCompleted} />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="mb-2 text-[15px] font-semibold text-[#3a3f52]">Select Due Date</label>
              <div className="flex overflow-hidden rounded border border-gray-300">
                <input suppressHydrationWarning value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="w-full px-4 py-3 text-[15px] text-[#3a3f52] outline-none" />
                <button suppressHydrationWarning type="button" className="border-l border-gray-300 bg-gray-100 px-4 text-gray-600 hover:bg-gray-200" aria-label="Select due date">
                  <CalendarDays className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-[15px] font-semibold text-[#3a3f52]">Reminder</label>
              <div className="relative">
                <input suppressHydrationWarning value={reminder} onChange={(event) => setReminder(event.target.value)} className="w-full rounded border border-gray-300 px-4 py-3 pr-14 text-[15px] text-[#3a3f52] outline-none" />
                <X className="pointer-events-none absolute right-8 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4">
          <button suppressHydrationWarning type="button" className="bg-[#1a56db] px-6 py-2 text-[15px] font-medium text-white hover:bg-blue-700">Submit</button>
          <button suppressHydrationWarning type="button" onClick={onClose} className="bg-[#d9dde4] px-6 py-2 text-[15px] font-medium text-[#3a3f52] hover:bg-[#cdd2db]">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string, value: string }) {
  return (
    <div className="flex flex-col relative py-2 pl-4 pr-2">
      {/* Thick blue left border */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1a56db]"></div>
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[15px] text-gray-600 font-medium mb-2">{title}</p>
          <p className="text-xl font-semibold text-gray-700">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#e5efff] flex items-center justify-center text-blue-500 mt-1 shadow-sm">
          <User className="w-5 h-5 fill-current" />
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, placeholder }: { label: string, placeholder: string }) {
  return (
    <div className="flex flex-col">
      <label className="text-[13px] font-bold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <select suppressHydrationWarning className="w-full border border-gray-300 rounded shadow-sm text-[13px] px-3 py-2 text-gray-500 outline-none appearance-none bg-white">
          <option>{placeholder}</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function TaskTableRow({
  no,
  date,
  lead,
  mobile,
  assignedBy,
  assignedTo,
  schDate,
  title,
  onLeadClick,
  remark = "Task Autocompleted.",
  activityType = "CALL",
  stage = "OPEN",
  status = "Completed",
  completedOn = "Apr 01, 2026, 2:50 PM",
  completedBy = "Sakshi Pagare",
  onUpdateClick,
}: {
  no: string,
  date: string,
  lead: string,
  mobile: string,
  assignedBy: string,
  assignedTo: string,
  schDate: string,
  title: string,
  onLeadClick?: (lead: string) => void,
  remark?: string,
  activityType?: string,
  stage?: string,
  status?: "Completed" | "Overdue",
  completedOn?: string,
  completedBy?: string,
  onUpdateClick?: (payload: TaskEditPayload) => void
}) {
  const { data: session, status: sessionStatus } = useSession();
  const role = ((session?.user?.role as TaskRole | undefined) ?? "AGENT");
  const authReady = sessionStatus !== "loading";
  const taskPermissions = authReady
    ? getTaskActionPermissions(role)
    : {
        create: false,
        update: false,
        delete: false,
        assign: false,
        reassign: false,
        complete: false,
        export: false,
      };

  return (
    <tr className="hover:bg-gray-50 text-[13px] text-gray-600">
      <td className="py-2.5 px-4 border-r border-gray-100"><input suppressHydrationWarning type="checkbox" className="rounded border-gray-300" /></td>
      <td className="py-2.5 px-3 border-r border-gray-100 text-center">{no}</td>
      <td className="py-2.5 px-4 border-r border-gray-100">{date}</td>
      <td className="py-2.5 px-4 border-r border-gray-100">
        <button
          suppressHydrationWarning
          type="button"
          className="text-[#1a56db] hover:underline font-medium"
          onClick={() => onLeadClick?.(lead)}
        >
          {lead}
        </button>
      </td>
      <td className="py-2.5 px-4 border-r border-gray-100">{mobile}</td>
      <td className="py-2.5 px-4 border-r border-gray-100">
        <span className="bg-[#1a56db] text-white text-[10px] px-2 py-1 rounded font-medium uppercase tracking-wider">Lead</span>
      </td>
      <td className="py-2.5 px-4 border-r border-gray-100">{assignedBy}</td>
      <td className="py-2.5 px-4 border-r border-gray-100 font-semibold text-gray-800">{assignedTo}</td>
      <td className="py-2.5 px-4 border-r border-gray-100"></td>
      <td className="py-2.5 px-4 border-r border-gray-100">{schDate}</td>
      <td className="py-2.5 px-4 border-r border-gray-100 truncate max-w-[250px]" title={title}>{title}</td>
      <td className="py-2.5 px-4 border-r border-gray-100 max-w-[210px] truncate" title={remark}>{remark}</td>
      <td className="py-2.5 px-4 border-r border-gray-100">{activityType}</td>
      <td className="py-2.5 px-4 border-r border-gray-100 uppercase">{stage}</td>
      <td className="py-2.5 px-4 border-r border-gray-100">
        <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold text-white ${status === "Completed" ? "bg-emerald-500" : "bg-rose-500"}`}>
          <Check className="h-3 w-3" />
          {status}
        </span>
      </td>
      <td className="py-2.5 px-4 border-r border-gray-100">{completedOn}</td>
      <td className="py-2.5 px-4 border-r border-gray-100">{completedBy}</td>
      <td className="py-2.5 px-4">
        <div className="relative group">
          <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] p-1 text-white hover:bg-blue-700" aria-label="Task action menu">
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <div className="absolute right-0 top-full z-20 mt-1 hidden min-w-[140px] rounded border border-gray-200 bg-white py-1 shadow-md group-hover:block">
            {taskPermissions.complete ? (
              <button suppressHydrationWarning type="button" className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-gray-700 hover:bg-gray-50">
                <Check className="h-3.5 w-3.5" /> Mark As Done
              </button>
            ) : null}
            {taskPermissions.update ? (
              <button
                suppressHydrationWarning
                type="button"
                onClick={() =>
                  onUpdateClick?.({
                    lead,
                    salesAgent: assignedTo,
                    title,
                    dueDate: schDate,
                    activityType: "Call",
                  })
                }
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="h-3.5 w-3.5" /> Update
              </button>
            ) : null}
            {taskPermissions.delete ? (
              <button suppressHydrationWarning type="button" className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-gray-700 hover:bg-gray-50">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            ) : null}
            {!taskPermissions.complete && !taskPermissions.update && !taskPermissions.delete ? (
              <span className="block px-3 py-1.5 text-[12px] text-gray-500">
                {authReady ? "No actions available" : "Checking permissions..."}
              </span>
            ) : null}
          </div>
        </div>
      </td>
    </tr>
  );
}

function TaskLeadInfoDrawer({ open, onClose, leadName }: { open: boolean; onClose: () => void; leadName: string }) {
  const quickActionMeta = {
    WA: { icon: MessageCircle, shell: "bg-emerald-100", iconColor: "text-emerald-600" },
    Note: { icon: PencilLine, shell: "bg-blue-100", iconColor: "text-blue-600" },
    Email: { icon: Mail, shell: "bg-rose-100", iconColor: "text-rose-500" },
    Call: { icon: Phone, shell: "bg-lime-100", iconColor: "text-lime-600" },
    SMS: { icon: Mail, shell: "bg-red-100", iconColor: "text-red-500" },
    Task: { icon: ClipboardList, shell: "bg-indigo-100", iconColor: "text-indigo-500" },
  } as const;
  const quickActions = ["WA", "Note", "Email", "Call", "SMS", "Task"] as const satisfies readonly (keyof typeof quickActionMeta)[];
  const [activeQuickModal, setActiveQuickModal] = useState<null | "wa" | "note" | "email" | "call" | "sms" | "task">(null);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const centerTabs = ["Suggestion", "Timeline", "Followup", "Site Visit", "Meeting", "E-Mail", "Call", "SMS", "WhatsApp", "Projects", "Documents"] as const;
  const [activeCenterTab, setActiveCenterTab] = useState<(typeof centerTabs)[number]>("Suggestion");
  const detailSections = [
    { title: "Campaign Details", rows: [["Name", "Sai World City"], ["Channel", "SOBO PIN DROP OPEN"], ["AdName", "NEW VIDEO AD COPY"], ["Utm", "-"], ["Utm Medium", "-"], ["Utm Source", "-"]] },
    { title: "Other Details", rows: [["Ethnicity", "-"], ["Loan", "No"]] },
    { title: "Last Activity", rows: [["Title", "Call at Apr 23, 2026, 11:57 AM"], ["Remark", "out of station"], ["Created Date", "Apr 21, 2026, 5:27 PM"]] },
    { title: "First Activity", rows: [["Title", "Call at Apr 1, 2026, 11:41 AM"], ["Remark", "cd"], ["Created Date", "Apr 01, 2026, 11:11 AM"]] },
    { title: "Last Note", rows: [["Note", "-"], ["Created Date", "-"]] },
  ] as const;
  const timelineHighlights = [
    { label: "Tasks", value: "7" },
    { label: "Site Visit Scheduled", value: "0" },
    { label: "Site Visit Completed", value: "0" },
  ] as const;
  const timelineHighlightsRight = [
    { label: "Meetings", value: "0" },
    { label: "Offline Calls", value: "8" },
    { label: "IVR Calls", value: "0" },
  ] as const;
  const timelineFeed = [
    {
      type: "task" as const,
      title: "Task",
      status: "Pending",
      statusTone: "pending" as const,
      date: "Apr 21, 2026, 5:27 PM",
      user: "Saumittra Mathur",
      subject: "Call At Apr 23, 2026, 11:57 Am",
      assignedTo: "Ajay Jaiswal",
      dueDate: "Apr 23, 2026, 11:57 AM",
      remark: "Out Of Station",
      itemType: "CALL",
      createdBy: "Ajay Jaiswal",
    },
    {
      type: "event" as const,
      title: "[Trigger] - 'Task reminder to sales agent'",
      date: "Apr 23, 2026, 11:43:00 AM",
      user: "Saumittra Mathur",
    },
    {
      type: "call" as const,
      title: "Outgoing",
      date: "Apr 21, 2026, 5:27:00 PM",
      user: "Saumittra Mathur",
      body: "Outgoing Call at 21/04/2026 17:27:00 and duration is 0:00:23 by Ajay Jaiswal",
    },
    {
      type: "note" as const,
      title: "Note",
      date: "Apr 17, 2026, 5:20:50 PM",
      user: "Saumittra Mathur",
      body: "ringing",
      footer: "Ajay Jaiswal",
      showDelete: true,
    },
    {
      type: "task" as const,
      title: "Task",
      status: "Completed",
      statusTone: "completed" as const,
      date: "Apr 15, 2026, 12:41 PM",
      user: "Saumittra Mathur",
      subject: "Call At Apr 15, 2026, 4:10 Pm",
      assignedTo: "Ajay Jaiswal",
      dueDate: "Apr 15, 2026, 4:10 PM",
      remark: "Cb . Task Autocompleted.",
      itemType: "CALL",
      createdBy: "Ajay Jaiswal",
      completedOn: "Apr 21, 2026, 5:27 PM",
    },
    {
      type: "stage" as const,
      title: "Lead Stage Changed",
      date: "Apr 1, 2026, 2:49:54 PM",
      user: "Saumittra Mathur",
      body: "Lead stage updated from Open to CALL BACK.",
      footer: "Ajay Jaiswal",
    },
    {
      type: "transfer" as const,
      title: "Lead Transferred",
      date: "Apr 1, 2026, 11:08:56 AM",
      user: "Saumittra Mathur",
      body: "This Lead has been transferred and assigned To Ajay Jaiswal On 01/04/2026 11:08 by Aman Dubey.",
      footer: "Aman Dubey",
    },
    {
      type: "event" as const,
      title: "Lead Created Via Campaign Sai World City (SOBO Pin drop Open)",
      date: "Apr 1, 2026, 7:35:40 AM",
      user: "Saumittra Mathur",
      body: "Lead generated with details Saumittra Mathur (XXXXXX4776, ). Has shown interest in project SAI WORLD CITY.",
      footer: "Source: IG",
    },
  ] as const;
  const followupFeed = [
    {
      title: "Task",
      status: "Pending",
      statusTone: "pending" as const,
      date: "Apr 21, 2026, 5:27 PM",
      user: "Saumittra Mathur",
      subject: "Call At Apr 23, 2026, 11:57 Am",
      assignedTo: "Ajay Jaiswal",
      dueDate: "Apr 23, 2026, 11:57 AM",
      remark: "Out Of Station",
      itemType: "CALL",
      createdBy: "Ajay Jaiswal",
      showActions: true,
    },
    {
      title: "Task",
      status: "Completed",
      statusTone: "completed" as const,
      date: "Apr 15, 2026, 12:41 PM",
      user: "Saumittra Mathur",
      subject: "Call At Apr 15, 2026, 4:10 Pm",
      assignedTo: "Ajay Jaiswal",
      dueDate: "Apr 15, 2026, 4:10 PM",
      remark: "Cb . Task Autocompleted.",
      itemType: "CALL",
      createdBy: "Ajay Jaiswal",
      completedOn: "Apr 21, 2026, 5:27 PM",
    },
    {
      title: "Task",
      status: "Completed",
      statusTone: "completed" as const,
      date: "Apr 08, 2026, 3:42 PM",
      user: "Saumittra Mathur",
      subject: "Call At May 6, 2026, 6:12 Pm",
      assignedTo: "Ajay Jaiswal",
      dueDate: "May 06, 2026, 6:12 PM",
      remark: "Ringing . Task Autocompleted.",
      itemType: "CALL",
      createdBy: "Ajay Jaiswal",
      completedOn: "Apr 15, 2026, 12:41 PM",
    },
    {
      title: "Task",
      status: "Completed",
      statusTone: "completed" as const,
      date: "Apr 02, 2026, 2:24 PM",
      user: "Saumittra Mathur",
      subject: "Call At Apr 2, 2026, 4:53 Pm",
      assignedTo: "Ajay Jaiswal",
      dueDate: "Apr 02, 2026, 4:53 PM",
      remark: "Ringing. Task Autocompleted.",
      itemType: "CALL",
      createdBy: "Ajay Jaiswal",
      completedOn: "Apr 08, 2026, 3:42 PM",
    },
    {
      title: "Task",
      status: "Completed",
      statusTone: "completed" as const,
      date: "Apr 01, 2026, 4:02 PM",
      user: "Saumittra Mathur",
      subject: "Followup Task With Saumittra Mathur",
      assignedTo: "Ajay Jaiswal",
      dueDate: "Apr 02, 2026, 4:02 PM",
      remark: "Already Visited Arihant Aspire Looking 2bhk Rtmi . Task Autocompleted.",
      itemType: "CALL",
      createdBy: "Ajay Jaiswal",
      completedOn: "Apr 02, 2026, 2:24 PM",
    },
    {
      title: "Task",
      status: "Completed",
      statusTone: "completed" as const,
      date: "Apr 01, 2026, 2:50 PM",
      user: "Saumittra Mathur",
      subject: "Call At Apr 1, 2026, 4:15 Pm",
      assignedTo: "Ajay Jaiswal",
      dueDate: "Apr 01, 2026, 4:15 PM",
      remark: "Cb. Task Autocompleted.",
      itemType: "CALL",
      createdBy: "Ajay Jaiswal",
      completedOn: "Apr 01, 2026, 4:02 PM",
    },
    {
      title: "Task",
      status: "Completed",
      statusTone: "completed" as const,
      date: "Apr 01, 2026, 11:11 AM",
      user: "Saumittra Mathur",
      subject: "Call At Apr 1, 2026, 11:41 Am",
      assignedTo: "Ajay Jaiswal",
      dueDate: "Apr 01, 2026, 11:41 AM",
      remark: "Cd. Task Autocompleted.",
      itemType: "CALL",
      createdBy: "Ajay Jaiswal",
      completedOn: "Apr 01, 2026, 2:50 PM",
    },
  ] as const;
  const callFeed = [
    { title: "Outgoing", date: "Apr 21, 2026, 5:27:00 PM", user: "Saumittra Mathur", body: "Outgoing Call at 21/04/2026 17:27:00 and duration is 0:00:23 by Ajay Jaiswal" },
    { title: "Outgoing", date: "Apr 17, 2026, 5:20:25 PM", user: "Saumittra Mathur", body: "Outgoing Call at 17/04/2026 17:20:25 and duration is 0:00:00 by Ajay Jaiswal" },
    { title: "Outgoing", date: "Apr 15, 2026, 12:40:02 PM", user: "Saumittra Mathur", body: "Outgoing Call at 15/04/2026 12:40:02 and duration is 0:00:20 by Ajay Jaiswal" },
    { title: "Outgoing", date: "Apr 8, 2026, 3:41:03 PM", user: "Saumittra Mathur", body: "Outgoing Call at 08/04/2026 15:41:03 and duration is 0:00:00 by Sakshi Pagare" },
    { title: "Outgoing", date: "Apr 2, 2026, 2:23:29 PM", user: "Saumittra Mathur", body: "Outgoing Call at 02/04/2026 14:23:29 and duration is 0:00:00 by Sakshi Pagare" },
    { title: "Outgoing", date: "Apr 1, 2026, 4:00:31 PM", user: "Saumittra Mathur", body: "Outgoing Call at 01/04/2026 16:00:31 and duration is 0:01:00 by Ajay Jaiswal" },
    { title: "Outgoing", date: "Apr 1, 2026, 2:48:49 PM", user: "Saumittra Mathur", body: "Outgoing Call at 01/04/2026 14:48:49 and duration is 0:00:20 by Ajay Jaiswal" },
    { title: "Outgoing", date: "Apr 1, 2026, 11:10:12 AM", user: "Saumittra Mathur", body: "Outgoing Call at 01/04/2026 11:10:12 and duration is 0:00:20 by Ajay Jaiswal" },
  ] as const;

  const renderCenterSection = () => {
    if (activeCenterTab === "Suggestion") {
      return (
        <div className="space-y-3">
          <div className="rounded border border-gray-200 bg-white p-3">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-base font-semibold text-gray-800">Requirements</h4>
              <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">Save</button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[130px_1fr_1fr]">
                <label className="text-sm font-semibold text-gray-700">Budget Range:</label>
                <div className="relative">
                  <input suppressHydrationWarning placeholder="Select Budget Minimum" className="w-full rounded border border-gray-300 px-3 py-2 pr-8 text-sm outline-none" />
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="relative">
                  <input suppressHydrationWarning placeholder="Select Budget Maximum" className="w-full rounded border border-gray-300 px-3 py-2 pr-8 text-sm outline-none" />
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[130px_1fr_1fr]">
                <label className="text-sm font-semibold text-gray-700">Area Range:</label>
                <div className="relative">
                  <input suppressHydrationWarning defaultValue="0" className="w-full rounded border border-gray-300 px-3 py-2 pr-14 text-sm outline-none" />
                  <X className="pointer-events-none absolute right-7 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="relative">
                  <input suppressHydrationWarning defaultValue="0" className="w-full rounded border border-gray-300 px-3 py-2 pr-14 text-sm outline-none" />
                  <X className="pointer-events-none absolute right-7 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[130px_1fr_1fr]">
                <label className="text-sm font-semibold text-gray-700">Requirement Type:</label>
                <div className="relative">
                  <input suppressHydrationWarning placeholder="Select Requirement" className="w-full rounded border border-gray-300 px-3 py-2 pr-8 text-sm outline-none" />
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="relative">
                  <input suppressHydrationWarning placeholder="Select Property Type" className="w-full rounded border border-gray-300 px-3 py-2 pr-8 text-sm outline-none" />
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[130px_1fr]">
                <label className="text-sm font-semibold text-gray-700">Search Location</label>
                <input suppressHydrationWarning placeholder="Enter your address" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none" />
              </div>

              <div className="grid grid-cols-1 items-start gap-2 md:grid-cols-[130px_1fr]">
                <label className="pt-2 text-sm font-semibold text-gray-700">Street Address</label>
                <textarea suppressHydrationWarning placeholder="Address" rows={2} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none" />
              </div>

              <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[130px_1fr_1fr]">
                <label className="text-sm font-semibold text-gray-700">Location:</label>
                <input suppressHydrationWarning placeholder="Location" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none" />
                <input suppressHydrationWarning placeholder="SubLocation" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none" />
              </div>
            </div>
          </div>

          <div className="rounded border border-gray-200 bg-white p-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr]">
              <div className="relative rounded border border-gray-300 bg-white px-2 py-1.5 pr-14">
                <div className="flex flex-wrap gap-1">
                  <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs text-gray-700">Location <X className="h-3 w-3 text-gray-500" /></span>
                  <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs text-gray-700">Budget <X className="h-3 w-3 text-gray-500" /></span>
                  <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs text-gray-700">Unit <X className="h-3 w-3 text-gray-500" /></span>
                  <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs text-gray-700">Sub Type <X className="h-3 w-3 text-gray-500" /></span>
                </div>
                <X className="pointer-events-none absolute right-7 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>

              <div className="relative">
                <input suppressHydrationWarning placeholder="Select Location" className="w-full rounded border border-gray-300 px-3 py-2 pr-8 text-sm outline-none" />
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
              <div className="relative">
                <input suppressHydrationWarning placeholder="Select Sub Location" className="w-full rounded border border-gray-300 px-3 py-2 pr-8 text-sm outline-none" />
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
              <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-5 py-2 text-sm font-medium text-white hover:bg-blue-700">Search</button>
            </div>
          </div>

          <div className="rounded border border-gray-200 bg-white p-3">
            <h4 className="mb-2 text-base font-semibold text-gray-800">Suggested Projects</h4>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-xs text-gray-600">
                <thead className="border-y border-gray-200 bg-gray-50">
                  <tr>
                    <th className="w-10 px-3 py-2">
                      <input suppressHydrationWarning type="checkbox" className="h-4 w-4 rounded border-gray-300" aria-label="Select all suggested projects" />
                    </th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Address</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Units Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-sm text-gray-500">No Data Found</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded border border-gray-200 bg-white p-3">
            <h4 className="mb-2 text-base font-semibold text-gray-800">Suggested Properties</h4>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-xs text-gray-600">
                <thead className="border-y border-gray-200 bg-gray-50">
                  <tr>
                    <th className="w-10 px-3 py-2">
                      <input suppressHydrationWarning type="checkbox" className="h-4 w-4 rounded border-gray-300" aria-label="Select all suggested properties" />
                    </th>
                    <th className="px-3 py-2">Client Name</th>
                    <th className="px-3 py-2">House Name</th>
                    <th className="px-3 py-2">Project Name</th>
                    <th className="px-3 py-2">Unit &amp; Carpet Area</th>
                    <th className="px-3 py-2">Available From</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-center text-sm text-gray-500">No Data Found</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (activeCenterTab === "Timeline") {
      const pendingItem = timelineFeed[0] as (typeof timelineFeed)[number];
      const timelineItems = timelineFeed.slice(1);

      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="rounded border border-gray-200 bg-white p-4">
              <div className="border-l-4 border-[#1a56db] pl-4">
                {timelineHighlights.map((item) => (
                  <div key={item.label} className="mb-1 flex items-center justify-between text-sm text-[#3b4258] last:mb-0">
                    <span>{item.label}</span>
                    <span className="text-2xl">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded border border-gray-200 bg-white p-4">
              <div className="border-l-4 border-[#1a56db] pl-4">
                {timelineHighlightsRight.map((item) => (
                  <div key={item.label} className="mb-1 flex items-center justify-between text-sm text-[#3b4258] last:mb-0">
                    <span>{item.label}</span>
                    <span className="text-2xl">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="relative w-full max-w-[220px]">
              <input suppressHydrationWarning placeholder="Select Executive" className="w-full rounded border border-gray-300 bg-white px-3 py-2 pr-8 text-sm text-gray-600 outline-none" />
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="rounded border border-gray-200 bg-white p-4">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <ClipboardList className="h-4 w-4" />
              </span>
              <p className="text-sm text-[#3b4258]">
                <strong>Remark:</strong> Panvel., "your_preferred_configuration?" : "2_bhk_", "would_you_like_to_visit_the_site?_" : "yes_", "city" : "Mumbai"
              </p>
            </div>
          </div>

          <div className="rounded border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-4 py-3 text-center text-xl font-semibold text-[#3b4258]">Upcoming/Pending Tasks</div>
            <div className="p-3">
              {[pendingItem].map((item, idx) => (
                <div key={`${item.title}-${item.date}-${idx}`} className="border-b border-gray-200 py-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      item.type === "task" ? "bg-indigo-100 text-indigo-500" : "bg-pink-100 text-pink-500"
                    }`}>
                      {item.type === "task" ? <ClipboardList className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-semibold text-[#3b4258]">{item.title}</p>
                          {"status" in item ? (
                            <span className={`px-2 py-0.5 text-xs font-semibold text-white ${item.statusTone === "completed" ? "bg-emerald-500" : "bg-rose-500"}`}>
                              {item.status}
                            </span>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-[#4a5165]">
                          <span>{item.date}</span>
                          <span>{item.user}</span>
                          {item.type === "task" ? (
                            <div className="flex gap-1">
                              <button suppressHydrationWarning type="button" className="rounded border border-[#1a56db] p-1.5 text-[#1a56db] hover:bg-blue-50" aria-label="Mark task">
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button suppressHydrationWarning type="button" className="rounded border border-[#1a56db] p-1.5 text-[#1a56db] hover:bg-blue-50" aria-label="Edit task">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button suppressHydrationWarning type="button" className="rounded border border-[#1a56db] p-1.5 text-[#1a56db] hover:bg-blue-50" aria-label="Delete task">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : null}
                          {item.type === "note" && "showDelete" in item && item.showDelete ? (
                            <button suppressHydrationWarning type="button" className="rounded border border-[#1a56db] p-1.5 text-[#1a56db] hover:bg-blue-50" aria-label="Delete note">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {"subject" in item ? (
                        <div className="mb-3 border-b border-gray-200 pb-2 text-sm text-[#4a5165]">
                          <span className="mr-2 inline-block h-3 w-3 rounded-full bg-gray-300"></span>{item.subject}
                        </div>
                      ) : null}

                      {"type" in item && item.type === "task" ? (
                        <div className="space-y-3 text-sm text-[#4a5165]">
                          <div className="grid gap-2 md:grid-cols-2">
                            <div>
                              <p className="font-semibold text-[#3b4258]">Assigned to</p>
                              <p>{item.assignedTo}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-[#3b4258]">Due Date &amp; Time</p>
                              <p>{item.dueDate}</p>
                            </div>
                          </div>
                          <div className="border-b border-gray-200 pb-2">
                            <p><span className="font-semibold text-[#3b4258]">Remark:</span> {item.remark}</p>
                          </div>
                          <div className="grid gap-2 md:grid-cols-2">
                            <div>
                              <p className="font-semibold text-[#3b4258]">Type</p>
                              <p>{item.itemType}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-[#3b4258]">Created By</p>
                              <p>{item.createdBy}</p>
                            </div>
                          </div>
                          {"completedOn" in item && item.completedOn ? (
                            <div>
                              <p className="font-semibold text-[#3b4258]">Completed on</p>
                              <p>{item.completedOn}</p>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <>
                          {"body" in item && item.body ? <p className="border-b border-gray-200 pb-2 text-sm text-[#4a5165]">{item.body}</p> : null}
                          {"footer" in item && item.footer ? (
                            <p className="mt-2 text-sm text-[#4a5165]">
                              {item.footer.includes("Source:")
                                ? item.footer
                                : <><span className="mr-2 inline-block h-3 w-3 rounded-full bg-gray-300"></span>{item.footer}</>}
                            </p>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-4 py-3 text-center text-xl font-semibold text-[#3b4258]">Timeline</div>
            <div className="p-3">
              {timelineItems.map((item, idx) => (
                <div key={`${item.title}-${item.date}-${idx}`} className="border-b border-gray-200 py-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      item.type === "task" ? "bg-indigo-100 text-indigo-500" : "bg-pink-100 text-pink-500"
                    }`}>
                      {item.type === "task" ? <ClipboardList className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-semibold text-[#3b4258]">{item.title}</p>
                          {"status" in item ? (
                            <span className={`px-2 py-0.5 text-xs font-semibold text-white ${item.statusTone === "completed" ? "bg-emerald-500" : "bg-rose-500"}`}>
                              {item.status}
                            </span>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-[#4a5165]">
                          <span>{item.date}</span>
                          <span>{item.user}</span>
                          {item.type === "task" ? (
                            <div className="flex gap-1">
                              <button suppressHydrationWarning type="button" className="rounded border border-[#1a56db] p-1.5 text-[#1a56db] hover:bg-blue-50" aria-label="Mark task">
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button suppressHydrationWarning type="button" className="rounded border border-[#1a56db] p-1.5 text-[#1a56db] hover:bg-blue-50" aria-label="Edit task">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button suppressHydrationWarning type="button" className="rounded border border-[#1a56db] p-1.5 text-[#1a56db] hover:bg-blue-50" aria-label="Delete task">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : null}
                          {item.type === "note" && "showDelete" in item && item.showDelete ? (
                            <button suppressHydrationWarning type="button" className="rounded border border-[#1a56db] p-1.5 text-[#1a56db] hover:bg-blue-50" aria-label="Delete note">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {"subject" in item ? (
                        <div className="mb-3 border-b border-gray-200 pb-2 text-sm text-[#4a5165]">
                          <span className="mr-2 inline-block h-3 w-3 rounded-full bg-gray-300"></span>{item.subject}
                        </div>
                      ) : null}

                      {"type" in item && item.type === "task" ? (
                        <div className="space-y-3 text-sm text-[#4a5165]">
                          <div className="grid gap-2 md:grid-cols-2">
                            <div>
                              <p className="font-semibold text-[#3b4258]">Assigned to</p>
                              <p>{item.assignedTo}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-[#3b4258]">Due Date &amp; Time</p>
                              <p>{item.dueDate}</p>
                            </div>
                          </div>
                          <div className="border-b border-gray-200 pb-2">
                            <p><span className="font-semibold text-[#3b4258]">Remark:</span> {item.remark}</p>
                          </div>
                          <div className="grid gap-2 md:grid-cols-2">
                            <div>
                              <p className="font-semibold text-[#3b4258]">Type</p>
                              <p>{item.itemType}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-[#3b4258]">Created By</p>
                              <p>{item.createdBy}</p>
                            </div>
                          </div>
                          {"completedOn" in item && item.completedOn ? (
                            <div>
                              <p className="font-semibold text-[#3b4258]">Completed on</p>
                              <p>{item.completedOn}</p>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <>
                          {"body" in item && item.body ? <p className="border-b border-gray-200 pb-2 text-sm text-[#4a5165]">{item.body}</p> : null}
                          {"footer" in item && item.footer ? (
                            <p className="mt-2 text-sm text-[#4a5165]">
                              {item.footer.includes("Source:")
                                ? item.footer
                                : <><span className="mr-2 inline-block h-3 w-3 rounded-full bg-gray-300"></span>{item.footer}</>}
                            </p>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeCenterTab === "Followup") {
      return (
        <div className="space-y-4">
          {followupFeed.map((item, idx) => (
            <div key={`${item.title}-${item.date}-${idx}`} className="rounded border border-gray-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-500">
                  <ClipboardList className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-[#3b4258]">{item.title}</p>
                      <span className={`px-2 py-0.5 text-xs font-semibold text-white ${item.statusTone === "completed" ? "bg-emerald-500" : "bg-rose-500"}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#4a5165]">
                      <span>{item.date}</span>
                      <span>{item.user}</span>
                      {"showActions" in item && item.showActions ? (
                        <div className="flex gap-1">
                          <button suppressHydrationWarning type="button" className="rounded border border-[#1a56db] p-1.5 text-[#1a56db] hover:bg-blue-50" aria-label="Mark followup task">
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button suppressHydrationWarning type="button" className="rounded border border-[#1a56db] p-1.5 text-[#1a56db] hover:bg-blue-50" aria-label="Edit followup task">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button suppressHydrationWarning type="button" className="rounded border border-[#1a56db] p-1.5 text-[#1a56db] hover:bg-blue-50" aria-label="Delete followup task">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mb-3 border-b border-gray-200 pb-2 text-sm text-[#4a5165]">
                    <span className="mr-2 inline-block h-3 w-3 rounded-full bg-gray-300"></span>{item.subject}
                  </div>

                  <div className="space-y-3 text-sm text-[#4a5165]">
                    <div className="grid gap-2 md:grid-cols-2">
                      <div>
                        <p className="font-semibold text-[#3b4258]">Assigned to</p>
                        <p>{item.assignedTo}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-[#3b4258]">Due Date &amp; Time</p>
                        <p>{item.dueDate}</p>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-2">
                      <p><span className="font-semibold text-[#3b4258]">Remark:</span> {item.remark}</p>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div>
                        <p className="font-semibold text-[#3b4258]">Type</p>
                        <p>{item.itemType}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-[#3b4258]">Created By</p>
                        <p>{item.createdBy}</p>
                      </div>
                    </div>
                    {"completedOn" in item && item.completedOn ? (
                      <div>
                        <p className="font-semibold text-[#3b4258]">Completed on</p>
                        <p>{item.completedOn}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeCenterTab === "Call") {
      return (
        <div className="space-y-4">
          {callFeed.map((item, idx) => (
            <div key={`${item.title}-${item.date}-${idx}`} className="rounded border border-gray-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-500">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-lg font-semibold text-[#3b4258]">{item.title}</p>
                    <div className="flex items-center gap-3 text-sm text-[#4a5165]">
                      <span>{item.date}</span>
                      <span>{item.user}</span>
                    </div>
                  </div>
                  <p className="border-b border-gray-200 pb-2 text-sm text-[#4a5165]">{item.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeCenterTab === "Site Visit" || activeCenterTab === "Meeting" || activeCenterTab === "E-Mail" || activeCenterTab === "SMS") {
      return (
        <div className="rounded border border-gray-200 bg-white px-4 py-7 text-center">
          <p className="text-3xl font-semibold text-[#3b4258]">No Data Found</p>
        </div>
      );
    }

    if (activeCenterTab === "WhatsApp") {
      return (
        <div className="rounded border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h4 className="text-2xl font-semibold text-[#2f374b]">Saumittra Mathur</h4>
            <button suppressHydrationWarning type="button" className="rounded p-1 text-[#2f374b] hover:bg-gray-100" aria-label="Refresh whatsapp thread">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-[520px] border-b border-gray-200 bg-white"></div>

          <div className="flex items-center gap-2 bg-[#eef2f6] px-4 py-3">
            <button suppressHydrationWarning type="button" className="inline-flex h-8 w-8 items-center justify-center rounded bg-[#1a56db] text-white" aria-label="Attach whatsapp template">
              <Plus className="h-4 w-4" />
            </button>
            <input
              suppressHydrationWarning
              readOnly
              value="Chat closed. Please send Template Message"
              className="h-8 flex-1 rounded border border-gray-300 bg-[#dfe4ea] px-3 text-sm text-gray-600 outline-none"
            />
            <button suppressHydrationWarning type="button" className="h-8 rounded bg-[#5b8fd8] px-5 text-sm font-medium text-white hover:bg-[#4e82ca]">
              Reply
            </button>
          </div>
        </div>
      );
    }

    if (activeCenterTab === "Documents") {
      return (
        <div className="relative">
          <div className="rounded border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
              <div className="flex items-center gap-2">
                <h4 className="text-2xl font-semibold text-[#3b4258]">Lead Documents</h4>
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-emerald-400 px-2 text-sm font-semibold text-white">0</span>
              </div>
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setDocumentsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded bg-[#1a56db] px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-white/20">
                  <Plus className="h-3.5 w-3.5" />
                </span>
                Upload New Documents
              </button>
            </div>

            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm text-[#4a5165]">
                  <thead className="border border-gray-200 bg-gray-50">
                    <tr>
                      <th className="w-[70px] px-3 py-2">#</th>
                      <th className="w-[170px] px-3 py-2">Preview</th>
                      <th className="px-3 py-2">Description</th>
                      <th className="w-[160px] px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border border-gray-200">
                      <td className="px-3 py-2"></td>
                      <td className="px-3 py-2"></td>
                      <td className="px-3 py-2 text-base text-[#4a5165]">No Documents Found</td>
                      <td className="px-3 py-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {documentsModalOpen ? (
            <div className="absolute inset-0 z-20 flex items-start justify-center bg-black/60 p-6">
              <div className="w-full max-w-[900px] rounded border border-gray-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                  <h5 className="text-2xl font-semibold text-[#3b4258]">Add Documents</h5>
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => setDocumentsModalOpen(false)}
                    className="rounded border border-gray-500 p-1 text-gray-600 hover:bg-gray-100"
                    aria-label="Close add documents modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm text-[#4a5165]">
                      <thead className="border border-gray-200 bg-gray-50">
                        <tr>
                          <th className="w-[70px] px-3 py-2">#</th>
                          <th className="w-[170px] px-3 py-2">Preview</th>
                          <th className="px-3 py-2">Description</th>
                          <th className="w-[160px] px-3 py-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border border-gray-200">
                          <td className="px-3 py-2"></td>
                          <td className="px-3 py-2"></td>
                          <td className="px-3 py-2 text-base text-[#4a5165]">No Documents Founds</td>
                          <td className="px-3 py-2"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-4 py-2 text-lg font-semibold text-white hover:bg-blue-700">Choose</button>
                    <button suppressHydrationWarning type="button" className="rounded bg-[#ff5a24] px-4 py-2 text-lg font-semibold text-white hover:bg-[#e44f20]">Add Link Url</button>
                    <button suppressHydrationWarning type="button" onClick={() => setDocumentsModalOpen(false)} className="rounded bg-rose-500 px-4 py-2 text-lg font-semibold text-white hover:bg-rose-600">✖ Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      );
    }

    if (activeCenterTab === "Projects") {
      return (
        <div className="rounded border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-4">
            <h4 className="text-2xl font-semibold text-[#3b4258]">Interested Projects</h4>
          </div>
          <div className="p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="relative w-full max-w-[300px]">
                <input suppressHydrationWarning placeholder="Search & Select Project" className="w-full rounded border border-gray-300 bg-white px-3 py-2 pr-8 text-sm text-gray-600 outline-none" />
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
              <button suppressHydrationWarning type="button" className="inline-flex items-center rounded overflow-hidden border border-[#1a56db]">
                <span className="inline-flex h-9 w-9 items-center justify-center bg-[#1a56db] text-white">
                  <Plus className="h-4 w-4" />
                </span>
                <span className="bg-[#1a56db] px-4 py-2 text-sm font-medium text-white">Add</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm text-[#4a5165]">
                <thead className="border border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Sr.No</th>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Address</th>
                    <th className="px-3 py-2">Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border border-gray-200">
                    <td className="px-3 py-2">1</td>
                    <td className="px-3 py-2">20</td>
                    <td className="px-3 py-2">SAI WORLD CITY</td>
                    <td className="px-3 py-2"></td>
                    <td className="px-3 py-2">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="rounded border border-gray-200 bg-white p-3">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-base font-semibold text-gray-800">{activeCenterTab}</h4>
            <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">Add New</button>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <input suppressHydrationWarning placeholder="Title" className="rounded border border-gray-300 px-3 py-2 text-sm outline-none" />
            <input suppressHydrationWarning placeholder="Schedule Date" className="rounded border border-gray-300 px-3 py-2 text-sm outline-none" />
            <textarea suppressHydrationWarning rows={3} placeholder="Remark" className="md:col-span-2 rounded border border-gray-300 px-3 py-2 text-sm outline-none" />
          </div>
        </div>

        <div className="rounded border border-gray-200 bg-white p-3">
          <h5 className="mb-2 text-sm font-semibold text-gray-800">Recent {activeCenterTab}</h5>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-xs text-gray-600">
              <thead className="border-y border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Owner</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-500">No Data Found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] bg-black/45">
      <div className="absolute inset-y-0 right-0 w-[min(96vw,1500px)] rounded-l-md border-l border-gray-200 bg-[#f4f7f6] shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
            <h3 className="text-2xl font-semibold text-gray-800">Lead Information</h3>
            <button suppressHydrationWarning type="button" onClick={onClose} className="rounded p-1 text-gray-500 hover:bg-gray-100" aria-label="Close lead information drawer">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[260px_1fr_360px]">
              <div className="rounded border border-gray-200 bg-white p-3">
                <div className="mb-3 inline-flex rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">#14883</div>
                <div className="mb-3 flex flex-col items-center">
                  <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-purple-500 text-4xl font-semibold text-white">
                    {(leadName || "L").slice(0, 2).toUpperCase()}
                  </div>
                  <p className="text-xl font-medium text-gray-800">{leadName}</p>
                </div>

                <div className="mb-4 grid grid-cols-6 gap-2">
                  {quickActions.map((qa) => (
                    <button
                      key={qa}
                      suppressHydrationWarning
                      type="button"
                      onClick={() => setActiveQuickModal(qa.toLowerCase() as "wa" | "note" | "email" | "call" | "sms" | "task")}
                      className="flex flex-col items-center gap-1 rounded px-1 py-1 text-[11px] text-gray-700 hover:bg-gray-50"
                    >
                      <span className={`flex h-9 w-9 items-center justify-center rounded-full ${quickActionMeta[qa].shell}`}>
                        {React.createElement(quickActionMeta[qa].icon, { className: `h-4 w-4 ${quickActionMeta[qa].iconColor}` })}
                      </span>
                      <span className="text-sm leading-none text-[#4a5165]">{qa}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-4 text-xs">
                  <div className="border-t border-gray-200 pt-3">
                    <p className="mb-1 text-sm font-semibold text-[#3f495f]">Lead Stage</p>
                    <div className="relative">
                      <select suppressHydrationWarning className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-[#2f374b] outline-none">
                        <option>Call Back</option>
                        <option>New Lead</option>
                        <option>Follow Up</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <p className="mb-1 text-sm font-semibold text-[#3f495f]">Lead Category</p>
                    <div className="relative">
                      <select suppressHydrationWarning className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-[#2f374b] outline-none">
                        <option></option>
                        <option>Hot</option>
                        <option>Warm</option>
                        <option>Cold</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <p className="mb-2 text-lg font-semibold text-[#3f495f]">Contact Information</p>
                    <div className="space-y-3">
                      <div className="border-b border-dashed border-gray-200 pb-2">
                        <p className="text-sm font-semibold text-[#3f495f]">E-mail</p>
                        <p className="text-sm text-[#2f374b]"></p>
                      </div>
                      <div className="border-b border-dashed border-gray-200 pb-2">
                        <p className="text-sm font-semibold text-[#3f495f]">Phone</p>
                        <p className="text-sm text-[#2f374b]">+91-9970094776</p>
                      </div>
                      <div className="border-b border-dashed border-gray-200 pb-2">
                        <p className="mb-1 text-sm font-semibold text-[#3f495f]">Country</p>
                        <div className="relative">
                          <select suppressHydrationWarning className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-[#2f374b] outline-none">
                            <option></option>
                            <option>India</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <p className="mb-2 text-lg font-semibold text-[#3f495f]">About Lead</p>
                    <div className="space-y-3">
                      <div className="border-b border-dashed border-gray-200 pb-2">
                        <p className="text-sm font-semibold text-[#3f495f]">Pre Sales Agent</p>
                        <p className="text-sm text-[#2f374b]">Not Available</p>
                      </div>
                      <div className="border-b border-dashed border-gray-200 pb-2">
                        <p className="text-sm font-semibold text-[#3f495f]">Lead Owner</p>
                        <p className="text-sm text-[#2f374b]">Ajay Jaiswal</p>
                      </div>
                      <div className="border-b border-dashed border-gray-200 pb-2">
                        <p className="text-sm font-semibold text-[#3f495f]">Co-Owner</p>
                        <p className="text-sm text-[#2f374b]">Not Available</p>
                      </div>
                      <div className="border-b border-dashed border-gray-200 pb-2">
                        <p className="text-sm font-semibold text-[#3f495f]">Sourcing Manager</p>
                        <p className="text-sm text-[#2f374b]">Not Available</p>
                      </div>
                      <div className="border-b border-dashed border-gray-200 pb-2">
                        <p className="text-sm font-semibold text-[#3f495f]">Lead Created By</p>
                        <p className="text-sm text-[#2f374b]"></p>
                      </div>
                      <div className="border-b border-dashed border-gray-200 pb-2">
                        <p className="text-sm font-semibold text-[#3f495f]">Created Date</p>
                        <p className="text-sm text-[#2f374b]">Apr 01, 2026, 7:35 AM</p>
                      </div>
                      <div className="border-b border-dashed border-gray-200 pb-2">
                        <p className="text-sm font-semibold text-[#3f495f]">Assigned Date</p>
                        <p className="text-sm text-[#2f374b]">Apr 01, 2026, 11:08 AM</p>
                      </div>
                      <div className="border-b border-dashed border-gray-200 pb-2">
                        <p className="text-sm font-semibold text-[#3f495f]">Source</p>
                        <p className="text-sm text-[#2f374b]">IG</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded border border-gray-200 bg-white p-2">
                  <div className="mb-2 flex flex-wrap gap-2">
                    {centerTabs.map((tab, idx) => (
                      <button
                        key={tab}
                        suppressHydrationWarning
                        type="button"
                        onClick={() => setActiveCenterTab(tab)}
                        className={`rounded px-3 py-1.5 text-xs ${activeCenterTab === tab ? "bg-[#1a56db] text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                {renderCenterSection()}
              </div>

              <div className="rounded border border-gray-200 bg-white p-3">
                <h4 className="mb-3 text-2xl font-semibold text-gray-800">Details</h4>
                <div className="space-y-3">
                  {detailSections.map((section) => (
                    <div key={section.title} className="rounded border border-gray-200">
                      <div className="border-b border-gray-200 bg-gray-50 px-2 py-1.5 text-sm font-semibold text-gray-700">{section.title}</div>
                      {section.rows.map(([label, value]) => (
                        <div key={label} className="grid grid-cols-2 border-b border-gray-100 last:border-b-0">
                          <div className="px-2 py-1.5 text-xs font-semibold text-gray-700">{label}</div>
                          <div className="px-2 py-1.5 text-xs text-gray-600">{value}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeQuickModal ? (
        <div className="fixed inset-0 z-[150] flex items-start justify-center bg-black/50 p-4">
          {activeQuickModal === "wa" ? (
            <div className="w-full max-w-[980px] rounded border border-gray-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h4 className="text-lg font-semibold text-gray-800">Template</h4>
                <button suppressHydrationWarning type="button" onClick={() => setActiveQuickModal(null)} className="rounded border border-gray-500 p-1 text-gray-600 hover:bg-gray-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4 px-4 py-4">
                <p className="text-sm text-gray-700">You can choose a predefined template and click on send button, but It&apos;s completely optional. You can also send without selecting template.</p>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Choose WhatsApp Template</label>
                  <div className="relative">
                    <select suppressHydrationWarning className="w-full appearance-none rounded border border-gray-300 px-3 py-2 text-sm text-gray-600 outline-none">
                      <option>Select Template</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end border-t border-gray-200 px-4 py-3">
                <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Send</button>
              </div>
            </div>
          ) : null}

          {activeQuickModal === "note" ? (
            <div className="w-full max-w-[720px] rounded border border-gray-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h4 className="text-[30px] font-semibold text-gray-800">Add Note</h4>
                <button suppressHydrationWarning type="button" onClick={() => setActiveQuickModal(null)} className="rounded border border-gray-500 p-1 text-gray-600 hover:bg-gray-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-4 py-4">
                <label className="mb-1 block text-sm font-semibold text-gray-700">Note</label>
                <textarea suppressHydrationWarning rows={3} placeholder="Enter Notes" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none" />
              </div>
              <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-3">
                <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Submit</button>
                <button suppressHydrationWarning type="button" onClick={() => setActiveQuickModal(null)} className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Cancel</button>
              </div>
            </div>
          ) : null}

          {activeQuickModal === "email" ? (
            <div className="w-full max-w-[1200px] rounded border border-gray-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h4 className="text-lg font-semibold text-gray-800">Compose Mail</h4>
                <button suppressHydrationWarning type="button" onClick={() => setActiveQuickModal(null)} className="rounded border border-gray-500 p-1 text-gray-600 hover:bg-gray-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3 px-4 py-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Select Template</label>
                  <div className="relative">
                    <select suppressHydrationWarning className="w-full appearance-none rounded border border-gray-300 px-3 py-2 text-sm text-gray-600 outline-none">
                      <option>Select Templates</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <input suppressHydrationWarning placeholder="From Email Name" className="rounded border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <input suppressHydrationWarning placeholder="From Email" className="rounded border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <input suppressHydrationWarning placeholder="Mail To: Type & Press Enter" className="rounded border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <input suppressHydrationWarning placeholder="Reply To: Type & Press Enter" className="rounded border border-gray-300 px-3 py-2 text-sm outline-none" />
                </div>
                <input suppressHydrationWarning placeholder="Enter Subject for the mail." className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none" />
                <div className="rounded border border-gray-300">
                  <div className="border-b border-gray-200 px-2 py-1 text-xs text-gray-600">B I U • Heading • Link • Align</div>
                  <textarea suppressHydrationWarning rows={6} placeholder="Compose Mail" className="w-full resize-y px-3 py-2 text-sm outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-3">
                <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Send</button>
                <button suppressHydrationWarning type="button" className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Clear</button>
              </div>
            </div>
          ) : null}

          {activeQuickModal === "call" ? (
            <div className="w-full max-w-[560px] rounded border border-gray-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h4 className="text-xl font-semibold text-gray-800">Please Select Number</h4>
                <button suppressHydrationWarning type="button" onClick={() => setActiveQuickModal(null)} className="rounded border border-gray-500 p-1 text-gray-600 hover:bg-gray-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-4">
                <label className="inline-flex items-center gap-2 text-base text-gray-700">
                  <input suppressHydrationWarning type="radio" name="call-number" className="h-4 w-4" defaultChecked />
                  +91-9970094776 (Primary No.)
                </label>
                <button suppressHydrationWarning type="button" className="rounded bg-[#7ea8df] px-5 py-2 text-base font-medium text-white hover:bg-[#6a97d2]">Call</button>
              </div>
            </div>
          ) : null}

          {activeQuickModal === "sms" ? (
            <div className="w-full max-w-[760px] rounded border border-gray-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h4 className="text-lg font-semibold text-gray-800">Send SMS</h4>
                <button suppressHydrationWarning type="button" onClick={() => setActiveQuickModal(null)} className="rounded border border-gray-500 p-1 text-gray-600 hover:bg-gray-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3 px-4 py-4">
                <div className="relative">
                  <select suppressHydrationWarning className="w-full appearance-none rounded border border-gray-300 px-3 py-2 text-sm text-gray-600 outline-none">
                    <option>Select Template</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                <input suppressHydrationWarning placeholder="Sender Name" className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none" />
                <input suppressHydrationWarning placeholder="Message To: 9970094776  + Contact Number" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none" />
                <textarea suppressHydrationWarning rows={3} placeholder="Enter Message." className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none" />
              </div>
              <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-3">
                <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Send</button>
                <button suppressHydrationWarning type="button" className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Clear</button>
              </div>
            </div>
          ) : null}

          {activeQuickModal === "task" ? (
            <div className="w-full max-w-[760px] rounded border border-gray-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h4 className="text-lg font-semibold text-gray-800">Add Task for {leadName}</h4>
                <button suppressHydrationWarning type="button" onClick={() => setActiveQuickModal(null)} className="rounded border border-gray-500 p-1 text-gray-600 hover:bg-gray-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3 px-4 py-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <input suppressHydrationWarning defaultValue="Call" className="rounded border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <input suppressHydrationWarning defaultValue="Aman Dubey" className="rounded border border-gray-300 px-3 py-2 text-sm outline-none" />
                </div>
                <input suppressHydrationWarning defaultValue="Call at Apr 28, 2026, 2:04 PM" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none" />
                <textarea suppressHydrationWarning rows={3} placeholder="Enter Remark" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none" />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm">
                    <span>Remind me?</span>
                    <span className="inline-flex h-5 w-9 rounded-full bg-[#1a56db]/20 p-0.5"><span className="h-4 w-4 rounded-full bg-[#1a56db]" /></span>
                  </div>
                  <div className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm">
                    <span>Completed?</span>
                    <span className="inline-flex h-5 w-9 rounded-full bg-gray-200 p-0.5"><span className="h-4 w-4 rounded-full bg-white" /></span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="flex overflow-hidden rounded border border-gray-300">
                    <input suppressHydrationWarning defaultValue="Apr 28, 2026, 2:04 PM" className="w-full px-3 py-2 text-sm outline-none" />
                    <button suppressHydrationWarning type="button" className="border-l border-gray-300 bg-gray-100 px-3 text-gray-600">
                      <CalendarDays className="h-4 w-4" />
                    </button>
                  </div>
                  <input suppressHydrationWarning defaultValue="15 Minute" className="rounded border border-gray-300 px-3 py-2 text-sm outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-3">
                <button suppressHydrationWarning type="button" className="rounded bg-[#1a56db] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Submit</button>
                <button suppressHydrationWarning type="button" onClick={() => setActiveQuickModal(null)} className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Cancel</button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SiteVisitTableRow({ no, date, lead, mobile, frequency, project, schDate, title, remark, assignedBy, assignedTo, preSalesAgent, channelPartner, isCpPresent, sourcingAgent, visitType, stage, source, feedbackStatus, feedback, status, completedOn, completedBy, onLeadClick }: { no: string, date: string, lead: string, mobile: string, frequency: string, project: string, schDate: string, title: string, remark: string, assignedBy: string, assignedTo: string, preSalesAgent: string, channelPartner: string, isCpPresent: string, sourcingAgent: string, visitType: string, stage: string, source: string, feedbackStatus: string, feedback: string, status: string, completedOn: string, completedBy: string, onLeadClick?: (lead: string) => void }) {
  return (
    <tr className="hover:bg-gray-50 text-[13px] text-gray-600">
      <td className="py-2.5 px-4 border-r border-gray-100"><input suppressHydrationWarning type="checkbox" className="rounded border-gray-300" /></td>
      <td className="py-2.5 px-3 border-r border-gray-100 text-center">{no}</td>
      <td className="py-2.5 px-4 border-r border-gray-100 whitespace-nowrap">{date}</td>
      <td className="py-2.5 px-4 border-r border-gray-100 whitespace-nowrap">
        <button
          suppressHydrationWarning
          type="button"
          className="text-[#1a56db] hover:underline font-medium"
          onClick={() => onLeadClick?.(lead)}
        >
          {lead}
        </button>
      </td>
      <td className="py-2.5 px-4 border-r border-gray-100 whitespace-nowrap">{mobile}</td>
      <td className="py-2.5 px-4 border-r border-gray-100 whitespace-nowrap">
        <span className="bg-[#1a56db] text-white text-[10px] px-2 py-1 rounded font-medium uppercase tracking-wider">Lead</span>
      </td>
      <td className="py-2.5 px-4 border-r border-gray-100 whitespace-nowrap">{frequency}</td>
      <td className="py-2.5 border-r border-gray-100 px-4 whitespace-nowrap">{project}</td>
      <td className="py-2.5 px-4 border-r border-gray-100 whitespace-nowrap">{schDate}</td>
      <td className="py-2.5 px-4 border-r border-gray-100 max-w-[150px] truncate" title={title}>{title}</td>
      <td className="py-2.5 px-4 border-r border-gray-100 max-w-[200px] truncate" title={remark}>{remark}</td>
      <td className="py-2.5 px-4 border-r border-gray-100 whitespace-nowrap">{assignedBy}</td>
      <td className="py-2.5 px-4 border-r border-gray-100 font-semibold text-gray-800 whitespace-nowrap">{assignedTo}</td>
      <td className="py-2.5 px-4 border-r border-gray-100 whitespace-nowrap">{preSalesAgent}</td>
      <td className="py-2.5 px-4 border-r border-gray-100 whitespace-nowrap">{channelPartner}</td>
      <td className="py-2.5 px-4 border-r border-gray-100 whitespace-nowrap">{isCpPresent}</td>
      <td className="py-2.5 px-4 border-r border-gray-100 whitespace-nowrap">{sourcingAgent}</td>
      <td className="py-2.5 px-4 border-r border-gray-100 whitespace-nowrap">{visitType}</td>
      <td className="py-2.5 px-4 border-r border-gray-100 whitespace-nowrap">{stage}</td>
      <td className="py-2.5 px-4 border-r border-gray-100 whitespace-nowrap">{source}</td>
      <td className="py-2.5 px-4 border-r border-gray-100 whitespace-nowrap">
        {feedbackStatus && <span className="bg-[#00c292] text-white text-[11px] px-2 py-1 rounded font-medium">{feedbackStatus}</span>}
      </td>
      <td className="py-2.5 px-4 border-r border-gray-100 max-w-[150px] truncate" title={feedback}>{feedback}</td>
      <td className="py-2.5 px-4 border-r border-gray-100 whitespace-nowrap">
        {status && <span className="bg-[#00c292] text-white text-[11px] px-2 py-1 rounded font-medium flex items-center w-fit gap-1"><span className="w-3 h-3 bg-white rounded-full flex items-center justify-center text-[#00c292] font-bold text-[8px]">✓</span> {status}</span>}
      </td>
      <td className="py-2.5 px-4 border-r border-gray-100 whitespace-nowrap">{completedOn}</td>
      <td className="py-2.5 px-4 border-r border-gray-100 whitespace-nowrap">{completedBy}</td>
      <td className="py-2.5 px-4 whitespace-nowrap"></td>
    </tr>
  );
}

function TimeSlot({ time }: { time: string }) {
  return (
    <div className="relative border-t border-gray-200 h-20 flex">
      <div className="w-16 shrink-0 py-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-100">{time}</div>
      <div className="flex-1 relative bg-white">
        <div className="absolute inset-0 border-b border-gray-100 border-dashed top-1/2"></div>
      </div>
    </div>
  );
}

function CalendarEvent({ text, className = "" }: { text: string, className?: string }) {
  return (
    <div className={`bg-[#e0efff] border border-[#a3cfff] text-[#1a56db] text-[11px] px-2 py-1 rounded cursor-pointer hover:bg-[#d0e5ff] transition-colors truncate ${className}`} title={text}>
      {text}
    </div>
  );
}


