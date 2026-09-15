import React from 'react';
import { Search, Bell, Settings, ArrowLeft, ArrowRight } from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  pendingCount: number;
}

const TAB_INDEX_MAP: Record<TabType, { index: number; name: string; label: string }> = {
  operasional: { index: 1, name: 'OPERASIONAL', label: 'Tab 1/4' },
  berkas: { index: 2, name: 'BERKAS', label: 'Tab 2/4' },
  report: { index: 3, name: 'REPORT', label: 'Tab 3/4' },
  ringkasan: { index: 0, name: 'RINGKASAN', label: 'Overview' },
  tools: { index: 4, name: 'TOOLS', label: 'Tab 4/4' },
};

const TAB_CYCLE: TabType[] = ['operasional', 'berkas', 'report', 'tools'];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenSearch,
  onOpenSettings,
  onOpenNotifications,
  pendingCount,
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-3">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between">
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-blue-500/20">
              AW
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-stone-900 tracking-tight leading-none">
                  ADMIN WORK CENTER
                </h1>
              </div>
              <p className="text-[11px] font-medium text-stone-700 mt-0.5 leading-none">
                Pusat Operasional Admin
              </p>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenSearch}
              title="Cari cepat"
              className="w-9 h-9 rounded-full text-stone-800 hover:text-blue-700 hover:bg-stone-100 flex items-center justify-center transition-colors active:scale-95"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenNotifications}
              title="Notifikasi & Reminder"
              className="w-9 h-9 rounded-full text-stone-800 hover:text-blue-700 hover:bg-stone-100 flex items-center justify-center transition-colors relative active:scale-95"
            >
              <Bell className="w-4 h-4" />
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              title="Pengaturan"
              className="w-9 h-9 rounded-full text-stone-800 hover:text-blue-700 hover:bg-stone-100 flex items-center justify-center transition-colors active:scale-95"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workspace Quick Strip with Tab Indicator */}
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-100">
              {currentInfo.label}
            </span>
            <span className="text-xs font-bold text-stone-800">
              {currentInfo.name}
            </span>
          </div>

          {/* Tab Prev / Next controls */}
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
