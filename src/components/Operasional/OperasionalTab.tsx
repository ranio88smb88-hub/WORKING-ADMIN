import React, { useState, useMemo } from 'react';
import {
  Plus,
  ExternalLink,
  Star,
  Pin,
  Edit2,
  Search,
  Globe,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Hourglass,
  Layers,
  Sparkles,
  ArrowRight,
  FolderClosed,
  Zap,
} from 'lucide-react';
import { WebsiteItem, ReportItem, TabType } from '../../types';
import { EditWebsiteModal } from './EditWebsiteModal';

interface OperasionalTabProps {
  websites: WebsiteItem[];
  reports: ReportItem[];
  filesCount: number;
  openTabIds: string[];
  activeWebTabId: string | null;
  onUpdateWebsites: (updated: WebsiteItem[]) => void;
  onNavigateTab: (tab: TabType) => void;
  onOpenWebsiteInApp: (websiteId: string) => void;
  onResumeLastWork: () => void;
  onOpenAddReport: () => void;
  onSelectReport: (reportId: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const OperasionalTab: React.FC<OperasionalTabProps> = ({
  websites,
  reports,
  filesCount,
  openTabIds,
  activeWebTabId,
  onUpdateWebsites,
  onNavigateTab,
  onOpenWebsiteInApp,
  onResumeLastWork,
  onOpenAddReport,
  onSelectReport,
  onShowToast,
}) => {
  const [searchWeb, setSearchWeb] = useState('');
  const [webFilter, setWebFilter] = useState<'semua' | 'favorit' | 'pin'>('semua');
  const [editingWebsite, setEditingWebsite] = useState<WebsiteItem | null>(null);

  // Statistics for "REPORT TERTUNDA" Card
  const pendingReports = useMemo(() => {
    return reports.filter((r) => r.status !== 'selesai');
  }, [reports]);

  const priorityReports = useMemo(() => {
    return reports.filter((r) => r.status === 'prioritas');
  }, [reports]);

  const waitingReports = useMemo(() => {
    return reports.filter((r) => r.status === 'menunggu');
  }, [reports]);

  const completedTodayReports = useMemo(() => {
    return reports.filter((r) => r.status === 'selesai');
  }, [reports]);

  // Last opened website for "LANJUTKAN PEKERJAAN"
  const lastOpenedWebsite = useMemo(() => {
    const withLastOpened = [...websites].filter((w) => w.lastOpened);
    if (withLastOpened.length > 0) {
      return withLastOpened.sort((a, b) => {
        const timeA = new Date(a.lastOpened!).getTime();
        const timeB = new Date(b.lastOpened!).getTime();
        return timeB - timeA;
      })[0];
    }
    // Fallback to Live Chat or first website
    return websites.find((w) => w.shortCode === 'LC') || websites[0] || null;
  }, [websites]);

  // Recent work items (Terakhir Digunakan)
  const recentWebsites = useMemo(() => {
    return [...websites]
      .filter((w) => w.lastOpened)
      .sort((a, b) => {
        const timeA = new Date(a.lastOpened!).getTime();
        const timeB = new Date(b.lastOpened!).getTime();
        return timeB - timeA;
      })
      .slice(0, 4);
  }, [websites]);

  // Helper for human-readable relative time
  const getRelativeTime = (isoString?: string) => {
    if (!isoString) return '';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    if (diffMins < 60) return `${diffMins} menit lalu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return `${Math.floor(diffHours / 24)} hari lalu`;
  };

  // Filtered websites
  const filteredWebsites = useMemo(() => {
    return websites
      .filter((item) => {
        if (webFilter === 'favorit' && !item.isFavorite) return false;
        if (webFilter === 'pin' && !item.isPinned) return false;
        if (searchWeb.trim()) {
          const q = searchWeb.toLowerCase();
          return (
            item.name.toLowerCase().includes(q) ||
            item.shortCode.toLowerCase().includes(q) ||
            (item.notes && item.notes.toLowerCase().includes(q)) ||
            (item.category && item.category.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return a.order - b.order;
      });
  }, [websites, webFilter, searchWeb]);

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = websites.map((w) =>
      w.id === id ? { ...w, isPinned: !w.isPinned } : w
    );
    onUpdateWebsites(updated);
    const target = updated.find((w) => w.id === id);
    onShowToast(target?.isPinned ? `"${target.name}" dipin ke atas` : `Pin dilepas`);
  };

  const handleToggleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = websites.map((w) =>
      w.id === id ? { ...w, isFavorite: !w.isFavorite } : w
    );
    onUpdateWebsites(updated);
    const target = updated.find((w) => w.id === id);
    onShowToast(target?.isFavorite ? `Ditambahkan ke Favorit` : `Dihapus dari Favorit`);
  };

  const handleSaveEditedWebsite = (updatedItem: WebsiteItem) => {
    const updated = websites.map((w) => (w.id === updatedItem.id ? updatedItem : w));
    onUpdateWebsites(updated);
    onShowToast(`Pengaturan "${updatedItem.name}" berhasil disimpan`);
  };

  const handleAddNewWebsite = () => {
    const newId = `web-${Date.now()}`;
    const newSite: WebsiteItem = {
      id: newId,
      order: websites.length + 1,
      name: 'WEBSITE BARU',
      shortCode: 'WB',
      badgeColor: '#2563eb',
      url: '',
      status: 'online',
      isPinned: false,
      isFavorite: false,
      category: 'Operasional',
      notes: 'Website kerja tambahan',
    };
    onUpdateWebsites([...websites, newSite]);
    setEditingWebsite(newSite);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* 1. BRAND HEADER & QUICK ACCESS TABS STRIP (Fitur Utama: Logo Website Tab) */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs font-black tracking-wider uppercase text-stone-800">
              QUICK ACCESS • TAB WEBSITE
            </h2>
          </div>
          <span className="text-[10px] font-bold text-blue-600 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100">
            {openTabIds.length > 0 ? `${openTabIds.length} Tab Terbuka` : '12 Portal Siap'}
          </span>
        </div>

        {/* Horizontal scrollable tab logos (Comfortable 44px+ touch targets for single-hand mobile use) */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
          {websites.map((site) => {
            const isTabOpen = openTabIds.includes(site.id);
            const isTabActive = activeWebTabId === site.id;

            return (
              <button
                key={`quick-logo-${site.id}`}
                type="button"
                onClick={() => onOpenWebsiteInApp(site.id)}
                title={`Buka ${site.name} di dalam aplikasi`}
                className={`flex flex-col items-center justify-center shrink-0 group active:scale-95 transition-all focus:outline-hidden ${
                  isTabActive ? 'scale-105' : ''
                }`}
              >
                {/* Logo / Badge circle/rounded box */}
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs text-white font-black text-xs relative transition-transform ${
                    isTabActive
                      ? 'ring-3 ring-blue-600 ring-offset-2 scale-105'
                      : 'hover:brightness-110'
                  }`}
                  style={{ backgroundColor: site.badgeColor || '#4f46e5' }}
                >
                  {site.logoUrl ? (
                    <img
                      src={site.logoUrl}
                      alt={site.name}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <span>{site.shortCode}</span>
                  )}

                  {/* Open tab indicator dot (●) */}
                  {isTabOpen && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center">
                      <span className="w-1 h-1 rounded-full bg-white" />
                    </span>
                  )}
                </div>

                {/* Short name label */}
                <span
                  className={`text-[10px] font-bold mt-1 max-w-[56px] truncate text-center transition-colors ${
                    isTabActive ? 'text-blue-700' : 'text-stone-700'
                  }`}
                >
                  {site.shortCode}
                </span>
              </button>
            );
          })}

          {/* Add custom website tab button */}
          <button
            type="button"
            onClick={handleAddNewWebsite}
            title="Tambah Website Baru"
            className="flex flex-col items-center justify-center shrink-0 group active:scale-95 transition-all"
          >
            <div className="w-11 h-11 rounded-2xl border-2 border-dashed border-stone-300 hover:border-blue-500 bg-stone-50 hover:bg-blue-50 text-stone-400 hover:text-blue-600 flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-stone-500 mt-1">
              + Baru
            </span>
          </button>
        </div>
      </div>

      {/* 2. LANJUTKAN PEKERJAAN (Resume Last Active Website) */}
      {lastOpenedWebsite && (
        <div
          onClick={() => onOpenWebsiteInApp(lastOpenedWebsite.id)}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-4 shadow-md flex items-center justify-between cursor-pointer active:scale-98 transition-all relative overflow-hidden group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs text-white shadow-xs shrink-0 ring-2 ring-white/30"
              style={{ backgroundColor: lastOpenedWebsite.badgeColor || '#4f46e5' }}
            >
              {lastOpenedWebsite.logoUrl ? (
                <img
                  src={lastOpenedWebsite.logoUrl}
                  alt={lastOpenedWebsite.name}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <span>{lastOpenedWebsite.shortCode}</span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  Lanjutkan Pekerjaan
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-white truncate">
                {lastOpenedWebsite.name}
              </h3>
              <p className="text-[11px] text-blue-100 truncate mt-0.5">
                {lastOpenedWebsite.url ? 'Buka kembali tab' : 'URL belum diatur'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-colors">
            <span>Buka</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      )}

      {/* 3. METRIK UTAMA DASHBOARD ADMIN (Report Tertunda, Prioritas, Menunggu, Selesai, Berkas, Website) */}
      <div className="bg-gradient-to-br from-slate-900 via-stone-900 to-indigo-950 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        {/* Subtle decorative glows */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-bold tracking-wider uppercase text-stone-300">
                REPORT TERTUNDA
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('report')}
              className="text-xs font-semibold text-blue-300 hover:text-blue-200 flex items-center gap-1 transition-colors"
            >
              Lihat Detail
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-black tracking-tight text-white">
              {pendingReports.length}
            </span>
            <span className="text-sm font-medium text-stone-300">
              laporan tertunda
            </span>
          </div>

          {/* Metric Badges Grid: Prioritas, Menunggu, Selesai Hari Ini, Berkas, Website Aktif */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 my-2">
            <div className="bg-white/5 rounded-2xl p-2.5 text-center border border-white/10">
              <div className="flex items-center justify-center gap-1 text-rose-400 mb-0.5">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span className="text-base font-black">{priorityReports.length}</span>
              </div>
              <p className="text-[10px] font-semibold text-stone-300 uppercase tracking-tight">
                Prioritas
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-2.5 text-center border border-white/10">
              <div className="flex items-center justify-center gap-1 text-blue-400 mb-0.5">
                <Hourglass className="w-3.5 h-3.5" />
                <span className="text-base font-black">{waitingReports.length}</span>
              </div>
              <p className="text-[10px] font-semibold text-stone-300 uppercase tracking-tight">
                Menunggu
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-2.5 text-center border border-white/10">
              <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-base font-black">{completedTodayReports.length}</span>
              </div>
              <p className="text-[10px] font-semibold text-stone-300 uppercase tracking-tight">
                Selesai Hari Ini
              </p>
            </div>
          </div>

          {/* Quick secondary metrics: Berkas & Website Aktif */}
          <div className="flex items-center justify-between text-xs text-stone-300 pt-1 px-1">
            <div
              onClick={() => onNavigateTab('berkas')}
              className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors"
            >
              <FolderClosed className="w-3.5 h-3.5 text-blue-400" />
              <span>Berkas: <strong className="text-white font-bold">{filesCount}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Website Aktif: <strong className="text-white font-bold">{websites.filter((w) => Boolean(w.url)).length || 5}</strong></span>
            </div>
          </div>

          {/* + Tambah Report Baru */}
          <button
            type="button"
            onClick={onOpenAddReport}
            className="w-full mt-3 py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            + Tambah Report Baru
          </button>
        </div>
      </div>

      {/* 4. RECENT WORK / TERAKHIR DIGUNAKAN (Section 15) */}
      {recentWebsites.length > 0 && (
        <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-stone-900 tracking-tight flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              TERAKHIR DIGUNAKAN
            </h2>
            <span className="text-[10px] font-semibold text-stone-400">
              Riwayat Sesi
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {recentWebsites.map((site) => (
              <div
                key={`recent-${site.id}`}
                onClick={() => onOpenWebsiteInApp(site.id)}
                className="p-2.5 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-blue-50/40 hover:border-blue-200 cursor-pointer transition-all flex items-center gap-2.5 active:scale-98"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs"
                  style={{ backgroundColor: site.badgeColor || '#4f46e5' }}
                >
                  {site.logoUrl ? (
                    <img
                      src={site.logoUrl}
                      alt={site.name}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    <span>{site.shortCode}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-stone-900 truncate">
                    {site.name}
                  </h4>
                  <p className="text-[10px] text-stone-500 truncate">
                    {getRelativeTime(site.lastOpened)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. DAFTAR 12 WEBSITE OPERASIONAL (Section 6 & 7) */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              WEBSITE KERJA OPERASIONAL
            </h2>
            <p className="text-[11px] text-stone-500 font-medium">
              Semua website terbuka langsung di dalam aplikasi
            </p>
          </div>
          <span className="text-[11px] font-semibold text-stone-500 px-2 py-0.5 rounded-full bg-stone-100">
            {websites.length} Portal
          </span>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="space-y-2 pt-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchWeb}
              onChange={(e) => setSearchWeb(e.target.value)}
              placeholder="Cari nama, kode tab, atau kategori..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-stone-900 placeholder:text-stone-400"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setWebFilter('semua')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                webFilter === 'semua'
                  ? 'bg-blue-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Semua ({websites.length})
            </button>
            <button
              type="button"
              onClick={() => setWebFilter('favorit')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                webFilter === 'favorit'
                  ? 'bg-amber-500 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              Favorit ({websites.filter((w) => w.isFavorite).length})
            </button>
            <button
              type="button"
              onClick={() => setWebFilter('pin')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                webFilter === 'pin'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Pin className="w-3 h-3" />
              Dipin ({websites.filter((w) => w.isPinned).length})
            </button>
          </div>
        </div>

        {/* Website Cards List */}
        <div className="grid grid-cols-1 gap-2 pt-1">
          {filteredWebsites.map((item, index) => {
            const hasUrl = Boolean(item.url && item.url.trim());
            const isOpenTab = openTabIds.includes(item.id);

            return (
              <div
                key={`web-item-${item.id}-${index}`}
                onClick={() => onOpenWebsiteInApp(item.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  item.isPinned
                    ? 'border-blue-200 bg-blue-50/20'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  {/* Left: Logo/badge + Info */}
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 mt-0.5 shadow-xs"
                      style={{ backgroundColor: item.badgeColor || '#4f46e5' }}
                    >
                      {item.logoUrl ? (
                        <img
                          src={item.logoUrl}
                          alt={item.name}
                          className="w-full h-full rounded-xl object-cover"
                        />
                      ) : (
                        <span>{item.shortCode}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-xs font-bold text-stone-900 truncate">
                          {item.name}
                        </h3>
                        {item.isPinned && (
                          <span className="text-[10px] font-semibold text-blue-600 flex items-center gap-0.5">
                            <Pin className="w-2.5 h-2.5 fill-current" />
                          </span>
                        )}
                        {item.isFavorite && (
                          <span className="text-[10px] text-amber-500 flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-current" />
                          </span>
                        )}
                        {isOpenTab && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Tab Aktif
                          </span>
                        )}
                      </div>

                      {/* URL status or address */}
                      <p
                        className={`text-[11px] font-mono mt-0.5 truncate ${
                          hasUrl ? 'text-blue-600' : 'text-stone-400 italic'
                        }`}
                      >
                        {hasUrl ? item.url : 'URL belum diatur'}
                      </p>

                      {item.notes && (
                        <p className="text-[10px] text-stone-500 mt-1 line-clamp-1">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Pin button */}
                    <button
                      type="button"
                      onClick={(e) => handleTogglePin(item.id, e)}
                      title={item.isPinned ? 'Lepas Pin' : 'Pin ke atas'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        item.isPinned
                          ? 'text-blue-600 bg-blue-100'
                          : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    {/* Star button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleFav(item.id, e)}
                      title={item.isFavorite ? 'Hapus Favorit' : 'Jadikan Favorit'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        item.isFavorite
                          ? 'text-amber-500 bg-amber-50'
                          : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5" fill={item.isFavorite ? 'currentColor' : 'none'} />
                    </button>

                    {/* Edit URL / Logo */}
                    <button
                      type="button"
                      onClick={() => setEditingWebsite(item)}
                      title="Atur URL & Logo"
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Primary Buka Di Dalam Aplikasi button */}
                    <button
                      type="button"
                      onClick={() => onOpenWebsiteInApp(item.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all active:scale-95 ${
                        hasUrl
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                      }`}
                    >
                      <span>Buka</span>
                      <Layers className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Website / Logo / URL Modal */}
      <EditWebsiteModal
        isOpen={Boolean(editingWebsite)}
        onClose={() => setEditingWebsite(null)}
        website={editingWebsite}
        onSave={handleSaveEditedWebsite}
      />
    </div>
  );
};
