// app/investor/geospatial/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MapIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatPrice(p) {
  if (!p) return '—';
  if (p >= 1_000_000) return `BWP ${(p / 1_000_000).toFixed(1)}M`;
  if (p >= 1_000)    return `BWP ${(p / 1_000).toFixed(0)}K`;
  return `BWP ${p}`;
}

// Map type → display color classes
const TYPE_COLOR = {
  apartment:  { dot: 'bg-blue-500',   border: 'border-blue-500',   text: 'text-blue-600'   },
  house:      { dot: 'bg-green-500',  border: 'border-green-500',  text: 'text-green-600'  },
  commercial: { dot: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-600' },
  studio:     { dot: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-600' },
  townhouse:  { dot: 'bg-teal-500',   border: 'border-teal-500',   text: 'text-teal-600'   },
};
const DEFAULT_COLOR = { dot: 'bg-slate-400', border: 'border-slate-400', text: 'text-slate-500' };

// Deterministic pseudo-position from string id (keeps markers stable on re-render)
function idToPos(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  const lat = 15 + ((hash & 0xff) / 255) * 68;          // 15% – 83% top
  const lng = 10 + (((hash >> 8) & 0xff) / 255) * 78;  // 10% – 88% left
  return { lat, lng };
}

export default function GeospatialExplorerPage() {
  const [selectedLayer,    setSelectedLayer]    = useState('zoning');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [mapZoom,          setMapZoom]          = useState(12);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [typeFilter,       setTypeFilter]       = useState('all');
  const [search,           setSearch]           = useState('');

  // Real data
  const [stats,     setStats]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  // Derived
  const [districts,   setDistricts]   = useState([]);
  const [markers,     setMarkers]     = useState([]);
  const [allTypes,    setAllTypes]    = useState([]);

  const layers = [
    { id: 'zoning',      name: 'Zoning Map',          icon: MapIcon,             description: 'Commercial, residential, industrial zones' },
    { id: 'pricing',     name: 'Price Heatmap',        icon: CurrencyDollarIcon,  description: 'Property value distribution' },
    { id: 'yield',       name: 'Yield Zones',          icon: ArrowTrendingUpIcon, description: 'ROI by district' },
    { id: 'supply',      name: 'Supply Density',       icon: ChartBarIcon,        description: 'Listing volume by area' },
    { id: 'development', name: 'Planned Developments', icon: BuildingOfficeIcon,  description: 'Future construction projects' },
  ];

  // ── Load from /api/investor/stats ─────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/investor/stats', { credentials: 'include' });
      if (!res.ok) throw new Error((await res.json()).error ?? `Error ${res.status}`);
      const data = await res.json();
      setStats(data);

      // Build districts from DB data
      const districtRows = (data.districts ?? []).map((d, i) => ({
        id:         d.name.toLowerCase().replace(/\s+/g, '-'),
        name:       d.name,
        properties: d.count,
        avgPrice:   d.avgPrice,
        yieldVal:   d.avgYield ?? 8.0,
      }));
      setDistricts(districtRows);

      // Build markers from top properties
      const markerRows = (data.topProperties ?? []).map((p) => {
        const pos = idToPos(p.id);
        return {
          id:       p.id,
          lat:      pos.lat,
          lng:      pos.lng,
          price:    p.price,
          type:     p.type ?? 'other',
          name:     p.title,
          location: p.location ?? '—',
          yield:    p.yield ?? 8.0,
          beds:     p.beds,
          image:    p.image,
        };
      });
      setMarkers(markerRows);

      // Unique types
      const types = [...new Set((data.topProperties ?? []).map(p => p.type).filter(Boolean))];
      setAllTypes(types);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Filter markers ────────────────────────────────────────────────────────────
  const visibleMarkers = markers.filter((m) => {
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;
    if (selectedDistrict !== 'all' && !m.location.toLowerCase().includes(selectedDistrict)) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.location.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // ── Export map data as CSV ────────────────────────────────────────────────────
  const handleExport = () => {
    if (!markers.length) return;
    const keys = ['id', 'name', 'location', 'type', 'price', 'yield'];
    const csv  = [
      keys.join(','),
      ...markers.map(m => keys.map(k => m[k] ?? '').join(',')),
    ].join('\n');
    const a = document.createElement('a');
    a.href     = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `rentbw_map_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Geospatial Explorer</h1>
          <p className="text-slate-500 mt-1">
            Property distribution and market trends across Gaborone
            {!loading && stats && (
              <span className="ml-2 text-xs text-primary font-medium">
                · {stats.marketStats?.totalProperties ?? 0} active listings
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={loading || !markers.length}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Export Map
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <ExclamationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
          <button onClick={load} className="ml-auto text-xs text-red-600 font-bold hover:underline">Retry</button>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ── Left panel ──────────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search property or area…"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>

          {/* District Filter */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
              <FunnelIcon className="w-4 h-4 text-primary" /> District
            </h3>
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              <option value="all">All Districts</option>
              {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          {/* Property Type */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold mb-3 text-sm">Property Type</h3>
            <div className="space-y-2">
              {['all', ...allTypes].map(t => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio" name="propertyType" value={t}
                    checked={typeFilter === t}
                    onChange={() => setTypeFilter(t)}
                    className="w-4 h-4 text-primary focus:ring-primary border-slate-300"
                  />
                  <span className="text-sm capitalize">{t === 'all' ? 'All Types' : t}</span>
                </label>
              ))}
              {loading && <p className="text-xs text-slate-400">Loading types…</p>}
            </div>
          </div>

          {/* Layers */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
              <AdjustmentsHorizontalIcon className="w-4 h-4 text-primary" /> Data Layers
            </h3>
            <div className="space-y-2">
              {layers.map(layer => {
                const Icon = layer.icon;
                return (
                  <button
                    key={layer.id}
                    onClick={() => setSelectedLayer(layer.id)}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg transition-colors text-left ${
                      selectedLayer === layer.id ? 'bg-primary/10 text-primary' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${selectedLayer === layer.id ? 'text-primary' : 'text-slate-400'}`} />
                    <div>
                      <p className={`text-xs font-semibold ${selectedLayer === layer.id ? 'text-primary' : 'text-slate-700'}`}>{layer.name}</p>
                      <p className="text-[10px] text-slate-400">{layer.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Center: Map ───────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-[600px] relative">
            {/* Map label bar */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-white/90 to-transparent p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm">
                  <MapIcon className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium">Gaborone</span>
                  {!loading && <span className="text-xs text-slate-400">· {visibleMarkers.length} shown</span>}
                </div>
                <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-medium shadow-sm">
                  Zoom {mapZoom}x
                </span>
              </div>
            </div>

            {/* Base map */}
            <div className="w-full h-full bg-slate-200 relative overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-50"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80)',
                  filter: 'grayscale(100%)',
                }}
              />
              {/* Grid overlay */}
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(to right, rgba(15,117,109,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,117,109,0.08) 1px, transparent 1px)',
                backgroundSize: '50px 50px',
              }} />

              {/* Loading overlay */}
              {loading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
                    <p className="text-sm text-slate-600">Loading property data…</p>
                  </div>
                </div>
              )}

              {/* Real DB property markers */}
              {visibleMarkers.map((marker) => {
                const colors = TYPE_COLOR[marker.type] ?? DEFAULT_COLOR;
                return (
                  <div
                    key={marker.id}
                    className="absolute group cursor-pointer z-10"
                    style={{ top: `${marker.lat}%`, left: `${marker.lng}%` }}
                    onClick={() => setSelectedProperty(marker)}
                  >
                    <div className={`relative`}>
                      <div className={`w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center border-2 ${colors.border} transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform`}>
                        <BuildingOfficeIcon className={`w-3 h-3 ${colors.text}`} />
                      </div>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-44 bg-white rounded-xl shadow-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                        <p className="text-xs font-bold text-slate-900 truncate">{marker.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{marker.location}</p>
                        <p className="text-xs font-bold text-primary mt-1">{formatPrice(marker.price)}/mo</p>
                        <p className="text-[10px] text-green-600 mt-0.5">~{marker.yield}% yield</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Layer overlays */}
              {selectedLayer === 'zoning' && (
                <>
                  <div className="absolute top-1/4 left-1/3 w-36 h-36 bg-blue-500/15 border-2 border-blue-400/40 rounded-lg flex items-center justify-center">
                    <span className="text-[10px] font-bold text-blue-700 bg-white/80 px-2 py-0.5 rounded uppercase tracking-wide">Commercial</span>
                  </div>
                  <div className="absolute bottom-1/4 right-1/4 w-28 h-28 bg-orange-500/15 border-2 border-orange-400/40 rounded-lg flex items-center justify-center">
                    <span className="text-[10px] font-bold text-orange-700 bg-white/80 px-2 py-0.5 rounded uppercase tracking-wide">Industrial</span>
                  </div>
                  <div className="absolute top-2/3 left-1/2 w-32 h-32 bg-green-500/15 border-2 border-green-400/40 rounded-lg flex items-center justify-center">
                    <span className="text-[10px] font-bold text-green-700 bg-white/80 px-2 py-0.5 rounded uppercase tracking-wide">Residential</span>
                  </div>
                </>
              )}
              {selectedLayer === 'pricing' && (
                <>
                  <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-red-500/15 blur-3xl" />
                  <div className="absolute bottom-1/3 right-1/3 w-40 h-40 rounded-full bg-yellow-500/15 blur-3xl" />
                  <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full bg-green-500/15 blur-3xl" />
                </>
              )}
              {selectedLayer === 'yield' && (
                <>
                  <div className="absolute top-1/3 left-1/4 w-44 h-44 rounded-full bg-primary/15 blur-2xl" />
                  <div className="absolute bottom-1/4 right-1/4 w-36 h-36 rounded-full bg-primary/10 blur-2xl" />
                </>
              )}
              {selectedLayer === 'development' && (
                <div className="absolute top-[42%] left-[52%] z-10">
                  <div className="relative group cursor-pointer">
                    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-4 ring-white/50">
                      <StarIconSolid className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-52 bg-white p-3 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Under Construction</span>
                      <h3 className="text-xs font-bold mt-2">Planned Development</h3>
                      <p className="text-[10px] text-slate-500">Gaborone North</p>
                    </div>
                  </div>
                </div>
              )}

              {/* No data state */}
              {!loading && visibleMarkers.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="bg-white/90 rounded-xl p-5 text-center shadow-lg max-w-xs">
                    <BuildingOfficeIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700">No properties match your filters</p>
                    <button onClick={() => { setTypeFilter('all'); setSelectedDistrict('all'); setSearch(''); }}
                      className="mt-2 text-xs text-primary font-bold hover:underline">
                      Clear filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Zoom controls */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-10">
              <button onClick={() => setMapZoom(z => Math.min(z + 1, 18))}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-slate-50 transition">
                <PlusIcon className="w-4 h-4" />
              </button>
              <button onClick={() => setMapZoom(z => Math.max(z - 1, 8))}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-slate-50 transition">
                <MinusIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-white/95 p-3 rounded-lg shadow-lg border border-slate-200 text-xs space-y-1.5 z-10">
              <p className="font-bold text-slate-800 border-b pb-1 mb-1.5">Legend</p>
              {Object.entries(TYPE_COLOR).slice(0, 4).map(([type, c]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${c.dot}`} />
                  <span className="capitalize">{type}</span>
                </div>
              ))}
              {selectedLayer === 'development' && (
                <div className="flex items-center gap-2 pt-1 border-t mt-1">
                  <StarIconSolid className="w-3 h-3 text-primary" />
                  <span>Development</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right panel ───────────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">

          {/* Selected property */}
          {selectedProperty ? (
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-sm">Property Details</h3>
                <button onClick={() => setSelectedProperty(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              {selectedProperty.image && (
                <img src={selectedProperty.image} alt={selectedProperty.name}
                  className="w-full h-24 object-cover rounded-lg mb-3" />
              )}
              <p className="text-sm font-bold truncate">{selectedProperty.name}</p>
              <p className="text-xs text-slate-500 mt-0.5 mb-3">{selectedProperty.location}</p>
              <div className="space-y-2">
                {[
                  { label: 'Monthly Rent', value: formatPrice(selectedProperty.price), bold: true, color: 'text-primary' },
                  { label: 'Type',         value: selectedProperty.type ?? '—' },
                  { label: 'Est. Yield',   value: `${selectedProperty.yield}%`, color: 'text-green-600' },
                  selectedProperty.beds && { label: 'Bedrooms', value: `${selectedProperty.beds} bed` },
                ].filter(Boolean).map(({ label, value, bold, color }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-slate-500">{label}</span>
                    <span className={`${bold ? 'font-bold' : 'font-medium'} ${color ?? 'text-slate-900'} capitalize`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold mb-3 text-sm">District Overview</h3>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />)}
                </div>
              ) : districts.length === 0 ? (
                <p className="text-xs text-slate-400">No district data available</p>
              ) : (
                <div className="space-y-2">
                  {districts.slice(0, 5).map(d => (
                    <div key={d.id}
                      onClick={() => setSelectedDistrict(d.id === selectedDistrict ? 'all' : d.id)}
                      className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedDistrict === d.id ? 'bg-primary/10' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{d.name}</p>
                        <p className="text-[10px] text-slate-400">{d.properties} listings</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-primary">BWP {d.avgPrice?.toLocaleString()}</p>
                        <p className="text-[10px] text-green-600">{d.yieldVal}% yield</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-slate-400 mt-3">Click a district to filter map</p>
            </div>
          )}

          {/* Market stats */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold mb-3 text-sm">Market Statistics</h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />)}
              </div>
            ) : stats ? (
              <div className="space-y-3">
                {[
                  { label: 'Total Active',  value: stats.marketStats?.totalProperties ?? '—',                     pct: null },
                  { label: 'Avg Price/mo',  value: `BWP ${stats.marketStats?.avgPrice?.toLocaleString() ?? '—'}`,  pct: null },
                  { label: 'Avg Yield',     value: `${stats.marketStats?.avgYield ?? 8.5}%`,                       pct: stats.marketStats?.avgYield * 10 },
                ].map(({ label, value, pct }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-bold text-slate-900">{value}</span>
                    </div>
                    {pct != null && (
                      <div className="w-full bg-slate-100 h-1.5 rounded-full">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">—</p>
            )}
          </div>

          {/* Property types breakdown */}
          {!loading && stats?.propertyTypes?.length > 0 && (
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold mb-3 text-sm">By Property Type</h3>
              <div className="space-y-2">
                {stats.propertyTypes.slice(0, 5).map(t => {
                  const colors = TYPE_COLOR[t.type] ?? DEFAULT_COLOR;
                  const total  = stats.propertyTypes.reduce((s, x) => s + x.count, 0);
                  return (
                    <div key={t.type} className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${colors.dot} flex-shrink-0`} />
                      <span className="text-xs capitalize flex-1 text-slate-700">{t.type ?? 'other'}</span>
                      <span className="text-xs font-bold text-slate-900">{t.count}</span>
                      <span className="text-[10px] text-slate-400">{total ? Math.round(t.count / total * 100) : 0}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* District comparison table */}
      {!loading && districts.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-bold mb-4">District Comparison</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {districts.map(d => (
              <div key={d.id}
                onClick={() => setSelectedDistrict(d.id === selectedDistrict ? 'all' : d.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
                  selectedDistrict === d.id ? 'bg-primary/10 border-2 border-primary/30' : 'bg-slate-50 border border-slate-100 hover:border-primary/20'
                }`}>
                <p className="text-sm font-bold text-slate-900">{d.name}</p>
                <p className="text-xs text-slate-500 mt-1">{d.properties} listings</p>
                <p className="text-xs text-green-600 font-medium mt-0.5">{d.yieldVal}% yield</p>
                <div className="mt-2 h-1 w-full bg-slate-200 rounded-full">
                  <div className="h-1 bg-primary rounded-full" style={{ width: `${Math.min(100, d.yieldVal * 10)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-slate-400 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <InformationCircleIcon className="w-4 h-4" />
          <span>Data source: rentBW live database</span>
          <span>Last refreshed: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Live data</span>
        </div>
      </div>
    </div>
  );
}