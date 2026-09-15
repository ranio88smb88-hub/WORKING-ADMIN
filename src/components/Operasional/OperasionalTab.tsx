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
} from 'lucide-react';
import { WebsiteItem, ReportItem, TabType } from '../../types';
import { EditWebsiteModal } from './EditWebsiteModal';
import { WebviewModal } from './WebviewModal';

interface OperasionalTabProps {
  websites: WebsiteItem[];
  reports: ReportItem[];
  onUpdateWebsites: (updated: WebsiteItem[]) => void;
  onNavigateTab: (tab: TabType) => void;
  onOpenAddReport: () => void;
  onSelectReport: (reportId: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const OperasionalTab: React.FC<OperasionalTabProps> = ({
  websites,
  reports,
  onUpdateWebsites,
  onNavigateTab,
  onOpenAddReport,
  onSelectReport,
  onShowToast,
}) => {
  const [searchWeb, setSearchWeb] = useState('');
  const [webFilter, setWebFilter] = useState<'semua' | 'favorit' | 'pin'>('semua');
  const [editingWebsite, setEditingWebsite] = useState<WebsiteItem | null>(null);
  const [webviewTarget, setWebviewTarget] = useState<WebsiteItem | null>(null);

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
            (item.notes && item.notes.toLowerCase().includes(q)) ||
            (item.category && item.category.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => {
        // Pinned first, then by order
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
    onShowToast(`URL "${updatedItem.name}" berhasil disimpan`);
  };

  const handleOpenWebsite = (item: WebsiteItem) => {
    if (!item.url || !item.url.trim()) {
      // Prompt to edit URL
      setEditingWebsite(item);
      onShowToast(`Silakan atur URL untuk "${item.name}" terlebih dahulu`, 'warning');
      return;
    }

    // Update last opened
    const updated = websites.map((w) =>
      w.id === item.id ? { ...w, lastOpened: new Date().toISOString() } : w
    );
    onUpdateWebsites(updated);

    // Open in new window or webview
    window.open(item.url, '_blank', 'noopener,noreferrer');
    onShowToast(`Membuka ${item.name}...`);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* 1. CARD UTAMA: REPORT TERTUNDA */}
      <div className="bg-gradient-to-br from-slate-900 via-stone-900 to-indigo-950 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

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
              Lihat Semua
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-black tracking-tight text-white">
              {pendingReports.length}
            </span>
            <span className="text-sm font-medium text-stone-300">
              laporan belum selesai
            </span>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 my-3">
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

          {/* Action Button: + Tambah Report */}
          <button
            type="button"
            onClick={onOpenAddReport}
            className="w-full mt-2 py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            + Tambah Report Baru
          </button>
        </div>
      </div>

      {/* 2. SECTION: WEBSITE KERJA */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              WEBSITE KERJA
            </h2>
            <p className="text-[11px] text-stone-500 font-medium">
              Pusat shortcut 12 website operasional
            </p>
          </div>
          <span className="text-[11px] font-semibold text-stone-500 px-2 py-0.5 rounded-full bg-stone-100">
            {websites.length} Portal
          </span>
        </div>

        {/* Search & Category Pills */}
        <div className="space-y-2 pt-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchWeb}
              onChange={(e) => setSearchWeb(e.target.value)}
              placeholder="Cari website kerja..."
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

        {/* Website Cards Grid */}
        <div className="grid grid-cols-1 gap-2 pt-1">
          {filteredWebsites.map((item, index) => {
            const hasUrl = Boolean(item.url && item.url.trim());

            return (
              <div
                key={`web-item-${item.id}-${index}`}
                className={`p-3 rounded-2xl border transition-all ${
                  item.isPinned
                    ? 'border-blue-200 bg-blue-50/20'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  {/* Left info */}
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        item.isPinned
                          ? 'bg-blue-600 text-white'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {item.order}
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
                  <div className="flex items-center gap-1 shrink-0">
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

                    {/* Edit URL button */}
                    <button
                      type="button"
                      onClick={() => setEditingWebsite(item)}
                      title="Atur URL"
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Primary BUKA button */}
                    <button
                      type="button"
                      onClick={() => handleOpenWebsite(item)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all active:scale-95 ${
                        hasUrl
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                      }`}
                    >
                      <span>Buka</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Sub row: internal webview shortcut if has URL */}
                {hasUrl && (
                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Status Siap
                    </span>
                    <button
                      type="button"
                      onClick={() => setWebviewTarget(item)}
                      className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Layers className="w-3 h-3" />
                      Webview Internal
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SECTION: LAPORAN PRIORITAS HARI INI */}
      {priorityReports.length > 0 && (
        <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-rose-600 flex items-center gap-1.5 uppercase tracking-wide">
              <AlertOctagon className="w-4 h-4" />
              Perlu Tindakan Cepat ({priorityReports.length})
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab('report')}
              className="text-xs font-semibold text-stone-500 hover:text-stone-900"
            >
              Semua
            </button>
          </div>

          <div className="space-y-2">
            {priorityReports.slice(0, 2).map((item, idx) => (
              <div
                key={`priority-card-${item.id}-${idx}`}
                onClick={() => onSelectReport(item.id)}
                className="p-3 rounded-2xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-rose-700">
                    {item.number}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                    🔴 PRIORITAS
                  </span>
                </div>
                <h3 className="text-xs font-bold text-stone-900 truncate">
                  {item.title}
                </h3>
                <p className="text-[11px] text-stone-600 line-clamp-1">
                  {item.description}
                </p>
                <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                  <span>Staff: {item.staff}</span>
                  <span>{item.date} {item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit URL Modal */}
      <EditWebsiteModal
        isOpen={Boolean(editingWebsite)}
        onClose={() => setEditingWebsite(null)}
        website={editingWebsite}
        onSave={handleSaveEditedWebsite}
      />

      {/* Internal Webview Modal */}
      <WebviewModal
        isOpen={Boolean(webviewTarget)}
        onClose={() => setWebviewTarget(null)}
        website={webviewTarget}
      />
    </div>
  );
};
