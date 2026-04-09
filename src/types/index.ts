export type Theme = 'dark' | 'light';

export type TabId = 'system' | 'mouse' | 'media' | 'input' | 'screenshot' | 'security' | 'fun';

export interface Tab {
  id: TabId;
  label: string;
  emoji: string;
}

export interface SystemInfo {
  cpu: {
    name: string;
    usage: number;
    cores: number;
    frequency: number;
    temperature: number;
  };
  ram: {
    used: number;
    total: number;
    percent: number;
  };
  disks: Array<{
    letter: string;
    type: string;
    used: number;
    total: number;
    percent: number;
  }>;
  gpu: {
    name: string;
    usage: number;
    temperature: number;
  };
  battery: {
    percent: number;
    charging: boolean;
    timeLeft: string;
  };
  network: {
    sent: number;
    received: number;
    uploadSpeed: number;
    downloadSpeed: number;
    ip: string;
  };
  display: {
    resolution: string;
    refreshRate: number;
  };
  os: {
    version: string;
    uptime: string;
    computerName: string;
    username: string;
  };
}

export interface AppState {
  theme: Theme;
  activeTab: TabId;
  isConnected: boolean;
  isAuthenticated: boolean;
  serverUrl: string;
  sensitivity: number;
  scrollSensitivity: number;
  showFunTab: boolean;
  systemInfo: SystemInfo | null;
  volume: number;
  isMuted: boolean;
  screenshotData: string | null;
  autoScreenshot: boolean;
}

export interface PinState {
  attempts: number;
  lockedUntil: number | null;
  pin: string;
}
