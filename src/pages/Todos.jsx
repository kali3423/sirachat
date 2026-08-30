import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Flag, Calendar as CalIcon, Check } from "lucide-react";
import T from "@/components/T";

const PRIORITY = {
  high: { label: "High", color: "text-[#FF4D00] bg-orange-50", dot: "bg-orange-500" },
  medium: { label: "Medium", color: "text-[#FF4D00] bg-orange-50", dot: "bg-orange-500" },
  low: { label: "Low", color: "text-emerald-600 bg-emerald-50", dot: "bg-emerald-500" },
};

export default function Todos() {
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
      <div className="group flex items-center gap-3 rounded-xl border border-border bg-background px-3.5 py-3 shadow-sm transition hover:shadow-md">
        <button
          onClick={() => toggle(t)}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
            t.done ? "border-[#FF4D00] bg-orange-500 text-white" : "border-border hover:border-[#FF8047]"
          }`}
        >
          {t.done && <Check className="h-3 w-3" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
            {t.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${p.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
              {p.label}
            </span>
            {t.due_date && (
              <span className={`inline-flex items-center gap-1 ${overdue ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                <CalIcon className="h-3 w-3" />
                {new Date(t.due_date).toLocaleDateString()}
                {overdue && " · overdue"}
              </span>
            )}
            {t.assigned_to && (
              <span className="text-muted-foreground">@{t.assigned_to}</span>
            )}
          </div>
        </div>
        <button
          onClick={() => remove(t.id)}
          className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-50 to-emerald-50/20 dark:bg-none dark:bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground"><T k="todos.title" /></h1>
          <p className="text-sm text-muted-foreground"><T k="todos.sub" /></p>
        </div>

        <form onSubmit={add} className="mb-6 rounded-2xl border border-border bg-background p-4 shadow-sm">
          <div className="flex gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a task…"
              className="flex-1 rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm outline-none focus:border-[#FF8047] focus:bg-background focus:ring-2 focus:ring-orange-100"
            />
            <button type="submit" className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-orange-500 to-[#FF6B2C] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#FF4D00]/30 transition hover:opacity-90">
              <Plus className="h-4 w-4" /> <T k="common.add" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs outline-none focus:border-[#FF8047]" />
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs outline-none focus:border-[#FF8047]">
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
            <input value={assigned} onChange={(e) => setAssigned(e.target.value)} placeholder="Assigned to" className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs outline-none focus:border-[#FF8047]" />
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-200 border-t-amber-600" /></div>
        ) : (
          <div className="space-y-5">
            <section>
              <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Flag className="h-3.5 w-3.5" /> To do · {open.length}
              </h2>
              <div className="space-y-2">
                {open.length === 0 ? <p className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted-foreground">All clear! </p>
                  : open.map((t) => <Row key={t.id} t={t} />)}
              </div>
            </section>
            {done.length > 0 && (
              <section>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Completed · {done.length}</h2>
                <div className="space-y-2 opacity-70">{done.map((t) => <Row key={t.id} t={t} />)}</div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}