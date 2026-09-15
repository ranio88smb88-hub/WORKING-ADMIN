import React, { useState, useEffect } from 'react';
import { X, Globe, Save } from 'lucide-react';
import { WebsiteItem } from '../../types';

interface EditWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  website: WebsiteItem | null;
  onSave: (updated: WebsiteItem) => void;
}

export const EditWebsiteModal: React.FC<EditWebsiteModalProps> = ({
  isOpen,
  onClose,
  website,
  onSave,
}) => {
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (website) {
      setUrl(website.url || '');
      setNotes(website.notes || '');
      setCategory(website.category || '');
    }
  }, [website, isOpen]);

  if (!isOpen || !website) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let formattedUrl = url.trim();
    if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    onSave({
      ...website,
      url: formattedUrl,
      notes: notes.trim(),
      category: category.trim() || website.category,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="fixed inset-0 bg-transparent"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden z-10 animate-in fade-in slide-in-from-bottom duration-200">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              {website.order}
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Atur URL Website
              </h2>
              <p className="text-xs text-stone-500 font-medium">{website.name}</p>
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

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              URL Website / Portal
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://contoh-link-kerja.com/admin"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-stone-900 font-mono text-xs"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Kosongkan jika ingin menampilkan status &quot;URL belum diatur&quot;
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Kategori / Label
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Contoh: Finansial, Payment, Layanan Member"
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-stone-900 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Catatan Internal / Keterangan
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Catatan login, shift PIC, atau tips penggunaan..."
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-stone-900 text-xs resize-none"
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
              <Save className="w-4 h-4" />
              Simpan URL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
