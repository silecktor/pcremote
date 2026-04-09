import { useEffect } from 'react';
import { SystemInfo, Theme } from '../../types';
import { Cpu, MemoryStick, HardDrive, Zap, Battery, Wifi, Monitor, Server } from 'lucide-react';

interface SystemTabProps {
  systemInfo: SystemInfo | null;
  isConnected: boolean;
  theme: Theme;
  emit: (event: string, data?: unknown) => void;
}

function ProgressBar({ value, theme, danger }: { value: number; theme: Theme; danger?: boolean }) {
  const isDark = theme === 'dark';
  const color = danger && value > 80
    ? 'bg-red-500'
    : danger && value > 60
    ? 'bg-yellow-500'
    : isDark ? 'bg-[#00f3ff]' : 'bg-indigo-500';
  const glow = danger && value > 80
    ? 'shadow-[0_0_8px_rgba(239,68,68,0.7)]'
    : isDark ? 'shadow-[0_0_8px_rgba(0,243,255,0.5)]' : '';

  return (
    <div className={`w-full h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${color} ${glow}`}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

interface CardProps {
  title: string;
  icon: React.ReactNode;
  theme: Theme;
  children: React.ReactNode;
}

function Card({ title, icon, theme, children }: CardProps) {
  const isDark = theme === 'dark';
  return (
    <div className={`rounded-2xl p-4 transition-colors ${isDark
      ? 'bg-[#12121f] border border-[#00f3ff]/10'
      : 'bg-white border border-gray-100 shadow-sm'}`}>
      <div className={`flex items-center gap-2 mb-3 ${isDark ? 'text-[#00f3ff]' : 'text-indigo-600'}`}>
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
      </div>
      {children}
    </div>
  );
}

function StatRow({ label, value, theme }: { label: string; value: string; theme: Theme }) {
  const isDark = theme === 'dark';
  return (
    <div className="flex justify-between items-center">
      <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{label}</span>
      <span className={`text-xs font-semibold ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{value}</span>
    </div>
  );
}

// Mock data for demo when not connected
const MOCK_DATA: SystemInfo = {
  cpu: { name: 'Intel Core i7-12700K', usage: 34, cores: 12, frequency: 3.6, temperature: 58 },
  ram: { used: 12.4, total: 32, percent: 39 },
  disks: [
    { letter: 'C:', type: 'SSD', used: 189, total: 512, percent: 37 },
    { letter: 'D:', type: 'HDD', used: 1240, total: 2000, percent: 62 },
  ],
  gpu: { name: 'NVIDIA RTX 3080', usage: 18, temperature: 62 },
  battery: { percent: 87, charging: true, timeLeft: '3ч 20м' },
  network: { sent: 245, received: 1024, uploadSpeed: 1.2, downloadSpeed: 5.8, ip: '192.168.1.105' },
  display: { resolution: '2560×1440', refreshRate: 144 },
  os: { version: 'Windows 11 Pro 23H2', uptime: '2д 14ч 32м', computerName: 'DESKTOP-CC', username: 'User' },
};

function batteryIcon(percent: number, charging: boolean) {
  if (charging) return '⚡';
  if (percent > 80) return '🔋';
  if (percent > 40) return '🔋';
  if (percent > 20) return '🪫';
  return '🪫';
}

export function SystemTab({ systemInfo, isConnected, theme, emit }: SystemTabProps) {
  const isDark = theme === 'dark';
  const data = systemInfo || MOCK_DATA;

  useEffect(() => {
    emit('get_system_info');
    const interval = setInterval(() => {
      emit('get_system_info');
    }, 2000);
    return () => clearInterval(interval);
  }, [emit]);

  return (
    <div className="space-y-3">
      {/* Status indicator */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs
        ${isDark ? 'bg-[#12121f] border border-[#00f3ff]/10' : 'bg-white border border-gray-100 shadow-sm'}`}>
        <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-400' : 'bg-amber-400'}`}
          style={isConnected ? { boxShadow: '0 0 8px rgba(74,222,128,0.8)' } : { boxShadow: '0 0 8px rgba(251,191,36,0.8)' }} />
        <span className={isDark ? 'text-white/50' : 'text-gray-400'}>
          {isConnected ? '● Данные в реальном времени · обновление каждые 2с' : '● Демо-режим (нет соединения)'}
        </span>
      </div>

      {/* CPU */}
      <Card title="Процессор" icon={<Cpu size={14} />} theme={theme}>
        <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{data.cpu.name}</p>
        <div className="flex justify-between items-center mb-1">
          <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Загрузка</span>
          <span className={`text-lg font-bold ${data.cpu.usage > 80 ? 'text-red-400' : isDark ? 'text-[#00f3ff]' : 'text-indigo-600'}`}>
            {data.cpu.usage}%
          </span>
        </div>
        <ProgressBar value={data.cpu.usage} theme={theme} danger />
        <div className="grid grid-cols-3 gap-2 mt-3">
          <StatRow label="Ядра" value={String(data.cpu.cores)} theme={theme} />
          <StatRow label="Частота" value={`${data.cpu.frequency}GHz`} theme={theme} />
          <StatRow label="Темп." value={`${data.cpu.temperature}°C`} theme={theme} />
        </div>
      </Card>

      {/* RAM */}
      <Card title="Оперативная память" icon={<MemoryStick size={14} />} theme={theme}>
        <div className="flex justify-between items-center mb-1">
          <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{data.ram.used}GB / {data.ram.total}GB</span>
          <span className={`text-lg font-bold ${data.ram.percent > 85 ? 'text-red-400' : isDark ? 'text-[#00f3ff]' : 'text-indigo-600'}`}>
            {data.ram.percent}%
          </span>
        </div>
        <ProgressBar value={data.ram.percent} theme={theme} danger />
      </Card>

      {/* Disks */}
      <Card title="Диски" icon={<HardDrive size={14} />} theme={theme}>
        <div className="space-y-3">
          {data.disks.map(disk => (
            <div key={disk.letter}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-700'}`}>{disk.letter}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${isDark
                    ? disk.type === 'SSD' ? 'bg-[#00f3ff]/20 text-[#00f3ff]' : 'bg-white/10 text-white/50'
                    : disk.type === 'SSD' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                  }`}>{disk.type}</span>
                  <span className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{disk.used}GB / {disk.total}GB</span>
                </div>
                <span className={`text-sm font-bold ${disk.percent > 85 ? 'text-red-400' : isDark ? 'text-white/70' : 'text-gray-600'}`}>
                  {disk.percent}%
                </span>
              </div>
              <ProgressBar value={disk.percent} theme={theme} danger />
            </div>
          ))}
        </div>
      </Card>

      {/* GPU */}
      <Card title="Видеокарта" icon={<Zap size={14} />} theme={theme}>
        <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{data.gpu.name}</p>
        <div className="flex justify-between items-center mb-1">
          <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Загрузка GPU</span>
          <span className={`text-lg font-bold ${isDark ? 'text-[#00f3ff]' : 'text-indigo-600'}`}>{data.gpu.usage}%</span>
        </div>
        <ProgressBar value={data.gpu.usage} theme={theme} danger />
        <div className="mt-2">
          <StatRow label="Температура" value={`${data.gpu.temperature}°C`} theme={theme} />
        </div>
      </Card>

      {/* Battery */}
      <Card title="Батарея" icon={<Battery size={14} />} theme={theme}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{batteryIcon(data.battery.percent, data.battery.charging)}</span>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                {data.battery.charging ? '⚡ Заряжается' : '🔋 На батарее'} · {data.battery.timeLeft}
              </span>
              <span className={`text-lg font-bold ${data.battery.percent < 20 ? 'text-red-400' : isDark ? 'text-[#00f3ff]' : 'text-indigo-600'}`}>
                {data.battery.percent}%
              </span>
            </div>
            <ProgressBar value={data.battery.percent} theme={theme} />
          </div>
        </div>
      </Card>

      {/* Network */}
      <Card title="Сеть" icon={<Wifi size={14} />} theme={theme}>
        <div className="grid grid-cols-2 gap-2">
          <StatRow label="IP" value={data.network.ip} theme={theme} />
          <StatRow label="Отправлено" value={`${data.network.sent}MB`} theme={theme} />
          <StatRow label="Получено" value={`${data.network.received}MB`} theme={theme} />
          <StatRow label="↑ Upload" value={`${data.network.uploadSpeed}MB/s`} theme={theme} />
          <StatRow label="↓ Download" value={`${data.network.downloadSpeed}MB/s`} theme={theme} />
        </div>
      </Card>

      {/* Display + OS */}
      <div className="grid grid-cols-2 gap-3">
        <Card title="Экран" icon={<Monitor size={14} />} theme={theme}>
          <StatRow label="Разрешение" value={data.display.resolution} theme={theme} />
          <div className="mt-1">
            <StatRow label="Частота" value={`${data.display.refreshRate}Hz`} theme={theme} />
          </div>
        </Card>
        <Card title="Система" icon={<Server size={14} />} theme={theme}>
          <div className="space-y-1">
            <StatRow label="ОС" value={data.os.version.split(' ').slice(0,2).join(' ')} theme={theme} />
            <StatRow label="Аптайм" value={data.os.uptime} theme={theme} />
            <StatRow label="ПК" value={data.os.computerName} theme={theme} />
            <StatRow label="User" value={data.os.username} theme={theme} />
          </div>
        </Card>
      </div>
    </div>
  );
}
