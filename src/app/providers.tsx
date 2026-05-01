"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { GrowthRecord, GROWTH_RECORDS, Vaccine, VACCINES, CHILD } from "@/lib/data";

export type ChildProfile = {
  name: string;
  birth: string;
  gender: "여" | "남";
};

type Ctx = {
  records: GrowthRecord[];
  addRecord: (r: GrowthRecord) => void;
  profile: ChildProfile;
  setProfile: (p: ChildProfile) => void;
  vaccines: Vaccine[];
  completeVaccine: (name: string, round?: string) => void;
  postponeVaccine: (name: string, round: string | undefined, days: number) => void;
};

const defaultProfile: ChildProfile = {
  name: CHILD.name,
  birth: CHILD.birth,
  gender: CHILD.gender,
};

const AppCtx = createContext<Ctx>({
  records: GROWTH_RECORDS,
  addRecord: () => {},
  profile: defaultProfile,
  setProfile: () => {},
  vaccines: VACCINES,
  completeVaccine: () => {},
  postponeVaccine: () => {},
});

const R_KEY = "ai-gyeol-records";
const P_KEY = "ai-gyeol-profile";
const V_KEY = "ai-gyeol-vaccines";

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function RecordsProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<GrowthRecord[]>(GROWTH_RECORDS);
  const [profile, setProfileState] = useState<ChildProfile>(defaultProfile);
  const [vaccines, setVaccines] = useState<Vaccine[]>(VACCINES);

  useEffect(() => {
    try {
      const r = localStorage.getItem(R_KEY);
      if (r) { const p = JSON.parse(r) as GrowthRecord[]; if (p.length) setRecords(p); }
    } catch {}
    try {
      const p = localStorage.getItem(P_KEY);
      if (p) setProfileState(JSON.parse(p));
    } catch {}
    try {
      const v = localStorage.getItem(V_KEY);
      if (v) setVaccines(JSON.parse(v));
    } catch {}
  }, []);

  const addRecord = (r: GrowthRecord) => {
    setRecords((prev) => {
      const next = [...prev.filter((x) => x.date !== r.date), r].sort((a, b) =>
        a.date.localeCompare(b.date)
      );
      localStorage.setItem(R_KEY, JSON.stringify(next));
      return next;
    });
  };

  const setProfile = (p: ChildProfile) => {
    setProfileState(p);
    localStorage.setItem(P_KEY, JSON.stringify(p));
  };

  const completeVaccine = (name: string, round?: string) => {
    setVaccines((prev) => {
      const next = prev.map((v) =>
        v.name === name && v.round === round ? { ...v, status: "done" as const } : v
      );
      localStorage.setItem(V_KEY, JSON.stringify(next));
      return next;
    });
  };

  const postponeVaccine = (name: string, round: string | undefined, days: number) => {
    setVaccines((prev) => {
      const next = prev.map((v) =>
        v.name === name && v.round === round
          ? { ...v, dueDate: shiftDate(v.dueDate, days) }
          : v
      );
      localStorage.setItem(V_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <AppCtx.Provider value={{ records, addRecord, profile, setProfile, vaccines, completeVaccine, postponeVaccine }}>
      {children}
    </AppCtx.Provider>
  );
}

export const useRecords = () => useContext(AppCtx);
