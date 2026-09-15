import React, { useState, useMemo } from 'react';
import {
  Clock,
  Search,
  Plus,
  Filter,
  AlertOctagon,
  Hourglass,
  CheckCircle2,
  Paperclip,
  User,
  Calendar,
  Layers,
} from 'lucide-react';
import { ReportItem, ReportStatus } from '../../types';
import { AddReportModal } from './AddReportModal';
import { ReportDetailModal } from './ReportDetailModal';

interface ReportTabProps {
  reports: ReportItem[];
  onUpdateReports: (updated: ReportItem[]) => void;
  selectedReportId: string | null;
  onSelectReportId: (id: string | null) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

type StatusFilterType = 'Semua' | 'Prioritas' | 'Tertunda' | 'Menunggu' | 'Selesai';

const STATUS_FILTERS: { id: StatusFilterType; status?: ReportStatus; label: string; icon: string }[] = [
  { id: 'Semua', label: 'Semua', icon: '📋' },
  { id: 'Prioritas', status: 'prioritas', label: 'Prioritas', icon: '🔴' },
  { id: 'Tertunda', status: 'tertunda', label: 'Tertunda', icon: '🟡' },
  { id: 'Menunggu', status: 'menunggu', label: 'Menunggu', icon: '🔵' },
  { id: 'Selesai', status: 'selesai', label: 'Selesai', icon: '🟢' },
];

export const ReportTab: React.FC<ReportTabProps> = ({
  reports,
  onUpdateReports,
  selectedReportId,
  onSelectReportId,
  onShowToast,
}) => {
  const [activeFilter, setActiveFilter] = useState<StatusFilterType>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Compute next report number
  const nextNumber = useMemo(() => {
    const nums = reports.map((r) => {
      const match = r.number.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `#${String(max + 1).padStart(5, '0')}`;
  }, [reports]);

  // Selected report object
  const activeReport = useMemo(() => {
    if (!selectedReportId) return null;
    return reports.find((r) => r.id === selectedReportId) || null;
  }, [reports, selectedReportId]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      // Filter status
      if (activeFilter === 'Prioritas' && item.status !== 'prioritas') return false;
      if (activeFilter === 'Tertunda' && item.status !== 'tertunda') return false;
      if (activeFilter === 'Menunggu' && item.status !== 'menunggu') return false;
      if (activeFilter === 'Selesai' && item.status !== 'selesai') return false;

      // Filter search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.number.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.reportType.toLowerCase().includes(q) ||
          item.staff.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [reports, activeFilter, searchQuery]);

  const handleAddReport = (newReport: ReportItem) => {
    onUpdateReports([newReport, ...reports]);
    onShowToast(`Report ${newReport.number} berhasil ditambahkan!`, 'success');
  };

  const handleUpdateReport = (updated: ReportItem) => {
    onUpdateReports(reports.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleDeleteReport = (id: string) => {
    onUpdateReports(reports.filter((r) => r.id !== id));
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'prioritas':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            🔴 PRIORITAS
          </span>
        );
      case 'tertunda':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            🟡 TERTUNDA
          </span>
        );
      case 'menunggu':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            🔵 MENUNGGU
          </span>
        );
      case 'selesai':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            🟢 SELESAI
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              REPORT TERTUNDA
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              Pusat kelola tiket kendala & laporan operasional
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Cari ID report, jenis, staff, atau kendala..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-xs text-stone-900"
          />
        </div>

        {/* Status Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {STATUS_FILTERS.map((item, idx) => {
            const count =
              item.id === 'Semua'
                ? reports.length
                : reports.filter((r) => r.status === item.status).length;

            return (
              <button
                key={`p-status-${item.id}-${idx}`}
                type="button"
                onClick={() => setActiveFilter(item.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeFilter === item.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{item.icon} {item.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeFilter === item.id
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-2.5">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-stone-200/80 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-stone-700">Tidak Ada Laporan</p>
            <p className="text-[11px] text-stone-400">
              Tidak ada data laporan untuk filter &quot;{activeFilter}&quot;.
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-2 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
            >
              + Tambah Report Baru
            </button>
          </div>
        ) : (
          filteredReports.map((item, idx) => {
            return (
              <div
                key={`report-row-${item.id}-${idx}`}
                onClick={() => onSelectReportId(item.id)}
                className="bg-white rounded-2xl border border-stone-200/80 p-3.5 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer space-y-2"
              >
                {/* Header row: ID Number + Status Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-stone-100 text-stone-800">
                      {item.number}
                    </span>
                    <span className="text-xs font-bold text-stone-900 truncate">
                      {item.reportType}
                    </span>
                  </div>
                  <div>{getStatusBadge(item.status)}</div>
                </div>

                {/* Description Preview */}
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Meta details footer */}
                <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-100">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-medium text-stone-600">
                      <User className="w-3 h-3 text-stone-400" />
                      {item.staff}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      {item.date} • {item.time}
                    </span>
                  </div>

                  {item.attachments.length > 0 && (
                    <span className="flex items-center gap-1 text-stone-500 font-semibold text-[10px] bg-stone-100 px-1.5 py-0.5 rounded-md">
                      <Paperclip className="w-3 h-3" />
                      {item.attachments.length} file
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Report Modal */}
      <AddReportModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddReport={handleAddReport}
        nextNumber={nextNumber}
      />

      {/* Detail Report Modal */}
      <ReportDetailModal
        isOpen={Boolean(activeReport)}
        onClose={() => onSelectReportId(null)}
        report={activeReport}
        onUpdateReport={handleUpdateReport}
        onDeleteReport={handleDeleteReport}
        onShowToast={onShowToast}
      />
    </div>
  );
};
