"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListTodo,
  Users,
  LogOut,
  Building2,
  CalendarRange,
  BarChart3,
  UserCog,
  Megaphone,
} from "lucide-react";
import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const CRM_SUBMENU = [
  { label: "Contacts", href: "/crm/contacts" },
  { label: "Leads", href: "/crm/leads" },
  { label: "Activities", href: "/crm/activities" },
  { label: "Logs", href: "/crm/logs" },
  { label: "Channel Partner", href: "/crm/channel-partner" },
  { label: "Property", href: "/crm/property" },
  { label: "Projects", href: "/crm/projects" },
] as const;

const BOOKINGS_SUBMENU = [
  { label: "Booked List", href: "/bookings/booked-list" },
  { label: "Deals", href: "/bookings/deals" },
  { label: "Received Payments", href: "/bookings/received-payments" },
] as const;

const MANAGE_SUBMENU = [
  { label: "Company Info", href: "/manage/company-info" },
  { label: "Subscriptions", href: "/manage/subscriptions" },
  { label: "Users & Teams", href: "/manage/users-teams" },
  { label: "Settings", href: "/manage/settings" },
  { label: "API-Doc", href: "/manage/api-doc" },
] as const;

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/crm", label: "CRM", icon: Users },
  { href: "/bookings", label: "Bookings", icon: CalendarRange },
  { href: "/campaigns", label: "Campaign", icon: Megaphone },
  { href: "/accounts", label: "Accounts", icon: Building2 },
  { href: "/report", label: "Report", icon: BarChart3 },
  { href: "/manage", label: "Manage", icon: UserCog },
];

