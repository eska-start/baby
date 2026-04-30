"use client";

import { useMemo, useState } from "react";
import { BottomNav, MobileTopBar, PageWrap, TopBar } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { GrowthChart } from "@/components/GrowthChart";
import { GROWTH_RECORDS, bmi, formatDate, shortDate } from "@/lib/data";

const PERIODS = ["주간", "월간", "연간"] as const;
type Period = (typeof PERIODS)[number];
const METRICS = [
  { key: "height", label: "키", unit: "cm" },
  { key: "weight", label: "몸무게", unit: "kg" },
] as const;
type MetricKey = (typeof METRICS)[number]["key"];

export default function GrowthPage() {
  const [period, setPeriod] = useState<Period>("월간");
  const [metric, setMetric] = useState<MetricKey>("height");

  const last = GROWTH_RECORDS[GROWTH_RECORDS.length - 1];
  const prev = GROWTH_RECORDS[GROWTH_RECORDS.length - 2];
  const monthAgo = GROWTH_RECORDS[GROWTH_RECORDS.length - 5] ?? GROWTH_RECORDS[0];
  const seasonStart = GROWTH_RECORDS[0];

  const weekDelta = (last.height - prev.height).toFixed(1);
  const monthDelta = (last.height - monthAgo.height).toFixed(1);
  const seasonDelta = (last.height - seasonStart.height).toFixed(1);
  const weekDeltaW = (last.weight - prev.weight).toFixed(1);
  const monthDeltaW = (last.weight - monthAgo.weight).toFixed(1);
  const bmiVal = bmi(last.height, last.weight);

  const tableRows = useMemo(() => {
    return [...GROWTH_RECORDS].slice().reverse();
  }, []);

  return (
    <>
      <TopBar />
      <MobileTopBar back title="성장 추이" />
      <PageWrap>
        {/* Header */}
        <div className="hidden md:flex items-end justify-between pt-8 pb-6">
          <div>
            <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">GROWTH TRACKER</div>
            <h1 className="font-serif text-[32px] font-medium text-ink">이서율 성장 추이</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 rounded-[10px] border border-line bg-card p-1">
              {METRICS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMetric(m.key)}
                  className={`rounded-[6px] px-3 py-1.5 text-[12px] font-medium transition ${
                    metric === m.key ? "bg-bg text-ink" : "text-ink-mute"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1 rounded-[10px] border border-line bg-card p-1">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`rounded-[6px] px-3.5 py-1.5 text-[12px] font-medium transition ${
                    period === p ? "bg-ink text-white" : "text-ink-soft"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile heading */}
        <div className="md:hidden px-2 pt-2">
          <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">GROWTH</div>
          <h1 className="font-serif text-[24px] font-medium text-ink">성장 추이</h1>
          <div className="mt-3 flex gap-1.5 rounded-[10px] border border-line bg-card p-1">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 rounded-[7px] px-3 py-2 text-[12px] font-medium transition ${
                  period === p ? "bg-ink text-white" : "text-ink-soft"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Stat row */}
        <section className="mt-4 grid grid-cols-2 gap-3 md:mt-6 md:grid-cols-4 md:gap-4">
          <SummaryCard label="현재 키" value={last.height.toFixed(1)} unit="cm" sub="P68 · 정상" tone="good" />
          <SummaryCard label="현재 몸무게" value={last.weight.toFixed(1)} unit="kg" sub="P54 · 정상" tone="good" />
          <SummaryCard label="BMI" value={bmiVal.toFixed(1)} unit="" sub="정상 범위" tone="good" />
          <SummaryCard label="월 평균 성장" value={`+${monthDelta}`} unit="cm" sub="평균 +0.9 대비 우수" tone="accent" />
        </section>

        {/* Period delta strip */}
        <section className="mt-3 grid grid-cols-3 gap-3 md:mt-4 md:gap-4">
          <DeltaStrip label="지난 주 대비" valueH={`+${weekDelta} cm`} valueW={`+${weekDeltaW} kg`} />
          <DeltaStrip label="지난 달 대비" valueH={`+${monthDelta} cm`} valueW={`+${monthDeltaW} kg`} />
          <DeltaStrip
            label="시즌 전체"
            valueH={`+${seasonDelta} cm`}
            valueW={`+${(last.weight - seasonStart.weight).toFixed(1)} kg`}
          />
        </section>

        {/* Big chart card */}
        <section className="mt-4 rounded-[18px] border border-line bg-card p-5 md:mt-6 md:p-7">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[14px] font-semibold text-ink">
                {metric === "height" ? "키" : "몸무게"} 성장 곡선
              </div>
              <div className="mt-0.5 text-[11px] text-ink-mute">
                최근 7개월 · WHO 5세 여아 표준 곡선 비교
              </div>
            </div>
            <div className="flex gap-3 md:gap-5">
              <div className="flex items-center gap-1.5">
                <div className="h-[2px] w-3.5 bg-accent" />
                <span className="text-[11px] text-ink">서율이</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-0 w-3.5 border-t-2 border-dashed border-ink-mute" />
                <span className="text-[11px] text-ink-mute">P50 평균</span>
              </div>
            </div>
            {/* Mobile metric switcher */}
            <div className="md:hidden flex gap-1 rounded-[10px] border border-line bg-card p-1">
              {METRICS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMetric(m.key)}
                  className={`flex-1 rounded-[7px] px-3 py-1.5 text-[12px] font-medium transition ${
                    metric === m.key ? "bg-bg text-ink font-semibold" : "text-ink-mute"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <GrowthChart metric={metric} height={300} />
          <div className="mt-2 hidden md:flex justify-between px-2 text-[10px] text-ink-mute">
            {GROWTH_RECORDS.map((r) => (
              <span key={r.date}>{shortDate(r.date)}</span>
            ))}
          </div>
        </section>

        {/* Table */}
        <section className="mt-4 overflow-hidden rounded-[14px] border border-line bg-card md:mt-6">
          <div className="border-b border-line px-5 py-3.5 text-[13px] font-semibold text-ink md:px-6">
            전체 기록 · {GROWTH_RECORDS.length}건
          </div>
          <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_1fr_2fr] border-b border-line px-6 py-2.5 text-[11px] font-medium tracking-[0.4px] text-ink-mute">
            <span>날짜</span>
            <span>키</span>
            <span>몸무게</span>
            <span>BMI</span>
            <span>메모</span>
          </div>
          {tableRows.map((r, i) => {
            const earlier = GROWTH_RECORDS[GROWTH_RECORDS.indexOf(r) - 1];
            const dh = earlier ? (r.height - earlier.height).toFixed(1) : "—";
            return (
              <div
                key={r.date}
                className={`md:grid md:grid-cols-[1fr_1fr_1fr_1fr_2fr] flex flex-col gap-1 md:gap-0 px-5 py-3 md:px-6 md:py-3.5 md:items-center ${
                  i < tableRows.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <span className="ko-num font-mono text-[12px] text-ink-mute">{formatDate(r.date)}</span>
                <div className="flex items-center justify-between md:contents">
                  <span className="ko-num text-[13px] font-medium text-ink">{r.height} cm</span>
                  <span className="ko-num text-[13px] text-ink-soft">{r.weight} kg</span>
                  <span className="ko-num text-[13px] text-ink-soft">
                    {bmi(r.height, r.weight).toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between md:contents">
                  <span className="text-[12px] text-ink-mute">{r.note || "—"}</span>
                  <span
                    className={`ko-num inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold md:hidden ${
                      Number(dh) > 0 ? "bg-good-soft text-good" : "bg-line text-ink-mute"
                    }`}
                  >
                    {Number(dh) >= 0 ? "+" : ""}
                    {dh} cm
                  </span>
                </div>
              </div>
            );
          })}
        </section>
      </PageWrap>
      <BottomNav />
    </>
  );
}

