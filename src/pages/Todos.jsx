import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, ListChecks, Calendar as CalIcon, Check, CheckCircle2 } from "lucide-react";
import { PageShell, PageHeader, EmptyState, Chip } from "@/components/sira";
import { SkeletonRow } from "@/components/sira/Skeleton";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const PRIORITY = {
  high: { label: "High", tone: "danger" },
  medium: { label: "Medium", tone: "warning" },
  low: { label: "Low", tone: "success" },
};

export default function Todos() {
  const { t } = useI18n();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assigned, setAssigned] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Todo.list("-created_date", 200).catch(() => []);
    setTodos(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const unsub = base44.entities.Todo.subscribe(() => load());
    return unsub;
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await base44.entities.Todo.create({
      title: title.trim(),
      due_date: due || undefined,
      priority,
      assigned_to: assigned || undefined,
    });
    setTitle(""); setDue(""); setPriority("medium"); setAssigned("");
  };

  const toggle = async (t) => {
    await base44.entities.Todo.update(t.id, { done: !t.done });
  };

  const remove = async (id) => {
    await base44.entities.Todo.delete(id);
  };

  const open = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  const Row = ({ t }) => {
    const p = PRIORITY[t.priority] || PRIORITY.medium;
    const overdue = t.due_date && new Date(t.due_date) < new Date(new Date().toDateString()) && !t.done;
    return (
      <div className="group flex items-center gap-3 rounded-2xl border border-border bg-card px-3.5 py-3 shadow-sm transition-all hover:border-primary/25 hover:shadow-soft">
        <button
          onClick={() => toggle(t)}
          aria-label={t.done ? "Mark as not done" : "Mark as done"}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition press",
            t.done ? "border-completed bg-completed text-white" : "border-border hover:border-primary"
          )}
        >
          {t.done && <Check className="h-3 w-3" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className={cn("text-sm font-medium", t.done ? "text-muted-foreground line-through" : "text-foreground")}>
            {t.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
            <Chip tone={p.tone} dot className="px-2 py-0.5 text-[11px]">{p.label}</Chip>
            {t.due_date && (
              <span className={cn("inline-flex items-center gap-1 tabnums", overdue ? "font-semibold text-danger" : "text-muted-foreground")}>
                <CalIcon className="h-3 w-3" />
                {new Date(t.due_date).toLocaleDateString()}
                {overdue && " · overdue"}
              </span>
            )}
            {t.assigned_to && <span className="text-muted-foreground">@{t.assigned_to}</span>}
          </div>
        </div>
        <button
          onClick={() => remove(t.id)}
          aria-label="Delete task"
          className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition hover:bg-danger/10 hover:text-danger group-hover:opacity-100 press"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <PageShell width="sm">
      <PageHeader
        icon={ListChecks}
        title={t("todos.title") || "Tasks"}
        subtitle={t("todos.sub") || "Track what needs doing — together."}
      />

      <form onSubmit={add} className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task…"
            className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button type="submit" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-accent transition hover:bg-primary-strong press">
            <Plus className="h-4 w-4" /> {t("common.add") || "Add"}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-ring tabnums" />
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-ring">
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
          <input value={assigned} onChange={(e) => setAssigned(e.target.value)} placeholder="Assigned to" className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
      </form>

      {loading ? (
        <div className="space-y-2 rounded-2xl border border-border bg-card">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : (
        <div className="space-y-5">
          <section>
            <h2 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <ListChecks className="h-3.5 w-3.5" /> To do · <span className="tabnums">{open.length}</span>
            </h2>
            {open.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="All clear!"
                description="No open tasks right now. Add one above to get started."
              />
            ) : (
              <div className="space-y-2">{open.map((t) => <Row key={t.id} t={t} />)}</div>
            )}
          </section>
          {done.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Completed · <span className="tabnums">{done.length}</span>
              </h2>
              <div className="space-y-2 opacity-70">{done.map((t) => <Row key={t.id} t={t} />)}</div>
            </section>
          )}
        </div>
      )}
    </PageShell>
  );
}
