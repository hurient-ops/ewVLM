import axios from 'axios';
import { useEventLogStore } from '../store/useEventLogStore';
import { useSopStore, SopAction } from '../store/useSopStore';

const API_BASE_URL = 'http://localhost:8000';
const WS_BASE_URL = 'ws://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const API = {
  fetchEvents: async (limit: number = 50) => {
    const response = await apiClient.get(`/api/v1/events?limit=${limit}`);
    return response.data;
  },
  login: async (username: string, password: string) => {
    const response = await apiClient.post('/api/v1/auth/login', { username, password });
    return response.data;
  },
  fetchAuditLogs: async (limit: number = 100) => {
    const response = await apiClient.get(`/api/v1/audit/logs?limit=${limit}`);
    return response.data;
  },
  createAuditLog: async (actionType: string, resourceQuery: string = "", username: string = "system") => {
    const response = await apiClient.post('/api/v1/audit/logs', {
      action_type: actionType,
      resource_query: resourceQuery,
      username: username
    });
    return response.data;
  },
  controlPtz: async (cameraId: string, action: string) => {
    const response = await apiClient.post(`/api/v1/cameras/${cameraId}/ptz`, { action });
    return response.data;
  },
  saveCalibration: async (cameraId: string, altitude: number, tilt: number, focalLength: number) => {
    const response = await apiClient.post(`/api/v1/cameras/${cameraId}/calibration`, { 
      altitude, 
      tilt, 
      focal_length: focalLength 
    });
    return response.data;
  },
  signup: async (username: string, password: string, role: string = 'user') => {
    const response = await apiClient.post('/api/v1/auth/signup', { username, password, role });
    return response.data;
  },
  searchVss: async (query: string, limit: number = 5) => {
    const response = await apiClient.post('/api/v1/vss/search', { query, limit });
    return response.data;
  },
  getEventReport: async (eventId: string) => {
    const response = await apiClient.get(`/api/v1/events/${eventId}/report`);
    return response.data;
  }
};

let ws: WebSocket | null = null;

export const initWebSocket = () => {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return;
  }

  ws = new WebSocket(`${WS_BASE_URL}/ws/events`);

  ws.onopen = () => {
    console.log('[WS] Connected to backend events stream');
    useEventLogStore.getState().addLog({
      cameraId: 'SYSTEM',
      cameraName: '중앙 통제실',
      level: 'info',
      message: 'WebSocket 실시간 이벤트 스트림 연결 완료',
      confidence: 1.0
    });
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('[WS] Event Received:', data);

      if (data.type === 'vlm_event') {
        const payload = data.payload;
        useEventLogStore.getState().addLog({
          cameraId: payload.camera_id,
          cameraName: `Camera ${payload.camera_id}`,
          level: 'critical',
          message: payload.semantic_caption,
          confidence: payload.inference_confidence_score
        });

        // Trigger SOP if recommended
        if (payload.recommended_sop_id) {
          const initialActions: SopAction[] = [
            { clause: '초기 대응', description: '관할 부서 및 유관 기관 핫라인 연결', isCompleted: false },
            { clause: '현장 제어', description: '현장 IP 스피커 라이브 경고 방송 송출', isCompleted: false },
            { clause: '문서화', description: '자동 생성된 VLM 리포트 최종 결재', isCompleted: false },
          ];
          useSopStore.getState().triggerSop(
            payload.vlm_event_id, 
            `재난 규정: ${payload.recommended_sop_id}`, 
            initialActions
          );
        }
      } else if (data.type === 'sop_action') {
        const payload = data.payload;
        useEventLogStore.getState().addLog({
          cameraId: 'SYSTEM',
          cameraName: 'SOP 자동화',
          level: 'warning',
          message: `자동 대응 조치 실행: ${payload.sop_id} (실행자: ${payload.operator_id})`,
          confidence: 1.0
        });
      }
    } catch (err) {
      console.error('[WS] Failed to parse message', err);
    }
  };

  ws.onclose = () => {
    console.warn('[WS] Disconnected. Reconnecting in 3s...');
    setTimeout(initWebSocket, 3000);
  };

  ws.onerror = (err) => {
    console.error('[WS] Error', err);
  };
};

export const closeWebSocket = () => {
  if (ws) {
    ws.close();
    ws = null;
  }
};
