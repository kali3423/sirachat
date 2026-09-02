import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Utensils, CalendarDays } from "lucide-react";
import { PageShell, PageHeader } from "@/components/sira";
import { SkeletonBox } from "@/components/sira/Skeleton";
import { cn } from "@/lib/utils";

const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const DAY_LABELS = {
  lundi: "Lundi", mardi: "Mardi", mercredi: "Mercredi",
  jeudi: "Jeudi", vendredi: "Vendredi", samedi: "Samedi",
};
const SLOTS = [
  { start: 8, end: 9 }, { start: 9, end: 10 }, { start: 10, end: 11 }, { start: 11, end: 12 },
  { start: 12, end: 14, lunch: true },
  { start: 14, end: 15 }, { start: 15, end: 16 }, { start: 16, end: 17 }, { start: 17, end: 18 },
];

export default function Timetable() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.TimetableEntry.list("created_date", 500).then((e) => {
      setEntries(Array.isArray(e) ? e : []);
      setLoading(false);
    }).catch(() => setLoading(false));
    const unsub = base44.entities.TimetableEntry.subscribe(() => {
      base44.entities.TimetableEntry.list("created_date", 500).then((e) => setEntries(Array.isArray(e) ? e : []));
    });
    return unsub;
  }, []);

  const find = (day, start) => entries.find((e) => e.day === day && Number(e.start_time) === start);

  return (
    <PageShell width="2xl">
      <PageHeader
        icon={CalendarDays}
        title="Emploi du temps"
        subtitle="Votre programme hebdomadaire"
      />

      {loading ? (
        <SkeletonBox className="h-80 w-full rounded-2xl" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm scrollbar-thin">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="sticky left-0 z-10 w-20 border-b border-border bg-muted/50 px-3 py-3 text-left text-xs font-bold text-muted-foreground">Jour</th>
                {SLOTS.map((s) => (
                  <th
                    key={s.start}
                    className={cn(
                      "border-b border-l border-border px-2 py-3 text-center text-xs font-bold tabnums",
                      s.lunch ? "bg-study/10 text-study-foreground dark:text-study" : "text-foreground"
                    )}
                  >
                    {s.start}–{s.end}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((d, dIdx) => (
                <tr key={d}>
                  <th className="sticky left-0 z-10 whitespace-nowrap border-b border-r border-border bg-card px-3 py-2 text-left text-xs font-bold text-foreground">
                    {DAY_LABELS[d]}
                  </th>
                  {SLOTS.map((s) => {
                    if (s.lunch) {
                      if (dIdx === 0) {
                        return (
                          <td
                            key="lunch"
                            rowSpan={DAYS.length}
                            className="border-b border-l border-border bg-study/10 px-2 py-3 text-center align-middle"
                          >
                            <div className="flex flex-col items-center justify-center gap-1 text-xs font-bold text-study-foreground dark:text-study">
                              <Utensils className="h-4 w-4" />
                              <span className="hidden sm:inline">Pause déjeuner</span>
                            </div>
                          </td>
                        );
                      }
                      return null;
                    }
                    const e = find(d, s.start);
                    return (
                      <td key={s.start} className="border-b border-l border-border p-1.5 align-top">
                        {e ? (
                          <div className="rounded-lg px-2 py-1.5 text-xs font-semibold text-white shadow-sm" style={{ backgroundColor: e.color || "hsl(var(--primary))" }}>
                            {e.subject || "—"}
                          </div>
                        ) : (
                          <div className="h-9 rounded-lg bg-muted/40" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
