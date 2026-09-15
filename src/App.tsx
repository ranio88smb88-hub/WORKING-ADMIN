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
  getStoredOpenTabs,
  saveOpenTabs,
  getStoredActiveWebTab,
  saveActiveWebTab,
} from './utils/storage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OperasionalTab } from './components/Operasional/OperasionalTab';
import { BerkasTab } from './components/Berkas/BerkasTab';
import { ReportTab } from './components/Report/ReportTab';
import { RingkasanTab } from './components/Ringkasan/RingkasanTab';
import { ToolsTab } from './components/Tools/ToolsTab';
import { InAppBrowser } from './components/Browser/InAppBrowser';
import { EditWebsiteModal } from './components/Operasional/EditWebsiteModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { SettingsModal } from './components/SettingsModal';
import { NotificationModal } from './components/NotificationModal';
import { AppLockModal } from './components/AppLockModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // Navigation: 'operasional' (Beranda), 'berkas', 'report', 'ringkasan', 'tools' (Menu)
  const [activeTab, setActiveTab] = useState<TabType>('operasional');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Core Data
  const [websites, setWebsites] = useState<WebsiteItem[]>(() => getStoredWebsites());
  const [reports, setReports] = useState<ReportItem[]>(() => getStoredReports());
  const [files, setFiles] = useState<WorkFileItem[]>(() => getStoredFiles());
  const [quickNotes, setQuickNotes] = useState<QuickNoteItem[]>(() => getStoredQuickNotes());
  const [sopList, setSopList] = useState<SOPChecklistItem[]>(() => getStoredSOP());

  // In-App Desktop-like Multi-Tab Browser State
  const [openTabIds, setOpenTabIds] = useState<string[]>(() => {
    const stored = getStoredOpenTabs();
    return stored.length > 0 ? stored : ['web-4']; // Default to Live Chat tab open
  });
  const [activeWebTabId, setActiveWebTabId] = useState<string | null>(() => {
    const stored = getStoredActiveWebTab();
    return stored || 'web-4';
  });
  const [isBrowserOpen, setIsBrowserOpen] = useState<boolean>(false);
  const [editingWebsiteTarget, setEditingWebsiteTarget] = useState<WebsiteItem | null>(null);

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

  // Open Website inside In-App Browser (prevents duplicate tabs)
  const handleOpenWebsiteInApp = (websiteId: string) => {
    // 1. Add tab if not already opened
    if (!openTabIds.includes(websiteId)) {
      const newTabs = [...openTabIds, websiteId];
      setOpenTabIds(newTabs);
      saveOpenTabs(newTabs);
    }

    // 2. Set as active tab
    setActiveWebTabId(websiteId);
    saveActiveWebTab(websiteId);

    // 3. Mark last opened timestamp
    const nowIso = new Date().toISOString();
    const updatedWebsites = websites.map((w) =>
      w.id === websiteId ? { ...w, lastOpened: nowIso } : w
    );
    handleUpdateWebsites(updatedWebsites);

    // 4. Open browser view
    setIsBrowserOpen(true);

    const site = websites.find((w) => w.id === websiteId);
    showToast(`Membuka ${site?.name || 'Website'} di dalam aplikasi...`, 'info');
  };

  const handleSelectBrowserTab = (tabId: string) => {
    setActiveWebTabId(tabId);
    saveActiveWebTab(tabId);

    // Update last opened
    const nowIso = new Date().toISOString();
    const updatedWebsites = websites.map((w) =>
      w.id === tabId ? { ...w, lastOpened: nowIso } : w
    );
    handleUpdateWebsites(updatedWebsites);
  };

  const handleCloseBrowserTab = (tabId: string) => {
    const updated = openTabIds.filter((id) => id !== tabId);
    setOpenTabIds(updated);
    saveOpenTabs(updated);

    if (activeWebTabId === tabId) {
      if (updated.length > 0) {
        setActiveWebTabId(updated[updated.length - 1]);
        saveActiveWebTab(updated[updated.length - 1]);
      } else {
        setActiveWebTabId(null);
        saveActiveWebTab(null);
        setIsBrowserOpen(false);
      }
    }
  };

  const handleResumeLastWork = () => {
    if (openTabIds.length > 0) {
      setIsBrowserOpen(true);
    } else if (websites.length > 0) {
      handleOpenWebsiteInApp(websites[0].id);
    }
  };

  // Active website name for Header pill
  const activeWebsite = useMemo(() => {
    return websites.find((w) => w.id === activeWebTabId) || null;
  }, [websites, activeWebTabId]);

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

      {/* Top Header Bar ("ADMIN 1 FOR ALL") */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        pendingCount={pendingReportsCount}
        openWebTabsCount={openTabIds.length}
        onOpenActiveBrowser={() => setIsBrowserOpen(true)}
        activeWebsiteName={activeWebsite?.name}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-3 pb-24">
        {activeTab === 'operasional' && (
          <OperasionalTab
            websites={websites}
            reports={reports}
            filesCount={files.length}
            openTabIds={openTabIds}
            activeWebTabId={activeWebTabId}
            onUpdateWebsites={handleUpdateWebsites}
            onNavigateTab={setActiveTab}
            onOpenWebsiteInApp={handleOpenWebsiteInApp}
            onResumeLastWork={handleResumeLastWork}
            onOpenAddReport={() => {
              setSelectedReportId(null);
              setActiveTab('report');
            }}
            onSelectReport={(id) => {
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

      {/* DESKTOP-LIKE IN-APP BROWSER (Preserves iframe state, tabs on top, fallback buttons) */}
      <InAppBrowser
        isOpen={isBrowserOpen}
        activeTabId={activeWebTabId}
        openTabIds={openTabIds}
        websites={websites}
        onSelectTab={handleSelectBrowserTab}
        onCloseTab={handleCloseBrowserTab}
        onOpenNewTab={handleOpenWebsiteInApp}
        onMinimize={() => setIsBrowserOpen(false)}
        onEditWebsite={(w) => setEditingWebsiteTarget(w)}
        onUpdateWebsite={(updated) => {
          handleUpdateWebsites(
            websites.map((w) => (w.id === updated.id ? updated : w))
          );
        }}
        onShowToast={showToast}
      />

      {/* Global Edit Website & Logo Modal */}
      <EditWebsiteModal
        isOpen={Boolean(editingWebsiteTarget)}
        onClose={() => setEditingWebsiteTarget(null)}
        website={editingWebsiteTarget}
        onSave={(updated) => {
          handleUpdateWebsites(
            websites.map((w) => (w.id === updated.id ? updated : w))
          );
          showToast(`Pengaturan "${updated.name}" disimpan`);
        }}
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
          handleOpenWebsiteInApp(web.id);
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
