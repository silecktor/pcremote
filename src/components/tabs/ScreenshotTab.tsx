import { useState, useEffect, useRef } from 'react';
import { Theme } from '../../types';
import { Camera, Download, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

interface ScreenshotTabProps {
  emit: (event: string, data?: unknown) => void;
  screenshotData: string | null;
  autoScreenshot: boolean;
  setAutoScreenshot: (v: boolean) => void;
  theme: Theme;
  isConnected: boolean;
}

export function ScreenshotTab({ emit, screenshotData, autoScreenshot, setAutoScreenshot, theme, isConnected }: ScreenshotTabProps) {
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(false);
  const [scale, setScale] = useState(1);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cardCls = isDark
    ? 'bg-[#12121f] border border-[#00f3ff]/10 rounded-2xl p-4'
    : 'bg-white border border-gray-100 rounded-2xl p-4 shadow-sm';

  const accent = isDark ? 'text-[#00f3ff]' : 'text-indigo-600';

  const takeScreenshot = () => {
    setLoading(true);
    emit('take_screenshot');
    setTimeout(() => setLoading(false), 3000);
  };

  useEffect(() => {
    if (screenshotData) setLoading(false);
  }, [screenshotData]);

  useEffect(() => {
    if (autoScreenshot) {
      autoRef.current = setInterval(() => {
        emit('take_screenshot');
      }, 5000);
    } else {
      if (autoRef.current) clearInterval(autoRef.current);
    }
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [autoScreenshot, emit]);

  const saveImage = () => {
    if (!screenshotData) return;
    const link = document.createElement('a');
    link.download = `screenshot_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.jpg`;
    link.href = `data:image/jpeg;base64,${screenshotData}`;
    link.click();
  };

  const accentBg = isDark
    ? 'bg-[#00f3ff]/20 border border-[#00f3ff]/40 text-[#00f3ff] hover:bg-[#00f3ff]/30'
    : 'bg-indigo-600 text-white hover:bg-indigo-700';

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className={cardCls}>
        <div className={`flex items-center gap-2 mb-3 ${accent}`}>
          <Camera size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">Скриншот экрана</span>
        </div>

        <button
          onClick={takeScreenshot}
          disabled={!isConnected || loading}
          className={`w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 mb-3
            ${!isConnected
              ? isDark ? 'bg-white/5 text-white/20 border border-white/10' : 'bg-gray-100 text-gray-300 border border-gray-200'
              : loading
                ? isDark ? 'bg-[#00f3ff]/10 text-[#00f3ff]/50 border border-[#00f3ff]/20' : 'bg-indigo-50 text-indigo-300 border border-indigo-200'
                : accentBg
            }`}>
          {loading
            ? <><RefreshCw size={16} className="animate-spin" /> Получаем скриншот...</>
            : <><Camera size={16} /> 📸 Сделать скриншот</>
          }
        </button>

        <div className="flex gap-2">
          <button
            onClick={saveImage}
            disabled={!screenshotData}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-95
              ${!screenshotData
                ? isDark ? 'bg-white/5 text-white/20 border border-white/10' : 'bg-gray-100 text-gray-300 border border-gray-200'
                : isDark ? 'bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30'
                         : 'bg-green-600 text-white hover:bg-green-700'
              }`}>
            <Download size={14} /> Сохранить
          </button>
          <button
            onClick={() => {
              setAutoScreenshot(!autoScreenshot);
            }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-95
              ${autoScreenshot
                ? isDark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-amber-500 text-white'
                : isDark ? 'bg-[#1a1a2e] text-white/50 border border-white/10 hover:bg-white/5'
                         : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}>
            <RefreshCw size={14} className={autoScreenshot ? 'animate-spin' : ''} />
            {autoScreenshot ? 'Стоп авто' : 'Авто каждые 5с'}
          </button>
        </div>
      </div>

      {/* Screenshot preview */}
      {screenshotData ? (
        <div className={cardCls}>
          <div className={`flex items-center justify-between mb-3`}>
            <div className={`flex items-center gap-2 ${accent}`}>
              <span className="text-xs font-bold uppercase tracking-wider">Предпросмотр</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setScale(Math.max(0.5, scale - 0.25))}
                className={`p-1.5 rounded-lg transition ${isDark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-gray-100 text-gray-500'}`}>
                <ZoomOut size={14} />
              </button>
              <span className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale(Math.min(3, scale + 0.25))}
                className={`p-1.5 rounded-lg transition ${isDark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-gray-100 text-gray-500'}`}>
                <ZoomIn size={14} />
              </button>
            </div>
          </div>
          <div className={`overflow-auto rounded-xl ${isDark ? 'bg-black/50' : 'bg-gray-100'}`}
            style={{ maxHeight: '400px' }}>
            <img
              src={`data:image/jpeg;base64,${screenshotData}`}
              alt="Screenshot"
              style={{ transform: `scale(${scale})`, transformOrigin: 'top left', display: 'block' }}
              className="max-w-full transition-transform duration-200"
            />
          </div>
        </div>
      ) : (
        <div className={`${cardCls} flex flex-col items-center justify-center py-16`}>
          <div className="text-5xl mb-4 opacity-30">📸</div>
          <p className={`text-sm ${isDark ? 'text-white/20' : 'text-gray-300'}`}>
            {isConnected ? 'Нажмите кнопку для скриншота' : 'Нет соединения с сервером'}
          </p>
        </div>
      )}
    </div>
  );
}
