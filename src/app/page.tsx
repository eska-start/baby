"use client";

import Link from "next/link";
import { BottomNav, ChildSwitcher, MobileTopBar, PageWrap, TopBar } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { BmiGauge } from "@/components/BmiGauge";
import { GrowthChart } from "@/components/GrowthChart";
import { useRecords } from "@/app/providers";
import { useAuth } from "@/app/auth-provider";
import { bmi, bmiCategoryKorean, calcAgeMonths, calcAgeLabel, diff, shortDate, smartDate } from "@/lib/data";

const BMI_ADVICE: Record<string, { title: string; body: string }> = {
  저체중: {
    title: "조금 더 먹어볼까요?",
    body: "고단백 식품과 균형 잡힌 식사로 건강한 체중을 만들어 줄 수 있어요. 소아과 상담도 함께 받아보세요.",
  },
  "정상 범위": {
    title: "잘 크고 있어요!",
    body: "지금 이 상태를 유지하는 게 제일 좋아요. 규칙적인 식사와 야외 활동을 꾸준히 해주세요.",
  },
  과체중: {
    title: "식단을 조금 살펴볼게요.",
    body: "단 음료와 간식을 줄이고 활동량을 늘려보세요. 아직 충분히 조절할 수 있는 구간이에요.",
  },
  비만: {
    title: "체중 관리가 필요해요.",
    body: "소아과 또는 소아 영양 전문가와 상담을 권장해요. 식습관 개선과 규칙적인 신체 활동이 중요해요.",
  },
};

