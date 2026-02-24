interface Props {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  barColor: string;
  progress?: number;
  unit?: string;
  goal?: string;
}

export default function MetricCard({ label, value, icon, bgColor, iconColor, barColor, progress, unit, goal }: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <span className={`p-2 rounded-xl ${bgColor} ${iconColor}`}>{icon}</span>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value.toLocaleString()}</span>
        {unit && <span className="text-sm text-gray-400 dark:text-gray-500 mb-1">{unit}</span>}
      </div>
      {goal && <span className="text-xs text-gray-400 dark:text-gray-500">Goal: {goal}</span>}
      {progress !== undefined && (
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
