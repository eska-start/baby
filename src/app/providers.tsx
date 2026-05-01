"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  deleteDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./auth-provider";
import { GrowthRecord, Vaccine, VACCINES } from "@/lib/data";

export type ChildProfile = {
  id: string;
  name: string;
  birth: string;
  gender: "여" | "남";
};

type Ctx = {
  records: GrowthRecord[];
  addRecord: (r: GrowthRecord) => void;
  deleteRecord: (date: string) => void;
  updateRecord: (date: string, updated: GrowthRecord) => void;

  children: ChildProfile[];
  activeChild: ChildProfile | null;
  setActiveChild: (id: string) => void;
  addChild: (profile: Omit<ChildProfile, "id">) => void;
  updateChild: (id: string, updates: Omit<ChildProfile, "id">) => void;
  deleteChild: (id: string) => void;

  vaccines: Vaccine[];
  completeVaccine: (name: string, round?: string) => void;
  postponeVaccine: (name: string, round: string | undefined, days: number) => void;
};

const AppCtx = createContext<Ctx>({
  records: [],
  addRecord: () => {},
  deleteRecord: () => {},
  updateRecord: () => {},
  children: [],
  activeChild: null,
  setActiveChild: () => {},
  addChild: () => {},
  updateChild: () => {},
  deleteChild: () => {},
  vaccines: [],
  completeVaccine: () => {},
  postponeVaccine: () => {},
});

const ACTIVE_KEY = "ai-gyeol-active";

function shiftDate(s: string, days: number): string {
  const d = new Date(s);
  d.setDate(d.getDate() + days);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function RecordsProvider({ children: rc }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [list, setList] = useState<ChildProfile[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);

  // Subscribe to children collection for this user
  useEffect(() => {
    if (!user) {
      setList([]);
      setRecords([]);
      setVaccines([]);
      setActiveIdState(null);
      return;
    }

    const q = query(collection(db, "children"), where("userId", "==", user.id));
    const unsub = onSnapshot(q, (snap) => {
      const children: ChildProfile[] = snap.docs.map((d) => ({
        id: d.id,
        name: d.data().name as string,
        birth: d.data().birth as string,
        gender: d.data().gender as "여" | "남",
      }));
      setList(children);

      setActiveIdState((cur) => {
        if (cur && children.find((c) => c.id === cur)) return cur;
        const saved = localStorage.getItem(ACTIVE_KEY);
        if (saved && children.find((c) => c.id === saved)) return saved;
        return children[0]?.id ?? null;
      });
    });

    return () => unsub();
  }, [user]);

  // Subscribe to records for active child
  useEffect(() => {
    if (!activeId) {
      setRecords([]);
      return;
    }

    const q = query(
      collection(db, "children", activeId, "records"),
      orderBy("date", "asc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setRecords(
        snap.docs.map((d) => ({
          date: d.data().date as string,
          height: d.data().height as number,
          weight: d.data().weight as number,
          note: d.data().note as string | undefined,
        })),
      );
    });

    return () => unsub();
  }, [activeId]);

  // Subscribe to vaccines for active child
  useEffect(() => {
    if (!activeId) {
      setVaccines([]);
      return;
    }

    const unsub = onSnapshot(doc(db, "children", activeId, "meta", "vaccines"), (snap) => {
      if (snap.exists()) {
        setVaccines(snap.data().list as Vaccine[]);
      } else {
        setVaccines(VACCINES);
      }
    });

    return () => unsub();
  }, [activeId]);

  const activeChild = (activeId ? list.find((c) => c.id === activeId) : null) ?? list[0] ?? null;

  const setActiveChild = (id: string) => {
    setActiveIdState(id);
    localStorage.setItem(ACTIVE_KEY, id);
  };

  const addRecord = (r: GrowthRecord) => {
    if (!activeId) return;
    void setDoc(doc(db, "children", activeId, "records", r.date), {
      date: r.date,
      height: r.height,
      weight: r.weight,
      note: r.note ?? null,
      createdAt: serverTimestamp(),
    });
  };

  const deleteRecord = (date: string) => {
    if (!activeId) return;
    void deleteDoc(doc(db, "children", activeId, "records", date));
  };

  const updateRecord = (date: string, updated: GrowthRecord) => {
    if (!activeId) return;
    if (date !== updated.date) {
      void deleteDoc(doc(db, "children", activeId, "records", date));
    }
    void setDoc(doc(db, "children", activeId, "records", updated.date), {
      date: updated.date,
      height: updated.height,
      weight: updated.weight,
      note: updated.note ?? null,
      createdAt: serverTimestamp(),
    });
  };

  const addChild = (profile: Omit<ChildProfile, "id">) => {
    if (!user) return;
    const ref = doc(collection(db, "children"));
    void setDoc(ref, {
      userId: user.id,
      name: profile.name,
      birth: profile.birth,
      gender: profile.gender,
      createdAt: serverTimestamp(),
    });
    void setDoc(doc(db, "children", ref.id, "meta", "vaccines"), { list: VACCINES });
    if (!activeId) {
      setActiveIdState(ref.id);
      localStorage.setItem(ACTIVE_KEY, ref.id);
    }
  };

  const updateChild = (id: string, updates: Omit<ChildProfile, "id">) => {
    void setDoc(
      doc(db, "children", id),
      { name: updates.name, birth: updates.birth, gender: updates.gender },
      { merge: true },
    );
  };

  const deleteChild = (id: string) => {
    if (list.length <= 1) return;
    void deleteDoc(doc(db, "children", id));
    if (activeId === id) {
      const next = list.find((c) => c.id !== id);
      if (next) {
        setActiveIdState(next.id);
        localStorage.setItem(ACTIVE_KEY, next.id);
      }
    }
  };

  const saveVaccines = (vacs: Vaccine[]) => {
    if (!activeId) return;
    void setDoc(doc(db, "children", activeId, "meta", "vaccines"), { list: vacs });
  };

  const completeVaccine = (name: string, round?: string) => {
    const updated = vaccines.map((v) =>
      v.name === name && v.round === round ? { ...v, status: "done" as const } : v,
    );
    setVaccines(updated);
    saveVaccines(updated);
  };

  const postponeVaccine = (name: string, round: string | undefined, days: number) => {
    const updated = vaccines.map((v) =>
      v.name === name && v.round === round ? { ...v, dueDate: shiftDate(v.dueDate, days) } : v,
    );
    setVaccines(updated);
    saveVaccines(updated);
  };

  return (
    <AppCtx.Provider
      value={{
        records,
        addRecord,
        deleteRecord,
        updateRecord,
        children: list,
        activeChild,
        setActiveChild,
        addChild,
        updateChild,
        deleteChild,
        vaccines,
        completeVaccine,
        postponeVaccine,
      }}
    >
      {rc}
    </AppCtx.Provider>
  );
}

export const useRecords = () => useContext(AppCtx);
