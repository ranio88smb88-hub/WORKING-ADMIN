import React from 'react';
import { Search, Bell, Settings, ArrowLeft, ArrowRight, Layers } from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  pendingCount: number;
  openWebTabsCount?: number;
  onOpenActiveBrowser?: () => void;
  activeWebsiteName?: string;
}

const TAB_INDEX_MAP: Record<TabType, { index: number; name: string; label: string }> = {
  operasional: { index: 1, name: 'BERANDA', label: 'Tab 1/4' },
  berkas: { index: 2, name: 'BERKAS', label: 'Tab 2/4' },
  report: { index: 3, name: 'REPORT', label: 'Tab 3/4' },
  ringkasan: { index: 0, name: 'RINGKASAN', label: 'Overview' },
  tools: { index: 4, name: 'TOOLS & MENU', label: 'Tab 4/4' },
};

const TAB_CYCLE: TabType[] = ['operasional', 'berkas', 'report', 'tools'];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenSearch,
  onOpenSettings,
  onOpenNotifications,
  pendingCount,
  openWebTabsCount = 0,
  onOpenActiveBrowser,
  activeWebsiteName,
}) => {
  const currentInfo = TAB_INDEX_MAP[activeTab];

  const handlePrevTab = () => {
    const currentPos = TAB_CYCLE.indexOf(activeTab);
    if (currentPos > 0) {
      onTabChange(TAB_CYCLE[currentPos - 1]);
    } else {
      onTabChange(TAB_CYCLE[TAB_CYCLE.length - 1]);
    }
  };

  const handleNextTab = () => {
    const currentPos = TAB_CYCLE.indexOf(activeTab);
    if (currentPos < TAB_CYCLE.length - 1 && currentPos !== -1) {
      onTabChange(TAB_CYCLE[currentPos + 1]);
    } else {
      onTabChange(TAB_CYCLE[0]);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-2.5 shadow-2xs">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between">
          {/* Brand & Subtitle ("ADMIN 1 FOR ALL") */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xs shadow-sm shadow-blue-500/20 shrink-0">
              1FA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-stone-900 tracking-tight leading-none">
                  ADMIN 1 FOR ALL
                </h1>
              </div>
              <p className="text-[11px] font-medium text-stone-600 mt-0.5 leading-none">
                Pusat Operasional Admin
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Quick Resume Browser Pill if any website tab is open */}
            {openWebTabsCount > 0 && onOpenActiveBrowser && (
              <button
                type="button"
                onClick={onOpenActiveBrowser}
                title="Buka Website Aktif"
                className="h-8 px-2.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1 text-[11px] font-bold active:scale-95 transition-all mr-0.5"
              >
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span className="max-w-[70px] truncate">{activeWebsiteName || 'Browser'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </button>
            )}

            <button
              type="button"
              onClick={onOpenSearch}
              title="Cari Cepat"
              className="w-8 h-8 rounded-full text-stone-700 hover:text-blue-700 hover:bg-stone-100 flex items-center justify-center transition-colors active:scale-95"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenNotifications}
              title="Notifikasi & Reminder"
              className="w-8 h-8 rounded-full text-stone-700 hover:text-blue-700 hover:bg-stone-100 flex items-center justify-center transition-colors relative active:scale-95"
            >
              <Bell className="w-4 h-4" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              title="Pengaturan"
              className="w-8 h-8 rounded-full text-stone-700 hover:text-blue-700 hover:bg-stone-100 flex items-center justify-center transition-colors active:scale-95"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Strip Status & Quick Cycle */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-100">
              {currentInfo.label}
            </span>
            <span className="text-xs font-bold text-stone-800">
              {currentInfo.name}
            </span>
          </div>

          {/* Quick Tab Cycle */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevTab}
              title="Tab Sebelumnya"
              className="p-1 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex gap-1 px-1">
              {TAB_CYCLE.map((t, idx) => (
                <button
                  key={`dot-${t}-${idx}`}
                  type="button"
                  onClick={() => onTabChange(t)}
                  title={`Ke ${TAB_INDEX_MAP[t].name}`}
                  className={`h-1.5 rounded-full transition-all ${
                    activeTab === t ? 'w-4 bg-blue-600' : 'w-1.5 bg-stone-200 hover:bg-stone-300'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleNextTab}
              title="Tab Selanjutnya"
              className="p-1 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
