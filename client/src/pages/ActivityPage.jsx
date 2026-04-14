import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { logActivity, getActivities, deleteActivity, getWeeklyActivity } from '../services/api';
import { useAuth } from '../context/AuthContext';
import WeeklyChart from '../components/dashboard/WeeklyChart';
import { calcCaloriesBurned } from '../utils/health';
import { formatDate, formatTime } from '../utils/health';
import { Plus, Trash2, Flame, Clock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const ACTIVITIES = [
  { type:'Walking',       emoji:'🚶', met:3.5 },
  { type:'Running',       emoji:'🏃', met:8.0 },
  { type:'Cycling',       emoji:'🚴', met:6.0 },
  { type:'Swimming',      emoji:'🏊', met:7.0 },
  { type:'Yoga',          emoji:'🧘', met:2.5 },
  { type:'WeightTraining',emoji:'🏋️', met:5.0 },
  { type:'HIIT',          emoji:'⚡', met:8.5 },
  { type:'Dancing',       emoji:'💃', met:4.5 },
  { type:'Badminton',     emoji:'🏸', met:5.5 },
  { type:'Cricket',       emoji:'🏏', met:4.8 },
];

export default function ActivityPage() {
  const { user } = useAuth();
  const { register, handleSubmit, watch, setValue, reset, formState:{ isSubmitting } } = useForm({
    defaultValues: { type:'Running', durationMinutes:30, intensity:'Moderate' }
  });
  const [activities, setActivities] = useState([]);
  const [weekly,     setWeekly]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selType,    setSelType]    = useState('Running');

  const duration = watch('durationMinutes');
  const previewCals = calcCaloriesBurned(selType, user?.weight, parseFloat(duration) || 0);

  useEffect(() => {
    Promise.all([getActivities(), getWeeklyActivity()])
      .then(([a, w]) => { setActivities(a.data); setWeekly(w.data); })
      .finally(() => setLoading(false));
  }, []);

  const selectType = (type) => { setSelType(type); setValue('type', type); };

  const onSubmit = async (data) => {
    try {
      const res = await logActivity({ ...data, type: selType, durationMinutes: parseInt(data.durationMinutes) });
      setActivities(prev => [res.data, ...prev]);
      // refresh weekly
      getWeeklyActivity().then(r => setWeekly(r.data));
      toast.success(`Activity logged! 🔥 ${res.data.caloriesBurned} kcal burned`);
      reset({ type: selType, durationMinutes: 30, intensity: 'Moderate' });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to log');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete activity?')) return;
    await deleteActivity(id);
    setActivities(prev => prev.filter(a => a._id !== id));
    toast.success('Deleted');
  };

  const weeklyStats = {
    totalMins: activities.filter(a => {
      const d = new Date(a.loggedAt); const now = new Date();
      return (now - d) < 7 * 86400000;
    }).reduce((s, a) => s + a.durationMinutes, 0),
    totalCals: activities.filter(a => (Date.now() - new Date(a.loggedAt)) < 7*86400000)
                         .reduce((s, a) => s + a.caloriesBurned, 0),
    sessions:  activities.filter(a => (Date.now() - new Date(a.loggedAt)) < 7*86400000).length,
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="page-title">Physical Activity Tracker</h1>

      {/* Weekly stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'Active This Week', val:`${weeklyStats.totalMins} min`, icon:Clock,  color:'text-primary'   },
          { label:'Calories Burned',  val:`${weeklyStats.totalCals} kcal`,icon:Flame,  color:'text-warning'   },
          { label:'Sessions',         val:weeklyStats.sessions,            icon:Zap,    color:'text-secondary' },
        ].map(s => (
          <div key={s.label} className="card-hover flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${s.color}`}>
              <s.icon size={20}/>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider">{s.label}</p>
              <p className="text-xl font-bold text-slate-100">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log Form */}
        <div className="lg:col-span-2 card">
          <p className="section-title">Log Activity</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Activity Type Grid */}
            <div>
              <label className="label">Activity Type</label>
              <div className="grid grid-cols-5 gap-2">
                {ACTIVITIES.map(a => (
                  <button
                    key={a.type} type="button"
                    onClick={() => selectType(a.type)}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition-all text-xs font-medium
                      ${selType === a.type
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-white/5 bg-white/3 text-slate-400 hover:border-white/20 hover:bg-white/5'}`}
                  >
                    <span className="text-2xl">{a.emoji}</span>
                    <span className="text-center leading-tight">{a.type}</span>
                    <span className="text-slate-500 text-xs">{a.met} MET</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Duration (minutes)</label>
                <input type="number" min="1" max="600" {...register('durationMinutes')} className="input" />
              </div>
              <div>
                <label className="label">Distance (km, optional)</label>
                <input type="number" step="0.1" min="0" {...register('distance')} placeholder="0.0" className="input" />
              </div>
            </div>

            <div>
              <label className="label">Intensity</label>
              <div className="flex gap-2">
                {['Low','Moderate','High'].map(i => (
                  <label key={i} className="flex-1">
                    <input type="radio" value={i} {...register('intensity')} className="hidden peer" />
                    <div className="peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary border border-white/10 rounded-xl py-2.5 text-center text-sm font-medium text-slate-400 cursor-pointer hover:border-white/20 transition-all">
                      {i === 'Low' ? '🟢' : i === 'Moderate' ? '🟡' : '🔴'} {i}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Calorie preview */}
            <div className="bg-warning/5 border border-warning/20 rounded-xl px-4 py-3 flex items-center gap-3">
              <Flame size={20} className="text-warning" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Estimated Calories Burned</p>
                <p className="text-2xl font-bold text-warning">{previewCals} <span className="text-sm font-normal text-slate-400">kcal</span></p>
              </div>
              <p className="text-xs text-slate-500 ml-auto">MET × weight × time</p>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
              {isSubmitting ? <span className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin"/> : <Plus size={18}/>}
              {isSubmitting ? 'Logging...' : 'Log Activity'}
            </button>
          </form>
        </div>

        {/* Weekly Chart */}
        <div className="card">
          <p className="section-title">This Week</p>
          <WeeklyChart data={weekly} />
          <p className="text-xs text-slate-500 mt-3 text-center">🟢 Green = met 30-min WHO goal</p>
        </div>
      </div>

      {/* Activity History */}
      <div className="card">
        <p className="section-title">Activity History</p>
        {loading ? <div className="skeleton h-40 rounded-xl"/> : activities.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No activities logged yet. Start moving! 💪</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-white/5">
                  {['Date & Time','Activity','Duration','Intensity','Calories',''].map(h => (
                    <th key={h} className="text-left py-3 px-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activities.map(a => {
                  const act = ACTIVITIES.find(x => x.type === a.type);
                  return (
                    <tr key={a._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="py-3 px-3 text-slate-400 text-xs">{formatDate(a.loggedAt)}<br/>{formatTime(a.loggedAt)}</td>
                      <td className="py-3 px-3 font-medium">{act?.emoji} {a.type}</td>
                      <td className="py-3 px-3">{a.durationMinutes} min</td>
                      <td className="py-3 px-3">
                        <span className={`badge text-xs px-2 py-0.5 rounded-full font-semibold
                          ${a.intensity==='High'?'bg-danger/10 text-danger':a.intensity==='Moderate'?'bg-warning/10 text-warning':'bg-success/10 text-success'}`}>
                          {a.intensity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-warning font-semibold">🔥 {a.caloriesBurned}</td>
                      <td className="py-3 px-3">
                        <button onClick={() => handleDelete(a._id)} className="text-slate-600 hover:text-danger transition-colors">
                          <Trash2 size={15}/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
