import axios from 'axios';
import { useEventLogStore } from '../store/useEventLogStore';
import { useSopStore, SopAction } from '../store/useSopStore';
import { useAuthStore } from '../store/useAuthStore';

const API_BASE_URL = 'http://localhost:8000';
const WS_BASE_URL = 'ws://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const API = {
  exportPrivacyVideo: async (config: any) => {
    const response = await apiClient.post('/api/v1/video/export/masking', config);
    return response.data;
  },
  getExportJob: async (jobId: number) => {
    const response = await apiClient.get(`/api/v1/video/export/jobs/${jobId}`);
    return response.data;
  },
  getBiStats: async () => {
    const response = await apiClient.get('/api/v1/bi/stats');
    return response.data;
  },
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
  transformCoordinate: async (cameraId: string, x: number, y: number, altitude: number, tilt: number, focalLength: number) => {
    const response = await apiClient.post(`/api/v1/cameras/${cameraId}/transform`, {
      x,
      y,
      altitude,
      tilt,
      focal_length: focalLength
    });
    return response.data;
  },
  getTopology: async () => {
    const response = await apiClient.get('/api/v1/infra/topology');
    return response.data;
  },
  healNode: async (nodeId: string, action: string) => {
    const response = await apiClient.post('/api/v1/infra/heal', { node_id: nodeId, action });
    return response.data;
  },
  startLoraTraining: async (target: string) => {
    const response = await apiClient.post('/api/v1/mlops/train/lora', { action: 'START', target });
    return response.data;
  },
  deployPrompt: async (target: string, payload?: any) => {
    const response = await apiClient.post('/api/v1/mlops/deploy/prompt', { action: 'DEPLOY', target, payload });
    return response.data;
  },
  syncDeviceConfig: async (target: string = 'all') => {
    const response = await apiClient.post('/api/v1/devices/config/sync', { action: 'SYNC', target });
    return response.data;
  },
  dispatchAlert: async (alertId: string, action: string, target: string, message: string, level: string) => {
    const response = await apiClient.post(`/api/v1/alerts/${alertId}/dispatch`, { action, target, message, level });
    return response.data;
  },
  exportForensicVideo: async (cameras: string[], startTime: string, endTime: string, includeMetadata: boolean) => {
    const response = await apiClient.post('/api/v1/records/export', { cameras, startTime, endTime, includeMetadata });
    return response.data;
  },
  getVlmModels: async () => {
    const response = await apiClient.get('/api/v1/vlm/models');
    return response.data;
  },
  setVlmModel: async (modelNames: string[]) => {
    const response = await apiClient.put('/api/v1/vlm/model', { model_names: modelNames });
    return response.data;
  },
  getAuditLogs: async (limit: number = 50) => {
    const response = await apiClient.get(`/api/v1/audit/logs?limit=${limit}`);
    return response.data;
  },
  sendVlmChat: async (message: string, cameraId?: string) => {
    const response = await apiClient.post('/api/v1/vlm/chat', { message, camera_id: cameraId });
    return response.data;
  },
  signup: async (username: string, password: string, role: string = 'user', name: string = '', phone: string = '') => {
    const response = await apiClient.post('/api/v1/auth/signup', { username, password, role, name, phone });
    return response.data;
  },
  searchVss: async (query: string, limit: number = 5) => {
    const response = await apiClient.post('/api/v1/vss/search', { query, limit });
    return response.data;
  },
  getEventReport: async (eventId: string) => {
    const response = await apiClient.get(`/api/v1/events/${eventId}/report`);
    return response.data;
  },
  getUsers: async () => {
    const response = await apiClient.get('/api/v1/users');
    return response.data.users || response.data;
  },
  updateUserRole: async (userId: number, role: string) => {
    const response = await apiClient.put(`/api/v1/users/${userId}/role`, { role });
    return response.data;
  },
  submitEventFeedback: async (escalationId: string, isTruePositive: boolean, notes: string = "") => {
    const response = await apiClient.post(`/api/v1/events/${escalationId}/feedback`, {
      is_true_positive: isTruePositive,
      notes: notes
    });
    return response.data;
  },
  generateSopRule: async (prompt: string) => {
    const response = await apiClient.post('/api/v1/sop/rules/generate', {
      natural_language_prompt: prompt
    });
    return response.data;
  },
  simulateEvent: async (ruleName: string, targetObject: string) => {
    const response = await apiClient.post('/api/v1/events/simulate', {
      rule_name: ruleName,
      target_object: targetObject
    });
    return response.data;
  },
  broadcastAudio: async (zone: string, message: string) => {
    const response = await apiClient.post('/api/v1/audio/broadcast', {
      zone,
      message
    });
    return response.data;
  },
  getNvrStatus: async () => {
    const response = await apiClient.get('/api/v1/nvr/status');
    return response.data;
  },
  getCameras: async () => {
    const response = await apiClient.get('/api/v1/cameras');
    return response.data;
  },
  getPtzSchedules: async () => {
    const response = await apiClient.get('/api/v1/ptz-schedules');
    return response.data;
  },
  createPtzSchedule: async (payload: any) => {
    const response = await apiClient.post('/api/v1/ptz-schedules', payload);
    return response.data;
  },
  // In-House Air-Gapped MLOps (LLaMA-Factory 4-bit QLoRA)
  buildLocalDataset: async () => {
    const response = await apiClient.post('/api/v1/lora/local-dataset/build');
    return response.data;
  },
  startInHouseTraining: async (params: any = {}) => {
    const response = await apiClient.post('/api/v1/lora/local-train/start', params);
    return response.data;
  },
  stopInHouseTraining: async () => {
    const response = await apiClient.post('/api/v1/lora/local-train/stop');
    return response.data;
  },
  getInHouseTrainingStatus: async () => {
    const response = await apiClient.get('/api/v1/lora/local-train/status');
    return response.data;
  },
  listLoraAdapters: async () => {
    const response = await apiClient.get('/api/v1/lora/adapters');
    return response.data;
  },
  activateLoraAdapter: async (adapterName: string) => {
    const response = await apiClient.post('/api/v1/lora/adapters/activate', { adapter_name: adapterName });
    return response.data;
  },
};

