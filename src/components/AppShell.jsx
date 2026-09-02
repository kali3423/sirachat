import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useLocalAuth } from "@/lib/localAuth";
import { useI18n } from "@/lib/i18n";
import { useShell } from "@/lib/shell";
import LangThemeSwitcher from "@/components/LangThemeSwitcher";
import { Logo, UserAvatar, IconButton, BottomSheet } from "@/components/sira";
import BottomNav from "@/components/sira/BottomNav";
import { cn } from "@/lib/utils";
import {
  MessageSquare, Timer, Compass, Bell, User as UserIcon,
  CheckSquare, Calendar, BookOpen, Pencil, StickyNote, CalendarClock,
  Gamepad2, ShieldCheck, Settings as SettingsIcon, LogOut, Plus,
} from "lucide-react";

/** Five primary hubs — the mobile bottom nav and the top of the desktop rail. */
const primaryNav = [
  { to: "/", labelKey: "nav.chats", icon: MessageSquare, end: true, badgeKey: "chats" },
  { to: "/study", labelKey: "nav.study", icon: Timer },
  { to: "/explore", labelKey: "nav.explore", icon: Compass },
  { to: "/notifications", labelKey: "nav.notifications", icon: Bell, badgeKey: "notifications" },
  { to: "/profile", labelKey: "nav.profile", icon: UserIcon },
];

/** Secondary tools — desktop rail (grouped) + mobile "More" sheet. */
const toolsNav = [
  { to: "/todos", labelKey: "nav.todos", icon: CheckSquare },
  { to: "/agenda", labelKey: "nav.agenda", icon: Calendar },
  { to: "/schedule", labelKey: "nav.schedule", icon: BookOpen },
  { to: "/subjects", labelKey: "nav.subjects", icon: BookOpen },
  { to: "/timetable", labelKey: "nav.timetable", icon: CalendarClock },
  { to: "/notes", labelKey: "nav.notes", icon: StickyNote },
  { to: "/drawing", labelKey: "nav.drawing", icon: Pencil },
  { to: "/relax", labelKey: "nav.relax", icon: Gamepad2 },
  { to: "/recovery", labelKey: "nav.recovery", icon: ShieldCheck },
];

function RailLink({ to, end, icon: Icon, label, badge, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
          isActive
            ? "bg-primary text-primary-foreground shadow-accent"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )
      }
    >
      <Icon className="h-[18px] w-[18px]" />
      <span className="truncate">{label}</span>
      {badge > 0 && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-unread px-1.5 text-[10px] font-bold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </NavLink>
  );
}

export default function AppShell() {
  const { t } = useI18n();
  const { user: me, logout: doLogout } = useLocalAuth();
  const { hideChrome, badges } = useShell();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const [appName, setAppName] = useState("Sira Chat");
  const [tagline, setTagline] = useState("Study together");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    base44.entities.AppSetting.list()
      .then((s) => {
        const settings = Array.isArray(s) ? s : s ? [s] : [];
        if (settings[0]) {
          setAppName(settings[0].app_name || "Sira Chat");
          setTagline(settings[0].tagline || "Study together");
          setLogoUrl(settings[0].logo_url || "");
        }
      })
      .catch(() => {});
  }, []);

  const logout = () => {
    doLogout();
    navigate("/login");
  };

  const bottomItems = primaryNav.map((n) => ({
    to: n.to,
    end: n.end,
    icon: n.icon,
    label: t(n.labelKey),
    badge: n.badgeKey ? badges[n.badgeKey] : 0,
  }));

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background">
      {/* Desktop sidebar rail */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-9 w-9 rounded-xl object-cover" />
          ) : (
            <Logo className="h-9 w-9" />
          )}
          <div className="min-w-0">
            <p className="truncate font-heading text-[15px] font-extrabold leading-tight text-foreground">
              {appName}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">{tagline}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin px-3 pb-4">
          {primaryNav.map((n) => (
            <RailLink
              key={n.to}
              to={n.to}
              end={n.end}
              icon={n.icon}
              label={t(n.labelKey)}
              badge={n.badgeKey ? badges[n.badgeKey] : 0}
            />
          ))}

          <p className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            {t("nav.tools")}
          </p>
          {toolsNav.map((n) => (
            <RailLink key={n.to} to={n.to} icon={n.icon} label={t(n.labelKey)} />
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <NavLink
            to="/profile"
            className="mb-2 flex items-center gap-3 rounded-xl bg-muted/60 p-2.5 transition-colors hover:bg-muted"
          >
            <UserAvatar name={me?.name || me?.username} src={me?.profile_image} size="sm" status="online" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">{me?.name || "You"}</p>
              <p className="truncate text-xs text-muted-foreground">@{me?.username}</p>
            </div>
            <SettingsIcon className="h-4 w-4 text-muted-foreground" />
          </NavLink>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <LogOut className="h-[18px] w-[18px]" />
            <span>{t("nav.signOut")}</span>
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Compact desktop top bar (theme/lang) */}
        {!hideChrome && (
          <header className="hidden items-center justify-end gap-2 border-b border-border px-4 py-2 md:flex">
            <LangThemeSwitcher />
          </header>
        )}

        <main className="relative min-h-0 flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      {!hideChrome && <BottomNav items={bottomItems} />}

      {/* Mobile "More" tools sheet (kept for discoverability; opened from Explore) */}
      <BottomSheet open={moreOpen} onOpenChange={setMoreOpen} title={t("nav.tools")}>
        <div className="grid grid-cols-3 gap-2 pb-4">
          {toolsNav.map((n) => {
            const Icon = n.icon;
            return (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setMoreOpen(false)}
                className="flex flex-col items-center gap-2 rounded-2xl bg-muted/50 p-4 text-center transition-colors hover:bg-muted"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold text-foreground">{t(n.labelKey)}</span>
              </NavLink>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}
