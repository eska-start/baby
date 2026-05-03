import type { VaccinationRecord, ComputedVaccineItem, VaccineScheduleItem } from '@/types/vaccination';
import { VACCINE_SCHEDULE } from './vaccineSchedule';

const VAX_KEY = (childId: string) => `ai-gyeol-vax-${childId}`;

export function loadVaxRecords(childId: string): VaccinationRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const s = localStorage.getItem(VAX_KEY(childId));
    return s ? (JSON.parse(s) as VaccinationRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveVaxRecords(childId: string, records: VaccinationRecord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VAX_KEY(childId), JSON.stringify(records));
}

export function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function windowEnd(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months + 1);
  d.setDate(d.getDate() - 1);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function ageInMonths(birthStr: string): number {
  const birth = new Date(birthStr);
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12;
  months += now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months--;
  return Math.max(0, months);
}

function dDays(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function computeSchedule(
  birthDate: string,
  records: VaccinationRecord[],
  filter: 'all' | 'vaccination' | 'checkup' = 'all',
  hideDone = false
): ComputedVaccineItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const items: ComputedVaccineItem[] = [];

  const scheduleItems: VaccineScheduleItem[] =
    filter === 'all'
      ? VACCINE_SCHEDULE
      : VACCINE_SCHEDULE.filter((s) => s.type === filter);

  for (const schedule of scheduleItems) {
    for (const dose of schedule.doses) {
      const dueDate = addMonths(birthDate, dose.ageMonthMin);
      const displayEndDate = windowEnd(birthDate, dose.ageMonthMax);
      const dueDateEnd = addMonths(birthDate, dose.ageMonthMax + 1);
      const isRange = dose.ageMonthMin !== dose.ageMonthMax;
      const dd = dDays(dueDate);

      const completed = records.find(
        (r) =>
          r.vaccineGroup === schedule.vaccineGroup &&
          r.doseNumber === dose.doseNumber &&
          r.status === 'completed'
      );

      let status: ComputedVaccineItem['status'];
      if (completed) {
        status = 'completed';
      } else {
        const dueDateEndDate = new Date(dueDateEnd);
        if (today > dueDateEndDate) {
          status = 'overdue';
        } else if (dd <= 14) {
          status = 'upcoming';
        } else {
          status = 'scheduled';
        }
      }

      if (hideDone && status === 'completed') continue;

      items.push({
        vaccineGroup: schedule.vaccineGroup,
        displayName: schedule.displayName,
        type: schedule.type,
        doseNumber: dose.doseNumber,
        doseLabel: dose.label,
        status,
        completedDate: completed?.completedDate,
        dueDate,
        dueDateEnd,
        displayEndDate,
        isRange,
        dDays: dd,
        hospital: completed?.hospital,
        isRequired: schedule.isRequired,
      });
    }
  }

  return items;
}

export function summarize(items: ComputedVaccineItem[]) {
  return {
    overdue: items.filter((i) => i.status === 'overdue').length,
    upcoming: items.filter((i) => i.status === 'upcoming').length,
    scheduled: items.filter((i) => i.status === 'scheduled').length,
    completed: items.filter((i) => i.status === 'completed').length,
  };
}

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}
