import { useState } from 'react';
import {
  Activity, Droplets, Moon, Weight, Flame, Dumbbell,
  LayoutDashboard, Settings, ChevronRight, Target,
} from 'lucide-react';
import { useHealthData } from './hooks/useHealthData';
import MetricCard from './components/MetricCard';
import WeeklyChart from './components/WeeklyChart';
import NumberInput from './components/NumberInput';
import type { HealthGoals } from './types/health';

type Page = 'dashboard' | 'log' | 'settings';

const NAV = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'log' as Page, label: 'Log Today', icon: Activity },
  { id: 'settings' as Page, label: 'Goals', icon: Target },
];

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const { todayEntry, last7Days, goals, setGoals, updateToday } = useHealthData();
  const [draftGoals, setDraftGoals] = useState<HealthGoals>(goals);

  const pct = (v: number, g: number) => Math.round((v / g) * 100);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col py-6 px-4 gap-1 shrink-0">
        <div className="flex items-center gap-2 px-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-bold text-gray-800 text-lg">VitalTrack</span>
        </div>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full text-left ${
              page === id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            <Icon size={18} />
            {label}
            {page === id && <ChevronRight size={14} className="ml-auto" />}
          </button>
        ))}
        <div className="mt-auto px-2">
          <button
            onClick={() => setPage('settings')}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Settings size={14} /> Settings
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        {page === 'dashboard' && <DashboardPage todayEntry={todayEntry} last7Days={last7Days} goals={goals} pct={pct} />}
        {page === 'log' && <LogPage todayEntry={todayEntry} goals={goals} updateToday={updateToday} pct={pct} />}
        {page === 'settings' && (
          <GoalsPage
            draftGoals={draftGoals}
            setDraftGoals={setDraftGoals}
            onSave={() => { setGoals(draftGoals); setPage('dashboard'); }}
          />
        )}
      </main>
    </div>
  );
}

/* ── Dashboard ─────────────────────────────────────────────────── */
function DashboardPage({ todayEntry, last7Days, goals, pct }: {
  todayEntry: ReturnType<typeof useHealthData>['todayEntry'];
  last7Days: ReturnType<typeof useHealthData>['last7Days'];
  goals: HealthGoals;
  pct: (v: number, g: number) => number;
}) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Good {greeting()}, Athlete! 👋</h1>
        <p className="text-sm text-gray-500 mt-0.5">{today}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="Steps" value={todayEntry.steps}
          icon={<Activity size={16} />}
          bgColor="bg-blue-50" iconColor="text-blue-500" barColor="bg-blue-500"
          progress={pct(todayEntry.steps, goals.steps)}
          goal={`${goals.steps.toLocaleString()} steps`}
        />
        <MetricCard
          label="Water" value={todayEntry.waterGlasses}
          icon={<Droplets size={16} />}
          bgColor="bg-cyan-50" iconColor="text-cyan-500" barColor="bg-cyan-500"
          progress={pct(todayEntry.waterGlasses, goals.waterGlasses)}
          unit="glasses" goal={`${goals.waterGlasses} glasses`}
        />
        <MetricCard
          label="Sleep" value={todayEntry.sleepHours}
          icon={<Moon size={16} />}
          bgColor="bg-indigo-50" iconColor="text-indigo-500" barColor="bg-indigo-500"
          progress={pct(todayEntry.sleepHours, goals.sleepHours)}
          unit="hrs" goal={`${goals.sleepHours} hrs`}
        />
        <MetricCard
          label="Calories" value={todayEntry.calories}
          icon={<Flame size={16} />}
          bgColor="bg-orange-50" iconColor="text-orange-500" barColor="bg-orange-500"
          progress={pct(todayEntry.calories, goals.calories)}
          unit="kcal" goal={`${goals.calories.toLocaleString()} kcal`}
        />
        <MetricCard
          label="Workout" value={todayEntry.workoutMinutes}
          icon={<Dumbbell size={16} />}
          bgColor="bg-green-50" iconColor="text-green-500" barColor="bg-green-500"
          progress={pct(todayEntry.workoutMinutes, goals.workoutMinutes)}
          unit="min" goal={`${goals.workoutMinutes} min`}
        />
        {todayEntry.weight !== null && (
          <MetricCard
            label="Weight" value={todayEntry.weight ?? '—'}
            icon={<Weight size={16} />}
            bgColor="bg-purple-50" iconColor="text-purple-500" barColor="bg-purple-300"
            unit="kg"
          />
        )}
      </div>

      {/* Weekly charts */}
      <h2 className="text-base font-semibold text-gray-700 -mb-2">Weekly Trends</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WeeklyChart entries={last7Days} dataKey="steps" color="#3b82f6" label="Steps" />
        <WeeklyChart entries={last7Days} dataKey="waterGlasses" color="#06b6d4" label="Water" unit="glasses" />
        <WeeklyChart entries={last7Days} dataKey="sleepHours" color="#6366f1" label="Sleep" unit="hrs" />
        <WeeklyChart entries={last7Days} dataKey="calories" color="#f97316" label="Calories" unit="kcal" />
      </div>
    </div>
  );
}

