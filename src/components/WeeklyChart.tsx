import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DayEntry } from '../types/health';

interface Props {
  entries: DayEntry[];
  dataKey: keyof Omit<DayEntry, 'date' | 'weight'>;
  color: string;
  label: string;
  unit?: string;
  isDark?: boolean;
}

export default function WeeklyChart({ entries, dataKey, color, label, unit, isDark = false }: Props) {
  const data = entries.map(e => ({
    day: new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
    value: e[dataKey] as number,
  }));

  const gridColor = isDark ? '#374151' : '#f0f0f0';
  const tickColor = isDark ? '#6b7280' : '#9ca3af';
  const tooltipStyle = isDark
    ? { borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', fontSize: 12, backgroundColor: '#1f2937', color: '#f3f4f6' }
    : { borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">{label} — Last 7 Days</h3>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v: number | undefined) => [`${v}${unit ? ' ' + unit : ''}`, label]}
          />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#grad-${dataKey})`} dot={{ fill: color, r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