export default function HomePage() {
  const { user } = useAuth();
  const { activeChild, records, vaccines } = useRecords();

  const last = records[records.length - 1];
  const prev = records[records.length - 2];
  const bmiVal = last ? bmi(last.height, last.weight) : null;

  // 30일 전에 가장 가까운 기록 (없으면 첫 기록)
  const thirtyDaysAgo = last ? new Date(last.date) : new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const monthAgo = last
    ? ([...records]
        .filter((r) => new Date(r.date).getTime() <= thirtyDaysAgo.getTime())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] ??
        records[0])
    : null;
  const monthHeightDiff =
    monthAgo && last && monthAgo.date !== last.date
      ? last.height - monthAgo.height
      : null;
  const bmiAge = activeChild?.birth ? calcAgeMonths(activeChild.birth) : 0;
  const cat = bmiVal && activeChild
    ? bmiCategoryKorean(bmiVal, bmiAge, activeChild.gender ?? "남")
    : null;
  const upcoming = vaccines
    .filter((v) => v.status === "upcoming")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  const todayLabel = (() => {
    const d = new Date();
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  })();

  if (!activeChild) {
    return (
      <>
        <TopBar />
        <MobileTopBar />
        <PageWrap>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="font-serif text-[26px] font-medium text-ink">
              반갑습니다{user?.name ? `, ${user.name}님` : ""}
            </div>
            <p className="mt-2 text-[13px] text-ink-mute">아이를 추가하고 성장을 기록해보세요</p>
            <Link
              href="/settings"
              className="mt-6 inline-flex items-center gap-2 rounded-[14px] bg-ink px-6 py-3.5 text-[14px] font-semibold text-white"
            >
              <Icon name="plus" size={14} color="#fff" /> 아이 추가하기
            </Link>
          </div>
        </PageWrap>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <TopBar />
      <MobileTopBar />
      <PageWrap>
        {/* Mobile child switcher */}
        <ChildSwitcher />

        {/* Greeting (desktop only) */}
        <div className="hidden md:flex items-end justify-between pt-8 pb-6">
          <div>
            <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">DASHBOARD</div>
            <h1 className="font-serif text-[32px] font-medium text-ink">
              안녕하세요, {activeChild.name} 보호자님
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

        {/* No records yet */}
        {!last && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[14px] text-ink-mute">아직 기록이 없어요</p>
            <p className="mt-1 text-[12px] text-ink-mute">
              {activeChild.name}의 첫 측정값을 입력해보세요
            </p>
            <Link
              href="/record"
              className="mt-4 inline-flex items-center gap-2 rounded-[12px] bg-ink px-5 py-3 text-[13px] font-semibold text-white"
            >
              <Icon name="edit" size={14} color="#fff" /> 기록 입력하기
            </Link>
          </div>
        )}

        {/* Has records */}
        {last && bmiVal !== null && cat && (
          <>
            {/* Top grid */}
            <section className="grid gap-3 md:grid-cols-12 md:gap-4">
              {/* BMI card */}
              <div className="md:col-span-7 rounded-[22px] border border-line bg-card px-6 py-6 md:px-7 md:py-7">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-0.5 text-[11px] tracking-[0.5px] text-ink-mute">오늘의 상태</div>
                    <div className="text-[14px] font-medium text-ink">{todayLabel}</div>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{ color: cat.color, background: cat.bg }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: cat.color }} />
                    {cat.label}
                  </span>
                </div>

                <div className="mt-4 flex items-end gap-4">
                  <div>
                    <div className="text-[10px] tracking-[0.4px] text-ink-mute mb-0.5">BMI</div>
                    <div className="ko-num font-serif text-[38px] font-medium leading-none tracking-tight text-ink">
                      {bmiVal.toFixed(1)}
                    </div>
                  </div>
                  <div className="mb-1 flex-1">
                    <BmiGauge value={bmiVal} />
                  </div>
                </div>

                <div className="mt-4 rounded-[14px] px-4 py-3.5" style={{ background: cat.bg }}>
                  <div className="text-[13px] font-semibold leading-snug" style={{ color: cat.color }}>
                    {BMI_ADVICE[cat.label]?.title}
                  </div>
                  <div className="mt-1 text-[12px] leading-[1.6]" style={{ color: cat.color, opacity: 0.8 }}>
                    {BMI_ADVICE[cat.label]?.body}
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="md:col-span-5 grid grid-cols-2 gap-3 md:gap-4">
                <StatCard
                  label="키"
                  value={last.height.toFixed(1)}
                  unit="cm"
                  delta={prev ? diff(last.height, prev.height) : undefined}
                  sub="최근 측정 대비"
                  color="#5C7A5C"
                />
                <StatCard
                  label="몸무게"
                  value={last.weight.toFixed(1)}
                  unit="kg"
                  delta={prev ? diff(last.weight, prev.weight) : undefined}
                  sub="최근 측정 대비"
                  color="#5C7A5C"
                />
                <StatCard
                  label="최근 한 달 키"
                  value={monthHeightDiff !== null ? diff(last.height, monthAgo!.height) : "—"}
                  unit="cm"
                  sub={monthAgo && monthHeightDiff !== null ? `${smartDate(monthAgo.date)} 기준` : "30일 이내 비교 기록 없음"}
                  color="#D77B50"
                  tone="accent"
                />
                <StatCard
                  label="기록 일수"
                  value={String(records.length)}
                  unit="회"
                  sub="누적 기록"
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
                      최근 {records.length}개 기록 · 점선은 또래 평균(P50)
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
                    <span key={r.date}>{smartDate(r.date)}</span>
                  ))}
                </div>
              </div>

              {/* Recent records */}
              <div className="md:col-span-5 rounded-[22px] border border-line bg-card p-5 md:p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-ink">최근 기록</span>
                  <Link
                    href="/growth"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-accent"
                  >
                    모두 보기 <Icon name="arrow-right" size={11} color="#D77B50" />
                  </Link>
                </div>
                {[...records]
                  .slice(-4)
                  .reverse()
                  .map((r, i) => {
                    const idx = records.indexOf(r);
                    const earlier = records[idx - 1];
                    const dh = earlier ? (r.height - earlier.height).toFixed(1) : "0.0";
                    return (
                      <div
                        key={r.date}
                        className={`flex items-center gap-3 py-2.5 ${i > 0 ? "border-t border-line" : ""}`}
                      >
                        <div className="ko-num w-16 font-mono text-[11px] text-ink-mute">
                          {smartDate(r.date)}
                        </div>
                        <div className="flex flex-1 gap-3.5">
                          <span className="ko-num text-[13px] font-medium text-ink">
                            {r.height} cm
                          </span>
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
          </>
        )}
      </PageWrap>
      <BottomNav />
    </>
  );
}

function StatCard({
  label,
  value,
  unit,
  delta,
  sub,
  color,
  tone = "good",
}: {
  label: string;
  value: string;
  unit: string;
  delta?: string;
  sub: string;
  color: string;
  tone?: "good" | "accent" | "neutral";
}) {
  return (
    <div className="rounded-[18px] border border-line bg-card px-4 py-4 md:px-5 md:py-5">
      <div className="mb-1.5 text-[11px] text-ink-mute">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="ko-num font-serif text-[28px] font-medium text-ink md:text-[32px]">
          {value}
        </span>
        <span className="text-[12px] text-ink-mute">{unit}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold" style={{ color }}>
        {delta ? (
          <>
            {tone === "good" && <Icon name="arrow-up" size={11} color={color} />}
            {delta}
            {unit && tone === "good" ? unit : ""}
            <span className="ml-1 font-normal text-ink-mute">{sub}</span>
          </>
        ) : (
          <span className="font-normal text-ink-mute">{sub}</span>
        )}
      </div>
    </div>
  );
}
