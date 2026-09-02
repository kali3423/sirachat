import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import T from "@/components/T";
import { ShieldCheck, ChevronLeft, ChevronRight, Flame, Trophy, CheckCircle2, XCircle, Calendar, Info, Loader2 } from "lucide-react";
import { PageShell, PageHeader, ProgressRing, BottomSheet } from "@/components/sira";
import { cn } from "@/lib/utils";

const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CONN = {
  checking: { dot: "bg-warning animate-pulse", text: "text-warning", bg: "bg-warning/12", label: "Connecting…" },
  connected: { dot: "bg-success", text: "text-success", bg: "bg-success/12", label: "Connected" },
  error: { dot: "bg-danger", text: "text-danger", bg: "bg-danger/12", label: "Offline" },
};

export default function Recovery() {
  const [me, setMe] = useState(null);
  const [records, setRecords] = useState([]);
  const [view, setView] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });
  const [busy, setBusy] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("checking");

  const load = async () => {
    try {
      setConnectionStatus("checking");
      const m = await base44.auth.me().catch(() => null);
      setMe(m);
      const all = await base44.entities.RecoveryDay.list("created_date", 1000).catch(() => []);
      setRecords(Array.isArray(all) ? all : []);
      setConnectionStatus("connected");
    } catch (error) {
      setConnectionStatus("error");
    }
  };

  useEffect(() => {
    load();
    const u1 = base44.entities.RecoveryDay.subscribe(load);
    const u2 = base44.entities.User.subscribe(() => base44.auth.me().then(setMe).catch(() => {}));
    return () => { u1(); u2(); };
  }, []);

  const byDate = useMemo(() => {
    const map = {};
    records.forEach((r) => { if (r.date) map[r.date] = r; });
    return map;
  }, [records]);

  const today = new Date();
  const todayStr = ymd(today);

  const streak = useMemo(() => {
    let s = 0;
    const d = new Date(today);
    for (;;) {
      const key = ymd(d);
      const rec = byDate[key];
      if (rec && rec.status === "clean") { s++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return s;
  }, [byDate, todayStr]);

  const bestStreak = useMemo(() => {
    const dates = Object.values(byDate).filter((r) => r.status === "clean").map((r) => r.date).sort();
    let best = 0, cur = 0, prev = null;
    for (const ds of dates) {
      if (prev) {
        const p = new Date(prev); p.setDate(p.getDate() + 1);
        cur = ymd(p) === ds ? cur + 1 : 1;
      } else cur = 1;
      best = Math.max(best, cur);
      prev = ds;
    }
    return best;
  }, [byDate]);

  const monthPrefix = `${view.y}-${pad(view.m + 1)}`;
  const monthClean = useMemo(() => Object.values(byDate).filter((r) => r.status === "clean" && r.date.startsWith(monthPrefix)).length, [byDate, monthPrefix]);
  const monthTotal = useMemo(() => Object.values(byDate).filter((r) => r.date.startsWith(monthPrefix)).length, [byDate, monthPrefix]);
  const cleanTotal = Object.values(byDate).filter((r) => r.status === "clean").length;

  const points = me?.points ?? 500;

  const adjustPoints = async (delta) => {
    const fresh = await base44.auth.me().catch(() => null);
    const cur = fresh?.points ?? 500;
    await base44.auth.updateMe({ points: Math.max(0, cur + delta) }).catch(() => {});
    setMe((mm) => (mm ? { ...mm, points: Math.max(0, (mm.points ?? 500) + delta) } : mm));
  };

  const mark = async (dateStr, status) => {
    const rec = byDate[dateStr];
    setBusy(true);
    try {
      if (!rec) {
        await base44.entities.RecoveryDay.create({ date: dateStr, status });
        await adjustPoints(status === "clean" ? 10 : 0);
      } else {
        const wasClean = rec.status === "clean";
        const willBeClean = status === "clean";
        await base44.entities.RecoveryDay.update(rec.id, { status });
        if (wasClean && !willBeClean) await adjustPoints(-10);
        else if (!wasClean && willBeClean) await adjustPoints(10);
      }
      await load();
      setShowActions(false);
      setSelectedDay(null);
    } catch (error) {
      // Non-fatal: surface a friendly message, keep the sheet open to retry.
      setConnectionStatus("error");
    } finally {
      setBusy(false);
    }
  };

  const clearDay = async () => {
    const rec = byDate[selectedDay];
    if (!rec) return;
    setBusy(true);
    try {
      await base44.entities.RecoveryDay.delete(rec.id);
      if (rec.status === "clean") await adjustPoints(-10);
      setShowActions(false);
      setSelectedDay(null);
    } finally {
      setBusy(false);
    }
  };

  const firstDay = new Date(view.y, view.m, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthName = new Date(view.y, view.m, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const prevMonth = () => setView((v) => { const n = new Date(v.y, v.m - 1, 1); return { y: n.getFullYear(), m: n.getMonth() }; });
  const nextMonth = () => setView((v) => { const n = new Date(v.y, v.m + 1, 1); return { y: n.getFullYear(), m: n.getMonth() }; });

  const monthPct = monthTotal ? Math.round((monthClean / (monthTotal || daysInMonth)) * 100) : 0;
  const conn = CONN[connectionStatus] || CONN.checking;
  const selStatus = selectedDay ? byDate[selectedDay]?.status : null;

  return (
    <PageShell width="xl">
      <PageHeader
        icon={ShieldCheck}
        title={<T k="recovery.title" />}
        subtitle={<T k="recovery.sub" />}
        actions={
          <div className={cn("flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold", conn.bg, conn.text)}>
            <span className={cn("h-2 w-2 rounded-full", conn.dot)} />
            {conn.label}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <button onClick={prevMonth} aria-label="Previous month" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground press">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-base font-bold text-foreground">{monthName}</span>
              <button onClick={nextMonth} aria-label="Next month" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground press">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 flex items-start gap-2 rounded-xl bg-success/8 p-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <p className="text-xs text-muted-foreground">
                Tap any day to mark it <span className="font-semibold text-success">Clean</span> or <span className="font-semibold text-danger">Relapse</span>. Tap again to change or clear it.
              </p>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium text-muted-foreground">
              {WEEK.map((w) => <div key={w}>{w}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {cells.map((d, i) => {
                if (!d) return <div key={i} />;
                const ds = `${view.y}-${pad(view.m + 1)}-${pad(d)}`;
                const rec = byDate[ds];
                const future = ds > todayStr;
                const isToday = ds === todayStr;
                const isSelected = selectedDay === ds;
                return (
                  <button
                    key={i}
                    disabled={future || busy}
                    onClick={() => { if (!future) { setSelectedDay(ds); setShowActions(true); } }}
                    className={cn(
                      "relative flex h-12 items-center justify-center rounded-xl border text-sm font-semibold transition-all",
                      !future && "press",
                      rec?.status === "clean"
                        ? "border-success/40 bg-success text-white shadow-soft"
                        : rec?.status === "relapse"
                        ? "border-danger/40 bg-danger text-white shadow-soft"
                        : future
                        ? "cursor-not-allowed border-dashed border-border bg-transparent text-muted-foreground/40"
                        : isSelected
                        ? "border-primary bg-primary-soft ring-2 ring-primary"
                        : "border-border bg-background hover:border-primary/40 hover:bg-primary-soft/50",
                      isToday && !rec && "ring-2 ring-success/60"
                    )}
                  >
                    {d}
                    {rec?.status === "clean" && <CheckCircle2 className="absolute right-1 top-1 h-3 w-3 text-white drop-shadow" />}
                    {rec?.status === "relapse" && <XCircle className="absolute right-1 top-1 h-3 w-3 text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-4 w-4 rounded border-2 border-success bg-success" />
                <span className="text-muted-foreground">Clean (+10 pts)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-4 w-4 rounded border-2 border-danger bg-danger" />
                <span className="text-muted-foreground">Relapse (0 pts)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <ProgressRing value={monthPct} size={64} stroke={6} barClassName="text-success">
                <span className="text-xs font-bold text-foreground tabnums">{monthPct}%</span>
              </ProgressRing>
              <div>
                <p className="text-[11px] text-muted-foreground">Balance</p>
                <p className="text-2xl font-bold text-foreground tabnums">{points} <span className="text-sm font-normal text-muted-foreground">pts</span></p>
                <p className="mt-0.5 text-[11px] font-medium text-success">+10 pts per clean day</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <Flame className="mb-1 h-5 w-5 text-warning" />
              <p className="text-xl font-bold text-foreground tabnums">{streak}</p>
              <p className="text-[11px] text-muted-foreground"><T k="recovery.streak" /></p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <Trophy className="mb-1 h-5 w-5 text-study-foreground dark:text-study" />
              <p className="text-xl font-bold text-foreground tabnums">{bestStreak}</p>
              <p className="text-[11px] text-muted-foreground"><T k="recovery.best" /></p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground"><T k="recovery.thisMonth" /></span>
              <span className="font-semibold text-foreground tabnums">{monthClean}/{monthTotal || daysInMonth}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-success transition-all" style={{ width: `${monthPct}%` }} />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Recovery points: <span className="font-semibold text-success">{cleanTotal * 10}</span></p>
          </div>
        </div>
      </div>

      <BottomSheet
        open={showActions}
        onOpenChange={(o) => { setShowActions(o); if (!o) setSelectedDay(null); }}
        title={selectedDay ? new Date(selectedDay).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) : ""}
        description="How was this day?"
      >
        <div className="space-y-3">
          {busy && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-muted p-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Saving…</span>
            </div>
          )}

          <button
            onClick={() => mark(selectedDay, "clean")}
            disabled={busy}
            className={cn(
              "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all press disabled:opacity-50",
              selStatus === "clean"
                ? "border-success bg-success text-white shadow-soft"
                : "border-success/30 bg-success/10 text-success hover:bg-success/15"
            )}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <span className="flex-1">
              <span className="block text-base font-bold">Clean Day</span>
              <span className="block text-sm opacity-90">+10 points</span>
            </span>
            {selStatus === "clean" && <CheckCircle2 className="h-5 w-5" />}
          </button>

          <button
            onClick={() => mark(selectedDay, "relapse")}
            disabled={busy}
            className={cn(
              "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all press disabled:opacity-50",
              selStatus === "relapse"
                ? "border-danger bg-danger text-white shadow-soft"
                : "border-danger/30 bg-danger/10 text-danger hover:bg-danger/15"
            )}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <XCircle className="h-6 w-6" />
            </span>
            <span className="flex-1">
              <span className="block text-base font-bold">Relapse</span>
              <span className="block text-sm opacity-90">0 points</span>
            </span>
            {selStatus === "relapse" && <XCircle className="h-5 w-5" />}
          </button>

          {selectedDay && byDate[selectedDay] && (
            <button
              onClick={clearDay}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-muted/50 p-3 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted press disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" /> Clear this day
            </button>
          )}
        </div>
      </BottomSheet>
    </PageShell>
  );
}
