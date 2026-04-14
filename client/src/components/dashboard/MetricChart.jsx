import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const METRIC_CONFIG = {
  heartRate:     { label: 'Heart Rate (bpm)',    color: '#EF4444', normalMin: 60,  normalMax: 100  },
  systolicBP:    { label: 'Systolic BP (mmHg)',  color: '#F97316', normalMin: 90,  normalMax: 120  },
  diastolicBP:   { label: 'Diastolic BP (mmHg)', color: '#F59E0B', normalMin: 60,  normalMax: 80   },
  bmi:           { label: 'BMI (kg/m²)',          color: '#6366F1', normalMin: 18.5,normalMax: 24.9 },
  sleepDuration: { label: 'Sleep (hrs)',          color: '#8B5CF6', normalMin: 7,   normalMax: 9    },
  spo2:          { label: 'SpO2 (%)',             color: '#00D4AA', normalMin: 95,  normalMax: 100  },
  hydration:     { label: 'Hydration (L)',        color: '#3B82F6', normalMin: 2,   normalMax: 3    },
};

export default function MetricChart({ data = [], metric = 'heartRate' }) {
  const cfg = METRIC_CONFIG[metric] || METRIC_CONFIG.heartRate;
  const reversed = [...data].reverse();
  const labels  = reversed.map(d => new Date(d.recordedAt).toLocaleDateString('en-IN', { month:'short', day:'numeric' }));
  const values  = reversed.map(d => d[metric]);

  const chartData = {
    labels,
    datasets: [{
      label: cfg.label,
      data: values,
      borderColor: cfg.color,
      backgroundColor: `${cfg.color}18`,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: cfg.color,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1E293B',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#94A3B8',
        bodyColor: '#F8FAFC',
        padding: 10,
      },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748B', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748B', font: { size: 11 } } },
    },
    animation: { duration: 800, easing: 'easeInOutQuart' },
  };

  if (!data.length) return (
    <div className="h-40 flex items-center justify-center text-slate-500 text-sm">
      No data yet. Log your first metric!
    </div>
  );

  return <div className="h-48"><Line data={chartData} options={options} /></div>;
}
