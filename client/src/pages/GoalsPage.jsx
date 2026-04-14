import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createGoal, getGoals, updateGoalStatus, deleteGoal } from '../services/api';
import { formatDate } from '../utils/health';
import { Plus, Target, Trash2, CheckCircle, Pause, X } from 'lucide-react';
import toast from 'react-hot-toast';

const GOAL_TYPES = [
  { type:'Weight Loss',       unit:'kg',       icon:'⚖️'  },
  { type:'Weight Gain',       unit:'kg',       icon:'💪'  },
  { type:'Daily Step Count',  unit:'steps',    icon:'👣'  },
  { type:'Active Minutes',    unit:'min/day',  icon:'⏱️'  },
  { type:'Weekly Workouts',   unit:'sessions', icon:'🏋️'  },
  { type:'Sleep Duration',    unit:'hrs/night',icon:'💤'  },
  { type:'Daily Hydration',   unit:'litres',   icon:'💧'  },
  { type:'Calorie Deficit',   unit:'kcal/day', icon:'🔥'  },
  { type:'Resting Heart Rate',unit:'bpm',      icon:'❤️'  },
];

function ProgressRing({ pct, size=64, stroke=6, color='#00D4AA' }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;
  const c = size / 2;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}/>
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" className="ring-progress"/>
    </svg>
  );
}

const STATUS_CONFIG = {
  Active:   { color:'text-primary',   bg:'bg-primary/10',   border:'border-primary/20'   },
  Achieved: { color:'text-success',   bg:'bg-success/10',   border:'border-success/20'   },
  Overdue:  { color:'text-danger',    bg:'bg-danger/10',    border:'border-danger/20'    },
  Paused:   { color:'text-slate-400', bg:'bg-white/5',      border:'border-white/10'     },
};

