import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TabType,
  WebsiteItem,
  ReportItem,
  WorkFileItem,
  QuickNoteItem,
  SOPChecklistItem,
} from './types';
import {
  getStoredWebsites,
  saveWebsites,
  getStoredReports,
  saveReports,
  getStoredFiles,
  saveFiles,
  getStoredQuickNotes,
  saveQuickNotes,
  getStoredSOP,
  saveSOP,
  getStoredPin,
} from './utils/storage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OperasionalTab } from './components/Operasional/OperasionalTab';
import { BerkasTab } from './components/Berkas/BerkasTab';
import { ReportTab } from './components/Report/ReportTab';
import { RingkasanTab } from './components/Ringkasan/RingkasanTab';
import { ToolsTab } from './components/Tools/ToolsTab';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { SettingsModal } from './components/SettingsModal';
import { NotificationModal } from './components/NotificationModal';
import { AppLockModal } from './components/AppLockModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('operasional');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Core Data
  const [websites, setWebsites] = useState<WebsiteItem[]>(() => getStoredWebsites());
  const [reports, setReports] = useState<ReportItem[]>(() => getStoredReports());
  const [files, setFiles] = useState<WorkFileItem[]>(() => getStoredFiles());
  const [quickNotes, setQuickNotes] = useState<QuickNoteItem[]>(() => getStoredQuickNotes());
  const [sopList, setSopList] = useState<SOPChecklistItem[]>(() => getStoredSOP());

  // App Lock
  const [isAppLocked, setIsAppLocked] = useState<boolean>(false);

  // Global Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (text: string, type: ToastMessage['type'] = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, text, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // State persistence handlers
  const handleUpdateWebsites = (updated: WebsiteItem[]) => {
    setWebsites(updated);
    saveWebsites(updated);
  };

  const handleUpdateReports = (updated: ReportItem[]) => {
    setReports(updated);
    saveReports(updated);
  };

  const handleUpdateFiles = (updated: WorkFileItem[]) => {
    setFiles(updated);
    saveFiles(updated);
  };

  const handleUpdateNotes = (updated: QuickNoteItem[]) => {
    setQuickNotes(updated);
    saveQuickNotes(updated);
  };

  const handleUpdateSOP = (updated: SOPChecklistItem[]) => {
    setSopList(updated);
    saveSOP(updated);
  };

  const handleReloadData = () => {
    setWebsites(getStoredWebsites());
    setReports(getStoredReports());
    setFiles(getStoredFiles());
    setQuickNotes(getStoredQuickNotes());
    setSopList(getStoredSOP());
  };

  // Unresolved pending reports count for badges
  const pendingReportsCount = useMemo(() => {
    return reports.filter((r) => r.status === 'tertunda' || r.status === 'prioritas').length;
  }, [reports]);

  // Keyboard Shortcuts (1-4 for quick tab switching, Cmd/Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === '1') setActiveTab('operasional');
      if (e.key === '2') setActiveTab('berkas');
      if (e.key === '3') setActiveTab('report');
      if (e.key === '4') setActiveTab('tools');
      if (e.key === '5' || e.key === '0') setActiveTab('ringkasan');
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-800 font-sans antialiased flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Top Header Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        pendingCount={pendingReportsCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-3 pb-24">
        {activeTab === 'operasional' && (
          <OperasionalTab
            websites={websites}
            reports={reports}
            onUpdateWebsites={handleUpdateWebsites}
            onNavigateTab={setActiveTab}
            onOpenReportDetail={(id) => {
              setSelectedReportId(id);
              setActiveTab('report');
            }}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'berkas' && (
          <BerkasTab
            files={files}
            onUpdateFiles={handleUpdateFiles}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'report' && (
          <ReportTab
            reports={reports}
            onUpdateReports={handleUpdateReports}
            selectedReportId={selectedReportId}
            onSelectReportId={setSelectedReportId}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'ringkasan' && (
          <RingkasanTab
            reports={reports}
            files={files}
            websites={websites}
            onNavigateTab={setActiveTab}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'tools' && (
          <ToolsTab
            quickNotes={quickNotes}
            onUpdateNotes={handleUpdateNotes}
            sopList={sopList}
            onUpdateSOP={handleUpdateSOP}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingReportsCount={pendingReportsCount}
      />

      {/* Global Universal Search */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        websites={websites}
        reports={reports}
        files={files}
        onSelectReport={(id) => {
          setSelectedReportId(id);
          setActiveTab('report');
        }}
        onSelectFile={() => {
          setActiveTab('berkas');
        }}
        onSelectWebsite={(web) => {
          setActiveTab('operasional');
          if (web.url) {
            window.open(web.url, '_blank', 'noopener,noreferrer');
          }
        }}
        onNavigateTab={setActiveTab}
      />

      {/* Settings Modal (URLs, PIN, Backup) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        websites={websites}
        onUpdateWebsites={handleUpdateWebsites}
        onDataReload={handleReloadData}
        onLockAppNow={() => {
          setIsSettingsOpen(false);
          setIsAppLocked(true);
        }}
        onShowToast={showToast}
      />

      {/* Notifications / Deadline Reminder Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        reports={reports}
        onSelectReport={(id) => {
          setSelectedReportId(id);
          setActiveTab('report');
        }}
      />

      {/* App Lock Protection Screen */}
      <AppLockModal
        isLocked={isAppLocked}
        onUnlock={() => setIsAppLocked(false)}
      />
    </div>
  );
}
