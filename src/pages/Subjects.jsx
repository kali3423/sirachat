import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import T from "@/components/T";
import { ArrowLeft, FileText } from "lucide-react";
import { getIcon } from "@/lib/subjectIcons";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const s = await base44.entities.Subject.list("created_date", 200).catch(() => []);
      const l = await base44.entities.Lesson.list("created_date", 500).catch(() => []);
      setSubjects(Array.isArray(s) ? s : []);
      setLessons(Array.isArray(l) ? l : []);
      setLoading(false);
    })();
    const u1 = base44.entities.Subject.subscribe(() => { 
      base44.entities.Subject.list("created_date", 200).then(s => setSubjects(Array.isArray(s) ? s : [])); 
    });
    const u2 = base44.entities.Lesson.subscribe(() => { 
      base44.entities.Lesson.list("created_date", 500).then(l => setLessons(Array.isArray(l) ? l : [])); 
    });
    return () => { u1(); u2(); };
  }, []);

  const lessonsFor = (sid) => lessons.filter((l) => l.subject_id === sid);

  if (selected) {
    const ls = lessonsFor(selected.id);
    const Icon = getIcon(selected.icon);
    return (
      <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-50 to-orange-50/20 dark:bg-none dark:bg-background">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <button onClick={() => setSelected(null)} className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md" style={{ backgroundColor: selected.color || "#F18625" }}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{selected.name}</h1>
              <p className="text-sm text-muted-foreground">{ls.length} lesson(s)</p>
            </div>
          </div>
          <div className="space-y-2">
            {ls.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">No lessons yet.</p>
            ) : ls.map((l) => (
              <a key={l.id} href={l.pdf_url} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-2xl border border-border bg-background p-4 shadow-sm transition hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#FF4D00]"><FileText className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{l.title}</p>
                  <p className="text-[11px] text-muted-foreground">Open PDF</p>
                </div>
                <span className="text-xs font-medium text-[#FF4D00] opacity-0 transition group-hover:opacity-100">View →</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-50 to-orange-50/20 dark:bg-none dark:bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground"><T k="subjects.title" /></h1>
          <p className="text-sm text-muted-foreground"><T k="subjects.sub" /></p>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-200 border-t-amber-600" /></div>
        ) : subjects.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">No subjects yet. Ask an admin to add some.</p>
        ) : (
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
            {subjects.map((s) => {
              const Icon = getIcon(s.icon);
              return (
                <button key={s.id} onClick={() => setSelected(s)} className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition hover:bg-muted/40">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-sm" style={{ backgroundColor: s.color || "#F18625" }}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{s.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{lessonsFor(s.id).length} lesson(s)</span>
                  </span>
                  <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}