import React from "react";
import { Trophy, Flame, CheckCircle2, Coffee, LogOut, Clock, TrendingUp, TrendingDown } from "lucide-react";

const LEGEND = 1000;
const STARTING = 500;

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

  const levelStyle =
    level === "Legend" ? "from-[#FF8047] to-yellow-500 text-amber-950"
    : level === "Achiever" ? "from-orange-500 to-fuchsia-500 text-white"
    : level === "Studious" ? "from-orange-500 to-[#FF6B2C] text-white"
    : "from-slate-400 to-slate-500 text-white";

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Balance</p>
            <p className="mt-1 flex items-baseline gap-1.5">
              <span className="text-4xl font-bold tracking-tight text-foreground">{balance}</span>
              <span className="text-sm text-muted-foreground">pts</span>
            </p>
          </div>
          <span className={`rounded-full bg-gradient-to-br px-3 py-1.5 text-xs font-bold shadow ${levelStyle}`}>
            {level === "Legend" && <Trophy className="mr-1 inline h-3.5 w-3.5" />}{level}
          </span>
        </div>
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Progress to Legend</span>
            <span className="font-medium text-foreground">{balance}/{LEGEND}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat icon={CheckCircle2} label="Sessions" value={completed} color="text-emerald-600 bg-emerald-50" />
        <Stat icon={Clock} label="Study time" value={`${Math.floor(totalMin / 60)}h ${totalMin % 60}m`} color="text-[#FF4D00] bg-orange-50" />
        <Stat icon={TrendingUp} label="Earned" value={`+${earned}`} color="text-emerald-600 bg-emerald-50" />
        <Stat icon={TrendingDown} label="Lost" value={`−${lost}`} color="text-[#FF4D00] bg-orange-50" />
        <Stat icon={Coffee} label="Breaks" value={breaks} color="text-[#FF4D00] bg-orange-50" />
        <Stat icon={LogOut} label="Quits" value={quits} color="text-[#FF4D00] bg-orange-50" />
      </div>

      {subjects.length > 0 && (
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-[#FF4D00]" /> Time by subject
          </p>
          <div className="space-y-2.5">
            {subjects.map(([sub, min]) => (
              <div key={sub}>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="font-medium text-foreground">{sub}</span>
                  <span className="text-muted-foreground">{min} min</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-500" style={{ width: `${(min / maxSub) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent activity</p>
        {history.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">No activity yet — complete a session to earn points.</p>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 8).map((h) => (
              <div key={h.id} className="flex items-center gap-3 text-xs">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${h.points_change > 0 ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-[#FF4D00]"}`}>
                  {h.action === "completed" ? <CheckCircle2 className="h-3.5 w-3.5" /> : h.action === "break" ? <Coffee className="h-3.5 w-3.5" /> : <LogOut className="h-3.5 w-3.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {h.action === "completed" ? "Completed" : h.action === "break" ? "10-min break" : "Quit session"}{h.subject ? ` · ${h.subject}` : ""}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{new Date(h.created_date).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <span className={`font-semibold ${h.points_change > 0 ? "text-emerald-600" : "text-[#FF4D00]"}`}>{h.points_change > 0 ? "+" : ""}{h.points_change}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-3.5 shadow-sm">
      <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${color}`}><Icon className="h-4 w-4" /></div>
      <p className="text-lg font-bold tracking-tight text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}