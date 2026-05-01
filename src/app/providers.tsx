"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { GrowthRecord, GROWTH_RECORDS, Vaccine, VACCINES } from "@/lib/data";

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

const CHILDREN_KEY = "ai-gyeol-children";
const ACTIVE_KEY = "ai-gyeol-active";
const rKey = (id: string) => `ai-gyeol-r-${id}`;
const vKey = (id: string) => `ai-gyeol-v-${id}`;

function shiftDate(s: string, days: number): string {
  const d = new Date(s);
  d.setDate(d.getDate() + days);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function RecordsProvider({ children: rc }: { children: React.ReactNode }) {
  const [list, setList] = useState<ChildProfile[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [rMap, setRMap] = useState<Record<string, GrowthRecord[]>>({});
  const [vMap, setVMap] = useState<Record<string, Vaccine[]>>({});

  useEffect(() => {
    const children = loadJSON<ChildProfile[]>(CHILDREN_KEY, []);
    if (!children.length) return;
    setList(children);

    const savedId = localStorage.getItem(ACTIVE_KEY);
    const aid = savedId && children.find((c) => c.id === savedId) ? savedId : children[0].id;
    setActiveIdState(aid);

    const rm: Record<string, GrowthRecord[]> = {};
    const vm: Record<string, Vaccine[]> = {};
    for (const c of children) {
      rm[c.id] = loadJSON<GrowthRecord[]>(rKey(c.id), []);
      vm[c.id] = loadJSON<Vaccine[]>(vKey(c.id), VACCINES);
    }
    setRMap(rm);
    setVMap(vm);
  }, []);

  const activeChild = (activeId ? list.find((c) => c.id === activeId) : null) ?? list[0] ?? null;
  const records = activeId ? (rMap[activeId] ?? []) : [];
  const vaccines = activeId ? (vMap[activeId] ?? []) : [];

  const saveList = (next: ChildProfile[]) => {
    setList(next);
    localStorage.setItem(CHILDREN_KEY, JSON.stringify(next));
  };
  const saveRecords = (id: string, recs: GrowthRecord[]) => {
    setRMap((p) => ({ ...p, [id]: recs }));
    localStorage.setItem(rKey(id), JSON.stringify(recs));
  };
  const saveVaccines = (id: string, vacs: Vaccine[]) => {
    setVMap((p) => ({ ...p, [id]: vacs }));
    localStorage.setItem(vKey(id), JSON.stringify(vacs));
  };

  const addRecord = (r: GrowthRecord) => {
    if (!activeId) return;
    saveRecords(activeId, [...records.filter((x) => x.date !== r.date), r].sort((a, b) => a.date.localeCompare(b.date)));
  };
  const deleteRecord = (date: string) => {
    if (!activeId) return;
    saveRecords(activeId, records.filter((r) => r.date !== date));
  };
  const updateRecord = (date: string, updated: GrowthRecord) => {
    if (!activeId) return;
    saveRecords(activeId, records.map((r) => (r.date === date ? updated : r)).sort((a, b) => a.date.localeCompare(b.date)));
  };

  const setActiveChild = (id: string) => {
    setActiveIdState(id);
    localStorage.setItem(ACTIVE_KEY, id);
    if (!rMap[id]) {
      setRMap((p) => ({ ...p, [id]: loadJSON<GrowthRecord[]>(rKey(id), []) }));
      setVMap((p) => ({ ...p, [id]: loadJSON<Vaccine[]>(vKey(id), [...VACCINES]) }));
    }
  };
  const addChild = (profile: Omit<ChildProfile, "id">) => {
    const id = genId();
    const child = { id, ...profile };
    const next = [...list, child];
    saveList(next);
    saveRecords(id, []);
    saveVaccines(id, [...VACCINES]);
    setRMap((p) => ({ ...p, [id]: [] }));
    setVMap((p) => ({ ...p, [id]: [...VACCINES] }));
    if (!activeId) {
      setActiveIdState(id);
      localStorage.setItem(ACTIVE_KEY, id);
    }
  };
  const updateChild = (id: string, updates: Omit<ChildProfile, "id">) =>
    saveList(list.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  const deleteChild = (id: string) => {
    if (list.length <= 1) return;
    const next = list.filter((c) => c.id !== id);
    saveList(next);
    localStorage.removeItem(rKey(id));
    localStorage.removeItem(vKey(id));
    setRMap((p) => { const n = { ...p }; delete n[id]; return n; });
    setVMap((p) => { const n = { ...p }; delete n[id]; return n; });
    if (activeId === id) {
      const newId = next[0].id;
      setActiveIdState(newId);
      localStorage.setItem(ACTIVE_KEY, newId);
    }
  };

  const completeVaccine = (name: string, round?: string) => {
    if (!activeId) return;
    saveVaccines(activeId, vaccines.map((v) => v.name === name && v.round === round ? { ...v, status: "done" as const } : v));
  };
  const postponeVaccine = (name: string, round: string | undefined, days: number) => {
    if (!activeId) return;
    saveVaccines(activeId, vaccines.map((v) => v.name === name && v.round === round ? { ...v, dueDate: shiftDate(v.dueDate, days) } : v));
  };

  return (
    <AppCtx.Provider value={{ records, addRecord, deleteRecord, updateRecord, children: list, activeChild, setActiveChild, addChild, updateChild, deleteChild, vaccines, completeVaccine, postponeVaccine }}>
      {rc}
    </AppCtx.Provider>
  );
}

export const useRecords = () => useContext(AppCtx);
