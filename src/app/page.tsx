"use client";

import Link from "next/link";
import { BottomNav, ChildSwitcher, MobileTopBar, PageWrap, TopBar } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useRecords } from "@/app/providers";
import { useAuth } from "@/app/auth-provider";
import { bmi, bmiCategory, calcAgeLabel, formatDate } from "@/lib/data";

export default function HomePage() {
  const { user } = useAuth();
  const { activeChild, records } = useRecords();

  const last = records[records.length - 1];

  return (
    <>
      <TopBar />
      <MobileTopBar />
      <PageWrap>
        <div className="pt-2 md:pt-10">
          {!activeChild ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="font-serif text-[26px] font-medium text-ink">반갑습니다{user?.name ? `, ${user.name}님` : ""}</div>
              <p className="mt-2 text-[13px] text-ink-mute">아이를 추가하고 성장을 기록해보세요</p>
              <Link
                href="/settings"
                className="mt-6 inline-flex items-center gap-2 rounded-[14px] bg-ink px-6 py-3.5 text-[14px] font-semibold text-white"
              >
                <Icon name="plus" size={14} color="#fff" /> 아이 추가하기
              </Link>
            </div>
          ) : (
            <>
              <ChildSwitcher />

              <div className="rounded-[22px] bg-ink p-6 text-white mb-4">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full shrink-0"
                    style={{ background: "#F4B393" }}
                  >
                    <Icon name="flower" size={24} color="#1F1A14" />
                  </div>
                  <div>
                    <div className="font-serif text-[28px] font-medium">{activeChild.name}</div>
                    <div className="text-[13px] text-white/60">
                      {calcAgeLabel(activeChild.birth)} · {activeChild.gender}아
                    </div>
                  </div>
                </div>
              </div>

              {last ? (
                <section className="grid grid-cols-3 gap-3 mb-4">
                  <StatCard label="키" value={String(last.height)} unit="cm" />
                  <StatCard label="몸무게" value={String(last.weight)} unit="kg" />
                  <StatCard
                    label="BMI"
                    value={bmi(last.height, last.weight).toFixed(1)}
                    unit=""
                    sub={bmiCategory(bmi(last.height, last.weight)).label}
                  />
                </section>
              ) : (
                <div className="mb-4 rounded-[18px] border border-line bg-card px-5 py-8 text-center">
                  <p className="text-[14px] text-ink-mute">아직 기록이 없어요</p>
                  <p className="mt-1 text-[12px] text-ink-mute">{activeChild.name}의 첫 측정값을 입력해보세요</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <QuickLink href="/record" icon="edit" color="#D77B50" label="기록 입력" sub={last ? `마지막 ${formatDate(last.date)}` : "첫 기록 입력하기"} />
                <QuickLink href="/growth" icon="chart" color="#5478A1" label="성장 추이" sub={`${records.length}개 기록`} />
                <QuickLink href="/schedule" icon="calendar" color="#5C7A5C" label="예방접종 일정" sub="스케줄 확인" />
                <QuickLink href="/ai" icon="sparkle" color="#8B6CC5" label="AI 분석" sub="성장 분석 받기" />
              </div>
            </>
          )}
        </div>
      </PageWrap>
      <BottomNav />
    </>
  );
}

function StatCard({ label, value, unit, sub }: { label: string; value: string; unit: string; sub?: string }) {
  return (
    <div className="rounded-[16px] border border-line bg-card px-4 py-4">
      <div className="text-[11px] text-ink-mute mb-2">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="ko-num font-serif text-[22px] font-medium text-ink">{value}</span>
        {unit && <span className="text-[11px] text-ink-mute">{unit}</span>}
      </div>
      {sub && <div className="mt-1 text-[10px] text-ink-mute">{sub}</div>}
    </div>
  );
}

function QuickLink({ href, icon, color, label, sub }: { href: string; icon: string; color: string; label: string; sub: string }) {
  return (
    <Link href={href} className="flex flex-col gap-2 rounded-[18px] border border-line bg-card px-4 py-5 transition hover:bg-bg">
      <Icon name={icon} size={18} color={color} />
      <div className="text-[14px] font-semibold text-ink">{label}</div>
      <div className="text-[11px] text-ink-mute">{sub}</div>
    </Link>
  );
}
