import React from "react";
import { CheckCircle2, Circle } from "lucide-react";

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

  return (
    <div className="mb-6 rounded-2xl border border-border bg-background p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14">
            <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/40" />
              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${(overall / 100) * 94.2} 94.2`} className="text-[#FF4D00]" strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">{overall}%</span>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Overall progress</p>
            <p className="text-sm font-semibold text-foreground">{completed}/{total} sessions done</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />{completed} done</span>
          <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-[#CC3D00]"><Circle className="h-3.5 w-3.5" />{total - completed} remaining</span>
        </div>
      </div>

      {subjects.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <div key={s.subject}>
              <div className="mb-1 flex justify-between text-[11px]">
                <span className="font-medium text-foreground">{s.subject}</span>
                <span className="text-muted-foreground">{s.pct}% · {s.done}/{s.n}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-500" style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}