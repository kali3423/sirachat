import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, StickyNote, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PageShell, PageHeader, EmptyState, Chip, IconButton, BottomSheet } from "@/components/sira";
import { SkeletonCard } from "@/components/sira/Skeleton";

export default function Notes() {
  const { t } = useI18n();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "", content: "" });

  const load = async () => {
    const data = await base44.entities.StudyNote.list("-created_date", 200).catch(() => []);
    setNotes(Array.isArray(data) ? data : []);
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
    setBusy(true);
    try {
      await base44.entities.StudyNote.create({ title: form.title.trim(), subject: form.subject.trim(), content: form.content.trim() });
      setForm({ title: "", subject: "", content: "" });
      setShowForm(false);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => base44.entities.StudyNote.delete(id);

  return (
    <PageShell width="xl">
      <PageHeader
        icon={StickyNote}
        title={t("notes.title") || "Notes"}
        subtitle={t("notes.sub") || "Quick captures and study jottings."}
        actions={
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-accent transition hover:bg-primary-strong press">
            <Plus className="h-4 w-4" /> {t("notes.new") || "New note"}
          </button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="No notes yet"
          description="Jot down ideas, formulas or reminders — they'll appear here."
          action={
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-accent transition hover:bg-primary-strong press">
              <Plus className="h-4 w-4" /> Create a note
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((n) => (
            <div key={n.id} className="group flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/25 hover:shadow-soft">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-study/15 text-study-foreground dark:text-study">
                  <StickyNote className="h-4 w-4" />
                </div>
                <IconButton variant="danger" size="sm" aria-label="Delete note" onClick={() => remove(n.id)} className="opacity-0 group-hover:opacity-100">
                  <Trash2 />
                </IconButton>
              </div>
              <p className="text-sm font-semibold text-foreground">{n.title}</p>
              {n.subject && <Chip tone="primary" className="mt-1 w-fit">{n.subject}</Chip>}
              {n.content && <p className="mt-2 line-clamp-6 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{n.content}</p>}
              <p className="mt-3 text-[10px] text-muted-foreground tabnums">{new Date(n.created_date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      <BottomSheet open={showForm} onOpenChange={setShowForm} title="New note" description="Capture a thought before it slips away.">
        <form onSubmit={add} className="space-y-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" autoFocus className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring" />
          <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject (optional)" className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring" />
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your notes…" rows={5} className="w-full resize-none rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring" />
          <button type="submit" disabled={busy || !form.title.trim()} className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-accent transition hover:bg-primary-strong disabled:opacity-60 press">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save note"}
          </button>
        </form>
      </BottomSheet>
    </PageShell>
  );
}
