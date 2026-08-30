import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, BookOpen, Clock } from "lucide-react";
import T from "@/components/T";
import ScheduleDashboard from "@/components/study/ScheduleDashboard";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS = { monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun" };
const SUBJECT_COLORS = ["from-orange-500 to-[#FF6B2C]", "from-emerald-500 to-teal-600", "from-orange-500 to-[#FF6B2C]", "from-orange-500 to-[#FF6B2C]", "from-orange-500 to-teal-600", "from-fuchsia-500 to-[#FF6B2C]", "from-lime-500 to-green-600"];

export default function StudySchedule() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", day: "monday", start_time: "09:00", end_time: "10:00", notes: "" });

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.StudySession.list("created_date", 200);
    setSessions(data);
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
    await base44.entities.StudySession.create({ ...form, progress: 0, completed: false });
    setForm({ subject: "", day: "monday", start_time: "09:00", end_time: "10:00", notes: "" });
    setShowForm(false);
  };

  const setProgress = async (s, progress) => {
    await base44.entities.StudySession.update(s.id, { progress, completed: progress >= 100 });
  };

  const remove = async (id) => base44.entities.StudySession.delete(id);

  const colorFor = (subject) => {
    const hash = subject.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return SUBJECT_COLORS[hash % SUBJECT_COLORS.length];
  };

  const byDay = (day) => sessions.filter((s) => s.day === day).sort((a, b) => a.start_time.localeCompare(b.start_time));
  const todayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const overall = sessions.length ? Math.round(sessions.reduce((a, s) => a + (s.progress || 0), 0) / sessions.length) : 0;

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-50 to-orange-50/20 dark:bg-none dark:bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground"><T k="schedule.title" /></h1>
            <p className="text-sm text-muted-foreground"><T k="schedule.sub" /></p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 shadow-sm">
              <div className="relative h-8 w-8">
                <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${(overall / 100) * 94.2} 94.2`} className="text-[#FF4D00]" strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">{overall}%</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">Overall</span>
            </div>
            <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-orange-500 to-[#FF6B2C] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#FF4D00]/30 transition hover:opacity-90">
              <Plus className="h-4 w-4" /> <T k="common.add" />
            </button>
          </div>
        </div>

        {!loading && <ScheduleDashboard sessions={sessions} />}

        {showForm && (
          <form onSubmit={add} className="mb-6 space-y-3 rounded-2xl border border-border bg-background p-4 shadow-sm">
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject (e.g. Mathematics)" className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm outline-none focus:border-[#FF8047] focus:bg-background" />
            <div className="grid grid-cols-3 gap-2">
              <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm outline-none focus:border-[#FF8047]">
                {DAYS.map((d) => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
              </select>
              <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm outline-none focus:border-[#FF8047]" />
              <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm outline-none focus:border-[#FF8047]" />
            </div>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional)" className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm outline-none focus:border-[#FF8047] focus:bg-background" />
            <button type="submit" className="w-full rounded-xl bg-[#FF6B2C] py-2.5 text-sm font-medium text-white transition hover:bg-amber-700">Add session</button>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-200 border-t-amber-600" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {DAYS.map((day) => {
              const items = byDay(day);
              const isToday = day === todayName;
              return (
                <div key={day} className={`rounded-2xl border p-3 ${isToday ? "border-[#FF8047] bg-orange-50/40 shadow-md" : "border-border bg-background/60"}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className={`text-sm font-semibold ${isToday ? "text-[#CC3D00]" : "text-foreground"}`}>{DAY_LABELS[day]}</h3>
                    {isToday && <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-medium text-white">Today</span>}
                  </div>
                  <div className="space-y-2">
                    {items.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-border py-4 text-center text-[11px] text-muted-foreground">Free</p>
                    ) : items.map((s) => (
                      <div key={s.id} className="group rounded-xl border border-border bg-background p-2.5 shadow-sm">
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-foreground">{s.subject}</p>
                            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="h-2.5 w-2.5" />{s.start_time}–{s.end_time}
                            </p>
                          </div>
                          <button onClick={() => remove(s.id)} className="rounded p-0.5 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100">
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
                            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-amber-500"
                          />
                          <div className="mt-1 flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{s.completed ? "✅ Done" : "Progress"}</span>
                            <span className="font-medium text-[#FF4D00]">{s.progress || 0}%</span>
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

        <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-3 text-xs text-muted-foreground">
          <BookOpen className="h-4 w-4 text-[#FF4D00]" />
          Tip: Drag the slider on each session to track completion. Alarms/notifications require a native mobile build — available as a next step.
        </div>
      </div>
    </div>
  );
}