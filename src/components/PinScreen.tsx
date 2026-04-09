import { useState, useEffect } from 'react';
import { getStoredPin } from '../store/useStore';
import { Theme } from '../types';
import { Shield, Delete } from 'lucide-react';

interface PinScreenProps {
  theme: Theme;
  onSuccess: () => void;
}

const MAX_ATTEMPTS = 3;
const LOCK_TIME = 60; // seconds

export function PinScreen({ theme, onSuccess }: PinScreenProps) {
  const [input, setInput] = useState('');
  const [attempts, setAttempts] = useState(() => Number(localStorage.getItem('cc_attempts') || '0'));
  const [lockedUntil, setLockedUntil] = useState<number | null>(() => {
    const v = localStorage.getItem('cc_locked');
    return v ? Number(v) : null;
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const left = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (left <= 0) {
        setLockedUntil(null);
        setAttempts(0);
        localStorage.removeItem('cc_locked');
        localStorage.removeItem('cc_attempts');
        clearInterval(interval);
      } else {
        setTimeLeft(left);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const handleDigit = (d: string) => {
    if (isLocked || input.length >= 4) return;
    const newInput = input + d;
    setInput(newInput);
    if (newInput.length === 4) {
      setTimeout(() => checkPin(newInput), 150);
    }
  };

  const checkPin = (pin: string) => {
    if (pin === getStoredPin()) {
      setSuccess(true);
      localStorage.removeItem('cc_attempts');
      localStorage.removeItem('cc_locked');
      setTimeout(onSuccess, 600);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('cc_attempts', String(newAttempts));
      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCK_TIME * 1000;
        setLockedUntil(until);
        setTimeLeft(LOCK_TIME);
        localStorage.setItem('cc_locked', String(until));
        setAttempts(0);
      }
      setShake(true);
      setInput('');
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleDelete = () => {
    setInput(prev => prev.slice(0, -1));
  };

  const dots = Array.from({ length: 4 }, (_, i) => i < input.length);

  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center z-50 transition-colors duration-300
      ${isDark ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
      {/* Background glow */}
      {isDark && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #00f3ff, transparent)' }} />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Icon */}
        <div className={`p-5 rounded-full border-2 ${isDark
          ? 'border-[#00f3ff] bg-[#00f3ff]/10 shadow-[0_0_30px_rgba(0,243,255,0.3)]'
          : 'border-indigo-500 bg-indigo-50 shadow-lg'}`}>
          <Shield size={40} className={isDark ? 'text-[#00f3ff]' : 'text-indigo-600'} />
        </div>

        <div className="text-center">
          <h1 className={`text-2xl font-bold tracking-wider ${isDark ? 'text-white' : 'text-gray-800'}`}>
            COMMAND CENTER
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-[#00f3ff]/60' : 'text-gray-400'}`}>
            Введите PIN-код для доступа
          </p>
        </div>

        {/* PIN dots */}
        <div className={`flex gap-4 ${shake ? 'animate-shake' : ''}`}>
          {dots.map((filled, i) => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
              success
                ? isDark ? 'bg-green-400 border-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]' : 'bg-green-500 border-green-500'
                : filled
                  ? isDark ? 'bg-[#00f3ff] border-[#00f3ff] shadow-[0_0_12px_rgba(0,243,255,0.8)]' : 'bg-indigo-600 border-indigo-600'
                  : isDark ? 'border-[#00f3ff]/40 bg-transparent' : 'border-gray-300 bg-transparent'
            }`} />
          ))}
        </div>

        {/* Error / Lock message */}
        {isLocked && (
          <div className={`text-center px-4 py-2 rounded-lg ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-500'}`}>
            <p className="text-sm font-medium">Слишком много попыток!</p>
            <p className="text-xs mt-1">Повторите через <span className="font-bold">{timeLeft}с</span></p>
          </div>
        )}
        {!isLocked && attempts > 0 && (
          <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-500'}`}>
            Неверный PIN. Осталось попыток: {MAX_ATTEMPTS - attempts}
          </p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 w-72">
          {['1','2','3','4','5','6','7','8','9'].map(d => (
            <button key={d} onClick={() => handleDigit(d)}
              disabled={isLocked}
              className={`h-16 rounded-xl text-xl font-semibold transition-all duration-150 active:scale-95 select-none
                ${isDark
                  ? 'bg-[#1a1a2e] text-white border border-[#00f3ff]/20 hover:border-[#00f3ff]/50 hover:bg-[#00f3ff]/10 hover:shadow-[0_0_15px_rgba(0,243,255,0.2)] disabled:opacity-30'
                  : 'bg-white text-gray-800 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 shadow-sm disabled:opacity-30'
                }`}>
              {d}
            </button>
          ))}
          {/* Row: [del] [0] [ok] */}
          <button onClick={handleDelete}
            className={`h-16 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 select-none
              ${isDark
                ? 'bg-[#1a1a2e] text-[#00f3ff]/70 border border-[#00f3ff]/20 hover:border-[#00f3ff]/50'
                : 'bg-white text-gray-400 border border-gray-200 hover:border-indigo-300 shadow-sm'
              }`}>
            <Delete size={20} />
          </button>
          <button onClick={() => handleDigit('0')} disabled={isLocked}
            className={`h-16 rounded-xl text-xl font-semibold transition-all duration-150 active:scale-95 select-none
              ${isDark
                ? 'bg-[#1a1a2e] text-white border border-[#00f3ff]/20 hover:border-[#00f3ff]/50 hover:bg-[#00f3ff]/10 disabled:opacity-30'
                : 'bg-white text-gray-800 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 shadow-sm disabled:opacity-30'
              }`}>
            0
          </button>
          <button onClick={() => input.length === 4 && checkPin(input)}
            disabled={isLocked || input.length < 4}
            className={`h-16 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95 select-none
              ${isDark
                ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/50 hover:bg-[#00f3ff]/30 disabled:opacity-30 shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                : 'bg-indigo-600 text-white border border-indigo-600 hover:bg-indigo-700 disabled:opacity-30 shadow-sm'
              }`}>
            ОК
          </button>
        </div>

        <p className={`text-xs ${isDark ? 'text-white/20' : 'text-gray-300'}`}>
          По умолчанию: 1234
        </p>
      </div>
    </div>
  );
}
