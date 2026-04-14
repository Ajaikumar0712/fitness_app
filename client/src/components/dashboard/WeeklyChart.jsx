import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function WeeklyChart({ data = [] }) {
  const chartData = {
    labels: data.map(d => d.day),
    datasets: [{
      label: 'Active Minutes',
      data: data.map(d => d.activeMinutes),
      backgroundColor: data.map(d => d.activeMinutes >= 30 ? 'rgba(0,212,170,0.7)' : 'rgba(99,102,241,0.5)'),
      borderColor:     data.map(d => d.activeMinutes >= 30 ? '#00D4AA' : '#6366F1'),
      borderWidth: 1.5,
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1E293B', borderColor: '#334155', borderWidth: 1,
        titleColor: '#94A3B8', bodyColor: '#F8FAFC', padding: 10,
        callbacks: { label: (ctx) => ` ${ctx.raw} mins` },
      },
      annotation: {
        annotations: {
          target: { type: 'line', yMin: 30, yMax: 30, borderColor: '#00D4AA', borderWidth: 1.5, borderDash: [4, 4] }
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748B', font: { size: 11 } } },
      y: { min: 0, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748B', font: { size: 11 } } },
    },
    animation: { duration: 600 },
  };

  return <div className="h-48"><Bar data={chartData} options={options} /></div>;
}
