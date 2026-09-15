import {
  WebsiteItem,
  ReportItem,
  WorkFileItem,
  SOPChecklistItem,
  QuickNoteItem,
  AppBackupData,
} from '../types';
import {
  INITIAL_WEBSITES,
  INITIAL_REPORTS,
  INITIAL_FILES,
  INITIAL_SOP_CHECKLIST,
  INITIAL_QUICK_NOTES,
} from '../data/initialData';

const STORAGE_KEYS = {
  WEBSITES: 'awc_websites_data_v2',
  REPORTS: 'awc_reports_data_v2',
  FILES: 'awc_files_data_v2',
  SOP: 'awc_sop_data_v2',
  NOTES: 'awc_notes_data_v2',
  PIN: 'awc_pin_code',
  AUTO_LOCK: 'awc_auto_lock_enabled',
  OPEN_TABS: 'awc_open_web_tabs_v1',
  ACTIVE_WEB_TAB: 'awc_active_web_tab_id_v1',
};

// --- WEBSITES ---
export const getStoredWebsites = (): WebsiteItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEBSITES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WEBSITES, JSON.stringify(INITIAL_WEBSITES));
      return INITIAL_WEBSITES;
    }
    const parsed: WebsiteItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_WEBSITES;

    // Backfill shortCode, badgeColor, and order if missing
    const initialMap = new Map(INITIAL_WEBSITES.map((w) => [w.id, w]));
    return parsed.map((item, idx) => {
      const init = initialMap.get(item.id);
      return {
        ...item,
        shortCode: item.shortCode || init?.shortCode || item.name.slice(0, 2).toUpperCase(),
        badgeColor: item.badgeColor || init?.badgeColor || '#4f46e5',
        order: item.order ?? idx + 1,
      };
    });
  } catch (e) {
    console.error('Failed to load websites', e);
    return INITIAL_WEBSITES;
  }
};

export const getStoredOpenTabs = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OPEN_TABS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveOpenTabs = (tabIds: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.OPEN_TABS, JSON.stringify(tabIds));
  } catch {}
};

export const getStoredActiveWebTab = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_WEB_TAB);
  } catch {
    return null;
  }
};

export const saveActiveWebTab = (id: string | null) => {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WEB_TAB, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WEB_TAB);
    }
  } catch {}
};

export const saveWebsites = (items: WebsiteItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.WEBSITES, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save websites', e);
  }
};

// --- REPORTS ---
export const getStoredReports = (): ReportItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    const parsed: ReportItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return INITIAL_REPORTS;
    return parsed;
  } catch (e) {
    console.error('Failed to load reports', e);
    return INITIAL_REPORTS;
  }
};

export const saveReports = (items: ReportItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save reports', e);
  }
};

// --- FILES ---
export const getStoredFiles = (): WorkFileItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FILES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(INITIAL_FILES));
      return INITIAL_FILES;
    }
    const parsed: WorkFileItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return INITIAL_FILES;
    return parsed;
  } catch (e) {
    console.error('Failed to load files', e);
    return INITIAL_FILES;
  }
};

export const saveFiles = (items: WorkFileItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save files', e);
  }
};

// --- SOP CHECKLIST ---
export const getStoredSOP = (): SOPChecklistItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SOP);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SOP, JSON.stringify(INITIAL_SOP_CHECKLIST));
      return INITIAL_SOP_CHECKLIST;
    }
    const parsed: SOPChecklistItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return INITIAL_SOP_CHECKLIST;
    return parsed;
  } catch (e) {
    return INITIAL_SOP_CHECKLIST;
  }
};

export const saveSOP = (items: SOPChecklistItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SOP, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save SOP', e);
  }
};

// --- QUICK NOTES ---
export const getStoredNotes = (): QuickNoteItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(INITIAL_QUICK_NOTES));
      return INITIAL_QUICK_NOTES;
    }
    const parsed: QuickNoteItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return INITIAL_QUICK_NOTES;
    return parsed;
  } catch (e) {
    return INITIAL_QUICK_NOTES;
  }
};

export const getStoredQuickNotes = getStoredNotes;

export const saveNotes = (items: QuickNoteItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save notes', e);
  }
};

export const saveQuickNotes = saveNotes;

// --- PIN & SECURITY ---
export const getStoredPin = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.PIN);
};

export const savePin = (pin: string | null) => {
  if (pin) {
    localStorage.setItem(STORAGE_KEYS.PIN, pin);
  } else {
    localStorage.removeItem(STORAGE_KEYS.PIN);
  }
};

// --- BACKUP & RESTORE ---
export const exportAllData = (): AppBackupData => {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    websites: getStoredWebsites(),
    reports: getStoredReports(),
    files: getStoredFiles(),
    quickNotes: getStoredNotes(),
    sopChecklist: getStoredSOP(),
  };
};

export const importAllData = (backup: AppBackupData) => {
  if (backup.websites) saveWebsites(backup.websites);
  if (backup.reports) saveReports(backup.reports);
  if (backup.files) saveFiles(backup.files);
  if (backup.quickNotes) saveNotes(backup.quickNotes);
  if (backup.sopChecklist) saveSOP(backup.sopChecklist);
};

// --- HELPERS ---
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    textArea.remove();
    return true;
  } catch (err) {
    console.error('Copy failed', err);
    return false;
  }
};