export default function GoalsPage() {
  const { register, handleSubmit, reset, formState:{ isSubmitting } } = useForm();
  const [goals,    setGoals]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selType,  setSelType]  = useState(GOAL_TYPES[0]);

  useEffect(() => {
    getGoals().then(r => setGoals(r.data)).finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data) => {
    const today = new Date();
    const end = new Date(data.endDate);
    if (end <= today) { toast.error('End date must be in the future'); return; }
    try {
      const res = await createGoal({ ...data, type: selType.type, unit: selType.unit, targetValue: parseFloat(data.targetValue) });
      setGoals(prev => [res.data, ...prev]);
      toast.success('Goal created! 🎯');
      reset(); setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed'); }
  };

  const handleStatus = async (id, status) => {
    await updateGoalStatus(id, status);
    setGoals(prev => prev.map(g => g._id === id ? { ...g, status } : g));
    toast.success(`Goal ${status.toLowerCase()}`);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete goal?')) return;
    await deleteGoal(id);
    setGoals(prev => prev.filter(g => g._id !== id));
  };

  const activeGoals    = goals.filter(g => g.status === 'Active');
  const achievedGoals  = goals.filter(g => g.status === 'Achieved');
  const overdueGoals   = goals.filter(g => g.status === 'Overdue');
  const pausedGoals    = goals.filter(g => g.status === 'Paused');

  const ringColor = (g) => {
    const pct = g.targetValue > 0 ? (g.currentValue / g.targetValue) * 100 : 0;
    if (g.status === 'Achieved') return '#10B981';
    if (g.status === 'Overdue')  return '#EF4444';
    if (pct >= 75) return '#10B981';
    if (pct >= 40) return '#00D4AA';
    return '#F97316';
  };

  const GoalCard = ({ goal }) => {
    const pct = goal.targetValue > 0 ? Math.min((goal.currentValue / goal.targetValue) * 100, 100) : 0;
    const sc = STATUS_CONFIG[goal.status];
    const gt = GOAL_TYPES.find(t => t.type === goal.type);
    const daysLeft = Math.ceil((new Date(goal.endDate) - Date.now()) / 86400000);
    return (
      <div className={`card border ${sc.border} flex flex-col gap-3`}>
        <div className="flex items-start justify-between">
          <div>
            <span className="text-2xl">{gt?.icon || '🎯'}</span>
            <h3 className="font-semibold text-slate-100 mt-1">{goal.type}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {goal.currentValue} / {goal.targetValue} {goal.unit}
            </p>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.color} border ${sc.border}`}>
            {goal.status}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <ProgressRing pct={pct} color={ringColor(goal)}/>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-100">
              {Math.round(pct)}%
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width:`${pct}%`, background: ringColor(goal) }}/>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              {goal.status === 'Active' ? (daysLeft > 0 ? `${daysLeft} days left` : 'Due today!') :
               goal.status === 'Overdue' ? `Ended ${formatDate(goal.endDate)}` :
               goal.status === 'Achieved' ? '🎉 Achieved!' : 'Paused'}
            </p>
          </div>
        </div>

        {goal.status === 'Active' && (
          <div className="flex gap-2 pt-1 border-t border-white/5">
            <button onClick={() => handleStatus(goal._id, 'Achieved')}
              className="flex items-center gap-1 text-xs text-success hover:bg-success/10 px-2 py-1 rounded-lg transition-all">
              <CheckCircle size={13}/> Mark Done
            </button>
            <button onClick={() => handleStatus(goal._id, 'Paused')}
              className="flex items-center gap-1 text-xs text-slate-400 hover:bg-white/10 px-2 py-1 rounded-lg transition-all">
              <Pause size={13}/> Pause
            </button>
            <button onClick={() => handleDelete(goal._id)}
              className="flex items-center gap-1 text-xs text-danger/70 hover:text-danger hover:bg-danger/10 px-2 py-1 rounded-lg transition-all ml-auto">
              <Trash2 size={13}/>
            </button>
          </div>
        )}
        {(goal.status === 'Achieved' || goal.status === 'Overdue' || goal.status === 'Paused') && (
          <button onClick={() => handleDelete(goal._id)} className="flex items-center gap-1 text-xs text-slate-600 hover:text-danger transition-colors ml-auto">
            <Trash2 size={13}/> Delete
          </button>
        )}
      </div>
    );
  };

  const Section = ({ title, list, color }) => list.length > 0 && (
    <div>
      <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${color}`}>{title} ({list.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(g => <GoalCard key={g._id} goal={g}/>)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Fitness Goals</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={18}/> New Goal
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">{Array(3).fill(0).map((_,i) => <div key={i} className="skeleton h-48 rounded-2xl"/>)}</div>
      ) : goals.length === 0 ? (
        <div className="card text-center py-16">
          <Target size={48} className="mx-auto text-slate-600 mb-4"/>
          <p className="text-slate-400 text-lg font-semibold">No goals yet</p>
          <p className="text-slate-500 text-sm mt-1 mb-6">Set your first SMART fitness goal to start tracking progress!</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mx-auto">
            <Plus size={18}/> Create First Goal
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <Section title="🎯 Active Goals"    list={activeGoals}   color="text-primary"/>
          <Section title="✅ Achieved Goals"  list={achievedGoals} color="text-success"/>
          <Section title="⚠ Overdue Goals"   list={overdueGoals}  color="text-danger"/>
          <Section title="⏸ Paused Goals"    list={pausedGoals}   color="text-slate-400"/>
        </div>
      )}

      {/* Create Goal Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="font-display font-bold text-lg text-slate-100">Create New Goal</h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost !px-2 !py-2"><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
              <div>
                <label className="label">Goal Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {GOAL_TYPES.map(t => (
                    <button key={t.type} type="button" onClick={() => setSelType(t)}
                      className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border text-xs font-medium transition-all
                        ${selType.type === t.type ? 'border-primary bg-primary/10 text-primary' : 'border-white/5 bg-white/3 text-slate-400 hover:border-white/20'}`}>
                      <span className="text-lg">{t.icon}</span>
                      <span className="text-center leading-tight">{t.type}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Target Value ({selType.unit})</label>
                  <input type="number" step="0.1" min="0" required {...register('targetValue')} className="input" placeholder="e.g. 5"/>
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input type="date" required {...register('endDate')} className="input"
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}/>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
                  {isSubmitting ? <span className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin"/> : <Target size={16}/>}
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
