import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useLocalAuth } from "@/lib/localAuth";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/sira";
import { Shield, Lock } from "lucide-react";

export default function AdminGate() {
  const { adminUser, adminLogin } = useLocalAuth();
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (adminUser) return <Outlet />;

  const submit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = adminLogin(username.trim().toLowerCase(), password);
    setLoading(false);
    if (!res.ok) setError(res.error);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-7 shadow-float animate-fade-up">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-accent">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="font-heading text-xl font-bold tracking-tight text-foreground">{t("auth.adminPanel")}</h1>
          <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" /> {t("auth.restricted")}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-user" className="text-sm font-medium text-foreground">{t("auth.username")}</Label>
            <Input
              id="admin-user"
              type="text"
              autoFocus
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-pass" className="text-sm font-medium text-foreground">{t("auth.password")}</Label>
            <Input
              id="admin-pass"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
              required
            />
          </div>
          {error && <div className="rounded-xl border border-danger/25 bg-danger/10 p-3 text-sm font-medium text-danger">{error}</div>}
          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            {t("common.signIn")}
          </Button>
        </form>
      </div>
    </div>
  );
}
