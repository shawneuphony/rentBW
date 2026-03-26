// app/components/ui/InvestmentChart.js
'use client';

import { useState } from 'react';

export function BarChart({ data, title, subtitle, color = 'primary' }) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>

      <div className="h-64 flex items-end justify-between gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="w-full bg-primary/5 rounded-t-lg relative flex flex-col justify-end overflow-hidden h-full">
              <div 
                className={`bg-${color} w-full rounded-t-lg transition-all group-hover:opacity-80`}
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              />
              {/* Tooltip on hover */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {item.value.toLocaleString()}
              </div>
            </div>
            <span className="text-xs font-medium text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LineChart({ data, title, subtitle }) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;
  const height = 200;
  const width = 100;

  // Generate path for the line
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.value - minValue) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>

      <div className="relative h-48">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="border-b border-slate-100 w-full h-0" />
          ))}
        </div>

        {/* Line chart */}
        <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <polyline
            points={points}
            fill="none"
            stroke="#0f756d"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Area fill */}
          <polygon
            points={`0,${height} ${points} ${width},${height}`}
            fill="url(#gradient)"
            opacity="0.1"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f756d" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0f756d" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Data points */}
        <div className="absolute inset-0 flex justify-between items-end">
          {data.map((point, i) => {
            const bottom = ((point.value - minValue) / range) * 100;
            return (
              <div
                key={i}
                className="relative group"
                style={{ marginBottom: `${bottom}%` }}
              >
                <div className="w-2 h-2 bg-primary rounded-full transform -translate-x-1/2 translate-y-1/2 cursor-pointer" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {point.value.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-4">
        {data.map((d, i) => (
          <span key={i} className="text-xs text-slate-400 font-medium">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DoughnutChart({ percentage, label, size = 'medium', color = 'primary' }) {
  const sizes = {
    small: 'w-24 h-24',
    medium: 'w-32 h-32',
    large: 'w-40 h-40'
  };

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative ${sizes[size]}`}>
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
          stroke={`var(--${color})`}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
          style={{ stroke: color === 'primary' ? '#0f756d' : undefined }}
        />
      </svg>
      
      {/* Percentage text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-900">{percentage}%</span>
        {label && <span className="text-[8px] font-medium text-slate-500 uppercase tracking-wider">{label}</span>}
      </div>
    </div>
  );
}

export function ProgressBar({ value, label, max = 100, color = 'primary', showValue = true }) {
  const percentage = (value / max) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        {showValue && <span className="font-medium text-slate-900">{value.toLocaleString()}</span>}
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}