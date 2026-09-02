import React, { createContext, useContext, useMemo, useState } from "react";

/**
 * ShellContext — lets full-screen pages (e.g. an open chat conversation, the
 * drawing canvas) hide the app chrome (bottom nav / sidebar) so they can use
 * the whole viewport. Also carries lightweight, app-wide unread counts used by
 * nav badges.
 */
const ShellContext = createContext(null);

export function ShellProvider({ children }) {
  const [hideChrome, setHideChrome] = useState(false);
  const [badges, setBadges] = useState({}); // { chats: n, notifications: n }

  const value = useMemo(
    () => ({
      hideChrome,
      setHideChrome,
      badges,
      setBadge: (key, n) => setBadges((b) => (b[key] === n ? b : { ...b, [key]: n })),
    }),
    [hideChrome, badges]
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used within ShellProvider");
  return ctx;
}
