// app/investor/geospatial/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MapIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon,
  GlobeAltIcon,
  StarIcon,
  HomeIcon,
  BeakerIcon,
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export default function GeospatialExplorerPage() {
  const [selectedLayer, setSelectedLayer] = useState('zoning');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [mapZoom, setMapZoom] = useState(12);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Mock data for districts
  const districts = [
    { id: 'cbd', name: 'CBD', properties: 45, avgPrice: 145, yield: 7.2 },
    { id: 'phakalane', name: 'Phakalane', properties: 38, avgPrice: 98, yield: 8.5 },
    { id: 'block8', name: 'Block 8', properties: 52, avgPrice: 112, yield: 7.8 },
    { id: 'gwest', name: 'G-West', properties: 29, avgPrice: 78, yield: 9.1 },
    { id: 'broadhurst', name: 'Broadhurst', properties: 41, avgPrice: 135, yield: 6.9 },
    { id: 'tlokweng', name: 'Tlokweng', properties: 33, avgPrice: 89, yield: 8.2 },
  ];

  // Mock data for map markers (properties)
  const mapMarkers = [
    { id: 1, lat: 40, lng: 30, price: 1450000, type: 'commercial', name: 'iTowers CBD', district: 'CBD' },
    { id: 2, lat: 45, lng: 45, price: 980000, type: 'industrial', name: 'Phakalane Industrial Park', district: 'Phakalane' },
    { id: 3, lat: 55, lng: 60, price: 1120000, type: 'commercial', name: 'Block 8 Mall', district: 'Block 8' },
    { id: 4, lat: 65, lng: 40, price: 780000, type: 'industrial', name: 'G-West Warehouse', district: 'G-West' },
    { id: 5, lat: 35, lng: 65, price: 1350000, type: 'retail', name: 'Broadhurst Square', district: 'Broadhurst' },
    { id: 6, lat: 25, lng: 55, price: 890000, type: 'commercial', name: 'Tlokweng Plaza', district: 'Tlokweng' },
    { id: 7, lat: 50, lng: 35, price: 2100000, type: 'mixed', name: 'Airport Junction', district: 'Block 10' },
    { id: 8, lat: 70, lng: 50, price: 650000, type: 'industrial', name: 'GIEP Complex', district: 'GIEP' },
  ];

  // Layer options - using valid Heroicons
  const layers = [
    { id: 'zoning', name: 'Zoning Map', icon: MapIcon, description: 'Commercial, residential, industrial zones' },
    { id: 'traffic', name: 'Traffic Density', icon: ChartBarIcon, description: 'Real-time traffic patterns' },
    { id: 'development', name: 'Planned Developments', icon: BuildingOfficeIcon, description: 'Future construction projects' },
    { id: 'pricing', name: 'Price Heatmap', icon: CurrencyDollarIcon, description: 'Property value distribution' },
    { id: 'yield', name: 'Yield Zones', icon: ArrowTrendingUpIcon, description: 'ROI by district' },
  ];

  // Property types for filtering
  const propertyTypes = [
    { id: 'all', name: 'All Types' },
    { id: 'commercial', name: 'Commercial' },
    { id: 'retail', name: 'Retail' },
    { id: 'industrial', name: 'Industrial' },
    { id: 'mixed', name: 'Mixed Use' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Geospatial Explorer</h1>
          <p className="text-slate-500 mt-1">
            Analyze property distributions, zoning, and market trends across Gaborone
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
            <DocumentArrowDownIcon className="w-4 h-4" />
            Export Map
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90">
            <CloudArrowUpIcon className="w-4 h-4" />
            Save View
          </button>
        </div>
      </div>

      {/* Main Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Filters & Layers */}
        <div className="lg:col-span-1 space-y-4">
          {/* District Filter */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <FunnelIcon className="w-4 h-4 text-primary" />
              District
            </h3>
            <select 
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Districts</option>
              {districts.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Property Type Filter */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold mb-3">Property Type</h3>
            <div className="space-y-2">
              {propertyTypes.map(type => (
                <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="propertyType"
                    value={type.id}
                    defaultChecked={type.id === 'all'}
                    className="w-4 h-4 text-primary focus:ring-primary border-slate-300"
                  />
                  <span className="text-sm">{type.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Data Layers */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="w-4 h-4 text-primary" />
              Data Layers
            </h3>
            <div className="space-y-3">
              {layers.map(layer => {
                const Icon = layer.icon;
                return (
                  <div key={layer.id} className="flex items-start gap-3">
                    <button
                      onClick={() => setSelectedLayer(layer.id)}
                      className={`flex items-center gap-3 flex-1 p-2 rounded-lg transition-colors ${
                        selectedLayer === layer.id ? 'bg-primary/10 text-primary' : 'hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${selectedLayer === layer.id ? 'text-primary' : 'text-slate-400'}`} />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${selectedLayer === layer.id ? 'text-primary' : 'text-slate-700'}`}>
                          {layer.name}
                        </p>
                        <p className="text-xs text-slate-500">{layer.description}</p>
                      </div>
                    </button>
                    <input
                      type="checkbox"
                      className="mt-2 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                      checked={selectedLayer === layer.id}
                      onChange={() => setSelectedLayer(layer.id)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Layer Controls */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold mb-3">Layer Controls</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="60"
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Labels</span>
                <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-primary">
                  <span className="inline-block h-3 w-3 transform translate-x-5 rounded-full bg-white transition"></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Heatmap</span>
                <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-slate-200">
                  <span className="inline-block h-3 w-3 transform translate-x-1 rounded-full bg-white transition"></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-[600px] relative">
            {/* Map Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-white to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm">
                  <MapIcon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Gaborone Metropolitan Area</span>
                </div>
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="text-xs font-medium">Scale: 1:25,000</span>
                </div>
              </div>
            </div>

            {/* Map Image (Simulated) */}
            <div className="w-full h-full bg-slate-200 relative overflow-hidden">
              {/* Base Map with Grid Pattern */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-60"
                style={{ 
                  backgroundImage: 'url(https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80)',
                  filter: 'grayscale(100%)'
                }}
              >
                {/* Grid Overlay */}
                <div className="absolute inset-0" style={{
                  backgroundImage: 'linear-gradient(to right, rgba(15,117,109,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,117,109,0.1) 1px, transparent 1px)',
                  backgroundSize: '50px 50px'
                }}></div>
              </div>

              {/* Map Markers */}
              {mapMarkers.map((marker) => (
                <div
                  key={marker.id}
                  className="absolute group cursor-pointer"
                  style={{ top: `${marker.lat}%`, left: `${marker.lng}%` }}
                  onClick={() => setSelectedProperty(marker)}
                >
                  <div className={`relative ${
                    marker.type === 'commercial' ? 'text-blue-600' :
                    marker.type === 'industrial' ? 'text-orange-600' :
                    marker.type === 'retail' ? 'text-purple-600' :
                    'text-green-600'
                  }`}>
                    <div className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-current transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform">
                      <BuildingOfficeIcon className="w-3 h-3" />
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white rounded-lg shadow-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                      <p className="text-xs font-bold">{marker.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{marker.district}</p>
                      <p className="text-xs font-bold text-primary mt-1">BWP {marker.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Zoning Overlay (Simulated) */}
              {selectedLayer === 'zoning' && (
                <>
                  <div className="absolute top-1/4 left-1/3 w-40 h-40 bg-blue-500/20 border-2 border-blue-500 rounded-lg flex items-center justify-center backdrop-blur-[1px]">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest bg-white/80 px-2 py-0.5 rounded">Commercial Zone A</span>
                  </div>
                  <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-orange-500/20 border-2 border-orange-500 rounded-lg flex items-center justify-center backdrop-blur-[1px]">
                    <span className="text-[10px] font-bold text-orange-700 uppercase tracking-widest bg-white/80 px-2 py-0.5 rounded">Industrial</span>
                  </div>
                  <div className="absolute top-2/3 left-1/2 w-36 h-36 bg-green-500/20 border-2 border-green-500 rounded-lg flex items-center justify-center backdrop-blur-[1px]">
                    <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest bg-white/80 px-2 py-0.5 rounded">Residential</span>
                  </div>
                </>
              )}

              {/* Traffic Heatmap (Simulated) */}
              {selectedLayer === 'traffic' && (
                <>
                  <div className="absolute top-1/3 left-1/3 w-48 h-48 rounded-full bg-red-500/20 blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-1/3 right-1/3 w-40 h-40 rounded-full bg-orange-500/20 blur-3xl animate-pulse"></div>
                </>
              )}

              {/* Development Markers (Simulated) */}
              {selectedLayer === 'development' && (
                <div className="absolute top-[45%] left-[55%] z-10">
                  <div className="relative group">
                    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-4 ring-white/50">
                      <StarIconSolid className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-white p-3 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Under Construction</span>
                      <h3 className="text-xs font-bold mt-2">Sarona City - Phase II</h3>
                      <p className="text-[10px] text-slate-500">Gaborone North</p>
                      <p className="text-xs font-bold text-primary mt-1">Est. Value: BWP 45M</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Map Controls */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-2">
              <button 
                onClick={() => setMapZoom(z => Math.min(z + 1, 18))}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-slate-50 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setMapZoom(z => Math.max(z - 1, 8))}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-slate-50 transition-colors"
              >
                <MinusIcon className="w-4 h-4" />
              </button>
              <button className="p-2 bg-white rounded-lg shadow-lg hover:bg-slate-50 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 4v16M4 12h16" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Map Legend */}
            <div className="absolute bottom-4 right-4 bg-white/95 p-3 rounded-lg shadow-lg border border-slate-200 text-xs space-y-2">
              <p className="font-bold text-slate-800 border-b pb-1 mb-1">Map Legend</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                <span>Commercial Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <span>Residential Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                <span>Industrial Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
                <span>Mixed Use</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t">
                <StarIconSolid className="w-3 h-3 text-primary" />
                <span>Development Projects</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Property Details / Stats */}
        <div className="lg:col-span-1 space-y-4">
          {/* Selected Property Details */}
          {selectedProperty ? (
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold">Property Details</h3>
                <button 
                  onClick={() => setSelectedProperty(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-bold">{selectedProperty.name}</p>
                  <p className="text-xs text-slate-500">{selectedProperty.district}</p>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Value:</span>
                  <span className="font-bold text-primary">BWP {selectedProperty.price.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Type:</span>
                  <span className="font-medium capitalize">{selectedProperty.type}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Est. Yield:</span>
                  <span className="font-bold text-green-600">8.5%</span>
                </div>

                <button className="w-full mt-2 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary/20">
                  View Details
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold mb-3">District Overview</h3>
              <p className="text-xs text-slate-500 mb-4">Click on a marker to see property details</p>
              
              <div className="space-y-3">
                {districts.slice(0, 4).map(district => (
                  <div key={district.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                    <div>
                      <p className="text-sm font-medium">{district.name}</p>
                      <p className="text-xs text-slate-500">{district.properties} properties</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">P {district.avgPrice}</p>
                      <p className="text-xs text-green-600">{district.yield}% yield</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistics Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold mb-3">Market Statistics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Average Price/sqm</span>
                  <span className="font-bold">P 112</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Occupancy Rate</span>
                  <span className="font-bold">92%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">New Developments</span>
                  <span className="font-bold">24</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full">
                  <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold mb-3">Recent Transactions</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <BuildingOfficeIcon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium">CBD Office Tower</p>
                  <p className="text-[10px] text-slate-500">2 days ago</p>
                </div>
                <p className="text-xs font-bold text-primary">P 2.5M</p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <BuildingOfficeIcon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium">Phakalane Warehouse</p>
                  <p className="text-[10px] text-slate-500">5 days ago</p>
                </div>
                <p className="text-xs font-bold text-primary">P 980K</p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <BuildingOfficeIcon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium">Block 8 Retail</p>
                  <p className="text-[10px] text-slate-500">1 week ago</p>
                </div>
                <p className="text-xs font-bold text-primary">P 1.1M</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search address or parcel ID..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Bottom Data Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">District Comparison</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs font-bold bg-primary/10 text-primary rounded-lg">Yield</button>
            <button className="px-3 py-1 text-xs font-bold text-slate-400 hover:bg-slate-50 rounded-lg">Price</button>
            <button className="px-3 py-1 text-xs font-bold text-slate-400 hover:bg-slate-50 rounded-lg">Growth</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {districts.map(district => (
            <div key={district.id} className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-bold">{district.name}</p>
              <p className="text-xs text-slate-500 mt-1">Avg Price: P {district.avgPrice}/sqm</p>
              <p className="text-xs text-green-600">Yield: {district.yield}%</p>
              <div className="mt-2 h-1 w-full bg-slate-200 rounded-full">
                <div 
                  className="h-1 bg-primary rounded-full" 
                  style={{ width: `${(district.yield / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Source Footer */}
      <div className="text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <InformationCircleIcon className="w-4 h-4" />
          <span>Data Source: Gaborone City Council (GCC)</span>
          <span>Last Updated: {new Date().toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span>Live Data Feed Active</span>
        </div>
      </div>
    </div>
  );
}