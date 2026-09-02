import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, MapPin, Clock, CalendarDays } from "lucide-react";
import { PageShell, PageHeader, EmptyState, Chip, IconButton, BottomSheet } from "@/components/sira";
import { SkeletonCard } from "@/components/sira/Skeleton";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const CATS = {
  study: { label: "Study", tone: "study" },
  exam: { label: "Exam", tone: "danger" },
  meeting: { label: "Meeting", tone: "scheduled" },
  personal: { label: "Personal", tone: "success" },
};

export default function Agenda() {
  const { t } = useI18n();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", time: "", location: "", category: "study" });

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Event.list("date", 200).catch(() => []);
    setEvents(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const unsub = base44.entities.Event.subscribe(() => load());
    return unsub;
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    await base44.entities.Event.create(form);
    setForm({ title: "", description: "", date: "", time: "", location: "", category: "study" });
    setShowForm(false);
  };

  const remove = async (id) => base44.entities.Event.delete(id);

  const today = new Date().toDateString();
  const upcoming = events.filter((e) => new Date(e.date).getTime() >= new Date(today).getTime());
  const past = events.filter((e) => new Date(e.date).getTime() < new Date(today).getTime());

  const Card = ({ e }) => {
    const c = CATS[e.category] || CATS.study;
    const isToday = new Date(e.date).toDateString() === today;
    return (
      <div className="group flex gap-3.5 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/25 hover:shadow-soft">
        <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-soft py-2 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
            {new Date(e.date).toLocaleDateString(undefined, { month: "short" })}
          </span>
          <span className="text-xl font-bold text-foreground tabnums">{new Date(e.date).getDate()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">{e.title}</h3>
            <Chip tone={c.tone} className="shrink-0">{c.label}</Chip>
          </div>
          {e.description && <p className="mt-1 text-xs text-muted-foreground">{e.description}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            {e.time && <span className="inline-flex items-center gap-1 tabnums"><Clock className="h-3 w-3" />{e.time}</span>}
            {e.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{e.location}</span>}
            {isToday && <Chip tone="primary" dot>Today</Chip>}
          </div>
        </div>
        <IconButton
          variant="danger"
          size="sm"
          aria-label="Delete event"
          onClick={() => remove(e.id)}
          className="self-start opacity-0 group-hover:opacity-100"
        >
          <Trash2 />
        </IconButton>
      </div>
    );
  };

  return (
    <PageShell width="sm">
      <PageHeader
        icon={CalendarDays}
        title={t("agenda.title") || "Agenda"}
        subtitle={t("agenda.sub") || "Exams, deadlines and everything ahead."}
        actions={
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-accent transition hover:bg-primary-strong press">
            <Plus className="h-4 w-4" /> {t("common.new") || "New"}
          </button>
        }
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" /> Upcoming · <span className="tabnums">{upcoming.length}</span>
            </h2>
            {upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Nothing scheduled"
                description="Add exams, deadlines or meetings to keep everything in one place."
                action={
                  <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-accent transition hover:bg-primary-strong press">
                    <Plus className="h-4 w-4" /> Add an event
                  </button>
                }
              />
            ) : (
              <div className="space-y-2">{upcoming.map((e) => <Card key={e.id} e={e} />)}</div>
            )}
          </section>
          {past.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Past · <span className="tabnums">{past.length}</span>
              </h2>
              <div className="space-y-2 opacity-60">{past.map((e) => <Card key={e.id} e={e} />)}</div>
            </section>
          )}
        </div>
      )}

      <BottomSheet
        open={showForm}
        onOpenChange={setShowForm}
        title="New event"
        description="Add something to your agenda."
      >
        <form onSubmit={add} className="space-y-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" autoFocus className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" rows={2} className="w-full resize-none rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring" />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring tabnums" />
            <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring tabnums" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring">
              <option value="study">Study</option>
              <option value="exam">Exam</option>
              <option value="meeting">Meeting</option>
              <option value="personal">Personal</option>
            </select>
          </div>
          <button type="submit" disabled={!form.title || !form.date} className="mt-1 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-accent transition hover:bg-primary-strong disabled:opacity-60 press">
            Save event
          </button>
        </form>
      </BottomSheet>
    </PageShell>
  );
}
