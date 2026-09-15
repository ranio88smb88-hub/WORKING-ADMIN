import React from 'react';
import { Home, FolderClosed, Clock, LayoutGrid, Wrench } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingReportsCount: number;
}

interface NavTab {
  id: TabType;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingReportsCount,
}) => {
  const navTabs: NavTab[] = [
    {
      id: 'operasional',
      label: 'Beranda',
      icon: Home,
    },
    {
      id: 'berkas',
      label: 'Berkas',
      icon: FolderClosed,
    },
    {
      id: 'report',
      label: 'Report',
      icon: Clock,
      badge: pendingReportsCount > 0 ? pendingReportsCount : undefined,
    },
    {
      id: 'ringkasan',
      label: 'Ringkasan',
      icon: LayoutGrid,
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: Wrench,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 py-1.5 px-3">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navTabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={`nav-item-${tab.id}-${idx}`}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-blue-600 font-semibold scale-105'
                  : 'text-stone-700 hover:text-stone-900 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {typeof tab.badge === 'number' && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-0.5 leading-none ${isActive ? 'font-bold text-blue-600' : 'text-stone-700'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
