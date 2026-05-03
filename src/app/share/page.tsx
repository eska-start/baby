"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { GrowthRecord, bmi, bmiCategoryKorean, calcAgeMonths, calcAgeLabel, formatDate, shortDate } from "@/lib/data";
import { GrowthChart } from "@/components/GrowthChart";

type ShareData = {
  name: string;
  birth: string;
  gender: string;
  records: GrowthRecord[];
  sharedAt: string;
};

function ShareView() {
  const params = useSearchParams();
  const raw = params.get("d");

  let data: ShareData | null = null;
  try {
    if (raw) data = JSON.parse(decodeURIComponent(atob(raw)));
  } catch {}

  if (!data || !data.records?.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-6 text-center">
        <div>
          <div className="font-serif text-[22px] font-medium text-ink">공유 링크가 올바르지 않아요</div>
          <p className="mt-2 text-[13px] text-ink-mute">링크를 다시 확인해주세요.</p>
          <Link href="/login" className="mt-5 inline-block rounded-[12px] bg-ink px-5 py-3 text-[13px] font-semibold text-white">
            아이키 시작하기
          </Link>
        </div>
      </div>
    );
  }

  const last = data.records[data.records.length - 1];
  const bmiVal = bmi(last.height, last.weight);
  const bmiAge = calcAgeMonths(data.birth);
  const cat = bmiCategoryKorean(bmiVal, bmiAge, (data.gender as "남" | "여") ?? "남");
  const ageLabel = calcAgeLabel(data.birth);

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="border-b border-line bg-card/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="font-serif text-[18px] font-semibold text-ink">아이키</div>
          <Link href="/signup" className="rounded-[10px] bg-ink px-4 py-2 text-[12px] font-semibold text-white">
            무료로 시작하기
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Child info */}
        <div className="mb-4 rounded-[20px] bg-ink p-5 text-white">
          <div className="text-[11px] tracking-[0.5px] text-white/50">공유된 성장 기록</div>
          <div className="mt-1.5 font-serif text-[26px] font-medium">{data.name}</div>
          <div className="mt-0.5 text-[13px] text-white/60">{ageLabel} · {data.gender}아 · {data.records.length}개의 기록</div>
        </div>

        {/* Stats */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-[16px] border border-line bg-card px-4 py-4 text-center">
            <div className="ko-num font-serif text-[26px] font-medium text-ink">{last.height.toFixed(1)}</div>
            <div className="text-[11px] text-ink-mute">cm · 키</div>
          </div>
          <div className="rounded-[16px] border border-line bg-card px-4 py-4 text-center">
            <div className="ko-num font-serif text-[26px] font-medium text-ink">{last.weight.toFixed(1)}</div>
            <div className="text-[11px] text-ink-mute">kg · 몸무게</div>
          </div>
          <div className="rounded-[16px] border border-line bg-card px-4 py-4 text-center">
            <div className="ko-num font-serif text-[26px] font-medium text-ink">{bmiVal.toFixed(1)}</div>
            <span className="inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ color: cat.color, background: cat.bg }}>
              {cat.label}
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-4 rounded-[18px] border border-line bg-card p-5">
          <div className="mb-3 text-[13px] font-semibold text-ink">키 성장 곡선</div>
          <GrowthChart metric="height" height={220} records={data.records} />
          <div className="mt-2 flex justify-between px-1 text-[10px] text-ink-mute">
            {data.records.map((r) => <span key={r.date}>{shortDate(r.date)}</span>)}
          </div>
        </div>

        {/* Records list */}
        <div className="mb-6 overflow-hidden rounded-[14px] border border-line bg-card">
          <div className="border-b border-line px-5 py-3 text-[13px] font-semibold text-ink">
            전체 기록 · {data.records.length}건
          </div>
          {[...data.records].reverse().map((r, i) => (
            <div key={r.date} className={`flex items-center gap-3 px-5 py-3 ${i > 0 ? "border-t border-line" : ""}`}>
              <span className="ko-num w-20 font-mono text-[11px] text-ink-mute">{formatDate(r.date)}</span>
              <span className="ko-num text-[13px] font-medium text-ink">{r.height} cm</span>
              <span className="ko-num text-[13px] text-ink-soft">{r.weight} kg</span>
              {r.note && <span className="text-[11px] text-ink-mute">{r.note}</span>}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-[18px] bg-ink p-5 text-center text-white">
          <div className="font-serif text-[18px] font-medium">아이키로 직접 기록해보세요</div>
          <div className="mt-1 text-[12px] text-white/60">무료로 가입하고 성장을 추적하세요</div>
          <Link href="/signup" className="mt-4 inline-block rounded-[12px] bg-accent px-6 py-3 text-[13px] font-semibold text-white">
            무료로 시작하기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-bg"><div className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-accent" /></div>}>
      <ShareView />
    </Suspense>
  );
}
