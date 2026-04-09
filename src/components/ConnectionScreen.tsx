import { useState } from 'react';
import { Theme } from '../types';
import { WifiOff, RefreshCw } from 'lucide-react';

interface ConnectionScreenProps {
  theme: Theme;
  serverUrl: string;
  setServerUrl: (url: string) => void;
  onRetry: () => void;
}

export function ConnectionOverlay({ theme, serverUrl, setServerUrl, onRetry }: ConnectionScreenProps) {
  const isDark = theme === 'dark';
  const [urlInput, setUrlInput] = useState(serverUrl);

  return (
    <div className={`fixed bottom-20 left-4 right-4 z-30 rounded-2xl p-4 transition-all
      ${isDark
        ? 'bg-[#12121f] border border-amber-500/30 shadow-[0_0_20px_rgba(251,191,36,0.1)]'
        : 'bg-white border border-amber-200 shadow-lg'
      }`}>
      <div className="flex items-center gap-2 mb-3">
        <WifiOff size={16} className="text-amber-400" />
        <span className={`text-sm font-semibold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
          Нет соединения с сервером
        </span>
      </div>
      <div className="flex gap-2">
        <input
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          placeholder="http://192.168.1.100:5000"
          className={`flex-1 rounded-lg px-3 py-2 text-xs outline-none
            ${isDark
              ? 'bg-[#0a0a0f] border border-[#00f3ff]/20 text-white placeholder:text-white/20'
              : 'bg-gray-50 border border-gray-200 text-gray-800'
            }`}
        />
        <button
          onClick={() => { setServerUrl(urlInput); onRetry(); }}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition flex items-center gap-1
            ${isDark
              ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/40'
              : 'bg-indigo-600 text-white'
            }`}>
          <RefreshCw size={12} />
          Подключить
        </button>
      </div>
      <p className={`text-xs mt-2 ${isDark ? 'text-white/20' : 'text-gray-300'}`}>
        💡 Запустите app.py на вашем ПК
      </p>
    </div>
  );
}