/* ── Log Today ─────────────────────────────────────────────────── */
function LogPage({ todayEntry, goals, updateToday, pct }: {
  todayEntry: ReturnType<typeof useHealthData>['todayEntry'];
  goals: HealthGoals;
  updateToday: (u: Partial<typeof todayEntry>) => void;
  pct: (v: number, g: number) => number;
}) {
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Log Today's Activity</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track your health metrics for today</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-6">
        {/* Steps */}
        <LogRow
          label="Steps" icon={<Activity size={18} className="text-blue-500" />}
          progress={pct(todayEntry.steps, goals.steps)} barColor="bg-blue-500"
          caption={`${todayEntry.steps.toLocaleString()} / ${goals.steps.toLocaleString()}`}
        >
          <NumberInput label="" value={todayEntry.steps} step={500} max={100000}
            onChange={v => updateToday({ steps: v })} accentColor="bg-blue-500" />
        </LogRow>

        {/* Water */}
        <LogRow
          label="Water Intake" icon={<Droplets size={18} className="text-cyan-500" />}
          progress={pct(todayEntry.waterGlasses, goals.waterGlasses)} barColor="bg-cyan-500"
          caption={`${todayEntry.waterGlasses} / ${goals.waterGlasses} glasses`}
        >
          <NumberInput label="" value={todayEntry.waterGlasses} max={20} unit="glasses"
            onChange={v => updateToday({ waterGlasses: v })} accentColor="bg-cyan-500" />
        </LogRow>

        {/* Sleep */}
        <LogRow
          label="Sleep" icon={<Moon size={18} className="text-indigo-500" />}
          progress={pct(todayEntry.sleepHours, goals.sleepHours)} barColor="bg-indigo-500"
          caption={`${todayEntry.sleepHours} / ${goals.sleepHours} hrs`}
        >
          <NumberInput label="" value={todayEntry.sleepHours} max={24} step={0.5} unit="hrs"
            onChange={v => updateToday({ sleepHours: v })} accentColor="bg-indigo-500" />
        </LogRow>

        {/* Calories */}
        <LogRow
          label="Calories" icon={<Flame size={18} className="text-orange-500" />}
          progress={pct(todayEntry.calories, goals.calories)} barColor="bg-orange-500"
          caption={`${todayEntry.calories.toLocaleString()} / ${goals.calories.toLocaleString()} kcal`}
        >
          <NumberInput label="" value={todayEntry.calories} step={50} max={9999} unit="kcal"
            onChange={v => updateToday({ calories: v })} accentColor="bg-orange-500" />
        </LogRow>

        {/* Workout */}
        <LogRow
          label="Workout" icon={<Dumbbell size={18} className="text-green-500" />}
          progress={pct(todayEntry.workoutMinutes, goals.workoutMinutes)} barColor="bg-green-500"
          caption={`${todayEntry.workoutMinutes} / ${goals.workoutMinutes} min`}
        >
          <NumberInput label="" value={todayEntry.workoutMinutes} max={300} unit="min"
            onChange={v => updateToday({ workoutMinutes: v })} accentColor="bg-green-500" />
        </LogRow>

        {/* Weight (optional) */}
        <LogRow
          label="Weight (optional)" icon={<Weight size={18} className="text-purple-500" />}
          caption={todayEntry.weight !== null ? `${todayEntry.weight} kg` : 'Not logged'}
        >
          <NumberInput label="" value={todayEntry.weight ?? 0} step={0.1} max={300} unit="kg"
            onChange={v => updateToday({ weight: v > 0 ? v : null })} accentColor="bg-purple-500" />
        </LogRow>
      </div>
    </div>
  );
}

function LogRow({ label, icon, children, progress, barColor, caption }: {
  label: string; icon: React.ReactNode; children: React.ReactNode;
  progress?: number; barColor?: string; caption?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-semibold text-gray-700">{label}</span>
        {caption && <span className="ml-auto text-xs text-gray-400">{caption}</span>}
      </div>
      {progress !== undefined && barColor && (
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      )}
      {children}
    </div>
  );
}

/* ── Goals Settings ────────────────────────────────────────────── */
function GoalsPage({ draftGoals, setDraftGoals, onSave }: {
  draftGoals: HealthGoals;
  setDraftGoals: (g: HealthGoals) => void;
  onSave: () => void;
}) {
  const set = (k: keyof HealthGoals, v: number) => setDraftGoals({ ...draftGoals, [k]: v });
  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Your Goals</h1>
        <p className="text-sm text-gray-500 mt-0.5">Customise your daily targets</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-6">
        <NumberInput label="Daily Steps" value={draftGoals.steps} step={500} max={50000}
          onChange={v => set('steps', v)} accentColor="bg-blue-500" />
        <NumberInput label="Water Glasses" value={draftGoals.waterGlasses} max={30} unit="glasses"
          onChange={v => set('waterGlasses', v)} accentColor="bg-cyan-500" />
        <NumberInput label="Sleep Hours" value={draftGoals.sleepHours} step={0.5} max={12} unit="hrs"
          onChange={v => set('sleepHours', v)} accentColor="bg-indigo-500" />
        <NumberInput label="Calories" value={draftGoals.calories} step={100} max={5000} unit="kcal"
          onChange={v => set('calories', v)} accentColor="bg-orange-500" />
        <NumberInput label="Workout Minutes" value={draftGoals.workoutMinutes} max={180} unit="min"
          onChange={v => set('workoutMinutes', v)} accentColor="bg-green-500" />
      </div>
      <button
        onClick={onSave}
        className="self-start px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
      >
        Save Goals
      </button>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
