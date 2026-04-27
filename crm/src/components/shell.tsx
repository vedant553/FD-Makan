"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";

interface ShellProps {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export function Shell({ children, user }: ShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background">
      <div className="relative z-20 shrink-0">
        <Sidebar isCollapsed={isCollapsed} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} user={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
