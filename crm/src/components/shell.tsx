"use client";

import { useState } from "react";
import { Bell, Check, ChevronDown, Phone } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";

interface ShellProps {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export function Shell({ children, user }: ShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);

  const reminderRows = [
    { name: "Naeem Barmare", date: "Apr 28, 2026, 10:43:59 AM", note: "ringing" },
    { name: "Vishal Chaudhary", date: "Apr 28, 2026, 11:19:00 AM", note: "busy" },
    { name: "Pau Kamble", date: "Apr 28, 2026, 11:19:41 AM", note: "looking for 2bhk for investment purpose reside in sion details share renucorp and today element" },
    { name: "Sandhya Cavan", date: "Apr 28, 2026, 11:28:00 AM", note: "looking for 1bhk budget not disclose cb" },
    { name: "Amit Gupta", date: "Apr 28, 2026, 11:29:00 AM", note: "said not looking any property need cross call" },
    { name: "Swarup Ghodake", date: "Apr 28, 2026, 11:30:00 AM", note: "busy" },
    { name: "Vijay Kakad", date: "Apr 28, 2026, 11:31:00 AM", note: "busy" },
  ];

  return (
    <div className="flex h-screen w-full bg-background">
      <div className="relative z-20 shrink-0">
        <Sidebar isCollapsed={isCollapsed} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} user={user} />
        {/* Global reminders shortcut shown across protected pages */}
        <button
          suppressHydrationWarning
          type="button"
          onClick={() => setIsRemindersOpen(true)}
          className="fixed right-0 top-[68px] z-[60] flex h-12 w-12 items-center justify-center bg-[#ff5a1f] text-white shadow-[0_4px_12px_rgba(0,0,0,0.28)] hover:bg-[#ea4c14]"
          aria-label="Reminders"
          title="Reminders"
        >
          <Bell className="h-4 w-4 fill-current" />
        </button>
        <main id="app-main" className="relative flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>

      <div
        className={`fixed inset-0 z-[90] transition-colors duration-200 ${
          isRemindersOpen ? "pointer-events-auto bg-black/20" : "pointer-events-none bg-black/0"
        }`}
        onClick={() => setIsRemindersOpen(false)}
      >
        <aside
          className={`absolute right-0 top-[64px] h-[calc(100vh-64px)] w-full max-w-[360px] overflow-hidden border-l border-gray-300 bg-[#f5f6f8] shadow-2xl transition-transform duration-200 ease-out ${
            isRemindersOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
          aria-label="Reminders panel"
        >
            <div className="border-b border-gray-300 bg-[#f5f6f8] px-6 py-4">
              <h2 className="text-[36px] font-semibold text-[#3f4a63]">Reminders</h2>
              <div className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <select
                    suppressHydrationWarning
                    className="h-10 w-full appearance-none rounded border border-gray-300 bg-white px-3 pr-8 text-[13px] text-gray-700 outline-none"
                  >
                    <option>Select Sales Agent</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
                <div className="relative w-[128px]">
                  <select
                    suppressHydrationWarning
                    className="h-10 w-full appearance-none rounded border border-gray-300 bg-white px-3 pr-8 text-[13px] text-gray-700 outline-none"
                  >
                    <option>Todays</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </div>
            </div>

            <div className="h-[calc(100%-98px)] overflow-y-auto border-t border-gray-200 bg-[#f5f6f8] px-4 py-4">
              <div className="relative border-l-2 border-gray-300 pl-7">
                {reminderRows.map((item) => (
                  <div key={`${item.name}-${item.date}`} className="relative mb-5 flex items-start justify-between gap-3">
                    <span className="absolute -left-[40px] top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#12c5b2] text-white shadow-sm">
                      <Phone className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 pr-1">
                      <button suppressHydrationWarning type="button" className="text-left text-[17px] font-semibold text-[#1565d8] underline">
                        {item.name}
                      </button>
                      <p className="text-[15px] text-gray-600">{item.date}</p>
                      <p className="text-[17px] text-[#4a556e]">{item.note}</p>
                    </div>
                    <button
                      suppressHydrationWarning
                      type="button"
                      className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#1565d8] text-white"
                      aria-label="Mark reminder as done"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
        </aside>
      </div>
    </div>
  );
}
