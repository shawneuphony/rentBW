// app/components/ui/Charts.js
'use client';

export function BarChart({ data, title, subtitle }) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
      </div>

      <div className="flex-1 flex items-end justify-between gap-4 h-64 px-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="w-full bg-primary/5 rounded-t-lg relative flex flex-col justify-end overflow-hidden h-full">
              <div 
                className="bg-primary w-full rounded-t-lg transition-all group-hover:bg-primary/80"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              ></div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DoughnutChart({ percentage, label, size = 'medium' }) {
  const sizes = {
    small: 'w-24 h-24',
    medium: 'w-32 h-32',
    large: 'w-40 h-40'
  };

  // Calculate the circle properties
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative ${sizes[size]}`}>
      {/* SVG Circle */}
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="#e2e8f0"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="#0f756d"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      
      {/* Percentage text in the middle */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-primary">{percentage}%</span>
        {label && <span className="text-[8px] font-medium text-slate-500 uppercase tracking-wider">{label}</span>}
      </div>
    </div>
  );
}

export function ProgressBar({ value, label, color = 'primary', showValue = true }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-slate-600">{label}</span>
        {showValue && <span className={`text-${color}`}>{value}%</span>}
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-${color} rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}

export function LineChart({ data, title }) {
  const maxValue = Math.max(...data.map(d => d.value));
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (d.value / maxValue) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-6">{title}</h3>
      
      <div className="relative h-48">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 25, 50, 75, 100].map((line) => (
            <div key={line} className="border-b border-slate-100 w-full h-0"></div>
          ))}
        </div>

        {/* Line Chart */}
        <svg className="absolute inset-0 w-full h-full">
          <polyline
            points={points}
            fill="none"
            stroke="#0f756d"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Data Points */}
        <div className="absolute inset-0 flex justify-between">
          {data.map((point, i) => (
            <div
              key={i}
              className="relative"
              style={{
                left: `${(i / (data.length - 1)) * 100}%`,
                bottom: `${(point.value / maxValue) * 100}%`
              }}
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-4">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] text-slate-400 font-bold uppercase">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}