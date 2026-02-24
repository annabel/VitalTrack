import { useState } from 'react';

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  accentColor?: string;
}

export default function NumberInput({ label, value, onChange, min = 0, max = 99999, step = 1, unit, accentColor = 'bg-blue-500' }: Props) {
  const [input, setInput] = useState(value.toString());

  const commit = (raw: string) => {
    const n = parseFloat(raw);
    if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
    setInput(isNaN(n) ? '0' : String(Math.min(max, Math.max(min, n))));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => { const v = Math.max(min, value - step); onChange(v); setInput(v.toString()); }}
          className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold text-lg transition-colors flex items-center justify-center"
        >−</button>
        <input
          type="number"
          value={input}
          min={min}
          max={max}
          step={step}
          onFocus={() => setInput(value.toString())}
          onChange={e => setInput(e.target.value)}
          onBlur={e => commit(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && commit(input)}
          className="w-24 text-center border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-2 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 transition"
        />
        <button
          onClick={() => { const v = Math.min(max, value + step); onChange(v); setInput(v.toString()); }}
          className={`w-9 h-9 rounded-xl ${accentColor} hover:opacity-90 text-white font-bold text-lg transition-opacity flex items-center justify-center`}
        >+</button>
        {unit && <span className="text-sm text-gray-400 dark:text-gray-500">{unit}</span>}
      </div>
    </div>
  );
}
