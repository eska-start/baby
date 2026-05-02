"use client";

import { Icon } from "@/components/Icon";
import type { ComputedVaccineItem } from "@/types/vaccination";
import { formatDate } from "@/lib/data";

const STATUS_CONFIG = {
  completed: { dot: "bg-good", label: "완료", badge: "bg-good-soft text-good" },
  upcoming: { dot: "bg-[#F59E0B]", label: "임박", badge: "bg-warn-soft text-warn" },
  overdue: { dot: "bg-[#EF4444]", label: "누락", badge: "bg-[#FEE2E2] text-[#EF4444]" },
  scheduled: { dot: "bg-ink-mute", label: "예정", badge: "bg-bg text-ink-mute" },
};

function DDayChip({ item }: { item: ComputedVaccineItem }) {
  if (item.status === "completed") {
    return (
      <span className="ko-num rounded-full bg-good-soft px-2 py-0.5 text-[10px] font-semibold text-good">
        완료
      </span>
    );
  }
  if (item.status === "overdue") {
    return (
      <span className="ko-num rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[10px] font-semibold text-[#EF4444]">
        D+{Math.abs(item.dDays)}
      </span>
    );
  }
  if (item.dDays === 0) {
    return (
      <span className="rounded-full bg-warn-soft px-2 py-0.5 text-[10px] font-semibold text-warn">
        오늘
      </span>
    );
  }
  if (item.dDays > 0) {
    return (
      <span className="ko-num rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">
        D-{item.dDays}
      </span>
    );
  }
  return null;
}

type Props = {
  item: ComputedVaccineItem;
  onMarkDone?: (item: ComputedVaccineItem) => void;
};

export function VaccineCard({ item, onMarkDone }: Props) {
  const cfg = STATUS_CONFIG[item.status];

  return (
    <div
      className={`flex items-center justify-between rounded-[12px] border border-line px-4 py-3 ${
        item.status === "completed" ? "bg-bg/60" : "bg-card"
      } ${item.status === "overdue" ? "border-[#EF4444]/30" : ""} ${
        item.status === "upcoming" ? "border-[#F59E0B]/30" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`h-2 w-2 flex-shrink-0 rounded-full ${cfg.dot}`} />
        <div>
          <div className={`text-[13px] font-medium ${item.status === "completed" ? "text-ink-soft" : "text-ink"}`}>
            {item.displayName} {item.doseNumber}차
          </div>
          <div className="mt-0.5 text-[11px] text-ink-mute">
            {item.status === "completed" && item.completedDate ? (
              <span className="ko-num">{formatDate(item.completedDate)}{item.hospital ? ` · ${item.hospital}` : ""}</span>
            ) : (
              <span className="ko-num">{item.doseLabel} · {formatDate(item.dueDate)}까지</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <DDayChip item={item} />
        {item.status !== "completed" && onMarkDone && (
          <button
            onClick={() => onMarkDone(item)}
            className="flex h-6 w-6 items-center justify-center rounded-[6px] border border-line bg-bg transition hover:border-good hover:bg-good-soft"
            title="완료 처리"
          >
            <Icon name="check" size={11} color="#8B8377" strokeWidth={2.4} />
          </button>
        )}
      </div>
    </div>
  );
}

type GroupCardProps = {
  vaccineGroup: string;
  displayName: string;
  items: ComputedVaccineItem[];
  onMarkDone?: (item: ComputedVaccineItem) => void;
};

export function VaccineGroupCard({ vaccineGroup, displayName, items, onMarkDone }: GroupCardProps) {
  const completedCount = items.filter((i) => i.status === "completed").length;
  const hasOverdue = items.some((i) => i.status === "overdue");
  const hasUpcoming = items.some((i) => i.status === "upcoming");

  const borderColor = hasOverdue
    ? "border-[#EF4444]/20"
    : hasUpcoming
    ? "border-[#F59E0B]/20"
    : "border-line";

  return (
    <div className={`rounded-[18px] border ${borderColor} bg-card p-5`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-ink">{displayName}</span>
          {hasOverdue && (
            <span className="rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[10px] font-semibold text-[#EF4444]">
              누락
            </span>
          )}
          {!hasOverdue && hasUpcoming && (
            <span className="rounded-full bg-warn-soft px-2 py-0.5 text-[10px] font-semibold text-warn">
              임박
            </span>
          )}
        </div>
        <span className="text-[11px] text-ink-mute ko-num">
          {completedCount}/{items.length}완료
        </span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <VaccineCard key={`${item.vaccineGroup}-${item.doseNumber}`} item={item} onMarkDone={onMarkDone} />
        ))}
      </div>
    </div>
  );
}
