import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Clock,
  FolderClosed,
  Globe,
  FileText,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { WebsiteItem, ReportItem, WorkFileItem, TabType } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  websites: WebsiteItem[];
  reports: ReportItem[];
  files: WorkFileItem[];
  onSelectReport: (id: string) => void;
  onSelectFile: (file: WorkFileItem) => void;
  onSelectWebsite: (web: WebsiteItem) => void;
  onNavigateTab: (tab: TabType) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  websites,
  reports,
  files,
  onSelectReport,
  onSelectFile,
  onSelectWebsite,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { reports: [], files: [], websites: [] };
    }

    const matchedReports = reports.filter((r) => {
      return (
        r.number.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.reportType.toLowerCase().includes(q) ||
        r.staff.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.notes && r.notes.toLowerCase().includes(q))
      );
    });

    const matchedFiles = files.filter((f) => {
      return (
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        (f.notes && f.notes.toLowerCase().includes(q)) ||
        (f.status && f.status.toLowerCase().includes(q))
      );
    });

    const matchedWebsites = websites.filter((w) => {
      return (
        w.name.toLowerCase().includes(q) ||
        (w.url && w.url.toLowerCase().includes(q)) ||
        (w.notes && w.notes.toLowerCase().includes(q)) ||
        (w.category && w.category.toLowerCase().includes(q))
      );
    });

    return {
      reports: matchedReports.slice(0, 6),
      files: matchedFiles.slice(0, 6),
      websites: matchedWebsites.slice(0, 6),
    };
  }, [query, reports, files, websites]);

  if (!isOpen) return null;

  const totalResults =
    results.reports.length + results.files.length + results.websites.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs pt-12 sm:pt-16">
      <div className="fixed inset-0 bg-transparent" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[82vh]">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-stone-200 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600 shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍 Cari akun, file, report, atau catatan..."
            className="flex-1 py-1.5 px-2 text-xs text-stone-900 bg-transparent focus:outline-hidden placeholder:text-stone-400 font-medium"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 px-2 py-1"
          >
            Tutup
          </button>
        </div>

        {/* Results Area */}
        <div className="p-3 space-y-3 overflow-y-auto flex-1 text-xs">
          {!query.trim() ? (
            <div className="py-8 text-center text-stone-400 space-y-1">
              <p className="font-semibold text-stone-600">Pencarian Universal</p>
              <p className="text-[11px]">
                Ketikkan kata kunci untuk mencari seluruh report, file kerja, atau portal website.
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-stone-400 space-y-1">
              <p className="font-semibold text-stone-600">Tidak ada hasil ditemukan</p>
              <p className="text-[11px]">Coba kata kunci lain atau periksa ejaan.</p>
            </div>
          ) : (
            <>
              {/* Reports Matches */}
              {results.reports.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3 text-rose-500" />
                    REPORT TERTUNDA ({results.reports.length})
                  </span>
                  {results.reports.map((r, idx) => (
                    <div
                      key={`sr-rep-${r.id}-${idx}`}
                      onClick={() => {
                        onSelectReport(r.id);
                        onClose();
                      }}
                      className="p-2.5 rounded-2xl border border-stone-200/80 hover:bg-blue-50/50 hover:border-blue-300 cursor-pointer flex items-center justify-between gap-2 transition-all"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-blue-600">
                            {r.number}
                          </span>
                          <span className="font-bold text-stone-900 truncate">
                            {r.reportType}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {r.description}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {/* Files Matches */}
              {results.files.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                    <FolderClosed className="w-3 h-3 text-indigo-500" />
                    BERKAS KERJA ({results.files.length})
                  </span>
                  {results.files.map((f, idx) => (
                    <div
                      key={`sr-file-${f.id}-${idx}`}
                      onClick={() => {
                        onSelectFile(f);
                        onClose();
                      }}
                      className="p-2.5 rounded-2xl border border-stone-200/80 hover:bg-indigo-50/50 hover:border-indigo-300 cursor-pointer flex items-center justify-between gap-2 transition-all"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-stone-900 truncate block">
                          {f.name}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {f.category} • {f.date}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {/* Websites Matches */}
              {results.websites.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                    <Globe className="w-3 h-3 text-emerald-500" />
                    WEBSITE KERJA ({results.websites.length})
                  </span>
                  {results.websites.map((w, idx) => (
                    <div
                      key={`sr-web-${w.id}-${idx}`}
                      onClick={() => {
                        onSelectWebsite(w);
                        onClose();
                      }}
                      className="p-2.5 rounded-2xl border border-stone-200/80 hover:bg-emerald-50/50 hover:border-emerald-300 cursor-pointer flex items-center justify-between gap-2 transition-all"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-stone-900 truncate block">
                          {w.order}. {w.name}
                        </span>
                        <span className="text-[10px] text-blue-600 font-mono truncate block">
                          {w.url || 'URL belum diatur'}
                        </span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
