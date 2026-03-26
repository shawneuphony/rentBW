// app/components/ui/Sidebar.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ChartBarIcon,
  MapIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  UsersIcon,
  BuildingOfficeIcon,
  FlagIcon,
  FolderIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function Sidebar({ user, menuItems }) {
  const pathname = usePathname();

  // Icon mapping
  const getIcon = (iconName) => {
    const icons = {
      dashboard: ChartBarIcon,
      map: MapIcon,
      'trending-up': ChartBarIcon,
      description: DocumentTextIcon,
      settings: Cog6ToothIcon,
      users: UsersIcon,
      'real-estate-agent': BuildingOfficeIcon,
      fact_check: FlagIcon,
      database: FolderIcon,
      logout: ArrowRightOnRectangleIcon
    };
    return icons[iconName] || HomeIcon;
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-primary/10 hidden lg:flex flex-col z-50">
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <HomeIcon className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold">RentBW</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = getIcon(item.icon);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === item.path
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:bg-primary/5 hover:text-primary'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-white/20 px-2 py-0.5 rounded text-xs">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      {user && (
        <div className="p-4 mt-auto border-t border-primary/10">
          <div className="flex items-center gap-3 p-2">
            <div className="size-10 rounded-full bg-primary/10 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                  {user.name?.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user.role}</p>
            </div>
            <Link href={`/${user.role}/settings`} className="text-slate-400 hover:text-primary">
              <Cog6ToothIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}