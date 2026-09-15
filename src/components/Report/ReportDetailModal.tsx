import React, { useState } from 'react';
import {
  X,
  Edit2,
  Paperclip,
  MessageSquarePlus,
  RefreshCw,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  History,
  Trash2,
  Copy,
  Plus,
} from 'lucide-react';
import { ReportItem, ReportStatus, ReportPriority } from '../../types';
import { copyToClipboard } from '../../utils/storage';

interface ReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportItem | null;
  onUpdateReport: (updated: ReportItem) => void;
  onDeleteReport: (id: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

const STATUS_BADGE_MAP: Record<ReportStatus, { label: string; bg: string; text: string; dot: string }> = {
  prioritas: { label: 'PRIORITAS', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
  tertunda: { label: 'TERTUNDA', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  menunggu: { label: 'MENUNGGU KONFIRMASI', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  selesai: { label: 'SELESAI', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  isOpen,
  onClose,
  report,
  onUpdateReport,
  onDeleteReport,
  onShowToast,
}) => {
  const [activeSubModal, setActiveSubModal] = useState<
    'none' | 'edit' | 'add_file' | 'add_note' | 'change_status'
  >('none');

  // Input states for sub-modals
  const [statusChoice, setStatusChoice] = useState<ReportStatus>('menunggu');
  const [statusReason, setStatusReason] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newFileName, setNewFileName] = useState('');

  // Edit fields
  const [editDesc, setEditDesc] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editStaff, setEditStaff] = useState('');
  const [editType, setEditType] = useState('');
  const [editPriority, setEditPriority] = useState<ReportPriority>('Tinggi');

  if (!isOpen || !report) return null;

  const currentBadge = STATUS_BADGE_MAP[report.status] || STATUS_BADGE_MAP.tertunda;

  const now = new Date();
  const timeNowFormatted = `${now.getDate()} Sep ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // 1. Tombol SELESAIKAN
  const handleResolveReport = () => {
    if (report.status === 'selesai') {
      onShowToast('Report ini sudah berstatus Selesai', 'info');
      return;
    }

    const updated: ReportItem = {
      ...report,
      status: 'selesai',
      history: [
        ...report.history,
        {
          id: `hist-${Date.now()}`,
          timestamp: timeNowFormatted,
          action: 'Status → Selesai',
          author: report.staff,
          details: 'Laporan ditandai selesai oleh operator',
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    onUpdateReport(updated);
    onShowToast(`Report ${report.number} berhasil diselesaikan!`, 'success');
  };

  // 2. Tombol UBAH STATUS
  const handleChangeStatusConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ReportItem = {
      ...report,
      status: statusChoice,
      history: [
        ...report.history,
        {
          id: `hist-${Date.now()}`,
          timestamp: timeNowFormatted,
          action: `Status → ${STATUS_BADGE_MAP[statusChoice].label}`,
          author: report.staff,
          details: statusReason.trim() || undefined,
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    onUpdateReport(updated);
    setActiveSubModal('none');
    setStatusReason('');
    onShowToast(`Status diubah ke ${STATUS_BADGE_MAP[statusChoice].label}`);
  };

  // 3. Tombol TAMBAH CATATAN
  const handleAddNoteConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const mergedNotes = report.notes
      ? `${report.notes}\n[${timeNowFormatted}] ${newNote.trim()}`
      : `[${timeNowFormatted}] ${newNote.trim()}`;

    const updated: ReportItem = {
      ...report,
      notes: mergedNotes,
      history: [
        ...report.history,
        {
          id: `hist-${Date.now()}`,
          timestamp: timeNowFormatted,
          action: 'Catatan ditambahkan',
          author: report.staff,
          details: newNote.trim(),
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    onUpdateReport(updated);
    setActiveSubModal('none');
    setNewNote('');
    onShowToast('Catatan baru berhasil ditambahkan');
  };

  // 4. Tombol TAMBAH FILE
  const handleAddFileConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const updated: ReportItem = {
      ...report,
      attachments: [
        ...report.attachments,
        { name: newFileName.trim(), size: '180 KB', type: 'application/octet-stream' },
      ],
      history: [
        ...report.history,
        {
          id: `hist-${Date.now()}`,
          timestamp: timeNowFormatted,
          action: `Lampiran "${newFileName.trim()}" diunggah`,
          author: report.staff,
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    onUpdateReport(updated);
    setActiveSubModal('none');
    setNewFileName('');
    onShowToast('File lampiran ditambahkan ke report');
  };

  // 5. Tombol EDIT
  const handleStartEdit = () => {
    setEditDesc(report.description);
    setEditNotes(report.notes);
    setEditStaff(report.staff);
    setEditType(report.reportType);
    setEditPriority(report.priority);
    setActiveSubModal('edit');
  };

  const handleSaveEditConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ReportItem = {
      ...report,
      description: editDesc.trim(),
      notes: editNotes.trim(),
      staff: editStaff.trim() || report.staff,
      reportType: editType.trim() || report.reportType,
      priority: editPriority,
      history: [
        ...report.history,
        {
          id: `hist-${Date.now()}`,
          timestamp: timeNowFormatted,
          action: 'Detail report diperbarui',
          author: editStaff.trim() || report.staff,
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    onUpdateReport(updated);
    setActiveSubModal('none');
    onShowToast('Detail report berhasil diperbarui');
  };

  const handleCopyReportSummary = async () => {
    const text = `REPORT ${report.number}\nJenis: ${report.reportType}\nTanggal: ${report.date} ${report.time}\nStaff: ${report.staff}\nStatus: ${STATUS_BADGE_MAP[report.status].label}\nPrioritas: ${report.priority}\n\nKeterangan:\n${report.description}\n\nCatatan:\n${report.notes || '-'}`;
    const ok = await copyToClipboard(text);
    if (ok) onShowToast('Format report disalin ke clipboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="fixed inset-0 bg-transparent" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden z-10 animate-in fade-in slide-in-from-bottom duration-200">
        {/* Top Bar with Number & Close */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-blue-600 text-white shadow-xs">
              REPORT {report.number}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${currentBadge.bg} ${currentBadge.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentBadge.dot}`} />
              {currentBadge.label}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopyReportSummary}
              title="Salin ringkasan"
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 space-y-4 text-xs max-h-[72vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-2xl border border-stone-100">
            <div>
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-tight block">
                Jenis Report
              </span>
              <span className="text-xs font-bold text-stone-900">
                {report.reportType}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-tight block">
                Staff / Operator
              </span>
              <span className="text-xs font-bold text-stone-900">
                {report.staff}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-tight block">
                Tanggal & Jam
              </span>
              <span className="text-[11px] font-medium text-stone-700">
                {report.date} • {report.time} WIB
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-tight block">
                Prioritas
              </span>
              <span
                className={`text-[11px] font-bold ${
                  report.priority === 'Tinggi'
                    ? 'text-rose-600'
                    : report.priority === 'Sedang'
                    ? 'text-amber-600'
                    : 'text-stone-600'
                }`}
              >
                {report.priority}
              </span>
            </div>
          </div>

          {/* Keterangan */}
          <div className="p-3.5 rounded-2xl border border-stone-200 bg-white">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Keterangan:
            </span>
            <p className="text-xs text-stone-800 leading-relaxed whitespace-pre-wrap font-medium">
              {report.description}
            </p>
          </div>

          {/* Lampiran / File */}
          <div className="p-3 rounded-2xl border border-stone-200 bg-white">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Lampiran ({report.attachments.length}):
              </span>
              <button
                type="button"
                onClick={() => setActiveSubModal('add_file')}
                className="text-blue-600 font-bold text-[11px] flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3 h-3" /> Tambah File
              </button>
            </div>
            {report.attachments.length === 0 ? (
              <p className="text-[11px] text-stone-400 italic">Belum ada lampiran file</p>
            ) : (
              <div className="space-y-1.5">
                {report.attachments.map((file, idx) => (
                  <div
                    key={`att-${idx}`}
                    className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-100 text-[11px]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="font-semibold text-stone-800 truncate">
                        {file.name}
                      </span>
                    </div>
                    {file.size && (
                      <span className="text-[10px] text-stone-400 shrink-0">
                        {file.size}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Catatan */}
          <div className="p-3 rounded-2xl border border-stone-200 bg-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Catatan:
              </span>
              <button
                type="button"
                onClick={() => setActiveSubModal('add_note')}
                className="text-blue-600 font-bold text-[11px] flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3 h-3" /> Tambah Catatan
              </button>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-wrap">
              {report.notes || 'Belum ada catatan internal.'}
            </p>
          </div>

          {/* RIWAYAT PERUBAHAN / HISTORY TIMELINE */}
          <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <History className="w-3.5 h-3.5 text-blue-600" />
              Riwayat Perubahan (History)
            </span>

            <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 pl-5">
              {report.history.map((h, idx) => (
                <div key={`hist-row-${h.id || idx}`} className="relative text-[11px]">
                  <div className="absolute -left-5 top-1 w-2 h-2 rounded-full bg-blue-600 ring-4 ring-white" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{h.action}</span>
                    <span className="text-[10px] text-stone-400">{h.timestamp}</span>
                  </div>
                  {h.details && (
                    <p className="text-[10px] text-stone-600 mt-0.5">{h.details}</p>
                  )}
                  {h.author && (
                    <span className="text-[9px] text-stone-400 block mt-0.5">
                      Oleh: {h.author}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ACTION BUTTONS (Section 6 Requirement) */}
          {/* [ EDIT ] [ TAMBAH FILE ] [ TAMBAH CATATAN ] [ UBAH STATUS ] [ SELESAIKAN ] */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleStartEdit}
                className="py-2 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 font-bold text-stone-700 flex items-center justify-center gap-1.5 text-xs shadow-xs"
              >
                <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                EDIT
              </button>

              <button
                type="button"
                onClick={() => setActiveSubModal('add_file')}
                className="py-2 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 font-bold text-stone-700 flex items-center justify-center gap-1.5 text-xs shadow-xs"
              >
                <Paperclip className="w-3.5 h-3.5 text-stone-500" />
                TAMBAH FILE
              </button>

              <button
                type="button"
                onClick={() => setActiveSubModal('add_note')}
                className="py-2 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 font-bold text-stone-700 flex items-center justify-center gap-1.5 text-xs shadow-xs"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-stone-500" />
                TAMBAH CATATAN
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusChoice(report.status);
                  setActiveSubModal('change_status');
                }}
                className="py-2 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 font-bold text-blue-600 flex items-center justify-center gap-1.5 text-xs shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                UBAH STATUS
              </button>
            </div>

            {/* SELESAIKAN (Full width primary button) */}
            <button
              type="button"
              onClick={handleResolveReport}
              disabled={report.status === 'selesai'}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                report.status === 'selesai'
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {report.status === 'selesai' ? 'LAPORAN SUDAH SELESAI' : 'SELESAIKAN REPORT'}
            </button>
          </div>

          {/* Delete Option */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Hapus report ${report.number} secara permanen?`)) {
                  onDeleteReport(report.id);
                  onClose();
                  onShowToast(`Report ${report.number} dihapus`);
                }
              }}
              className="text-stone-400 hover:text-rose-600 text-[11px] font-semibold inline-flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Hapus Report Ini
            </button>
          </div>
        </div>

        {/* SUB MODAL: UBAH STATUS */}
        {activeSubModal === 'change_status' && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs p-4 flex flex-col justify-center animate-in fade-in duration-150 z-20">
            <h3 className="text-sm font-bold text-stone-900 mb-3">
              Ubah Status Report {report.number}
            </h3>
            <form onSubmit={handleChangeStatusConfirm} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                {(['prioritas', 'tertunda', 'menunggu', 'selesai'] as ReportStatus[]).map(
                  (st) => {
                    const badge = STATUS_BADGE_MAP[st];
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusChoice(st)}
                        className={`p-2 rounded-xl border text-xs font-bold text-left transition-all ${
                          statusChoice === st
                            ? `${badge.bg} ${badge.text} ring-2 ring-blue-500/20`
                            : 'bg-white border-stone-200 text-stone-600'
                        }`}
                      >
                        {badge.label}
                      </button>
                    );
                  }
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Keterangan Perubahan (Masuk ke History)
                </label>
                <input
                  type="text"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Contoh: Sudah konfirmasi ke supervisor finance"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSubModal('none')}
                  className="flex-1 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Simpan Status
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SUB MODAL: TAMBAH CATATAN */}
        {activeSubModal === 'add_note' && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs p-4 flex flex-col justify-center animate-in fade-in duration-150 z-20">
            <h3 className="text-sm font-bold text-stone-900 mb-2">
              Tambah Catatan Internal
            </h3>
            <form onSubmit={handleAddNoteConfirm} className="space-y-3 text-xs">
              <textarea
                required
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={4}
                placeholder="Tuliskan catatan progres atau detail klarifikasi..."
                className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:bg-white resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSubModal('none')}
                  className="flex-1 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SUB MODAL: TAMBAH FILE */}
        {activeSubModal === 'add_file' && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs p-4 flex flex-col justify-center animate-in fade-in duration-150 z-20">
            <h3 className="text-sm font-bold text-stone-900 mb-2">
              Tambah Lampiran File
            </h3>
            <form onSubmit={handleAddFileConfirm} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama File / Bukti
                </label>
                <input
                  type="text"
                  required
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="Contoh: bukti_mutasi_bank.png"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSubModal('none')}
                  className="flex-1 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Tambahkan
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SUB MODAL: EDIT REPORT */}
        {activeSubModal === 'edit' && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs p-4 flex flex-col justify-center animate-in fade-in duration-150 z-20 overflow-y-auto">
            <h3 className="text-sm font-bold text-stone-900 mb-2">
              Edit Data Report {report.number}
            </h3>
            <form onSubmit={handleSaveEditConfirm} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Jenis Report
                </label>
                <input
                  type="text"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Staff PIC
                </label>
                <input
                  type="text"
                  value={editStaff}
                  onChange={(e) => setEditStaff(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Keterangan
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSubModal('none')}
                  className="flex-1 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
