import React, { useState, useMemo } from 'react';
import {
  Upload,
  Search,
  FolderClosed,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  ArrowUpDown,
  Filter,
  Plus,
  Clock,
  MoreVertical,
} from 'lucide-react';
import { WorkFileItem, FileCategory } from '../../types';
import { UploadFileModal } from './UploadFileModal';
import { FilePreviewModal } from './FilePreviewModal';

interface BerkasTabProps {
  files: WorkFileItem[];
  onUpdateFiles: (updated: WorkFileItem[]) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

const CATEGORIES: FileCategory[] = [
  'Semua',
  'Withdraw',
  'Deposit',
  'Kas',
  'CS',
  'Promo',
  'Operasional',
  'Lainnya',
];

export const BerkasTab: React.FC<BerkasTabProps> = ({
  files,
  onUpdateFiles,
  onShowToast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FileCategory>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'name'>('date-desc');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<WorkFileItem | null>(null);

  const filteredFiles = useMemo(() => {
    return files
      .filter((file) => {
        if (selectedCategory !== 'Semua' && file.category !== selectedCategory) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            file.name.toLowerCase().includes(q) ||
            (file.notes && file.notes.toLowerCase().includes(q)) ||
            (file.status && file.status.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'date-asc') return (a.date || '').localeCompare(b.date || '');
        return (b.date || '').localeCompare(a.date || '');
      });
  }, [files, selectedCategory, searchQuery, sortBy]);

  const handleAddFile = (newFile: WorkFileItem) => {
    onUpdateFiles([newFile, ...files]);
    onShowToast(`Berkas "${newFile.name}" berhasil diunggah`);
  };

  const handleDeleteFile = (id: string) => {
    onUpdateFiles(files.filter((f) => f.id !== id));
  };

  const handleUpdateNote = (id: string, newNote: string) => {
    onUpdateFiles(
      files.map((f) => (f.id === id ? { ...f, notes: newNote } : f))
    );
    if (previewFile && previewFile.id === id) {
      setPreviewFile({ ...previewFile, notes: newNote });
    }
  };

  const getFileIcon = (fileType: string) => {
    const ft = fileType.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ft)) {
      return <ImageIcon className="w-5 h-5 text-purple-600" />;
    }
    if (['xlsx', 'xls', 'csv'].includes(ft)) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    }
    return <FileText className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <FolderClosed className="w-5 h-5 text-blue-600" />
              BERKAS KERJA
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              Kelola & arsipkan dokumen operasional shift
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="px-3 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Upload</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Cari nama berkas, catatan, atau nomor..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-xs text-stone-900"
          />
        </div>

        {/* Category Pills Horizontal Scroll */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {CATEGORIES.map((cat, idx) => {
            const count =
              cat === 'Semua'
                ? files.length
                : files.filter((f) => f.category === cat).length;

            return (
              <button
                key={`berkas-cat-${cat}-${idx}`}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat
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

        {/* Sort and Count Subbar */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
          <span>Menampilkan {filteredFiles.length} berkas</span>
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-stone-700 font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="date-desc">Terbaru</option>
              <option value="date-asc">Terlama</option>
              <option value="name">Nama (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className="space-y-2">
        {filteredFiles.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-stone-200/80 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <FolderClosed className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-stone-700">Tidak Ada Berkas Ditemukan</p>
            <p className="text-[11px] text-stone-400">
              Coba ganti kata kunci pencarian atau upload berkas baru ke kategori ini.
            </p>
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="mt-2 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold"
            >
              + Upload Berkas Sekarang
            </button>
          </div>
        ) : (
          filteredFiles.map((item, idx) => (
            <div
              key={`file-row-${item.id}-${idx}`}
              onClick={() => setPreviewFile(item)}
              className="bg-white rounded-2xl border border-stone-200/80 p-3 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3"
            >
              {/* Left icon */}
              <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0">
                {getFileIcon(item.fileType)}
              </div>

              {/* Middle details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-stone-900 truncate">
                    {item.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                  <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-md">
                    {item.category}
                  </span>
                  <span>{item.date}</span>
                  {item.size && <span>• {item.size}</span>}
                </div>
                {item.notes && (
                  <p className="text-[10px] text-stone-500 mt-1 line-clamp-1 italic">
                    &quot;{item.notes}&quot;
                  </p>
                )}
              </div>

              {/* Right badge & indicator */}
              <div className="text-right shrink-0">
                <span className="text-[10px] font-semibold text-stone-500 block">
                  {item.status || 'Aktif'}
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 inline-block mt-1">
                  {item.fileType}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      <UploadFileModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAddFile={handleAddFile}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
        onDelete={handleDeleteFile}
        onUpdateNote={handleUpdateNote}
        onShowToast={onShowToast}
      />
    </div>
  );
};
