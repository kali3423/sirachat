import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useLocalAuth } from "@/lib/localAuth";
import { Image as UIImage } from "@/components/ui/image";
import { Shield, Loader2, Settings as SettingsIcon, Image as ImageIcon, Check, Save, BookOpen, LogOut, CalendarClock } from "lucide-react";
import SubjectManager from "@/components/admin/SubjectManager";
import TimetableManager from "@/components/admin/TimetableManager";
import T from "@/components/T";

export default function Admin() {
  const { adminLogout } = useLocalAuth();
  const [tab, setTab] = useState("settings");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const [appName, setAppName] = useState("Sira Chat");
  const [tagline, setTagline] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [agoraAppId, setAgoraAppId] = useState("");
  const logoRef = useRef(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const s = await base44.entities.AppSetting.list().catch(() => []);
      setSettings(Array.isArray(s) && s[0] ? s[0] : null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (settings) {
      setAppName(settings.app_name || "Sira Chat");
      setTagline(settings.tagline || "");
      setLogoUrl(settings.logo_url || "");
      setAgoraAppId(settings.agora_app_id || "");
    }
  }, [settings]);

  const uploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setLogoUrl(file_url);
    } catch {
      setErr("Logo upload failed.");
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(null); setMsg(null);
    try {
      const payload = { app_name: appName.trim(), tagline: tagline.trim(), logo_url: logoUrl, agora_app_id: agoraAppId.trim() };
      if (settings?.id) {
        await base44.entities.AppSetting.update(settings.id, payload);
      } else {
        await base44.entities.AppSetting.create(payload);
      }
      setMsg("App settings saved.");
      await load();
    } catch (e2) {
      setErr(e2?.message || "Could not save settings.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-orange-50/20">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
              <Shield className="h-6 w-6 text-[#FF4D00]" /> <T k="admin.title" />
            </h1>
            <p className="text-sm text-muted-foreground"><T k="admin.sub" /></p>
          </div>
          <button
            onClick={adminLogout}
            className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        <div className="mb-5 flex gap-1 rounded-xl border border-border bg-background p-1 shadow-sm">
          <button onClick={() => setTab("settings")} className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${tab === "settings" ? "bg-orange-50 text-[#CC3D00]" : "text-muted-foreground hover:bg-muted"}`}>
            <SettingsIcon className="h-4 w-4" /> <T k="admin.appSettings" />
          </button>
          <button onClick={() => setTab("subjects")} className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${tab === "subjects" ? "bg-orange-50 text-[#CC3D00]" : "text-muted-foreground hover:bg-muted"}`}>
            <BookOpen className="h-4 w-4" /> <T k="admin.subjects" />
          </button>
          <button onClick={() => setTab("timetable")} className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${tab === "timetable" ? "bg-orange-50 text-[#CC3D00]" : "text-muted-foreground hover:bg-muted"}`}>
            <CalendarClock className="h-4 w-4" /> <T k="admin.timetable" />
          </button>
        </div>

        {err && <p className="mb-3 rounded-lg bg-orange-50 px-3 py-2 text-xs text-[#CC3D00]">{err}</p>}
        {msg && <p className="mb-3 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700"><Check className="h-3.5 w-3.5" />{msg}</p>}

        {tab === "subjects" && <SubjectManager />}
        {tab === "timetable" && <TimetableManager />}

        {tab === "settings" && (
          <form onSubmit={saveSettings} className="space-y-5 rounded-2xl border border-border bg-background p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => logoRef.current?.click()} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/40 transition hover:border-[#FF8047]">
                {logoUrl ? <UIImage src={logoUrl} alt="logo" className="h-full w-full object-cover" fittingType="fit" /> : <ImageIcon className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />}
                {uploadingLogo && <div className="absolute inset-0 flex items-center justify-center bg-white/70"><Loader2 className="h-5 w-5 animate-spin text-[#FF4D00]" /></div>}
              </button>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">App logo</p>
                <p className="text-[11px] text-muted-foreground">Square image. Leave empty to use the monogram.</p>
                <input ref={logoRef} type="file" accept="image/*" hidden onChange={uploadLogo} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">App name</label>
              <input value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="Sira Chat" className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm outline-none focus:border-[#FF8047] focus:bg-background focus:ring-2 focus:ring-orange-100" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tagline</label>
              <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Chat together" className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm outline-none focus:border-[#FF8047] focus:bg-background focus:ring-2 focus:ring-orange-100" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Agora App ID (calls)</label>
              <input value={agoraAppId} onChange={(e) => setAgoraAppId(e.target.value)} placeholder="e.g. 2a1b3c4d5e6f7g8h9i0j" className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm outline-none focus:border-[#FF8047] focus:bg-background focus:ring-2 focus:ring-orange-100" />
              <p className="mt-1 text-[11px] text-muted-foreground">From the Agora console. Use a project with App ID-only authentication (no certificate) for now.</p>
            </div>

            <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-orange-500 to-[#FF6B2C] py-2.5 text-sm font-medium text-white shadow-lg shadow-[#FF4D00]/30 transition hover:opacity-90 disabled:opacity-50">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} <T k="admin.saveSettings" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}