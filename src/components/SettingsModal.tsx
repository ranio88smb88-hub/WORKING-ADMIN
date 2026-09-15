import React, { useState } from 'react';
import {
  X,
  Settings,
  Globe,
  Lock,
  Download,
  Upload,
  RotateCcw,
  Check,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';
import { WebsiteItem } from '../types';
import { exportAllData, importAllData, savePin, getStoredPin } from '../utils/storage';
import { INITIAL_WEBSITES } from '../data/initialData';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  websites: WebsiteItem[];
  onUpdateWebsites: (websites: WebsiteItem[]) => void;
  onDataReload: () => void;
  onLockAppNow: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  websites,
  onUpdateWebsites,
  onDataReload,
  onLockAppNow,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'urls' | 'security' | 'backup'>('urls');
  const [currentPin, setCurrentPin] = useState(getStoredPin() || '');
  const [newPinInput, setNewPinInput] = useState('');

  if (!isOpen) return null;

  const handleUpdateWebsiteUrl = (id: string, newUrl: string) => {
    const updated = websites.map((w) => (w.id === id ? { ...w, url: newUrl.trim() } : w));
    onUpdateWebsites(updated);
  };

  const handleSetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length === 4) {
      savePin(newPinInput);
      setCurrentPin(newPinInput);
      setNewPinInput('');
      onShowToast('PIN App Lock berhasil disimpan');
    } else {
      onShowToast('PIN harus terdiri dari 4 digit angka', 'warning');
    }
  };

  const handleRemovePin = () => {
    savePin(null);
    setCurrentPin('');
    onShowToast('PIN App Lock dinonaktifkan');
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ADMIN_WORK_CENTER_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Data backup berhasil diunduh');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        importAllData(parsed);
        onDataReload();
        onShowToast('Data berhasil dipulihkan dari backup!', 'success');
        onClose();
      } catch (err) {
        onShowToast('Format file JSON tidak valid', 'warning');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="fixed inset-0 bg-transparent" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden z-10 animate-in fade-in slide-in-from-bottom duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">Pengaturan Admin</h2>
              <p className="text-[11px] text-stone-500 font-medium">
                Kelola URL portal, keamanan, & backup
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

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-100 px-3 bg-stone-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('urls')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 text-center transition-colors ${
              activeTab === 'urls'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            URL Portal (12)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 text-center transition-colors ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            PIN Keamanan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 text-center transition-colors ${
              activeTab === 'backup'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Backup & Data
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: URL PORTAL */}
          {activeTab === 'urls' && (
            <div className="space-y-3">
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Atur seluruh URL website kerja di bawah ini. Tombol Buka di dashboard akan langsung menuju ke URL yang Anda simpan.
              </p>

              <div className="space-y-2.5">
                {websites.map((item) => (
                  <div
                    key={`set-url-${item.id}`}
                    className="p-3 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-900">
                        {item.order}. {item.name}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {item.url ? 'URL Terpasang' : 'Belum diatur'}
                      </span>
                    </div>
                    <input
                      type="text"
                      defaultValue={item.url || ''}
                      onBlur={(e) => handleUpdateWebsiteUrl(item.id, e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 bg-white font-mono text-[11px] text-stone-800 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY & PIN LOCK */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-2">
                <div className="flex items-center gap-2 text-stone-800">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-xs">Status Proteksi PIN</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  {currentPin
                    ? 'Aplikasi saat ini dilindungi dengan 4-digit PIN.'
                    : 'Aplikasi saat ini belum menggunakan PIN pengaman.'}
                </p>

                {currentPin ? (
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onLockAppNow}
                      className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Kunci Sekarang
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePin}
                      className="flex-1 py-2 rounded-xl border border-rose-200 text-rose-600 font-bold text-xs hover:bg-rose-50"
                    >
                      Matikan PIN
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Set / Change PIN Form */}
              <form onSubmit={handleSetPin} className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3">
                <h4 className="font-bold text-xs text-stone-900">
                  {currentPin ? 'Ganti 4-Digit PIN' : 'Buat 4-Digit PIN Baru'}
                </h4>
                <input
                  type="password"
                  maxLength={4}
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ketik 4 angka PIN (contoh: 1234)"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-center font-mono text-base tracking-widest text-stone-900 focus:outline-hidden focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={newPinInput.length !== 4}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-colors"
                >
                  Simpan PIN
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-2">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-xs text-stone-900">Cadangkan Data (JSON)</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Ekspor seluruh data website, report, berkas, dan catatan ke dalam file cadangan.
                </p>
                <button
                  type="button"
                  onClick={handleExport}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" /> Unduh Cadangan JSON
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-2">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-xs text-stone-900">Pulihkan dari Cadangan</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Pilih file JSON cadangan untuk memulihkan seluruh data operasional Anda.
                </p>
                <label className="w-full py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Pilih File Cadangan</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
