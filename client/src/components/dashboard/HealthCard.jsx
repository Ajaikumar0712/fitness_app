import { getMetricStatus, statusColors } from '../../utils/health';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function HealthCard({ label, value, unit, metric, prevValue, icon: Icon, color = 'text-primary' }) {
  const status = metric ? getMetricStatus(metric, value) : 'unknown';
  const colors = statusColors[status];
  const diff = value && prevValue ? (value - prevValue).toFixed(1) : null;

  return (
    <div className={`card-hover border-l-4 ${colors.ring} cursor-default`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
          {Icon && <Icon size={20} className={colors.text} />}
        </div>
        {diff !== null && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${Number(diff) > 0 ? 'text-warning' : Number(diff) < 0 ? 'text-success' : 'text-slate-400'}`}>
            {Number(diff) > 0 ? <TrendingUp size={12}/> : Number(diff) < 0 ? <TrendingDown size={12}/> : <Minus size={12}/>}
            {Math.abs(diff)} {unit}
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-display font-bold text-slate-100">
            {value !== undefined && value !== null ? value : '—'}
          </span>
          <span className="text-slate-400 text-sm">{unit}</span>
        </div>
        {metric && (
          <span className={`mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border || 'border-white/10'}`}>
            {status === 'normal' ? '✓ Normal' : status === 'caution' ? '⚠ Caution' : status === 'danger' ? '⚠ Alert' : '— N/A'}
          </span>
        )}
      </div>
    </div>
  );
}
