import { useState } from 'react';
import { X, Wifi, Mouse, Lock, Info, LogOut } from 'lucide-react';
import { Theme } from '../types';
import { getStoredPin, setStoredPin } from '../store/useStore';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  serverUrl: string;
  setServerUrl: (u: string) => void;
  sensitivity: number;
  setSensitivity: (v: number) => void;
  scrollSensitivity: number;
  setScrollSensitivity: (v: number) => void;
  showFunTab: boolean;
  setShowFunTab: (v: boolean) => void;
  isConnected: boolean;
  onLogout: () => void;
}

export function SettingsDrawer({
  open, onClose, theme, setTheme, serverUrl, setServerUrl,
  sensitivity, setSensitivity, scrollSensitivity, setScrollSensitivity,
  showFunTab, setShowFunTab, isConnected, onLogout
}: SettingsDrawerProps) {
  const isDark = theme === 'dark';
  const [urlInput, setUrlInput] = useState(serverUrl);
  const [pinMode, setPinMode] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newPin2, setNewPin2] = useState('');
  const [pinMsg, setPinMsg] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  const cardCls = isDark
    ? 'bg-[#12121f] border border-[#00f3ff]/10 rounded-xl p-4'
    : 'bg-white border border-gray-100 rounded-xl p-4 shadow-sm';

  const labelCls = `text-xs font-medium uppercase tracking-wider ${isDark ? 'text-[#00f3ff]/60' : 'text-gray-400'}`;

  const inputCls = `w-full rounded-lg px-3 py-2 text-sm outline-none transition-all
    ${isDark
      ? 'bg-[#0a0a0f] border border-[#00f3ff]/20 text-white focus:border-[#00f3ff]/60'
      : 'bg-gray-50 border border-gray-200 text-gray-800 focus:border-indigo-400'
    }`;

  const handleSaveUrl = () => {
    setServerUrl(urlInput);
  };

  const handleChangePin = () => {
    if (oldPin !== getStoredPin()) {
      setPinMsg('Неверный текущий PIN'); setPinSuccess(false); return;
    }
    if (!/^\d{4}$/.test(newPin)) {
      setPinMsg('PIN должен быть 4 цифры'); setPinSuccess(false); return;
    }
    if (newPin !== newPin2) {
      setPinMsg('PIN-коды не совпадают'); setPinSuccess(false); return;
    }
    setStoredPin(newPin);
    setPinMsg('PIN успешно изменён!'); setPinSuccess(true);
    setOldPin(''); setNewPin(''); setNewPin2('');
    setTimeout(() => { setPinMode(false); setPinMsg(''); }, 1500);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      {/* Drawer */}
      <div className={`fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[90vw] flex flex-col
        transition-transform duration-300 ease-out
        ${open ? 'translate-x-0' : 'translate-x-full'}
        ${isDark ? 'bg-[#0d0d1a] border-l border-[#00f3ff]/20' : 'bg-gray-50 border-l border-gray-200'}`}>

        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-[#00f3ff]/10' : 'border-gray-200'}`}>
          <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>⚙️ Настройки</h2>
          <button onClick={onClose} className={`p-2 rounded-lg transition ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-200 text-gray-500'}`}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">

          {/* Theme */}
          <div className={cardCls}>
            <p className={labelCls}>Тема</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setTheme('dark')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'dark'
                  ? isDark ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/50' : 'bg-indigo-100 text-indigo-600 border border-indigo-300'
                  : isDark ? 'bg-white/5 text-white/50 border border-white/10' : 'bg-white text-gray-500 border border-gray-200'}`}>
                🌙 Тёмная
              </button>
              <button onClick={() => setTheme('light')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'light'
                  ? isDark ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/50' : 'bg-indigo-100 text-indigo-600 border border-indigo-300'
                  : isDark ? 'bg-white/5 text-white/50 border border-white/10' : 'bg-white text-gray-500 border border-gray-200'}`}>
                ☀️ Светлая
              </button>
            </div>
          </div>

          {/* Server URL */}
          <div className={cardCls}>
            <p className={labelCls}><Wifi size={12} className="inline mr-1" />Адрес сервера</p>
            <div className="flex gap-2 mt-3">
              <input value={urlInput} onChange={e => setUrlInput(e.target.value)}
                className={inputCls} placeholder="http://192.168.1.100:5000" />
              <button onClick={handleSaveUrl}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                  ${isDark ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/50 hover:bg-[#00f3ff]/30'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                OK
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
                style={isConnected ? { boxShadow: '0 0 8px rgba(74,222,128,0.8)' } : {}} />
              <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                {isConnected ? 'Подключено' : 'Нет соединения'}
              </span>
            </div>
          </div>

          {/* Mouse sensitivity */}
          <div className={cardCls}>
            <p className={labelCls}><Mouse size={12} className="inline mr-1" />Чувствительность мыши</p>
            <div className="mt-3 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className={isDark ? 'text-white/50' : 'text-gray-500'}>Трекпад</span>
                  <span className={isDark ? 'text-[#00f3ff]' : 'text-indigo-600'}>{sensitivity.toFixed(1)}x</span>
                </div>
                <input type="range" min="0.3" max="5" step="0.1" value={sensitivity}
                  onChange={e => setSensitivity(Number(e.target.value))}
                  className="w-full accent-current" style={{ accentColor: isDark ? '#00f3ff' : '#4f46e5' }} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className={isDark ? 'text-white/50' : 'text-gray-500'}>Скролл</span>
                  <span className={isDark ? 'text-[#00f3ff]' : 'text-indigo-600'}>{scrollSensitivity.toFixed(1)}x</span>
                </div>
                <input type="range" min="0.3" max="5" step="0.1" value={scrollSensitivity}
                  onChange={e => setScrollSensitivity(Number(e.target.value))}
                  className="w-full" style={{ accentColor: isDark ? '#00f3ff' : '#4f46e5' }} />
              </div>
            </div>
          </div>

          {/* Fun tab */}
          <div className={cardCls}>
            <div className="flex items-center justify-between">
              <div>
                <p className={labelCls}>Вкладка "Веселье"</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>🎭 Скрытые функции</p>
              </div>
              <button onClick={() => setShowFunTab(!showFunTab)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${showFunTab
                  ? isDark ? 'bg-[#00f3ff]/60' : 'bg-indigo-500'
                  : isDark ? 'bg-white/10' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow
                  ${showFunTab ? 'left-[26px]' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Change PIN */}
          <div className={cardCls}>
            <button onClick={() => setPinMode(!pinMode)}
              className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-[#00f3ff]' : 'text-indigo-600'}`}>
              <Lock size={14} />
              {pinMode ? 'Скрыть изменение PIN' : 'Изменить PIN-код'}
            </button>
            {pinMode && (
              <div className="mt-3 space-y-2">
                <input type="password" maxLength={4} placeholder="Текущий PIN" value={oldPin}
                  onChange={e => setOldPin(e.target.value)} className={inputCls} />
                <input type="password" maxLength={4} placeholder="Новый PIN (4 цифры)" value={newPin}
                  onChange={e => setNewPin(e.target.value)} className={inputCls} />
                <input type="password" maxLength={4} placeholder="Повторите новый PIN" value={newPin2}
                  onChange={e => setNewPin2(e.target.value)} className={inputCls} />
                {pinMsg && (
                  <p className={`text-xs ${pinSuccess ? 'text-green-400' : 'text-red-400'}`}>{pinMsg}</p>
                )}
                <button onClick={handleChangePin}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition
                    ${isDark ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/40 hover:bg-[#00f3ff]/30'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                  Сохранить PIN
                </button>
              </div>
            )}
          </div>

          {/* About */}
          <div className={cardCls}>
            <p className={labelCls}><Info size={12} className="inline mr-1" />О программе</p>
            <div className={`mt-2 space-y-1 text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
              <p>Версия: 1.0.0</p>
              <p>Command Center Web UI</p>
              <p>Socket.IO + React + Tailwind</p>
            </div>
          </div>

          {/* Logout */}
          <button onClick={onLogout}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition
              ${isDark ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                : 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100'}`}>
            <LogOut size={16} />
            Выйти из системы
          </button>
        </div>
      </div>
    </>
  );
}
