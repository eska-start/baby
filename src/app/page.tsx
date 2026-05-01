"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/app/auth-provider";

type RecordItem = {
  id: string;
  userId: string;
  height: number;
  weight: number;
  date: string;
};

export default function HomePage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "records"), where("userId", "==", user.id), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const next = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RecordItem, "id">) }));
      setRecords(next);
    });
    return () => unsub();
  }, [user]);

  const saveRecord = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await addDoc(collection(db, "records"), {
      userId: user.id,
      height: Number(height),
      weight: Number(weight),
      date: new Date().toISOString().slice(0, 10),
      createdAt: serverTimestamp(),
    });
    setHeight("");
    setWeight("");
    setSaving(false);
  };

  if (isLoading || !user) return <div className="p-6 text-center">로딩 중...</div>;

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-bg p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ink">아이 성장 기록</h1>
          <p className="text-xs text-ink-mute">{user.name}님 반가워요</p>
        </div>
        <button onClick={() => void logout()} className="rounded-lg border border-line px-3 py-2 text-xs">로그아웃</button>
      </div>

      <form onSubmit={saveRecord} className="rounded-2xl border border-line bg-card p-4 shadow-soft">
        <label className="mb-1 block text-xs text-ink-mute">키(cm)</label>
        <input value={height} onChange={(e) => setHeight(e.target.value)} type="number" step="0.1" required className="mb-3 w-full rounded-lg border border-line px-3 py-2" />
        <label className="mb-1 block text-xs text-ink-mute">몸무게(kg)</label>
        <input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" step="0.1" required className="mb-4 w-full rounded-lg border border-line px-3 py-2" />
        <button disabled={saving} className="w-full rounded-lg bg-ink py-2 text-sm font-semibold text-white">{saving ? "저장 중..." : "저장"}</button>
      </form>

      <section className="mt-4 space-y-2">
        {records.map((r) => (
          <div key={r.id} className="rounded-xl border border-line bg-card px-4 py-3 text-sm">
            <div>{r.date}</div>
            <div className="text-ink-mute">키 {r.height}cm · 몸무게 {r.weight}kg</div>
          </div>
        ))}
      </section>
    </main>
  );
}
