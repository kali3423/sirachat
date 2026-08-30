import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image as UIImage } from "@/components/ui/image";
import { User as UserIcon, Camera, Save, Loader2, Check } from "lucide-react";
import T from "@/components/T";

export default function Settings() {
  const [me, setMe] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setMe(u);
      setDisplayName(u?.display_name || u?.full_name || "");
      setBio(u?.bio || "");
      setProfileImage(u?.profile_image || "");
    }).catch(() => setErr("Could not load your profile."));
  }, []);

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setProfileImage(file_url);
    } catch {
      setErr("Image upload failed.");
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
      setMsg("Profile updated.");
      const u = await base44.auth.me();
      setMe(u);
    } catch (e2) {
      setErr(e2?.message || "Could not save your profile.");
    } finally {
      setBusy(false);
    }
  };

  if (!me) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-orange-200 border-t-amber-600" />
      </div>
    );
  }

  const initial = (displayName || me.email || "U").charAt(0).toUpperCase();

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-50 to-orange-50/20 dark:bg-none dark:bg-background">
      <div className="mx-auto max-w-xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground"><T k="settings.title" /></h1>
          <p className="text-sm text-muted-foreground"><T k="settings.sub" /></p>
        </div>

        <form onSubmit={save} className="space-y-5 rounded-2xl border border-border bg-background p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              {profileImage ? (
                <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-md">
                  <UIImage src={profileImage} alt="profile" className="h-full w-full object-cover" fittingType="fill" />
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-[#FF6B2C] text-2xl font-semibold text-white shadow-md">
                  {initial}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-[#FF6B2C] text-white shadow transition hover:bg-amber-700"
                title="Change picture"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadImage} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{displayName || me.full_name || "You"}</p>
              <p className="truncate text-xs text-muted-foreground">{me.email}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">PNG or JPG — shown across Sira Chat</p>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Display name</label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-border bg-muted/40 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#FF8047] focus:bg-background focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="A short line about you"
              className="w-full resize-none rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm outline-none focus:border-[#FF8047] focus:bg-background focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {msg && <p className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700"><Check className="h-3.5 w-3.5" />{msg}</p>}
          {err && <p className="rounded-lg bg-orange-50 px-3 py-2 text-xs text-[#CC3D00]">{err}</p>}

          <button
            type="submit"
            disabled={busy || uploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-orange-500 to-[#FF6B2C] py-2.5 text-sm font-medium text-white shadow-lg shadow-[#FF4D00]/30 transition hover:opacity-90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <T k="settings.save" />
          </button>
        </form>
      </div>
    </div>
  );
}