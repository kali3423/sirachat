import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useLocalAuth } from "@/lib/localAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2 } from "lucide-react";

export default function AdminGate() {
  const { adminUser, adminLogin } = useLocalAuth();
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Admin Panel</h1>
          <p className="text-xs text-slate-500">Restricted area — sign in to continue</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-user" className="text-sm font-medium text-slate-700">Username</Label>
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
            <Label htmlFor="admin-pass" className="text-sm font-medium text-slate-700">Password</Label>
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
          {error && <div className="rounded-lg bg-orange-50 p-3 text-sm text-[#FF4D00]">{error}</div>}
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}