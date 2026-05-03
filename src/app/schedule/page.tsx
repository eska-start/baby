"use client";

import Link from "next/link";
import { BottomNav, MobileTopBar, PageWrap, TopBar } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useRecords } from "@/app/providers";
import { Vaccine, formatDate } from "@/lib/data";

function daysUntil(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getCheckups(birth: string) {
  const b = new Date(birth);
  const addDays = (n: number) => {
    const d = new Date(b);
    d.setDate(d.getDate() + n);
    const p = (x: number) => String(x).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };
  const addMonths = (n: number) => {
    const d = new Date(b);
    d.setMonth(d.getMonth() + n);
    const p = (x: number) => String(x).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };
  const today = new Date().toISOString().slice(0, 10);
  return [
    { title: "영유아 검진 1차", detail: "생후 14~35일", start: addDays(14), end: addDays(35) },
    { title: "영유아 검진 2차", detail: "생후 4~6개월", start: addMonths(4), end: addMonths(6) },
    { title: "영유아 검진 3차", detail: "생후 9~12개월", start: addMonths(9), end: addMonths(12) },
    { title: "영유아 검진 4차", detail: "생후 18~24개월", start: addMonths(18), end: addMonths(24) },
    { title: "영유아 구강검진 1차", detail: "생후 18~29개월", start: addMonths(18), end: addMonths(29) },
    { title: "영유아 검진 5차", detail: "생후 30~36개월", start: addMonths(30), end: addMonths(36) },
    { title: "영유아 구강검진 2차", detail: "생후 30~41개월", start: addMonths(30), end: addMonths(41) },
    { title: "영유아 검진 6차", detail: "생후 42~48개월", start: addMonths(42), end: addMonths(48) },
    { title: "영유아 구강검진 3차", detail: "생후 42~53개월", start: addMonths(42), end: addMonths(53) },
    { title: "영유아 검진 7차", detail: "생후 54~60개월", start: addMonths(54), end: addMonths(60) },
    { title: "영유아 구강검진 4차", detail: "생후 54~65개월", start: addMonths(54), end: addMonths(65) },
    { title: "영유아 검진 8차", detail: "생후 66~71개월", start: addMonths(66), end: addMonths(71) },
  ].map((c) => ({
    ...c,
    status: (c.end < today ? "done" : "upcoming") as "done" | "upcoming",
  }));
}

export default function SchedulePage() {
  const { vaccines, completeVaccine, postponeVaccine, activeChild } = useRecords();

  const upcomingVaccines = vaccines
    .filter((v) => v.status !== "done")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const doneVaccines = vaccines
    .filter((v) => v.status === "done")
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate));

  const checkups = activeChild ? getCheckups(activeChild.birth) : [];
  const upcomingCheckups = checkups.filter((c) => c.status === "upcoming");
  const doneCheckups = checkups.filter((c) => c.status === "done");

  const nextVaccine = upcomingVaccines[0];
  const nextCheckup = upcomingCheckups[0];

  if (!activeChild) {
    return (
      <>
        <TopBar />
        <MobileTopBar back title="일정" />
        <PageWrap>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-[14px] text-ink-mute">아이를 먼저 추가해주세요</p>
            <Link href="/settings" className="mt-4 rounded-[12px] bg-ink px-5 py-3 text-[13px] font-semibold text-white">
              아이 추가하기
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
      <MobileTopBar back title="일정" />
      <PageWrap>
        <div className="hidden md:flex items-end justify-between pt-8 pb-6">
          <div>
            <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">SCHEDULE</div>
            <h1 className="font-serif text-[32px] font-medium text-ink">검진 · 예방접종 일정</h1>
            <p className="mt-1 text-[13px] text-ink-mute">놓치지 않도록 다가오는 일정을 모았어요.</p>
          </div>
        </div>
        <div className="md:hidden px-2 pt-2">
          <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">SCHEDULE</div>
          <h1 className="font-serif text-[24px] font-medium text-ink">검진 · 접종 일정</h1>
        </div>

        {(nextVaccine || nextCheckup) && (
          <section className="mt-4 rounded-[20px] bg-ink p-5 text-white md:mt-6 md:p-7">
            <div className="text-[11px] tracking-[0.5px] text-white/60">NEXT UP</div>
            {nextVaccine && (
              <div className="mt-1.5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-serif text-[22px] font-medium md:text-[26px]">
                    {nextVaccine.name} {nextVaccine.round}
                  </div>
                  <div className="mt-1 text-[12px] text-white/60">
                    {formatDate(nextVaccine.dueDate)} · D-{daysUntil(nextVaccine.dueDate)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => postponeVaccine(nextVaccine.name, nextVaccine.round, 7)} className="rounded-[10px] border border-white/15 bg-white/5 px-4 py-2.5 text-[12px] font-medium text-white/90">1주 미루기</button>
                  <button onClick={() => completeVaccine(nextVaccine.name, nextVaccine.round)} className="inline-flex items-center gap-1.5 rounded-[10px] bg-accent px-4 py-2.5 text-[12px] font-semibold text-white">완료 처리 <Icon name="check" size={13} color="#fff" strokeWidth={2.4} /></button>
                </div>
              </div>
            )}
          </section>
        )}

        <section className="mt-4 grid gap-4 md:mt-6 md:grid-cols-2">
          <div className="rounded-[18px] border border-line bg-card p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-accent-soft"><Icon name="syringe" size={14} color="#D77B50" /></div><span className="text-[13px] font-semibold text-ink">예방접종</span></div>
              <span className="text-[11px] text-ink-mute">총 {vaccines.length}건</span>
            </div>
            {upcomingVaccines.length > 0 && <><div className="mb-2 text-[11px] tracking-[0.5px] text-ink-mute">예정</div><div className="space-y-2 mb-4">{upcomingVaccines.map((v) => <VaccineRow key={v.name + v.dueDate} vaccine={v} onComplete={() => completeVaccine(v.name, v.round)} onPostpone={() => postponeVaccine(v.name, v.round, 7)} />)}</div></>}
            {doneVaccines.length > 0 && <><div className="mb-2 text-[11px] tracking-[0.5px] text-ink-mute">완료</div><div className="space-y-2">{doneVaccines.map((v) => <div key={v.name + v.dueDate} className="flex items-center justify-between rounded-[12px] border border-line bg-bg/60 px-4 py-3"><div><div className="text-[13px] font-medium text-ink-soft">{v.name}{v.round ? ` · ${v.round}` : ""}</div><div className="ko-num mt-0.5 text-[11px] text-ink-mute">{formatDate(v.dueDate)}</div></div><span className="rounded-full bg-good-soft px-2 py-0.5 text-[10px] font-semibold text-good">완료</span></div>)}</div></>}
            {vaccines.length === 0 && <div className="py-8 text-center text-[13px] text-ink-mute">예방접종 정보가 없어요.<br />AI 분석에서 접종 기록을 추가해보세요.</div>}
          </div>

          <div className="rounded-[18px] border border-line bg-card p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-good-soft"><Icon name="heart" size={14} color="#5C7A5C" /></div><span className="text-[13px] font-semibold text-ink">영유아 건강검진 · 구강검진</span></div></div>
            {upcomingCheckups.length > 0 && <><div className="mb-2 text-[11px] tracking-[0.5px] text-ink-mute">예정</div><div className="space-y-2 mb-4">{upcomingCheckups.map((c) => <div key={c.title} className="rounded-[12px] border border-line bg-card px-4 py-3"><div className="flex items-center justify-between"><div><span className="text-[13px] font-semibold text-ink">{c.title}</span><div className="ko-num mt-0.5 text-[11px] text-ink-mute">{formatDate(c.start)} ~ {formatDate(c.end)}</div><div className="mt-0.5 text-[10px] text-ink-mute">마감일: {formatDate(c.end)}</div></div><div className="flex items-center gap-2"><span className="rounded-full bg-warn-soft px-2 py-0.5 text-[10px] font-semibold text-warn">예정</span><Link href={`/record?date=${c.end}`} className="rounded-[8px] bg-ink px-2.5 py-1.5 text-[10px] font-semibold text-white">기록 추가</Link></div></div></div>)}</div></>}
            {doneCheckups.length > 0 && <><div className="mb-2 text-[11px] tracking-[0.5px] text-ink-mute">완료 (기간 경과)</div><div className="space-y-2">{doneCheckups.map((c) => <div key={c.title} className="rounded-[12px] border border-line bg-bg/60 px-4 py-3"><div className="flex items-center justify-between"><div><span className="text-[13px] font-medium text-ink-soft">{c.title}</span><div className="ko-num mt-0.5 text-[11px] text-ink-mute">{formatDate(c.start)} ~ {formatDate(c.end)}</div><div className="mt-0.5 text-[10px] text-ink-mute">{c.detail}</div></div><span className="rounded-full bg-good-soft px-2 py-0.5 text-[10px] font-semibold text-good">완료</span></div></div>)}</div></>}
          </div>
        </section>
      </PageWrap>
      <BottomNav />
    </>
  );
}

function VaccineRow({ vaccine, onComplete, onPostpone }: { vaccine: Vaccine; onComplete: () => void; onPostpone: () => void }) {
  const days = daysUntil(vaccine.dueDate);
  return <div className="rounded-[12px] border border-line bg-card px-4 py-3"><div className="flex items-start justify-between gap-2"><div className="flex-1 min-w-0"><div className="text-[13px] font-medium text-ink">{vaccine.name}{vaccine.round ? ` · ${vaccine.round}` : ""}</div><div className="ko-num mt-0.5 text-[11px] text-ink-mute">마감일: {formatDate(vaccine.dueDate)} · D-{days}</div></div><div className="flex items-center gap-1 shrink-0"><button onClick={onPostpone} className="rounded-[6px] border border-line bg-bg px-2 py-1 text-[10px] text-ink-mute">1주 미루기</button><button onClick={onComplete} className="rounded-[6px] bg-good px-2 py-1 text-[10px] font-semibold text-white">완료</button></div></div></div>;
}
