import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SystemInfo } from '../types';

interface UseSocketOptions {
  serverUrl: string;
  isAuthenticated: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSystemInfo: (data: SystemInfo) => void;
  onVolume: (v: number) => void;
  onMuted: (m: boolean) => void;
  onScreenshot: (data: string) => void;
}

export function useSocket({
  serverUrl,
  isAuthenticated,
  onConnect,
  onDisconnect,
  onSystemInfo,
  onVolume,
  onMuted,
  onScreenshot,
}: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = io(serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      timeout: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('system_info', onSystemInfo);
    socket.on('volume_update', ({ volume }: { volume: number }) => onVolume(volume));
    socket.on('mute_update', ({ muted }: { muted: boolean }) => onMuted(muted));
    socket.on('screenshot', ({ data }: { data: string }) => onScreenshot(data));

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [serverUrl, isAuthenticated]);

  const emit = useCallback((event: string, data?: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return { emit, socket: socketRef };
}
