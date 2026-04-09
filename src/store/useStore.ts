import { useState, useCallback } from 'react';
import { Theme, TabId, SystemInfo } from '../types';

const DEFAULT_PIN = '1234';
const SESSION_KEY = 'cc_session';
const PIN_KEY = 'cc_pin';
const THEME_KEY = 'cc_theme';
const FUN_KEY = 'cc_fun';
const SERVER_URL_KEY = 'cc_server';
const SENSITIVITY_KEY = 'cc_sens';
const SCROLL_KEY = 'cc_scroll';

export function getStoredPin(): string {
  return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
}

export function setStoredPin(pin: string) {
  localStorage.setItem(PIN_KEY, pin);
}

export function checkSession(): boolean {
  const s = sessionStorage.getItem(SESSION_KEY);
  if (!s) return false;
  const { expires } = JSON.parse(s);
  return Date.now() < expires;
}

export function createSession() {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ expires: Date.now() + 24 * 60 * 60 * 1000 }));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function useAppState() {
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem(THEME_KEY) as Theme) || 'dark');
  const [activeTab, setActiveTab] = useState<TabId>('system');
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => checkSession());
  const [serverUrl, setServerUrlState] = useState(() => localStorage.getItem(SERVER_URL_KEY) || 'http://localhost:5000');
  const [sensitivity, setSensitivityState] = useState(() => Number(localStorage.getItem(SENSITIVITY_KEY)) || 1.5);
  const [scrollSensitivity, setScrollSensitivityState] = useState(() => Number(localStorage.getItem(SCROLL_KEY)) || 1.0);
  const [showFunTab, setShowFunTabState] = useState(() => localStorage.getItem(FUN_KEY) === 'true');
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [autoScreenshot, setAutoScreenshot] = useState(false);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
  }, []);

  const setServerUrl = useCallback((url: string) => {
    setServerUrlState(url);
    localStorage.setItem(SERVER_URL_KEY, url);
  }, []);

  const setSensitivity = useCallback((v: number) => {
    setSensitivityState(v);
    localStorage.setItem(SENSITIVITY_KEY, String(v));
  }, []);

  const setScrollSensitivity = useCallback((v: number) => {
    setScrollSensitivityState(v);
    localStorage.setItem(SCROLL_KEY, String(v));
  }, []);

  const setShowFunTab = useCallback((v: boolean) => {
    setShowFunTabState(v);
    localStorage.setItem(FUN_KEY, String(v));
  }, []);

  const authenticate = useCallback(() => {
    setIsAuthenticated(true);
    createSession();
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    clearSession();
  }, []);

  return {
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
  };
}
