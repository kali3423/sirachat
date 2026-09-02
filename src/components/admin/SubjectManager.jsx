import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, FileText, Loader2, ChevronDown, Upload } from "lucide-react";
import { COLORS, ICONS, getIcon } from "@/lib/subjectIcons";

export default function SubjectManager() {
  const [subjects, setSubjects] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState("book");
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [lessonTitle, setLessonTitle] = useState({});
  const [pdfUrl, setPdfUrl] = useState({});
  const [uploadingFor, setUploadingFor] = useState(null);
  const fileRefs = useRef({});

  const load = async () => {
    const s = await base44.entities.Subject.list("created_date", 200).catch(() => []);
    const l = await base44.entities.Lesson.list("created_date", 500).catch(() => []);
    setSubjects(Array.isArray(s) ? s : []);
    setLessons(Array.isArray(l) ? l : []);
  };

  useEffect(() => {
    load();
    const u1 = base44.entities.Subject.subscribe(load);
    const u2 = base44.entities.Lesson.subscribe(load);
    return () => { u1(); u2(); };
  }, []);

  const addSubject = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await base44.entities.Subject.create({ name: name.trim(), color, icon });
      setName("");
    } finally {
      setBusy(false);
    }
  };

  const removeSubject = async (id) => {
    if (!confirm("Delete this subject and all its lessons?")) return;
    await base44.entities.Lesson.deleteMany({ subject_id: id }).catch(() => {});
    await base44.entities.Subject.delete(id);
  };

  const onPdf = async (sid, file) => {
    setUploadingFor(sid);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPdfUrl((p) => ({ ...p, [sid]: file_url }));
    } catch {} finally {
      setUploadingFor(null);
    }
  };

  const addLesson = async (sid) => {
    const t = (lessonTitle[sid] || "").trim();
    if (!t || !pdfUrl[sid]) return;
    setBusy(true);
    try {
      await base44.entities.Lesson.create({ subject_id: sid, title: t, pdf_url: pdfUrl[sid] });
      setLessonTitle((p) => ({ ...p, [sid]: "" }));
      setPdfUrl((p) => { const n = { ...p }; delete n[sid]; return n; });
      if (fileRefs.current[sid]) fileRefs.current[sid].value = "";
    } finally {
      setBusy(false);
    }
  };

  const removeLesson = async (id) => base44.entities.Lesson.delete(id);

  return (
    <div>
      <form onSubmit={addSubject} className="mb-6 rounded-2xl border border-border bg-background p-4 shadow-sm">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de la matière" className="mb-3 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus:bg-background" />
        <div className="mb-3">
          <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Couleur</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {COLORS.map((c) => (
              <button type="button" key={c} onClick={() => setColor(c)} className={`h-7 w-7 rounded-full transition ${color === c ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`} style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <div className="mb-3">
          <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Icône</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {Object.entries(ICONS).map(([key, I]) => (
              <button type="button" key={key} onClick={() => setIcon(key)} className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${icon === key ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
                <I className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
        <button type="submit" disabled={busy} className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-accent transition hover:bg-primary-strong disabled:opacity-50 press">
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </form>

      <div className="space-y-2">
        {subjects.length === 0 && <p className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">No subjects yet.</p>}
        {subjects.map((s) => {
          const ls = lessons.filter((l) => l.subject_id === s.id);
          const isOpen = openId === s.id;
          const Icon = getIcon(s.icon);
          return (
            <div key={s.id} className="rounded-2xl border border-border bg-background shadow-sm">
              <div className="flex items-center gap-3 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ backgroundColor: s.color || "#F18625" }}><Icon className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground">{ls.length} lesson(s)</p>
                </div>
                <button onClick={() => setOpenId(isOpen ? null : s.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
                  <ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <button onClick={() => removeSubject(s.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {isOpen && (
                <div className="border-t border-border p-3">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <input value={lessonTitle[s.id] || ""} onChange={(e) => setLessonTitle((p) => ({ ...p, [s.id]: e.target.value }))} placeholder="Lesson title" className="min-w-[140px] flex-1 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus:bg-background" />
                    <input ref={(el) => { fileRefs.current[s.id] = el; }} type="file" accept="application/pdf" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onPdf(s.id, f); }} />
                    <button type="button" onClick={() => fileRefs.current[s.id]?.click()} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted">
                      {uploadingFor === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} {pdfUrl[s.id] ? "PDF ✓" : "Upload PDF"}
                    </button>
                    <button type="button" onClick={() => addLesson(s.id)} disabled={busy || !pdfUrl[s.id] || !(lessonTitle[s.id] || "").trim()} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:opacity-50 press">Add lesson</button>
                  </div>
                  <div className="space-y-1.5">
                    {ls.length === 0 && <p className="text-[11px] text-muted-foreground">No lessons yet.</p>}
                    {ls.map((l) => (
                      <div key={l.id} className="group flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <a href={l.pdf_url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-sm text-foreground hover:underline">{l.title}</a>
                        <button onClick={() => removeLesson(l.id)} className="rounded p-1 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}