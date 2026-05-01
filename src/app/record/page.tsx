"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav, MobileTopBar, PageWrap, TopBar } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { CHILD, bmi, bmiCategory, diff, formatDate } from "@/lib/data";
import { useRecords } from "@/app/providers";

type Field = "height" | "weight";

export default function RecordPage() {
  const { records, addRecord } = useRecords();
  const router = useRouter();
  const last = records[records.length - 1];
  const [height, setHeight] = useState<string>(last.height.toFixed(1));
  const [weight, setWeight] = useState<string>(last.weight.toFixed(1));
  const [active, setActive] = useState<Field>("height");
  const [note, setNote] = useState("");

  const todayStr = useMemo(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);

  const today = useMemo(() => {
    const d = new Date();
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()} (${days[d.getDay()]})`;
  }, []);

  const save = () => {
    const h = Number(height);
    const w = Number(weight);
    if (!h || !w) return;
    addRecord({ date: todayStr, height: h, weight: w, note: note || undefined });
    router.push("/");
  };

  const press = (key: string) => {
    const cur = active === "height" ? height : weight;
    let next = cur;
    if (key === "⌫") {
      next = cur.length > 0 ? cur.slice(0, -1) : "";
    } else if (key === ".") {
      if (!cur.includes(".")) next = cur + ".";
    } else {
      // numeric
      const replacement = cur === "0" ? key : cur + key;
      next = replacement.length > 5 ? cur : replacement;
    }
    if (active === "height") setHeight(next);
    else setWeight(next);
  };

  const heightNum = Number(height) || 0;
  const weightNum = Number(weight) || 0;
  const bmiVal = heightNum > 0 ? bmi(heightNum, weightNum) : 0;
  const cat = bmiVal > 0 ? bmiCategory(bmiVal) : null;
  const dh = heightNum ? diff(heightNum, last.height) : "";
  const dw = weightNum ? diff(weightNum, last.weight) : "";

  return (
    <>
      <TopBar />
      <MobileTopBar back title="새 기록" rightLabel="저장" onRight={save} />
      <PageWrap>
        {/* Desktop title row */}
        <div className="hidden md:flex items-end justify-between pt-8 pb-6">
          <div>
            <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">NEW MEASUREMENT</div>
            <h1 className="font-serif text-[28px] font-medium text-ink">오늘 측정값을 입력해주세요</h1>
            <p className="mt-1 text-[13px] text-ink-mute">
              마지막 기록: <span className="ko-num">{formatDate(last.date)} · {last.height}cm · {last.weight}kg</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="rounded-[12px] border border-line bg-card px-4 py-3 text-[13px] font-medium text-ink-soft"
            >
              취소
            </Link>
            <button
              onClick={save}
              className="inline-flex items-center gap-2 rounded-[12px] bg-ink px-5 py-3 text-[13px] font-semibold text-white"
            >
              저장하기 <Icon name="check" size={14} color="#fff" strokeWidth={2.4} />
            </button>
          </div>
        </div>

        {/* Mobile heading */}
        <div className="md:hidden px-2 pt-2">
          <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">{CHILD.name} · {CHILD.ageLabel}</div>
          <div className="font-serif text-[24px] font-medium text-ink">오늘 측정값을 입력해주세요</div>
          <div className="mt-1.5 text-[12px] text-ink-mute">
            마지막 기록: <span className="ko-num">{formatDate(last.date)} · {last.height}cm · {last.weight}kg</span>
          </div>
        </div>

        <section className="mt-4 grid gap-3 md:grid-cols-12 md:gap-4">
          {/* Left column: inputs */}
          <div className="md:col-span-7 space-y-3">
            {/* Date */}
            <div className="flex items-center justify-between rounded-[14px] border border-line bg-card px-5 py-3.5">
              <span className="text-[12px] text-ink-mute">측정일</span>
              <span className="ko-num text-[14px] font-medium text-ink">{today}</span>
            </div>

            {/* Height */}
            <button
              onClick={() => setActive("height")}
              className={`block w-full text-left rounded-[18px] bg-card px-5 py-5 transition ${
                active === "height" ? "border-2 border-ink" : "border border-line"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium tracking-[0.5px] text-ink-mute">키 (HEIGHT)</span>
                {dh && (
                  <span className="rounded-full bg-good-soft px-2 py-0.5 text-[11px] font-semibold text-good">
                    {dh} cm
                  </span>
                )}
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span
                  className={`ko-num font-serif text-[56px] font-medium leading-none tracking-tight ${
                    height ? "text-ink" : "text-ink-mute"
                  }`}
                >
                  {height || "0.0"}
                </span>
                <span className="text-[16px] text-ink-mute">cm</span>
                <div className="flex-1" />
                {active === "height" && (
                  <div className="h-9 w-0.5 bg-accent" style={{ animation: "blink 1s infinite" }} />
                )}
              </div>
            </button>

            {/* Weight */}
            <button
              onClick={() => setActive("weight")}
              className={`block w-full text-left rounded-[18px] bg-card px-5 py-5 transition ${
                active === "weight" ? "border-2 border-ink" : "border border-line"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium tracking-[0.5px] text-ink-mute">몸무게 (WEIGHT)</span>
                {dw && (
                  <span className="rounded-full bg-good-soft px-2 py-0.5 text-[11px] font-semibold text-good">
                    {dw} kg
                  </span>
                )}
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span
                  className={`ko-num font-serif text-[56px] font-medium leading-none tracking-tight ${
                    weight ? "text-ink" : "text-ink-mute"
                  }`}
                >
                  {weight || "0.0"}
                </span>
                <span className="text-[16px] text-ink-mute">kg</span>
                <div className="flex-1" />
                {active === "weight" && (
                  <div className="h-9 w-0.5 bg-accent" style={{ animation: "blink 1s infinite" }} />
                )}
              </div>
            </button>

            {/* Note */}
            <div className="flex items-center gap-2 rounded-[14px] border border-dashed border-line-strong bg-transparent px-4.5 py-3.5">
              <Icon name="note" size={14} color="#8B8377" />
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="메모 추가하기 (선택)"
                className="flex-1 border-none bg-transparent text-[12px] text-ink outline-none placeholder:text-ink-mute"
              />
            </div>
          </div>

          {/* Right column: live preview + numpad (desktop) */}
          <div className="md:col-span-5 space-y-3 md:space-y-4">
            <div className="rounded-[18px] border border-line bg-card px-5 py-5 md:px-6 md:py-6">
              <div className="text-[11px] tracking-[0.5px] text-ink-mute">실시간 미리보기</div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="ko-num font-serif text-[42px] font-medium leading-none tracking-tight text-ink">
                  {bmiVal ? bmiVal.toFixed(1) : "—"}
                </span>
                <span className="text-[14px] text-ink-mute">BMI</span>
              </div>
              {cat && (
                <span
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ color: cat.color, background: cat.bg }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: cat.color }} />
                  {cat.label}
                </span>
              )}
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
                <PreviewMini label="이번 측정" value={`${heightNum.toFixed(1)} cm`} sub={`${weightNum.toFixed(1)} kg`} />
                <PreviewMini label="저번 측정 대비" value={dh || "—"} sub={dw ? `${dw} kg` : "—"} accent />
              </div>
            </div>

            {/* Desktop numpad */}
            <div className="hidden md:block rounded-[18px] border border-line bg-card p-3">
              <div className="grid grid-cols-3 gap-1.5">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((k) => (
                  <button
                    key={k}
                    onClick={() => press(k)}
                    className="rounded-[10px] bg-bg py-3.5 font-serif text-[22px] font-medium text-ink transition hover:bg-line"
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </PageWrap>

      {/* Mobile numpad */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card px-4 pb-7 pt-3">
        <div className="grid grid-cols-3 gap-1.5">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((k) => (
            <button
              key={k}
              onClick={() => press(k)}
              className="rounded-[10px] bg-bg py-3.5 font-serif text-[22px] font-medium text-ink"
            >
              {k}
            </button>
          ))}
        </div>
      </div>
      {/* On the record page, mobile numpad replaces the bottom nav */}
      <div className="md:hidden h-2" />
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
