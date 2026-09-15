import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, Check, Plus } from 'lucide-react';
import { WorkFileItem, FileCategory } from '../../types';

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFile: (file: WorkFileItem) => void;
}

const CATEGORIES: Exclude<FileCategory, 'Semua'>[] = [
  'Withdraw',
  'Deposit',
  'Kas',
  'CS',
  'Promo',
  'Operasional',
  'Lainnya',
];

export const UploadFileModal: React.FC<UploadFileModalProps> = ({
  isOpen,
  onClose,
  onAddFile,
}) => {
  const [fileName, setFileName] = useState('');
  const [category, setCategory] = useState<Exclude<FileCategory, 'Semua'>>('Withdraw');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Aktif');
  const [fileSize, setFileSize] = useState('120 KB');
  const [fileExt, setFileExt] = useState('png');
  const [fileDataUrl, setFileDataUrl] = useState<string | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    setFileName(file.name);
    // Format size
    const kb = Math.round(file.size / 1024);
    setFileSize(kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);
    
    // Format ext
    const parts = file.name.split('.');
    const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : 'txt';
    setFileExt(ext);

    // Read base64 for image / preview if image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileDataUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFileDataUrl(undefined);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newFile: WorkFileItem = {
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: fileName.trim(),
      fileType: fileExt,
      category,
      date: dateStr,
      time: timeStr,
      size: fileSize,
      notes: notes.trim(),
      status: status.trim() || 'Tersimpan',
      dataUrl: fileDataUrl,
      createdAt: now.toISOString(),
    };

    onAddFile(newFile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="fixed inset-0 bg-transparent" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden z-10 animate-in fade-in slide-in-from-bottom duration-200">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">Upload Berkas Kerja</h2>
              <p className="text-[11px] text-stone-500 font-medium">
                JPG, PNG, WEBP, PDF, TXT, DOCX, XLSX, CSV
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-stone-200 hover:border-stone-300 bg-stone-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,.txt,.doc,.docx,.xls,.xlsx,.csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />
            <div className="w-10 h-10 rounded-full bg-white shadow-xs mx-auto flex items-center justify-center text-blue-600 mb-2">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-stone-800">
              {fileName ? fileName : 'Pilih atau Tarik Berkas ke Sini'}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {fileSize ? `Ukuran: ${fileSize}` : 'Maksimal ukuran standar dokumen operasional'}
            </p>
          </div>

          {/* Nama File */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nama Berkas
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Contoh: Bukti_Transfer_WD_9921.png"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-xs text-stone-900"
              />
            </div>
          </div>

          {/* Kategori Pills */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Kategori Berkas
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat, idx) => (
                <button
                  key={`upload-cat-${cat}-${idx}`}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    category === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Status Berkas */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Status Berkas
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-900 focus:bg-white focus:outline-hidden"
            >
              <option value="Aktif">Aktif</option>
              <option value="Terverifikasi">Terverifikasi</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Selesai">Selesai</option>
              <option value="Arsip">Arsip</option>
            </select>
          </div>

          {/* Catatan Berkas */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Catatan / Referensi
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Catatan nomor transaksi, ID member, atau shift..."
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden text-xs text-stone-900 resize-none"
            />
          </div>

          {/* Buttons */}
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
              disabled={!fileName.trim()}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              Simpan Berkas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
