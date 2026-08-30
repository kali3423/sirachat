import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import ActiveSession from "@/components/study/ActiveSession";
import StudyDashboard from "@/components/study/StudyDashboard";
import { Plus, Clock, Play, Trash2, Loader2 } from "lucide-react";
import T from "@/components/T";

const STARTING = 500, LEGEND = 1000, COMPLETE = 100, BREAK_P = 10, QUIT_P = 100;

export default function Study() {
  const [me, setMe] = useState(null);
  const [meets, setMeets] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ subject: "", date: today, start_time: "09:00", end_time: "10:00" });

  const load = async () => {
    try {
      const m = await base44.auth.me().catch(() => null);
      const ms = await base44.entities.StudyMeet.list("-created_date", 100).catch(() => []);
      let hh = [];
      if (m) hh = await base44.entities.StudyHistory.filter({ user_id: m.id }, "-created_date", 200).catch(() => []);
      setMe(m); setMeets(ms); setHistory(hh);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const u1 = base44.entities.StudyMeet.subscribe(() => load());
    const u2 = base44.entities.StudyHistory.subscribe(() => load());
    const u3 = base44.entities.User.subscribe(() => base44.auth.me().then(setMe).catch(() => {}));
    return () => { u1(); u2(); u3(); };
  }, []);

  const points = me?.points ?? STARTING;
  const level = points >= LEGEND ? "Legend" : points >= 800 ? "Achiever" : points >= 500 ? "Studious" : "Beginner";
  const activeMeet = meets.find((m) => m.status === "active");

  const createMeet = async (e) => {
    e.preventDefault();
    if (!form.subject.trim()) return;
    setBusy(true);
    try {
      await base44.entities.StudyMeet.create({
        ...form,
        subject: form.subject.trim(),
        status: "scheduled",
        created_by_name: me?.display_name || me?.full_name || "You",
      });
      setForm({ subject: "", date: today, start_time: "09:00", end_time: "10:00" });
      setShowForm(false);
    } finally {
      setBusy(false);
    }
  };

  const startMeet = async (m) => {
    setBusy(true);
    try {
      await base44.entities.StudyMeet.update(m.id, { status: "active", started_at: new Date().toISOString() });
    } finally {
      setBusy(false);
    }
  };

  const logHistory = async (user, action, change, subject, durationMin = 0) => {
    if (!user) return;
    await base44.entities.StudyHistory.create({
      user_id: user.id,
      user_name: user?.display_name || user?.full_name || "You",
      action,
      points_change: change,
      subject: subject || "",
      duration_min: durationMin,
    });
  };

  const complete = async (m) => {
    setBusy(true);
    try {
      const fresh = await base44.auth.me().catch(() => null);
      const currentPoints = fresh?.points ?? STARTING;
      const dur = m.started_at ? Math.max(0, Math.round((Date.now() - new Date(m.started_at).getTime()) / 60000)) : 0;
      await base44.entities.StudyMeet.update(m.id, { status: "completed", ended_at: new Date().toISOString() });
      await base44.auth.updateMe({ points: currentPoints + COMPLETE });
      if (fresh) await logHistory(fresh, "completed", COMPLETE, m.subject, dur);
    } finally {
      setBusy(false);
    }
  };

  const completeRef = useRef(complete);
  completeRef.current = complete;

  const takeBreak = async () => {
    setBusy(true);
    try {
      await base44.auth.updateMe({ points: Math.max(0, points - BREAK_P) });
      await logHistory(me, "break", -BREAK_P, activeMeet?.subject || "", 10);
    } finally {
      setBusy(false);
    }
  };

  const quit = async () => {
    setBusy(true);
    try {
      await base44.auth.updateMe({ points: Math.max(0, points - QUIT_P) });
      await logHistory(me, "quit", -QUIT_P, activeMeet?.subject || "", 0);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!activeMeet || !activeMeet.date || !activeMeet.end_time) return;
    const plannedEnd = new Date(`${activeMeet.date}T${activeMeet.end_time}`);
    const diff = plannedEnd.getTime() - Date.now();
    if (diff <= 0) { completeRef.current(activeMeet); return; }
    const id = setTimeout(() => completeRef.current(activeMeet), diff);
    return () => clearTimeout(id);
  }, [activeMeet?.id, activeMeet?.date, activeMeet?.end_time]);

  const removeMeet = async (id) => base44.entities.StudyMeet.delete(id);

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-50 to-orange-50/30 dark:bg-none dark:bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground"><T k="study.title" /></h1>
            <p className="text-sm text-muted-foreground"><T k="study.sub" /></p>
          </div>
          <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-orange-500 to-[#FF6B2C] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#FF4D00]/30 transition hover:opacity-90">
            <Plus className="h-4 w-4" /> <T k="common.new" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-200 border-t-amber-600" /></div>
        ) : (
          <>
            {activeMeet && (
              <ActiveSession meet={activeMeet} onBreak={takeBreak} onQuit={quit} busy={busy} />
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3">
                {showForm && (
                  <form onSubmit={createMeet} className="mb-4 space-y-3 rounded-2xl border border-border bg-background p-4 shadow-sm">
                    <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject (e.g. Mathematics)" className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm outline-none focus:border-[#FF8047] focus:bg-background" />
                    <div className="grid grid-cols-3 gap-2">
                      <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm outline-none focus:border-[#FF8047]" />
                      <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm outline-none focus:border-[#FF8047]" />
                      <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm outline-none focus:border-[#FF8047]" />
                    </div>
                    <button type="submit" disabled={busy} className="w-full rounded-xl bg-[#FF6B2C] py-2.5 text-sm font-medium text-white transition hover:bg-amber-700 disabled:opacity-60">
                      {busy ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Create"}
                    </button>
                  </form>
                )}

                <div className="space-y-3">
                  {meets.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">No study rendezvous yet. Create one to begin.</p>
                  ) : (
                    meets.map((m) => (
                      <div key={m.id} className="group flex items-center gap-3 rounded-2xl border border-border bg-background p-4 shadow-sm">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#FF4D00]"><Clock className="h-5 w-5" /></div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{m.subject}</p>
                          <p className="text-[11px] text-muted-foreground">{m.date} · {m.start_time}–{m.end_time}</p>
                        </div>
                        {m.status === "completed" ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">Completed</span>
                        ) : m.status === "active" ? (
                          <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-[#CC3D00]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />Live</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button onClick={() => startMeet(m)} disabled={busy} className="flex items-center gap-1 rounded-lg bg-[#FF6B2C] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-700 disabled:opacity-60"><Play className="h-3.5 w-3.5" />Start</button>
                            <button onClick={() => removeMeet(m.id)} className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="lg:col-span-2">
                <StudyDashboard points={points} level={level} history={history} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}