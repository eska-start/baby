"use client";

import { useState } from "react";
import { BottomNav, ChildSwitcher, MobileTopBar, PageWrap, TopBar } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { AIInputTab } from "@/components/vaccination/AIInputTab";
import { ScheduleTab } from "@/components/vaccination/ScheduleTab";
import { useRecords } from "@/app/providers";

type Tab = "ai" | "schedule";

export default function VaccinationPage() {
  const [tab, setTab] = useState<Tab>("schedule");
  const { activeChild } = useRecords();

  const handleSaved = () => {
    setTab("schedule");
  };

  if (!activeChild) {
    return (
      <>
        <TopBar />
        <MobileTopBar title="예방접종" />
        <PageWrap>
          <div className="mt-10 text-center text-[14px] text-ink-mute">아이 정보를 먼저 등록해주세요.</div>
        </PageWrap>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <TopBar />
      <MobileTopBar title="예방접종" />
      <PageWrap>
        <ChildSwitcher />

        {/* Desktop header */}
        <div className="hidden md:flex items-end justify-between pt-8 pb-6">
          <div>
            <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">VACCINATION</div>
            <h1 className="font-serif text-[32px] font-medium text-ink">예방접종 · 건강검진</h1>
            <p className="mt-1 text-[13px] text-ink-mute">
              {activeChild.name}의 접종 기록을 AI로 분석하고 남은 일정을 한눈에 확인하세요.
            </p>
          </div>
        </div>

        {/* Mobile header */}
        <div className="md:hidden px-2 pt-2 pb-4">
          <div className="mb-1 text-[11px] tracking-[0.5px] text-ink-mute">VACCINATION</div>
          <h1 className="font-serif text-[24px] font-medium text-ink">예방접종 · 검진</h1>
        </div>

        {/* Tab switcher */}
        <div className="mb-5 flex gap-1 rounded-[12px] border border-line bg-card p-1">
          <TabButton
            active={tab === "schedule"}
            onClick={() => setTab("schedule")}
            icon="calendar"
            label="일정 보기"
          />
          <TabButton
            active={tab === "ai"}
            onClick={() => setTab("ai")}
            icon="sparkle"
            label="AI 기록 입력"
          />
        </div>

        {/* Tab content */}
        {tab === "ai" ? (
          <AIInputTab
            childId={activeChild.id}
            childBirth={activeChild.birth}
            onSaved={handleSaved}
          />
        ) : (
          <ScheduleTab
            childId={activeChild.id}
            birthDate={activeChild.birth}
          />
        )}
      </PageWrap>
      <BottomNav />
    </>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-[9px] py-2.5 text-[13px] transition ${
        active ? "bg-ink font-semibold text-white" : "text-ink-soft hover:text-ink"
      }`}
    >
      <Icon name={icon} size={14} color={active ? "#fff" : "#8B8377"} />
      {label}
    </button>
  );
}
