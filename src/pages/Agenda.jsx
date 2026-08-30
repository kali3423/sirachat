import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, MapPin, Clock, Calendar as CalIcon } from "lucide-react";
import T from "@/components/T";

const CATS = {
  study: { label: "Study", color: "bg-orange-100 text-[#CC3D00] border-orange-200" },
  exam: { label: "Exam", color: "bg-orange-100 text-[#CC3D00] border-orange-200" },
  meeting: { label: "Meeting", color: "bg-orange-100 text-[#CC3D00] border-orange-200" },
  personal: { label: "Personal", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

export default function Agenda() {
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
      <div className="group flex gap-4 rounded-2xl border border-border bg-background p-4 shadow-sm transition hover:shadow-md">
        <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 py-2 text-center">
          <span className="text-[10px] font-semibold uppercase text-[#FF4D00]">
            {new Date(e.date).toLocaleDateString(undefined, { month: "short" })}
          </span>
          <span className="text-xl font-bold text-foreground">{new Date(e.date).getDate()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">{e.title}</h3>
            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${c.color}`}>{c.label}</span>
          </div>
          {e.description && <p className="mt-1 text-xs text-muted-foreground">{e.description}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            {e.time && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{e.time}</span>}
            {e.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{e.location}</span>}
            {isToday && <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-medium text-white">Today</span>}
          </div>
        </div>
        <button onClick={() => remove(e.id)} className="self-start rounded-lg p-1.5 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-50 to-orange-50/20 dark:bg-none dark:bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground"><T k="agenda.title" /></h1>
            <p className="text-sm text-muted-foreground"><T k="agenda.sub" /></p>
          </div>
          <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-orange-500 to-[#FF6B2C] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#FF4D00]/30 transition hover:opacity-90">
            <Plus className="h-4 w-4" /> <T k="common.new" />
          </button>
        </div>

        {showForm && (
          <form onSubmit={add} className="mb-6 space-y-3 rounded-2xl border border-border bg-background p-4 shadow-sm">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm outline-none focus:border-[#FF8047] focus:bg-background" />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full resize-none rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm outline-none focus:border-[#FF8047] focus:bg-background" />
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm outline-none focus:border-[#FF8047]" />
              <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm outline-none focus:border-[#FF8047]" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm outline-none focus:border-[#FF8047]" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm outline-none focus:border-[#FF8047]">
                <option value="study">Study</option>
                <option value="exam">Exam</option>
                <option value="meeting">Meeting</option>
                <option value="personal">Personal</option>
              </select>
            </div>
            <button type="submit" className="w-full rounded-xl bg-[#FF6B2C] py-2.5 text-sm font-medium text-white transition hover:bg-amber-700">Save event</button>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-200 border-t-amber-600" /></div>
        ) : (
          <div className="space-y-6">
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><CalIcon className="h-3.5 w-3.5" /> Upcoming · {upcoming.length}</h2>
              <div className="space-y-2">
                {upcoming.length === 0 ? <p className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted-foreground">No upcoming events</p> : upcoming.map((e) => <Card key={e.id} e={e} />)}
              </div>
            </section>
            {past.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Past · {past.length}</h2>
                <div className="space-y-2 opacity-60">{past.map((e) => <Card key={e.id} e={e} />)}</div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}