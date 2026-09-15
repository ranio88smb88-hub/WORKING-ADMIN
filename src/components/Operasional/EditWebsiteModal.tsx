import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Globe,
  Save,
  Image as ImageIcon,
  Upload,
  Trash2,
  Palette,
  Pin,
  Star,
  Check,
  ShieldAlert,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { WebsiteItem } from '../../types';
import { isNonComOrProtectedDomain, getDomainExtensionLabel } from '../../utils/urlUtils';

interface EditWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  website: WebsiteItem | null;
  onSave: (updated: WebsiteItem) => void;
}

const PRESET_COLORS = [
  { name: 'Violet / Purple', hex: '#7c3aed' },
  { name: 'Emerald / Hijau', hex: '#059669' },
  { name: 'Sky / Biru Muda', hex: '#0284c7' },
  { name: 'Indigo / Biru Tua', hex: '#4f46e5' },
  { name: 'Amber / Oranye', hex: '#d97706' },
  { name: 'Rose / Merah', hex: '#e11d48' },
  { name: 'Teal / Cyan', hex: '#0d9488' },
  { name: 'Dark Slate', hex: '#334155' },
];

export const EditWebsiteModal: React.FC<EditWebsiteModalProps> = ({
  isOpen,
  onClose,
  website,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [url, setUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [badgeColor, setBadgeColor] = useState('#4f46e5');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [openMode, setOpenMode] = useState<'webview' | 'external'>('webview');
  const [requiresExternalBrowser, setRequiresExternalBrowser] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (website) {
      setName(website.name || '');
      setShortCode(website.shortCode || website.name.slice(0, 2).toUpperCase());
      setUrl(website.url || '');
      setLogoUrl(website.logoUrl || '');
      setBadgeColor(website.badgeColor || '#4f46e5');
      setNotes(website.notes || '');
      setCategory(website.category || '');
      setIsPinned(Boolean(website.isPinned));
      setIsFavorite(Boolean(website.isFavorite));
      
      const isSensitive = website.requiresExternalBrowser || website.openMode === 'external' || isNonComOrProtectedDomain(website.url);
      setOpenMode(website.openMode || (isSensitive ? 'external' : 'webview'));
      setRequiresExternalBrowser(Boolean(website.requiresExternalBrowser || isSensitive));
    }
  }, [website, isOpen]);

  if (!isOpen || !website) return null;

  const isDetectedNonCom = isNonComOrProtectedDomain(url);
  const extLabel = getDomainExtensionLabel(url);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let formattedUrl = url.trim();
    if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const code = shortCode.trim().toUpperCase() || name.slice(0, 2).toUpperCase();

    onSave({
      ...website,
      name: name.trim() || website.name,
      shortCode: code,
      url: formattedUrl,
      logoUrl: logoUrl.trim() || undefined,
      badgeColor,
      notes: notes.trim(),
      category: category.trim() || website.category,
      isPinned,
      isFavorite,
      openMode,
      requiresExternalBrowser: requiresExternalBrowser || openMode === 'external',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="fixed inset-0 bg-transparent"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="preview"
                className="w-8 h-8 rounded-xl object-cover border border-stone-200 shadow-xs"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-black text-xs shadow-xs"
                style={{ backgroundColor: badgeColor }}
              >
                {shortCode || name.slice(0, 2).toUpperCase() || 'WS'}
              </div>
            )}
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Atur Website & Tab Logo
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {website.name}
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

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs overflow-y-auto flex-1">
          {/* 1. Nama & Singkatan / Tab Code */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nama Website
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: LIVE CHAT"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-stone-900 font-bold text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Kode Tab
              </label>
              <input
                type="text"
                maxLength={4}
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value.toUpperCase())}
                placeholder="LC"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-stone-900 font-black text-center text-xs tracking-wider uppercase"
                required
              />
            </div>
          </div>

          {/* 2. Logo Upload & Custom Image */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                Logo / Icon Tab Website
              </span>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                  Hapus Logo
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Logo Preview */}
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="preview"
                  className="w-12 h-12 rounded-xl object-cover border border-stone-300 shadow-xs"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-xl text-white font-black text-base flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: badgeColor }}
                >
                  {shortCode || name.slice(0, 2).toUpperCase() || 'WS'}
                </div>
              )}

              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-1.5 px-3 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  + Pilih Gambar dari HP
                </button>
                <p className="text-[10px] text-stone-500">
                  Format: PNG, JPG, WEBP (Maks 2MB)
                </p>
              </div>
            </div>

            {/* Color selector if not using image logo */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1.5">
                Warna Badge Tab (Jika tidak pakai gambar):
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setBadgeColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      badgeColor === c.hex
                        ? 'ring-2 ring-offset-2 ring-stone-900 scale-110'
                        : 'hover:scale-105 opacity-90'
                    }`}
                  >
                    {badgeColor === c.hex && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. URL Website */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              URL Website Kerja
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  const newUrl = e.target.value;
                  setUrl(newUrl);
                  if (isNonComOrProtectedDomain(newUrl)) {
                    setOpenMode('external');
                    setRequiresExternalBrowser(true);
                  }
                }}
                placeholder="https://contoh-link-kerja.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-stone-900 font-mono text-xs"
              />
            </div>
            <p className="text-[10px] text-stone-400 mt-1">
              Kosongkan jika URL belum siap. Akan muncul status &quot;URL belum diatur&quot;.
            </p>

            {/* Smart notice if .xyz, .org, or non-.com domain is detected */}
            {isDetectedNonCom && (
              <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-[11px] leading-tight">
                    Domain {extLabel || 'Khusus'} Terdeteksi (Proteksi Anti-Embed)
                  </p>
                  <p className="text-[10px] text-amber-800 leading-normal">
                    Link berekstensi seperti <strong className="font-bold">.xyz, .org</strong> atau non-.com umumnya memblokir iframe (menampilkan layar abu-abu error).
                    Sistem otomatis mengaktifkan <strong>Mode Layar Fallback & Browser Eksternal</strong> agar website dapat dibuka dengan lancar.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mode Tampilan Website (Section 21 Fallback) */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
            <label className="block text-xs font-bold text-stone-800">
              Metode Tampilan Tab
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpenMode('webview');
                  setRequiresExternalBrowser(false);
                }}
                className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  openMode === 'webview' && !requiresExternalBrowser
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    In-App Frame
                  </span>
                  {openMode === 'webview' && !requiresExternalBrowser && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <p className="text-[10px] text-stone-500 leading-tight">
                  Tampil langsung di dalam aplikasi (jika web mengizinkan embed)
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpenMode('external');
                  setRequiresExternalBrowser(true);
                }}
                className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  openMode === 'external' || requiresExternalBrowser
                    ? 'border-amber-500 bg-amber-50/50 text-amber-950 ring-1 ring-amber-500'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-amber-900">
                    <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                    Mode Fallback
                  </span>
                  {(openMode === 'external' || requiresExternalBrowser) && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
                <p className="text-[10px] text-amber-800/80 leading-tight font-medium">
                  Cegah layar abu-abu untuk link .xyz, .org, atau panel terproteksi
                </p>
              </button>
            </div>
          </div>

          {/* 4. Category & Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Kategori / Label
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Contoh: Layanan Member, Finansial, Payment"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-stone-900 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Catatan Penggunaan
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Catatan login, shift, instruksi operasional..."
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-stone-900 text-xs resize-none"
            />
          </div>

          {/* 5. Pin & Favorite Toggles */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-semibold text-xs transition-colors ${
                isPinned
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-stone-50 border-stone-200 text-stone-600'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
              <span>{isPinned ? 'Dipin ke Atas' : 'Pin Website'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-semibold text-xs transition-colors ${
                isFavorite
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-stone-50 border-stone-200 text-stone-600'
              }`}
            >
              <Star className="w-3.5 h-3.5" fill={isFavorite ? 'currentColor' : 'none'} />
              <span>{isFavorite ? 'Favorit' : 'Tandai Favorit'}</span>
            </button>
          </div>

          {/* Actions */}
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
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
