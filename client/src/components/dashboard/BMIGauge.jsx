import { useEffect, useRef } from 'react';
import { classifyBMI } from '../../utils/health';

export default function BMIGauge({ bmi }) {
  const cls = classifyBMI(bmi);

  // Gauge arc calculation (180° semicircle)
  const categories = [
    { label: 'Under', max: 18.5, color: '#3B82F6' },
    { label: 'Normal', max: 25,  color: '#10B981' },
    { label: 'Over',  max: 30,   color: '#F97316' },
    { label: 'Obese', max: 40,   color: '#EF4444' },
  ];

  const minBMI = 10, maxBMI = 40;
  const pct = bmi ? Math.min(Math.max((bmi - minBMI) / (maxBMI - minBMI), 0), 1) : 0;
  const angle = pct * 180 - 90; // degrees from left (-90 to +90)
  const rad = (angle * Math.PI) / 180;
  const cx = 100, cy = 90, r = 70;
  const nx = cx + r * Math.cos(rad);
  const ny = cy + r * Math.sin(rad);

  return (
    <div className="card flex flex-col items-center">
      <p className="section-title w-full">BMI Gauge</p>
      <svg viewBox="0 0 200 110" className="w-full max-w-xs">
        {/* Background arcs */}
        {categories.map((cat, i) => {
          const prev = i === 0 ? minBMI : categories[i - 1].max;
          const s = ((prev - minBMI) / (maxBMI - minBMI)) * Math.PI;
          const e = ((cat.max - minBMI) / (maxBMI - minBMI)) * Math.PI;
          const x1 = cx + r * Math.cos(Math.PI + s);
          const y1 = cy + r * Math.sin(Math.PI + s);
          const x2 = cx + r * Math.cos(Math.PI + e);
          const y2 = cy + r * Math.sin(Math.PI + e);
          const lf = e - s > Math.PI ? 1 : 0;
          return (
            <path
              key={cat.label}
              d={`M ${x1} ${y1} A ${r} ${r} 0 ${lf} 1 ${x2} ${y2}`}
              stroke={cat.color} strokeWidth="14" fill="none" strokeLinecap="butt"
              opacity="0.3"
            />
          );
        })}
        {/* Needle */}
        {bmi && (
          <line
            x1={cx} y1={cy}
            x2={nx} y2={ny}
            stroke="#F8FAFC" strokeWidth="2.5" strokeLinecap="round"
          />
        )}
        <circle cx={cx} cy={cy} r="5" fill="#F8FAFC" />
        {/* Labels */}
        <text x="15" y="105" fill="#3B82F6" fontSize="7" fontWeight="bold">Under</text>
        <text x="68" y="25"  fill="#10B981" fontSize="7" fontWeight="bold">Normal</text>
        <text x="135" y="52" fill="#F97316" fontSize="7" fontWeight="bold">Over</text>
        <text x="168" y="105"fill="#EF4444" fontSize="7" fontWeight="bold">Obese</text>
        {/* Center value */}
        <text x={cx} y={cy + 30} textAnchor="middle" fill="#F8FAFC" fontSize="20" fontWeight="bold">
          {bmi ?? '—'}
        </text>
      </svg>
      {bmi && (
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${cls.bg} ${cls.color} border ${cls.border}`}>
          {cls.label}
        </span>
      )}
      {!bmi && <p className="text-slate-500 text-sm mt-2">Log your weight to see BMI</p>}
    </div>
  );
}