export function Sidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname();
  const [crmMenuOpen, setCrmMenuOpen] = useState(false);
  const [bookingsMenuOpen, setBookingsMenuOpen] = useState(false);
  const [manageMenuOpen, setManageMenuOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [crmPos, setCrmPos] = useState({ top: 0, left: 0 });
  const [bookingsPos, setBookingsPos] = useState({ top: 0, left: 0 });
  const [managePos, setManagePos] = useState({ top: 0, left: 0 });
  const crmCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bookingsCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manageCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crmTriggerRef = useRef<HTMLDivElement | null>(null);
  const bookingsTriggerRef = useRef<HTMLDivElement | null>(null);
  const manageTriggerRef = useRef<HTMLDivElement | null>(null);

  const cancelCrmClose = () => {
    if (crmCloseTimer.current) {
      clearTimeout(crmCloseTimer.current);
      crmCloseTimer.current = null;
    }
  };

  const updateCrmMenuPosition = useCallback(() => {
    const el = crmTriggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Slight left overlap + bridge below so the pointer can cross the gap without closing the menu
    setCrmPos({ top: rect.top, left: rect.right - 8 });
  }, []);

  const openCrmMenu = () => {
    cancelCrmClose();
    updateCrmMenuPosition();
    setCrmMenuOpen(true);
  };

  const scheduleCrmClose = () => {
    cancelCrmClose();
    crmCloseTimer.current = setTimeout(() => setCrmMenuOpen(false), 160);
  };

  const cancelBookingsClose = () => {
    if (bookingsCloseTimer.current) {
      clearTimeout(bookingsCloseTimer.current);
      bookingsCloseTimer.current = null;
    }
  };

  const updateBookingsMenuPosition = useCallback(() => {
    const el = bookingsTriggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setBookingsPos({ top: rect.top, left: rect.right - 8 });
  }, []);

  const openBookingsMenu = () => {
    cancelBookingsClose();
    updateBookingsMenuPosition();
    setBookingsMenuOpen(true);
  };

  const scheduleBookingsClose = () => {
    cancelBookingsClose();
    bookingsCloseTimer.current = setTimeout(() => setBookingsMenuOpen(false), 160);
  };

  const cancelManageClose = () => {
    if (manageCloseTimer.current) {
      clearTimeout(manageCloseTimer.current);
      manageCloseTimer.current = null;
    }
  };

  const updateManageMenuPosition = useCallback(() => {
    const el = manageTriggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setManagePos({ top: rect.top, left: rect.right - 8 });
  }, []);

  const openManageMenu = () => {
    cancelManageClose();
    updateManageMenuPosition();
    setManageMenuOpen(true);
  };

  const scheduleManageClose = () => {
    cancelManageClose();
    manageCloseTimer.current = setTimeout(() => setManageMenuOpen(false), 160);
  };

  useEffect(() => () => cancelCrmClose(), []);
  useEffect(() => () => cancelBookingsClose(), []);
  useEffect(() => () => cancelManageClose(), []);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useLayoutEffect(() => {
    if (!crmMenuOpen) return;
    updateCrmMenuPosition();
  }, [crmMenuOpen, isCollapsed, pathname, updateCrmMenuPosition]);

  useLayoutEffect(() => {
    if (!bookingsMenuOpen) return;
    updateBookingsMenuPosition();
  }, [bookingsMenuOpen, isCollapsed, pathname, updateBookingsMenuPosition]);

  useLayoutEffect(() => {
    if (!manageMenuOpen) return;
    updateManageMenuPosition();
  }, [manageMenuOpen, isCollapsed, pathname, updateManageMenuPosition]);

  useEffect(() => {
    if (!crmMenuOpen) return;
    const onScrollOrResize = () => updateCrmMenuPosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [crmMenuOpen, updateCrmMenuPosition]);

  useEffect(() => {
    if (!bookingsMenuOpen) return;
    const onScrollOrResize = () => updateBookingsMenuPosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [bookingsMenuOpen, updateBookingsMenuPosition]);

  useEffect(() => {
    if (!manageMenuOpen) return;
    const onScrollOrResize = () => updateManageMenuPosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [manageMenuOpen, updateManageMenuPosition]);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col overflow-x-hidden border-r bg-card transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className={cn("flex h-16 shrink-0 items-center bg-primary text-primary-foreground", isCollapsed ? "justify-center px-2" : "px-4")}>
        {isCollapsed ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white font-bold text-primary">
            F
          </div>
        ) : (
          <div className="flex items-center relative w-full pl-2">
            <div className="absolute left-0 h-8 w-8 rounded-full bg-white mix-blend-overlay opacity-90" style={{ transform: 'translateX(-10px)' }}></div>
            <span className="text-[17px] font-bold z-10 tracking-wide">FD Makan</span>
          </div>
        )}
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-x-hidden overflow-y-auto p-4 pb-8">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const isCrm = link.href === "/crm";
          const isBookings = link.href === "/bookings";
          const isManage = link.href === "/manage";

          if (isCrm) {
            return (
              <div
                key={link.href}
                ref={crmTriggerRef}
                className="w-full"
                onMouseEnter={openCrmMenu}
                onMouseLeave={scheduleCrmClose}
              >
                <Link
                  href={link.href}
                  className={cn(
                    "flex w-full items-center rounded-lg px-3 py-2 text-sm",
                    isCollapsed ? "justify-center" : "gap-2",
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                  title={isCollapsed ? link.label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{link.label}</span>}
                </Link>
              </div>
            );
          }

          if (isBookings) {
            return (
              <div
                key={link.href}
                ref={bookingsTriggerRef}
                className="w-full"
                onMouseEnter={openBookingsMenu}
                onMouseLeave={scheduleBookingsClose}
              >
                <Link
                  href={link.href}
                  className={cn(
                    "flex w-full items-center rounded-lg px-3 py-2 text-sm",
                    isCollapsed ? "justify-center" : "gap-2",
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                  title={isCollapsed ? link.label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{link.label}</span>}
                </Link>
              </div>
            );
          }

          if (isManage) {
            return (
              <div
                key={link.href}
                ref={manageTriggerRef}
                className="w-full"
                onMouseEnter={openManageMenu}
                onMouseLeave={scheduleManageClose}
              >
                <Link
                  href={link.href}
                  className={cn(
                    "flex w-full items-center rounded-lg px-3 py-2 text-sm",
                    isCollapsed ? "justify-center" : "gap-2",
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                  title={isCollapsed ? link.label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{link.label}</span>}
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm",
                isCollapsed ? "justify-center" : "gap-2",
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
              title={isCollapsed ? link.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4 flex justify-center border-t">
        <Button 
          variant="outline" 
          className={cn("w-full", isCollapsed && "px-0")} 
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-2")} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>

      {portalReady &&
        crmMenuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="menu"
            aria-hidden={false}
            onMouseEnter={openCrmMenu}
            onMouseLeave={scheduleCrmClose}
            className="fixed z-[200] flex max-h-[min(100vh-16px,480px)] max-w-[min(calc(100vw-12px),280px)] translate-x-0 flex-row items-start transition-all duration-200 ease-out will-change-transform"
            style={{ top: crmPos.top, left: crmPos.left }}
          >
            <div className="h-10 w-2 shrink-0" aria-hidden />
            <div className="min-w-[220px] flex-1 overflow-y-auto overscroll-contain rounded-md border border-border bg-card py-2 shadow-lg">
              {CRM_SUBMENU.map((item) => {
                const subActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium transition-colors",
                      subActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span className={cn("select-none", subActive ? "text-primary-foreground" : "text-muted-foreground")} aria-hidden>
                      &gt;&gt;
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>,
          document.body,
        )}

      {portalReady &&
        bookingsMenuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="menu"
            aria-hidden={false}
            onMouseEnter={openBookingsMenu}
            onMouseLeave={scheduleBookingsClose}
            className="fixed z-[200] flex max-h-[min(100vh-16px,480px)] max-w-[min(calc(100vw-12px),280px)] translate-x-0 flex-row items-start transition-all duration-200 ease-out will-change-transform"
            style={{ top: bookingsPos.top, left: bookingsPos.left }}
          >
            <div className="h-10 w-2 shrink-0" aria-hidden />
            <div className="min-w-[220px] flex-1 overflow-y-auto overscroll-contain rounded-md border border-border bg-card py-2 shadow-lg">
              {BOOKINGS_SUBMENU.map((item) => {
                const subActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium transition-colors",
                      subActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span className={cn("select-none", subActive ? "text-primary-foreground" : "text-muted-foreground")} aria-hidden>
                      &gt;&gt;
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>,
          document.body,
        )}

      {portalReady &&
        manageMenuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="menu"
            aria-hidden={false}
            onMouseEnter={openManageMenu}
            onMouseLeave={scheduleManageClose}
            className="fixed z-[200] flex max-h-[min(100vh-16px,480px)] max-w-[min(calc(100vw-12px),280px)] translate-x-0 flex-row items-start transition-all duration-200 ease-out will-change-transform"
            style={{ top: managePos.top, left: managePos.left }}
          >
            <div className="h-10 w-2 shrink-0" aria-hidden />
            <div className="min-w-[220px] flex-1 overflow-y-auto overscroll-contain rounded-md border border-border bg-card py-2 shadow-lg">
              {MANAGE_SUBMENU.map((item) => {
                const subActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium transition-colors",
                      subActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span className={cn("select-none", subActive ? "text-primary-foreground" : "text-muted-foreground")} aria-hidden>
                      &gt;&gt;
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </aside>
  );
}
