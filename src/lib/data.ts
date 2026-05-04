export type GrowthRecord = {
  date: string; // YYYY-MM-DD
  height: number; // cm
  weight: number; // kg
  note?: string;
};

export const GROWTH_RECORDS: GrowthRecord[] = [];

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
  { title: "영유아 건강검진 1차", windowStart: "2021-07-01", windowEnd: "2021-08-31", status: "done", detail: "생후 14~35일" },
  { title: "영유아 건강검진 2차", windowStart: "2021-11-01", windowEnd: "2022-03-31", status: "done", detail: "생후 4~6개월" },
  { title: "영유아 건강검진 3차", windowStart: "2022-04-01", windowEnd: "2022-08-31", status: "done", detail: "생후 9~12개월" },
  { title: "영유아 건강검진 4차", windowStart: "2022-09-01", windowEnd: "2023-03-31", status: "done", detail: "생후 18~24개월" },
  { title: "영유아 구강검진 1차", windowStart: "2022-09-01", windowEnd: "2023-03-31", status: "done", detail: "생후 18~29개월" },
  { title: "영유아 건강검진 5차", windowStart: "2023-03-01", windowEnd: "2023-10-31", status: "done", detail: "생후 30~36개월" },
  { title: "영유아 구강검진 2차", windowStart: "2023-03-01", windowEnd: "2023-10-31", status: "done", detail: "생후 30~41개월" },
  { title: "영유아 건강검진 6차", windowStart: "2024-01-01", windowEnd: "2024-08-31", status: "done", detail: "생후 42~48개월" },
  { title: "영유아 구강검진 3차", windowStart: "2024-01-01", windowEnd: "2024-08-31", status: "done", detail: "생후 42~53개월" },
  { title: "영유아 건강검진 7차", windowStart: "2025-01-01", windowEnd: "2025-08-31", status: "done", detail: "생후 54~60개월" },
  { title: "영유아 구강검진 4차", windowStart: "2025-01-01", windowEnd: "2025-08-31", status: "done", detail: "생후 54~65개월" },
  { title: "영유아 건강검진 8차", windowStart: "2026-01-01", windowEnd: "2026-08-31", status: "upcoming", detail: "생후 66~71개월" },
];

export function bmi(heightCm: number, weightKg: number) {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function bmiCategory(value: number): { label: string; color: string; bg: string } {
  if (value < 18.5) return { label: "저체중", color: "#5478A1", bg: "#DDE8F2" };
  if (value < 23) return { label: "정상 범위", color: "#5C7A5C", bg: "#E5EFE3" };
  if (value < 25) return { label: "과체중", color: "#C49B3A", bg: "#F5EAC4" };
  return { label: "비만", color: "#C26B5A", bg: "#F4D5CD" };
}

// 2017 Korean National Growth Chart BMI percentiles (P5, P85, P95)
// age in months → [P5, P85, P95]
const BMI_BOYS: [number, number, number, number][] = [
  [24,  13.97, 17.83, 19.06], [30,  13.73, 17.29, 18.44], [36,  13.57, 16.97, 18.08],
  [42,  13.43, 16.73, 17.82], [48,  13.29, 16.55, 17.63], [54,  13.15, 16.47, 17.54],
  [60,  13.04, 16.42, 17.50], [72,  12.95, 16.53, 17.72], [84,  12.97, 16.84, 18.17],
  [96,  13.14, 17.36, 18.93], [108, 13.46, 18.05, 19.87], [120, 13.82, 18.85, 20.96],
  [132, 14.23, 19.71, 22.06], [144, 14.69, 20.58, 23.09], [156, 15.18, 21.42, 24.00],
  [168, 15.71, 22.18, 24.77], [180, 16.22, 22.80, 25.35], [192, 16.63, 23.27, 25.73],
  [204, 16.93, 23.55, 25.95], [216, 17.11, 23.71, 26.06],
];
const BMI_GIRLS: [number, number, number, number][] = [
  [24,  13.68, 17.79, 19.16], [30,  13.47, 17.30, 18.59], [36,  13.33, 16.96, 18.18],
  [42,  13.19, 16.70, 17.90], [48,  13.07, 16.52, 17.73], [54,  12.97, 16.43, 17.65],
  [60,  12.89, 16.43, 17.69], [72,  12.83, 16.62, 18.02], [84,  12.91, 17.01, 18.62],
  [96,  13.13, 17.63, 19.48], [108, 13.50, 18.51, 20.67], [120, 13.92, 19.53, 21.98],
  [132, 14.39, 20.62, 23.28], [144, 14.89, 21.68, 24.44], [156, 15.41, 22.61, 25.39],
  [168, 15.96, 23.28, 26.07], [180, 16.51, 23.63, 26.43], [192, 16.99, 23.78, 26.56],
  [204, 17.37, 23.84, 26.55], [216, 17.61, 23.82, 26.49],
];

function interpBmi(table: [number, number, number, number][], ageMonths: number): [number, number, number] {
  const clamped = Math.max(table[0][0], Math.min(table[table.length - 1][0], ageMonths));
  let i = table.findIndex(([m]) => m >= clamped);
  if (i <= 0) i = 1;
  const [m0, p5a, p85a, p95a] = table[i - 1];
  const [m1, p5b, p85b, p95b] = table[i];
  const t = (clamped - m0) / (m1 - m0);
  return [p5a + t * (p5b - p5a), p85a + t * (p85b - p85a), p95a + t * (p95b - p95a)];
}

export function bmiCategoryKorean(
  value: number,
  ageMonths: number,
  gender: "남" | "여",
): { label: string; color: string; bg: string } {
  if (ageMonths < 24) return bmiCategory(value);
  const table = gender === "남" ? BMI_BOYS : BMI_GIRLS;
  const [p5, p85, p95] = interpBmi(table, ageMonths);
  if (value < p5)  return { label: "저체중", color: "#5478A1", bg: "#DDE8F2" };
  if (value < p85) return { label: "정상 범위", color: "#5C7A5C", bg: "#E5EFE3" };
  if (value < p95) return { label: "과체중", color: "#C49B3A", bg: "#F5EAC4" };
  return { label: "비만", color: "#C26B5A", bg: "#F4D5CD" };
}

export function calcAgeMonths(birth: string): number {
  const b = new Date(birth);
  const now = new Date();
  return (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
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

export function smartDate(d: string) {
  const [y, m, day] = d.split("-");
  const currentYear = new Date().getFullYear();
  const prefix = Number(y) !== currentYear ? `'${String(y).slice(2)} ` : "";
  return `${prefix}${Number(m)}/${Number(day)}`;
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
