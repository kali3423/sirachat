import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { PageShell, PageHeader, EmptyState, SegmentedControl } from "@/components/sira";
import { SkeletonRow } from "@/components/sira/Skeleton";
import { useShell } from "@/lib/shell";
import { useI18n } from "@/lib/i18n";
import {
  Bell, CalendarClock, CheckSquare, Timer, CalendarDays, Flame, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  session: Timer,
  task: CheckSquare,
  event: CalendarDays,
  activity: Flame,
};
const TONE = {
  session: "bg-study/15 text-study-foreground dark:text-study",
  task: "bg-primary-soft text-primary",
  event: "bg-focus/15 text-focus",
  activity: "bg-success/12 text-success",
};

function timeAgo(date) {
  const d = new Date(date).getTime();
  if (Number.isNaN(d)) return "";
  const diff = Date.now() - d;
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  const fmt = (n, u) => `${n}${u}`;
  const label = mins < 1 ? "now" : mins < 60 ? fmt(mins, "m") : abs < 864e5 ? fmt(Math.round(mins / 60), "h") : fmt(Math.round(mins / 1440), "d");
  return diff < 0 ? `in ${label}` : `${label} ago`;
}

export default function Notifications() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { setBadge } = useShell();
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ meets: [], todos: [], events: [], history: [] });

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [meets, todos, events, history] = await Promise.all([
        base44.entities.StudyMeet.list("-created_date", 50).catch(() => []),
        base44.entities.Todo.list("-created_date", 100).catch(() => []),
        base44.entities.Event.list("-created_date", 50).catch(() => []),
        base44.entities.StudyHistory.list("-created_date", 30).catch(() => []),
      ]);
      if (!alive) return;
      setData({
        meets: Array.isArray(meets) ? meets : [],
        todos: Array.isArray(todos) ? todos : [],
        events: Array.isArray(events) ? events : [],
        history: Array.isArray(history) ? history : [],
      });
      setLoading(false);
    };
    load();
    const subs = ["StudyMeet", "Todo", "Event", "StudyHistory"].map((e) =>
      base44.entities[e].subscribe(() => load())
    );
    return () => {
      alive = false;
      subs.forEach((u) => u && u());
    };
  }, []);

  const items = useMemo(() => {
    const now = Date.now();
    const out = [];

    data.meets
      .filter((m) => m.status === "scheduled" && m.date)
      .forEach((m) => {
        const when = new Date(`${m.date}T${m.start_time || "00:00"}`).getTime();
        out.push({
          id: `meet-${m.id}`, type: "session", to: "/study",
          title: `Study session: ${m.subject || "Untitled"}`,
          meta: `${m.date} · ${m.start_time || ""}`,
          ts: when, sort: when, upcoming: when > now,
        });
      });

    data.todos
      .filter((td) => !td.done && td.due_date)
      .forEach((td) => {
        const when = new Date(td.due_date).getTime();
        out.push({
          id: `todo-${td.id}`, type: "task", to: "/todos",
          title: td.title || "Task due",
          meta: `Due ${td.due_date}${td.assigned_to ? ` · ${td.assigned_to}` : ""}`,
          ts: when, sort: when, upcoming: when > now,
          overdue: when < now,
        });
      });

    data.events
      .filter((ev) => ev.date)
      .forEach((ev) => {
        const when = new Date(ev.date).getTime();
        out.push({
          id: `event-${ev.id}`, type: "event", to: "/agenda",
          title: ev.title || "Event",
          meta: `${ev.category || "event"} · ${ev.date}`,
          ts: when, sort: when, upcoming: when > now,
        });
      });

    data.history.slice(0, 15).forEach((h) => {
      const when = new Date(h.created_date).getTime();
      const verb = h.action === "completed" ? "completed a session" : h.action === "break" ? "took a break" : h.action === "quit" ? "left a session" : h.action;
      out.push({
        id: `hist-${h.id}`, type: "activity", to: "/study",
        title: `${h.user_name || "Someone"} ${verb}`,
        meta: `${h.subject ? h.subject + " · " : ""}${h.points_change > 0 ? "+" : ""}${h.points_change ?? 0} pts`,
        ts: when, sort: when, upcoming: false,
      });
    });

    return out.sort((a, b) => {
      // upcoming first (nearest), then recent activity
      if (a.upcoming && b.upcoming) return a.sort - b.sort;
      if (a.upcoming) return -1;
      if (b.upcoming) return 1;
      return b.sort - a.sort;
    });
  }, [data]);

  const upcoming = items.filter((i) => i.upcoming || i.overdue);
  const filtered = tab === "upcoming" ? upcoming : tab === "activity" ? items.filter((i) => i.type === "activity") : items;

  useEffect(() => {
    setBadge("notifications", upcoming.length);
  }, [upcoming.length, setBadge]);

  return (
    <PageShell width="md">
      <PageHeader
        title={t("nav.notifications")}
        subtitle="Sessions, tasks and study activity."
        icon={Bell}
        actions={
          <SegmentedControl
            size="sm"
            value={tab}
            onChange={setTab}
            options={[
              { value: "all", label: "All" },
              { value: "upcoming", label: "Upcoming", count: upcoming.length || undefined },
              { value: "activity", label: "Activity" },
            ]}
          />
        }
      />

      {loading ? (
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          emoji="🔔"
          title="You're all caught up"
          description="Upcoming sessions, due tasks and study activity will show up here."
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((n) => {
            const Icon = ICONS[n.type] || Bell;
            return (
              <li key={n.id}>
                <button
                  onClick={() => navigate(n.to)}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-left shadow-sm transition-all press hover:border-primary/30 hover:shadow-soft"
                >
                  <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", TONE[n.type])}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{n.title}</p>
                    <p className={cn("truncate text-xs", n.overdue ? "font-semibold text-danger" : "text-muted-foreground")}>
                      {n.overdue ? "Overdue · " : ""}{n.meta}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground tabnums">{timeAgo(n.ts)}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </PageShell>
  );
}
