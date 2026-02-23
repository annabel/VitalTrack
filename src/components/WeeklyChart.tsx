import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DayEntry } from '../types/health';

interface Props {
  entries: DayEntry[];
  dataKey: keyof Omit<DayEntry, 'date' | 'weight'>;
  color: string;
  label: string;
  unit?: string;
}

export default function WeeklyChart({ entries, dataKey, color, label, unit }: Props) {
  const data = entries.map(e => ({
    day: new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
    value: e[dataKey] as number,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-600 mb-4">{label} — Last 7 Days</h3>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
            formatter={(v: number | undefined) => [`${v}${unit ? ' ' + unit : ''}`, label]}
          />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#grad-${dataKey})`} dot={{ fill: color, r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
