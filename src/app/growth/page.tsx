"use client";

import { useMemo, useState } from "react";
import { BottomNav, MobileTopBar, PageWrap, TopBar } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { GrowthChart } from "@/components/GrowthChart";
import { GrowthRecord, bmi, formatDate, shortDate } from "@/lib/data";
import { useRecords } from "@/app/providers";

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
  const { records: GROWTH_RECORDS, activeChild: profile, deleteRecord, updateRecord } = useRecords();

  const [confirmDate, setConfirmDate] = useState<string | null>(null);
  const [editRecord, setEditRecord] = useState<GrowthRecord | null>(null);

  const last = GROWTH_RECORDS[GROWTH_RECORDS.length - 1];
  const prev = GROWTH_RECORDS[GROWTH_RECORDS.length - 2] ?? last;
  const monthAgo = GROWTH_RECORDS[GROWTH_RECORDS.length - 5] ?? GROWTH_RECORDS[0];
  const seasonStart = GROWTH_RECORDS[0];

  const tableRows = useMemo(() => [...GROWTH_RECORDS].reverse(), [GROWTH_RECORDS]);

  if (!last) {
    return (
      <>
        <TopBar />
        <MobileTopBar back title="성장 추이" />
        <PageWrap>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="font-serif text-[22px] font-medium text-ink">아직 기록이 없어요</div>
            <p className="mt-2 text-[13px] text-ink-mute">{profile.name}의 첫 성장 기록을 입력해보세요.</p>
            <a href="/record" className="mt-6 inline-flex items-center gap-2 rounded-[12px] bg-ink px-5 py-3 text-[13px] font-semibold text-white">
              기록 입력하기
            </a>
          </div>
        </PageWrap>
        <BottomNav />
      </>
    );
  }

  const weekDelta = (last.height - prev.height).toFixed(1);
  const monthDelta = (last.height - monthAgo.height).toFixed(1);
  const seasonDelta = (last.height - seasonStart.height).toFixed(1);
  const weekDeltaW = (last.weight - prev.weight).toFixed(1);
  const monthDeltaW = (last.weight - monthAgo.weight).toFixed(1);
  const bmiVal = bmi(last.height, last.weight);

  return (
    <>
      <TopBar />
      <MobileTopBar back title="성장 추이" />
      <PageWrap>
        <div className="hidden md:flex items-end justify-between pt-8 pb-6">
          <div>
            <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">GROWTH TRACKER</div>
            <h1 className="font-serif text-[32px] font-medium text-ink">{profile.name} 성장 추이</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 rounded-[10px] border border-line bg-card p-1">
              {METRICS.map((m) => (
                <button key={m.key} onClick={() => setMetric(m.key)}
                  className={`rounded-[6px] px-3 py-1.5 text-[12px] font-medium transition ${metric === m.key ? "bg-bg text-ink" : "text-ink-mute"}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1 rounded-[10px] border border-line bg-card p-1">
              {PERIODS.map((p) => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`rounded-[6px] px-3.5 py-1.5 text-[12px] font-medium transition ${period === p ? "bg-ink text-white" : "text-ink-soft"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="md:hidden px-2 pt-2">
          <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">GROWTH</div>
          <h1 className="font-serif text-[24px] font-medium text-ink">성장 추이</h1>
          <div className="mt-3 flex gap-1.5 rounded-[10px] border border-line bg-card p-1">
            {PERIODS.map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`flex-1 rounded-[7px] px-3 py-2 text-[12px] font-medium transition ${period === p ? "bg-ink text-white" : "text-ink-soft"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <section className="mt-4 grid grid-cols-2 gap-3 md:mt-6 md:grid-cols-4 md:gap-4">
          <SummaryCard label="현재 키" value={last.height.toFixed(1)} unit="cm" sub="정상 범위" tone="good" />
          <SummaryCard label="현재 몸무게" value={last.weight.toFixed(1)} unit="kg" sub="정상 범위" tone="good" />
          <SummaryCard label="BMI" value={bmiVal.toFixed(1)} unit="" sub="정상 범위" tone="good" />
          <SummaryCard label="월 평균 성장" value={`+${monthDelta}`} unit="cm" sub="이번 달 누적" tone="accent" />
        </section>

        <section className="mt-3 grid grid-cols-3 gap-3 md:mt-4 md:gap-4">
          <DeltaStrip label="지난 주 대비" valueH={`+${weekDelta} cm`} valueW={`+${weekDeltaW} kg`} />
          <DeltaStrip label="지난 달 대비" valueH={`+${monthDelta} cm`} valueW={`+${monthDeltaW} kg`} />
          <DeltaStrip label="시즌 전체" valueH={`+${seasonDelta} cm`} valueW={`+${(last.weight - seasonStart.weight).toFixed(1)} kg`} />
        </section>

        <section className="mt-4 rounded-[18px] border border-line bg-card p-5 md:mt-6 md:p-7">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[14px] font-semibold text-ink">{metric === "height" ? "키" : "몸무게"} 성장 곡선</div>
              <div className="mt-0.5 text-[11px] text-ink-mute">최근 {GROWTH_RECORDS.length}개월 · 점선은 또래 평균(P50)</div>
            </div>
            <div className="flex gap-3 md:gap-5">
              <div className="flex items-center gap-1.5">
                <div className="h-[2px] w-3.5 bg-accent" />
                <span className="text-[11px] text-ink">{profile.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-0 w-3.5 border-t-2 border-dashed border-ink-mute" />
                <span className="text-[11px] text-ink-mute">P50 평균</span>
              </div>
            </div>
            <div className="md:hidden flex gap-1 rounded-[10px] border border-line bg-card p-1">
              {METRICS.map((m) => (
                <button key={m.key} onClick={() => setMetric(m.key)}
                  className={`flex-1 rounded-[7px] px-3 py-1.5 text-[12px] font-medium transition ${metric === m.key ? "bg-bg text-ink font-semibold" : "text-ink-mute"}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <GrowthChart metric={metric} height={300} />
          <div className="mt-2 hidden md:flex justify-between px-2 text-[10px] text-ink-mute">
            {GROWTH_RECORDS.map((r) => <span key={r.date}>{shortDate(r.date)}</span>)}
          </div>
        </section>

        {/* Records table */}
        <section className="mt-4 overflow-hidden rounded-[14px] border border-line bg-card md:mt-6">
          <div className="border-b border-line px-5 py-3.5 text-[13px] font-semibold text-ink md:px-6">
            전체 기록 · {GROWTH_RECORDS.length}건
          </div>
          <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_1fr_2fr_auto] border-b border-line px-6 py-2.5 text-[11px] font-medium tracking-[0.4px] text-ink-mute">
            <span>날짜</span><span>키</span><span>몸무게</span><span>BMI</span><span>메모</span><span></span>
          </div>
          {tableRows.map((r, i) => {
            const earlier = GROWTH_RECORDS[GROWTH_RECORDS.indexOf(r) - 1];
            const dh = earlier ? (r.height - earlier.height).toFixed(1) : "—";
            const isConfirm = confirmDate === r.date;
            return (
              <div
                key={r.date}
                className={`md:grid md:grid-cols-[1fr_1fr_1fr_1fr_2fr_auto] flex flex-col gap-1 md:gap-0 px-5 py-3 md:px-6 md:py-3.5 md:items-center transition ${
                  i < tableRows.length - 1 ? "border-b border-line" : ""
                } ${isConfirm ? "bg-red-50" : ""}`}
              >
                <span className="ko-num font-mono text-[12px] text-ink-mute">{formatDate(r.date)}</span>
                <div className="flex items-center justify-between md:contents">
                  <span className="ko-num text-[13px] font-medium text-ink">{r.height} cm</span>
                  <span className="ko-num text-[13px] text-ink-soft">{r.weight} kg</span>
                  <span className="ko-num text-[13px] text-ink-soft">{bmi(r.height, r.weight).toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between md:contents">
                  <span className="text-[12px] text-ink-mute">{r.note || "—"}</span>
                  {isConfirm ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-red-500 font-medium">삭제할까요?</span>
                      <button onClick={() => setConfirmDate(null)} className="rounded-[6px] border border-line bg-card px-2 py-1 text-[11px] text-ink-mute">취소</button>
                      <button onClick={() => { deleteRecord(r.date); setConfirmDate(null); }} className="rounded-[6px] bg-red-500 px-2 py-1 text-[11px] font-semibold text-white">삭제</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditRecord(r)} className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-line bg-bg transition hover:bg-accent-soft" title="수정">
                        <Icon name="edit" size={12} color="#8B8377" />
                      </button>
                      <button onClick={() => setConfirmDate(r.date)} className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-line bg-bg transition hover:bg-red-50" title="삭제">
                        <Icon name="trash" size={12} color="#8B8377" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </PageWrap>
      <BottomNav />

      {/* Edit modal */}
      {editRecord && (
        <EditModal
          record={editRecord}
          onSave={(updated) => { updateRecord(editRecord.date, updated); setEditRecord(null); }}
          onClose={() => setEditRecord(null)}
        />
      )}
    </>
  );
}

function EditModal({ record, onSave, onClose }: { record: GrowthRecord; onSave: (r: GrowthRecord) => void; onClose: () => void }) {
  const [date, setDate] = useState(record.date);
  const [height, setHeight] = useState(record.height.toString());
  const [weight, setWeight] = useState(record.weight.toString());
  const [note, setNote] = useState(record.note ?? "");

  const handleSave = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!date || !h || !w) return;
    onSave({ date, height: h, weight: w, note: note || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="w-full max-w-sm rounded-[22px] bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 text-[16px] font-semibold text-ink">기록 수정</div>
        <div className="space-y-3">
          <Field label="날짜">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full border-none bg-transparent text-[15px] font-medium text-ink outline-none" />
          </Field>
          <Field label="키 (cm)">
            <input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)}
              className="w-full border-none bg-transparent text-[15px] font-medium text-ink outline-none" />
          </Field>
          <Field label="몸무게 (kg)">
            <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)}
              className="w-full border-none bg-transparent text-[15px] font-medium text-ink outline-none" />
          </Field>
          <Field label="메모 (선택)">
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="메모"
              className="w-full border-none bg-transparent text-[15px] font-medium text-ink outline-none placeholder:text-ink-mute" />
          </Field>
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-[12px] border border-line bg-bg py-3 text-[13px] font-medium text-ink">취소</button>
          <button onClick={handleSave} className="flex-[2] rounded-[12px] bg-ink py-3 text-[13px] font-semibold text-white">저장</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-line bg-bg px-4 py-3">
      <div className="mb-1 text-[10px] tracking-[0.5px] text-ink-mute">{label}</div>
      {children}
    </div>
  );
}

function SummaryCard({ label, value, unit, sub, tone }: { label: string; value: string; unit: string; sub: string; tone: "good" | "accent" }) {
  const color = tone === "good" ? "#5C7A5C" : "#D77B50";
  return (
    <div className="rounded-[14px] border border-line bg-card px-4 py-4 md:px-5">
      <div className="mb-2 text-[11px] text-ink-mute">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="ko-num font-serif text-[26px] font-medium text-ink md:text-[30px]">{value}</span>
        <span className="text-[12px] text-ink-mute">{unit}</span>
      </div>
      <div className="mt-1.5 text-[11px] font-medium" style={{ color }}>{sub}</div>
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