let ws: WebSocket | null = null;

export const syncDbEvents = async () => {
  try {
    const data = await API.fetchEvents(50);
    const isSuccess = data && (data.status === 'SUCCESS' || data.status === 'success');
    if (isSuccess && Array.isArray(data.events) && data.events.length > 0) {
      const history = data.events.map((ev: any) => {
        const caption = ev.semantic_caption || '';
        const isSafe = caption.toLowerCase().includes('safe') || 
                       caption.includes('조치 불필요') || 
                       caption.includes('정상') || 
                       caption.includes('특이사항 없음');
        const isCritical = !isSafe && (
          ev.trigger_class?.includes('collapsed') || 
          ev.trigger_class?.includes('fall') || 
          ev.trigger_class?.includes('intrusion') ||
          caption.includes('CRITICAL') ||
          caption.includes('침입')
        );
        const level: 'info' | 'warning' | 'critical' = isSafe ? 'info' : (isCritical ? 'critical' : 'warning');

        return {
          id: `db-${ev.id}`,
          timestamp: ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString('ko-KR', { hour12: false }) : new Date().toLocaleTimeString('ko-KR'),
          cameraId: ev.camera_id,
          cameraName: `Camera ${ev.camera_id}`,
          level: level,
          message: caption || `${ev.trigger_class} 이상 감지`,
          confidence: ev.confidence || 0.9,
          escalationId: ev.escalation_id
        };
      });
      useEventLogStore.getState().setLogs(history);
    }
  } catch (err) {
    console.warn('[WS] Failed to sync historical DB events:', err);
  }
};

export const initWebSocket = () => {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return;
  }

  ws = new WebSocket(`${WS_BASE_URL}/ws/events`);

  ws.onopen = () => {
    console.log('[WS] Connected to backend events stream');
    // Fetch and populate existing DB events immediately
    syncDbEvents();
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('[WS] Event Received:', data);

      if (data.type === 'vlm_event') {
        const payload = data.payload;
        const caption = payload.semantic_caption || '';
        const isSafe = (payload.detected_dangerous_actions && payload.detected_dangerous_actions.includes('safe')) ||
                       caption.toLowerCase().includes('safe') ||
                       caption.includes('조치 불필요');
        
        useEventLogStore.getState().addLog({
          cameraId: payload.camera_id,
          cameraName: `Camera ${payload.camera_id}`,
          level: isSafe ? 'info' : 'critical',
          message: caption,
          confidence: payload.inference_confidence_score,
          escalationId: payload.reference_escalation_id || payload.event_id
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
