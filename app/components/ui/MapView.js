// app/components/ui/MapView.js
'use client';

import { useState } from 'react';

export default function MapView({ properties = [], center = 'Gaborone', height = 'h-full' }) {
  const [zoom, setZoom] = useState(12);

  return (
    <div className={`w-full ${height} bg-slate-200 rounded-xl relative overflow-hidden`}>
      {/* Base Map Image */}
      <img
        className="w-full h-full object-cover opacity-60 grayscale"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuzEa6HXvmNyo-4XZhk18L8srWO3v24TAGMDNWCMbw8IzHjpLrFiBTC-hCEmnSRXx2CdkveexoyaNNBGrtp3V-5OfQLz3N87ARIP2qRRjbkbrlP1GaYyy8OpfWX4KenqezpNuMf_5Vy9hcajExtFTkk34PhFd4gpTmyDG6vRu6rGh7k1qc5wj1PKE3HFoKil_2NV9yyBVhrzVuCUsbl4rc_sYfe8SSmI9gHYXYMjX13_sWn2JlZriQOelCvDqIzklpppFbaNS1FBM"
        alt={`Map of ${center}`}
      />

      {/* Property Markers */}
      {properties.map((property, index) => (
        <div
          key={property.id || index}
          className="absolute group cursor-pointer"
          style={{
            top: `${20 + (index * 15)}%`,
            left: `${30 + (index * 10)}%`,
          }}
        >
          <div className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg transform hover:scale-110 transition-transform">
            BWP {property.price?.toLocaleString()}
          </div>
          <div className="w-2 h-2 bg-primary rounded-full mx-auto mt-[-2px]"></div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white rounded-lg shadow-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <p className="text-xs font-bold truncate">{property.title}</p>
            <p className="text-[10px] text-slate-500 mt-1">{property.location}</p>
          </div>
        </div>
      ))}

      {/* Map Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-white rounded-xl shadow-xl border border-slate-200 p-1">
        <button
          onClick={() => setZoom(z => Math.min(z + 1, 18))}
          className="p-2 hover:bg-slate-50 rounded-lg"
        >
          <span className="material-symbols-outlined text-xl">add</span>
        </button>
        <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
        <button
          onClick={() => setZoom(z => Math.max(z - 1, 8))}
          className="p-2 hover:bg-slate-50 rounded-lg"
        >
          <span className="material-symbols-outlined text-xl">remove</span>
        </button>
        <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg">
          <span className="material-symbols-outlined text-sm">my_location</span>
          Recenter
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute top-4 left-4 bg-white/95 p-3 rounded-lg border border-slate-200 shadow-lg text-[10px] space-y-2">
        <p className="font-bold text-slate-800 border-b pb-1 mb-1">Map Legend</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          <span>Available Properties</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>High Demand Area</span>
        </div>
      </div>

      {/* Location Info */}
      <div className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded shadow text-xs font-bold text-primary">
        {center}
      </div>
    </div>
  );
}