import { useState, useRef, useEffect } from "react";
import { Menu, Megaphone, Bell, ChevronDown, X, LogOut, User, Mail, Phone, Globe, Pencil, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface NavbarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export function Navbar({ isCollapsed, setIsCollapsed, user }: NavbarProps) {
  const [isUpdatesOpen, setIsUpdatesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMyProfileOpen, setIsMyProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user.name || "Aman Dubey",
    phone: "9987401146",
    email: user.email || "aman.fdmps@gmail.com",
    username: "fdmaman",
  });
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="relative z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-10 w-10 border-gray-200 shadow-sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <Menu className="h-5 w-5 text-gray-500" />
          </Button>
        </div>

        <div className="flex items-center space-x-4 md:space-x-6">
          <div className="flex items-center space-x-3">
            <button suppressHydrationWarning 
              className="relative p-2 text-gray-400 hover:text-gray-500 group"
              title="Project Update"
              onClick={() => {
                setIsUpdatesOpen(true);
                setIsNotificationsOpen(false);
              }}
            >
              <Megaphone className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600 border-2 border-white"></span>
            </button>
            <button suppressHydrationWarning 
              className="relative p-2 text-gray-400 hover:text-gray-500 group"
              title="Notifications"
              onClick={() => {
                setIsNotificationsOpen(true);
                setIsUpdatesOpen(false);
              }}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600 border-2 border-white"></span>
            </button>
          </div>

          <div className="relative" ref={profileRef}>
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {user.image ? (
                  <img src={user.image} alt={user.name || "User"} className="h-full w-full object-cover" />
                ) : (
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium text-gray-500 hidden md:inline-block">
                {user.name || "Aman Dubey"}
              </span>
              <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center text-white ml-1">
                <ChevronDown className="h-3 w-3" />
              </div>
            </div>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                <button suppressHydrationWarning 
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsMyProfileOpen(true);
                  }}
                >
                  <User className="mr-2 h-4 w-4" /> My Profile
                </button>
                <div className="h-px bg-gray-200 my-1"></div>
                <button suppressHydrationWarning 
                  onClick={() => signOut({ callbackUrl: "/login" })} 
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Project Updates Drawer */}
      {isUpdatesOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 transition-opacity" onClick={() => setIsUpdatesOpen(false)}>
          <div className="w-full max-w-[400px] h-full bg-slate-50 shadow-xl flex flex-col transform transition-transform" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b bg-white shrink-0">
              <h2 className="font-semibold text-lg text-slate-700">What&apos;s New In Buildesk CRM</h2>
              <button suppressHydrationWarning onClick={() => setIsUpdatesOpen(false)} className="text-gray-400 hover:text-gray-600">
                 <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Card 1 */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h3 className="font-bold text-blue-600 mb-1 text-[15px]">New Feature Update In Buildesk: Pre-sales Tagging</h3>
                <p className="text-xs text-gray-500 mb-3">Mar 11, 2026</p>
                <p className="text-[14px] text-gray-700 mb-4 leading-relaxed">
                  We&apos;re excited to introduce <strong>Pre-Sales Tagging</strong> in <strong>Buildesk</strong>. This feature allows you to tag or assign a <strong>Pre-Sales Agent</strong> to contacts, leads, and their...
                </p>
                <div className="flex justify-end">
                  <button suppressHydrationWarning className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm rounded font-medium">Read More</button>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h3 className="font-bold text-blue-600 mb-1 text-[15px]">Seamless Lead Navigation + Quick Actions In Profile</h3>
                <p className="text-xs text-gray-500 mb-3">Sep 6, 2025</p>
                <p className="text-[14px] font-medium text-gray-800 mb-2">🚀 Feature 1 - Seamless Lead Navigation</p>
                <p className="text-[14px] text-gray-700 mb-4 leading-relaxed">
                  &quot;Now, you can <strong>navigate from one lead to another without closing the profile page.</strong> No more going back and forth-simply...
                </p>
                <div className="flex justify-end">
                  <button suppressHydrationWarning className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm rounded font-medium">Read More</button>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h3 className="font-bold text-blue-600 mb-1 text-[15px]">🚀 Buildesk Feature Update: Smarter Task Due Time Logic ⏰</h3>
                <p className="text-xs text-gray-500 mb-3">Nov 19, 2024</p>
                <p className="text-[14px] text-gray-700 mb-4 leading-relaxed">
                  We&apos;ve updated how pending or overdue tasks are determined in Buildesk. Previously, a task was marked as overdue only after the end of the scheduled day...
                </p>
                <div className="flex justify-end">
                  <button suppressHydrationWarning className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm rounded font-medium">Read More</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Drawer */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 transition-opacity" onClick={() => setIsNotificationsOpen(false)}>
          <div className="w-full max-w-[380px] h-full bg-white shadow-xl flex flex-col transform transition-transform" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b bg-white shrink-0">
              <h2 className="font-semibold text-lg text-slate-700">Notifications</h2>
              <button suppressHydrationWarning onClick={() => setIsNotificationsOpen(false)} className="text-gray-400 hover:text-gray-600">
                 <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-0">
              <div className="border-b p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex gap-3">
                  <Bell className="h-5 w-5 text-gray-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-[15px]">Call Reminder For Rajendransingh Na At 14:15</h3>
                    <p className="text-[14px] text-gray-600 mt-2 leading-relaxed">
                      Hello Pranay Waghmare, you have a followup with RajendraNSingh NA at 25/04/2026 14:15. Details- 8892549768 RajendraNS. Thank you - Buildesk CRM
                    </p>
                    <p className="text-xs text-gray-500 mt-3 text-right">Apr 25, 2026, 2:00:57 PM</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t bg-white flex justify-center">
              <Button variant="outline" className="w-full text-blue-600 border-blue-600 hover:bg-blue-50">View All</Button>
            </div>
          </div>
        </div>
      )}

      {/* My Profile Panel */}
      {isMyProfileOpen && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#e6e8eb]">
          <div className="h-[230px] w-full bg-[url('https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center" />
          <div className="mx-auto -mt-6 max-w-[1220px] px-3 pb-8">
            <div className="mb-3 flex justify-end">
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setIsMyProfileOpen(false)}
                className="rounded bg-[#ff5a1f] px-2 py-1 text-xs font-medium text-white hover:bg-[#ea4c14]"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[290px_1fr]">
              <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                    <UserCircle2 className="h-20 w-20" />
                  </div>
                  <h2 className="text-[34px] font-medium text-gray-700">{profileForm.name}</h2>
                  <p className="mb-4 text-[13px] text-gray-500">{profileForm.email}</p>
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => setIsChangePasswordOpen(true)}
                    className="rounded bg-[#1565d8] px-5 py-2 text-sm font-medium text-white hover:bg-[#1258be]"
                  >
                    Change Password
                  </button>
                </div>
              </div>

              <div className="rounded border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                  <h3 className="text-[36px] font-medium text-[#2a4a77]">User Info</h3>
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => setIsEditProfileOpen(true)}
                    className="inline-flex items-center gap-1 rounded bg-[#1cc7a1] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#19b291]"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-[160px_20px_1fr] gap-y-4 text-[15px] text-gray-700">
                    <div className="flex items-center gap-2 font-semibold"><User className="h-4 w-4" /> Name</div>
                    <div>:</div>
                    <div>{profileForm.name}</div>
                    <div className="flex items-center gap-2 font-semibold"><Phone className="h-4 w-4" /> Phone</div>
                    <div>:</div>
                    <div>{profileForm.phone}</div>
                    <div className="flex items-center gap-2 font-semibold"><Mail className="h-4 w-4" /> Email</div>
                    <div>:</div>
                    <div>{profileForm.email}</div>
                    <div className="flex items-center gap-2 font-semibold"><Globe className="h-4 w-4" /> Username</div>
                    <div>:</div>
                    <div>{profileForm.username}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Info Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-[920px] rounded border border-gray-300 bg-white shadow-2xl">
            <div className="border-b border-gray-200 px-8 py-6">
              <h3 className="text-[42px] font-medium text-[#2a4a77]">User Info</h3>
            </div>
            <div className="grid gap-4 px-8 py-8 md:grid-cols-[170px_1fr]">
              <label className="flex items-center gap-2 text-[36px] font-semibold text-gray-700"><User className="h-5 w-5" /> Name</label>
              <input
                suppressHydrationWarning
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                className="h-14 rounded border border-gray-300 px-3 text-[34px] text-gray-700 outline-none focus:border-[#1565d8]"
              />
              <label className="flex items-center gap-2 text-[36px] font-semibold text-gray-700"><Phone className="h-5 w-5" /> Phone</label>
              <input
                suppressHydrationWarning
                value={profileForm.phone}
                onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                className="h-14 rounded border border-gray-300 px-3 text-[34px] text-gray-700 outline-none focus:border-[#1565d8]"
              />
              <label className="flex items-center gap-2 text-[36px] font-semibold text-gray-700"><Mail className="h-5 w-5" /> Email</label>
              <input
                suppressHydrationWarning
                value={profileForm.email}
                onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                className="h-14 rounded border border-gray-300 px-3 text-[34px] text-gray-700 outline-none focus:border-[#1565d8]"
              />
              <label className="flex items-center gap-2 text-[36px] font-semibold text-gray-700"><Globe className="h-5 w-5" /> Username</label>
              <input
                suppressHydrationWarning
                value={profileForm.username}
                onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
                className="h-14 rounded border border-gray-300 px-3 text-[34px] text-gray-700 outline-none focus:border-[#1565d8]"
              />
            </div>
            <div className="flex justify-end gap-4 px-8 pb-8">
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="rounded bg-[#1565d8] px-10 py-3 text-[32px] font-medium text-white hover:bg-[#1258be]"
              >
                Submit
              </button>
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="px-2 py-3 text-[32px] text-[#2d3b57] hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-[700px] rounded border border-gray-300 bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5">
              <h3 className="text-[44px] font-medium text-[#3f4a63]">Change Password</h3>
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setIsChangePasswordOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="border-t border-gray-200 px-6 py-6">
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-[34px] font-semibold text-gray-700">Old Password</label>
                  <input suppressHydrationWarning type="password" placeholder="Old Password" className="h-14 w-full rounded border border-gray-300 px-4 text-[33px] outline-none focus:border-[#1565d8]" />
                </div>
                <div>
                  <label className="mb-2 block text-[34px] font-semibold text-gray-700">New Password</label>
                  <input suppressHydrationWarning type="password" placeholder="Password" className="h-14 w-full rounded border border-gray-300 px-4 text-[33px] outline-none focus:border-[#1565d8]" />
                </div>
                <div>
                  <label className="mb-2 block text-[34px] font-semibold text-gray-700">Confirm New Password</label>
                  <input suppressHydrationWarning type="password" placeholder="Confirm Password" className="h-14 w-full rounded border border-gray-300 px-4 text-[33px] outline-none focus:border-[#1565d8]" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-5">
              <button suppressHydrationWarning type="button" className="rounded bg-[#1565d8] px-6 py-2 text-[32px] font-medium text-white hover:bg-[#1258be]">
                Change Password
              </button>
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setIsChangePasswordOpen(false)}
                className="rounded bg-[#dbe3ea] px-6 py-2 text-[32px] text-gray-700 hover:bg-[#ccd6de]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
