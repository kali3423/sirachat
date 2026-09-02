import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, FileText, ChevronRight, BookOpen } from "lucide-react";
import { getIcon } from "@/lib/subjectIcons";
import { PageShell, PageHeader, EmptyState } from "@/components/sira";
import { SkeletonRow } from "@/components/sira/Skeleton";

export default function Subjects() {
  const { t } = useI18n();
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
      <PageShell width="md">
        <button onClick={() => setSelected(null)} className="mb-4 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-muted-foreground transition hover:text-foreground press">
          <ArrowLeft className="h-4 w-4" /> All subjects
        </button>
        <div className="mb-5 flex items-center gap-3.5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-soft" style={{ backgroundColor: selected.color || "hsl(var(--primary))" }}>
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground">{selected.name}</h1>
            <p className="text-sm text-muted-foreground tabnums">{ls.length} lesson{ls.length === 1 ? "" : "s"}</p>
          </div>
        </div>
        {ls.length === 0 ? (
          <EmptyState icon={FileText} title="No lessons yet" description="Lessons added for this subject will appear here." />
        ) : (
          <div className="space-y-2">
            {ls.map((l) => (
              <a key={l.id} href={l.pdf_url} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/25 hover:shadow-soft">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{l.title}</p>
                  <p className="text-[11px] text-muted-foreground">Open PDF</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </a>
            ))}
          </div>
        )}
      </PageShell>
    );
  }

  return (
    <PageShell width="sm">
      <PageHeader
        icon={BookOpen}
        title={t("subjects.title") || "Subjects"}
        subtitle={t("subjects.sub") || "Your courses and lesson library."}
      />
      {loading ? (
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : subjects.length === 0 ? (
        <EmptyState icon={BookOpen} title="No subjects yet" description="Ask an admin to add subjects and lessons to your library." />
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {subjects.map((s) => {
            const Icon = getIcon(s.icon);
            const count = lessonsFor(s.id).length;
            return (
              <button key={s.id} onClick={() => setSelected(s)} className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition hover:bg-muted/50 press">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-sm" style={{ backgroundColor: s.color || "hsl(var(--primary))" }}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">{s.name}</span>
                  <span className="block text-[11px] text-muted-foreground tabnums">{count} lesson{count === 1 ? "" : "s"}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
              </button>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
