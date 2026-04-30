import { BottomNav, MobileTopBar, PageWrap, TopBar } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { CHECKUPS, VACCINES, formatDate } from "@/lib/data";

const TODAY = new Date(2026, 3, 30); // 2026-04-30

function daysUntil(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const ms = target.getTime() - TODAY.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export default function SchedulePage() {
  const upcomingVaccines = VACCINES.filter((v) => v.status !== "done").sort((a, b) =>
    a.dueDate.localeCompare(b.dueDate)
  );
  const doneVaccines = VACCINES.filter((v) => v.status === "done").sort((a, b) =>
    b.dueDate.localeCompare(a.dueDate)
  );

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
          <button className="inline-flex items-center gap-2 rounded-[12px] border border-line bg-card px-4 py-3 text-[13px] font-medium text-ink-soft">
            <Icon name="upload" size={14} /> 캘린더 내보내기
          </button>
        </div>

        <div className="md:hidden px-2 pt-2">
          <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">SCHEDULE</div>
          <h1 className="font-serif text-[24px] font-medium text-ink">검진 · 접종 일정</h1>
        </div>

        {/* Highlight */}
        <section className="mt-4 rounded-[20px] bg-ink p-5 text-white md:mt-6 md:p-7">
          <div className="text-[11px] tracking-[0.5px] text-white/60">NEXT UP</div>
          <div className="mt-1.5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-serif text-[24px] font-medium md:text-[28px]">
                {upcomingVaccines[0].name} {upcomingVaccines[0].round}
              </div>
              <div className="mt-1 text-[12px] text-white/60">
                {formatDate(upcomingVaccines[0].dueDate)} · D-{daysUntil(upcomingVaccines[0].dueDate)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-[10px] border border-white/15 bg-white/5 px-4 py-2.5 text-[12px] font-medium text-white/90">
                일정 미루기
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-[10px] bg-accent px-4 py-2.5 text-[12px] font-semibold text-white">
                완료 처리 <Icon name="check" size={13} color="#fff" strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </section>

        {/* Two columns: vaccines & checkups */}
        <section className="mt-4 grid gap-4 md:mt-6 md:grid-cols-2">
          <div className="rounded-[18px] border border-line bg-card p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-accent-soft">
                  <Icon name="syringe" size={14} color="#D77B50" />
                </div>
                <span className="text-[13px] font-semibold text-ink">예방접종</span>
              </div>
              <span className="text-[11px] text-ink-mute">총 {VACCINES.length}건</span>
            </div>

            <div className="mb-2 text-[11px] tracking-[0.5px] text-ink-mute">예정</div>
            <div className="space-y-2">
              {upcomingVaccines.map((v) => (
                <ScheduleRow
                  key={v.name + v.dueDate}
                  title={`${v.name}${v.round ? ` · ${v.round}` : ""}`}
                  date={formatDate(v.dueDate)}
                  badge={`D-${daysUntil(v.dueDate)}`}
                  tone="accent"
                />
              ))}
            </div>

            <div className="mb-2 mt-5 text-[11px] tracking-[0.5px] text-ink-mute">완료</div>
            <div className="space-y-2">
              {doneVaccines.map((v) => (
                <ScheduleRow
                  key={v.name + v.dueDate}
                  title={`${v.name}${v.round ? ` · ${v.round}` : ""}`}
                  date={formatDate(v.dueDate)}
                  badge="완료"
                  tone="good"
                  muted
                />
              ))}
            </div>
          </div>

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
                <Icon name="sparkle" size={13} color="#C49B3A" /> 자동 알림
              </div>
              <div className="mt-1 text-[11px] leading-[1.55] text-ink-soft">
                일정 7일 전, 1일 전에 푸시 알림으로 알려드려요. 알림을 끄고 싶다면 설정에서 변경할
                수 있어요.
              </div>
            </div>
          </div>
        </section>
      </PageWrap>
      <BottomNav />
    </>
  );
}

function ScheduleRow({
  title,
  date,
  badge,
  tone,
  muted,
}: {
  title: string;
  date: string;
  badge: string;
  tone: "accent" | "good";
  muted?: boolean;
}) {
  const color = tone === "accent" ? "#D77B50" : "#5C7A5C";
  const bg = tone === "accent" ? "#FCE5D2" : "#E5EFE3";
  return (
    <div
      className={`flex items-center justify-between rounded-[12px] border border-line px-4 py-3 ${
        muted ? "bg-bg/60" : "bg-card"
      }`}
    >
      <div>
        <div className={`text-[13px] font-medium ${muted ? "text-ink-soft" : "text-ink"}`}>{title}</div>
        <div className="ko-num mt-0.5 text-[11px] text-ink-mute">{date}</div>
      </div>
      <span
        className="ko-num rounded-full px-2 py-0.5 text-[10px] font-semibold"
        style={{ color, background: bg }}
      >
        {badge}
      </span>
    </div>
  );
}
