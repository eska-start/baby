"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, provider } from "@/lib/firebase";

export type AuthUser = { id: string; email: string; name: string };

type AuthCtx = {
  user: AuthUser | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  isLoading: true,
  loginWithGoogle: async () => ({ ok: false }),
  logout: async () => {},
});

function mapFirebaseUser(u: User): AuthUser {
  return { id: u.uid, email: u.email ?? "", name: u.displayName ?? "보호자" };
}

async function upsertUser(user: AuthUser) {
  const ref = doc(db, "users", user.id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.id,
      email: user.email,
      name: user.name,
      createdAt: serverTimestamp(),
    });
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const mapped = mapFirebaseUser(firebaseUser);
      setUser(mapped);
      await upsertUser(mapped);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const mapped = mapFirebaseUser(result.user);
      await upsertUser(mapped);
      setUser(mapped);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, isLoading, loginWithGoogle, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
