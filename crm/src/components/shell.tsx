"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Check, ChevronDown, Phone, X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";

interface ShellProps {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null; image?: string | null };
}

const reminderRows = [
  { name: "Naeem Barmare", date: "Apr 28, 2026, 10:43 AM", note: "Ringing" },
  { name: "Vishal Chaudhary", date: "Apr 28, 2026, 11:19 AM", note: "Busy" },
  {
    name: "Pau Kamble",
    date: "Apr 28, 2026, 11:19 AM",
    note: "Looking for 2 BHK for investment — Sion; details shared for Renucorp and Today Element.",
  },
  {
    name: "Sandhya Cavan",
    date: "Apr 28, 2026, 11:28 AM",
    note: "Looking for 1 BHK; budget not disclosed; callback requested.",
  },
  { name: "Amit Gupta", date: "Apr 28, 2026, 11:29 AM", note: "Not looking for property; schedule cross-call." },
  { name: "Swarup Ghodake", date: "Apr 28, 2026, 11:30 AM", note: "Busy" },
  { name: "Vijay Kakad", date: "Apr 28, 2026, 11:31 AM", note: "Busy" },
] as const;

export function Shell({ children, user }: ShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);

  const closeReminders = useCallback(() => setIsRemindersOpen(false), []);

  useEffect(() => {
    if (!isRemindersOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeReminders();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isRemindersOpen, closeReminders]);

  return (
    <div className="flex h-screen w-full bg-background">
      <div className="relative z-20 shrink-0">
        <Sidebar isCollapsed={isCollapsed} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} user={user} />
        <button
          suppressHydrationWarning
          type="button"
          onClick={() => setIsRemindersOpen(true)}
          className="fixed right-0 top-[64px] z-[60] flex h-10 w-10 items-center justify-center rounded-l-md bg-[#ff5a1f] text-white shadow-md transition-colors hover:bg-[#ea4c14]"
          aria-label="Open reminders"
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
          isRemindersOpen ? "pointer-events-auto bg-black/30" : "pointer-events-none bg-transparent"
        }`}
        onClick={closeReminders}
        aria-hidden={!isRemindersOpen}
      >
        <aside
          className={`absolute right-0 top-[64px] flex h-[calc(100vh-64px)] w-full max-w-[380px] flex-col border-l border-gray-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-transform duration-200 ease-out ${
            isRemindersOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reminders-drawer-title"
        >
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 px-3 py-3">
            <div className="min-w-0">
              <h2 id="reminders-drawer-title" className="text-sm font-semibold tracking-tight text-[#3f4658]">
                Reminders
              </h2>
              <p className="mt-0.5 text-[11px] leading-snug text-gray-500">Callback queue for the selected agent and date.</p>
            </div>
            <button
              suppressHydrationWarning
              type="button"
              onClick={closeReminders}
              className="shrink-0 rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
              aria-label="Close reminders"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex shrink-0 flex-wrap gap-2 border-b border-gray-100 bg-gray-50/80 px-3 py-2.5">
            <div className="relative min-w-[140px] flex-1">
              <select
                suppressHydrationWarning
                className="h-8 w-full cursor-pointer appearance-none rounded border border-gray-300 bg-white pl-2 pr-7 text-xs text-[#3f4658] outline-none transition-colors focus:border-[#1a56db]"
                defaultValue=""
              >
                <option value="">Sales agent</option>
                <option value="all">All agents</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative w-[108px] shrink-0">
              <select
                suppressHydrationWarning
                className="h-8 w-full cursor-pointer appearance-none rounded border border-gray-300 bg-white pl-2 pr-7 text-xs text-[#3f4658] outline-none transition-colors focus:border-[#1a56db]"
                defaultValue="today"
              >
                <option value="today">Today</option>
                <option value="week">This week</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[#f7f8fb] px-3 py-3">
            <ul className="flex flex-col gap-2">
              {reminderRows.map((item) => (
                <li
                  key={`${item.name}-${item.date}`}
                  className="rounded-md border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex gap-2.5">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600 ring-1 ring-teal-100"
                      aria-hidden
                    >
                      <Phone className="h-3.5 w-3.5" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <button
                        suppressHydrationWarning
                        type="button"
                        className="text-left text-xs font-semibold text-[#1a56db] hover:underline"
                      >
                        {item.name}
                      </button>
                      <p className="mt-0.5 text-[11px] text-gray-500">{item.date}</p>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#4a5165]">{item.note}</p>
                    </div>
                    <button
                      suppressHydrationWarning
                      type="button"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-[#1a56db] transition-colors hover:border-[#1a56db] hover:bg-blue-50"
                      aria-label={`Mark reminder for ${item.name} as done`}
                      title="Mark done"
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
