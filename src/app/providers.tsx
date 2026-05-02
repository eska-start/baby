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
  const userId = user?.id ?? null;

  const [list, setList] = useState<ChildProfile[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);

  const showError = (msg: string) => { setDbError(msg); setTimeout(() => setDbError(null), 4000); };

  // Only re-subscribe when the user ID actually changes, not on every render where
  // the auth provider creates a new user object with the same ID.
  useEffect(() => {
    if (!userId) { setList([]); setRecords([]); setVaccines([]); setActiveIdState(null); return; }

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

    const memberQuery = query(collection(db, "children"), where("memberIds", "array-contains", userId));
    const legacyQuery = query(collection(db, "children"), where("userId", "==", userId));

    const unsubMember = onSnapshot(
      memberQuery,
      (snap) => { memberChildren = snap.docs.map((d) => mapChild(d.id, d.data())); apply(); },
      (err) => console.error("[Firestore] children(member) read failed:", err)
    );

    const unsubLegacy = onSnapshot(
      legacyQuery,
      (snap) => {
        legacyChildren = snap.docs.map((d) => {
          const data = d.data();
          const memberIds = Array.isArray(data.memberIds) ? data.memberIds : [];
          if (!memberIds.includes(userId)) {
            void setDoc(doc(db, "children", d.id), { ownerId: data.ownerId ?? userId, memberIds: [userId] }, { merge: true });
          }
          return mapChild(d.id, data);
        });
        apply();
      },
      (err) => console.error("[Firestore] children(legacy) read failed:", err)
    );

    return () => { unsubMember(); unsubLegacy(); };
  }, [userId]);

  useEffect(() => {
    if (!activeId) { setRecords([]); return; }
    const q = query(collection(db, "children", activeId, "records"), orderBy("date", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => { setRecords(snap.docs.map((d) => ({ date: d.data().date as string, height: d.data().height as number, weight: d.data().weight as number, note: d.data().note as string | undefined }))); },
      (err) => {
        console.error("[Firestore] records read failed:", err);
        showError("기록을 불러오지 못했어요. Firestore 규칙을 확인해주세요.");
      }
    );
    return () => unsub();
  }, [activeId]);

  useEffect(() => {
    if (!activeId) { setVaccines([]); return; }
    const unsub = onSnapshot(
      doc(db, "children", activeId, "meta", "vaccines"),
      (snap) => { setVaccines(snap.exists() ? (snap.data().list as Vaccine[]) : VACCINES); },
      (err) => console.error("[Firestore] vaccines read failed:", err)
    );
    return () => unsub();
  }, [activeId]);

  const activeChild = (activeId ? list.find((c) => c.id === activeId) : null) ?? list[0] ?? null;

  const setActiveChild = (id: string) => { setActiveIdState(id); localStorage.setItem(ACTIVE_KEY, id); };

  const addRecord = (r: GrowthRecord) => {
    if (!activeId) return;
    const prev = records;
    setRecords((cur) => [...cur.filter((x) => x.date !== r.date), r].sort((a, b) => a.date.localeCompare(b.date)));
    setDoc(doc(db, "children", activeId, "records", r.date), {
      date: r.date, height: r.height, weight: r.weight, note: r.note ?? null, createdAt: serverTimestamp(),
    }).catch((err) => {
      console.error("[Firestore] addRecord failed:", err);
      showError("저장 실패: Firestore 규칙을 확인해주세요.");
      setRecords(prev);
    });
  };

  const deleteRecord = (date: string) => {
    if (!activeId) return;
    const prev = records;
    setRecords((cur) => cur.filter((r) => r.date !== date));
    deleteDoc(doc(db, "children", activeId, "records", date)).catch((err) => {
      console.error("[Firestore] deleteRecord failed:", err);
      showError("삭제 실패: Firestore 규칙을 확인해주세요.");
      setRecords(prev);
    });
  };

  const updateRecord = (date: string, updated: GrowthRecord) => {
    if (!activeId) return;
    const prev = records;
    setRecords((cur) => [...cur.filter((r) => r.date !== date && r.date !== updated.date), updated].sort((a, b) => a.date.localeCompare(b.date)));
    const writes: Promise<unknown>[] = [
      setDoc(doc(db, "children", activeId, "records", updated.date), {
        date: updated.date, height: updated.height, weight: updated.weight, note: updated.note ?? null, createdAt: serverTimestamp(),
      }),
    ];
    if (date !== updated.date) writes.push(deleteDoc(doc(db, "children", activeId, "records", date)));
    Promise.all(writes).catch((err) => {
      console.error("[Firestore] updateRecord failed:", err);
      showError("저장 실패: Firestore 규칙을 확인해주세요.");
      setRecords(prev);
    });
  };

  const addChild = (profile: Omit<ChildProfile, "id">) => {
    if (!userId) return;
    const ref = doc(collection(db, "children"));
    const newChild: ChildProfile = { id: ref.id, ...profile };
    const prev = list;
    setList((cur) => [...cur, newChild]);
    if (!activeId) { setActiveIdState(ref.id); localStorage.setItem(ACTIVE_KEY, ref.id); }
    Promise.all([
      setDoc(ref, { userId, ownerId: userId, memberIds: [userId], name: profile.name, birth: profile.birth, gender: profile.gender, createdAt: serverTimestamp() }),
      setDoc(doc(db, "children", ref.id, "meta", "vaccines"), { list: VACCINES }),
    ]).catch((err) => {
      console.error("[Firestore] addChild failed:", err);
      showError("아이 등록 실패: Firestore 규칙을 확인해주세요.");
      setList(prev);
    });
  };

  const updateChild = (id: string, updates: Omit<ChildProfile, "id">) => {
    const prev = list;
    setList((cur) => cur.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    setDoc(doc(db, "children", id), { name: updates.name, birth: updates.birth, gender: updates.gender }, { merge: true }).catch((err) => {
      console.error("[Firestore] updateChild failed:", err);
      setList(prev);
    });
  };

  const deleteChild = (id: string) => {
    if (list.length <= 1) return;
    const prev = list;
    const next = list.filter((c) => c.id !== id);
    setList(next);
    if (activeId === id && next.length > 0) { setActiveIdState(next[0].id); localStorage.setItem(ACTIVE_KEY, next[0].id); }
    deleteDoc(doc(db, "children", id)).catch((err) => {
      console.error("[Firestore] deleteChild failed:", err);
      setList(prev);
    });
  };

  const saveVaccines = (vacs: Vaccine[]) => {
    if (!activeId) return;
    setDoc(doc(db, "children", activeId, "meta", "vaccines"), { list: vacs }).catch((err) => {
      console.error("[Firestore] saveVaccines failed:", err);
    });
  };
  const completeVaccine = (name: string, round?: string) => { const updated = vaccines.map((v) => v.name === name && v.round === round ? { ...v, status: "done" as const } : v); setVaccines(updated); saveVaccines(updated); };
  const postponeVaccine = (name: string, round: string | undefined, days: number) => { const updated = vaccines.map((v) => v.name === name && v.round === round ? { ...v, dueDate: shiftDate(v.dueDate, days) } : v); setVaccines(updated); saveVaccines(updated); };

  return (
    <>
      {dbError && (
        <div className="fixed bottom-20 left-1/2 z-[100] -translate-x-1/2 whitespace-nowrap rounded-[12px] bg-red-500 px-5 py-3 text-[13px] font-medium text-white shadow-lg">
          {dbError}
        </div>
      )}
      <AppCtx.Provider value={{ records, addRecord, deleteRecord, updateRecord, children: list, activeChild, setActiveChild, addChild, updateChild, deleteChild, vaccines, completeVaccine, postponeVaccine }}>{rc}</AppCtx.Provider>
    </>
  );
}

export const useRecords = () => useContext(AppCtx);
