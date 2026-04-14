import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { logMetric, getMetrics, deleteMetricAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MetricChart from '../components/dashboard/MetricChart';
import BMIGauge from '../components/dashboard/BMIGauge';
import { calcBMI, classifyBMI, formatDate } from '../utils/health';
import { Plus, Trash2, Heart, Activity, Moon, Droplets, Wind, Weight } from 'lucide-react';
import toast from 'react-hot-toast';

const FIELDS = [
  { name:'heartRate',     label:'Heart Rate',       unit:'bpm',   icon:Heart,    placeholder:'72',  min:0, max:300, hint:'Normal: 60–100 bpm' },
  { name:'systolicBP',    label:'Systolic BP',       unit:'mmHg',  icon:Activity, placeholder:'118', min:0, max:300, hint:'Normal: 90–120 mmHg' },
  { name:'diastolicBP',   label:'Diastolic BP',      unit:'mmHg',  icon:Activity, placeholder:'76',  min:0, max:200, hint:'Normal: 60–80 mmHg' },
  { name:'weight',        label:'Weight',            unit:'kg',    icon:Weight,   placeholder:'70',  min:1, max:500, hint:'Your body weight' },
  { name:'sleepDuration', label:'Sleep Duration',    unit:'hrs',   icon:Moon,     placeholder:'7.5', min:0, max:24,  hint:'Recommended: 7–9 hrs' },
  { name:'hydration',     label:'Hydration',         unit:'L',     icon:Droplets, placeholder:'2.5', min:0, max:20,  hint:'Recommended: 2–3 litres' },
  { name:'spo2',          label:'Blood Oxygen (SpO2)',unit:'%',    icon:Wind,     placeholder:'98',  min:0, max:100, hint:'Normal: 95–100%' },
];

const METRIC_TABS = [
  { key:'heartRate', label:'Heart Rate' },
  { key:'systolicBP', label:'Blood Pressure' },
  { key:'bmi', label:'BMI' },
  { key:'sleepDuration', label:'Sleep' },
  { key:'spo2', label:'SpO2' },
  { key:'hydration', label:'Hydration' },
];

export default function HealthPage() {
  const { user } = useAuth();
  const { register, handleSubmit, reset, watch, formState:{ isSubmitting } } = useForm();
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('heartRate');

  const weightVal = watch('weight');
  const previewBMI = weightVal && user?.height ? calcBMI(parseFloat(weightVal), user.height) : null;
  const bmiCls = classifyBMI(previewBMI);

  useEffect(() => {
    getMetrics({ limit: 30 }).then(r => setMetrics(r.data)).finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data) => {
    const payload = {};
    Object.entries(data).forEach(([k, v]) => { if (v !== '' && v !== undefined) payload[k] = parseFloat(v); });
    if (Object.keys(payload).length === 0) { toast.error('Enter at least one metric'); return; }
    try {
      const res = await logMetric(payload);
      setMetrics(prev => [res.data, ...prev]);
      toast.success('Health metrics saved! 💚');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    await deleteMetricAPI(id);
    setMetrics(prev => prev.filter(m => m._id !== id));
    toast.success('Deleted');
  };

  const latestBMI = metrics[0]?.bmi;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Health Metrics</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <p className="section-title">Log Health Metrics</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FIELDS.map(f => (
                  <div key={f.name}>
                    <label className="label flex items-center gap-1.5">
                      <f.icon size={12}/> {f.label}
                    </label>
                    <div className="relative">
                      <input
                        type="number" step="0.1" min={f.min} max={f.max}
                        placeholder={f.placeholder}
                        {...register(f.name)}
                        className="input pr-14"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">{f.unit}</span>
                    </div>
                    <p className="text-slate-600 text-xs mt-1">{f.hint}</p>
                  </div>
                ))}
              </div>

              {/* BMI Preview */}
              {previewBMI && (
                <div className={`rounded-xl px-4 py-3 border flex items-center justify-between ${bmiCls.bg} ${bmiCls.border}`}>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">BMI Preview</p>
                    <p className={`text-2xl font-bold ${bmiCls.color}`}>{previewBMI} <span className="text-sm font-normal">kg/m²</span></p>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${bmiCls.bg} ${bmiCls.color}`}>{bmiCls.label}</span>
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
                {isSubmitting ? <span className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin"/> : <Plus size={18}/>}
                {isSubmitting ? 'Saving...' : 'Save Health Metrics'}
              </button>
            </form>
          </div>
        </div>

        {/* BMI Gauge */}
        <BMIGauge bmi={latestBMI} />
      </div>

      {/* Charts */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="section-title mb-0">Health Trends (Last 30 Days)</p>
        </div>
        <div className="flex gap-2 flex-wrap mb-4">
          {METRIC_TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === t.key ? 'bg-primary text-bg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <MetricChart data={metrics} metric={activeTab} />
      </div>

      {/* History Table */}
      <div className="card">
        <p className="section-title">History</p>
        {loading ? <div className="skeleton h-40 rounded-xl"/> : metrics.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No records yet. Log your first metric above!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-white/5">
                  {['Date','Heart Rate','Sys BP / Dia BP','Weight','BMI','Sleep','SpO2',''].map(h => (
                    <th key={h} className="text-left py-3 px-2 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map(m => (
                  <tr key={m._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="py-3 px-2 text-slate-400">{formatDate(m.recordedAt)}</td>
                    <td className="py-3 px-2">{m.heartRate ? `${m.heartRate} bpm` : '—'}</td>
                    <td className="py-3 px-2">{m.systolicBP ? `${m.systolicBP}/${m.diastolicBP}` : '—'}</td>
                    <td className="py-3 px-2">{m.weight ? `${m.weight} kg` : '—'}</td>
                    <td className="py-3 px-2">{m.bmi ?? '—'}</td>
                    <td className="py-3 px-2">{m.sleepDuration ? `${m.sleepDuration} hrs` : '—'}</td>
                    <td className="py-3 px-2">{m.spo2 ? `${m.spo2}%` : '—'}</td>
                    <td className="py-3 px-2">
                      <button onClick={() => handleDelete(m._id)} className="text-slate-600 hover:text-danger transition-colors">
                        <Trash2 size={15}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
