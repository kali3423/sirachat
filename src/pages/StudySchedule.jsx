import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Info, Clock, CalendarRange, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import ScheduleDashboard from "@/components/study/ScheduleDashboard";
import { PageShell, PageHeader, ProgressRing, IconButton, BottomSheet } from "@/components/sira";
import { cn } from "@/lib/utils";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS = { monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun" };

export default function StudySchedule() {
  const { t } = useI18n();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", day: "monday", start_time: "09:00", end_time: "10:00", notes: "" });

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.StudySession.list("created_date", 200).catch(() => []);
    setSessions(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const unsub = base44.entities.StudySession.subscribe(() => load());
    return unsub;
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.subject) return;
    setBusy(true);
    try {
      await base44.entities.StudySession.create({ ...form, progress: 0, completed: false });
      setForm({ subject: "", day: "monday", start_time: "09:00", end_time: "10:00", notes: "" });
      setShowForm(false);
    } finally {
      setBusy(false);
    }
  };

  const setProgress = async (s, progress) => {
    await base44.entities.StudySession.update(s.id, { progress, completed: progress >= 100 });
  };

  const remove = async (id) => base44.entities.StudySession.delete(id);

  const byDay = (day) => sessions.filter((s) => s.day === day).sort((a, b) => a.start_time.localeCompare(b.start_time));
  const todayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const overall = sessions.length ? Math.round(sessions.reduce((a, s) => a + (s.progress || 0), 0) / sessions.length) : 0;

  return (
    <PageShell width="xl">
      <PageHeader
        icon={CalendarRange}
        title={t("schedule.title") || "Weekly plan"}
        subtitle={t("schedule.sub") || "Your recurring study rhythm."}
        actions={
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 shadow-sm sm:flex">
              <ProgressRing value={overall} size={30} stroke={4} barClassName="text-primary">
                <span className="text-[9px] font-bold text-foreground tabnums">{overall}</span>
              </ProgressRing>
              <span className="text-xs font-medium text-muted-foreground">Overall</span>
            </div>
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-accent transition hover:bg-primary-strong press">
              <Plus className="h-4 w-4" /> {t("common.add") || "Add"}
            </button>
          </div>
        }
      />

      {!loading && <ScheduleDashboard sessions={sessions} />}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {DAYS.map((day) => {
            const items = byDay(day);
            const isToday = day === todayName;
            return (
              <div key={day} className={cn(
                "rounded-2xl border p-3 transition-colors",
                isToday ? "border-primary/40 bg-primary-soft/40 shadow-soft" : "border-border bg-card/60"
              )}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className={cn("text-sm font-bold", isToday ? "text-primary" : "text-foreground")}>{DAY_LABELS[day]}</h3>
                  {isToday && <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground">Today</span>}
                </div>
                <div className="space-y-2">
                  {items.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border py-4 text-center text-[11px] text-muted-foreground">Free</p>
                  ) : items.map((s) => (
                    <div key={s.id} className={cn(
                      "group rounded-xl border bg-card p-2.5 shadow-sm transition-colors",
                      s.completed ? "border-completed/40" : "border-border"
                    )}>
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-foreground">{s.subject}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground tabnums">
                            <Clock className="h-2.5 w-2.5" />{s.start_time}–{s.end_time}
                          </p>
                        </div>
                        <button onClick={() => remove(s.id)} aria-label="Delete" className="rounded p-0.5 text-muted-foreground opacity-0 transition hover:text-danger group-hover:opacity-100">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      {s.notes && <p className="mt-1 text-[10px] text-muted-foreground">{s.notes}</p>}
                      <div className="mt-2">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={10}
                          value={s.progress || 0}
                          onChange={(e) => setProgress(s, Number(e.target.value))}
                          className={cn("h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted", s.completed ? "accent-completed" : "accent-primary")}
                        />
                        <div className="mt-1 flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">{s.completed ? "✅ Done" : "Progress"}</span>
                          <span className={cn("font-semibold tabnums", s.completed ? "text-completed" : "text-primary")}>{s.progress || 0}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-3 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 text-primary" />
        Tip: Drag the slider on each session to track completion. Alarms/notifications require a native mobile build — available as a next step.
      </div>

      <BottomSheet open={showForm} onOpenChange={setShowForm} title="Add weekly session" description="Set a recurring study block for the week.">
        <form onSubmit={add} className="space-y-3">
          <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject (e.g. Mathematics)" autoFocus className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring" />
          <div className="grid grid-cols-3 gap-2">
            <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} className="rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring">
              {DAYS.map((d) => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
            </select>
            <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring tabnums" />
            <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring tabnums" />
          </div>
          <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional)" className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring" />
          <button type="submit" disabled={busy || !form.subject} className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-accent transition hover:bg-primary-strong disabled:opacity-60 press">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add session"}
          </button>
        </form>
      </BottomSheet>
    </PageShell>
  );
}
