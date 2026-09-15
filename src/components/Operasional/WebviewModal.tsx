import React from 'react';
import { X, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { WebsiteItem } from '../../types';

interface WebviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  website: WebsiteItem | null;
}

export const WebviewModal: React.FC<WebviewModalProps> = ({
  isOpen,
  onClose,
  website,
}) => {
  if (!isOpen || !website) return null;

  const handleOpenExternal = () => {
    if (website.url) {
      window.open(website.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-900 text-white animate-in fade-in duration-150">
      {/* Top bar for Webview */}
      <div className="h-12 bg-stone-900 border-b border-stone-800 px-3 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-[70%]">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="truncate">
            <h2 className="text-xs font-bold text-white truncate leading-none">
              {website.name}
            </h2>
            <p className="text-[10px] text-stone-400 truncate mt-0.5 font-mono">
              {website.url || 'URL belum diatur'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {website.url && (
            <button
              type="button"
              onClick={handleOpenExternal}
              title="Buka di Browser Luar"
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Browser Luar</span>
            </button>
          )}
        </div>
      </div>

      {/* Frame content */}
      <div className="flex-1 bg-stone-100 relative">
        {website.url ? (
          <div className="w-full h-full flex flex-col">
            <div className="p-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-[11px] flex items-center justify-between px-3">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Jika halaman terblokir oleh proteksi iframe website, klik &quot;Browser Luar&quot;.</span>
              </div>
              <button
                type="button"
                onClick={handleOpenExternal}
                className="underline font-semibold ml-2 text-amber-900 shrink-0"
              >
                Buka Tab Baru
              </button>
            </div>
            <iframe
              src={website.url}
              title={website.name}
              className="w-full flex-1 border-none bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-stone-500">
            <div className="w-12 h-12 rounded-2xl bg-stone-200 flex items-center justify-center text-stone-400 mb-3">
              <RefreshCw className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-stone-800">URL Belum Diatur</p>
            <p className="text-xs text-stone-500 max-w-xs mt-1">
              Silakan atur URL untuk website ini melalui tombol edit atau menu Pengaturan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
