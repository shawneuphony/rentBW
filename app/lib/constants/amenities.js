// lib/constants/amenities.js
import {
  BuildingOfficeIcon,
  ShieldCheckIcon,
  SunIcon,
  BeakerIcon,
  WifiIcon,
  BoltIcon,
  TvIcon,
  HomeIcon,
  SparklesIcon,
  ComputerDesktopIcon,
  KeyIcon,
  LockClosedIcon,
  FireIcon,
  CubeIcon,
  TruckIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';

export const AMENITIES = [
  { id: 'parking', label: 'Parking', icon: 'truck' },
  { id: 'security', label: 'Security', icon: 'shield-check' },
  { id: 'garden', label: 'Garden', icon: 'sun' },
  { id: 'pool', label: 'Swimming Pool', icon: 'beaker' },
  { id: 'ac', label: 'Air Conditioning', icon: 'fire' },
  { id: 'furnished', label: 'Furnished', icon: 'home' },
  { id: 'pet-friendly', label: 'Pet Friendly', icon: 'sparkles' },
  { id: 'generator', label: 'Generator', icon: 'bolt' },
  { id: 'wifi', label: 'WiFi Included', icon: 'wifi' },
  { id: 'water', label: 'Water Included', icon: 'beaker' },
  { id: 'electricity', label: 'Electricity Included', icon: 'bolt' },
  { id: 'dstv', label: 'DSTV Connection', icon: 'tv' },
  { id: 'borehole', label: 'Borehole', icon: 'beaker' },
  { id: 'staff-quarters', label: 'Staff Quarters', icon: 'home' }
];

export const AMENITY_CATEGORIES = {
  utilities: ['water', 'electricity', 'wifi', 'generator'],
  outdoor: ['garden', 'pool', 'parking', 'borehole'],
  security: ['security', 'fence', 'guard'],
  interior: ['furnished', 'ac', 'dstv', 'staff-quarters'],
  policies: ['pet-friendly', 'smoking-allowed']
};

// Heroicons mapping
export const AMENITY_ICONS = {
  parking: TruckIcon,
  security: ShieldCheckIcon,
  garden: SunIcon,
  pool: BeakerIcon,
  ac: FireIcon,
  furnished: HomeIcon,
  'pet-friendly': SparklesIcon,
  generator: BoltIcon,
  wifi: WifiIcon,
  water: BeakerIcon,
  electricity: BoltIcon,
  dstv: TvIcon,
  borehole: BeakerIcon,
  'staff-quarters': HomeIcon,
  default: BuildingOfficeIcon
};

export const getAmenityIcon = (amenityId) => {
  return AMENITY_ICONS[amenityId] || AMENITY_ICONS.default;
};

export const getAmenityLabel = (amenityId) => {
  const amenity = AMENITIES.find(a => a.id === amenityId);
  return amenity?.label || amenityId;
};