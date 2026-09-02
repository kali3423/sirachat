import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useLocalAuth } from "@/lib/localAuth";
import { useI18n } from "@/lib/i18n";
import { Image as UIImage } from "@/components/ui/image";
import { Shield, Loader2, Settings as SettingsIcon, Image as ImageIcon, Check, Save, BookOpen, LogOut, CalendarClock } from "lucide-react";
import SubjectManager from "@/components/admin/SubjectManager";
import TimetableManager from "@/components/admin/TimetableManager";
import { PageHeader, Button } from "@/components/sira";
import T from "@/components/T";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "settings", labelKey: "admin.appSettings", icon: SettingsIcon },
  { key: "subjects", labelKey: "admin.subjects", icon: BookOpen },
  { key: "timetable", labelKey: "admin.timetable", icon: CalendarClock },
];

export default function Admin() {
  const { adminLogout } = useLocalAuth();
  const { t } = useI18n();
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
      setErr(t("admin.logoError"));
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
      setMsg(t("admin.savedOk"));
      await load();
    } catch (e2) {
      setErr(t("admin.saveError"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  const inputCls = "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <PageHeader
          icon={Shield}
          title={<T k="admin.title" />}
          subtitle={<T k="admin.sub" />}
          actions={
            <Button variant="outline" size="sm" icon={LogOut} onClick={adminLogout} className="text-muted-foreground hover:border-danger/40 hover:bg-danger/10 hover:text-danger">
              <T k="nav.signOut" />
            </Button>
          }
        />

        <div className="mb-5 flex gap-1 rounded-2xl border border-border bg-card p-1 shadow-sm">
          {TABS.map((tb) => {
            const Icon = tb.icon;
            const activeTab = tab === tb.key;
            return (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition press",
                  activeTab ? "bg-primary-soft text-primary shadow-sm" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" /> <span className="hidden sm:inline"><T k={tb.labelKey} /></span>
              </button>
            );
          })}
        </div>

        {err && <p className="mb-3 rounded-xl border border-danger/25 bg-danger/10 px-3 py-2 text-xs font-medium text-danger">{err}</p>}
        {msg && <p className="mb-3 flex items-center gap-1.5 rounded-xl border border-success/25 bg-success/10 px-3 py-2 text-xs font-medium text-success"><Check className="h-3.5 w-3.5" />{msg}</p>}

        {tab === "subjects" && <SubjectManager />}
        {tab === "timetable" && <TimetableManager />}

        {tab === "settings" && (
          <form onSubmit={saveSettings} className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => logoRef.current?.click()} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/40 transition hover:border-primary/50 press">
                {logoUrl ? <UIImage src={logoUrl} alt="logo" className="h-full w-full object-cover" fittingType="fit" /> : <ImageIcon className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />}
                {uploadingLogo && <div className="absolute inset-0 flex items-center justify-center bg-background/70"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
              </button>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{t("admin.appLogo")}</p>
                <p className="text-[11px] text-muted-foreground">{t("admin.appLogoHint")}</p>
                <input ref={logoRef} type="file" accept="image/*" hidden onChange={uploadLogo} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("admin.appName")}</label>
              <input value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="Sira Chat" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("admin.tagline")}</label>
              <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Chat together" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("admin.agora")}</label>
              <input value={agoraAppId} onChange={(e) => setAgoraAppId(e.target.value)} placeholder="e.g. 2a1b3c4d5e6f7g8h9i0j" className={cn(inputCls, "tabnums")} dir="ltr" />
              <p className="mt-1 text-[11px] text-muted-foreground">{t("admin.agoraHint")}</p>
            </div>

            <Button type="submit" variant="primary" fullWidth loading={busy} icon={Save}>
              <T k="admin.saveSettings" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
