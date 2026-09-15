import React, { useState } from 'react';
import { Lock, ShieldCheck, Delete, ArrowRight } from 'lucide-react';
import { getStoredPin } from '../utils/storage';

interface AppLockModalProps {
  isLocked: boolean;
  onUnlock: () => void;
}

export const AppLockModal: React.FC<AppLockModalProps> = ({ isLocked, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isLocked) return null;

  const correctPin = getStoredPin();

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + d;
    setPin(newPin);
    setErrorMsg('');

    if (newPin.length === 4) {
      if (!correctPin || newPin === correctPin) {
        onUnlock();
        setPin('');
      } else {
        setErrorMsg('PIN salah, silakan coba lagi');
        setTimeout(() => setPin(''), 500);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900 text-white p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xs text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/10">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-lg font-black tracking-tight text-white">
            ADMIN WORK CENTER
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Masukkan 4-digit PIN untuk membuka akses
          </p>
        </div>

        {/* PIN dots */}
        <div className="flex justify-center gap-3 py-2">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full transition-all ${
                pin.length > idx
                  ? 'bg-blue-500 ring-4 ring-blue-500/20 scale-110'
                  : 'bg-stone-700'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-400 font-semibold animate-shake">
            {errorMsg}
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="w-16 h-16 rounded-full bg-stone-800/80 hover:bg-stone-700 active:scale-90 mx-auto flex items-center justify-center text-xl font-bold text-white transition-all shadow-xs"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="w-16 h-16 rounded-full bg-stone-800/80 hover:bg-stone-700 active:scale-90 mx-auto flex items-center justify-center text-xl font-bold text-white transition-all shadow-xs"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="w-16 h-16 rounded-full bg-stone-800/80 hover:bg-stone-700 active:scale-90 mx-auto flex items-center justify-center text-stone-400 hover:text-white transition-all shadow-xs"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
