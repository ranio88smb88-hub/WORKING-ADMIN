import React from 'react';
import { X, Bell, Clock, AlertOctagon, CheckCircle2, ChevronRight } from 'lucide-react';
import { ReportItem } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: ReportItem[];
  onSelectReport: (id: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  reports,
  onSelectReport,
}) => {
  if (!isOpen) return null;

  const urgentReports = reports.filter((r) => r.status === 'prioritas' || r.reminder);
  const pendingReports = reports.filter((r) => r.status === 'tertunda' || r.status === 'menunggu');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="fixed inset-0 bg-transparent" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden z-10 animate-in fade-in slide-in-from-bottom duration-200 max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">Notifikasi & Pengingat</h2>
              <p className="text-[11px] text-stone-500 font-medium">
                Peringatan deadline dan tiket mendesak
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
          {urgentReports.length === 0 && pendingReports.length === 0 ? (
            <div className="py-8 text-center text-stone-400 space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-semibold text-stone-700">Semua Tiket Terkendali</p>
              <p className="text-[11px]">Tidak ada deadline mendesak saat ini.</p>
            </div>
          ) : (
            <>
              {urgentReports.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3" />
                    Mendesak & Perlu Perhatian ({urgentReports.length})
                  </span>
                  {urgentReports.map((item, idx) => (
                    <div
                      key={`notif-urg-${item.id}-${idx}`}
                      onClick={() => {
                        onSelectReport(item.id);
                        onClose();
                      }}
                      className="p-3 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 cursor-pointer flex items-center justify-between gap-2 transition-all"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-rose-700">
                            {item.number}
                          </span>
                          <span className="font-bold text-stone-900 truncate">
                            {item.title}
                          </span>
                        </div>
                        {item.reminder && (
                          <p className="text-[10px] font-semibold text-rose-600 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Deadline: {item.reminder}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-rose-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {pendingReports.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-500" />
                    Menunggu Konfirmasi & Tertunda ({pendingReports.length})
                  </span>
                  {pendingReports.map((item, idx) => (
                    <div
                      key={`notif-pend-${item.id}-${idx}`}
                      onClick={() => {
                        onSelectReport(item.id);
                        onClose();
                      }}
                      className="p-3 rounded-2xl border border-stone-200 hover:border-blue-300 cursor-pointer flex items-center justify-between gap-2 transition-all"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-blue-600">
                            {item.number}
                          </span>
                          <span className="font-bold text-stone-900 truncate">
                            {item.reportType}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          Staff: {item.staff} • {item.description}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
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
