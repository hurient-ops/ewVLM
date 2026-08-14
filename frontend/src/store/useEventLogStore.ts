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
  initWebSocket: () => void;
}

let wsInstance: WebSocket | null = null;

export const useEventLogStore = create<EventLogState>((set, get) => ({
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
  clearUnreadCount: () => set({ unreadAlertCount: 0 }),
  initWebSocket: () => {
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) return;
    
    wsInstance = new WebSocket('ws://localhost:8000/ws/events');
    
    wsInstance.onopen = () => {
      console.log('VLM WebSocket Connected');
      get().addLog({
        cameraId: 'SYSTEM',
        cameraName: 'AI 서버',
        level: 'info',
        message: 'VLM 실시간 분석 소켓 연결 성공',
        confidence: 1.0
      });
    };
    
    wsInstance.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'vlm_event') {
          const payload = data.payload;
          get().addLog({
            cameraId: payload.camera_id,
            cameraName: '자동 연동 카메라',
            level: 'critical',
            message: payload.semantic_caption,
            confidence: payload.inference_confidence_score
          });
        }
      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    };
    
    wsInstance.onclose = () => {
      console.log('VLM WebSocket Disconnected, reconnecting in 5s...');
      wsInstance = null;
      setTimeout(() => get().initWebSocket(), 5000);
    };
  }
}));
