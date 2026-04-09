import { useState, useEffect, useRef } from 'react';
import { Theme } from '../../types';
import { StopCircle, Clock } from 'lucide-react';

interface FunTabProps {
  emit: (event: string, data?: unknown) => void;
  theme: Theme;
  isConnected: boolean;
}

const SOUNDS = [
  { id: 'airhorn', label: 'Airhorn', icon: '📯' },
  { id: 'wow', label: 'WOW', icon: '😮' },
  { id: 'fail', label: 'Fail', icon: '😭' },
  { id: 'bruh', label: 'Bruh', icon: '🤨' },
  { id: 'vineboom', label: 'Vine Boom', icon: '💥' },
  { id: 'nyan', label: 'Nyan Cat', icon: '🌈' },
  { id: 'trombone', label: 'Trombone', icon: '🎺' },
  { id: 'tada', label: 'Ta-da!', icon: '🎉' },
];

const DELAYS = [0, 5, 10, 30];

export function FunTab({ emit, theme, isConnected }: FunTabProps) {
  const isDark = theme === 'dark';
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [selectedDelay, setSelectedDelay] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cardCls = isDark
    ? 'bg-[#12121f] border border-[#00f3ff]/10 rounded-2xl p-4'
    : 'bg-white border border-gray-100 rounded-2xl p-4 shadow-sm';

  const accent = isDark ? 'text-[#00f3ff]' : 'text-indigo-600';

  const stopAll = () => {
    setActiveEffect(null);
    setCountdown(null);
    if (countdownRef.current) clearInterval(countdownRef.current);
    emit('fun_stop_all');
  };

  const triggerEffect = (effectId: string) => {
    if (!isConnected) return;
    if (selectedDelay === 0) {
      setActiveEffect(effectId);
      emit('fun_effect', { effect: effectId });
    } else {
      let remaining = selectedDelay;
      setCountdown(remaining);
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining <= 0) {
          clearInterval(countdownRef.current!);
          setCountdown(null);
          setActiveEffect(effectId);
          emit('fun_effect', { effect: effectId });
        }
      }, 1000);
    }
  };

  const triggerSound = (soundId: string) => {
    if (!isConnected) return;
    setActiveSound(soundId);
    emit('fun_sound', { sound: soundId });
    setTimeout(() => setActiveSound(null), 1000);
  };

  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current); }, []);

  const effectBtn = (id: string, icon: string, label: string, colorClass: string) => (
    <button
      key={id}
      onClick={() => countdown !== null ? null : triggerEffect(id)}
      disabled={!isConnected || countdown !== null}
      className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl transition-all active:scale-95
        ${activeEffect === id
          ? isDark ? 'border-2 border-red-400 bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'border-2 border-red-500 bg-red-50'
          : `${colorClass} ${!isConnected || countdown !== null ? 'opacity-40' : ''}`
        }`}
    >
      <span className="text-3xl leading-none">{icon}</span>
      <span className={`text-xs font-medium ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{label}</span>
    </button>
  );

  return (
    <div className="space-y-4 pb-4">
      {/* STOP ALL — always visible */}
      <button
        onClick={stopAll}
        className={`w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95
          bg-red-500 text-white shadow-lg hover:bg-red-600
          ${isDark ? 'shadow-[0_0_30px_rgba(239,68,68,0.4)]' : ''}`}
      >
        <StopCircle size={20} />
        ❌ СТОП ВСЁ — ОТМЕНИТЬ
      </button>

      {/* Connection warning */}
      {!isConnected && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm
          ${isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
          ⚠️ Нет соединения — функции недоступны
        </div>
      )}

      {/* Countdown display */}
      {countdown !== null && (
        <div className={`flex items-center justify-center gap-3 py-4 rounded-2xl
          ${isDark ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'}`}>
          <Clock size={20} className="text-amber-400 animate-pulse" />
          <span className="text-3xl font-bold text-amber-400">{countdown}с</span>
          <span className={`text-sm ${isDark ? 'text-amber-400/60' : 'text-amber-500'}`}>до активации...</span>
        </div>
      )}

      {/* Delay selector */}
      <div className={cardCls}>
        <div className={`flex items-center gap-2 mb-3 ${accent}`}>
          <Clock size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">Задержка активации</span>
        </div>
        <div className="flex gap-2">
          {DELAYS.map(d => (
            <button key={d} onClick={() => setSelectedDelay(d)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all
                ${selectedDelay === d
                  ? isDark ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/50' : 'bg-indigo-600 text-white'
                  : isDark ? 'bg-[#1a1a2e] text-white/40 border border-white/10' : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}>
              {d === 0 ? 'Сейчас' : `${d}с`}
            </button>
          ))}
        </div>
      </div>

      {/* Visual effects */}
      <div className={cardCls}>
        <div className={`flex items-center gap-2 mb-3 ${accent}`}>
          <span className="text-xs font-bold uppercase tracking-wider">🎭 Визуальные эффекты</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {effectBtn('black_screen', '⬛', 'Чёрный экран',
            isDark ? 'bg-black/50 border border-white/10' : 'bg-gray-900 border border-gray-700')}
          {effectBtn('white_screen', '⬜', 'Белый экран',
            isDark ? 'bg-white/10 border border-white/20' : 'bg-white border border-gray-300 shadow-sm')}
          {effectBtn('screamer', '😱', 'Скример!',
            isDark ? 'bg-red-900/30 border border-red-500/30' : 'bg-red-50 border border-red-200')}
          {effectBtn('matrix', '🟩', 'Матрица',
            isDark ? 'bg-green-900/20 border border-green-500/20' : 'bg-green-50 border border-green-200')}
          {effectBtn('disco', '💃', 'Диско',
            isDark ? 'bg-purple-900/20 border border-purple-500/20' : 'bg-purple-50 border border-purple-200')}
          {effectBtn('rainbow', '🌈', 'Радуга',
            isDark ? 'bg-pink-900/20 border border-pink-500/20' : 'bg-pink-50 border border-pink-200')}
        </div>
      </div>

      {/* Sounds */}
      <div className={cardCls}>
        <div className={`flex items-center gap-2 mb-3 ${accent}`}>
          <span className="text-xs font-bold uppercase tracking-wider">🔊 Звуки на ПК</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {SOUNDS.map(s => (
            <button
              key={s.id}
              onClick={() => triggerSound(s.id)}
              disabled={!isConnected}
              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-medium transition-all active:scale-90
                ${activeSound === s.id
                  ? isDark ? 'bg-[#00f3ff]/40 border border-[#00f3ff] scale-90' : 'bg-indigo-200 border border-indigo-500 scale-90'
                  : isDark ? 'bg-[#1a1a2e] border border-[#00f3ff]/20 text-white/70 hover:bg-[#00f3ff]/10 disabled:opacity-40'
                           : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-indigo-50 disabled:opacity-40 shadow-sm'
                }`}>
              <span className="text-xl leading-none">{s.icon}</span>
              <span className="text-[10px] text-center leading-tight">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active effect status */}
      {activeEffect && (
        <div className={`flex items-center justify-between px-4 py-3 rounded-xl
          ${isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
          <span className="text-sm text-red-400">🔴 Активен эффект: <strong>{activeEffect}</strong></span>
          <button onClick={stopAll} className="text-xs text-red-400 hover:text-red-300 font-medium">
            Стоп
          </button>
        </div>
      )}
    </div>
  );
}
