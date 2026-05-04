"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, provider } from "@/lib/firebase";

export type AuthUser = { id: string; email: string; name: string };

type AuthResult = { ok: boolean; error?: string };

type AuthCtx = {
  user: AuthUser | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<AuthResult>;
  loginWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signupWithEmail: (email: string, password: string, name?: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  isLoading: true,
  loginWithGoogle: async () => ({ ok: false }),
  loginWithEmail: async () => ({ ok: false }),
  signupWithEmail: async () => ({ ok: false }),
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
    let ignore = false;

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        if (!ignore) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      const mapped = mapFirebaseUser(firebaseUser);
      if (!ignore) setUser(mapped);

      try {
        await upsertUser(mapped);
      } catch (error) {
        console.error("Failed to save user profile", error);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    });

    return () => {
      ignore = true;
      unsub();
    };
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

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const mapped = mapFirebaseUser(result.user);
      await upsertUser(mapped);
      setUser(mapped);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  };

  const signupWithEmail = async (email: string, password: string, name?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (name?.trim()) await updateProfile(result.user, { displayName: name.trim() });
      const mapped: AuthUser = {
        id: result.user.uid,
        email: result.user.email ?? email,
        name: name?.trim() || result.user.displayName || "보호자",
      };
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

  return <Ctx.Provider value={{ user, isLoading, loginWithGoogle, loginWithEmail, signupWithEmail, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
