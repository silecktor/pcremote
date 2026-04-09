import { useState, useCallback, useEffect } from 'react';
import { Settings, Sun, Moon, Wifi, WifiOff } from 'lucide-react';
import { useAppState } from './store/useStore';
import { useSocket } from './hooks/useSocket';
import { PinScreen } from './components/PinScreen';
import { BottomNav } from './components/BottomNav';
import { SettingsDrawer } from './components/SettingsDrawer';
import { SystemTab } from './components/tabs/SystemTab';
import { MouseTab } from './components/tabs/MouseTab';
import { MediaTab } from './components/tabs/MediaTab';
import { InputTab } from './components/tabs/InputTab';
import { ScreenshotTab } from './components/tabs/ScreenshotTab';
import { SecurityTab } from './components/tabs/SecurityTab';
import { FunTab } from './components/tabs/FunTab';
import { TabId } from './types';

export default function App() {
  const state = useAppState();
  const {
    theme, setTheme,
    activeTab, setActiveTab,
    isConnected, setIsConnected,
    isAuthenticated, authenticate, logout,
    serverUrl, setServerUrl,
    sensitivity, setSensitivity,
    scrollSensitivity, setScrollSensitivity,
    showFunTab, setShowFunTab,
    systemInfo, setSystemInfo,
    volume, setVolume,
    isMuted, setIsMuted,
    screenshotData, setScreenshotData,
    autoScreenshot, setAutoScreenshot,
  } = state;

  const [settingsOpen, setSettingsOpen] = useState(false);

  const isDark = theme === 'dark';

  const handleConnect = useCallback(() => setIsConnected(true), [setIsConnected]);
  const handleDisconnect = useCallback(() => setIsConnected(false), [setIsConnected]);
  const handleSystemInfo = useCallback((data: any) => setSystemInfo(data), [setSystemInfo]);
  const handleVolume = useCallback((v: number) => setVolume(v), [setVolume]);
  const handleMuted = useCallback((m: boolean) => setIsMuted(m), [setIsMuted]);
  const handleScreenshot = useCallback((data: string) => setScreenshotData(data), [setScreenshotData]);

  const { emit } = useSocket({
    serverUrl,
    isAuthenticated,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onSystemInfo: handleSystemInfo,
    onVolume: handleVolume,
    onMuted: handleMuted,
    onScreenshot: handleScreenshot,
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.style.background = isDark ? '#0a0a0f' : '#f8fafc';
  }, [theme, isDark]);

  if (!isAuthenticated) {
    return <PinScreen theme={theme} onSuccess={authenticate} />;
  }

  const handleLogout = () => {
    logout();
    setSettingsOpen(false);
  };

  const handleRetryConnection = () => {
    // Trigger re-connection by updating server URL
    setServerUrl(serverUrl);
  };

  const tabContent: Record<TabId, React.ReactNode> = {
    system: (
      <SystemTab
        systemInfo={systemInfo}
        isConnected={isConnected}
        theme={theme}
        emit={emit}
      />
    ),
    mouse: (
      <MouseTab
        emit={emit}
        sensitivity={sensitivity}
        scrollSensitivity={scrollSensitivity}
        theme={theme}
        isConnected={isConnected}
      />
    ),
    media: (
      <MediaTab
        emit={emit}
        volume={volume}
        setVolume={setVolume}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        theme={theme}
      />
    ),
    input: (
      <InputTab
        emit={emit}
        theme={theme}
      />
    ),
    screenshot: (
      <ScreenshotTab
        emit={emit}
        screenshotData={screenshotData}
        autoScreenshot={autoScreenshot}
        setAutoScreenshot={setAutoScreenshot}
        theme={theme}
        isConnected={isConnected}
      />
    ),
    security: (
      <SecurityTab
        emit={emit}
        theme={theme}
        isConnected={isConnected}
      />
    ),
    fun: (
      <FunTab
        emit={emit}
        theme={theme}
        isConnected={isConnected}
      />
    ),
  };

  const TAB_TITLES: Record<TabId, string> = {
    system: '💻 Система',
    mouse: '🖱️ Мышь',
    media: '🎵 Медиа',
    input: '⌨️ Ввод',
    screenshot: '📸 Экран',
    security: '🔒 Безопасность',
    fun: '🎭 Веселье',
  };

  return (
    <div className={`fixed inset-0 flex flex-col transition-colors duration-300 ${isDark ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
      {/* Background glow effect (dark only) */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #00f3ff, transparent)' }} />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #00f3ff, transparent)' }} />
        </div>
      )}

      {/* Header */}
      <header className={`flex items-center justify-between px-4 py-3 border-b z-30 flex-shrink-0 transition-colors duration-300
        ${isDark
          ? 'bg-[#0d0d1a]/90 border-[#00f3ff]/10 backdrop-blur-xl'
          : 'bg-white/90 border-gray-200 backdrop-blur-xl shadow-sm'
        }`}>
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className={`p-2 rounded-xl transition-all duration-300 ${isDark
            ? 'bg-[#00f3ff]/10 text-[#00f3ff] hover:bg-[#00f3ff]/20 border border-[#00f3ff]/20'
            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100'
          }`}>
          {isDark
            ? <Sun size={18} className="transition-all duration-300" />
            : <Moon size={18} className="transition-all duration-300" />
          }
        </button>

        {/* Title */}
        <div className="flex flex-col items-center">
          <h1 className={`text-sm font-bold tracking-widest uppercase neon-flicker
            ${isDark ? 'text-[#00f3ff]' : 'text-indigo-700'}`}
            style={isDark ? { textShadow: '0 0 10px rgba(0,243,255,0.6)' } : {}}>
            COMMAND CENTER
          </h1>
          <span className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
            {TAB_TITLES[activeTab]}
          </span>
        </div>

        {/* Right side: connection + settings */}
        <div className="flex items-center gap-2">
          {/* Connection status */}
          <div className={`p-2 rounded-xl transition-colors ${isDark
            ? isConnected ? 'text-green-400' : 'text-amber-400'
            : isConnected ? 'text-green-600' : 'text-amber-500'
          }`}>
            {isConnected
              ? <Wifi size={16} style={isDark ? { filter: 'drop-shadow(0 0 4px rgba(74,222,128,0.8))' } : {}} />
              : <WifiOff size={16} />
            }
          </div>

          {/* Settings */}
          <button
            onClick={() => setSettingsOpen(true)}
            className={`p-2 rounded-xl transition-all ${isDark
              ? 'bg-[#1a1a2e] text-white/60 hover:text-white border border-[#00f3ff]/10 hover:border-[#00f3ff]/30'
              : 'bg-gray-100 text-gray-500 hover:text-gray-700 border border-gray-200'
            }`}>
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-[72px]"
        style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="p-4 min-h-full">
          {tabContent[activeTab]}
        </div>
      </main>

      {/* Bottom navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'fun' && !showFunTab) return;
          setActiveTab(tab);
        }}
        showFunTab={showFunTab}
        theme={theme}
      />

      {/* Settings drawer */}
      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        serverUrl={serverUrl}
        setServerUrl={(url) => { setServerUrl(url); handleRetryConnection(); }}
        sensitivity={sensitivity}
        setSensitivity={setSensitivity}
        scrollSensitivity={scrollSensitivity}
        setScrollSensitivity={setScrollSensitivity}
        showFunTab={showFunTab}
        setShowFunTab={setShowFunTab}
        isConnected={isConnected}
        onLogout={handleLogout}
      />
    </div>
  );
}
