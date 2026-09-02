import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import ActiveSession from "@/components/study/ActiveSession";
import StudyDashboard from "@/components/study/StudyDashboard";
import { Plus, Clock, Play, Trash2, Loader2, GraduationCap, CalendarPlus } from "lucide-react";
import { PageShell, PageHeader, EmptyState, Chip, IconButton, BottomSheet } from "@/components/sira";
import { SkeletonCard } from "@/components/sira/Skeleton";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const STARTING = 500, LEGEND = 1000, COMPLETE = 100, BREAK_P = 10, QUIT_P = 100;

export default function Study() {
  const { t } = useI18n();
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
      setMe(m);
      setMeets(Array.isArray(ms) ? ms : []);
      setHistory(Array.isArray(hh) ? hh : []);
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

  // scheduled first, then active, then completed last; by date within
  const sortedMeets = [...meets].sort((a, b) => {
    const rank = { active: 0, scheduled: 1, completed: 2 };
    const ra = rank[a.status] ?? 1, rb = rank[b.status] ?? 1;
    if (ra !== rb) return ra - rb;
    return `${a.date}T${a.start_time}`.localeCompare(`${b.date}T${b.start_time}`);
  });

  return (
    <PageShell width="2xl">
      <PageHeader
        icon={GraduationCap}
        title={t("study.title") || "Study"}
        subtitle={t("study.sub") || "Plan sessions, stay focused, earn points."}
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-accent transition hover:bg-primary-strong press"
          >
            <Plus className="h-4 w-4" /> {t("common.new") || "New"}
          </button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="space-y-3 lg:col-span-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div className="lg:col-span-2"><SkeletonCard /></div>
        </div>
      ) : (
        <>
          {activeMeet && (
            <ActiveSession meet={activeMeet} onBreak={takeBreak} onQuit={quit} busy={busy} />
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Study sessions
              </h2>
              {sortedMeets.length === 0 ? (
                <EmptyState
                  icon={CalendarPlus}
                  title="No study sessions yet"
                  description="Schedule your first focused study block to start earning points."
                  action={
                    <button
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-accent transition hover:bg-primary-strong press"
                    >
                      <Plus className="h-4 w-4" /> Schedule a session
                    </button>
                  }
                />
              ) : (
                <div className="space-y-2.5">
                  {sortedMeets.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "group flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-colors",
                        m.status === "active" ? "border-study/40" : "border-border hover:border-primary/25"
                      )}
                    >
                      <div className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                        m.status === "completed" ? "bg-completed/12 text-completed"
                          : m.status === "active" ? "bg-study/15 text-study-foreground dark:text-study"
                          : "bg-scheduled/12 text-scheduled"
                      )}>
                        <Clock className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{m.subject}</p>
                        <p className="text-[11px] text-muted-foreground tabnums">{m.date} · {m.start_time}–{m.end_time}</p>
                      </div>
                      {m.status === "completed" ? (
                        <Chip tone="completed" dot>Completed</Chip>
                      ) : m.status === "active" ? (
                        <Chip tone="study"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />Live</Chip>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startMeet(m)}
                            disabled={busy}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:opacity-60 press"
                          >
                            <Play className="h-3.5 w-3.5" />Start
                          </button>
                          <IconButton variant="danger" size="sm" aria-label="Delete session" onClick={() => removeMeet(m.id)}>
                            <Trash2 />
                          </IconButton>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <StudyDashboard points={points} level={level} history={history} />
            </div>
          </div>
        </>
      )}

      {/* Create-session sheet */}
      <BottomSheet
        open={showForm}
        onOpenChange={setShowForm}
        title="New study session"
        description="Block out a focused window and earn points when you complete it."
      >
        <form onSubmit={createMeet} className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Subject</label>
            <input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g. Mathematics"
              autoFocus
              className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring tabnums" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Start</label>
              <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring tabnums" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">End</label>
              <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring tabnums" />
            </div>
          </div>
          <button
            type="submit"
            disabled={busy || !form.subject.trim()}
            className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-accent transition hover:bg-primary-strong disabled:opacity-60 press"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CalendarPlus className="h-4 w-4" /> Create session</>}
          </button>
        </form>
      </BottomSheet>
    </PageShell>
  );
}
