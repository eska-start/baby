"use client";

import type { ComputedVaccineItem } from "@/types/vaccination";
import { VACCINE_SCHEDULE, TIMELINE_MILESTONES } from "@/lib/vaccineSchedule";
import { ageInMonths } from "@/lib/vaccineParser";

const STATUS_DOT: Record<string, string> = {
  completed: "bg-good border-good",
  upcoming: "bg-[#F59E0B] border-[#F59E0B]",
  overdue: "bg-[#EF4444] border-[#EF4444]",
  scheduled: "bg-bg border-line-strong",
};

type Props = {
  birthDate: string;
  items: ComputedVaccineItem[];
};

export function TimelineView({ birthDate, items }: Props) {
  const currentAgeMonths = ageInMonths(birthDate);

  const grouped = new Map<number, ComputedVaccineItem[]>();
  for (const item of items) {
    const schedule = VACCINE_SCHEDULE.find((s) => s.vaccineGroup === item.vaccineGroup);
    const dose = schedule?.doses.find((d) => d.doseNumber === item.doseNumber);
    if (!dose) continue;
    const bucket = TIMELINE_MILESTONES.reduce((prev, curr) =>
      Math.abs(curr - dose.ageMonthMin) < Math.abs(prev - dose.ageMonthMin) ? curr : prev
    );
    const arr = grouped.get(bucket) ?? [];
    arr.push(item);
    grouped.set(bucket, arr);
  }

  const milestones = TIMELINE_MILESTONES.filter((m) => grouped.has(m));

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-4 bottom-4 w-px bg-line" />

      <div className="space-y-6">
        {milestones.map((month) => {
          const milestoneItems = grouped.get(month) ?? [];
          const isPast = month < currentAgeMonths;
          const isCurrent = month <= currentAgeMonths && (TIMELINE_MILESTONES[TIMELINE_MILESTONES.indexOf(month) + 1] ?? 9999) > currentAgeMonths;

          const milestoneLabel =
            month === 0
              ? "출생"
              : month < 12
              ? `생후 ${month}개월`
              : month < 24
              ? `생후 ${month}개월 (만 1세)`
              : month % 12 === 0
              ? `만 ${month / 12}세`
              : `생후 ${month}개월`;

          return (
            <div key={month} className="flex gap-4">
              {/* Timeline node */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
                    isCurrent
                      ? "border-accent bg-accent text-white"
                      : isPast
                      ? "border-line bg-bg text-ink-mute"
                      : "border-line bg-card text-ink-mute"
                  }`}
                >
                  {month < 12 ? `${month}M` : `${Math.floor(month / 12)}Y`}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <div className={`mb-2 text-[12px] font-semibold ${isCurrent ? "text-accent" : "text-ink-soft"}`}>
                  {milestoneLabel}
                  {isCurrent && (
                    <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">
                      현재
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {milestoneItems.map((item) => (
                    <span
                      key={`${item.vaccineGroup}-${item.doseNumber}`}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                        item.status === "completed"
                          ? "border-good/30 bg-good-soft text-good"
                          : item.status === "overdue"
                          ? "border-[#EF4444]/30 bg-[#FEE2E2] text-[#EF4444]"
                          : item.status === "upcoming"
                          ? "border-[#F59E0B]/30 bg-warn-soft text-warn"
                          : "border-line bg-bg text-ink-mute"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[item.status]}`}
                      />
                      {item.vaccineGroup} {item.doseNumber}차
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-4">
        {[
          { color: "bg-good", label: "완료" },
          { color: "bg-[#F59E0B]", label: "임박 (2주 이내)" },
          { color: "bg-[#EF4444]", label: "누락" },
          { color: "bg-ink-mute", label: "예정" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${color}`} />
            <span className="text-[11px] text-ink-mute">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
