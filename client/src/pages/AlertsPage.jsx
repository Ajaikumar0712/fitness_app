import { useState, useEffect } from 'react';
import { getAlerts, markAlertRead, markAllRead, deleteAlertAPI } from '../services/api';
import { formatDate, formatTime } from '../utils/health';
import { BellRing, CheckCheck, Trash2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const SEV_CONFIG = {
  High:     { icon: AlertTriangle, color:'text-danger',  bg:'bg-danger/5',   border:'border-danger/20',  badge:'bg-danger/15 text-danger border-danger/30', dot:'bg-danger'  },
  Moderate: { icon: AlertCircle,   color:'text-warning', bg:'bg-warning/5',  border:'border-warning/20', badge:'bg-warning/15 text-warning border-warning/30',dot:'bg-warning' },
  Low:      { icon: Info,          color:'text-info',    bg:'bg-info/5',     border:'border-info/20',    badge:'bg-info/15 text-info border-info/30',       dot:'bg-info'    },
};

const METRIC_DISPLAY = {
  heartRate:'Heart Rate', systolicBP:'Systolic BP', diastolicBP:'Diastolic BP',
  bmi:'BMI', sleepDuration:'Sleep Duration', spo2:'Blood Oxygen (SpO2)', hydration:'Hydration',
};

const METRIC_UNIT = {
  heartRate:'bpm', systolicBP:'mmHg', diastolicBP:'mmHg',
  bmi:'kg/m²', sleepDuration:'hrs', spo2:'%', hydration:'L',
};

export default function AlertsPage() {
  const [alerts,     setAlerts]     = useState([]);
  const [unread,     setUnread]     = useState(0);
  const [filter,     setFilter]     = useState('All');
  const [loading,    setLoading]    = useState(true);

  const load = () => {
    getAlerts().then(r => { setAlerts(r.data.alerts); setUnread(r.data.unreadCount); })
               .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRead = async (id) => {
    await markAlertRead(id);
    setAlerts(prev => prev.map(a => a._id === id ? {...a, isRead:true} : a));
    setUnread(u => Math.max(0, u-1));
  };

  const handleReadAll = async () => {
    await markAllRead();
    setAlerts(prev => prev.map(a => ({...a, isRead:true})));
    setUnread(0);
    toast.success('All alerts marked as read');
  };

  const handleDelete = async (id, alert) => {
    await deleteAlertAPI(id);
    setAlerts(prev => prev.filter(a => a._id !== id));
    if (!alert.isRead) setUnread(u => Math.max(0, u-1));
    toast.success('Alert removed');
  };

  const filtered = filter === 'All' ? alerts : alerts.filter(a => a.severity === filter);
  const counts = { All: alerts.length, High: alerts.filter(a=>a.severity==='High').length,
    Moderate: alerts.filter(a=>a.severity==='Moderate').length, Low: alerts.filter(a=>a.severity==='Low').length };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Health Alerts</h1>
          {unread > 0 && <p className="text-sm text-slate-400 mt-1">{unread} unread alert{unread > 1 ? 's' : ''}</p>}
        </div>
        <div className="flex gap-2">
          {unread > 0 && (
            <button onClick={handleReadAll} className="btn-ghost text-sm">
              <CheckCheck size={16}/> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['All','High','Moderate','Low'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border
              ${filter === f
                ? f==='High'?'bg-danger/15 text-danger border-danger/30':
                  f==='Moderate'?'bg-warning/15 text-warning border-warning/30':
                  f==='Low'?'bg-info/15 text-info border-info/30':
                  'bg-primary/15 text-primary border-primary/30'
                : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/15'}`}>
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_,i) => <div key={i} className="skeleton h-24 rounded-2xl"/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <BellRing size={48} className="mx-auto text-success mb-4"/>
          <p className="text-slate-300 text-lg font-semibold">
            {filter === 'All' ? "You're in great health! 💚" : `No ${filter.toLowerCase()} alerts`}
          </p>
          <p className="text-slate-500 text-sm mt-1">Keep logging your metrics to get real-time health insights.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => {
            const cfg = SEV_CONFIG[alert.severity] || SEV_CONFIG.Low;
            const Icon = cfg.icon;
            return (
              <div key={alert._id}
                className={`card border ${cfg.border} ${cfg.bg} ${!alert.isRead ? 'ring-1 ring-white/10' : 'opacity-80'} transition-all`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg} border ${cfg.border}`}>
                    <Icon size={20} className={cfg.color}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${cfg.badge}`}>
                        {alert.severity}
                      </span>
                      <span className="font-semibold text-slate-200">
                        {METRIC_DISPLAY[alert.metricType] || alert.metricType}
                      </span>
                      {!alert.isRead && <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`}/>}
                    </div>
                    <p className={`text-lg font-bold ${cfg.color} mb-1`}>
                      {alert.value} <span className="text-sm font-normal">{METRIC_UNIT[alert.metricType]}</span>
                    </p>
                    <p className="text-sm text-slate-300 mb-2">{alert.message}</p>
                    <p className="text-xs text-slate-500">{formatDate(alert.createdAt)} at {formatTime(alert.createdAt)}</p>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {!alert.isRead && (
                      <button onClick={() => handleRead(alert._id)}
                        className="text-xs text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1">
                        <CheckCheck size={12}/> Read
                      </button>
                    )}
                    <button onClick={() => handleDelete(alert._id, alert)}
                      className="text-xs text-slate-500 hover:text-danger px-2.5 py-1.5 rounded-lg hover:bg-danger/10 transition-all flex items-center gap-1">
                      <Trash2 size={12}/> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
