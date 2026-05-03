"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { VaccineCard, VaccineGroupCard } from "./VaccineCard";
import { TimelineView } from "./TimelineView";
import { computeSchedule, summarize } from "@/lib/vaccineParser";
import { VACCINE_SCHEDULE } from "@/lib/vaccineSchedule";
import { useVaxRecords } from "@/hooks/useVaxRecords";
import type { ComputedVaccineItem } from "@/types/vaccination";

type Filter = "all" | "vaccination" | "checkup";
type View = "list" | "timeline" | "groups";

type Props = {
  childId: string;
  birthDate: string;
};

export function ScheduleTab({ childId, birthDate }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [hideDone, setHideDone] = useState(false);
  const [view, setView] = useState<View>("list");

  const { records, loading, markDone, undoDone } = useVaxRecords(childId);

  const items = computeSchedule(birthDate, records, filter, hideDone);
  const allItems = computeSchedule(birthDate, records, "all", false);
  const summary = summarize(allItems);

  const urgent = items.filter((i) => i.status === "overdue" || i.status === "upcoming");
  const scheduled = items.filter((i) => i.status === "scheduled");
  const done = items.filter((i) => i.status === "completed");

  const groups = VACCINE_SCHEDULE.filter(
    (s) => filter === "all" || s.type === filter
  ).map((s) => ({
    ...s,
    items: items.filter((i) => i.vaccineGroup === s.vaccineGroup),
  })).filter((g) => g.items.length > 0);

  const handleMarkDone = (item: ComputedVaccineItem) => {
    markDone(item.vaccineGroup, item.doseNumber, item.type, item.displayName);
  };

  const handleUndo = (item: ComputedVaccineItem) => {
    undoDone(item.vaccineGroup, item.doseNumber);
  };

  if (!birthDate) {
    return (
      <div className="rounded-[18px] border border-line bg-card p-8 text-center">
        <div className="text-[14px] font-semibold text-ink">생년월일을 먼저 설정해주세요</div>
        <div className="mt-1 text-[12px] text-ink-mute">설정 화면에서 아이 정보를 입력하면 맞춤 일정을 계산해드려요.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard color="#EF4444" bg="#FEE2E2" label="긴급" count={summary.overdue + summary.upcoming} />
        <SummaryCard color="#F59E0B" bg="#FEF3C7" label="예정" count={summary.scheduled} />
        <SummaryCard color="#10B981" bg="#D1FAE5" label="완료" count={summary.completed} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-[10px] border border-line bg-card p-1">
          {(["all", "vaccination", "checkup"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-[7px] px-3 py-1.5 text-[12px] transition ${filter === f ? "bg-ink text-white font-semibold" : "text-ink-soft"}`}
            >
              {f === "all" ? "전체" : f === "vaccination" ? "예방접종" : "건강검진"}
            </button>
          ))}
        </div>
        <button
          onClick={() => setHideDone((h) => !h)}
          className={`rounded-[10px] border px-3 py-1.5 text-[12px] transition ${hideDone ? "border-ink bg-ink text-white font-semibold" : "border-line bg-card text-ink-soft"}`}
        >
          완료 숨기기
        </button>
        <div className="ml-auto flex gap-1 rounded-[10px] border border-line bg-card p-1">
          {(["list", "groups", "timeline"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-[7px] px-3 py-1.5 text-[12px] transition ${view === v ? "bg-ink text-white font-semibold" : "text-ink-soft"}`}
            >
              {v === "list" ? "목록" : v === "groups" ? "그룹" : "타임라인"}
            </button>
          ))}
        </div>
      </div>

      {/* List view */}
      {view === "list" && (
        <div className="space-y-4">
          {urgent.length > 0 && (
            <section>
              <div className="mb-2 text-[11px] font-semibold tracking-[0.5px] text-[#EF4444]">긴급 · {urgent.length}건</div>
              <div className="space-y-2">
                {urgent.sort((a, b) => a.dDays - b.dDays).map((item) => (
                  <VaccineCard key={`${item.vaccineGroup}-${item.doseNumber}`} item={item} onMarkDone={handleMarkDone} />
                ))}
              </div>
            </section>
          )}
          {scheduled.length > 0 && (
            <section>
              <div className="mb-2 text-[11px] font-semibold tracking-[0.5px] text-ink-mute">예정 · {scheduled.length}건</div>
              <div className="space-y-2">
                {scheduled.sort((a, b) => a.dDays - b.dDays).map((item) => (
                  <VaccineCard key={`${item.vaccineGroup}-${item.doseNumber}`} item={item} onMarkDone={handleMarkDone} />
                ))}
              </div>
            </section>
          )}
          {!hideDone && done.length > 0 && (
            <section>
              <div className="mb-2 text-[11px] font-semibold tracking-[0.5px] text-ink-mute">완료 · {done.length}건</div>
              <div className="space-y-2">
                {done.map((item) => (
                  <VaccineCard key={`${item.vaccineGroup}-${item.doseNumber}`} item={item} onUndo={handleUndo} />
                ))}
              </div>
            </section>
          )}
          {items.length === 0 && (
            <div className="rounded-[18px] border border-line bg-card p-8 text-center">
              <div className="text-[14px] font-semibold text-ink">표시할 일정이 없어요</div>
              <div className="mt-1 text-[12px] text-ink-mute">필터를 변경하거나 완료 숨기기를 해제해보세요.</div>
            </div>
          )}
        </div>
      )}

      {/* Groups view */}
      {view === "groups" && (
        <div className="space-y-4">
          {groups.map((g) => (
            <VaccineGroupCard
              key={g.vaccineGroup}
              vaccineGroup={g.vaccineGroup}
              displayName={g.displayName}
              items={g.items}
              onMarkDone={handleMarkDone}
              onUndo={handleUndo}
            />
          ))}
        </div>
      )}

      {/* Timeline view */}
      {view === "timeline" && (
        <div className="rounded-[18px] border border-line bg-card p-5 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-accent-soft">
              <Icon name="calendar" size={14} color="#D77B50" />
            </div>
            <span className="text-[13px] font-semibold text-ink">월령별 타임라인</span>
          </div>
          <TimelineView birthDate={birthDate} items={computeSchedule(birthDate, records, filter, hideDone)} />
        </div>
      )}
    </div>
  );
}

function SummaryCard({ color, bg, label, count }: { color: string; bg: string; label: string; count: number }) {
  return (
    <div className="rounded-[14px] p-3.5 text-center" style={{ background: bg }}>
      <div className="ko-num text-[24px] font-bold leading-none" style={{ color }}>{count}</div>
      <div className="mt-1 text-[11px] font-medium" style={{ color }}>{label}</div>
    </div>
  );
}
