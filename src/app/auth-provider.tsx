"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type AuthUser = { id: string; email: string; name: string };

type AuthCtx = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  signup: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
};

type StoredUser = AuthUser & { password: string };

const USERS_KEY = "ak-users";
const SESSION_KEY = "ak-session";

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const Ctx = createContext<AuthCtx>({
  user: null,
  isLoading: true,
  login: () => ({ ok: false }),
  signup: () => ({ ok: false }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const s = localStorage.getItem(SESSION_KEY);
      if (s) setUser(JSON.parse(s));
    } catch {}
    setIsLoading(false);
  }, []);

  const getUsers = (): StoredUser[] => {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]"); } catch { return []; }
  };

  const login = (email: string, password: string): { ok: boolean; error?: string } => {
    const found = getUsers().find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return { ok: false, error: "이메일 또는 비밀번호가 올바르지 않아요." };
    const u: AuthUser = { id: found.id, email: found.email, name: found.name };
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    return { ok: true };
  };

  const signup = (name: string, email: string, password: string): { ok: boolean; error?: string } => {
    const users = getUsers();
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase()))
      return { ok: false, error: "이미 사용 중인 이메일이에요." };
    const newUser: StoredUser = { id: genId(), email, name, password };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    const u: AuthUser = { id: newUser.id, email: newUser.email, name: newUser.name };
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return <Ctx.Provider value={{ user, isLoading, login, signup, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
