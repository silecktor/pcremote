import { TabId, Theme } from '../types';

interface Tab {
  id: TabId;
  emoji: string;
  label: string;
}

const TABS: Tab[] = [
  { id: 'system', emoji: '💻', label: 'Система' },
  { id: 'mouse', emoji: '🖱️', label: 'Мышь' },
  { id: 'media', emoji: '🎵', label: 'Медиа' },
  { id: 'input', emoji: '⌨️', label: 'Ввод' },
  { id: 'screenshot', emoji: '📸', label: 'Экран' },
  { id: 'security', emoji: '🔒', label: 'Безопасность' },
  { id: 'fun', emoji: '🎭', label: 'Веселье' },
];

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  showFunTab: boolean;
  theme: Theme;
}

export function BottomNav({ activeTab, onTabChange, showFunTab, theme }: BottomNavProps) {
  const isDark = theme === 'dark';
  const visibleTabs = TABS.filter(t => t.id !== 'fun' || showFunTab);

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-40 border-t transition-colors duration-300
      ${isDark
        ? 'bg-[#0d0d1a]/95 border-[#00f3ff]/20 backdrop-blur-xl'
        : 'bg-white/95 border-gray-200 backdrop-blur-xl shadow-lg'
      }`}>
      <div className="flex items-stretch overflow-x-auto no-scrollbar">
        {visibleTabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-w-[52px] py-2 px-1 
                transition-all duration-200 relative select-none`}
            >
              {/* Active indicator top line */}
              {isActive && (
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full transition-all
                  ${isDark ? 'bg-[#00f3ff] shadow-[0_0_8px_rgba(0,243,255,0.8)]' : 'bg-indigo-600'}`} />
              )}
              <span className={`text-lg leading-none transition-all duration-200 ${isActive ? 'scale-110' : 'scale-100 opacity-60'}`}>
                {tab.emoji}
              </span>
              <span className={`text-[9px] font-medium leading-none transition-all duration-200
                ${isActive
                  ? isDark ? 'text-[#00f3ff]' : 'text-indigo-600'
                  : isDark ? 'text-white/40' : 'text-gray-400'
                }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
