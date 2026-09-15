import React, { useState } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  RotateCw,
  Plus,
  X,
  ShieldAlert,
  Globe,
  Edit2,
  Copy,
  Check,
  Minimize2,
  Share2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { WebsiteItem } from '../../types';
import { isNonComOrProtectedDomain, getDomainExtensionLabel } from '../../utils/urlUtils';

interface InAppBrowserProps {
  isOpen: boolean;
  activeTabId: string | null;
  openTabIds: string[];
  websites: WebsiteItem[];
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onOpenNewTab: (websiteId: string) => void;
  onMinimize: () => void;
  onEditWebsite: (website: WebsiteItem) => void;
  onUpdateWebsite?: (website: WebsiteItem) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const InAppBrowser: React.FC<InAppBrowserProps> = ({
  isOpen,
  activeTabId,
  openTabIds,
  websites,
  onSelectTab,
  onCloseTab,
  onOpenNewTab,
  onMinimize,
  onEditWebsite,
  onUpdateWebsite,
  onShowToast,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showWebsitePicker, setShowWebsitePicker] = useState(false);
  const [reloadKeys, setReloadKeys] = useState<Record<string, number>>({});
  const [tabModes, setTabModes] = useState<Record<string, 'webview' | 'fallback'>>({});

  if (!isOpen && openTabIds.length === 0) return null;

  const activeWebsite = websites.find((w) => w.id === activeTabId) || null;

  const getEffectiveTabMode = (site: WebsiteItem): 'webview' | 'fallback' => {
    if (tabModes[site.id]) return tabModes[site.id];
    if (site.requiresExternalBrowser || site.openMode === 'external' || isNonComOrProtectedDomain(site.url)) {
      return 'fallback';
    }
    return 'webview';
  };

  const handleSetTabMode = (siteId: string, mode: 'webview' | 'fallback') => {
    setTabModes((prev) => ({
      ...prev,
      [siteId]: mode,
    }));
  };

  const handleToggleAlwaysFallback = (site: WebsiteItem) => {
    const isCurrentlyFallback = site.requiresExternalBrowser || site.openMode === 'external';
    const updated: WebsiteItem = {
      ...site,
      requiresExternalBrowser: !isCurrentlyFallback,
      openMode: !isCurrentlyFallback ? 'external' : 'webview',
    };
    if (onUpdateWebsite) {
      onUpdateWebsite(updated);
    }
    handleSetTabMode(site.id, !isCurrentlyFallback ? 'fallback' : 'webview');
    onShowToast(
      !isCurrentlyFallback
        ? `"${site.name}" diatur selalu menggunakan Layar Fallback`
        : `"${site.name}" dikembalikan ke mode In-App Frame`
    );
  };

  const handleReload = (id: string) => {
    setReloadKeys((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
    onShowToast('Memuat ulang halaman...');
  };

  const handleCopyUrl = (url?: string) => {
    if (!url) return;
    navigator.clipboard?.writeText(url);
    setCopiedUrl(true);
    onShowToast('URL disalin ke clipboard');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleOpenExternal = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      onShowToast('Membuka di browser eksternal...');
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-stone-900 text-white flex flex-col transition-all duration-200 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* 1. TOP BROWSER TAB BAR (Desktop style adapted for Mobile HP) */}
      <div className="bg-stone-950 border-b border-stone-800/90 pt-1.5 px-2 select-none">
        <div className="flex items-center gap-1.5">
          {/* Back / Minimize Button to return to Admin Dashboard */}
          <button
            type="button"
            onClick={onMinimize}
            title="Kembali ke Dashboard Utama"
            className="h-8 px-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white flex items-center gap-1 text-[11px] font-bold shrink-0 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          {/* Horizontal Scrollable Desktop-like Tabs */}
          <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {openTabIds.map((tabId) => {
              const site = websites.find((w) => w.id === tabId);
              if (!site) return null;
              const isActive = activeTabId === tabId;

              return (
                <div
                  key={`browser-tab-${tabId}`}
                  onClick={() => onSelectTab(tabId)}
                  className={`group relative flex items-center gap-1.5 h-8 px-2.5 rounded-t-xl cursor-pointer transition-all shrink-0 max-w-[150px] sm:max-w-[180px] border-t-2 ${
                    isActive
                      ? 'bg-stone-800 text-white border-blue-500 shadow-xs font-semibold'
                      : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50 border-transparent'
                  }`}
                >
                  {/* Badge / Logo */}
                  {site.logoUrl ? (
                    <img
                      src={site.logoUrl}
                      alt={site.name}
                      className="w-4 h-4 rounded-xs object-cover shrink-0"
                    />
                  ) : (
                    <span
                      className="w-4 h-4 rounded-xs text-[9px] font-black flex items-center justify-center shrink-0 text-white"
                      style={{ backgroundColor: site.badgeColor || '#4f46e5' }}
                    >
                      {site.shortCode || site.name.slice(0, 2)}
                    </span>
                  )}

                  {/* Tab Title */}
                  <span className="text-xs truncate flex-1 font-medium">
                    {site.name}
                  </span>

                  {/* Active status pulse */}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  )}

                  {/* Close Tab Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tabId);
                    }}
                    title="Tutup Tab"
                    className="w-4 h-4 rounded-full text-stone-400 hover:text-white hover:bg-stone-700 flex items-center justify-center shrink-0 transition-colors ml-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              );
            })}

            {/* Add Tab (+) Button */}
            <button
              type="button"
              onClick={() => setShowWebsitePicker(true)}
              title="Buka Website Lain"
              className="h-8 w-8 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center shrink-0 transition-colors border border-stone-800"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick minimize toggle icon */}
          <button
            type="button"
            onClick={onMinimize}
            title="Sembunyikan ke background"
            className="w-8 h-8 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 flex items-center justify-center shrink-0 transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. ADDRESS / CONTROLS TOOLBAR */}
      {activeWebsite && (
        <div className="bg-stone-900 border-b border-stone-800 px-3 py-1.5 flex items-center justify-between gap-2">
          {/* Site identity & URL bar */}
          <div className="flex-1 flex items-center gap-2 min-w-0 bg-stone-950/80 border border-stone-800/80 rounded-xl px-2.5 py-1">
            {activeWebsite.logoUrl ? (
              <img
                src={activeWebsite.logoUrl}
                alt={activeWebsite.name}
                className="w-4 h-4 rounded-xs object-cover shrink-0"
              />
            ) : (
              <span
                className="w-4 h-4 rounded-xs text-[9px] font-black flex items-center justify-center shrink-0 text-white"
                style={{ backgroundColor: activeWebsite.badgeColor || '#4f46e5' }}
              >
                {activeWebsite.shortCode}
              </span>
            )}

            <div className="flex-1 min-w-0 flex items-center gap-1.5">
              <span className="text-xs font-bold text-stone-200 truncate">
                {activeWebsite.name}
              </span>
              <span className="text-stone-600">•</span>
              <span className="text-[11px] font-mono text-stone-400 truncate">
                {activeWebsite.url || 'URL belum diatur'}
              </span>
            </div>

            {/* Copy button */}
            {activeWebsite.url && (
              <button
                type="button"
                onClick={() => handleCopyUrl(activeWebsite.url)}
                title="Salin URL"
                className="text-stone-400 hover:text-stone-200 p-1 rounded-md transition-colors"
              >
                {copiedUrl ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* View Mode Toggle: Fallback vs In-App Frame */}
            {activeWebsite.url && (
              <button
                type="button"
                onClick={() => {
                  const current = getEffectiveTabMode(activeWebsite);
                  handleSetTabMode(activeWebsite.id, current === 'fallback' ? 'webview' : 'fallback');
                  onShowToast(
                    current === 'fallback'
                      ? 'Beralih ke tampilan In-App Frame...'
                      : 'Beralih ke Layar Fallback...'
                  );
                }}
                title={
                  getEffectiveTabMode(activeWebsite) === 'fallback'
                    ? 'Beralih ke In-App WebView'
                    : 'Beralih ke Layar Fallback (Jika web error/abu-abu)'
                }
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 border transition-all ${
                  getEffectiveTabMode(activeWebsite) === 'fallback'
                    ? 'bg-amber-950/60 border-amber-800/80 text-amber-300 hover:bg-amber-900/80'
                    : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {getEffectiveTabMode(activeWebsite) === 'fallback' ? (
                  <>
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                    <span className="hidden sm:inline">Fallback</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-3 h-3 text-blue-400" />
                    <span className="hidden sm:inline">Frame</span>
                  </>
                )}
              </button>
            )}

            {/* Reload button */}
            {activeWebsite.url && (
              <button
                type="button"
                onClick={() => handleReload(activeWebsite.id)}
                title="Muat Ulang Website"
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Edit URL button */}
            <button
              type="button"
              onClick={() => onEditWebsite(activeWebsite)}
              title="Atur URL / Nama"
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            {/* Buka di browser eksternal */}
            {activeWebsite.url && (
              <button
                type="button"
                onClick={() => handleOpenExternal(activeWebsite.url)}
                title="Buka di Browser Luar (Chrome/Vivaldi)"
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[11px] font-semibold flex items-center gap-1 transition-all"
              >
                <span className="hidden xs:inline">Browser</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. MULTI-IFRAME / FALLBACK VIEWPORT CONTAINER (Preserves State!) */}
      <div className="flex-1 bg-stone-100 relative overflow-hidden">
        {openTabIds.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-stone-600 bg-white">
            <Globe className="w-12 h-12 text-stone-300 mb-3" />
            <h3 className="text-sm font-bold text-stone-800">
              Belum Ada Tab Website Terbuka
            </h3>
            <p className="text-xs text-stone-500 max-w-xs mt-1 mb-4">
              Pilih website kerja dari daftar untuk mulai bekerja di dalam ADMIN 1 FOR ALL.
            </p>
            <button
              type="button"
              onClick={() => setShowWebsitePicker(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Buka Website Kerja
            </button>
          </div>
        ) : (
          openTabIds.map((tabId) => {
            const site = websites.find((w) => w.id === tabId);
            if (!site) return null;
            const isActive = activeTabId === tabId;
            const reloadKey = reloadKeys[site.id] || 0;
            const tabMode = getEffectiveTabMode(site);

            return (
              <div
                key={`tab-frame-wrapper-${site.id}`}
                style={{ display: isActive ? 'block' : 'none' }}
                className="h-full w-full relative"
              >
                {site.url && site.url.trim() ? (
                  tabMode === 'fallback' ? (
                    /* SECTION 21 FALLBACK SCREEN - Clean, native, no ugly Chrome sad face! */
                    <div className="h-full w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-stone-100 text-center overflow-y-auto">
                      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-stone-200/80 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
                        {/* Site Identity Header */}
                        <div className="relative mb-3">
                          {site.logoUrl ? (
                            <img
                              src={site.logoUrl}
                              alt={site.name}
                              className="w-16 h-16 rounded-2xl object-cover border-2 border-stone-200 shadow-md"
                            />
                          ) : (
                            <div
                              className="w-16 h-16 rounded-2xl text-white font-black text-xl flex items-center justify-center shadow-md"
                              style={{ backgroundColor: site.badgeColor || '#4f46e5' }}
                            >
                              {site.shortCode}
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-full shadow-xs">
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        <h2 className="text-base font-bold text-stone-900 tracking-tight">
                          {site.name}
                        </h2>

                        {/* URL Pill with Copy */}
                        <div className="w-full mt-2 mb-3 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs text-stone-600 font-mono">
                          <span className="truncate flex-1 text-left text-[11px]">
                            {site.url}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(site.url)}
                            className="p-1 hover:text-stone-900 text-stone-400 shrink-0 ml-1"
                            title="Salin URL"
                          >
                            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Domain Tag */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold mb-3">
                          <ShieldAlert className="w-3 h-3 text-amber-700" />
                          <span>Proteksi Anti-Embed {getDomainExtensionLabel(site.url)}</span>
                        </div>

                        {/* SECTION 21 MANDATED TEXT */}
                        <div className="space-y-1.5 mb-5 text-center">
                          <h3 className="text-sm sm:text-base font-black text-stone-900">
                            Website ini membutuhkan browser eksternal.
                          </h3>
                          <p className="text-xs text-stone-600 leading-relaxed px-1">
                            Domain ini (<strong className="text-stone-800">{getDomainExtensionLabel(site.url) || 'khusus'}</strong>) menerapkan proteksi keamanan server (X-Frame-Options) yang memblokir tampilan di dalam WebView. Silakan buka di browser eksternal untuk melanjutkan pekerjaan tanpa keluar dari ADMIN 1 FOR ALL.
                          </p>
                        </div>

                        {/* MANDATED ACTION BUTTONS (Section 21) */}
                        <div className="w-full space-y-2">
                          {/* [ BUKA DI BROWSER ] */}
                          <button
                            type="button"
                            onClick={() => handleOpenExternal(site.url)}
                            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                          >
                            <span>BUKA DI BROWSER</span>
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          {/* [ COBA LAGI ] */}
                          <button
                            type="button"
                            onClick={() => {
                              handleReload(site.id);
                              handleSetTabMode(site.id, 'webview');
                            }}
                            className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-98 text-stone-700 font-bold text-xs flex items-center justify-center gap-2 border border-stone-200 transition-all cursor-pointer"
                          >
                            <RotateCw className="w-3.5 h-3.5 text-stone-500" />
                            <span>COBA LAGI</span>
                          </button>
                        </div>

                        {/* Preference toggle */}
                        <div className="mt-4 pt-3 border-t border-stone-100 w-full flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleToggleAlwaysFallback(site)}
                            className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1.5 cursor-pointer font-medium"
                          >
                            <div className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center ${
                              site.requiresExternalBrowser || site.openMode === 'external'
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-stone-300 bg-white'
                            }`}>
                              {(site.requiresExternalBrowser || site.openMode === 'external') && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <span>Selalu gunakan mode Fallback untuk web ini</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* IN-APP IFRAME VIEW */
                    <div className="h-full w-full flex flex-col bg-white">
                      {/* Security notice / Quick Fallback Switch Banner */}
                      <div className="bg-amber-50 border-b border-amber-200/90 px-3 py-1.5 flex items-center justify-between text-amber-950 text-[11px] shrink-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">
                            Layar abu-abu / bermasalah? Domain ini mungkin memblokir frame.
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={() => handleSetTabMode(site.id, 'fallback')}
                            className="font-bold text-amber-900 hover:text-amber-950 underline cursor-pointer"
                          >
                            Layar Fallback
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenExternal(site.url)}
                            className="font-bold text-blue-700 hover:text-blue-900 flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Buka di Browser</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Persistent Embedded Iframe */}
                      <iframe
                        key={`iframe-${site.id}-${reloadKey}`}
                        src={site.url}
                        title={site.name}
                        className="w-full flex-1 border-none bg-white"
                        allow="camera; microphone; clipboard-read; clipboard-write; fullscreen"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
                      />
                    </div>
                  )
                ) : (
                  /* If URL is not configured yet */
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center text-stone-600 bg-white">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-md mb-3"
                      style={{ backgroundColor: site.badgeColor || '#4f46e5' }}
                    >
                      {site.shortCode}
                    </div>
                    <h3 className="text-base font-bold text-stone-900">
                      {site.name}
                    </h3>
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold my-2">
                      URL belum diatur
                    </div>
                    <p className="text-xs text-stone-500 max-w-xs mb-4">
                      Silakan masukkan URL portal kerja untuk website ini agar dapat dibuka langsung di dalam aplikasi.
                    </p>
                    <button
                      type="button"
                      onClick={() => onEditWebsite(site)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Atur URL Sekarang
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. WEBSITE PICKER MODAL (When tapping '+') */}
      {showWebsitePicker && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0"
            onClick={() => setShowWebsitePicker(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-4 text-stone-900 z-10 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-stone-900">
                  Buka Website Kerja Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWebsitePicker(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-2 overflow-y-auto space-y-1.5 flex-1 divide-y divide-stone-100">
              {websites.map((w) => {
                const isOpenTab = openTabIds.includes(w.id);

                return (
                  <div
                    key={`picker-site-${w.id}`}
                    onClick={() => {
                      onOpenNewTab(w.id);
                      setShowWebsitePicker(false);
                    }}
                    className="pt-1.5 first:pt-0 flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {w.logoUrl ? (
                        <img
                          src={w.logoUrl}
                          alt={w.name}
                          className="w-7 h-7 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div
                          className="w-7 h-7 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs"
                          style={{ backgroundColor: w.badgeColor || '#4f46e5' }}
                        >
                          {w.shortCode}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-stone-900 truncate">
                            {w.name}
                          </h4>
                          {isOpenTab && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                              Terbuka
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-stone-400 truncate">
                          {w.url || 'URL belum diatur'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`text-xs font-bold px-3 py-1 rounded-lg transition-all ${
                        isOpenTab
                          ? 'bg-stone-100 text-stone-600'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isOpenTab ? 'Beralih' : 'Buka'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
