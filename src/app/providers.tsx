"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { GrowthRecord, GROWTH_RECORDS } from "@/lib/data";

type RecordsCtx = {
  records: GrowthRecord[];
  addRecord: (r: GrowthRecord) => void;
};

const Ctx = createContext<RecordsCtx>({
  records: GROWTH_RECORDS,
  addRecord: () => {},
});

const KEY = "ai-gyeol-records";

export function RecordsProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<GrowthRecord[]>(GROWTH_RECORDS);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as GrowthRecord[];
        if (parsed.length > 0) setRecords(parsed);
      } catch {}
    }
  }, []);

  const addRecord = (r: GrowthRecord) => {
    setRecords((prev) => {
      const next = [...prev.filter((x) => x.date !== r.date), r].sort((a, b) =>
        a.date.localeCompare(b.date)
      );
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  return <Ctx.Provider value={{ records, addRecord }}>{children}</Ctx.Provider>;
}

export const useRecords = () => useContext(Ctx);
