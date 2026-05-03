"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav, MobileTopBar, PageWrap, TopBar } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { CHILD, bmi, bmiCategory, diff, formatDate } from "@/lib/data";
import { useRecords } from "@/app/providers";

export default function RecordPage() {
  const { records, addRecord, activeChild } = useRecords();
  const router = useRouter();
  const last = records[records.length - 1];

  const [height, setHeight] = useState(last ? last.height.toFixed(1) : "");
  const [weight, setWeight] = useState(last ? last.weight.toFixed(1) : "");
  const [note, setNote] = useState("");

  const todayStr = useMemo(() => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }, []);

  const today = useMemo(() => {
    const d = new Date();
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()} (${days[d.getDay()]})`;
  }, []);

  const heightNum = parseFloat(height) || 0;
  const weightNum = parseFloat(weight) || 0;
  const bmiVal = heightNum > 0 && weightNum > 0 ? bmi(heightNum, weightNum) : 0;
  const cat = bmiVal > 0 ? bmiCategory(bmiVal) : null;
  const dh = last && heightNum ? diff(heightNum, last.height) : "";
  const dw = last && weightNum ? diff(weightNum, last.weight) : "";

  const save = () => {
    if (!heightNum || !weightNum) return;
    addRecord({ date: todayStr, height: heightNum, weight: weightNum, note: note || undefined });
    router.push("/");
  };

  return (
    <>
      <TopBar />
      <MobileTopBar back title="새 기록" rightLabel="저장" onRight={save} />
      <PageWrap>
        <div className="hidden md:flex items-end justify-between pt-8 pb-6">
          <div>
            <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">NEW MEASUREMENT</div>
            <h1 className="font-serif text-[28px] font-medium text-ink">오늘 측정값을 입력해주세요</h1>
            {last && (
              <p className="mt-1 text-[13px] text-ink-mute">
                마지막 기록: <span className="ko-num">{formatDate(last.date)} · {last.height}cm · {last.weight}kg</span>
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href="/" className="rounded-[12px] border border-line bg-card px-4 py-3 text-[13px] font-medium text-ink-soft">
              취소
            </Link>
            <button onClick={save} className="inline-flex items-center gap-2 rounded-[12px] bg-ink px-5 py-3 text-[13px] font-semibold text-white">
              저장하기 <Icon name="check" size={14} color="#fff" strokeWidth={2.4} />
            </button>
          </div>
        </div>

        <div className="md:hidden px-2 pt-2">
          <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">{activeChild?.name}</div>
          <div className="font-serif text-[22px] font-medium text-ink">오늘 측정값을 입력해주세요</div>
          {last && (
            <div className="mt-1 text-[12px] text-ink-mute">
              마지막 기록: <span className="ko-num">{formatDate(last.date)} · {last.height}cm · {last.weight}kg</span>
            </div>
          )}
        </div>

        <section className="mt-4 grid gap-3 md:grid-cols-12 md:gap-4">
          {/* Left: inputs */}
          <div className="md:col-span-7 space-y-3">
            {/* Date */}
            <div className="flex items-center justify-between rounded-[14px] border border-line bg-card px-5 py-3.5">
              <span className="text-[12px] text-ink-mute">측정일</span>
              <span className="ko-num text-[14px] font-medium text-ink">{today}</span>
            </div>

            {/* Height */}
            <div className="rounded-[18px] border-2 border-ink bg-card px-5 py-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-medium tracking-[0.5px] text-ink-mute">키 (HEIGHT)</span>
                {dh && (
                  <span className="rounded-full bg-good-soft px-2 py-0.5 text-[11px] font-semibold text-good">{dh} cm</span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="300"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="0.0"
                  className="ko-num w-full border-none bg-transparent font-serif text-[56px] font-medium leading-none tracking-tight text-ink outline-none placeholder:text-ink-mute/40"
                />
                <span className="text-[16px] text-ink-mute shrink-0">cm</span>
              </div>
            </div>

            {/* Weight */}
            <div className="rounded-[18px] border border-line bg-card px-5 py-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-medium tracking-[0.5px] text-ink-mute">몸무게 (WEIGHT)</span>
                {dw && (
                  <span className="rounded-full bg-good-soft px-2 py-0.5 text-[11px] font-semibold text-good">{dw} kg</span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="200"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0.0"
                  className="ko-num w-full border-none bg-transparent font-serif text-[56px] font-medium leading-none tracking-tight text-ink outline-none placeholder:text-ink-mute/40"
                />
                <span className="text-[16px] text-ink-mute shrink-0">kg</span>
              </div>
            </div>

            {/* Note */}
            <div className="flex items-center gap-2 rounded-[14px] border border-dashed border-line-strong bg-transparent px-4 py-3.5">
              <Icon name="note" size={14} color="#8B8377" />
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="메모 추가하기 (선택)"
                className="flex-1 border-none bg-transparent text-[12px] text-ink outline-none placeholder:text-ink-mute"
              />
            </div>
          </div>

          {/* Right: live preview */}
          <div className="md:col-span-5">
            <div className="rounded-[18px] border border-line bg-card px-5 py-5 md:px-6 md:py-6">
              <div className="text-[11px] tracking-[0.5px] text-ink-mute">실시간 미리보기</div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="ko-num font-serif text-[42px] font-medium leading-none tracking-tight text-ink">
                  {bmiVal ? bmiVal.toFixed(1) : "—"}
                </span>
                <span className="text-[14px] text-ink-mute">BMI</span>
              </div>
              {cat && (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ color: cat.color, background: cat.bg }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: cat.color }} />
                  {cat.label}
                </span>
              )}
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
                <PreviewMini label="이번 측정" value={`${heightNum.toFixed(1)} cm`} sub={`${weightNum.toFixed(1)} kg`} />
                <PreviewMini label="저번 대비" value={dh || "—"} sub={dw ? `${dw} kg` : "—"} accent />
              </div>
            </div>
          </div>
        </section>

        {/* Mobile save button */}
        <button
          onClick={save}
          className="md:hidden mt-4 w-full rounded-[14px] bg-ink py-4 text-[14px] font-semibold text-white"
        >
          저장하기
        </button>
      </PageWrap>
      <BottomNav />
    </>
  );
}

function PreviewMini({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.5px] text-ink-mute">{label}</div>
      <div className={`ko-num mt-1 text-[18px] font-semibold ${accent ? "text-accent" : "text-ink"}`}>{value}</div>
      <div className="ko-num mt-0.5 text-[11px] text-ink-mute">{sub}</div>
    </div>
  );
}
