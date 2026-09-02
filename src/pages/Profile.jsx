import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useLocalAuth } from "@/lib/localAuth";
import { useI18n } from "@/lib/i18n";
import { PageShell, PageHeader, UserAvatar, ProgressRing, Chip, Button } from "@/components/sira";
import { SkeletonCard } from "@/components/sira/Skeleton";
import LangThemeSwitcher from "@/components/LangThemeSwitcher";
import { cn } from "@/lib/utils";
import {
  User as UserIcon, Camera, Loader2, Check, Pencil, LogOut, ShieldCheck,
  CheckCircle2, Clock, TrendingUp, Flame, Trophy, Sparkles, ChevronRight, X,
} from "lucide-react";

const STARTING = 500, LEGEND = 1000;

function levelFor(points) {
  if (points >= LEGEND) return { key: "legend", tone: "study" };
  if (points >= 800) return { key: "achiever", tone: "focus" };
  if (points >= STARTING) return { key: "studious", tone: "primary" };
  return { key: "beginner", tone: "neutral" };
}

export default function Profile() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user: localUser, logout: doLogout } = useLocalAuth();

  const [me, setMe] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const fileRef = useRef(null);

  const hydrate = (u) => {
    setDisplayName(u?.display_name || u?.full_name || localUser?.name || "");
    setBio(u?.bio || "");
    setProfileImage(u?.profile_image || localUser?.profile_image || "");
  };

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const u = await base44.auth.me().catch(() => null);
      if (!alive) return;
      setMe(u);
      hydrate(u);
      let hh = [];
      if (u) hh = await base44.entities.StudyHistory.filter({ user_id: u.id }, "-created_date", 300).catch(() => []);
      if (!alive) return;
      setHistory(Array.isArray(hh) ? hh : []);
      setLoading(false);
    };
    load();
    const u1 = base44.entities.StudyHistory.subscribe(() => load());
    const u2 = base44.entities.User.subscribe(() => base44.auth.me().then((u) => { setMe(u); }).catch(() => {}));
    return () => { alive = false; u1 && u1(); u2 && u2(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const points = me?.points ?? STARTING;
  const level = levelFor(points);
  const levelName = t(`profile.levels.${level.key}`);
  const progress = Math.min(100, (points / LEGEND) * 100);

  const stats = useMemo(() => {
    const completed = history.filter((h) => h.action === "completed");
    const totalMin = completed.reduce((a, h) => a + (h.duration_min || 0), 0);
    const earned = history.filter((h) => h.points_change > 0).reduce((a, h) => a + h.points_change, 0);
    const bySubject = {};
    completed.forEach((h) => { if (h.subject) bySubject[h.subject] = (bySubject[h.subject] || 0) + (h.duration_min || 0); });
    const top = Object.entries(bySubject).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return {
      sessions: completed.length,
      studyTime: `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`,
      earned,
      subjects: top,
    };
  }, [history]);

  const name = displayName || me?.full_name || localUser?.name || t("common.you");
  const username = localUser?.username || me?.email || "you";

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setErr(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setProfileImage(file_url);
    } catch {
      setErr(t("profile.imgError"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(null); setMsg(null);
    try {
      await base44.auth.updateMe({
        display_name: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        profile_image: profileImage || undefined,
      });
      const u = await base44.auth.me();
      setMe(u); hydrate(u);
      setMsg(t("profile.updated"));
      setEditing(false);
    } catch {
      setErr(t("common.genericError"));
    } finally {
      setBusy(false);
    }
  };

  const cancelEdit = () => {
    hydrate(me);
    setErr(null); setMsg(null);
    setEditing(false);
  };

  const logout = () => { doLogout(); navigate("/login"); };

  return (
    <PageShell width="md">
      <PageHeader
        title={t("nav.profile")}
        actions={<LangThemeSwitcher />}
      />

      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Identity card */}
          <section className="animate-fade-up overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
            <div className="relative h-28 bg-sira">
              <div className="absolute inset-0 opacity-25 [background:radial-gradient(circle_at_18%_25%,white,transparent_45%)]" />
              <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:22px_22px]" />
            </div>
            <div className="px-5 pb-5">
              <div className="-mt-11 flex items-end justify-between">
                <div className="relative">
                  <UserAvatar name={name} src={profileImage} size="2xl" ring status="online" />
                  {editing && (
                    <>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-accent transition press hover:bg-primary-strong"
                        title={t("profile.changePhoto")}
                      >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadImage} />
                    </>
                  )}
                </div>
                {!editing && (
                  <Button variant="outline" size="sm" shape="pill" icon={Pencil} onClick={() => setEditing(true)} className="mb-1">
                    {t("profile.edit")}
                  </Button>
                )}
              </div>

              <div className="mt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading text-xl font-extrabold tracking-tight text-foreground">{name}</h2>
                  <Chip tone={level.tone} icon={level.key === "legend" ? Trophy : Sparkles}>{levelName}</Chip>
                </div>
                <p className="text-sm text-muted-foreground" dir="ltr">@{username}</p>
                {bio && !editing && <p className="mt-2 text-sm text-foreground/80">{bio}</p>}
              </div>

              {/* Points + progress */}
              <div className="mt-4 flex items-center gap-4 rounded-2xl bg-muted/50 p-4">
                <ProgressRing value={progress} size={68} stroke={7} barClassName="text-primary">
                  <div className="text-center">
                    <p className="text-sm font-extrabold leading-none text-foreground tabnums">{points}</p>
                    <p className="text-[9px] font-medium text-muted-foreground">{t("profile.pts")}</p>
                  </div>
                </ProgressRing>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{t("profile.progressToLegend")}</span>
                    <span className="text-muted-foreground tabnums" dir="ltr">{points}/{LEGEND}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-sira transition-all duration-700" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {points >= LEGEND ? t("profile.topTier") : t("profile.ptsToNext", { n: LEGEND - points })}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Edit form */}
          {editing && (
            <form onSubmit={save} className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm animate-fade-up">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-sm font-bold text-foreground">{t("profile.editProfile")}</h3>
                <button type="button" onClick={cancelEdit} title={t("common.close")} className="rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("profile.displayName")}</label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3" />
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t("profile.displayNamePh")}
                    className="w-full rounded-xl border border-border bg-muted/40 py-2.5 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/15 ltr:pl-9 ltr:pr-3 rtl:pr-9 rtl:pl-3"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("profile.bio")}</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder={t("profile.bioPh")}
                  className="w-full resize-none rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/15"
                />
              </div>
              {err && <p className="rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger">{err}</p>}
              <div className="flex gap-2">
                <Button type="button" variant="outline" fullWidth onClick={cancelEdit}>{t("common.cancel")}</Button>
                <Button type="submit" variant="gradient" fullWidth loading={busy} disabled={uploading} icon={Check}>{t("common.save")}</Button>
              </div>
            </form>
          )}

          {msg && !editing && (
            <p className="flex items-center gap-1.5 rounded-xl bg-success/10 px-3.5 py-2.5 text-xs font-medium text-success animate-fade-up">
              <Check className="h-3.5 w-3.5" />{msg}
            </p>
          )}

          {/* Study stats */}
          <section>
            <h3 className="mb-2.5 px-1 font-heading text-sm font-bold text-foreground">{t("profile.studyStats")}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard icon={CheckCircle2} tone="completed" label={t("profile.sessions")} value={stats.sessions} />
              <StatCard icon={Clock} tone="study" label={t("profile.studyTime")} value={stats.studyTime} />
              <StatCard icon={TrendingUp} tone="success" label={t("profile.pointsEarned")} value={`+${stats.earned}`} />
            </div>
          </section>

          {/* Top subjects */}
          {stats.subjects.length > 0 && (
            <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
                <Flame className="h-4 w-4 text-primary" /> {t("profile.topSubjects")}
              </h3>
              <div className="space-y-3">
                {stats.subjects.map(([sub, min], i) => {
                  const max = stats.subjects[0][1] || 1;
                  return (
                    <div key={sub}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="font-medium text-foreground">{i + 1}. {sub}</span>
                        <span className="text-muted-foreground tabnums">{min} {t("profile.min")}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary/80 transition-all duration-700" style={{ width: `${(min / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Account actions */}
          <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <RowLink icon={ShieldCheck} label={t("admin.title")} onClick={() => navigate("/admin")} />
            <div className="border-t border-border" />
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 px-5 py-4 text-start text-sm font-semibold text-danger transition hover:bg-danger/5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger/10">
                <LogOut className="h-[18px] w-[18px]" />
              </span>
              {t("nav.signOut")}
            </button>
          </section>
        </div>
      )}
    </PageShell>
  );
}

const TONE_BG = {
  completed: "bg-completed/12 text-completed",
  study: "bg-study/15 text-study-foreground dark:text-study",
  success: "bg-success/12 text-success",
  primary: "bg-primary-soft text-primary",
};

function StatCard({ icon: Icon, tone, label, value }) {
  return (
    <div className="hover-lift cursor-default rounded-2xl border border-border bg-card p-4 shadow-sm">
      <span className={cn("mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl", TONE_BG[tone])}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <p className="font-heading text-xl font-extrabold tracking-tight text-foreground tabnums">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function RowLink({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-5 py-4 text-start text-sm font-semibold text-foreground transition hover:bg-muted/60">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="flex-1">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground/50 rtl:rotate-180" />
    </button>
  );
}
