import React, { createContext, useContext, useState, useCallback } from "react";

// Two fixed accounts for this private study app. No email, no invites, no OTP.
export const USERS = [
  { username: "mohammed", password: "mohammedlm9awed2468", name: "Mohammed", profile_image: "https://i.postimg.cc/Bnqb2kcs/Black-and-White-Simple-man-Modeling-Facebook-Profile-Picture-(9).png" },
  { username: "rachid", password: "rachidlmhayeb9320", name: "Rachid", profile_image: "https://i.postimg.cc/Y2zwQ9Xz/Black-and-White-Simple-man-Modeling-Facebook-Profile-Picture-(4).png" },
];

const STORAGE_KEY = "sira_user";
const ADMIN_KEY = "sira_admin";
const LocalAuthContext = createContext(null);

export function LocalAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      return null;
    }
  });

  const login = useCallback((username, password) => {
    const u = USERS.find(
      (x) =>
        x.username === (username || "").trim().toLowerCase() &&
        x.password === password
    );
    if (!u) return { ok: false, error: "Invalid username or password" };
    const session = { username: u.username, name: u.name, profile_image: u.profile_image };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_KEY) || "null");
    } catch {
      return null;
    }
  });

  const adminLogin = useCallback((username, password) => {
    if (username === "admin" && password === "douae") {
      const session = { username: "admin", name: "Admin" };
      localStorage.setItem(ADMIN_KEY, JSON.stringify(session));
      setAdminUser(session);
      return { ok: true };
    }
    return { ok: false, error: "Invalid admin credentials" };
  }, []);

  const adminLogout = useCallback(() => {
    localStorage.removeItem(ADMIN_KEY);
    setAdminUser(null);
  }, []);

  return (
    <LocalAuthContext.Provider value={{ user, login, logout, users: USERS, adminUser, adminLogin, adminLogout }}>
      {children}
    </LocalAuthContext.Provider>
  );
}

export function useLocalAuth() {
  const ctx = useContext(LocalAuthContext);
  if (!ctx) throw new Error("useLocalAuth must be used inside LocalAuthProvider");
  return ctx;
}