"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Users, User, RefreshCcw, Hand, UserMinus, 
  ClipboardList, Home, Phone, PhoneOutgoing, 
  PhoneCall, Voicemail, Building, Handshake,
  MoreVertical, ChevronDown
} from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("Tasks");

  return (
    <div className="space-y-6 bg-[#f4f7f6] p-6 min-h-screen font-sans text-gray-800">
      {/* All Leads Section */}
      <section className="bg-white rounded-md shadow-sm p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 md:gap-0">
          <h2 className="text-lg font-semibold text-gray-700">All Leads</h2>
          <div className="flex flex-wrap gap-2">
            <select className="border border-gray-300 rounded text-sm px-3 py-1.5 text-gray-500 bg-white min-w-[150px] outline-none">
              <option>Select Team</option>
            </select>
            <select className="border border-gray-300 rounded text-sm px-3 py-1.5 text-gray-500 bg-white min-w-[150px] outline-none">
              <option>Select Sales Agent</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard title="Total Leads" value="8665" icon={<Users className="w-5 h-5 text-indigo-600" />} iconBg="bg-indigo-100" />
          <MetricCard title="Fresh Leads" value="7874" icon={<User className="w-5 h-5 text-blue-500" />} iconBg="bg-blue-100" />
          <MetricCard title="Returning" value="791" icon={<RefreshCcw className="w-5 h-5 text-red-400" />} iconBg="bg-red-100" />
          <MetricCard title="Untouched" value="0" icon={<Hand className="w-5 h-5 text-yellow-500" />} iconBg="bg-yellow-100" />
          <MetricCard title="Unassigned" value="0" icon={<UserMinus className="w-5 h-5 text-green-500" />} iconBg="bg-green-100" />
        </div>
      </section>

      {/* Today's Leads Section */}
      <section className="bg-white rounded-md shadow-sm p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 md:gap-0">
          <h2 className="text-lg font-semibold text-gray-700">Today's Leads</h2>
          <div className="flex flex-wrap gap-2">
            <select className="border border-gray-300 rounded text-sm px-3 py-1.5 text-gray-500 bg-white min-w-[150px] outline-none">
              <option>Select Team</option>
            </select>
            <select className="border border-gray-300 rounded text-sm px-3 py-1.5 text-gray-500 bg-white min-w-[150px] outline-none">
              <option>Select Sales Agent</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard title="Leads" value="7" icon={<Users className="w-5 h-5 text-indigo-600" />} iconBg="bg-indigo-100" />
          <MetricCard title="Fresh Leads" value="7" icon={<User className="w-5 h-5 text-blue-500" />} iconBg="bg-blue-100" />
          <MetricCard title="Returning" value="1" icon={<RefreshCcw className="w-5 h-5 text-red-400" />} iconBg="bg-red-100" />
          <MetricCard title="Tasks" value="34" icon={<ClipboardList className="w-5 h-5 text-yellow-500" />} iconBg="bg-yellow-100" />
          <MetricCard title="Site Visits" value="0" icon={<Home className="w-5 h-5 text-green-500" />} iconBg="bg-green-100" />
        </div>
      </section>

      {/* Today's Activities Report */}
      <section className="bg-white rounded-md shadow-sm p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Today's Activities Report</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <select className="border border-gray-300 rounded text-sm px-3 py-1.5 text-gray-500 bg-white min-w-[150px] outline-none">
              <option>Select Team</option>
            </select>
            <select className="border border-gray-300 rounded text-sm px-3 py-1.5 text-gray-500 bg-white min-w-[150px] outline-none">
              <option>Select Sales Agent</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
            <ActivityItem title="Tasks" value="26" icon={<ClipboardList className="w-4 h-4 text-yellow-500" />} iconBg="bg-yellow-100" />
            <ActivityItem title="Total Offline Calls" value="0" icon={<Phone className="w-4 h-4 text-blue-500" />} iconBg="bg-blue-100" />
            <ActivityItem title="Total IVR Calls" value="0" icon={<PhoneCall className="w-4 h-4 text-indigo-500" />} iconBg="bg-indigo-100" />
            
            <ActivityItem title="Meetings" value="0" icon={<Handshake className="w-4 h-4 text-cyan-500" />} iconBg="bg-cyan-100" />
            <ActivityItem title="Calls To Lead" value="0" icon={<Users className="w-4 h-4 text-purple-500" />} iconBg="bg-purple-100" />
            <ActivityItem title="Calls To Lead" value="0" icon={<Users className="w-4 h-4 text-purple-500" />} iconBg="bg-purple-100" />
            
            <ActivityItem title="Site Visit Scheduled" value="0" icon={<Home className="w-4 h-4 text-green-500" />} iconBg="bg-green-100" />
            <ActivityItem title="Calls To Contact" value="0" icon={<User className="w-4 h-4 text-blue-500" />} iconBg="bg-blue-100" />
            <ActivityItem title="Calls To Contact" value="0" icon={<User className="w-4 h-4 text-blue-500" />} iconBg="bg-blue-100" />
            
            <ActivityItem title="Site Visit Completed" value="0" icon={<Home className="w-4 h-4 text-green-500" />} iconBg="bg-green-100" />
            <ActivityItem title="Calls To Channel Partner" value="0" icon={<MoreVertical className="w-4 h-4 text-gray-500" />} iconBg="bg-gray-100" />
            <ActivityItem title="Calls To Channel Partner" value="0" icon={<MoreVertical className="w-4 h-4 text-gray-500" />} iconBg="bg-gray-100" />
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="bg-white rounded-md shadow-sm">
        <div className="flex border-b border-gray-200">
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'Tasks' ? 'bg-[#1a56db] text-white' : 'text-[#1a56db] hover:bg-gray-50'}`}
            onClick={() => setActiveTab('Tasks')}
          >
            Tasks
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'Site Visit' ? 'bg-[#1a56db] text-white' : 'text-[#1a56db] hover:bg-gray-50'}`}
            onClick={() => setActiveTab('Site Visit')}
          >
            Site Visit
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'Tasks' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-700">Task (34)</h3>
                <select className="border border-gray-300 rounded text-sm px-3 py-1.5 text-gray-500 bg-white min-w-[120px] outline-none">
                  <option>Today</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-y">
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
                  <tbody className="divide-y divide-gray-100">
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

          {activeTab === 'Site Visit' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-700">Site Visit (0)</h3>
                <select className="border border-gray-300 rounded text-sm px-3 py-1.5 text-gray-500 bg-white min-w-[120px] outline-none">
                  <option>Today</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-y">
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
                      <td colSpan={10} className="py-4 text-center text-gray-500 border-b">No Data Found</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Executive Lead Analysis */}
      <section className="bg-white rounded-md shadow-sm p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
          <h2 className="text-lg font-semibold text-gray-700">Executive Lead Analysis</h2>
          <div className="flex flex-wrap gap-2">
            <select className="border border-gray-300 rounded text-sm px-3 py-1.5 text-gray-500 bg-white min-w-[150px] outline-none">
              <option>Select Team</option>
            </select>
            <select className="border border-gray-300 rounded text-sm px-3 py-1.5 text-gray-500 bg-white min-w-[150px] outline-none">
              <option>Select Sales Agent</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ title, value, icon, iconBg }: { title: string, value: string, icon: React.ReactNode, iconBg: string }) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-100 rounded shadow-sm relative overflow-hidden bg-white">
      {/* Blue left border marker */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1a56db]"></div>
      
      <div className="pl-2">
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-xl font-semibold text-gray-700">{value}</p>
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
        <span className="text-sm text-gray-600">{title}</span>
      </div>
      <span className="text-sm font-semibold text-gray-700">{value}</span>
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
    <tr className="hover:bg-gray-50">
      <td className="py-3 px-4">{id}</td>
      <td className="py-3 px-4 text-gray-700">{details}</td>
      <td className="py-3 px-4">
        <span className="bg-[#1a56db] text-white text-[10px] px-2 py-1 rounded font-medium uppercase tracking-wider">Lead</span>
      </td>
      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
        {date.split(',')[0]},<br />{date.split(',')[1]}
      </td>
      <td className="py-3 px-4 text-gray-600 max-w-xs truncate" title={agenda}>{agenda}</td>
      <td className="py-3 px-4 text-gray-600">Call</td>
      <td className="py-3 px-4 text-gray-600">{agent}</td>
      <td className="py-3 px-4">
        <span className="bg-[#ff5b5b] text-white text-[10px] px-2 py-1 rounded font-medium flex items-center gap-1 w-max">
          <span className="w-2 h-2 rounded-full bg-white opacity-50"></span> To Do
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="relative inline-block text-left" ref={actionRef}>
          <button 
            className="bg-[#1a56db] hover:bg-blue-700 text-white p-1.5 rounded flex items-center justify-center transition-colors shadow-sm"
            onClick={() => setIsActionOpen(!isActionOpen)}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          {isActionOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded shadow-lg py-1 z-50">
              <button 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsActionOpen(false)}
              >
                Mark as done
              </button>
              <button 
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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



