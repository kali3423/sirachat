import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2 } from "lucide-react";

const DAYS = [
  { v: "lundi", l: "Lundi" }, { v: "mardi", l: "Mardi" }, { v: "mercredi", l: "Mercredi" },
  { v: "jeudi", l: "Jeudi" }, { v: "vendredi", l: "Vendredi" }, { v: "samedi", l: "Samedi" },
];
const SLOTS = [
  { start: 8, end: 9, l: "8h – 9h" }, { start: 9, end: 10, l: "9h – 10h" }, { start: 10, end: 11, l: "10h – 11h" },
  { start: 11, end: 12, l: "11h – 12h" }, { start: 14, end: 15, l: "14h – 15h" }, { start: 15, end: 16, l: "15h – 16h" },
  { start: 16, end: 17, l: "16h – 17h" }, { start: 17, end: 18, l: "17h – 18h" },
];
const COLORS = ["#D94639", "#1D78C1", "#3F8E4D", "#F18625", "#10B981", "#A8326D", "#7C3AED", "#0891B2"];

export default function TimetableManager() {
  const [entries, setEntries] = useState([]);
  const [day, setDay] = useState("lundi");
  const [slot, setSlot] = useState("8");
  const [subject, setSubject] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const e = await base44.entities.TimetableEntry.list("created_date", 500).catch(() => []);
    setEntries(Array.isArray(e) ? e : []);
  };
  useEffect(() => {
    load();
    const u = base44.entities.TimetableEntry.subscribe(load);
    return u;
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!subject.trim()) return;
    const s = SLOTS.find((x) => String(x.start) === slot);
    setBusy(true);
    try {
      await base44.entities.TimetableEntry.create({
        day, start_time: s.start, end_time: s.end, subject: subject.trim(), color,
      });
      setSubject("");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => base44.entities.TimetableEntry.delete(id);

  return (
    <div>
      <form onSubmit={add} className="mb-6 rounded-2xl border border-border bg-background p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Jour</label>
            <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-[#FF8047]">
              {DAYS.map((d) => (<option key={d.v} value={d.v}>{d.l}</option>))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Créneau</label>
            <select value={slot} onChange={(e) => setSlot(e.target.value)} className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-[#FF8047]">
              {SLOTS.map((s) => (<option key={s.start} value={s.start}>{s.l}</option>))}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Matière</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="ex: Mathématiques" className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-[#FF8047] focus:bg-background" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Couleur</label>
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              {COLORS.map((c) => (
                <button type="button" key={c} onClick={() => setColor(c)} className={`h-6 w-6 rounded-full ${color === c ? "ring-2 ring-offset-2 ring-amber-500" : ""}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </div>
        <button type="submit" disabled={busy || !subject.trim()} className="mt-3 flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-orange-500 to-[#FF6B2C] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#FF4D00]/30 disabled:opacity-50">
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </form>

      <div className="space-y-2">
        {entries.length === 0 && <p className="rounded-2xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">Aucun créneau. Ajoutez vos matières ci-dessus.</p>}
        {DAYS.map((d) => {
          const dayEntries = entries.filter((e) => e.day === d.v).sort((a, b) => a.start_time - b.start_time);
          if (dayEntries.length === 0) return null;
          return (
            <div key={d.v} className="rounded-xl border border-border bg-background p-3">
              <p className="mb-2 text-xs font-semibold text-foreground">{d.l}</p>
              <div className="space-y-1">
                {dayEntries.map((e) => (
                  <div key={e.id} className="group flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: e.color || "#F18625" }} />
                    <span className="text-xs font-medium text-muted-foreground">{e.start_time}h–{e.end_time}h</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">{e.subject}</span>
                    <button onClick={() => remove(e.id)} className="rounded p-1 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}