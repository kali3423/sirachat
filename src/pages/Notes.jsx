import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, StickyNote } from "lucide-react";
import T from "@/components/T";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "", content: "" });

  const load = async () => {
    const data = await base44.entities.StudyNote.list("-created_date", 200).catch(() => []);
    setNotes(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const u = base44.entities.StudyNote.subscribe(() => load());
    return u;
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await base44.entities.StudyNote.create({ title: form.title.trim(), subject: form.subject.trim(), content: form.content.trim() });
    setForm({ title: "", subject: "", content: "" });
    setShowForm(false);
  };

  const remove = async (id) => base44.entities.StudyNote.delete(id);

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-50 to-orange-50/20 dark:bg-none dark:bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground"><T k="notes.title" /></h1>
            <p className="text-sm text-muted-foreground"><T k="notes.sub" /></p>
          </div>
          <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-orange-500 to-[#FF6B2C] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#FF4D00]/30 transition hover:opacity-90">
            <Plus className="h-4 w-4" /> <T k="notes.new" />
          </button>
        </div>

        {showForm && (
          <form onSubmit={add} className="mb-6 space-y-3 rounded-2xl border border-border bg-background p-4 shadow-sm">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm outline-none focus:border-[#FF8047] focus:bg-background" />
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject (optional)" className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm outline-none focus:border-[#FF8047] focus:bg-background" />
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your notes..." rows={5} className="w-full resize-none rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm outline-none focus:border-[#FF8047] focus:bg-background" />
            <button type="submit" className="w-full rounded-xl bg-gradient-to-br from-orange-500 to-[#FF6B2C] py-2.5 text-sm font-medium text-white transition hover:opacity-90">Save note</button>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-200 border-t-amber-600" /></div>
        ) : notes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">No notes yet. Create one to get started.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((n) => (
              <div key={n.id} className="group flex flex-col rounded-2xl border border-border bg-background p-4 shadow-sm">
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF4D00]"><StickyNote className="h-4 w-4" /></div>
                  <button onClick={() => remove(n.id)} className="rounded-lg p-1 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
                </div>
                <p className="text-sm font-semibold text-foreground">{n.title}</p>
                {n.subject && <span className="mt-1 inline-block w-fit rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-[#CC3D00]">{n.subject}</span>}
                {n.content && <p className="mt-2 line-clamp-6 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{n.content}</p>}
                <p className="mt-3 text-[10px] text-muted-foreground">{new Date(n.created_date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}