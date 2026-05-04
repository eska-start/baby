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

function ymd(d: Date) {
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function getScheduleHelpers(birth: string) {
  const b = new Date(birth);
  const addDays = (n: number) => { const d = new Date(b); d.setDate(d.getDate() + n); return ymd(d); };
  const addMonths = (n: number) => { const d = new Date(b); d.setMonth(d.getMonth() + n); return ymd(d); };
  const windowEnd = (n: number) => { const d = new Date(b); d.setMonth(d.getMonth() + n + 1); d.setDate(d.getDate() - 1); return ymd(d); };
  const rangeMonths = (s: number, e: number) => ({ startDate: addMonths(s), dueDate: windowEnd(e) });
  const atMonth = (m: number) => ({ dueDate: addMonths(m) });
  return { addDays, addMonths, rangeMonths, atMonth };
}

function getCheckups(birth: string) {
  const { addDays, rangeMonths } = getScheduleHelpers(birth);
  const today = new Date().toISOString().slice(0, 10);
  return [
    { title: "영유아 검진 1차", detail: "생후 14~35일", start: addDays(14), end: addDays(35) },
    { title: "영유아 검진 2차", detail: "생후 4~6개월", start: rangeMonths(4, 6).startDate, end: rangeMonths(4, 6).dueDate },
    { title: "영유아 검진 3차", detail: "생후 9~12개월", start: rangeMonths(9, 12).startDate, end: rangeMonths(9, 12).dueDate },
    { title: "영유아 검진 4차", detail: "생후 18~24개월", start: rangeMonths(18, 24).startDate, end: rangeMonths(18, 24).dueDate },
    { title: "영유아 구강검진 1차", detail: "생후 18~29개월", start: rangeMonths(18, 29).startDate, end: rangeMonths(18, 29).dueDate },
    { title: "영유아 검진 5차", detail: "생후 30~36개월", start: rangeMonths(30, 36).startDate, end: rangeMonths(30, 36).dueDate },
    { title: "영유아 구강검진 2차", detail: "생후 30~41개월", start: rangeMonths(30, 41).startDate, end: rangeMonths(30, 41).dueDate },
    { title: "영유아 검진 6차", detail: "생후 42~48개월", start: rangeMonths(42, 48).startDate, end: rangeMonths(42, 48).dueDate },
    { title: "영유아 구강검진 3차", detail: "생후 42~53개월", start: rangeMonths(42, 53).startDate, end: rangeMonths(42, 53).dueDate },
    { title: "영유아 검진 7차", detail: "생후 54~60개월", start: rangeMonths(54, 60).startDate, end: rangeMonths(54, 60).dueDate },
    { title: "영유아 구강검진 4차", detail: "생후 54~65개월", start: rangeMonths(54, 65).startDate, end: rangeMonths(54, 65).dueDate },
    { title: "영유아 검진 8차", detail: "생후 66~71개월", start: rangeMonths(66, 71).startDate, end: rangeMonths(66, 71).dueDate },
  ].map((c) => ({ ...c, status: (c.end < today ? "done" : "upcoming") as "done" | "upcoming" }));
}

function getBirthBasedVaccines(birth: string): Vaccine[] {
  const { addDays, addMonths, rangeMonths, atMonth } = getScheduleHelpers(birth);
  return [
    { name: "결핵 BCG(피내용)", round: "1회", dueDate: addMonths(1) },
    { name: "B형간염 HepB", round: "1차", ...atMonth(0) },
    { name: "B형간염 HepB", round: "2차", ...atMonth(1) },
    { name: "B형간염 HepB", round: "3차", ...atMonth(6) },
    { name: "DTaP", round: "1차", ...atMonth(2) },
    { name: "DTaP", round: "2차", ...atMonth(4) },
    { name: "DTaP", round: "3차", ...atMonth(6) },
    { name: "DTaP", round: "추4차", ...rangeMonths(15, 18) },
    { name: "DTaP", round: "추5차", ...rangeMonths(48, 83) },
    { name: "Tdap", round: "추6차", ...rangeMonths(132, 155) },
    { name: "폴리오 IPV", round: "1차", ...atMonth(2) },
    { name: "폴리오 IPV", round: "2차", ...atMonth(4) },
    { name: "폴리오 IPV", round: "3차", ...atMonth(6) },
    { name: "폴리오 IPV", round: "추4차", ...rangeMonths(48, 83) },
    { name: "Hib", round: "1차", ...atMonth(2) },
    { name: "Hib", round: "2차", ...atMonth(4) },
    { name: "Hib", round: "3차", ...atMonth(6) },
    { name: "Hib", round: "추4차", ...rangeMonths(12, 15) },
    { name: "폐렴구균 PCV", round: "1차", ...atMonth(2) },
    { name: "폐렴구균 PCV", round: "2차", ...atMonth(4) },
    { name: "폐렴구균 PCV", round: "3차", ...atMonth(6) },
    { name: "폐렴구균 PCV", round: "추4차", ...rangeMonths(12, 15) },
    { name: "로타바이러스 RV(로타릭스)", round: "1차", ...atMonth(2) },
    { name: "로타바이러스 RV(로타릭스)", round: "2차", ...atMonth(4) },
    { name: "로타바이러스 RV(로타텍)", round: "1차", ...atMonth(2) },
    { name: "로타바이러스 RV(로타텍)", round: "2차", ...atMonth(4) },
    { name: "로타바이러스 RV(로타텍)", round: "3차", ...atMonth(6) },
    { name: "MMR", round: "1차", ...rangeMonths(12, 15) },
    { name: "MMR", round: "2차", ...rangeMonths(48, 83) },
    { name: "수두 VAR", round: "1회", ...rangeMonths(12, 15) },
    { name: "A형간염 HepA", round: "1차", ...rangeMonths(12, 18) },
    { name: "A형간염 HepA", round: "2차", dueDate: addMonths(24) },
    { name: "일본뇌염 IJEV(불활성화)", round: "1차", ...atMonth(12) },
    { name: "일본뇌염 IJEV(불활성화)", round: "2차", ...atMonth(13) },
    { name: "일본뇌염 IJEV(불활성화)", round: "추3차", ...atMonth(24) },
    { name: "일본뇌염 IJEV(불활성화)", round: "추4차", ...atMonth(72) },
    { name: "일본뇌염 IJEV(불활성화)", round: "추5차", ...atMonth(144) },
    { name: "일본뇌염 LJEV(생백신)", round: "1차", ...rangeMonths(12, 24) },
    { name: "일본뇌염 LJEV(생백신)", round: "2차", dueDate: addMonths(36) },
    { name: "HPV", round: "1~2차", ...rangeMonths(144, 155) },
    { name: "인플루엔자 IIV", round: "매년", startDate: addMonths(6), dueDate: addMonths(71) },
    { name: "PPSV", round: "고위험군", startDate: addMonths(24), dueDate: addMonths(155) },
    { name: "BCG 접종 시작", round: "참고", dueDate: addDays(0) },
  ].map((v) => ({ ...v, status: (v.dueDate < new Date().toISOString().slice(0, 10) ? "done" : "upcoming") as Vaccine["status"] }));
}

function vaccineDateText(v: Vaccine & { startDate?: string }) {
  return v.startDate ? `${formatDate(v.startDate)} ~ ${formatDate(v.dueDate)}` : `마감일: ${formatDate(v.dueDate)}`;
}

export default function SchedulePage() {
  const { completeVaccine, postponeVaccine, activeChild } = useRecords();
  const vaccines = activeChild ? getBirthBasedVaccines(activeChild.birth) : [];

  const upcomingVaccines = vaccines.filter((v) => v.status !== "done").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const doneVaccines = vaccines.filter((v) => v.status === "done").sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  const checkups = activeChild ? getCheckups(activeChild.birth) : [];
  const upcomingCheckups = checkups.filter((c) => c.status === "upcoming");
  const doneCheckups = checkups.filter((c) => c.status === "done");
  const nextVaccine = upcomingVaccines[0];
  const nextCheckup = upcomingCheckups[0];

  if (!activeChild) {
    return <><TopBar /><MobileTopBar back title="일정" /><PageWrap><div className="flex flex-col items-center justify-center py-24 text-center"><p className="text-[14px] text-ink-mute">아이를 먼저 추가해주세요</p><Link href="/settings" className="mt-4 rounded-[12px] bg-ink px-5 py-3 text-[13px] font-semibold text-white">아이 추가하기</Link></div></PageWrap><BottomNav /></>;
  }

  return (
    <>
      <TopBar />
      <MobileTopBar back title="일정" />
      <PageWrap>
        <div className="hidden md:flex items-end justify-between pt-8 pb-6"><div><div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">SCHEDULE</div><h1 className="font-serif text-[32px] font-medium text-ink">검진 · 예방접종 일정</h1><p className="mt-1 text-[13px] text-ink-mute">놓치지 않도록 다가오는 일정을 모았어요.</p></div></div>
        <div className="md:hidden px-2 pt-2"><div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">SCHEDULE</div><h1 className="font-serif text-[24px] font-medium text-ink">검진 · 접종 일정</h1></div>
        {(nextVaccine || nextCheckup) && <section className="mt-4 rounded-[20px] bg-ink p-5 text-white md:mt-6 md:p-7"><div className="text-[11px] tracking-[0.5px] text-white/60">NEXT UP</div>{nextVaccine && <div className="mt-1.5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><div className="font-serif text-[22px] font-medium md:text-[26px]">{nextVaccine.name} {nextVaccine.round}</div><div className="mt-1 text-[12px] text-white/60">{vaccineDateText(nextVaccine)} · D-{daysUntil(nextVaccine.dueDate)}</div></div></div>}</section>}
        <section className="mt-4 grid gap-4 md:mt-6 md:grid-cols-2">
          <div className="rounded-[18px] border border-line bg-card p-5 md:p-6"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-accent-soft"><Icon name="syringe" size={14} color="#D77B50" /></div><span className="text-[13px] font-semibold text-ink">예방접종</span></div><span className="text-[11px] text-ink-mute">총 {vaccines.length}건</span></div>{upcomingVaccines.length > 0 && <><div className="mb-2 text-[11px] tracking-[0.5px] text-ink-mute">예정</div><div className="space-y-2 mb-4">{upcomingVaccines.map((v) => <VaccineRow key={v.name + v.round + v.dueDate} vaccine={v} />)}</div></>}{doneVaccines.length > 0 && <><div className="mb-2 text-[11px] tracking-[0.5px] text-ink-mute">완료 (기간 경과)</div><div className="space-y-2">{doneVaccines.map((v) => <VaccineRow key={v.name + v.round + v.dueDate} vaccine={v} done />)}</div></>}</div>
          <div className="rounded-[18px] border border-line bg-card p-5 md:p-6"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-good-soft"><Icon name="heart" size={14} color="#5C7A5C" /></div><span className="text-[13px] font-semibold text-ink">영유아 건강검진 · 구강검진</span></div></div>{upcomingCheckups.length > 0 && <><div className="mb-2 text-[11px] tracking-[0.5px] text-ink-mute">예정</div><div className="space-y-2 mb-4">{upcomingCheckups.map((c) => <div key={c.title} className="rounded-[12px] border border-line bg-card px-4 py-3"><div className="flex items-center justify-between"><div><span className="text-[13px] font-semibold text-ink">{c.title}</span><div className="ko-num mt-0.5 text-[11px] text-ink-mute">{formatDate(c.start)} ~ {formatDate(c.end)}</div><div className="mt-0.5 text-[10px] text-ink-mute">마감일: {formatDate(c.end)}</div></div><div className="flex items-center gap-2"><span className="rounded-full bg-warn-soft px-2 py-0.5 text-[10px] font-semibold text-warn">예정</span><Link href={`/record?date=${c.end}`} className="rounded-[8px] bg-ink px-2.5 py-1.5 text-[10px] font-semibold text-white">기록 추가</Link></div></div></div>)}</div></>}{doneCheckups.length > 0 && <><div className="mb-2 text-[11px] tracking-[0.5px] text-ink-mute">완료 (기간 경과)</div><div className="space-y-2">{doneCheckups.map((c) => <div key={c.title} className="rounded-[12px] border border-line bg-bg/60 px-4 py-3"><div className="flex items-center justify-between"><div><span className="text-[13px] font-medium text-ink-soft">{c.title}</span><div className="ko-num mt-0.5 text-[11px] text-ink-mute">{formatDate(c.start)} ~ {formatDate(c.end)}</div><div className="mt-0.5 text-[10px] text-ink-mute">{c.detail}</div></div><span className="rounded-full bg-good-soft px-2 py-0.5 text-[10px] font-semibold text-good">완료</span></div></div>)}</div></>}</div>
        </section>
      </PageWrap>
      <BottomNav />
    </>
  );
}

function VaccineRow({ vaccine, done = false }: { vaccine: Vaccine & { startDate?: string }; done?: boolean }) {
  const days = daysUntil(vaccine.dueDate);
  return <div className={`rounded-[12px] border border-line ${done ? "bg-bg/60" : "bg-card"} px-4 py-3`}><div className="flex items-start justify-between gap-2"><div className="flex-1 min-w-0"><div className="text-[13px] font-medium text-ink">{vaccine.name}{vaccine.round ? ` · ${vaccine.round}` : ""}</div><div className="ko-num mt-0.5 text-[11px] text-ink-mute">{vaccineDateText(vaccine)}</div>{!done && <div className="mt-0.5 text-[10px] text-ink-mute">마감일: {formatDate(vaccine.dueDate)} · D-{days}</div>}</div><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${done ? "bg-good-soft text-good" : "bg-warn-soft text-warn"}`}>{done ? "완료" : "예정"}</span></div></div>;
}
