import React, { useState } from 'react';
import {
  Wrench,
  Calculator,
  FileEdit,
  ClipboardList,
  CheckSquare,
  Copy,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { QuickNoteItem, SOPChecklistItem } from '../../types';
import { copyToClipboard } from '../../utils/storage';

interface ToolsTabProps {
  quickNotes: QuickNoteItem[];
  onUpdateNotes: (notes: QuickNoteItem[]) => void;
  sopList: SOPChecklistItem[];
  onUpdateSOP: (list: SOPChecklistItem[]) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

type ToolSubSection = 'calculator' | 'notes' | 'templates' | 'sop';

export const ToolsTab: React.FC<ToolsTabProps> = ({
  quickNotes,
  onUpdateNotes,
  sopList,
  onUpdateSOP,
  onShowToast,
}) => {
  const [activeSection, setActiveSection] = useState<ToolSubSection>('calculator');

  // Calculator State
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState<string | null>(null);

  // Quick Notes State
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Template Formats
  const REPORT_TEMPLATES = [
    {
      title: 'Double Withdraw / Selisih',
      content: `*LAPORAN DOUBLE WITHDRAW*\nID Tiket: [NOMOR]\nUser ID: [USER_ID]\nBank: [BANK] - [NOREK]\nNominal: Rp [JUMLAH]\nKronologi: [PENJELASAN SINGKAT]\nStatus: Menunggu Konfirmasi PIC Finance\nStaff: [NAMA STAFF]`,
    },
    {
      title: 'Pending Deposit Manual',
      content: `*LAPORAN PENDING DEPOSIT*\nUser ID: [USER_ID]\nBank Tujuan: [BANK OPERASIONAL]\nNominal Transfer: Rp [JUMLAH]\nTanggal/Jam: [TGL] [JAM] WIB\nBukti Mutasi: [TERLAMPIR]\nKeterangan: Menunggu konfirmasi mutasi bank.`,
    },
    {
      title: 'Handover Pergantian Shift',
      content: `*REKAP OPERASIONAL SHIFT*\nShift: [PAGI/SIANG/MALAM]\nStaff Jaga: [NAMA STAFF]\nJumlah Tiket Selesai: [X]\nTiket Tertunda: [Y]\nCatatan Rekening: Rekening normal / gangguan\nPendingan: [URAIAN PENDINGAN]`,
    },
  ];

  // Calculator logic
  const handleCalcButton = (val: string) => {
    if (val === 'C') {
      setCalcInput('');
      setCalcResult(null);
    } else if (val === '=') {
      try {
        // Safe evaluation of simple math
        const sanitized = calcInput.replace(/[^0-9+\-*/.]/g, '');
        // eslint-disable-next-line no-eval
        const res = Function(`'use strict'; return (${sanitized})`)();
        setCalcResult(String(res));
      } catch (e) {
        setCalcResult('Error');
      }
    } else {
      setCalcInput((prev) => prev + val);
    }
  };

  const handleCopyTemplate = async (content: string, title: string) => {
    const ok = await copyToClipboard(content);
    if (ok) onShowToast(`Template "${title}" disalin ke clipboard!`, 'success');
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() && !newNoteContent.trim()) return;

    const noteItem: QuickNoteItem = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: newNoteTitle.trim() || 'Catatan Baru',
      content: newNoteContent.trim(),
      updatedAt: new Date().toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    onUpdateNotes([noteItem, ...quickNotes]);
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingNote(false);
    onShowToast('Catatan cepat disimpan');
  };

  const handleDeleteNote = (id: string) => {
    onUpdateNotes(quickNotes.filter((n) => n.id !== id));
    onShowToast('Catatan dihapus');
  };

  const handleToggleSOP = (id: string) => {
    const updated = sopList.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onUpdateSOP(updated);
  };

  const handleResetSOP = () => {
    if (window.confirm('Reset semua checklist SOP shift ke status belum selesai?')) {
      const updated = sopList.map((item) => ({ ...item, completed: false }));
      onUpdateSOP(updated);
      onShowToast('Checklist SOP berhasil direset');
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-3">
        <div>
          <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            TOOLS OPERASIONAL
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            Alat bantu hitung, template laporan, dan SOP harian admin
          </p>
        </div>

        {/* Sub-tool Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setActiveSection('calculator')}
            className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSection === 'calculator'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Kalkulator Cepat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('templates')}
            className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSection === 'templates'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Template Report</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('sop')}
            className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSection === 'sop'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Checklist SOP</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('notes')}
            className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSection === 'notes'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Catatan Cepat ({quickNotes.length})</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: KALKULATOR CEPAT */}
      {activeSection === 'calculator' && (
        <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs max-w-sm mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-blue-600" />
              Kalkulator Selisih & Mutasi
            </h3>
            <span className="text-[10px] text-stone-400 font-mono">Standar Admin</span>
          </div>

          {/* Calculator Screen */}
          <div className="bg-stone-900 text-white rounded-2xl p-3 text-right space-y-1">
            <div className="text-stone-400 font-mono text-xs min-h-[16px] tracking-wider truncate">
              {calcInput || '0'}
            </div>
            <div className="text-2xl font-black font-mono tracking-tight text-white min-h-[32px] truncate">
              {calcResult !== null ? calcResult : calcInput || '0'}
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-1.5">
            {['C', '(', ')', '/'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleCalcButton(k)}
                className="py-3 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 font-bold text-stone-700 text-sm transition-all"
              >
                {k}
              </button>
            ))}
            {['7', '8', '9', '*'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleCalcButton(k)}
                className="py-3 rounded-xl bg-stone-50 hover:bg-stone-100 active:scale-95 font-semibold text-stone-800 text-sm transition-all"
              >
                {k}
              </button>
            ))}
            {['4', '5', '6', '-'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleCalcButton(k)}
                className="py-3 rounded-xl bg-stone-50 hover:bg-stone-100 active:scale-95 font-semibold text-stone-800 text-sm transition-all"
              >
                {k}
              </button>
            ))}
            {['1', '2', '3', '+'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleCalcButton(k)}
                className="py-3 rounded-xl bg-stone-50 hover:bg-stone-100 active:scale-95 font-semibold text-stone-800 text-sm transition-all"
              >
                {k}
              </button>
            ))}
            {['0', '000', '.', '='].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleCalcButton(k)}
                className={`py-3 rounded-xl active:scale-95 font-bold text-sm transition-all ${
                  k === '='
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-800'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: TEMPLATE REPORT */}
      {activeSection === 'templates' && (
        <div className="space-y-3">
          {REPORT_TEMPLATES.map((tpl, idx) => (
            <div
              key={`tpl-${idx}`}
              className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-blue-600" />
                  {tpl.title}
                </h3>
                <button
                  type="button"
                  onClick={() => handleCopyTemplate(tpl.content, tpl.title)}
                  className="px-3 py-1 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Template</span>
                </button>
              </div>
              <pre className="p-3 rounded-2xl bg-stone-50 border border-stone-100 text-[11px] font-mono text-stone-700 whitespace-pre-wrap leading-relaxed">
                {tpl.content}
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 3: CHECKLIST SOP */}
      {activeSection === 'sop' && (
        <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                CHECKLIST SOP SHIFT
              </h3>
              <p className="text-[11px] text-stone-400">
                Wajib dilakukan sebelum pergantian shift
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetSOP}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 text-[11px] font-semibold flex items-center gap-1"
              title="Reset Checklist"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-2 pt-1">
            {sopList.map((item, idx) => (
              <div
                key={`sop-item-${item.id}-${idx}`}
                onClick={() => handleToggleSOP(item.id)}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  item.completed
                    ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
                    : 'border-stone-200 bg-white hover:border-stone-300 text-stone-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                      item.completed
                        ? 'bg-emerald-600 text-white'
                        : 'border border-stone-300 bg-white'
                    }`}
                  >
                    {item.completed && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span
                    className={`text-xs font-medium leading-relaxed ${
                      item.completed ? 'line-through text-stone-400' : 'text-stone-800'
                    }`}
                  >
                    {item.title}
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-500 shrink-0">
                  {item.shift}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: CATATAN CEPAT */}
      {activeSection === 'notes' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700">
              Daftar Catatan Cepat ({quickNotes.length})
            </span>
            <button
              type="button"
              onClick={() => setIsAddingNote(!isAddingNote)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Catatan</span>
            </button>
          </div>

          {/* New Note Form */}
          {isAddingNote && (
            <form
              onSubmit={handleSaveNote}
              className="bg-white rounded-3xl p-4 border border-blue-200 shadow-sm space-y-3 animate-in fade-in duration-150"
            >
              <h4 className="text-xs font-bold text-stone-900">Buat Catatan Baru</h4>
              <input
                type="text"
                required
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Judul catatan (contoh: Rekening Cadangan)"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-900"
              />
              <textarea
                required
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={3}
                placeholder="Isi catatan, nomor kontak, instruksi..."
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-900 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="px-3 py-1.5 rounded-xl border text-stone-600 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  Simpan
                </button>
              </div>
            </form>
          )}

          {/* Notes Cards */}
          <div className="space-y-2">
            {quickNotes.map((n, idx) => (
              <div
                key={`note-${n.id}-${idx}`}
                className="bg-white rounded-2xl border border-stone-200/80 p-3.5 space-y-1.5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-900">{n.title}</h4>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(n.content).then(() => onShowToast('Catatan disalin'))}
                      className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                      title="Salin isi"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(n.id)}
                      className="p-1 rounded-lg text-stone-400 hover:text-rose-600"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-stone-700 whitespace-pre-wrap leading-relaxed">
                  {n.content}
                </p>
                <div className="text-[10px] text-stone-400 text-right pt-1">
                  {n.updatedAt}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
