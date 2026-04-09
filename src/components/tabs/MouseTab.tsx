import { useRef, useCallback, useState } from 'react';
import { Theme } from '../../types';

interface MouseTabProps {
  emit: (event: string, data?: unknown) => void;
  sensitivity: number;
  scrollSensitivity: number;
  theme: Theme;
  isConnected: boolean;
}

export function MouseTab({ emit, sensitivity, scrollSensitivity, theme, isConnected }: MouseTabProps) {
  const isDark = theme === 'dark';
  const trackpadRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const lastScrollYRef = useRef<number | null>(null);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapCountRef = useRef(0);
  const sendThrottleRef = useRef<number>(0);

  const [pressedBtn, setPressedBtn] = useState<string | null>(null);
  const [trackpadActive, setTrackpadActive] = useState(false);

  const btnCls = (name: string) => `
    flex-1 h-14 flex items-center justify-center text-sm font-semibold rounded-xl 
    select-none transition-all duration-100 active:scale-95
    ${pressedBtn === name
      ? isDark ? 'bg-[#00f3ff]/40 border-[#00f3ff] shadow-[0_0_20px_rgba(0,243,255,0.5)] scale-95' : 'bg-indigo-200 border-indigo-500 scale-95'
      : isDark ? 'bg-[#1a1a2e] border border-[#00f3ff]/30 text-white hover:bg-[#00f3ff]/10'
               : 'bg-white border border-gray-200 text-gray-700 hover:bg-indigo-50 shadow-sm'
    }
  `;

  const handleMouseBtn = (btn: string) => {
    emit('mouse_click', { button: btn });
    setPressedBtn(btn);
    setTimeout(() => setPressedBtn(null), 150);
  };

  // Trackpad touch handling
  const onTrackpadTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    setTrackpadActive(true);

    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      if (tapCountRef.current === 2) {
        emit('mouse_click', { button: 'double' });
      }
      tapCountRef.current = 0;
    }, 300);
  }, [emit]);

  const onTrackpadTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!lastTouchRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = (touch.clientX - lastTouchRef.current.x) * sensitivity;
    const dy = (touch.clientY - lastTouchRef.current.y) * sensitivity;
    lastTouchRef.current = { x: touch.clientX, y: touch.clientY };

    const now = Date.now();
    if (now - sendThrottleRef.current >= 8) {
      sendThrottleRef.current = now;
      emit('mouse_move', { dx: Math.round(dx * 10) / 10, dy: Math.round(dy * 10) / 10 });
    }
  }, [emit, sensitivity]);

  const onTrackpadTouchEnd = useCallback(() => {
    lastTouchRef.current = null;
    setTrackpadActive(false);
  }, []);

  // Two-finger scroll on trackpad
  const onTrackpadTwoFinger = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2) return;
    e.preventDefault();
    const avgY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    if (lastScrollYRef.current !== null) {
      const dy = (lastScrollYRef.current - avgY) * scrollSensitivity;
      emit('mouse_scroll', { dy: Math.round(dy) });
    }
    lastScrollYRef.current = avgY;
  }, [emit, scrollSensitivity]);

  // Scroll strip
  const onScrollTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    lastScrollYRef.current = e.touches[0].clientY;
  }, []);

  const onScrollTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (lastScrollYRef.current === null) return;
    const dy = (lastScrollYRef.current - e.touches[0].clientY) * scrollSensitivity * 0.5;
    lastScrollYRef.current = e.touches[0].clientY;
    const now = Date.now();
    if (now - sendThrottleRef.current >= 16) {
      sendThrottleRef.current = now;
      emit('mouse_scroll', { dy: Math.round(dy) });
    }
  }, [emit, scrollSensitivity]);

  const onScrollTouchEnd = useCallback(() => {
    lastScrollYRef.current = null;
  }, []);

  const accentColor = isDark ? '#00f3ff' : '#4f46e5';

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Status */}
      {!isConnected && (
        <div className={`px-4 py-2 rounded-xl text-xs text-center
          ${isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
          ⚠️ Нет соединения с сервером — демо-режим
        </div>
      )}

      {/* Mouse buttons */}
      <div className={`flex gap-2 p-3 rounded-2xl ${isDark ? 'bg-[#12121f] border border-[#00f3ff]/10' : 'bg-white border border-gray-100 shadow-sm'}`}>
        <button onPointerDown={() => handleMouseBtn('left')} className={btnCls('left')} style={{ userSelect: 'none' }}>
          ◀ Левая
        </button>
        <button onPointerDown={() => handleMouseBtn('middle')} className={btnCls('middle')} style={{ userSelect: 'none' }}>
          ● Средняя
        </button>
        <button onPointerDown={() => handleMouseBtn('right')} className={btnCls('right')} style={{ userSelect: 'none' }}>
          ▶ Правая
        </button>
      </div>

      {/* Trackpad + Scroll strip */}
      <div className="flex gap-3 flex-1" style={{ minHeight: '320px' }}>
        {/* Trackpad */}
        <div
          ref={trackpadRef}
          onTouchStart={onTrackpadTouchStart}
          onTouchMove={e => {
            if (e.touches.length === 2) onTrackpadTwoFinger(e);
            else onTrackpadTouchMove(e);
          }}
          onTouchEnd={onTrackpadTouchEnd}
          className={`flex-1 rounded-2xl flex items-center justify-center relative overflow-hidden cursor-crosshair select-none
            transition-all duration-200
            ${trackpadActive
              ? isDark ? 'border-2 border-[#00f3ff] shadow-[0_0_25px_rgba(0,243,255,0.25)]' : 'border-2 border-indigo-500 shadow-lg'
              : isDark ? 'border-2 border-[#00f3ff]/20 bg-[#12121f]' : 'border-2 border-gray-200 bg-white shadow-sm'
            }`}
          style={{ touchAction: 'none', WebkitUserSelect: 'none' }}
        >
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `radial-gradient(circle, ${accentColor} 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }} />

          {/* Center text */}
          <div className={`text-center select-none pointer-events-none z-10 transition-opacity duration-200 ${trackpadActive ? 'opacity-0' : 'opacity-100'}`}>
            <div className="text-3xl mb-2">🖱️</div>
            <p className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-300'}`}>Трекпад</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-white/20' : 'text-gray-200'}`}>Двойной тап = двойной клик</p>
            <p className={`text-xs ${isDark ? 'text-white/20' : 'text-gray-200'}`}>2 пальца = скролл</p>
          </div>

          {/* Active indicator */}
          {trackpadActive && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`w-8 h-8 rounded-full border-2 animate-ping opacity-50 ${isDark ? 'border-[#00f3ff]' : 'border-indigo-500'}`} />
            </div>
          )}
        </div>

        {/* Scroll strip */}
        <div className="flex flex-col items-center gap-1" style={{ width: '52px' }}>
          <span className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-300'}`}>▲</span>
          <div
            ref={scrollRef}
            onTouchStart={onScrollTouchStart}
            onTouchMove={onScrollTouchMove}
            onTouchEnd={onScrollTouchEnd}
            className={`flex-1 w-full rounded-2xl flex items-center justify-center relative overflow-hidden select-none
              ${isDark
                ? 'bg-[#12121f] border-2 border-[#00f3ff]/20 hover:border-[#00f3ff]/40'
                : 'bg-white border-2 border-gray-200 shadow-sm'
              }`}
            style={{ touchAction: 'none', WebkitUserSelect: 'none' }}
          >
            {/* Scroll indicator lines */}
            <div className="absolute inset-0 flex flex-col justify-center items-center gap-2 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`w-6 h-0.5 rounded-full ${isDark ? 'bg-[#00f3ff]/20' : 'bg-gray-200'}`} />
              ))}
            </div>
            <span className={`text-lg select-none z-10 ${isDark ? 'text-[#00f3ff]/40' : 'text-gray-300'}`}>≡</span>
          </div>
          <span className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-300'}`}>▼</span>
        </div>
      </div>

      {/* Sensitivity info */}
      <div className={`flex justify-between px-4 py-2 rounded-xl text-xs
        ${isDark ? 'bg-[#12121f] border border-[#00f3ff]/10' : 'bg-white border border-gray-100 shadow-sm'}`}>
        <span className={isDark ? 'text-white/30' : 'text-gray-300'}>
          Чувствительность: <span className={isDark ? 'text-[#00f3ff]/70' : 'text-indigo-500'}>{sensitivity.toFixed(1)}x</span>
        </span>
        <span className={isDark ? 'text-white/30' : 'text-gray-300'}>
          Скролл: <span className={isDark ? 'text-[#00f3ff]/70' : 'text-indigo-500'}>{scrollSensitivity.toFixed(1)}x</span>
        </span>
      </div>
    </div>
  );
}
