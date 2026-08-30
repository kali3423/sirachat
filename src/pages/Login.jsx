import React, { useState } from "react";
import { useLocalAuth } from "@/lib/localAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User as UserIcon, Lock, Loader2, LogIn, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const { login, users } = useLocalAuth();
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4 dark:from-gray-900 dark:via-gray-900 dark:to-amber-950">
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          whileHover={{ y: -5 }}
          className="rounded-3xl border border-orange-100/50 bg-white/90 p-8 shadow-2xl backdrop-blur-xl dark:border-amber-900/30 dark:bg-gray-900/90 dark:shadow-[#FF4D00]/10"
        >
          <div className="mb-8 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center"
            >
              <img src="/logo.png" alt="Sira Chat" className="h-16 w-16" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Sign in to continue your learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Username
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#FF8047]" />
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  placeholder="mohammed"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 rounded-xl border-orange-100 bg-gradient-to-br from-gray-50 to-white pl-12 text-gray-900 transition-all focus:border-[#FF8047] focus:ring-4 focus:ring-orange-100 dark:border-amber-900/30 dark:from-gray-800 dark:to-gray-800 dark:text-gray-100"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#FF8047]" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-orange-100 bg-gradient-to-br from-gray-50 to-white pl-12 text-gray-900 transition-all focus:border-[#FF8047] focus:ring-4 focus:ring-orange-100 dark:border-amber-900/30 dark:from-gray-800 dark:to-gray-800 dark:text-gray-100"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-gradient-to-r from-orange-50 to-orange-100 p-4 text-sm font-medium text-[#FF4D00] dark:from-amber-950/50 dark:to-amber-900/50"
              >
                {error}
              </motion.div>
            )}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-gradient-to-r from-orange-500 to-[#FF6B2C] text-base font-bold text-white shadow-lg shadow-[#FF4D00]/50 transition-all hover:shadow-xl hover:shadow-[#FF4D00]/60 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Available Users */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/50 to-orange-100/50 p-5 backdrop-blur-xl dark:border-amber-900/30 dark:from-amber-950/30 dark:to-amber-900/30"
          >
            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100">
              <Users className="h-4 w-4 text-[#FF4D00] dark:text-[#FF8047]" />
              Available Users
            </p>
            <div className="space-y-2">
              {users.map((u, index) => (
                <motion.button
                  key={u.username}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, x: 5 }}
                  onClick={() => setUsername(u.username)}
                  className="flex w-full items-center gap-3 rounded-xl bg-white/80 p-3 text-left transition-all hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-[#FF6B2C] text-sm font-bold text-white shadow-lg">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{u.username}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Click to use</div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
