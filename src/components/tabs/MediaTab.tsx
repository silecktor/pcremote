import { useState } from 'react';
import { Theme } from '../../types';
import { Volume2, VolumeX, SkipBack, SkipForward, Play, Pause } from 'lucide-react';

interface MediaTabProps {
  emit: (event: string, data?: unknown) => void;
  volume: number;
  setVolume: (v: number) => void;
  isMuted: boolean;
  setIsMuted: (m: boolean) => void;
  theme: Theme;
}

type SiteKey = 'youtube' | 'ytmusic' | 'spotify' | 'universal';

const SITE_MACROS: Record<SiteKey, { label: string; key: string; icon: string }[]> = {
  youtube: [
    { label: 'Play/Pause', key: 'k', icon: '⏯️' },
    { label: 'Mute', key: 'm', icon: '🔇' },
    { label: 'Fullscreen', key: 'f', icon: '⛶' },
    { label: '-10s', key: 'j', icon: '⏪' },
    { label: '+10s', key: 'l', icon: '⏩' },
    { label: 'Субтитры', key: 'c', icon: '💬' },
    { label: 'Замедлить', key: ',', icon: '🐢' },
    { label: 'Ускорить', key: '.', icon: '🐇' },
  ],
  ytmusic: [
    { label: 'Like', key: 'like', icon: '👍' },
    { label: 'Dislike', key: 'dislike', icon: '👎' },
    { label: 'Shuffle', key: 'shuffle', icon: '🔀' },
    { label: 'Repeat', key: 'repeat', icon: '🔁' },
    { label: 'Play/Pause', key: 'k', icon: '⏯️' },
    { label: 'Mute', key: 'm', icon: '🔇' },
  ],
  spotify: [
    { label: 'Play/Pause', key: 'space', icon: '⏯️' },
    { label: 'Next', key: 'ctrl+right', icon: '⏭️' },
    { label: 'Prev', key: 'ctrl+left', icon: '⏮️' },
    { label: 'Vol+', key: 'ctrl+up', icon: '🔊' },
    { label: 'Vol-', key: 'ctrl+down', icon: '🔉' },
    { label: 'Shuffle', key: 'ctrl+s', icon: '🔀' },
    { label: 'Repeat', key: 'ctrl+r', icon: '🔁' },
    { label: 'Like', key: 'alt+shift+b', icon: '❤️' },
  ],
  universal: [
    { label: 'Play/Pause', key: 'media_play_pause', icon: '⏯️' },
    { label: 'Next', key: 'media_next', icon: '⏭️' },
    { label: 'Prev', key: 'media_prev', icon: '⏮️' },
    { label: 'Vol+', key: 'vol_up', icon: '🔊' },
    { label: 'Vol-', key: 'vol_down', icon: '🔉' },
    { label: 'Mute', key: 'vol_mute', icon: '🔇' },
  ],
};

const SYSTEM_MACROS: { label: string; key: string; icon: string; description: string }[] = [
  { label: 'Task Manager', key: 'ctrl+shift+esc', icon: '📊', description: 'Диспетчер задач' },
  { label: 'Alt+F4', key: 'alt+f4', icon: '❌', description: 'Закрыть окно' },
  { label: 'Win+D', key: 'win+d', icon: '🖥️', description: 'Рабочий стол' },
  { label: 'Ctrl+Z', key: 'ctrl+z', icon: '↩️', description: 'Отменить' },
  { label: 'Ctrl+Y', key: 'ctrl+y', icon: '↪️', description: 'Повторить' },
  { label: 'Screenshot', key: 'win+shift+s', icon: '📷', description: 'Скриншот области' },
  { label: 'Win+L', key: 'win+l', icon: '🔒', description: 'Блокировка' },
  { label: 'Win+E', key: 'win+e', icon: '📁', description: 'Проводник' },
  { label: 'Win+R', key: 'win+r', icon: '⚙️', description: 'Выполнить' },
  { label: 'Ctrl+C', key: 'ctrl+c', icon: '📋', description: 'Копировать' },
  { label: 'Ctrl+V', key: 'ctrl+v', icon: '📌', description: 'Вставить' },
  { label: 'Ctrl+A', key: 'ctrl+a', icon: '⬜', description: 'Выделить всё' },
];

