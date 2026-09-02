import React, { useState } from "react";
import { useLocalAuth } from "@/lib/localAuth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User as UserIcon, Lock, Loader2, LogIn, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo, UserAvatar } from "@/components/sira";
import LangThemeSwitcher from "@/components/LangThemeSwitcher";

export default function Login() {
  const { login, users } = useLocalAuth();
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = login(username, password);
    setLoading(false);
    if (res.ok) navigate("/");
    else setError(res.error);
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background px-4 py-6">
      {/* Ambient brand glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 ltr:-right-16 rtl:-left-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 ltr:-left-16 rtl:-right-16 h-64 w-64 rounded-full bg-study/20 blur-3xl" />
      </div>

      {/* Language / theme — top corner, available before sign-in */}
      <div className="absolute top-4 z-20 ltr:right-4 rtl:left-4">
        <LangThemeSwitcher />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, type: "spring", stiffness: 120, damping: 18 }}
          className="rounded-3xl border border-border bg-card/90 p-6 shadow-float backdrop-blur-xl"
        >
          {/* Logo replaces the wordmark */}
          <div className="mb-6 text-center">
            <motion.div
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto mb-4 inline-flex rounded-[26px] shadow-float"
            >
              <Logo className="h-20 w-20" />
            </motion.div>
            <h1 className="font-heading text-xl font-extrabold tracking-tight text-foreground">
              {t("auth.welcome")}
            </h1>
            <p className="mt-1.5 text-[13px] text-muted-foreground">{t("auth.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-[13px] font-semibold text-foreground">
                {t("auth.username")}
              </Label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground ltr:left-3.5 rtl:right-3.5" />
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  placeholder="mohammed"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 rounded-xl border-input bg-background text-foreground transition-all focus-visible:ring-2 focus-visible:ring-ring ltr:pl-11 rtl:pr-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[13px] font-semibold text-foreground">
                {t("auth.password")}
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground ltr:left-3.5 rtl:right-3.5" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-input bg-background text-foreground transition-all focus-visible:ring-2 focus-visible:ring-ring ltr:pl-11 rtl:pr-11"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-danger/25 bg-danger/10 p-3 text-[13px] font-medium text-danger"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="press h-12 w-full gap-2 rounded-xl bg-primary text-[15px] font-bold text-primary-foreground shadow-accent transition-all hover:bg-primary-strong disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t("auth.signingIn")}
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  {t("common.signIn")}
                </>
              )}
            </Button>
          </form>

          {/* Available users — quick fill */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-5 rounded-2xl border border-border bg-muted/40 p-3.5"
          >
            <p className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-primary" />
              {t("auth.available")}
            </p>
            <div className="space-y-1.5">
              {users.map((u, index) => (
                <motion.button
                  key={u.username}
                  type="button"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.08 }}
                  onClick={() => setUsername(u.username)}
                  className="press group flex w-full items-center gap-3 rounded-xl border border-transparent bg-card p-2.5 text-start shadow-sm transition-all hover:border-primary/30"
                >
                  <UserAvatar name={u.name || u.username} src={u.profile_image} size="md" status="online" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold capitalize text-foreground">
                      {u.name || u.username}
                    </div>
                    <div className="text-xs text-muted-foreground">{t("auth.tapToFill")}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:text-primary ltr:group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
