import React from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { ProgressRing, Chip } from "@/components/sira";

export default function ScheduleDashboard({ sessions }) {
  const total = sessions.length;
  const completed = sessions.filter((s) => s.completed).length;
  const overall = total ? Math.round(sessions.reduce((a, s) => a + (s.progress || 0), 0) / total) : 0;

  const bySubject = {};
  sessions.forEach((s) => {
    if (!s.subject) return;
    bySubject[s.subject] = bySubject[s.subject] || { sum: 0, n: 0, done: 0 };
    bySubject[s.subject].sum += s.progress || 0;
    bySubject[s.subject].n += 1;
    if (s.completed) bySubject[s.subject].done += 1;
  });
  const subjects = Object.entries(bySubject)
    .map(([k, v]) => ({ subject: k, pct: Math.round(v.sum / v.n), done: v.done, n: v.n }))
    .sort((a, b) => b.pct - a.pct);

  if (total === 0) return null;

  return (
    <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <ProgressRing value={overall} size={56} stroke={5} barClassName="text-primary">
            <span className="text-sm font-bold text-foreground tabnums">{overall}%</span>
          </ProgressRing>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Overall progress</p>
            <p className="text-sm font-semibold text-foreground tabnums">{completed}/{total} sessions done</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Chip tone="success" icon={CheckCircle2}>{completed} done</Chip>
          <Chip tone="warning" icon={Circle}>{total - completed} remaining</Chip>
        </div>
      </div>

      {subjects.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <div key={s.subject}>
              <div className="mb-1 flex justify-between text-[11px]">
                <span className="font-medium text-foreground">{s.subject}</span>
                <span className="text-muted-foreground tabnums">{s.pct}% · {s.done}/{s.n}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
