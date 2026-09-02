import React from "react";
import { Trophy, Flame, CheckCircle2, Coffee, LogOut, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { ProgressRing } from "@/components/sira";
import { cn } from "@/lib/utils";

const LEGEND = 1000;
const STARTING = 500;

const LEVEL_STYLE = {
  Legend: "bg-study/20 text-study-foreground dark:text-study",
  Achiever: "bg-focus/15 text-focus",
  Studious: "bg-primary-soft text-primary",
  Beginner: "bg-muted text-muted-foreground",
};

export default function StudyDashboard({ points, level, history }) {
  const balance = points ?? STARTING;
  const progress = Math.min(100, (balance / LEGEND) * 100);
  const completed = history.filter((h) => h.action === "completed").length;
  const breaks = history.filter((h) => h.action === "break").length;
  const quits = history.filter((h) => h.action === "quit").length;
  const totalMin = history.filter((h) => h.action === "completed").reduce((a, h) => a + (h.duration_min || 0), 0);
  const earned = history.filter((h) => h.points_change > 0).reduce((a, h) => a + h.points_change, 0);
  const lost = Math.abs(history.filter((h) => h.points_change < 0).reduce((a, h) => a + h.points_change, 0));

  const bySubject = {};
  history.filter((h) => h.action === "completed" && h.subject).forEach((h) => {
    bySubject[h.subject] = (bySubject[h.subject] || 0) + (h.duration_min || 0);
  });
  const subjects = Object.entries(bySubject).sort((a, b) => b[1] - a[1]);
  const maxSub = Math.max(1, ...subjects.map((s) => s[1]));

  return (
    <div className="space-y-4">
      {/* Balance + level */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-5">
          <ProgressRing value={progress} size={96} stroke={8} barClassName="text-primary">
            <div className="text-center leading-none">
              <span className="block text-2xl font-bold tabnums text-foreground">{balance}</span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">pts</span>
            </div>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold", LEVEL_STYLE[level] || LEVEL_STYLE.Beginner)}>
              {level === "Legend" && <Trophy className="h-3.5 w-3.5" />}
              {level}
            </span>
            <p className="mt-2 text-sm font-semibold text-foreground">Progress to Legend</p>
            <p className="text-xs text-muted-foreground tabnums">{balance} / {LEGEND} points</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <Stat icon={CheckCircle2} label="Sessions" value={completed} tone="success" />
        <Stat icon={Clock} label="Study time" value={`${Math.floor(totalMin / 60)}h ${totalMin % 60}m`} tone="study" />
        <Stat icon={TrendingUp} label="Earned" value={`+${earned}`} tone="success" />
        <Stat icon={TrendingDown} label="Lost" value={`−${lost}`} tone="danger" />
        <Stat icon={Coffee} label="Breaks" value={breaks} tone="warning" />
        <Stat icon={LogOut} label="Quits" value={quits} tone="danger" />
      </div>

      {/* Time by subject */}
      {subjects.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-study" /> Time by subject
          </p>
          <div className="space-y-2.5">
            {subjects.map(([sub, min]) => (
              <div key={sub}>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="font-medium text-foreground">{sub}</span>
                  <span className="text-muted-foreground tabnums">{min} min</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-study transition-all" style={{ width: `${(min / maxSub) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent activity</p>
        {history.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">No activity yet — complete a session to earn points.</p>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 8).map((h) => {
              const positive = h.points_change > 0;
              return (
                <div key={h.id} className="flex items-center gap-3 text-xs">
                  <span className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    h.action === "completed" ? "bg-success/12 text-success"
                      : h.action === "break" ? "bg-warning/15 text-warning"
                      : "bg-danger/12 text-danger"
                  )}>
                    {h.action === "completed" ? <CheckCircle2 className="h-3.5 w-3.5" /> : h.action === "break" ? <Coffee className="h-3.5 w-3.5" /> : <LogOut className="h-3.5 w-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {h.action === "completed" ? "Completed" : h.action === "break" ? "10-min break" : "Quit session"}{h.subject ? ` · ${h.subject}` : ""}
                    </p>
                    <p className="text-[10px] text-muted-foreground tabnums">{new Date(h.created_date).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <span className={cn("font-semibold tabnums", positive ? "text-success" : "text-danger")}>{positive ? "+" : ""}{h.points_change}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const TONE = {
  success: "bg-success/12 text-success",
  study: "bg-study/15 text-study-foreground dark:text-study",
  danger: "bg-danger/12 text-danger",
  warning: "bg-warning/15 text-warning",
  primary: "bg-primary-soft text-primary",
};

function Stat({ icon: Icon, label, value, tone = "primary" }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm">
      <div className={cn("mb-2 flex h-8 w-8 items-center justify-center rounded-lg", TONE[tone])}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-lg font-bold tracking-tight text-foreground tabnums">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
