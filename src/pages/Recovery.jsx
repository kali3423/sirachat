import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import T from "@/components/T";
import { ShieldCheck, ChevronLeft, ChevronRight, Flame, Trophy, CheckCircle2, XCircle, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Recovery() {
  const [me, setMe] = useState(null);
  const [records, setRecords] = useState([]);
  const [view, setView] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });
  const [busy, setBusy] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("checking"); // checking, connected, error

  const load = async () => {
    try {
      setConnectionStatus("checking");
      const m = await base44.auth.me().catch(() => null);
      setMe(m);
      const all = await base44.entities.RecoveryDay.list("created_date", 1000).catch(() => []);
      console.log("Loaded recovery days:", all);
      setRecords(Array.isArray(all) ? all : []);
      setConnectionStatus("connected");
    } catch (error) {
      console.error("Error loading data:", error);
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

  const setDay = async (dateStr, status) => {
    const rec = byDate[dateStr];
    const wasClean = rec?.status === "clean";
    const delta = (status === "clean" ? 10 : 0) - (wasClean ? 10 : 0);
    setBusy(true);
    try {
      if (!rec) await base44.entities.RecoveryDay.create({ date: dateStr, status });
      else if (rec.status !== status) await base44.entities.RecoveryDay.update(rec.id, { status });
      if (delta) await adjustPoints(delta);
    } finally {
      setBusy(false);
    }
  };

  const mark = async (dateStr, status) => {
    const rec = byDate[dateStr];
    setBusy(true);
    try {
      console.log("Marking day:", dateStr, "as", status);
      console.log("Existing record:", rec);
      
      if (!rec) {
        // Create new record
        console.log("Creating new record...");
        const created = await base44.entities.RecoveryDay.create({ date: dateStr, status });
        console.log("Created:", created);
        await adjustPoints(status === "clean" ? 10 : 0);
      } else {
        // Update existing record
        console.log("Updating existing record...");
        const wasClean = rec.status === "clean";
        const willBeClean = status === "clean";
        
        const updated = await base44.entities.RecoveryDay.update(rec.id, { status });
        console.log("Updated:", updated);
        
        // Adjust points based on change
        if (wasClean && !willBeClean) {
          await adjustPoints(-10); // Lost clean day
        } else if (!wasClean && willBeClean) {
          await adjustPoints(10); // Gained clean day
        }
      }
      
      // Reload data to refresh UI
      await load();
      
      setShowActions(false);
      setSelectedDay(null);
    } catch (error) {
      console.error("Error updating day:", error);
      alert("Failed to save. Error: " + (error.message || "Unknown error"));
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

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-50 to-emerald-50/20 dark:bg-none dark:bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground"><ShieldCheck className="h-6 w-6 text-emerald-600" /><T k="recovery.title" /></h1>
              <p className="text-sm text-muted-foreground"><T k="recovery.sub" /></p>
              <span className="mt-2 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-[#FF4D00]">+18</span>
            </div>
            <div className="flex items-center gap-2">
              {connectionStatus === "checking" && (
                <div className="flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500"></div>
                  Connecting...
                </div>
              )}
              {connectionStatus === "connected" && (
                <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  Connected
                </div>
              )}
              {connectionStatus === "error" && (
                <div className="flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-400">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  Connection Error
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevMonth}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ChevronLeft className="h-5 w-5" />
                </motion.button>
                <span className="text-base font-bold text-foreground">{monthName}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextMonth}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </div>

              <div className="mb-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 p-4 dark:from-emerald-950/20 dark:to-teal-950/20">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  How to use
                </p>
                <p className="text-xs text-muted-foreground">
                  Click on any day to mark it as Clean (✓) or Relapse (✗). Click again to toggle or remove.
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
                    <motion.button
                      key={i}
                      disabled={future || busy}
                      onClick={() => {
                        if (!future) {
                          setSelectedDay(ds);
                          setShowActions(true);
                        }
                      }}
                      whileHover={{ scale: future ? 1 : 1.05 }}
                      whileTap={{ scale: future ? 1 : 0.95 }}
                      className={`relative flex h-12 items-center justify-center rounded-xl border text-sm font-semibold transition-all ${
                        rec?.status === "clean"
                          ? "border-emerald-300 bg-emerald-500 text-white shadow-md"
                          : rec?.status === "relapse"
                          ? "border-orange-300 bg-[#FF4D00] text-white shadow-md"
                          : future
                          ? "border-dashed border-border bg-transparent text-muted-foreground/40 cursor-not-allowed"
                          : isSelected
                          ? "border-[#FF4D00] bg-orange-50 dark:bg-amber-950/30 ring-2 ring-[#FF4D00]"
                          : "border-border bg-background hover:border-[#FF4D00] hover:bg-orange-50 dark:hover:bg-amber-950/20"
                      } ${isToday && !rec ? "ring-2 ring-emerald-400" : ""}`}
                    >
                      {d}
                      {rec?.status === "clean" && <CheckCircle2 className="absolute right-1 top-1 h-3 w-3 text-white drop-shadow" />}
                      {rec?.status === "relapse" && <XCircle className="absolute right-1 top-1 h-3 w-3 text-white drop-shadow" />}
                    </motion.button>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded border-2 border-emerald-500 bg-emerald-500"></div>
                  <span className="text-muted-foreground">Clean Day (+10 pts)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded border-2 border-[#FF4D00] bg-[#FF4D00]"></div>
                  <span className="text-muted-foreground">Relapse (0 pts)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
              <p className="text-[11px] text-muted-foreground">Balance</p>
              <p className="text-2xl font-bold text-foreground">{points} <span className="text-sm font-normal text-muted-foreground">pts</span></p>
              <p className="mt-1 text-[11px] font-medium text-emerald-600">+10 pts per clean day</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                <Flame className="mb-1 h-5 w-5 text-[#FF4D00]" />
                <p className="text-xl font-bold text-foreground">{streak}</p>
                <p className="text-[11px] text-muted-foreground"><T k="recovery.streak" /></p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                <Trophy className="mb-1 h-5 w-5 text-[#FF4D00]" />
                <p className="text-xl font-bold text-foreground">{bestStreak}</p>
                <p className="text-[11px] text-muted-foreground"><T k="recovery.best" /></p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground"><T k="recovery.thisMonth" /></span>
                <span className="font-semibold text-foreground">{monthClean}/{monthTotal || daysInMonth}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${monthTotal ? Math.round((monthClean / (monthTotal || daysInMonth)) * 100) : 0}%` }} />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">Recovery points: <span className="font-semibold text-emerald-600">{cleanTotal * 10}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {showActions && selectedDay && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowActions(false);
                setSelectedDay(null);
              }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-white p-6 shadow-2xl dark:bg-gray-900"
            >
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                  <Calendar className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {new Date(selectedDay).toLocaleDateString(undefined, { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">How was this day?</p>
              </div>

              <div className="space-y-3">
                {busy && (
                  <div className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-muted p-3">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#FF4D00] border-t-transparent"></div>
                    <span className="text-sm font-medium text-muted-foreground">Saving...</span>
                  </div>
                )}

                {/* Clean Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    console.log("Clean button clicked for:", selectedDay);
                    await mark(selectedDay, "clean");
                  }}
                  disabled={busy}
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 transition-all ${
                    byDate[selectedDay]?.status === "clean"
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-lg"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-base font-bold">Clean Day</p>
                    <p className="text-sm opacity-90">+10 points</p>
                  </div>
                  {byDate[selectedDay]?.status === "clean" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-500"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </motion.div>
                  )}
                </motion.button>

                {/* Relapse Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    console.log("Relapse button clicked for:", selectedDay);
                    await mark(selectedDay, "relapse");
                  }}
                  disabled={busy}
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 transition-all ${
                    byDate[selectedDay]?.status === "relapse"
                      ? "border-[#FF4D00] bg-[#FF4D00] text-white shadow-lg"
                      : "border-orange-200 bg-orange-50 text-[#FF4D00] hover:border-orange-300 hover:bg-orange-100 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-[#FF8047]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                    <XCircle className="h-6 w-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-base font-bold">Relapse</p>
                    <p className="text-sm opacity-90">0 points</p>
                  </div>
                  {byDate[selectedDay]?.status === "relapse" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#FF4D00]"
                    >
                      <XCircle className="h-4 w-4" />
                    </motion.div>
                  )}
                </motion.button>

                {/* Remove/Clear Button */}
                {byDate[selectedDay] && (
                  <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      const rec = byDate[selectedDay];
                      if (rec) {
                        setBusy(true);
                        try {
                          await base44.entities.RecoveryDay.delete(rec.id);
                          if (rec.status === "clean") await adjustPoints(-10);
                          setShowActions(false);
                          setSelectedDay(null);
                        } finally {
                          setBusy(false);
                        }
                      }
                    }}
                    disabled={busy}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 bg-gray-50 p-3 text-sm font-semibold text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Clear this day
                  </motion.button>
                )}
              </div>

              {/* Cancel Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowActions(false);
                  setSelectedDay(null);
                }}
                className="mt-4 w-full rounded-xl bg-muted py-3 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted/80"
              >
                Cancel
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}