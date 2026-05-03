import type { VaccineScheduleItem } from '@/types/vaccination';

export const VACCINE_SCHEDULE: VaccineScheduleItem[] = [
  {
    vaccineGroup: 'BCG',
    displayName: 'BCG (결핵)',
    type: 'vaccination',
    doses: [
      { doseNumber: 1, ageMonthMin: 1, ageMonthMax: 1, label: '생후 4주 이내' },
    ],
    isRequired: true,
  },
  {
    vaccineGroup: 'B형간염',
    displayName: 'B형간염',
    type: 'vaccination',
    doses: [
      { doseNumber: 1, ageMonthMin: 0, ageMonthMax: 0, label: '출생 직후' },
      { doseNumber: 2, ageMonthMin: 1, ageMonthMax: 1, label: '생후 1개월' },
      { doseNumber: 3, ageMonthMin: 6, ageMonthMax: 6, label: '생후 6개월' },
    ],
    isRequired: true,
  },
  {
    vaccineGroup: 'DTaP',
    displayName: 'DTaP (디프테리아·파상풍·백일해)',
    type: 'vaccination',
    doses: [
      { doseNumber: 1, ageMonthMin: 2, ageMonthMax: 2, label: '생후 2개월' },
      { doseNumber: 2, ageMonthMin: 4, ageMonthMax: 4, label: '생후 4개월' },
      { doseNumber: 3, ageMonthMin: 6, ageMonthMax: 6, label: '생후 6개월' },
      { doseNumber: 4, ageMonthMin: 15, ageMonthMax: 18, label: '생후 15~18개월' },
      { doseNumber: 5, ageMonthMin: 48, ageMonthMax: 83, label: '만 4~6세' },
    ],
    isRequired: true,
  },
  {
    vaccineGroup: 'Tdap',
    displayName: 'Tdap (파상풍·디프테리아·백일해 추가)',
    type: 'vaccination',
    doses: [
      { doseNumber: 1, ageMonthMin: 132, ageMonthMax: 155, label: '만 11~12세' },
    ],
    isRequired: true,
  },
  {
    vaccineGroup: '폴리오',
    displayName: '폴리오 (IPV)',
    type: 'vaccination',
    doses: [
      { doseNumber: 1, ageMonthMin: 2, ageMonthMax: 2, label: '생후 2개월' },
      { doseNumber: 2, ageMonthMin: 4, ageMonthMax: 4, label: '생후 4개월' },
      { doseNumber: 3, ageMonthMin: 6, ageMonthMax: 18, label: '생후 6~18개월' },
      { doseNumber: 4, ageMonthMin: 48, ageMonthMax: 83, label: '만 4~6세' },
    ],
    isRequired: true,
  },
  {
    vaccineGroup: 'Hib',
    displayName: 'Hib (뇌수막염)',
    type: 'vaccination',
    doses: [
      { doseNumber: 1, ageMonthMin: 2, ageMonthMax: 2, label: '생후 2개월' },
      { doseNumber: 2, ageMonthMin: 4, ageMonthMax: 4, label: '생후 4개월' },
      { doseNumber: 3, ageMonthMin: 6, ageMonthMax: 6, label: '생후 6개월' },
      { doseNumber: 4, ageMonthMin: 12, ageMonthMax: 15, label: '생후 12~15개월' },
    ],
    isRequired: true,
  },
  {
    vaccineGroup: 'PCV',
    displayName: 'PCV (폐렴구균)',
    type: 'vaccination',
    doses: [
      { doseNumber: 1, ageMonthMin: 2, ageMonthMax: 2, label: '생후 2개월' },
      { doseNumber: 2, ageMonthMin: 4, ageMonthMax: 4, label: '생후 4개월' },
      { doseNumber: 3, ageMonthMin: 6, ageMonthMax: 6, label: '생후 6개월' },
      { doseNumber: 4, ageMonthMin: 12, ageMonthMax: 15, label: '생후 12~15개월' },
    ],
    isRequired: true,
  },
  {
    vaccineGroup: '로타바이러스(로타릭스)',
    displayName: '로타바이러스 (로타릭스)',
    type: 'vaccination',
    doses: [
      { doseNumber: 1, ageMonthMin: 2, ageMonthMax: 2, label: '생후 2개월' },
      { doseNumber: 2, ageMonthMin: 4, ageMonthMax: 4, label: '생후 4개월' },
    ],
    isRequired: false,
  },
  {
    vaccineGroup: '로타바이러스(로타텍)',
    displayName: '로타바이러스 (로타텍)',
    type: 'vaccination',
    doses: [
      { doseNumber: 1, ageMonthMin: 2, ageMonthMax: 2, label: '생후 2개월' },
      { doseNumber: 2, ageMonthMin: 4, ageMonthMax: 4, label: '생후 4개월' },
      { doseNumber: 3, ageMonthMin: 6, ageMonthMax: 6, label: '생후 6개월' },
    ],
    isRequired: false,
  },
  {
    vaccineGroup: 'MMR',
    displayName: 'MMR (홍역·볼거리·풍진)',
    type: 'vaccination',
    doses: [
      { doseNumber: 1, ageMonthMin: 12, ageMonthMax: 15, label: '생후 12~15개월' },
      { doseNumber: 2, ageMonthMin: 48, ageMonthMax: 83, label: '만 4~6세' },
    ],
    isRequired: true,
  },
  {
    vaccineGroup: '수두',
    displayName: '수두',
    type: 'vaccination',
    doses: [
      { doseNumber: 1, ageMonthMin: 12, ageMonthMax: 15, label: '생후 12~15개월' },
    ],
    isRequired: true,
  },
  {
    vaccineGroup: 'A형간염',
    displayName: 'A형간염',
    type: 'vaccination',
    doses: [
      { doseNumber: 1, ageMonthMin: 12, ageMonthMax: 23, label: '생후 12~23개월' },
      { doseNumber: 2, ageMonthMin: 18, ageMonthMax: 35, label: '1차 후 6~18개월' },
    ],
    isRequired: true,
  },
  {
    vaccineGroup: '일본뇌염(사백신)',
    displayName: '일본뇌염 (사백신)',
    type: 'vaccination',
    doses: [
      { doseNumber: 1, ageMonthMin: 12, ageMonthMax: 12, label: '생후 12개월' },
      { doseNumber: 2, ageMonthMin: 13, ageMonthMax: 13, label: '1차 후 7~30일' },
      { doseNumber: 3, ageMonthMin: 24, ageMonthMax: 24, label: '생후 24개월' },
      { doseNumber: 4, ageMonthMin: 72, ageMonthMax: 72, label: '만 6세' },
      { doseNumber: 5, ageMonthMin: 144, ageMonthMax: 144, label: '만 12세' },
    ],
    isRequired: true,
  },
  {
    vaccineGroup: '일본뇌염(생백신)',
    displayName: '일본뇌염 (생백신)',
    type: 'vaccination',
    doses: [
      { doseNumber: 1, ageMonthMin: 12, ageMonthMax: 23, label: '생후 12~23개월' },
      { doseNumber: 2, ageMonthMin: 24, ageMonthMax: 35, label: '생후 24~35개월' },
    ],
    isRequired: true,
  },
  {
    vaccineGroup: 'HPV',
    displayName: 'HPV (인유두종바이러스)',
    type: 'vaccination',
    doses: [
      { doseNumber: 1, ageMonthMin: 144, ageMonthMax: 155, label: '만 12세 (1~2차)' },
    ],
    isRequired: true,
  },
  {
    vaccineGroup: '인플루엔자',
    displayName: '인플루엔자',
    type: 'vaccination',
    doses: [
      { doseNumber: 1, ageMonthMin: 6, ageMonthMax: 71, label: '생후 6개월~만 5세 (매년)' },
    ],
    isRequired: false,
  },
  {
    vaccineGroup: '영유아검진',
    displayName: '영유아 건강검진',
    type: 'checkup',
    doses: [
      { doseNumber: 1, ageMonthMin: 0, ageMonthMax: 1, label: '1차 (생후 14~35일)' },
      { doseNumber: 2, ageMonthMin: 4, ageMonthMax: 6, label: '2차 (생후 4~6개월)' },
      { doseNumber: 3, ageMonthMin: 9, ageMonthMax: 12, label: '3차 (생후 9~12개월)' },
      { doseNumber: 4, ageMonthMin: 18, ageMonthMax: 24, label: '4차 (생후 18~24개월)' },
      { doseNumber: 5, ageMonthMin: 30, ageMonthMax: 36, label: '5차 (생후 30~36개월)' },
      { doseNumber: 6, ageMonthMin: 42, ageMonthMax: 48, label: '6차 (생후 42~48개월)' },
      { doseNumber: 7, ageMonthMin: 54, ageMonthMax: 60, label: '7차 (생후 54~60개월)' },
      { doseNumber: 8, ageMonthMin: 66, ageMonthMax: 71, label: '8차 (생후 66~71개월)' },
    ],
    isRequired: true,
  },
  {
    vaccineGroup: '구강검진',
    displayName: '영유아 구강검진',
    type: 'checkup',
    doses: [
      { doseNumber: 1, ageMonthMin: 18, ageMonthMax: 29, label: '1차 (생후 18~29개월)' },
      { doseNumber: 2, ageMonthMin: 30, ageMonthMax: 41, label: '2차 (생후 30~41개월)' },
      { doseNumber: 3, ageMonthMin: 42, ageMonthMax: 53, label: '3차 (생후 42~53개월)' },
      { doseNumber: 4, ageMonthMin: 54, ageMonthMax: 65, label: '4차 (생후 54~65개월)' },
    ],
    isRequired: true,
  },
];

export const TIMELINE_MILESTONES = [0, 1, 2, 4, 6, 9, 12, 15, 18, 24, 36, 48, 60, 72, 132];
