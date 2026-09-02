import React, { useEffect, useState } from "react";
import { Coffee, LogOut, Timer as TimerIcon } from "lucide-react";
import { ProgressRing } from "@/components/sira";

export default function ActiveSession({ meet, onBreak, onQuit, busy }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!meet?.started_at) return;
    const tick = () => setElapsed(Date.now() - new Date(meet.started_at).getTime());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [meet?.started_at]);

  const fmt = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    return `${h ? h + ":" : ""}${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  if (!meet) return null;
  const plannedStart = meet.date && meet.start_time ? new Date(`${meet.date}T${meet.start_time}`) : null;
  const plannedEnd = meet.date && meet.end_time ? new Date(`${meet.date}T${meet.end_time}`) : null;
  const remainingMs = plannedEnd ? plannedEnd.getTime() - Date.now() : 0;
  const overtime = remainingMs < 0;

  // Session progress ring (0–100) based on planned window
  let progress = 0;
  if (plannedStart && plannedEnd) {
    const total = plannedEnd.getTime() - plannedStart.getTime();
    const done = Date.now() - plannedStart.getTime();
    progress = total > 0 ? Math.min(100, Math.max(0, (done / total) * 100)) : 0;
  }

  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/5 bg-[hsl(22_16%_10%)] p-6 text-white shadow-float">
      {/* ambient focus glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-study/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-focus/20 blur-3xl" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-study/20 px-3 py-1 text-[11px] font-semibold text-study">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-study" />
            <TimerIcon className="h-3 w-3" /> Live study session
          </span>
          <h2 className="mt-2 truncate font-heading text-xl font-bold tracking-tight">{meet.subject}</h2>
          <p className="mt-0.5 text-xs text-white/50 tabnums">
            {meet.date} · {meet.start_time} – {meet.end_time}
          </p>
          <p className="mt-3 text-[10px] uppercase tracking-wide text-white/40">Elapsed</p>
          <p className="font-mono text-4xl font-bold tabular-nums">{fmt(elapsed)}</p>
          {plannedEnd && (
            <p className={overtime ? "mt-0.5 text-[11px] font-medium text-warning" : "mt-0.5 text-[11px] text-white/50"}>
              {overtime ? `+${fmt(-remainingMs)} over` : `${fmt(remainingMs)} left`}
            </p>
          )}
        </div>

        <ProgressRing
          value={progress}
          size={92}
          stroke={7}
          trackClassName="text-white/10"
          barClassName={overtime ? "text-warning" : "text-study"}
          className="shrink-0"
        >
          <span className="text-lg font-bold tabnums">{Math.round(progress)}%</span>
        </ProgressRing>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-2.5">
        <button
          onClick={onBreak}
          disabled={busy}
          className="flex flex-col items-center gap-0.5 rounded-2xl bg-warning/15 py-3 text-sm font-semibold text-warning transition hover:bg-warning/25 disabled:opacity-60 press"
        >
          <Coffee className="h-4 w-4" /> Break
          <span className="text-[10px] font-normal opacity-80">−10 / 10 min</span>
        </button>
        <button
          onClick={onQuit}
          disabled={busy}
          className="flex flex-col items-center gap-0.5 rounded-2xl bg-danger/15 py-3 text-sm font-semibold text-danger transition hover:bg-danger/25 disabled:opacity-60 press"
        >
          <LogOut className="h-4 w-4" /> Quit
          <span className="text-[10px] font-normal opacity-80">−100 pts</span>
        </button>
      </div>
    </div>
  );
}
