// lib/constants/roles.js

export const USER_ROLES = {
  TENANT: 'tenant',
  LANDLORD: 'landlord',
  INVESTOR: 'investor',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

export const ROLE_LABELS = {
  [USER_ROLES.TENANT]: 'Tenant',
  [USER_ROLES.LANDLORD]: 'Landlord',
  [USER_ROLES.INVESTOR]: 'Investor',
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.SUPER_ADMIN]: 'Super Admin'
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.TENANT]: [
    'view_properties',
    'save_properties',
    'contact_landlords',
    'apply_for_properties',
    'manage_profile'
  ],
  [USER_ROLES.LANDLORD]: [
    'view_properties',
    'create_listings',
    'edit_listings',
    'delete_listings',
    'respond_to_inquiries',
    'manage_tenants',
    'view_analytics'
  ],
  [USER_ROLES.INVESTOR]: [
    'view_market_data',
    'access_analytics',
    'generate_reports',
    'view_geospatial_data',
    'export_data'
  ],
  [USER_ROLES.ADMIN]: [
    'view_properties',
    'manage_users',
    'moderate_listings',
    'view_analytics',
    'manage_payments',
    'manage_system'
  ],
  [USER_ROLES.SUPER_ADMIN]: [
    'view_properties',
    'manage_users',
    'moderate_listings',
    'view_analytics',
    'manage_payments',
    'manage_system',
    'manage_admins',
    'view_logs',
    'manage_settings'
  ]
};

export const DEFAULT_ROUTES = {
  [USER_ROLES.TENANT]: '/tenant/dashboard',
  [USER_ROLES.LANDLORD]: '/landlord/dashboard',
  [USER_ROLES.INVESTOR]: '/investor/dashboard',
  [USER_ROLES.ADMIN]: '/admin/dashboard',
  [USER_ROLES.SUPER_ADMIN]: '/admin/dashboard'
};

export const PUBLIC_ROUTES = [
  '/',
  '/property',
  '/property/search',
  '/property/[id]',
  '/about',
  '/contact',
  '/faq',
  '/terms',
  '/privacy',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password'
];

export function hasPermission(userRole, permission) {
  if (!userRole || !permission) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

export function isPublicRoute(pathname) {
  return PUBLIC_ROUTES.some(route => {
    if (route.includes('[')) {
      // Handle dynamic routes
      const pattern = route.replace(/\[.*?\]/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(pathname);
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}