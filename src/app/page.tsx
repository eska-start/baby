"use client";

import Link from "next/link";
import { BottomNav, MobileTopBar, PageWrap, TopBar, ChildSwitcher } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { BmiGauge } from "@/components/BmiGauge";
import { GrowthChart } from "@/components/GrowthChart";
import { bmi, bmiCategory, diff, shortDate, todayLabel, calcAgeLabel } from "@/lib/data";
import { useRecords } from "./providers";

export default function HomePage() {
  const { records, activeChild: profile, vaccines } = useRecords();
  const last = records[records.length - 1];
  const prev = records[records.length - 2];
  const monthAgo = records[records.length - 5] ?? records[0];
  const bmiVal = bmi(last.height, last.weight);
  const cat = bmiCategory(bmiVal);
  const ageLabel = calcAgeLabel(profile.birth);
  const upcoming = vaccines
    .filter((v) => v.status === "upcoming")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  return (
    <>
      <TopBar />
      <MobileTopBar />
      <PageWrap>
        <ChildSwitcher />

        {/* Greeting (desktop only) */}
        <div className="hidden md:flex items-end justify-between pt-8 pb-6">
          <div>
            <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">DASHBOARD</div>
            <h1 className="font-serif text-[32px] font-medium text-ink">
              안녕하세요, {profile.name} 보호자님
            </h1>
            <p className="mt-1 text-[13px] text-ink-mute">
              오늘도 작은 변화를 차곡차곡 기록해 보세요.
            </p>
          </div>
          <Link
            href="/record"
            className="inline-flex items-center gap-2 rounded-[12px] bg-ink px-5 py-3 text-[13px] font-semibold text-white transition hover:bg-black"
          >
            <Icon name="edit" size={14} color="#fff" /> 새 기록
          </Link>
        </div>

        {/* Top grid */}
        <section className="grid gap-3 md:grid-cols-12 md:gap-4">
          {/* BMI big card */}
          <div className="md:col-span-7 rounded-[22px] border border-line bg-card px-6 py-6 md:px-7 md:py-7">
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-0.5 text-[11px] tracking-[0.5px] text-ink-mute">오늘의 상태</div>
                <div className="text-[14px] font-medium text-ink">{todayLabel()}</div>
              </div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{ color: cat.color, background: cat.bg }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: cat.color }} />
                {cat.label}
              </span>
            </div>

            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="ko-num font-serif text-[64px] font-medium leading-none tracking-tight text-ink md:text-[72px]">
                {bmiVal.toFixed(1)}
              </span>
              <span className="text-[16px] text-ink-mute">BMI</span>
            </div>
            <div className="mt-1 text-[12px] text-ink-mute">
              또래 {ageLabel} {profile.gender}아 기준 정상 범위예요.
            </div>
            <BmiGauge value={bmiVal} />
          </div>

          {/* Quick stats */}
          <div className="md:col-span-5 grid grid-cols-2 gap-3 md:gap-4">
            <StatCard
              label="키"
              value={last.height.toFixed(1)}
              unit="cm"
              delta={prev ? diff(last.height, prev.height) : undefined}
              sub="이번 주"
              color="#5C7A5C"
            />
            <StatCard
              label="몸무게"
              value={last.weight.toFixed(1)}
              unit="kg"
              delta={prev ? diff(last.weight, prev.weight) : undefined}
              sub="이번 주"
              color="#5C7A5C"
            />
            <StatCard
              label="이번 달 키 증가"
              value={diff(last.height, monthAgo.height).replace("+", "+")}
              unit="cm"
              sub="한 달 누적"
              color="#D77B50"
              tone="accent"
            />
            <StatCard
              label="기록 일수"
              value={String(records.length)}
              unit="회"
              sub="이번 시즌 누적"
              color="#4A4239"
              tone="neutral"
            />
          </div>
        </section>

        {/* Mid grid */}
        <section className="mt-3 grid gap-3 md:mt-4 md:grid-cols-12 md:gap-4">
          {/* Mini chart */}
          <div className="md:col-span-7 rounded-[22px] border border-line bg-card p-5 md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold text-ink">이번 시즌 키 변화</div>
                <div className="mt-0.5 text-[11px] text-ink-mute">
                  최근 {records.length}개월 · 점선은 또래 평균(P50)
                </div>
              </div>
              <Link
                href="/growth"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-accent"
              >
                자세히 <Icon name="arrow-right" size={11} color="#D77B50" />
              </Link>
            </div>
            <GrowthChart metric="height" height={220} />
            <div className="mt-2 flex justify-between px-2 text-[10px] text-ink-mute">
              {records.map((r) => (
                <span key={r.date}>{shortDate(r.date)}</span>
              ))}
            </div>
          </div>

          {/* Recent records */}
          <div className="md:col-span-5 rounded-[22px] border border-line bg-card p-5 md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ink">최근 기록</span>
              <Link href="/growth" className="inline-flex items-center gap-1 text-[11px] font-medium text-accent">
                모두 보기 <Icon name="arrow-right" size={11} color="#D77B50" />
              </Link>
            </div>
            {[...records]
              .slice(-4)
              .reverse()
              .map((r, i, arr) => {
                const idx = records.indexOf(r);
                const earlier = records[idx - 1];
                const dh = earlier ? (r.height - earlier.height).toFixed(1) : "0.0";
                return (
                  <div
                    key={r.date}
                    className={`flex items-center gap-3 py-2.5 ${i > 0 ? "border-t border-line" : ""}`}
                  >
                    <div className="ko-num w-14 font-mono text-[11px] text-ink-mute">
                      {shortDate(r.date)}
                    </div>
                    <div className="flex flex-1 gap-3.5">
                      <span className="ko-num text-[13px] font-medium text-ink">{r.height} cm</span>
                      <span className="ko-num text-[13px] text-ink-soft">{r.weight} kg</span>
                    </div>
                    <span className="ko-num text-[11px] font-semibold text-good">
                      {Number(dh) >= 0 ? "+" : ""}
                      {dh}
                    </span>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Bottom CTAs */}
        <section className="mt-3 grid gap-3 md:mt-4 md:grid-cols-12 md:gap-4">
          <Link
            href="/ai"
            className="md:col-span-7 group flex items-center gap-3.5 rounded-[22px] bg-ink p-4 text-white md:p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/10">
              <Icon name="sparkle" size={16} color="#D77B50" strokeWidth={1.8} />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-semibold md:text-[14px]">검진지 · 접종표 인식</div>
              <div className="text-[11px] text-white/60 md:text-[12px]">
                사진만 올리면 AI가 항목을 자동 입력해드려요
              </div>
            </div>
            <Icon name="chevron-right" size={16} color="rgba(255,255,255,0.7)" />
          </Link>

          {upcoming && (
            <Link
              href="/schedule"
              className="md:col-span-5 flex items-center gap-3 rounded-[22px] border border-line bg-warn-soft p-4 md:p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-warn">
                <Icon name="syringe" size={16} color="#fff" />
              </div>
              <div className="flex-1">
                <div className="text-[11px] tracking-[0.5px] text-ink-soft">다가오는 일정</div>
                <div className="mt-0.5 text-[13px] font-semibold text-ink">
                  {upcoming.name} {upcoming.round} · {shortDate(upcoming.dueDate)}
                </div>
              </div>
              <Icon name="chevron-right" size={16} color="#8B8377" />
            </Link>
          )}
        </section>
      </PageWrap>
      <BottomNav />
    </>
  );
}

function StatCard({
  label, value, unit, delta, sub, color, tone = "good",
}: {
  label: string; value: string; unit: string; delta?: string;
  sub: string; color: string; tone?: "good" | "accent" | "neutral";
}) {
  return (
    <div className="rounded-[18px] border border-line bg-card px-4 py-4 md:px-5 md:py-5">
      <div className="mb-1.5 text-[11px] text-ink-mute">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="ko-num font-serif text-[28px] font-medium text-ink md:text-[32px]">{value}</span>
        <span className="text-[12px] text-ink-mute">{unit}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold" style={{ color }}>
        {delta && (
          <>
            {tone === "good" && <Icon name="arrow-up" size={11} color={color} />}
            {delta}
            {unit && tone === "good" ? unit : ""}
            <span className="ml-1 font-normal text-ink-mute">{sub}</span>
          </>
        )}
        {!delta && <span className="font-normal text-ink-mute">{sub}</span>}
      </div>
    </div>
  );
}
