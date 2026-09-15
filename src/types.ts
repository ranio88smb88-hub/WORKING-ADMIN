export type TabType = 'operasional' | 'berkas' | 'report' | 'ringkasan' | 'tools';

export type ReportStatus = 'prioritas' | 'tertunda' | 'menunggu' | 'selesai';
export type ReportPriority = 'Tinggi' | 'Sedang' | 'Rendah';

export interface ReportHistoryItem {
  id: string;
  timestamp: string;
  action: string;
  author?: string;
  details?: string;
}

export interface ReportAttachment {
  name: string;
  size?: string;
  type?: string;
  dataUrl?: string;
}

export interface ReportItem {
  id: string;
  number: string; // e.g. "#00001"
  title: string;
  reportType: string; // e.g. "Double Withdraw", "Pending Deposit", "Selisih Saldo"
  date: string; // e.g. "16 September 2026"
  time: string; // e.g. "01:20"
  staff: string; // e.g. "Poipet"
  status: ReportStatus;
  priority: ReportPriority;
  description: string;
  notes: string;
  reminder?: string;
  attachments: ReportAttachment[];
  history: ReportHistoryItem[];
  updatedAt: string;
}

export type FileCategory =
  | 'Semua'
  | 'Withdraw'
  | 'Deposit'
  | 'Kas'
  | 'CS'
  | 'Promo'
  | 'Operasional'
  | 'Lainnya';

export interface WorkFileItem {
  id: string;
  name: string;
  fileType: 'jpg' | 'png' | 'webp' | 'pdf' | 'txt' | 'docx' | 'xlsx' | 'csv' | string;
  category: Exclude<FileCategory, 'Semua'>;
  date: string;
  time?: string;
  size?: string;
  notes?: string;
  status?: string;
  folder?: string;
  dataUrl?: string; // base64 / blob preview if uploaded
  createdAt: string;
}

export interface WebsiteItem {
  id: string;
  order: number;
  name: string;
  shortCode: string; // e.g. "MD", "US", "CB", "LC", "TW", "BS", "BK", "PNG", "PWR", "AS", "MSG", "QR"
  url?: string; // If empty, displays "URL belum diatur"
  logoUrl?: string; // Custom uploaded image / icon
  badgeColor?: string; // Accent color hex or name
  status: 'online' | 'active' | 'maintenance' | 'siap';
  isPinned: boolean;
  isFavorite: boolean;
  category?: string;
  notes?: string;
  lastOpened?: string;
}

export interface BrowserTab {
  id: string; // tab session id
  websiteId: string;
  title: string;
  shortCode: string;
  url: string;
  logoUrl?: string;
  badgeColor?: string;
}

export interface QuickNoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  color?: string;
}

export interface SOPChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  shift: 'Pagi' | 'Siang' | 'Malam' | 'Umum';
}

export interface AppBackupData {
  version: number;
  exportedAt: string;
  websites: WebsiteItem[];
  reports: ReportItem[];
  files: WorkFileItem[];
  quickNotes?: QuickNoteItem[];
  sopChecklist?: SOPChecklistItem[];
  pinCode?: string;
}