function SummaryCard({
  label,
  value,
  unit,
  sub,
  tone,
}: {
  label: string;
  value: string;
  unit: string;
  sub: string;
  tone: "good" | "accent";
}) {
  const color = tone === "good" ? "#5C7A5C" : "#D77B50";
  return (
    <div className="rounded-[14px] border border-line bg-card px-4 py-4 md:px-5 md:py-4.5">
      <div className="mb-2 text-[11px] text-ink-mute">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="ko-num font-serif text-[26px] font-medium text-ink md:text-[30px]">{value}</span>
        <span className="text-[12px] text-ink-mute">{unit}</span>
      </div>
      <div className="mt-1.5 text-[11px] font-medium" style={{ color }}>
        {sub}
      </div>
    </div>
  );
}

function DeltaStrip({ label, valueH, valueW }: { label: string; valueH: string; valueW: string }) {
  return (
    <div className="rounded-[14px] border border-line bg-card px-4 py-3.5">
      <div className="text-[10px] uppercase tracking-[0.5px] text-ink-mute">{label}</div>
      <div className="ko-num mt-1.5 flex items-baseline gap-1.5">
        <Icon name="ruler" size={14} color="#D77B50" />
        <span className="text-[13px] font-semibold text-ink">{valueH}</span>
      </div>
      <div className="ko-num mt-0.5 flex items-baseline gap-1.5">
        <Icon name="scale" size={14} color="#8B8377" />
        <span className="text-[12px] text-ink-soft">{valueW}</span>
      </div>
    </div>
  );
}
