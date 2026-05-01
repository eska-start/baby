"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  getRedirectResult,
  onAuthStateChanged,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
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
    void getRedirectResult(auth)
      .then(async (result) => {
        if (!result?.user) return;
        const mapped = mapFirebaseUser(result.user);
        await upsertUser(mapped);
        setUser(mapped);
      })
      .catch((error) => {
        console.error("Google redirect login failed", error);
      });

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const mapped = mapFirebaseUser(firebaseUser);
      setUser(mapped);

      try {
        await upsertUser(mapped);
      } catch (error) {
        console.error("Failed to save user profile", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithRedirect(auth, provider);
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
