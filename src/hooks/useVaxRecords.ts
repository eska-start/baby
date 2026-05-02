"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { VaccinationRecord } from "@/types/vaccination";
import { genId } from "@/lib/vaccineParser";

export function useVaxRecords(childId: string | null) {
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!childId) {
      setRecords([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ref = doc(db, "children", childId, "meta", "vaccinationRecords");
    const unsub = onSnapshot(ref, (snap) => {
      setRecords(snap.exists() ? (snap.data().list as VaccinationRecord[]) : []);
      setLoading(false);
    });
    return () => unsub();
  }, [childId]);

  const saveRecords = (recs: VaccinationRecord[]) => {
    if (!childId) return;
    void setDoc(doc(db, "children", childId, "meta", "vaccinationRecords"), { list: recs });
  };

  const mergeRecords = (incoming: VaccinationRecord[]) => {
    const merged = [...records];
    for (const nr of incoming) {
      const idx = merged.findIndex(
        (e) => e.vaccineGroup === nr.vaccineGroup && e.doseNumber === nr.doseNumber
      );
      if (idx >= 0) {
        merged[idx] = nr;
      } else {
        merged.push(nr);
      }
    }
    saveRecords(merged);
    return merged;
  };

  const markDone = (vaccineGroup: string, doseNumber: number, type: "vaccination" | "checkup", displayName: string) => {
    const today = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    const todayStr = `${today.getFullYear()}-${p(today.getMonth() + 1)}-${p(today.getDate())}`;

    const newRecord: VaccinationRecord = {
      id: genId(),
      childId: childId ?? "",
      type,
      name: `${displayName} ${doseNumber}차`,
      vaccineGroup,
      doseNumber,
      status: "completed",
      completedDate: todayStr,
    };

    const merged = [...records];
    const idx = merged.findIndex((r) => r.vaccineGroup === vaccineGroup && r.doseNumber === doseNumber);
    if (idx >= 0) merged[idx] = newRecord;
    else merged.push(newRecord);
    saveRecords(merged);
  };

  return { records, loading, saveRecords, mergeRecords, markDone };
}
