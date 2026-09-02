import React from "react";
import { useNavigate } from "react-router-dom";
import { PageShell, PageHeader, Chip } from "@/components/sira";
import { useI18n } from "@/lib/i18n";
import {
  CheckSquare, Calendar, BookOpen, CalendarClock, StickyNote,
  Pencil, Gamepad2, ShieldCheck, Timer, Compass, ArrowRight, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TILES = [
  { to: "/study", key: "nav.study", desc: "Focus sessions & points", icon: Timer, tone: "study" },
  { to: "/schedule", key: "nav.schedule", desc: "Weekly plan & progress", icon: BookOpen, tone: "scheduled" },
  { to: "/todos", key: "nav.todos", desc: "Shared tasks", icon: CheckSquare, tone: "primary" },
  { to: "/agenda", key: "nav.agenda", desc: "Events & exams", icon: Calendar, tone: "focus" },
  { to: "/subjects", key: "nav.subjects", desc: "Lessons & PDFs", icon: BookOpen, tone: "completed" },
  { to: "/timetable", key: "nav.timetable", desc: "Class schedule", icon: CalendarClock, tone: "scheduled" },
  { to: "/notes", key: "nav.notes", desc: "Quick study notes", icon: StickyNote, tone: "warning" },
  { to: "/drawing", key: "nav.drawing", desc: "Sketch & share", icon: Pencil, tone: "focus" },
  { to: "/relax", key: "nav.relax", desc: "Take a break", icon: Gamepad2, tone: "primary" },
  { to: "/recovery", key: "nav.recovery", desc: "Build your streak", icon: ShieldCheck, tone: "success" },
];

const TONE_BG = {
  primary: "bg-primary-soft text-primary",
  study: "bg-study/15 text-study-foreground dark:text-study",
  scheduled: "bg-scheduled/12 text-scheduled",
  focus: "bg-focus/15 text-focus",
  completed: "bg-completed/12 text-completed",
  warning: "bg-warning/15 text-warning-foreground dark:text-warning",
  success: "bg-success/12 text-success",
};

export default function Explore() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <PageShell width="xl">
      <PageHeader
        eyebrow="Sira"
        title={t("nav.explore")}
        subtitle="Everything in your study space, one tap away."
        icon={Compass}
      />

      {/* Featured banner */}
      <button
        onClick={() => navigate("/study")}
        className="group mb-6 flex w-full items-center gap-4 overflow-hidden rounded-2xl bg-sira p-5 text-left text-white shadow-accent press"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
          <Sparkles className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-lg font-extrabold leading-tight">Start a focus session</p>
          <p className="text-sm text-white/85">Set a subject, run the timer, earn points together.</p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
      </button>

      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-heading text-sm font-bold text-foreground">{t("nav.tools")}</h2>
        <Chip tone="neutral">{TILES.length}</Chip>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {TILES.map(({ to, key, desc, icon: Icon, tone }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all press hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
          >
            <span className={cn("flex h-12 w-12 items-center justify-center rounded-xl", TONE_BG[tone])}>
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <p className="font-heading text-sm font-bold text-foreground">{t(key)}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </PageShell>
  );
}
