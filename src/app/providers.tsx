"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./auth-provider";
import { GrowthRecord, Vaccine, VACCINES } from "@/lib/data";

export type ChildProfile = { id: string; name: string; birth: string; gender: "여" | "남" };

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
  records: [], addRecord: () => {}, deleteRecord: () => {}, updateRecord: () => {},
  children: [], activeChild: null, setActiveChild: () => {}, addChild: () => {}, updateChild: () => {}, deleteChild: () => {},
  vaccines: [], completeVaccine: () => {}, postponeVaccine: () => {},
});

const ACTIVE_KEY = "ai-gyeol-active";

function shiftDate(s: string, days: number): string {
  const d = new Date(s);
  d.setDate(d.getDate() + days);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function mapChild(id: string, data: Record<string, unknown>): ChildProfile {
  return { id, name: data.name as string, birth: data.birth as string, gender: data.gender as "여" | "남" };
}

function mergeChildren(a: ChildProfile[], b: ChildProfile[]) {
  const map = new Map<string, ChildProfile>();
  [...a, ...b].forEach((child) => map.set(child.id, child));
  return [...map.values()];
}

export function RecordsProvider({ children: rc }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [list, setList] = useState<ChildProfile[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);

  useEffect(() => {
    if (!user) { setList([]); setRecords([]); setVaccines([]); setActiveIdState(null); return; }

    let memberChildren: ChildProfile[] = [];
    let legacyChildren: ChildProfile[] = [];

    const apply = () => {
      const children = mergeChildren(memberChildren, legacyChildren);
      setList(children);
      setActiveIdState((cur) => {
        if (cur && children.find((c) => c.id === cur)) return cur;
        const saved = localStorage.getItem(ACTIVE_KEY);
        if (saved && children.find((c) => c.id === saved)) return saved;
        return children[0]?.id ?? null;
      });
    };

    const memberQuery = query(collection(db, "children"), where("memberIds", "array-contains", user.id));
    const legacyQuery = query(collection(db, "children"), where("userId", "==", user.id));

    const unsubMember = onSnapshot(memberQuery, (snap) => {
      memberChildren = snap.docs.map((d) => mapChild(d.id, d.data()));
      apply();
    });

    const unsubLegacy = onSnapshot(legacyQuery, (snap) => {
      legacyChildren = snap.docs.map((d) => {
        const data = d.data();
        const memberIds = Array.isArray(data.memberIds) ? data.memberIds : [];
        if (!memberIds.includes(user.id)) {
          void setDoc(doc(db, "children", d.id), { ownerId: data.ownerId ?? user.id, memberIds: [user.id] }, { merge: true });
        }
        return mapChild(d.id, data);
      });
      apply();
    });

    return () => { unsubMember(); unsubLegacy(); };
  }, [user]);

  useEffect(() => {
    if (!activeId) { setRecords([]); return; }
    const q = query(collection(db, "children", activeId, "records"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setRecords(snap.docs.map((d) => ({ date: d.data().date as string, height: d.data().height as number, weight: d.data().weight as number, note: d.data().note as string | undefined })));
    });
    return () => unsub();
  }, [activeId]);

  useEffect(() => {
    if (!activeId) { setVaccines([]); return; }
    const unsub = onSnapshot(doc(db, "children", activeId, "meta", "vaccines"), (snap) => {
      setVaccines(snap.exists() ? (snap.data().list as Vaccine[]) : VACCINES);
    });
    return () => unsub();
  }, [activeId]);

  const activeChild = (activeId ? list.find((c) => c.id === activeId) : null) ?? list[0] ?? null;

  const setActiveChild = (id: string) => { setActiveIdState(id); localStorage.setItem(ACTIVE_KEY, id); };

  const addRecord = (r: GrowthRecord) => {
    if (!activeId) return;
    setRecords((prev) => [...prev.filter((x) => x.date !== r.date), r].sort((a, b) => a.date.localeCompare(b.date)));
    void setDoc(doc(db, "children", activeId, "records", r.date), { date: r.date, height: r.height, weight: r.weight, note: r.note ?? null, createdAt: serverTimestamp() });
  };

  const deleteRecord = (date: string) => { if (!activeId) return; setRecords((prev) => prev.filter((r) => r.date !== date)); void deleteDoc(doc(db, "children", activeId, "records", date)); };

  const updateRecord = (date: string, updated: GrowthRecord) => {
    if (!activeId) return;
    setRecords((prev) => [...prev.filter((r) => r.date !== date && r.date !== updated.date), updated].sort((a, b) => a.date.localeCompare(b.date)));
    if (date !== updated.date) void deleteDoc(doc(db, "children", activeId, "records", date));
    void setDoc(doc(db, "children", activeId, "records", updated.date), { date: updated.date, height: updated.height, weight: updated.weight, note: updated.note ?? null, createdAt: serverTimestamp() });
  };

  const addChild = (profile: Omit<ChildProfile, "id">) => {
    if (!user) return;
    const ref = doc(collection(db, "children"));
    const newChild: ChildProfile = { id: ref.id, ...profile };
    setList((prev) => [...prev, newChild]);
    if (!activeId) { setActiveIdState(ref.id); localStorage.setItem(ACTIVE_KEY, ref.id); }
    void setDoc(ref, { userId: user.id, ownerId: user.id, memberIds: [user.id], name: profile.name, birth: profile.birth, gender: profile.gender, createdAt: serverTimestamp() });
    void setDoc(doc(db, "children", ref.id, "meta", "vaccines"), { list: VACCINES });
  };

  const updateChild = (id: string, updates: Omit<ChildProfile, "id">) => {
    setList((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    void setDoc(doc(db, "children", id), { name: updates.name, birth: updates.birth, gender: updates.gender }, { merge: true });
  };

  const deleteChild = (id: string) => {
    if (list.length <= 1) return;
    const next = list.filter((c) => c.id !== id);
    setList(next);
    if (activeId === id && next.length > 0) { setActiveIdState(next[0].id); localStorage.setItem(ACTIVE_KEY, next[0].id); }
    void deleteDoc(doc(db, "children", id));
  };

  const saveVaccines = (vacs: Vaccine[]) => { if (!activeId) return; void setDoc(doc(db, "children", activeId, "meta", "vaccines"), { list: vacs }); };
  const completeVaccine = (name: string, round?: string) => { const updated = vaccines.map((v) => v.name === name && v.round === round ? { ...v, status: "done" as const } : v); setVaccines(updated); saveVaccines(updated); };
  const postponeVaccine = (name: string, round: string | undefined, days: number) => { const updated = vaccines.map((v) => v.name === name && v.round === round ? { ...v, dueDate: shiftDate(v.dueDate, days) } : v); setVaccines(updated); saveVaccines(updated); };

  return <AppCtx.Provider value={{ records, addRecord, deleteRecord, updateRecord, children: list, activeChild, setActiveChild, addChild, updateChild, deleteChild, vaccines, completeVaccine, postponeVaccine }}>{rc}</AppCtx.Provider>;
}

export const useRecords = () => useContext(AppCtx);
