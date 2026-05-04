export type VaccinationRecord = {
  id: string;
  childId: string;
  type: 'vaccination' | 'checkup';
  name: string;
  vaccineGroup: string;
  doseNumber: number;
  status: 'completed' | 'scheduled' | 'overdue' | 'upcoming';
  completedDate?: string;
  dueDate?: string;
  dueDateEnd?: string;
  hospital?: string;
  note?: string;
  aiConfidence?: 'high' | 'medium' | 'low';
};

export type VaccineDose = {
  doseNumber: number;
  ageMonthMin: number;
  ageMonthMax: number;
  label: string;
  showRange?: boolean;
};

export type VaccineScheduleItem = {
  vaccineGroup: string;
  displayName: string;
  type: 'vaccination' | 'checkup';
  doses: VaccineDose[];
  isRequired: boolean;
};

export type ParsedRecord = {
  name: string;
  vaccineGroup: string;
  doseNumber: number;
  status: 'completed' | 'scheduled';
  completedDate: string | null;
  hospital: string | null;
  confidence: 'high' | 'medium' | 'low';
  note: string | null;
};

export type AnalysisResult = {
  birthDate: string | null;
  records: ParsedRecord[];
};

export type ComputedVaccineItem = {
  vaccineGroup: string;
  displayName: string;
  type: 'vaccination' | 'checkup';
  doseNumber: number;
  doseLabel: string;
  status: 'completed' | 'overdue' | 'upcoming' | 'scheduled';
  completedDate?: string;
  dueDate: string;
  dueDateEnd: string;
  displayEndDate: string;
  isRange: boolean;
  dDays: number;
  hospital?: string;
  isRequired: boolean;
};
