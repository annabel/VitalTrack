import { useState, useEffect, useCallback } from 'react';
import type { DayEntry, HealthGoals } from '../types/health';

const STORAGE_KEY = 'health-tracker-entries';
const GOALS_KEY = 'health-tracker-goals';

const today = () => new Date().toISOString().slice(0, 10);

const defaultGoals: HealthGoals = {
  steps: 10000,
  waterGlasses: 8,
  sleepHours: 8,
  calories: 2000,
  workoutMinutes: 30,
};

function emptyEntry(date: string): DayEntry {
  return { date, steps: 0, waterGlasses: 0, sleepHours: 0, weight: null, calories: 0, workoutMinutes: 0 };
}

export function useHealthData() {
  const [entries, setEntries] = useState<DayEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [goals, setGoals] = useState<HealthGoals>(() => {
    try {
      const raw = localStorage.getItem(GOALS_KEY);
      return raw ? { ...defaultGoals, ...JSON.parse(raw) } : defaultGoals;
    } catch {
      return defaultGoals;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  }, [goals]);

  const todayEntry = entries.find(e => e.date === today()) ?? emptyEntry(today());

  const updateToday = useCallback((updates: Partial<Omit<DayEntry, 'date'>>) => {
    setEntries(prev => {
      const idx = prev.findIndex(e => e.date === today());
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...updates };
        return updated;
      }
      return [...prev, { ...emptyEntry(today()), ...updates }];
    });
  }, []);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    return entries.find(e => e.date === dateStr) ?? emptyEntry(dateStr);
  });

  return { todayEntry, last7Days, goals, setGoals, updateToday };
}
