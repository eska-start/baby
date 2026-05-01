"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { loginWithEmail, loginWithGoogleIdToken, refreshIdToken, saveUserProfile, signUpWithEmail } from "@/lib/firebase-client";

export type AuthUser = { id: string; email: string; name: string };

type AuthCtx = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithGoogle: (googleIdToken: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

type SessionData = { user: AuthUser; refreshToken: string };
const SESSION_KEY = "ak-session";

const Ctx = createContext<AuthCtx>({
  user: null,
  isLoading: true,
  login: async () => ({ ok: false }),
  signup: async () => ({ ok: false }),
  loginWithGoogle: async () => ({ ok: false }),
  logout: () => {},
});

const mapError = (code: string) => {
  if (code.includes("EMAIL_EXISTS")) return "이미 가입된 이메일이에요.";
  if (code.includes("INVALID_LOGIN_CREDENTIALS")) return "이메일 또는 비밀번호가 올바르지 않아요.";
  if (code.includes("WEAK_PASSWORD")) return "비밀번호는 6자 이상이어야 해요.";
  return "인증 처리 중 오류가 발생했어요.";
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw) as SessionData;
        await refreshIdToken(saved.refreshToken);
        setUser(saved.user);
      } catch {
        localStorage.removeItem(SESSION_KEY);
      } finally {
        setIsLoading(false);
      }
    };
    void restore();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await loginWithEmail(email, password);
      const nextUser = { id: data.localId, email: data.email, name: data.displayName ?? email.split("@")[0] };
      setUser(nextUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user: nextUser, refreshToken: data.refreshToken }));
      await saveUserProfile(nextUser.id, data.idToken, { email: nextUser.email, name: nextUser.name });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: mapError((e as Error).message) };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const data = await signUpWithEmail(email, password, name);
      const nextUser = { id: data.localId, email: data.email, name };
      setUser(nextUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user: nextUser, refreshToken: data.refreshToken }));
      await saveUserProfile(nextUser.id, data.idToken, { email, name });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: mapError((e as Error).message) };
    }
  };

  const loginWithGoogle = async (googleIdToken: string) => {
    try {
      const data = await loginWithGoogleIdToken(googleIdToken);
      const nextUser = {
        id: data.localId,
        email: data.email,
        name: data.displayName ?? data.email.split("@")[0],
      };
      setUser(nextUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user: nextUser, refreshToken: data.refreshToken }));
      await saveUserProfile(nextUser.id, data.idToken, { email: nextUser.email, name: nextUser.name });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: mapError((e as Error).message) };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return <Ctx.Provider value={{ user, isLoading, login, signup, loginWithGoogle, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
