import React, { useState, useEffect, useRef, useMemo, memo } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useLocalAuth } from "@/lib/localAuth";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/use-toast";
import LangThemeSwitcher from "@/components/LangThemeSwitcher";
import {
  MessageSquare, CheckSquare, Calendar, BookOpen, Pencil, LogOut, Menu, X, Settings as SettingsIcon, Timer, StickyNote, Gamepad2, ShieldCheck, CalendarClock
} from "lucide-react";
import { Image as UIImage } from "@/components/ui/image";

const baseNav = [
  { to: "/", labelKey: "nav.chat", icon: MessageSquare, end: true },
  { to: "/todos", labelKey: "nav.todos", icon: CheckSquare },
  { to: "/agenda", labelKey: "nav.agenda", icon: Calendar },
  { to: "/schedule", labelKey: "nav.schedule", icon: BookOpen },
  { to: "/study", labelKey: "nav.study", icon: Timer },
  { to: "/drawing", labelKey: "nav.drawing", icon: Pencil },
  { to: "/notes", labelKey: "nav.notes", icon: StickyNote },
  { to: "/subjects", labelKey: "nav.subjects", icon: BookOpen },
  { to: "/timetable", labelKey: "nav.timetable", icon: CalendarClock },
  { to: "/relax", labelKey: "nav.relax", icon: Gamepad2 },
  { to: "/recovery", labelKey: "nav.recovery", icon: ShieldCheck },
  { to: "/settings", labelKey: "nav.settings", icon: SettingsIcon },
];

export default function AppShell() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const { user: me, logout: doLogout } = useLocalAuth();
  const { toast } = useToast();
  const meRef = useRef(null);
  const navScrollRef = useRef(null);
  const [appName, setAppName] = useState("Sira Chat");
  const [tagline, setTagline] = useState("Chat together");
  const [logoUrl, setLogoUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    meRef.current = me;
  }, [me]);

  useEffect(() => {
    base44.entities.AppSetting.list().then((s) => {
      if (s && s[0]) {
        setAppName(s[0].app_name || "Sira Chat");
        setTagline(s[0].tagline || "Chat together");
        setLogoUrl(s[0].logo_url || "");
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const unsub = base44.entities.StudyHistory.subscribe((event) => {
      if (event.type !== "create") return;
      const d = event.data;
      if (!d || d.user_name === meRef.current?.name) return;
      if (d.action === "break") toast({ title: "Break taken", description: `${d.user_name} took a study break.` });
      else if (d.action === "quit") toast({ title: "Session left", description: `${d.user_name} left the study session.` });
    });
    return unsub;
  }, [toast]);

  const logout = () => {
    doLogout();
    navigate("/login");
  };

  const SidebarContent = useMemo(() => {
    const Component = () => (
      <div className="flex h-full flex-col bg-white dark:bg-gray-900">
        {/* Logo Header with Clean Design */}
        <div className="border-b border-border px-5 py-6">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <div className="h-12 w-12 overflow-hidden rounded-xl">
                <UIImage src={logoUrl} alt="logo" className="h-full w-full object-cover" fittingType="fit" />
              </div>
            ) : (
              <img src="/logo.png" alt="Logo" className="h-12 w-12" />
            )}
            <div>
              <p className="text-base font-bold text-foreground">{appName}</p>
              <p className="text-xs text-muted-foreground">{tagline}</p>
            </div>
          </div>
        </div>

        {/* Navigation with Clean Styling */}
        <nav className="sidebar-nav flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent dark:scrollbar-thumb-gray-700">
          {baseNav.map(({ to, labelKey, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={(e) => {
                setOpen(false);
              }}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#FF4D00] text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Icon */}
                  <Icon className="h-5 w-5" />
                  
                  {/* Label */}
                  <span>{t(labelKey)}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-border p-3">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-muted p-3">
            {me?.profile_image ? (
              <div className="relative">
                <img src={me.profile_image} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-gray-900" />
              </div>
            ) : (
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-[#FF6B2C] text-sm font-bold text-white">
                  {(me?.name || me?.username || "U").charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-gray-900" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{me?.name || "You"}</p>
              <p className="truncate text-xs text-muted-foreground">@{me?.username}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="group flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
            <span>{t("nav.signOut")}</span>
          </button>
        </div>
      </div>
    );
    return Component;
  }, [appName, tagline, logoUrl, me, t, logout]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-white shadow-sm dark:bg-gray-900 md:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-border bg-white shadow-xl dark:bg-gray-900">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="rounded-lg p-1.5 hover:bg-muted">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              {logoUrl ? (
                <div className="h-7 w-7 overflow-hidden rounded-lg"><UIImage src={logoUrl} alt="logo" className="h-full w-full object-cover" fittingType="fit" /></div>
              ) : (
                <img src="/logo.png" alt="Logo" className="h-7 w-7" />
              )}
              <span className="text-sm font-semibold">{appName}</span>
            </div>
          </div>
          <LangThemeSwitcher />
        </header>

        <header className="hidden items-center justify-end gap-2 border-b border-border bg-background/60 px-4 py-2 md:flex">
          <LangThemeSwitcher />
        </header>

        <main className="min-h-0 flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}