export function MediaTab({ emit, volume, setVolume, isMuted, setIsMuted, theme }: MediaTabProps) {
  const isDark = theme === 'dark';
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSite, setSelectedSite] = useState<SiteKey>('youtube');
  const [activeBtn, setActiveBtn] = useState<string | null>(null);

  const accent = isDark ? 'text-[#00f3ff]' : 'text-indigo-600';
  const accentBg = isDark
    ? 'bg-[#00f3ff]/20 border border-[#00f3ff]/40 text-[#00f3ff] hover:bg-[#00f3ff]/30'
    : 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100';
  const cardCls = isDark
    ? 'bg-[#12121f] border border-[#00f3ff]/10 rounded-2xl p-4'
    : 'bg-white border border-gray-100 rounded-2xl p-4 shadow-sm';

  const flashBtn = (key: string, cb: () => void) => {
    setActiveBtn(key);
    cb();
    setTimeout(() => setActiveBtn(null), 200);
  };

  const handleVolume = (v: number) => {
    setVolume(v);
    emit('set_volume', { volume: v });
  };

  const handleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    emit('set_mute', { muted: newMuted });
  };

  const handleMedia = (action: string) => {
    emit('media_control', { action });
  };

  const handleMacro = (key: string) => {
    emit('key_press', { keys: key });
  };

  const siteKeys = Object.keys(SITE_MACROS) as SiteKey[];
  const SITE_LABELS: Record<SiteKey, string> = {
    youtube: '▶ YouTube',
    ytmusic: '🎵 YT Music',
    spotify: '🟢 Spotify',
    universal: '🌐 Universal',
  };

  const macroBtn = (label: string, key: string, icon: string) => (
    <button
      key={key}
      onClick={() => flashBtn(key, () => handleMacro(key))}
      className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-medium transition-all duration-150 select-none active:scale-95
        ${activeBtn === key
          ? isDark ? 'bg-[#00f3ff]/40 border border-[#00f3ff] scale-95' : 'bg-indigo-200 border border-indigo-500 scale-95'
          : isDark ? 'bg-[#1a1a2e] border border-[#00f3ff]/20 text-white hover:bg-[#00f3ff]/10'
                   : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-indigo-50 shadow-sm'
        }`}
    >
      <span className="text-lg leading-none">{icon}</span>
      <span className="leading-none text-center">{label}</span>
    </button>
  );

  return (
    <div className="space-y-4">

      {/* Volume control */}
      <div className={cardCls}>
        <div className={`flex items-center gap-2 mb-3 ${accent}`}>
          <Volume2 size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">Громкость</span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={handleMute}
            className={`p-3 rounded-xl transition-all active:scale-95 ${isMuted
              ? isDark ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-red-50 text-red-500 border border-red-200'
              : isDark ? 'bg-[#1a1a2e] text-[#00f3ff]/70 border border-[#00f3ff]/20' : 'bg-gray-50 text-gray-500 border border-gray-200'
            }`}>
            <VolumeX size={20} />
          </button>
          <div className="flex-1">
            <input
              type="range" min="0" max="100" value={volume}
              onChange={e => handleVolume(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: isDark ? '#00f3ff' : '#4f46e5' }}
            />
          </div>
          <span className={`text-xl font-bold w-12 text-right ${accent}`}>{volume}%</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleVolume(Math.max(0, volume - 10))}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${accentBg}`}>
            🔉 -10%
          </button>
          <button onClick={() => handleMute()}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95
              ${isMuted
                ? isDark ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-red-50 text-red-500 border border-red-200'
                : accentBg
              }`}>
            {isMuted ? '🔇 Вкл' : '🔇 Выкл'}
          </button>
          <button onClick={() => handleVolume(Math.min(100, volume + 10))}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${accentBg}`}>
            🔊 +10%
          </button>
        </div>
      </div>

      {/* Media playback controls */}
      <div className={cardCls}>
        <div className={`flex items-center gap-2 mb-3 ${accent}`}>
          <span className="text-xs font-bold uppercase tracking-wider">🎵 Управление медиа</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => flashBtn('prev', () => handleMedia('previous'))}
            className={`flex-1 h-14 flex items-center justify-center rounded-xl transition-all active:scale-95
              ${activeBtn === 'prev'
                ? isDark ? 'bg-[#00f3ff]/30 border border-[#00f3ff]' : 'bg-indigo-200 border border-indigo-500'
                : isDark ? 'bg-[#1a1a2e] border border-[#00f3ff]/20' : 'bg-gray-50 border border-gray-200 shadow-sm'
              }`}>
            <SkipBack size={24} className={isDark ? 'text-white/70' : 'text-gray-600'} />
          </button>
          <button onClick={() => { setIsPlaying(!isPlaying); flashBtn('play', () => handleMedia('play_pause')); }}
            className={`w-20 h-20 flex items-center justify-center rounded-full transition-all active:scale-95
              ${isPlaying
                ? isDark ? 'bg-[#00f3ff] shadow-[0_0_30px_rgba(0,243,255,0.5)]' : 'bg-indigo-600 shadow-lg'
                : isDark ? 'bg-[#00f3ff]/20 border-2 border-[#00f3ff]/60' : 'bg-indigo-100 border-2 border-indigo-400'
              }`}>
            {isPlaying
              ? <Pause size={32} className={isDark ? 'text-[#0a0a0f]' : 'text-white'} />
              : <Play size={32} className={isDark ? 'text-[#00f3ff]' : 'text-indigo-600'} />
            }
          </button>
          <button onClick={() => flashBtn('next', () => handleMedia('next'))}
            className={`flex-1 h-14 flex items-center justify-center rounded-xl transition-all active:scale-95
              ${activeBtn === 'next'
                ? isDark ? 'bg-[#00f3ff]/30 border border-[#00f3ff]' : 'bg-indigo-200 border border-indigo-500'
                : isDark ? 'bg-[#1a1a2e] border border-[#00f3ff]/20' : 'bg-gray-50 border border-gray-200 shadow-sm'
              }`}>
            <SkipForward size={24} className={isDark ? 'text-white/70' : 'text-gray-600'} />
          </button>
        </div>
      </div>

      {/* Site macros */}
      <div className={cardCls}>
        <div className={`flex items-center gap-2 mb-3 ${accent}`}>
          <span className="text-xs font-bold uppercase tracking-wider">🎬 Макросы по сайтам</span>
        </div>
        {/* Site selector */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {siteKeys.map(site => (
            <button key={site} onClick={() => setSelectedSite(site)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${selectedSite === site
                  ? isDark ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/50' : 'bg-indigo-600 text-white border border-indigo-600'
                  : isDark ? 'bg-[#1a1a2e] text-white/50 border border-white/10' : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}>
              {SITE_LABELS[site]}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {SITE_MACROS[selectedSite].map(({ label, key, icon }) => macroBtn(label, key, icon))}
        </div>
      </div>

      {/* System macros */}
      <div className={cardCls}>
        <div className={`flex items-center gap-2 mb-3 ${accent}`}>
          <span className="text-xs font-bold uppercase tracking-wider">⚡ Системные макросы</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {SYSTEM_MACROS.map(({ label, key, icon }) => macroBtn(label, key, icon))}
        </div>
      </div>
    </div>
  );
}
