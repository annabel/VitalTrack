import { useState } from 'react';
import { FileDown, Activity, Droplets, Moon, Flame, Dumbbell, Weight } from 'lucide-react';
import { useHealthData } from '../hooks/useHealthData';
import { exportVitalsPDF } from '../utils/exportPDF';

type Range = '7d' | '30d' | 'all';

const RANGE_LABELS: Record<Range, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  'all': 'All time',
};

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function isoNDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function VitalsSummaryPage() {
  const { last7Days, goals } = useHealthData();
  const [range, setRange] = useState<Range>('7d');
  const [exporting, setExporting] = useState(false);

  // Derive full entries list from localStorage for 30d / all
  const allEntries: import('../types/health').DayEntry[] = (() => {
    try {
      const raw = localStorage.getItem('health-tracker-entries');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();

  const fromDate =
    range === '7d' ? isoNDaysAgo(6) :
    range === '30d' ? isoNDaysAgo(29) :
    allEntries.length > 0
      ? allEntries.reduce((min, e) => (e.date < min ? e.date : min), isoToday())
      : isoToday();

  const toDate = isoToday();

  const filteredEntries = allEntries
    .filter(e => e.date >= fromDate && e.date <= toDate)
    .sort((a, b) => b.date.localeCompare(a.date));

  const displayEntries = range === '7d' ? [...last7Days].reverse() : filteredEntries;

  function fmtDate(iso: string) {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
  }

  function handleExport() {
    setExporting(true);
    try {
      exportVitalsPDF(displayEntries, goals, { from: fromDate, to: toDate });
    } finally {
      setExporting(false);
    }
  }

  const metrics: {
    key: keyof Omit<import('../types/health').DayEntry, 'date'>;
    label: string;
    unit: string;
    icon: React.ReactNode;
    iconColor: string;
  }[] = [
    { key: 'steps', label: 'Steps', unit: '', icon: <Activity size={14} />, iconColor: 'text-blue-500' },
    { key: 'waterGlasses', label: 'Water', unit: 'gl', icon: <Droplets size={14} />, iconColor: 'text-cyan-500' },
    { key: 'sleepHours', label: 'Sleep', unit: 'hrs', icon: <Moon size={14} />, iconColor: 'text-indigo-500' },
    { key: 'calories', label: 'Calories', unit: 'kcal', icon: <Flame size={14} />, iconColor: 'text-orange-500' },
    { key: 'workoutMinutes', label: 'Workout', unit: 'min', icon: <Dumbbell size={14} />, iconColor: 'text-green-500' },
    { key: 'weight', label: 'Weight', unit: 'kg', icon: <Weight size={14} />, iconColor: 'text-purple-500' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Vitals Summary</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {goals.patientName} · {fmtDate(fromDate)} – {fmtDate(toDate)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Range selector */}
          <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
            {(Object.keys(RANGE_LABELS) as Range[]).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  range === r
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {RANGE_LABELS[r]}
              </button>
            ))}
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={exporting || displayEntries.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
            aria-label="Export vitals summary as PDF"
          >
            <FileDown size={16} />
            {exporting ? 'Exporting…' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Table */}
      {displayEntries.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-10 text-center text-gray-400 dark:text-gray-600">
          No data recorded for this period. Start logging your vitals!
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Date
                </th>
                {metrics.map(m => (
                  <th
                    key={m.key}
                    className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                  >
                    <span className={`inline-flex items-center gap-1 ${m.iconColor}`}>
                      {m.icon}
                      {m.label}{m.unit ? ` (${m.unit})` : ''}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayEntries.map((entry, idx) => (
                <tr
                  key={entry.date}
                  className={`border-b border-gray-50 dark:border-gray-800/50 ${
                    idx % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-800/20'
                  }`}
                >
                  <td className="px-4 py-2.5 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {fmtDate(entry.date)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-400">
                    {entry.steps.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-400">
                    {entry.waterGlasses}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-400">
                    {entry.sleepHours}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-400">
                    {entry.calories.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-400">
                    {entry.workoutMinutes}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-400">
                    {entry.weight !== null ? entry.weight : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            {displayEntries.length > 1 && (
              <tfoot>
                <tr className="bg-blue-50/60 dark:bg-blue-950/30 border-t border-blue-100 dark:border-blue-900">
                  <td className="px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300">Avg</td>
                  {metrics.map(m => {
                    if (m.key === 'weight') {
                      return <td key={m.key} className="px-4 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-400">—</td>;
                    }
                    const vals = displayEntries.map(e => (e[m.key] as number) ?? 0);
                    const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
                    const formatted = m.key === 'steps' || m.key === 'calories'
                      ? Math.round(avg).toLocaleString()
                      : avg.toFixed(1);
                    return (
                      <td key={m.key} className="px-4 py-2.5 text-right tabular-nums font-semibold text-gray-600 dark:text-gray-400">
                        {formatted}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}
