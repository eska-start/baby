"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/app/auth-provider";

type ChildProfile = {
  id: string;
  userId: string;
  name: string;
  birthDate: string;
};

type RecordItem = {
  id: string;
  userId: string;
  childId: string;
  childName: string;
  height: number;
  weight: number;
  date: string;
};

export default function HomePage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [childName, setChildName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [recordDate, setRecordDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [savingChild, setSavingChild] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "children"), where("userId", "==", user.id));
    const unsub = onSnapshot(q, (snap) => {
      const first = snap.docs[0];
      if (!first) {
        setChild(null);
        return;
      }

      const data = first.data() as Omit<ChildProfile, "id">;
      setChild({ id: first.id, ...data });
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user || !child) return;

    const q = query(
      collection(db, "records"),
      where("userId", "==", user.id),
      where("childId", "==", child.id),
      orderBy("date", "desc"),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const next = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RecordItem, "id">) }));
        setRecords(next);
      },
      (error) => {
        console.error("Failed to load records", error);
        setMessage("기록을 불러오지 못했어요. Firestore 색인/권한을 확인해주세요.");
      },
    );

    return () => unsub();
  }, [user, child]);

  const bmiPreview = useMemo(() => {
    const h = Number(height);
    const w = Number(weight);
    if (!h || !w) return null;
    return (w / Math.pow(h / 100, 2)).toFixed(1);
  }, [height, weight]);

  const saveChild = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !childName.trim()) return;

    setSavingChild(true);
    setMessage("");

    try {
      const childId = child?.id ?? crypto.randomUUID();
      await setDoc(doc(db, "children", childId), {
        userId: user.id,
        name: childName.trim(),
        birthDate,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      setChildName("");
      setBirthDate("");
      setMessage("아이 정보가 저장됐어요.");
    } catch (error) {
      console.error("Failed to save child", error);
      setMessage("아이 정보 저장에 실패했어요. Firebase 권한을 확인해주세요.");
    } finally {
      setSavingChild(false);
    }
  };

  const saveRecord = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !child || !height || !weight) return;

    setSavingRecord(true);
    setMessage("");

    try {
      await addDoc(collection(db, "records"), {
        userId: user.id,
        childId: child.id,
        childName: child.name,
        height: Number(height),
        weight: Number(weight),
        bmi: bmiPreview ? Number(bmiPreview) : null,
        date: recordDate,
        createdAt: serverTimestamp(),
      });

      setHeight("");
      setWeight("");
      setRecordDate(new Date().toISOString().slice(0, 10));
      setMessage("성장 기록이 저장됐어요.");
    } catch (error) {
      console.error("Failed to save record", error);
      setMessage("저장에 실패했어요. Firestore 규칙을 확인해주세요.");
    } finally {
      setSavingRecord(false);
    }
  };

  if (isLoading || !user) return <div className="p-6 text-center">로딩 중...</div>;

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-bg p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ink">아이키</h1>
          <p className="text-xs text-ink-mute">{user.name}님, 아이의 성장을 기록해요</p>
        </div>
        <button onClick={() => void logout()} className="rounded-lg border border-line px-3 py-2 text-xs">
          로그아웃
        </button>
      </div>

      {message && <div className="mb-3 rounded-xl bg-white px-4 py-3 text-xs text-ink shadow-soft">{message}</div>}

      {!child ? (
        <form onSubmit={saveChild} className="rounded-2xl border border-line bg-card p-4 shadow-soft">
          <h2 className="mb-1 text-lg font-semibold text-ink">아이 정보 설정</h2>
          <p className="mb-4 text-xs text-ink-mute">처음 한 번만 아이 이름을 저장하면 기록이 연결됩니다.</p>

          <label className="mb-1 block text-xs text-ink-mute">아이 이름</label>
          <input
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="예: 현유"
            required
            className="mb-3 w-full rounded-lg border border-line px-3 py-2"
          />

          <label className="mb-1 block text-xs text-ink-mute">생년월일</label>
          <input
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            type="date"
            className="mb-4 w-full rounded-lg border border-line px-3 py-2"
          />

          <button disabled={savingChild} className="w-full rounded-lg bg-ink py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {savingChild ? "저장 중..." : "아이 정보 저장"}
          </button>
        </form>
      ) : (
        <>
          <section className="mb-4 rounded-2xl border border-line bg-card p-4 shadow-soft">
            <p className="text-xs text-ink-mute">기록 중인 아이</p>
            <div className="mt-1 text-xl font-semibold text-ink">{child.name}</div>
            {child.birthDate && <p className="mt-1 text-xs text-ink-mute">생년월일 {child.birthDate}</p>}
          </section>

          <form onSubmit={saveRecord} className="rounded-2xl border border-line bg-card p-4 shadow-soft">
            <label className="mb-1 block text-xs text-ink-mute">기록일</label>
            <input value={recordDate} onChange={(e) => setRecordDate(e.target.value)} type="date" required className="mb-3 w-full rounded-lg border border-line px-3 py-2" />

            <label className="mb-1 block text-xs text-ink-mute">키(cm)</label>
            <input value={height} onChange={(e) => setHeight(e.target.value)} type="number" step="0.1" required className="mb-3 w-full rounded-lg border border-line px-3 py-2" />

            <label className="mb-1 block text-xs text-ink-mute">몸무게(kg)</label>
            <input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" step="0.1" required className="mb-3 w-full rounded-lg border border-line px-3 py-2" />

            {bmiPreview && <div className="mb-4 rounded-lg bg-bg px-3 py-2 text-xs text-ink-mute">예상 BMI {bmiPreview}</div>}

            <button disabled={savingRecord} className="w-full rounded-lg bg-ink py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {savingRecord ? "저장 중..." : "저장"}
            </button>
          </form>

          <section className="mt-4 space-y-2">
            <h2 className="text-sm font-semibold text-ink">최근 기록</h2>
            {records.length === 0 && <div className="rounded-xl border border-line bg-card px-4 py-3 text-sm text-ink-mute">아직 저장된 기록이 없어요.</div>}
            {records.map((r) => (
              <div key={r.id} className="rounded-xl border border-line bg-card px-4 py-3 text-sm">
                <div className="font-medium text-ink">{r.date}</div>
                <div className="text-ink-mute">키 {r.height}cm · 몸무게 {r.weight}kg</div>
              </div>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
