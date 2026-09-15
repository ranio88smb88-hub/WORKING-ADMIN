import React, { useState } from 'react';
import { X, Plus, Calendar, Clock, User, AlertCircle, FileText, Check } from 'lucide-react';
import { ReportItem, ReportStatus, ReportPriority } from '../../types';

interface AddReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReport: (report: ReportItem) => void;
  nextNumber: string;
}

const REPORT_TYPES = [
  'Double Withdraw',
  'Selisih Saldo',
  'Pending Deposit',
  'Keluhan Member',
  'Kendala Provider',
  'Mutasi Tidak Masuk',
  'Koreksi Bonus',
  'Lainnya',
];

export const AddReportModal: React.FC<AddReportModalProps> = ({
  isOpen,
  onClose,
  onAddReport,
  nextNumber,
}) => {
  const now = new Date();
  const todayStr = `${now.getDate()} September ${now.getFullYear()}`;
  const timeNow = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [reportType, setReportType] = useState('Double Withdraw');
  const [customType, setCustomType] = useState('');
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(timeNow);
  const [staff, setStaff] = useState('Poipet');
  const [priority, setPriority] = useState<ReportPriority>('Tinggi');
  const [status, setStatus] = useState<ReportStatus>('tertunda');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [reminder, setReminder] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalType = reportType === 'Lainnya' && customType.trim() ? customType.trim() : reportType;

    const newId = `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const timeFormatted = time.trim() || timeNow;
    const dateFormatted = date.trim() || todayStr;

    const attachments = attachmentName.trim()
      ? [{ name: attachmentName.trim(), size: '150 KB', type: 'application/octet-stream' }]
      : [];

    const newReport: ReportItem = {
      id: newId,
      number: nextNumber,
      title: `${finalType} - ${staff}`,
      reportType: finalType,
      date: dateFormatted,
      time: timeFormatted,
      staff: staff.trim() || 'Admin',
      status,
      priority,
      description: description.trim(),
      notes: notes.trim(),
      reminder: reminder.trim() || undefined,
      attachments,
      history: [
        {
          id: `hist-${Date.now()}-0`,
          timestamp: `${now.getDate()} Sep ${timeFormatted}`,
          action: 'Report dibuat',
          author: staff.trim() || 'Admin',
          details: `Laporan dibuat dengan status ${status.toUpperCase()} (${priority})`,
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    onAddReport(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="fixed inset-0 bg-transparent" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden z-10 animate-in fade-in slide-in-from-bottom duration-200">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
              {nextNumber}
            </span>
            <h2 className="text-sm font-bold text-stone-900">Buat Report Baru</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs max-h-[80vh] overflow-y-auto">
          {/* Jenis Report */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Jenis Report
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:bg-white text-xs"
            >
              {REPORT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {reportType === 'Lainnya' && (
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Tuliskan jenis laporan..."
                className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs"
              />
            )}
          </div>

          {/* Tanggal, Jam & Staff */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Tanggal
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="16 September 2026"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Jam (WIB)
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="01:20"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs"
              />
            </div>
          </div>

          {/* Staff / Operator */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Staff / Operator PIC
            </label>
            <input
              type="text"
              required
              value={staff}
              onChange={(e) => setStaff(e.target.value)}
              placeholder="Contoh: Poipet / Rian / Siti"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs"
            />
          </div>

          {/* Status Pills */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Status Awal
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setStatus('prioritas')}
                className={`p-2 rounded-xl border text-left flex items-center gap-1.5 text-xs font-semibold ${
                  status === 'prioritas'
                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-stone-200 text-stone-600'
                }`}
              >
                <span>🔴 PRIORITAS</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus('tertunda')}
                className={`p-2 rounded-xl border text-left flex items-center gap-1.5 text-xs font-semibold ${
                  status === 'tertunda'
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-stone-200 text-stone-600'
                }`}
              >
                <span>🟡 TERTUNDA</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus('menunggu')}
                className={`p-2 rounded-xl border text-left flex items-center gap-1.5 text-xs font-semibold ${
                  status === 'menunggu'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-stone-200 text-stone-600'
                }`}
              >
                <span>🔵 MENUNGGU</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus('selesai')}
                className={`p-2 rounded-xl border text-left flex items-center gap-1.5 text-xs font-semibold ${
                  status === 'selesai'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-stone-200 text-stone-600'
                }`}
              >
                <span>🟢 SELESAI</span>
              </button>
            </div>
          </div>

          {/* Prioritas */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Tingkat Prioritas
            </label>
            <div className="flex gap-2">
              {(['Tinggi', 'Sedang', 'Rendah'] as ReportPriority[]).map((p) => (
                <button
                  key={`prio-btn-${p}`}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-1.5 rounded-xl border font-semibold text-xs ${
                    priority === p
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 text-stone-600 border-stone-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Keterangan Lengkap
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Jelaskan kendala: User ID, nominal saldo, kronologi kejadian..."
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white resize-none"
            />
          </div>

          {/* Lampiran */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nama Lampiran / Bukti
            </label>
            <input
              type="text"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              placeholder="Contoh: bukti_wd_bca.png, mutasi.pdf"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs"
            />
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Catatan Internal
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Catatan tambahan untuk tim / supervisor..."
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white resize-none"
            />
          </div>

          {/* Reminder / Deadline */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Pengingat / Deadline
            </label>
            <input
              type="text"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              placeholder="Contoh: 16 Sep 2026, 03:00"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              Simpan Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
