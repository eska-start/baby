"use client";

import { BottomNav, MobileTopBar, PageWrap, TopBar } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { CHECKUPS, formatDate, shortDate } from "@/lib/data";
import { useRecords } from "@/app/providers";

const TODAY = new Date();

function daysUntil(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const ms = target.getTime() - TODAY.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export default function SchedulePage() {
  const { vaccines, completeVaccine, postponeVaccine } = useRecords();

  const upcomingVaccines = vaccines
    .filter((v) => v.status !== "done")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const doneVaccines = vaccines
    .filter((v) => v.status === "done")
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate));

  const next = upcomingVaccines[0];

  return (
    <>
      <TopBar />
      <MobileTopBar back title="일정" />
      <PageWrap>
        <div className="hidden md:flex items-end justify-between pt-8 pb-6">
          <div>
            <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">SCHEDULE</div>
            <h1 className="font-serif text-[32px] font-medium text-ink">검진 · 예방접종 일정</h1>
            <p className="mt-1 text-[13px] text-ink-mute">
              놓치지 않도록 다가오는 일정을 한 번에 모았어요.
            </p>
          </div>
        </div>

        <div className="md:hidden px-2 pt-2">
          <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">SCHEDULE</div>
          <h1 className="font-serif text-[24px] font-medium text-ink">검진 · 접종 일정</h1>
        </div>

        {/* Next up highlight */}
        {next ? (
          <section className="mt-4 rounded-[20px] bg-ink p-5 text-white md:mt-6 md:p-7">
            <div className="text-[11px] tracking-[0.5px] text-white/60">NEXT UP</div>
            <div className="mt-1.5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-serif text-[24px] font-medium md:text-[28px]">
                  {next.name} {next.round}
                </div>
                <div className="mt-1 text-[12px] text-white/60">
                  {formatDate(next.dueDate)} · D-{daysUntil(next.dueDate)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => postponeVaccine(next.name, next.round, 7)}
                  className="rounded-[10px] border border-white/15 bg-white/5 px-4 py-2.5 text-[12px] font-medium text-white/90 transition hover:bg-white/10"
                >
                  7일 미루기
                </button>
                <button
                  onClick={() => completeVaccine(next.name, next.round)}
                  className="inline-flex items-center gap-1.5 rounded-[10px] bg-accent px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-accent/90"
                >
                  완료 처리 <Icon name="check" size={13} color="#fff" strokeWidth={2.4} />
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-4 rounded-[20px] border border-line bg-good-soft p-5 text-center md:mt-6 md:p-7">
            <div className="text-[13px] font-semibold text-good">모든 예방접종 일정이 완료됐어요 🎉</div>
          </section>
        )}

        {/* Two columns */}
        <section className="mt-4 grid gap-4 md:mt-6 md:grid-cols-2">
          {/* Vaccines */}
          <div className="rounded-[18px] border border-line bg-card p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-accent-soft">
                  <Icon name="syringe" size={14} color="#D77B50" />
                </div>
                <span className="text-[13px] font-semibold text-ink">예방접종</span>
              </div>
              <span className="text-[11px] text-ink-mute">총 {vaccines.length}건</span>
            </div>

            {upcomingVaccines.length > 0 && (
              <>
                <div className="mb-2 text-[11px] tracking-[0.5px] text-ink-mute">예정</div>
                <div className="space-y-2 mb-4">
                  {upcomingVaccines.map((v) => {
                    const days = daysUntil(v.dueDate);
                    return (
                      <div
                        key={v.name + v.dueDate}
                        className="flex items-center justify-between rounded-[12px] border border-line bg-card px-4 py-3"
                      >
                        <div>
                          <div className="text-[13px] font-medium text-ink">
                            {v.name}{v.round ? ` · ${v.round}` : ""}
                          </div>
                          <div className="ko-num mt-0.5 text-[11px] text-ink-mute">{formatDate(v.dueDate)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="ko-num rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">
                            D-{days}
                          </span>
                          <button
                            onClick={() => completeVaccine(v.name, v.round)}
                            className="flex h-6 w-6 items-center justify-center rounded-[6px] border border-line bg-bg transition hover:bg-good-soft hover:border-good"
                            title="완료 처리"
                          >
                            <Icon name="check" size={11} color="#8B8377" strokeWidth={2.4} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="mb-2 text-[11px] tracking-[0.5px] text-ink-mute">완료</div>
            <div className="space-y-2">
              {doneVaccines.map((v) => (
                <div
                  key={v.name + v.dueDate}
                  className="flex items-center justify-between rounded-[12px] border border-line bg-bg/60 px-4 py-3"
                >
                  <div>
                    <div className="text-[13px] font-medium text-ink-soft">
                      {v.name}{v.round ? ` · ${v.round}` : ""}
                    </div>
                    <div className="ko-num mt-0.5 text-[11px] text-ink-mute">{formatDate(v.dueDate)}</div>
                  </div>
                  <span className="rounded-full bg-good-soft px-2 py-0.5 text-[10px] font-semibold text-good">
                    완료
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Checkups */}
          <div className="rounded-[18px] border border-line bg-card p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-good-soft">
                  <Icon name="heart" size={14} color="#5C7A5C" />
                </div>
                <span className="text-[13px] font-semibold text-ink">건강 · 영유아 검진</span>
              </div>
              <span className="text-[11px] text-ink-mute">총 {CHECKUPS.length}건</span>
            </div>

            <div className="space-y-2.5">
              {CHECKUPS.map((c) => (
                <div
                  key={c.title}
                  className={`rounded-[14px] border border-line px-4 py-3.5 ${
                    c.status === "done" ? "bg-bg/60" : "bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-ink">{c.title}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        c.status === "done" ? "bg-good-soft text-good" : "bg-warn-soft text-warn"
                      }`}
                    >
                      {c.status === "done" ? "완료" : "예정"}
                    </span>
                  </div>
                  <div className="ko-num mt-1 text-[12px] text-ink-mute">
                    {formatDate(c.windowStart)} ~ {formatDate(c.windowEnd)}
                  </div>
                  {c.detail && <div className="mt-1.5 text-[11px] text-ink-soft">{c.detail}</div>}
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[14px] bg-warn-soft p-4">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-ink">
                <Icon name="sparkle" size={13} color="#C49B3A" /> 알림 안내
              </div>
              <div className="mt-1 text-[11px] leading-[1.55] text-ink-soft">
                일정 7일 전, 1일 전 알림을 받으려면 기기 알림을 허용해주세요.
              </div>
            </div>
          </div>
        </section>
      </PageWrap>
      <BottomNav />
    </>
  );
}
