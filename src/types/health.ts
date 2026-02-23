export interface DayEntry {
  date: string; // ISO date string YYYY-MM-DD
  steps: number;
  waterGlasses: number;
  sleepHours: number;
  weight: number | null;
  calories: number;
  workoutMinutes: number;
}

export type Metric = keyof Omit<DayEntry, 'date'>;

export interface HealthGoals {
  steps: number;
  waterGlasses: number;
  sleepHours: number;
  calories: number;
  workoutMinutes: number;
}
