import { create } from 'zustand';

export interface EventLog {
  id: string;
  timestamp: string;
  cameraId: string;
  cameraName: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  confidence: number;
}

interface EventLogState {
  logs: EventLog[];
  unreadAlertCount: number;
  addLog: (log: Omit<EventLog, 'id' | 'timestamp'>) => void;
  setLogs: (logs: EventLog[]) => void;
  clearUnreadCount: () => void;
}

export const useEventLogStore = create<EventLogState>((set) => ({
  logs: [
    { id: '1', timestamp: '17:00:00', cameraId: 'SYSTEM', cameraName: '중앙 통제실', level: 'info', message: 'ewVLM 통합관제 콕핏 로컬 가동 시작', confidence: 1.0 }
  ],
  unreadAlertCount: 0,
  addLog: (log) => set((state) => {
    const newLog: EventLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false })
    };
    return {
      logs: [newLog, ...state.logs].slice(0, 1000),
      unreadAlertCount: log.level === 'critical' ? state.unreadAlertCount + 1 : state.unreadAlertCount
    };
  }),
  setLogs: (logs) => set({ logs }),
  clearUnreadCount: () => set({ unreadAlertCount: 0 })
}));
