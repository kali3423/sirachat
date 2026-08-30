import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image as UIImage } from "@/components/ui/image";
import { Eraser, Trash2, Download, Save, Pencil, Palette } from "lucide-react";
import T from "@/components/T";

const COLORS = ["#0f172a", "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#ffffff"];
const SIZES = [2, 4, 8, 14];

export default function DrawingBoard() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#0f172a");
  const [size, setSize] = useState(4);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [me, setMe] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;

    base44.entities.Drawing.list("-created_date", 50).then((d) => { 
      setSaved(Array.isArray(d) ? d : []); 
      setLoading(false); 
    }).catch(() => setLoading(false));
    const unsub = base44.entities.Drawing.subscribe(() => {
      base44.entities.Drawing.list("-created_date", 50).then(d => setSaved(Array.isArray(d) ? d : []));
    });
    return unsub;
  }, []);

  const pos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const start = (e) => {
    e.preventDefault();
    setDrawing(true);
    const { x, y } = pos(e);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  };

  const move = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const { x, y } = pos(e);
    ctxRef.current.strokeStyle = color;
    ctxRef.current.lineWidth = size;
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const end = () => setDrawing(false);

  const clear = () => {
    const c = canvasRef.current;
    ctxRef.current.fillStyle = "#ffffff";
    ctxRef.current.fillRect(0, 0, c.width, c.height);
  };

  const save = async () => {
    const blob = await new Promise((res) => canvasRef.current.toBlob(res, "image/png"));
    const file = new File([blob], "drawing.png", { type: "image/png" });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Drawing.create({
      title: title.trim() || "Untitled sketch",
      image_url: file_url,
      author_name: me?.full_name || "Me",
    });
    setTitle("");
    clear();
  };

  const download = () => {
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const remove = async (id) => base44.entities.Drawing.delete(id);

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-50 to-orange-50/20 dark:bg-none dark:bg-background">
      <div className="border-b border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground"><T k="drawing.title" /></h1>
            <p className="text-xs text-muted-foreground"><T k="drawing.sub" /></p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={download} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted" title="Download"><Download className="h-4 w-4" /></button>
            <button onClick={clear} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted" title="Clear"><Eraser className="h-4 w-4" /></button>
            <button onClick={save} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-orange-500 to-[#FF6B2C] px-3 py-2 text-sm font-medium text-white shadow-lg shadow-[#FF4D00]/30 transition hover:opacity-90">
              <Save className="h-4 w-4" /> <T k="common.share" />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Name your sketch…" className="flex-1 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs outline-none focus:border-[#FF8047] focus:bg-background" />
          <div className="flex items-center gap-1.5">
            <Palette className="h-4 w-4 text-muted-foreground" />
            {COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} className={`h-6 w-6 rounded-full border-2 transition ${color === c ? "border-[#FF4D00] scale-110" : "border-border"}`} style={{ background: c }} />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <Pencil className="h-4 w-4 text-muted-foreground" />
            {SIZES.map((s) => (
              <button key={s} onClick={() => setSize(s)} className={`flex h-7 w-7 items-center justify-center rounded-lg border transition ${size === s ? "border-[#FF4D00] bg-orange-50" : "border-border"}`}>
                <span className="rounded-full bg-foreground" style={{ width: s, height: s }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-3 sm:p-4">
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
          className="h-full w-full touch-none rounded-2xl border border-border bg-white shadow-inner"
          style={{ cursor: "crosshair" }}
        />
      </div>

      {!loading && saved.length > 0 && (
        <div className="border-t border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Shared sketches · {saved.length}</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {saved.map((d) => (
              <div key={d.id} className="group relative shrink-0">
                <div className="h-20 w-28 overflow-hidden rounded-xl border border-border shadow-sm">
                  <UIImage src={d.image_url} alt={d.title} className="h-full w-full object-cover" fittingType="fit" />
                </div>
                <p className="mt-1 max-w-[7rem] truncate text-[11px] text-muted-foreground">{d.title}</p>
                <button onClick={() => remove(d.id)} className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-1 text-white opacity-0 shadow transition group-hover:opacity-100">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}