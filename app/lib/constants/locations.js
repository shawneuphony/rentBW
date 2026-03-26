// lib/constants/locations.js

export const GABORONE_LOCATIONS = [
  { id: 'phakalane', name: 'Phakalane' },
  { id: 'broadhurst', name: 'Broadhurst' },
  { id: 'block-8', name: 'Block 8' },
  { id: 'block-6', name: 'Block 6' },
  { id: 'cbd', name: 'CBD' },
  { id: 'g-west', name: 'G-West' },
  { id: 'tlokweng', name: 'Tlokweng' },
  { id: 'kgale-view', name: 'Kgale View' },
  { id: 'phase-2', name: 'Phase 2' },
  { id: 'phase-4', name: 'Phase 4' },
  { id: 'maruapula', name: 'Maruapula' },
  { id: 'village', name: 'The Village' },
  { id: 'extension-10', name: 'Extension 10' },
  { id: 'extension-12', name: 'Extension 12' },
  { id: 'extension-14', name: 'Extension 14' },
  { id: 'bontleng', name: 'Bontleng' },
  { id: 'white-city', name: 'White City' },
  { id: 'old-naledi', name: 'Old Naledi' },
  { id: 'mogoditshane', name: 'Mogoditshane' },
  { id: 'gaborone-north', name: 'Gaborone North' }
];

export const NEIGHBORHOODS = GABORONE_LOCATIONS.map(loc => loc.name);

export const LOCATION_GROUPS = {
  north: ['Phakalane', 'Phase 2', 'Phase 4', 'Gaborone North'],
  central: ['CBD', 'The Village', 'Maruapula'],
  west: ['G-West', 'Extension 10', 'Extension 12', 'Extension 14'],
  east: ['Block 8', 'Block 6', 'Bontleng'],
  south: ['Kgale View', 'White City', 'Old Naledi', 'Mogoditshane'],
  peri_urban: ['Tlokweng', 'Broadhurst']
};