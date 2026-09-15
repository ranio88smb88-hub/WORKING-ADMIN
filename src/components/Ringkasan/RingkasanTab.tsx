import React from 'react';
import {
  LayoutGrid,
  Clock,
  FolderClosed,
  Globe,
  CheckCircle2,
  AlertOctagon,
  Hourglass,
  Star,
  Copy,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { ReportItem, WorkFileItem, WebsiteItem, TabType } from '../../types';
import { copyToClipboard } from '../../utils/storage';

interface RingkasanTabProps {
  reports: ReportItem[];
  files: WorkFileItem[];
  websites: WebsiteItem[];
  onNavigateTab: (tab: TabType) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const RingkasanTab: React.FC<RingkasanTabProps> = ({
  reports,
  files,
  websites,
  onNavigateTab,
  onShowToast,
}) => {
  const totalReports = reports.length;
  const pendingReports = reports.filter((r) => r.status === 'tertunda').length;
  const priorityReports = reports.filter((r) => r.status === 'prioritas').length;
  const waitingReports = reports.filter((r) => r.status === 'menunggu').length;
  const completedReports = reports.filter((r) => r.status === 'selesai').length;

  const totalFiles = files.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const filesToday = files.filter((f) => f.date === todayStr).length;

  const totalWebsites = websites.length;
  const favoriteWebsites = websites.filter((w) => w.isFavorite).length;
  const configuredWebsites = websites.filter((w) => w.url && w.url.trim()).length;

  const handleCopySummary = async () => {
    const text = `📊 REKAP ADMIN WORK CENTER\nTanggal: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}\n\n` +
      `[ REPORT TERTUNDA ]\n` +
      `• Total Laporan: ${totalReports}\n` +
      `• Prioritas: ${priorityReports}\n` +
      `• Tertunda: ${pendingReports}\n` +
      `• Menunggu Konfirmasi: ${waitingReports}\n` +
      `• Selesai: ${completedReports}\n\n` +
      `[ BERKAS KERJA ]\n` +
      `• Total Berkas: ${totalFiles}\n` +
      `• Berkas Hari Ini: ${filesToday}\n\n` +
      `[ WEBSITE OPERASIONAL ]\n` +
      `• Portal Aktif: ${configuredWebsites}/${totalWebsites}\n` +
      `• Portal Favorit: ${favoriteWebsites}`;

    const ok = await copyToClipboard(text);
    if (ok) onShowToast('Rekapitulasi disalin untuk laporan shift!', 'success');
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-blue-600" />
            RINGKASAN OPERASIONAL
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            Statistik sederhana & rekapitulasi shift kerja
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopySummary}
          className="px-3 py-2 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 transition-colors active:scale-95"
          title="Salin Rekap Shift"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Salin Rekap</span>
        </button>
      </div>

      {/* 1. REPORT HARI INI */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              REPORT HARI INI
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('report')}
            className="text-[11px] font-semibold text-blue-600 hover:underline"
          >
            Buka Tiket
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 text-center">
            <span className="text-[11px] text-stone-500 font-medium block">Total Report</span>
            <span className="text-2xl font-black text-stone-900">{totalReports}</span>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 text-center">
            <span className="text-[11px] text-rose-600 font-semibold block flex items-center justify-center gap-1">
              <AlertOctagon className="w-3 h-3" /> Prioritas
            </span>
            <span className="text-2xl font-black text-rose-700">{priorityReports}</span>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
            <span className="text-[11px] text-blue-600 font-semibold block flex items-center justify-center gap-1">
              <Hourglass className="w-3 h-3" /> Menunggu
            </span>
            <span className="text-2xl font-black text-blue-700">{waitingReports}</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
            <span className="text-[11px] text-emerald-600 font-semibold block flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Selesai
            </span>
            <span className="text-2xl font-black text-emerald-700">{completedReports}</span>
          </div>
        </div>

        {/* Status Bar Indicator */}
        {totalReports > 0 && (
          <div className="pt-2">
            <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden flex">
              <div
                style={{ width: `${(priorityReports / totalReports) * 100}%` }}
                className="bg-rose-500"
                title={`Prioritas: ${priorityReports}`}
              />
              <div
                style={{ width: `${(waitingReports / totalReports) * 100}%` }}
                className="bg-blue-500"
                title={`Menunggu: ${waitingReports}`}
              />
              <div
                style={{ width: `${(pendingReports / totalReports) * 100}%` }}
                className="bg-amber-500"
                title={`Tertunda: ${pendingReports}`}
              />
              <div
                style={{ width: `${(completedReports / totalReports) * 100}%` }}
                className="bg-emerald-500"
                title={`Selesai: ${completedReports}`}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. BERKAS */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderClosed className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              BERKAS KERJA
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('berkas')}
            className="text-[11px] font-semibold text-blue-600 hover:underline"
          >
            Lihat File
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <span className="text-[11px] text-indigo-700 font-medium block">Total File Tersimpan</span>
            <span className="text-2xl font-black text-indigo-950 mt-1 block">{totalFiles}</span>
            <span className="text-[10px] text-indigo-500 mt-0.5 block">Format: JPG, PDF, XLSX, CSV</span>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
            <span className="text-[11px] text-stone-600 font-medium block">File Diunggah Hari Ini</span>
            <span className="text-2xl font-black text-stone-900 mt-1 block">{filesToday}</span>
            <span className="text-[10px] text-stone-400 mt-0.5 block">Pergantian shift aktif</span>
          </div>
        </div>
      </div>

      {/* 3. WEBSITE KERJA */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              WEBSITE KERJA
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('operasional')}
            className="text-[11px] font-semibold text-blue-600 hover:underline"
          >
            Buka Portal
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
            <span className="text-[11px] text-stone-500 font-medium block">Total Shortcut</span>
            <span className="text-xl font-black text-stone-900 mt-1 block">{totalWebsites}</span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
            <span className="text-[11px] text-amber-700 font-semibold block flex items-center justify-center gap-1">
              <Star className="w-3 h-3 fill-current" /> Favorit
            </span>
            <span className="text-xl font-black text-amber-900 mt-1 block">{favoriteWebsites}</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-[11px] text-emerald-700 font-semibold block">URL Terisi</span>
            <span className="text-xl font-black text-emerald-900 mt-1 block">
              {configuredWebsites}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
