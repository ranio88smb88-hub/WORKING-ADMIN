import React, { useState } from 'react';
import {
  X,
  Download,
  Share2,
  Trash2,
  FileText,
  Copy,
  Check,
  Calendar,
  Tag,
  Info,
  Edit3,
} from 'lucide-react';
import { WorkFileItem } from '../../types';
import { copyToClipboard } from '../../utils/storage';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: WorkFileItem | null;
  onDelete: (id: string) => void;
  onUpdateNote: (id: string, newNote: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  file,
  onDelete,
  onUpdateNote,
  onShowToast,
}) => {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!isOpen || !file) return null;

  const handleStartEditNote = () => {
    setNoteValue(file.notes || '');
    setIsEditingNote(true);
  };

  const handleSaveNote = () => {
    onUpdateNote(file.id, noteValue.trim());
    setIsEditingNote(false);
    onShowToast('Catatan berkas diperbarui');
  };

  const handleCopyDetails = async () => {
    const text = `BERKAS KERJA: ${file.name}\nKategori: ${file.category}\nTanggal: ${file.date} ${file.time || ''}\nStatus: ${file.status || 'Aktif'}\nCatatan: ${file.notes || '-'}`;
    const ok = await copyToClipboard(text);
    if (ok) onShowToast('Detail berkas disalin ke clipboard');
  };

  const handleDownload = () => {
    if (file.dataUrl) {
      const a = document.createElement('a');
      a.href = file.dataUrl;
      a.download = file.name;
      a.click();
    } else {
      // Mock download text metadata
      const blob = new Blob([`Nama File: ${file.name}\nKategori: ${file.category}\nCatatan: ${file.notes || ''}`], {
        type: 'text/plain;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
    onShowToast(`Mengunduh ${file.name}...`);
  };

  const handleDeleteFile = () => {
    onDelete(file.id);
    setShowConfirmDelete(false);
    onClose();
    onShowToast(`Berkas "${file.name}" dihapus`);
  };

  const isImage = ['png', 'jpg', 'jpeg', 'webp'].includes(file.fileType.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="fixed inset-0 bg-transparent" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden z-10 animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="truncate pr-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
              {file.category}
            </span>
            <h2 className="text-sm font-bold text-stone-900 truncate mt-1">
              {file.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto">
          {/* File Visual Preview */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden flex items-center justify-center p-4 min-h-[140px]">
            {isImage && file.dataUrl ? (
              <img
                src={file.dataUrl}
                alt={file.name}
                className="max-h-56 object-contain rounded-lg"
              />
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-center mx-auto mb-2 text-blue-600">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Format: {file.fileType}
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">{file.size || 'Ukuran terdeteksi'}</p>
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-400 block mb-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Tanggal Dibuat
              </span>
              <span className="font-semibold text-stone-800">
                {file.date} {file.time ? `• ${file.time}` : ''}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-400 block mb-0.5 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Status Berkas
              </span>
              <span className="font-semibold text-emerald-600">
                {file.status || 'Aktif'}
              </span>
            </div>
          </div>

          {/* Notes Section */}
          <div className="p-3 rounded-2xl border border-stone-200 bg-white">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-stone-800 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                Catatan Berkas
              </span>
              {!isEditingNote && (
                <button
                  type="button"
                  onClick={handleStartEditNote}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold text-[11px]"
                >
                  <Edit3 className="w-3 h-3" /> Edit Catatan
                </button>
              )}
            </div>

            {isEditingNote ? (
              <div className="space-y-2 pt-1">
                <textarea
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
                  rows={2}
                  className="w-full p-2 text-xs border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsEditingNote(false)}
                    className="px-2.5 py-1 rounded-lg border text-stone-600 text-[11px]"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold text-[11px]"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-stone-600 text-[11px] leading-relaxed">
                {file.notes || 'Belum ada catatan untuk berkas ini.'}
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Unduh
            </button>
            <button
              type="button"
              onClick={handleCopyDetails}
              className="flex-1 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> Salin Info
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold flex items-center justify-center transition-colors"
              title="Hapus Berkas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Delete Confirmation Alert */}
          {showConfirmDelete && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
              <p className="font-bold text-xs">Konfirmasi Hapus Berkas?</p>
              <p className="text-[11px] text-rose-600">
                Tindakan ini tidak dapat dibatalkan. Berkas akan dihapus permanen dari penyimpanan lokal.
              </p>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-3 py-1 rounded-lg border border-rose-300 text-rose-700 font-semibold text-xs"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteFile}
                  className="px-3 py-1 rounded-lg bg-rose-600 text-white font-semibold text-xs"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
