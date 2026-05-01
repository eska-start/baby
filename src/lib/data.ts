export type GrowthRecord = {
  date: string; // YYYY-MM-DD
  height: number; // cm
  weight: number; // kg
  note?: string;
};

export const CHILD = {
  name: "이서율",
  birth: "2021-01-15",
  gender: "여" as const,
  ageLabel: "5세 3개월",
  emojiBg: "#F4B393",
};

export const GROWTH_RECORDS: GrowthRecord[] = [
  { date: "2025-10-04", height: 108.2, weight: 17.4, note: "가을 검진 직후" },
  { date: "2025-11-08", height: 109.0, weight: 17.7 },
  { date: "2025-12-06", height: 109.6, weight: 18.1, note: "감기 회복 후" },
  { date: "2026-01-10", height: 110.4, weight: 18.4 },
  { date: "2026-02-14", height: 111.0, weight: 18.7, note: "이유식 졸업" },
  { date: "2026-03-15", height: 111.5, weight: 18.9 },
  { date: "2026-04-01", height: 111.8, weight: 18.9 },
  { date: "2026-04-30", height: 112.4, weight: 19.2, note: "봄소풍 전 검진" },
];

export type Vaccine = {
  name: string;
  dueDate: string;
  status: "done" | "upcoming" | "overdue";
  round?: string;
};

export const VACCINES: Vaccine[] = [
  { name: "MMR", round: "2차", dueDate: "2026-05-12", status: "upcoming" },
  { name: "일본뇌염 (사백신)", round: "4차", dueDate: "2026-06-04", status: "upcoming" },
  { name: "DTaP", round: "5차", dueDate: "2026-04-10", status: "done" },
  { name: "수두", round: "1차", dueDate: "2025-07-22", status: "done" },
  { name: "독감", round: "연 1회", dueDate: "2025-10-18", status: "done" },
];

export type Checkup = {
  title: string;
  windowStart: string;
  windowEnd: string;
  status: "done" | "upcoming";
  detail?: string;
};

export const CHECKUPS: Checkup[] = [
  { title: "영유아 건강검진 5차", windowStart: "2024-06-01", windowEnd: "2024-12-31", status: "done", detail: "양호 · 2024.08.12 시행" },
  { title: "영유아 건강검진 6차", windowStart: "2026-05-25", windowEnd: "2026-12-15", status: "upcoming", detail: "54-60개월 구간" },
  { title: "구강검진 3차", windowStart: "2026-08-01", windowEnd: "2026-11-30", status: "upcoming" },
];

export function bmi(heightCm: number, weightKg: number) {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function bmiCategory(value: number): { label: string; color: string; bg: string } {
  if (value < 14) return { label: "저체중", color: "#5478A1", bg: "#DDE8F2" };
  if (value < 17) return { label: "정상 범위", color: "#5C7A5C", bg: "#E5EFE3" };
  if (value < 18.5) return { label: "과체중", color: "#C49B3A", bg: "#F5EAC4" };
  return { label: "비만", color: "#C26B5A", bg: "#F4D5CD" };
}

export function diff(curr: number, prev: number, digits = 1) {
  const d = curr - prev;
  const sign = d > 0 ? "+" : d < 0 ? "−" : "±";
  return `${sign}${Math.abs(d).toFixed(digits)}`;
}

export function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${y}. ${Number(m)}. ${Number(day)}`;
}

export function shortDate(d: string) {
  const [, m, day] = d.split("-");
  return `${Number(m)}/${Number(day)}`;
}

export function calcAgeLabel(birth: string): string {
  const b = new Date(birth);
  const now = new Date();
  const months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (months < 1) return "신생아";
  if (months < 24) return `${months}개월`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}세 ${rem}개월` : `${years}세`;
}

export function todayLabel(): string {
  const d = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()} (${days[d.getDay()]})`;
}
