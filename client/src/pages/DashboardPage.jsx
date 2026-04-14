import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import HealthCard from '../components/dashboard/HealthCard';
import MetricChart from '../components/dashboard/MetricChart';
import BMIGauge from '../components/dashboard/BMIGauge';
import WeeklyChart from '../components/dashboard/WeeklyChart';
import { getLatestMetric, getMetrics, getWeeklyActivity, getGoals, getTodayDiet } from '../services/api';
import { calcDailyCaloricNeed } from '../utils/health';
import { Heart, Activity, Droplets, Moon, Wind, Weight, Target, Flame } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const { user }  = useAuth();
  const [latest,  setLatest]  = useState(null);
  const [history, setHistory] = useState([]);
  const [weekly,  setWeekly]  = useState([]);
  const [goals,   setGoals]   = useState([]);
  const [diet,    setDiet]    = useState({ totals: { calories:0, protein:0, carbs:0, fat:0 } });
  const [loading, setLoading] = useState(true);
  const [selMetric, setSelMetric] = useState('heartRate');

  useEffect(() => {
    Promise.all([
      getLatestMetric(),
      getMetrics({ limit: 14 }),
      getWeeklyActivity(),
      getGoals(),
      getTodayDiet(),
    ]).then(([l, h, w, g, d]) => {
      setLatest(l.data);
      setHistory(h.data);
      setWeekly(w.data);
      setGoals(g.data.filter(g => g.status === 'Active').slice(0, 3));
      setDiet(d.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const dailyCal = calcDailyCaloricNeed(user);

  const macroData = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [{ data: [diet.totals.protein, diet.totals.carbs, diet.totals.fat],
      backgroundColor: ['#10B981','#6366F1','#F97316'],
      borderWidth: 0, hoverOffset: 4 }],
  };

  const metricOptions = [
    { key: 'heartRate', label: 'Heart Rate' },
    { key: 'systolicBP', label: 'Systolic BP' },
    { key: 'bmi', label: 'BMI' },
    { key: 'sleepDuration', label: 'Sleep' },
    { key: 'spo2', label: 'SpO2' },
    { key: 'hydration', label: 'Hydration' },
  ];

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Metric Cards */}
      <div>
        <h2 className="page-title mb-4">Dashboard</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <HealthCard label="Heart Rate"  value={latest?.heartRate}    unit="bpm"   metric="heartRate"    icon={Heart}    />
          <HealthCard label="Systolic BP" value={latest?.systolicBP}   unit="mmHg"  metric="systolicBP"   icon={Activity} />
          <HealthCard label="BMI"         value={latest?.bmi}          unit="kg/m²" metric="bmi"          icon={Weight}   />
          <HealthCard label="Sleep"       value={latest?.sleepDuration}unit="hrs"   metric="sleepDuration" icon={Moon}     />
          <HealthCard label="SpO2"        value={latest?.spo2}         unit="%"     metric="spo2"         icon={Wind}     />
          <HealthCard label="Hydration"   value={latest?.hydration}    unit="L"     metric="hydration"    icon={Droplets} />
          <HealthCard label="Calories Today" value={diet.totals.calories} unit="kcal" icon={Flame} />
          <HealthCard label="Active Goals"   value={goals.length}         unit="goals" icon={Target} />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <p className="section-title mb-0">Health Trend</p>
            <select
              value={selMetric}
              onChange={e => setSelMetric(e.target.value)}
              className="input !w-auto !py-1.5 text-sm"
            >
              {metricOptions.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </div>
          <MetricChart data={history} metric={selMetric} />
        </div>
        <BMIGauge bmi={latest?.bmi} />
      </div>

      {/* Activity + Goals + Nutrition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Activity */}
        <div className="card">
          <p className="section-title">Weekly Activity</p>
          <WeeklyChart data={weekly} />
          <div className="mt-3 flex gap-4 text-xs text-slate-400">
            <span><span className="text-primary">●</span> ≥30 min goal</span>
            <span><span className="text-secondary">●</span> Below goal</span>
          </div>
        </div>

        {/* Active Goals */}
        <div className="card">
          <p className="section-title">Active Goals</p>
          {goals.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No active goals. <br/>Set one on the Goals page!</p>
          ) : (
            <div className="space-y-3">
              {goals.map(goal => {
                const pct = goal.targetValue > 0 ? Math.min((goal.currentValue / goal.targetValue) * 100, 100).toFixed(0) : 0;
                const r = 20, circ = 2 * Math.PI * r;
                const offset = circ - (pct / 100) * circ;
                return (
                  <div key={goal._id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <svg viewBox="0 0 50 50" className="w-12 h-12 -rotate-90">
                        <circle cx="25" cy="25" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5"/>
                        <circle cx="25" cy="25" r={r} fill="none" stroke="#00D4AA" strokeWidth="5"
                          strokeDasharray={circ} strokeDashoffset={offset}
                          strokeLinecap="round" className="ring-progress"/>
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-100">{pct}%</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{goal.type}</p>
                      <p className="text-xs text-slate-500">{goal.currentValue} / {goal.targetValue} {goal.unit}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Nutrition Summary */}
        <div className="card">
          <p className="section-title">Today's Nutrition</p>
          <div className="relative h-32">
            <Doughnut data={macroData} options={{
              cutout: '70%', responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw}g` } } }
            }}/>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-xl font-bold text-slate-100">{diet.totals.calories}</span>
              <span className="text-xs text-slate-400">kcal</span>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            {[
              { label: 'Protein', val: diet.totals.protein, color: 'text-success' },
              { label: 'Carbs',   val: diet.totals.carbs,   color: 'text-secondary' },
              { label: 'Fat',     val: diet.totals.fat,     color: 'text-warning' },
            ].map(m => (
              <div key={m.label}>
                <p className={`font-bold ${m.color}`}>{Math.round(m.val)}g</p>
                <p className="text-slate-500">{m.label}</p>
              </div>
            ))}
          </div>
          {/* Calorie bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>{diet.totals.calories} kcal consumed</span>
              <span>{dailyCal} kcal goal</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${Math.min((diet.totals.calories / dailyCal) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
