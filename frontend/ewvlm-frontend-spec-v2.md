# ewVLM-Core 지능형 영상 관제 플랫폼 - 프론트엔드 전용 개발 및 API 연동 설계 명세서 (v2)

본 명세서는 **Stitch UI 빌더**에서 생성된 고밀도 다크모드 관제 화면 자산(`ewvlm-ui-spec-v2.md`)과 **Antigravity AI 개발 에이전트**로 구동될 고성능 백엔드 아키텍처(`ewvlm-dev-spec-v5.md`)를 유기적으로 완벽하게 브릿지 결합하기 위한 **프론트엔드 전용 기술 명세서(Frontend Integration Specification)**입니다.

본 설계서는 React/TypeScript 기반 상태 관리 체계, REST API 및 웹소켓(WebSocket) 연동 규격, 드래그 앤 드롭 스트림 바인딩 파이프라인, 그리고 로컬 에지 환경 복구 장치를 소스코드 수준으로 구체화하여, 프론트엔드 컴파일 단계의 레이턴시(Latency) 및 상태 정합성 위배 요소를 0%로 완벽하게 통제합니다.

---

## 1. 프론트엔드 아키텍처 및 시스템 레이어링

ewVLM 프론트엔드는 초당 30프레임 이상의 고대역폭 다채널 CCTV 메타데이터 수송 부하 및 VLM 실시간 경보 스트리밍을 단일 화면(Single Page Application)에서 끊김 없이(Seamless) 처리하기 위해 **"단방향 데이터 흐름 상태 제어 및 비동기 파이프라인 분리"** 설계를 핵심 패러다임으로 삼습니다.

```
+-----------------------------------------------------------------------------------+
|                            Web Browser / User Viewport                            |
|    +-------------------------------------------------------------------------+    |
|    |                      [1] React UI Layer (OSD & Canvas)                  |    |
|    +------------------------------------+------------------------------------+    |
|                                         | state (UI re-render)                    |
|                                         v                                         |
|    +-------------------------------------------------------------------------+    |
|    |                      [2] State Store (Zustand Hooks)                    |    |
|    +-------------------+--------------------+--------------------------------+    |
|                        | REST Call          | Websocket Connect                   |
|                        v                    v                                     |
|    +-------------------+--------------------+--------------------------------+    |
|    |                 [3] API Client (Axios) | Real-Time Push (WS Client)     |    |
|    +-------------------+--------------------+--------------------------------+    |
+------------------------|--------------------|-------------------------------------+
                         | HTTP               | WS (Websocket Protocol)
                         v                    v
+------------------------+--------------------+-------------------------------------+
|                      [4] ewVLM Backend Gateway (FastAPI / 8000)                   |
+-----------------------------------------------------------------------------------+
```

### ① 기술 스택 아웃라인 (Target Core Stack)
*   **프레임워크**: React 18.x (TypeScript 5.x 기반 엄격 타입 안정성 사수)
*   **빌드 시스템**: Vite v5.x (ESBuild 기반 초고속 HMR 및 파일 컴포넌트 핫스왑 지원)
*   **스타일링**: Tailwind CSS v3.x (명도 대비 WCAG AA 충족 전용 관제 다크 팔레트 강제화)
*   **상태 관리**: Zustand v4.x (Redux-Devtools 바인딩 기반 메모리 누수 소거형 경량 스토어)
*   **네트워크 통신**: Axios v1.x (비동기 HTTP 호출) 및 브라우저 네이티브 `WebSocket` (SSE 대비 이중화 제어 포트 확보)

---

## 2. Zustand 기반 글로벌 상태 관리 체계 (State Management Store)

대용량 영상 관제 중 데이터가 뒤엉키거나 컴포넌트가 불필요하게 전체 재렌더링(Re-render)되어 프레임이 버벅거리는 오헤드를 배제하기 위해, 글로벌 상태를 **"카메라 자산(Camera)"**, **"실시간 경보 및 로그(EventLog)"**, **"SOP 컴플라이언스(SOP)"**의 3대 독립 스토어(Isolated Store)로 완벽 격리 구조화합니다.

### ① 카메라 스트림 제어 상태 관리 (`useCameraStore`)
관제사가 마우스로 드래그 드롭한 카메라 채널의 링킹 상태, 각 채널별 하드웨어 디코딩 FPS 및 라이브 RTSP URL을 추적합니다.

```typescript
import { create } from 'zustand';

export interface CameraSlot {
  slotId: number;         // 1 ~ 4분할 슬롯 ID
  cameraId: string | null;
  cameraName: string | null;
  status: 'empty' | 'linking' | 'active' | 'alert';
  fps: number;
  detections: string[];
  rtspUrl: string | null;
}

interface CameraState {
  slots: CameraSlot[];
  activeLayout: 1 | 4;
  selectedCameraId: string | null;
  setSlots: (slots: CameraSlot[]) => void;
  setLayout: (layout: 1 | 4) => void;
  selectCamera: (cameraId: string | null) => void;
  updateSlotStatus: (slotId: number, status: CameraSlot['status'], updates: Partial<CameraSlot>) => void;
  resetSlot: (slotId: number) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  slots: [
    { slotId: 1, cameraId: 'CAM-01', cameraName: '외곽 1구역 펜스 북부', status: 'active', fps: 30.0, detections: [], rtspUrl: 'rtsp://192.168.1.101/live' },
    { slotId: 2, cameraId: 'CAM-02', cameraName: '자재 창고 출입구', status: 'active', fps: 29.8, detections: [], rtspUrl: 'rtsp://192.168.1.102/live' },
    { slotId: 3, cameraId: null, cameraName: null, status: 'empty', fps: 0, detections: [], rtspUrl: null },
    { slotId: 4, cameraId: null, cameraName: null, status: 'empty', fps: 0, detections: [], rtspUrl: null },
  ],
  activeLayout: 4,
  selectedCameraId: null,
  setSlots: (slots) => set({ slots }),
  setLayout: (activeLayout) => set({ activeLayout }),
  selectCamera: (selectedCameraId) => set({ selectedCameraId }),
  updateSlotStatus: (slotId, status, updates) => set((state) => ({
    slots: state.slots.map((slot) => 
      slot.slotId === slotId ? { ...slot, status, ...updates } : slot
    )
  })),
  resetSlot: (slotId) => set((state) => ({
    slots: state.slots.map((slot) => 
      slot.slotId === slotId ? { ...slot, cameraId: null, cameraName: null, status: 'empty', fps: 0, detections: [], rtspUrl: null } : slot
    )
  }))
}));
```

### ② 관제 이력 로그 및 알림 상태 관리 (`useEventLogStore`)
백엔드 웹소켓으로부터 유입되는 실시간 검출 로그 및 심각 위협 등급 경보를 관리합니다.

```typescript
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
      logs: [newLog, ...state.logs].slice(0, 1000), // 최대 1000개만 보존해 메모리 고갈 방지
      unreadAlertCount: log.level === 'critical' ? state.unreadAlertCount + 1 : state.unreadAlertCount
    };
  }),
  clearUnreadCount: () => set({ unreadAlertCount: 0 })
}));
```

### ③ SOP 가이드라인 및 공조 전계 상태 관리 (`useSopStore`)
VLM 판독 등급에 따라 화면 우측 패널에 동적으로 바인딩되는 재난 규칙 매핑 상태입니다.

```typescript
export interface SopAction {
  clause: string;          // 예: 제4조 2항
  description: string;     // 예: 소방서 유관기관 핫라인 즉각 다자 회선 인가
  isCompleted: boolean;
}

interface SopState {
  currentEventId: string | null;
  ruleTitle: string | null;
  actions: SopAction[];
  isSopActive: boolean;
  triggerSop: (eventId: string, title: string, initialActions: SopAction[]) => void;
  toggleAction: (index: number) => void;
  dismissSop: () => void;
}

export const useSopStore = create<SopState>((set) => ({
  currentEventId: null,
  ruleTitle: null,
  actions: [],
  isSopActive: false,
  triggerSop: (eventId, title, initialActions) => set({
    currentEventId: eventId,
    ruleTitle: title,
    actions: initialActions,
    isSopActive: true
  }),
  toggleAction: (index) => set((state) => ({
    actions: state.actions.map((act, i) => i === index ? { ...act, isCompleted: !act.isCompleted } : act)
  })),
  dismissSop: () => set({ currentEventId: null, ruleTitle: null, actions: [], isSopActive: false })
}));
```

---


### ④ 공공 관제 전용 회원가입 및 사용자 인증 상태 관리 (`useAuthStore`)
회원가입화면에서 수집되는 계정 소유주의 기본 정보, 소속 정보, 권한 신청 및 가입 진행 상태를 총괄 제어합니다.

```typescript
export interface SignupFormData {
  // 1. 기본 정보 (Basic Info)
  name: string;             // 성명
  email: string;            // 이메일 주소
  password: string;         // 비밀번호
  passwordConfirm: string;  // 비밀번호 확인
  
  // 2. 소속 정보 (Affiliation Info)
  agencyName: string;       // 소속 기관명
  departmentName: string;   // 부서명
  positionTitle: string;    // 직책
  
  // 3. 권한 신청 (Role Assignment)
  requestedRole: 'operator' | 'supervisor' | 'admin'; // 관제 요원, 관리 감독자, 시스템 관리자
}

interface AuthState {
  formData: SignupFormData;
  isSubmitting: boolean;
  signupError: string | null;
  signupSuccess: boolean;
  
  updateField: <K extends keyof SignupFormData>(field: K, value: SignupFormData[K]) => void;
  resetForm: () => void;
  submitSignup: (apiCall: (data: SignupFormData) => Promise<any>) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  formData: {
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    agencyName: '',
    departmentName: '',
    positionTitle: '',
    requestedRole: 'operator' // 기본값: 관제 요원
  },
  isSubmitting: false,
  signupError: null,
  signupSuccess: false,
  
  updateField: (field, value) => set((state) => ({
    formData: { ...state.formData, [field]: value }
  })),
  
  resetForm: () => set({
    formData: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
      agencyName: '',
      departmentName: '',
      positionTitle: '',
      requestedRole: 'operator'
    },
    isSubmitting: false,
    signupError: null,
    signupSuccess: false
  }),
  
  submitSignup: async (apiCall) => {
    const { formData } = get();
    
    // 프론트엔드 무결성 1차 유효성 검사 (클라이언트 검증)
    if (!formData.name || !formData.email || !formData.password || !formData.passwordConfirm) {
      set({ signupError: '필수 기본 정보를 모두 입력해주세요.' });
      return false;
    }
    if (formData.password !== formData.passwordConfirm) {
      set({ signupError: '비밀번호와 비밀번호 확인이 일치하지 않습니다.' });
      return false;
    }
    if (!formData.agencyName || !formData.departmentName || !formData.positionTitle) {
      set({ signupError: '소속 기관 정보(기관명, 부서명, 직책)를 빠짐없이 기입해주세요.' });
      return false;
    }
    
    set({ isSubmitting: true, signupError: null });
    try {
      await apiCall(formData);
      set({ signupSuccess: true, isSubmitting: false });
      return true;
    } catch (err: any) {
      set({ 
        signupError: err.response?.data?.detail || '회원가입 요청 중 예기치 못한 시스템 오류가 발생했습니다.', 
        isSubmitting: false 
      });
      return false;
    }
  }
}));
```


## 3. 백엔드 API Gateway 연동 표준 규격 (HTTP/Axios Spec)

프론트엔드와 백엔드 간의 모든 통신은 비동기 Axios 호출 인터셉터를 사용하여 JWT 보안 토큰 인가 및 통신 실패 시 자율 복구 장치(Fail-safe)가 유기적으로 흐르도록 보장합니다.

### ① Axios 클라이언트 전역 인스턴스 구성 (`backendClient.ts`)
```typescript
import axios from 'axios';

export const backendClient = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8000',
  timeout: 5000, // 5초 타임아웃 강제로 로컬 네트워크 단선 조기 탐지
  headers: {
    'Content-Type': 'application/json',
  }
});

// 리퀘스트 인터셉터를 활용한 타임스탬프 헤더 정밀 실링
backendClient.interceptors.request.use((config) => {
  config.headers['X-ewVLM-Client-Time'] = new Date().toISOString();
  return config;
}, (error) => Promise.reject(error));
```

### ② API 인터페이스 정의 (TypeScript Types matching v5 Backend spec)

#### [API Gateway 1] 동적 스트림 라이브 바인딩 (`POST /api/v1/streams/link`)
*   **기능**: 관제사가 카메라 카드를 특정 슬롯으로 드래그 드롭하는 즉시 트리거됩니다. 백엔드는 GStreamer NVMM 버퍼를 해당 슬롯 세션에 락온시킵니다.

```typescript
export interface StreamLinkRequest {
  slot_id: number;
  camera_id: string;
  stream_profile: 'low-latency' | 'high-resolution' | 'balanced';
}

export interface StreamLinkResponse {
  success: boolean;
  slot_id: number;
  camera_id: string;
  pipeline_id: string;
  decoder_fps: number;
  gstreamer_status: 'RUNNING' | 'STALLED';
  rtsp_loopback_url: string; // React 플레이어 바인딩용 WebRTC / HLS 피드 주소
}

export const apiLinkStream = async (data: StreamLinkRequest): Promise<StreamLinkResponse> => {
  const response = await backendClient.post<StreamLinkResponse>('/api/v1/streams/link', data);
  return response.data;
};
```

#### [API Gateway 2] 기존 스트림 바인딩 해제 (`POST /api/v1/streams/unlink`)
*   **기능**: 사용자가 특정 감시 화면을 X 버튼으로 끌 때 발동합니다. NVR 자원 낭비를 차단하기 위해 디코딩 하드웨어를 소거합니다.

```typescript
export interface StreamUnlinkRequest {
  slot_id: number;
  camera_id: string;
}

export interface StreamUnlinkResponse {
  success: boolean;
  message: string;
}

export const apiUnlinkStream = async (data: StreamUnlinkRequest): Promise<StreamUnlinkResponse> => {
  const response = await backendClient.post<StreamUnlinkResponse>('/api/v1/streams/unlink', data);
  return response.data;
};
```

#### [API Gateway 3] 위험 정황 VLM 에스컬레이션 트리거 (`POST /api/v1/escalation/trigger`)
*   **기능**: 가상 위협 트리거 버튼 누름 또는 YOLO 1차 감지 프레임을 Slow-Loop VLM으로 던져 정밀 문맥 진단을 시작하게 합니다.

```typescript
export interface EscalationRequest {
  slot_id: number;
  camera_id: string;
  trigger_source: 'manual_operator' | 'yolo_fast_loop';
  captured_frame_base64: string; // 1차 검출 증적 이미지 바이트 스트링
}

export interface EscalationResponse {
  success: boolean;
  escalation_id: string;
  vlm_model_deployed: string;   // 예: llama3.2-vision
  threat_detected: boolean;
  threat_classification: string; // 예: 침입, 낙상, 화재 등
  threat_caption_ko: string;    // 한글 판독 결과문
  confidence_score: number;     // VLM 판단 신뢰도 (예: 0.942)
}

export const apiTriggerEscalation = async (data: EscalationRequest): Promise<EscalationResponse> => {
  const response = await backendClient.post<EscalationResponse>('/api/v1/escalation/trigger', data);
  return response.data;
};
```

#### [API Gateway 4] 자연어 기반 시맨틱 검색 (`POST /api/v1/vss/search`)
*   **기능**: 상단 VSS 바를 통해 비정형 시맨틱 질의를 던지고 매칭 프레임 타임라인 목록을 출력합니다.

```typescript
export interface VssSearchRequest {
  query: string;
  confidence_threshold: number; // 기본값: 0.65
}

export interface VssSearchResultItem {
  event_id: string;
  camera_id: string;
  camera_name: string;
  timestamp: string;
  frame_thumbnail_url: string;
  scene_description_ko: string;
  cosine_similarity: number;
}

export interface VssSearchResponse {
  query: string;
  total_matches: number;
  results: VssSearchResultItem[];
}

export const apiSearchVss = async (query: string): Promise<VssSearchResponse> => {
  const response = await backendClient.post<VssSearchResponse>('/api/v1/vss/search', {
    query,
    confidence_threshold: 0.65
  });
  return response.data;
};
```

---


#### [API Gateway 5] 관리자 회원가입 등록 (`POST /api/v1/auth/signup`)
*   **기능**: 회원가입화면에서 관리자가 신규 계정을 신청하는 즉시 데이터베이스(users/audit_trails)에 승인 대기 상태로 이식합니다.

```typescript
export interface SignupResponse {
  success: boolean;
  user_id: string;
  email: string;
  approval_status: 'PENDING_APPROVAL' | 'APPROVED';
  created_at: string;
  message: string;
}

export const apiSubmitSignup = async (data: SignupFormData): Promise<SignupResponse> => {
  // 백엔드 v5 데이터베이스 매핑 규약에 맞춘 DTO 변환 수송
  const payload = {
    name: data.name,
    email: data.email,
    password: data.password,
    agency_name: data.agencyName,
    department_name: data.departmentName,
    position_title: data.positionTitle,
    requested_role: data.requestedRole.toUpperCase() // 'OPERATOR' | 'SUPERVISOR' | 'ADMIN'
  };
  
  const response = await backendClient.post<SignupResponse>('/api/v1/auth/signup', payload);
  return response.data;
};
```


## 4. 웹소켓(WebSocket) 기반 실시간 푸시 아키텍처

로컬 AI 모델(Ollama)이 실시간 분석 데이터를 뿜어내면, 백엔드가 수집하여 프론트엔드로 즉시 뿌려주는 웹소켓 통신 인터페이스 규격입니다.

```
[Ollama VLM / Solar LLM] 
       │ (추론 완료)
       v
[FastAPI Gateway 웹서버]
       │
       │ WebSocket Broadcast (ws://localhost:8000/api/v1/ws/alerts)
       v
[React Web UI Client] (useEventLogStore / useSopStore 동시 락온)
       ├── ① 감시 캔버스 테두리 Red 플래싱 및 동적 1분할 팝업
       ├── ② 하단 '관제 이력 로그'에 성공/심각 로그 자동 추가
       └── ③ 우측 'SOP 가이드라인' 연계 표 조항 바인딩 및 TTS 출력
```

### ① 웹소켓 클라이언트 매니저 소스코드 (`useWebSocket.ts`)
```typescript
import { useEffect, useRef } from 'react';
import { useEventLogStore } from './useEventLogStore';
import { useCameraStore } from './useCameraStore';
import { useSopStore } from './useSopStore';

export const useWebSocket = (wsUrl: string = 'ws://localhost:8000/api/v1/ws/alerts') => {
  const socketRef = useRef<WebSocket | null>(null);
  const addLog = useEventLogStore((state) => state.addLog);
  const updateSlotStatus = useCameraStore((state) => state.updateSlotStatus);
  const triggerSop = useSopStore((state) => state.triggerSop);

  useEffect(() => {
    const connect = () => {
      console.log('[WS_CONNECT] 실시간 VLM 패킷 수신 웹소켓 연결 수립 시도 중...');
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('[WS_OPENED] ewVLM 중앙 푸시 게이트웨이와 통신 정상 수립');
        addLog({
          cameraId: 'SYSTEM',
          cameraName: '중앙 통제실',
          level: 'info',
          message: '[성공] 실시간 AI 분석 웹소켓 채널 정상 동기화 완료.',
          confidence: 1.0
        });
      };

      ws.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          console.log('[WS_PACKET_RECEIVED] 실시간 AI 패킷 도착: ', packet);

          // 1. 하단 이력 로그 즉시 바인딩
          addLog({
            cameraId: packet.camera_id,
            cameraName: packet.camera_name,
            level: packet.severity === 'CRITICAL' ? 'critical' : 'warning',
            message: packet.message_ko,
            confidence: packet.confidence
          });

          // 2. 위험 등급 검출에 따른 화면 감시 캔버스 동적 테두리 경보(Alert) 격상 및 1분할 격상
          if (packet.severity === 'CRITICAL') {
            updateSlotStatus(packet.slot_id, 'alert', {
              detections: [packet.message_ko, `신뢰점수: ${(packet.confidence * 100).toFixed(1)}%`]
            });

            // 3. 재난 규정 가이드라인(SOP) 컴플라이언스 즉각 강제 표출
            triggerSop(
              packet.event_id,
              `${packet.camera_name} - SOP 제4조 비상 대응 행동 강령`,
              packet.sop_actions.map((act: string, idx: number) => ({
                clause: `조항-0${idx + 1}`,
                description: act,
                isCompleted: false
              }))
            );

            // 4. 관제요원 인지 강화 사운드(TTS) 동적 기동 (Web Audio API 브라우저 연동)
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(packet.message_ko);
              utterance.lang = 'ko-KR';
              utterance.rate = 1.0;
              window.speechSynthesis.speak(utterance);
            }
          }
        } catch (err) {
          console.error('[WS_PARSE_ERROR] 웹소켓 JSON 패킷 분석 실패:', err);
        }
      };

      ws.onclose = () => {
        console.warn('[WS_CLOSED] 웹소켓 단선 탐지. 3초 후 재연동(Auto-reconnect) 회선을 재수립합니다.');
        setTimeout(connect, 3000); // Fail-safe: 자율 복구 재접속 기능 탑재
      };

      ws.onerror = (error) => {
        console.error('[WS_ERROR] 웹소켓 에러 감지:', error);
        ws.close();
      };
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [addLog, updateSlotStatus, triggerSop, wsUrl]);
};
```

---

## 5. 드래그 앤 드롭 스트림 바인딩 인터랙션 (Monitor Canvas 핫스왑)

관제사 OSD 동작의 핵심인 드래그 앤 드롭(Drag & Drop)에 따른 상태 천이 테이블 및 실제 바인딩 소스코드 정밀 가이드라인입니다.

### ① 상태 천이 흐름도 (State Transition Map)
```
[Empty Slot] ───(Drop Event)───> [Linking Slot] ───(REST Response)───> [Active Slot]
    ^                                                                        │
    │ (X 버튼 누름: Unlink)                                                   v (WS Alert 유입)
    └───────────────────────────────────────────────────────────────── [Alert Slot]
```

### ② `MonitorCanvas` Drag & Drop 핵심 가동 코드 구현
```typescript
// MonitorCanvas.tsx 내 HTML 드롭 수신기 스펙
const handleDrop = async (e: React.DragEvent, slotId: number) => {
  e.preventDefault();
  const cameraId = e.dataTransfer.getData("cameraId");
  if (!cameraId) return;

  const updateSlotStatus = useCameraStore.getState().updateSlotStatus;
  const addLog = useEventLogStore.getState().addLog;

  // 1. 즉시 로딩(Linking) 상태로 UI 격상하여 사용자 지연 체감 소거
  updateSlotStatus(slotId, 'linking', {
    cameraId: cameraId,
    cameraName: cameraId === 'CAM-01' ? '외곽 1구역 펜스 북부' : '자재 창고 출입구',
    detections: ['GStreamer NVMM 하드웨어 디코더 락온 시도 중...']
  });

  try {
    // 2. 백엔드 FastAPI 게이트웨이로 RTSP 동적 물리 바인딩 지시 수송
    const response = await apiLinkStream({
      slot_id: slotId,
      camera_id: cameraId,
      stream_profile: 'low-latency'
    });

    if (response.success) {
      // 3. 성공 시 비디오 하드웨어 스트림 상태 전환
      updateSlotStatus(slotId, 'active', {
        fps: response.decoder_fps,
        rtspUrl: response.rtsp_loopback_url,
        detections: ['NVIDIA NVDEC 디코딩 정상 가동']
      });
      addLog({
        cameraId: cameraId,
        cameraName: response.camera_id,
        level: 'info',
        message: `[성공] 채널 0${slotId} - GStreamer NVMM 파이프라인 수립 완료.`,
        confidence: 1.0
      });
    } else {
      throw new Error('GStreamer 파이프라인 생성 오류');
    }
  } catch (error) {
    // 4. 에러 발생 시 원래 비어있는 빈 슬롯 상태로 자율 롤백 복구
    updateSlotStatus(slotId, 'empty', {
      cameraId: null,
      cameraName: null,
      fps: 0,
      detections: []
    });
    addLog({
      cameraId: 'SYSTEM',
      cameraName: '중앙 통제실',
      level: 'critical',
      message: `[실패] 채널 0${slotId} 링킹 실패: 하드웨어 디코딩 세션 오버헤드 감지.`,
      confidence: 0.0
    });
  }
};
```

---

## 6. 다크모드 비주얼 스타일 가이드 수렴 검증 (Tailwind Integration)

24시간 모니터링 환경에서 명도 대비 표준 WCAG AA 규격(7:1)을 빈틈없이 충족하기 위한 Tailwind CSS 전용 스타일 맵 클래스 정의 규격입니다.

### ① Tailwind 전용 CSS 변수 융합 테마 맵 (`tailwind.config.js` 상호작용)
```javascript
// tailwind.config.js 내에 완벽하게 박혀있는 테마 규격 명문화
module.exports = {
  theme: {
    extend: {
      colors: {
        ewvlm: {
          canvas: '#070A13',     // 최하단 캔버스 배경
          card: '#121724',       // 컴포넌트 감시 패널 카드 배경
          border: '#232C3F',     // 저채도 경계선
          text: '#E2E8F0',       // 고가독성 실버 화이트
          muted: '#7D8D9F',      // 저자극 비활성 회색
          primary: '#7C3AED',    // 시그널 인디케이터 바이올렛
          success: '#10B981',    // 안전 정상 LED 녹색
          danger: '#EF4444'      // 위협 검출 경보 적색
        }
      }
    }
  }
}
```

---


### ③ 회원가입 화면 (Signup Screen) OSD 및 디자인 스펙 (회원가입_이미지.jpg 기준 반영)
방범 및 공공 인프라 특화 다크 테마 가이드라인(`WCAG AA 7:1`) 하에서 관리자가 안전하게 본인 계정을 생성할 수 있도록 격리 구성된 회원가입 UI 프레임 디자인 규칙입니다.

```
+-------------------------------------------------------------------------+
|                              ewVLM-Core                                 |
|               지능형 영상 관제 플랫폼 회원가입 (Title Header)            |
+-------------------------------------------------------------------------+
|  [User Icon] 1. 기본 정보                                                |
|  +-------------------------------------+-----------------------------+  |
|  | 성명                                | 이메일 주소                  |  |
|  | [ Input (White / #FFFFFF) ]         | [ Input (White / #FFFFFF) ] |  |
|  +-------------------------------------+-----------------------------+  |
|  | 비밀번호                             | 비밀번호 확인                |  |
|  | [ Input (White / #FFFFFF) ]         | [ Input (White / #FFFFFF) ] |  |
|  +-------------------------------------+-----------------------------+  |
|                                                                         |
|  [Building Icon] 2. 소속 정보                                            |
|  +---------------------+---------------------+-----------------------+  |
|  | 소속 기관명          | 부서명              | 직책                  |  |
|  | [ Input (White) ]   | [ Input (White) ]   | [ Input (White) ]     |  |
|  +---------------------+---------------------+-----------------------+  |
|                                                                         |
|  [Key Icon] 3. 권한 신청                                                 |
|  +---------------------+---------------------+-----------------------+  |
|  | (o) 관제 요원        | ( ) 관리 감독자       | ( ) 시스템 관리자      |  |
|  +---------------------+---------------------+-----------------------+  |
|                                                                         |
|  <- 로그인 화면으로 돌아가기                       [ 회원가입 완료 (V) ]  |
+-------------------------------------------------------------------------+
```

1.  **배경 및 레이아웃 구조 (Deep Canvas Grid)**:
    *   최하단 전체 배경은 완전 무저자극 다크 캔버스인 `.theme-dark-bg` (`#070A13`)를 사용하여 영상 눈부심을 원천 배제합니다.
    *   중앙 정렬된 회원가입 가입 양식 컨테이너(Card Frame)는 `.theme-dark-card` (`#121724`) 배경에 `rounded-xl` 테두리 곡률과 `#232C3F` 보더 라인을 적용하여 시각적 독립성을 확보합니다.
2.  **입력 폼 세부 필드 (White Input Box Style)**:
    *   **입력창 배경**: 사용자 접근 및 타이핑 가독성 한계를 해소하기 위해, 입력란(Input Box) 배경색은 **완전 화이트(`#FFFFFF`)**로 반전 설계하여 높은 대조(High Contrast)를 확보하고, 테두리는 실버 블루 포커스 라인을 가미합니다.
    *   **레이블 텍스트**: 각 입력창 바로 위에 그레이시 블루(`.theme-dark-muted`, `#7D8D9F` ~ `#E2E8F0`) 색상으로 명확히 표기합니다.
3.  **3대 수집 세션 및 아이콘 가이딩**:
    *   **1세션: 기본 정보** (성명, 이메일 주소, 비밀번호, 비밀번호 확인) -> 좌측에 사용자(`User`) 네온 바이올렛 `#7C3AED` 아이콘 배치.
    *   **2세션: 소속 정보** (소속 기관명, 부서명, 직책) -> 좌측에 빌딩(`Building`) 아이콘 배치.
    *   **3세션: 권한 신청** (관제 요원, 관리 감독자, 시스템 관리자) -> 좌측에 보안 키(`Key`) 아이콘 배치.
        *   선택용 라디오 버튼은 관제센터의 신속한 의사결정을 위해 단일 선택(Single Select) 모델로만 설계하며, 선택된 권한 항목은 **네온 바이올렛 `#7C3AED` 펄싱 채움 라이트**를 가합니다.
4.  **최하단 버튼 액션 (Dual Action Link)**:
    *   **좌측 (로그인 회차 복귀)**: `<- 로그인 화면으로 돌아가기` (저저극 실버 링크 `#8E9AA8` 스타일) -> 클릭 시 Zustand Auth 상태를 리셋하고 마스터 로그인 라우터로 뷰 전환.
    *   **우측 (제출 실행 버튼)**: `회원가입 완료 [Check 아이콘]` -> 든든한 신뢰감과 위협 극복 시그널을 연출하기 위해 **백그라운드를 네온 바이올렛 `#7C3AED` 브랜드 칼라**로 가득 채우고, 텍스트는 화이트(`#FFFFFF`)로 선명하게 표시하여 가독성을 극대화합니다.


## 7. 컴파일 핫스왑 및 로컬 디버깅 가이드 (E2E Integration Checklist)

프론트엔드 빌드 시 발생할 수 있는 에러 유형과 Antigravity가 스스로 진단하고 치료할 자율 검증 지침입니다.

### ① 자율 디버깅 진단 체크리스트
1.  **CORS 차단 에러 (`Access-Control-Allow-Origin` 에러)**:
    *   **증상**: 브라우저 콘솔창에 빨간색 네트워크 요청 거절 로그 출력.
    *   **치료책**: FastAPI의 `CORSMiddleware`에 프론트엔드의 구동 호스트 주소(`http://localhost:5173`)가 정확히 입력되어 있는지 백엔드 파일(`ewvlm_fastapi_gateway.py`)의 `origins = [...]` 리스트 구역을 자율 스캔하여 패치.
2.  **임포트 누수 오류 (`Module not found` 에러)**:
    *   **증상**: `Vite Build` 시 특정 `lucide-react` 또는 `zustand` 라이브러리를 찾지 못해 컴파일 컴포넌트 붕괴.
    *   **치료책**: `package.json`의 의존성 구조를 확인하고 `npm install` 패키지 원스톱 업데이트를 백그라운드 구동하여 싱크 동기화.
3.  **웹소켓 끊김 지연 현상**:
    *   **증상**: 백엔드 재기동 시 웹소켓 경보 패킷 전송이 장시간 먹통이 됨.
    *   **치료책**: `useWebSocket.ts` 내의 `ws.onclose` 자율 복구 타이머(`setInterval/setTimeout`) 메커니즘을 작동시켜 3초 단위 재접속 시도 메커니즘이 루프백으로 작동하는지 E2E 최종 검증.

본 프론트엔드 전용 설계 명세서를 기반으로 하여, **Antigravity** 코딩 에이전트는 한 치의 오차도 없는 프론트-백엔드 100% 무결성 초고속 링킹 작업을 무결하게 완수할 것입니다.

---

## 8. 전체 UI 화면 라우팅 아키텍처 및 확장 상태 관리 (React Router & Extended Stores)

Stitch로부터 다운로드된 58개의 확장 UI 화면들(총 28개 도메인)을 수용하기 위해, `react-router-dom` 기반의 전역 라우팅 구조와 추가적인 확장 상태 관리(Zustand)가 다음과 같이 구성되어야 합니다.

### ① 전역 라우팅 패스 매핑 (React Router v6)
기본적인 관제 화면(Monitor A/B) 및 회원가입 외에도, 플랫폼 확장에 따른 주요 URL 라우팅 체계를 정의합니다.

*   `/auth/signup` : 지능형 영상 관제 플랫폼 회원가입
*   `/monitor/live` : Monitor A (실시간 관제 및 PTZ 제어) / Monitor B (VLM 지능형 영상 분석)
*   `/vss/search` : 저장영상 조회 및 시맨틱 검색 (VSS)
*   `/gis/map` : GIS 스마트 맵 기반 카메라 동적 화각 매핑
*   `/ptz/handover` : 지능형 PTZ 타겟 락온 및 다중 카메라 궤적 인계(Handover) 컨트롤러
*   `/ptz/tour` : 지능형 자율 PTZ 순찰 투어 및 스케줄 기획 콘솔
*   `/audio/broadcast` : 광역 IP Audio 그룹 방송 및 비상벨 인터컴 제어 콘솔
*   `/privacy/export` : 프라이버시 비식별화 가공 및 암호화 반출 워크숍
*   `/system/nvr` : NVR 스토리지 및 하드웨어 상태 검수 대시보드
*   `/system/network` : 물리 장치 네트워크 토폴로지 및 PoE 스위치 모니터링 콘솔
*   `/system/self-healing` : 단말 하드웨어 정밀 진단 및 자율 복구 마스터 쉘
*   `/ai/lora` : 자율 피드백 루프 및 LoRA 미세조정 관리 콘솔
*   `/ai/orchestration` : 에지 AI 컨테이너 오케스트레이션 및 NIM 분산 전개 모니터링
*   `/dashboard/bi` : 실시간 통계 및 BI 대시보드 (SightMind)
*   `/emergency/war-room` : 재난대응 통합 가상 워룸 및 유관기관 협업 콘솔
*   `/mobile/patrol` : ewVLM 모바일 패트롤 앱 전용 뷰

### ② 도메인별 확장 Zustand 스토어 정의
기존 `useCameraStore`, `useEventLogStore`, `useSopStore` 외에 추가 UI를 구동하기 위한 독립 스토어를 설계합니다.

1.  **`usePtzStore`**: PTZ 카메라의 팬/틸트/줌 좌표, 자율 순찰 프리셋 및 다중 카메라 타겟 인계(Handover) 세션 상태를 관리합니다.
2.  **`useGisStore`**: 네이버/카카오/구글 맵 API 위에서 작동하는 카메라 객체의 위치(Lat/Lng), 폴리곤 가상 펜스 좌표, 동적 화각 렌더링 상태를 제어합니다.
3.  **`useSystemHealthStore`**: NVR 스토리지 사용량, PoE 스위치 트래픽, 하드웨어 온도 및 Self-Healing 진단 로그를 캐싱합니다.
4.  **`useAiOpsStore`**: 엣지 AI 컨테이너 배포 상태, LoRA 파인튜닝 학습 진행률(Epoch/Loss), 프롬프트 버전 관리 이력을 담당합니다.

이러한 라우팅 체계와 확장 스토어 구조를 통해, 28개 도메인에 달하는 방대한 UI 컴포넌트들이 메인 프레임워크 내에서 지연 없이 부드럽게 병합(Integration)될 수 있습니다.

---

## 9. 컴포넌트 레이아웃 및 UX 상호작용 상세 규격 (UI/UX Detailed Spec)

UI 설계 명세(`ewvlm-ui-spec-v2.md`) 분석 결과, 실제 React 컴포넌트 구현 시 다음과 같은 정밀한 레이아웃 분할 및 상호작용(UX)이 준수되어야 합니다.

### ① 실시간 관제 모니터 (Monitor A) 그리드 분할 레이아웃
단일 뷰포트 내에서 마우스 이동 동선을 최소화하기 위해 Flexbox/CSS Grid 기반의 **5열(Column) 하드웨어 분할 구조**를 엄격히 적용합니다.
*   **1열 (카메라 리스트)**: 등록된 CCTV 목록과 Ping 상태(녹/주/적색) LED 렌더링.
*   **3열 (다중 격자 뷰)**: 드래그 앤 드롭 타겟 영역. NvDCF 바운딩 박스 투사 처리.
*   **4열 (PTZ 컨트롤러)**: 8축 방향 원격 제어 조그셔틀 및 줌/포커스 세밀 튜닝 UI.
*   **5열 (분할 및 프리셋)**: 1~32분할 동적 전환 숏컷 및 P1~P5 물리 프리셋 호출 버튼.

### ② 저장영상 조회 및 시맨틱 검색 (Progressive Scrubbing)
과거 영상을 조회하는 타임라인은 단순한 슬라이더가 아닌 **동적 스케일링 프로그레시브 타임라인**으로 구현되어야 합니다.
*   **가변 스케일 축**: 마우스 휠 스크롤 감응을 통해 `시간 단위 -> 분 단위 -> 초 단위`로 타임라인 해상도가 동적 줌인/줌아웃(Zoom) 렌더링되어야 합니다.
*   **VLM 이벤트 앵커링**: 타임라인 레이어 위에 특정 사건(🔥 화재, ★ 낙상 등)을 나타내는 아이콘 마커를 오버레이하여 원클릭 숏컷 점프를 지원해야 합니다.
*   **하드웨어 가속 재생**: 1x ~ 16x 배속 변속 및 인트라 프레임 단위 미세 스크러빙 조작을 지원하는 HTML5 Video Player 래퍼 컴포넌트가 필요합니다.

### ③ 자연어 룰셋 코파일럿 (Rule Configurator) 제로샷 테스트 UI
현장 관제사가 자연어로 AI 룰셋을 배포할 때, 컴포넌트 분할을 통해 우측에 **가상 검증 뷰포트(Zero-shot Rule Testing Screen)**를 배치하여, 과거 테스트 클립 영상 위로 VLM 바운딩 박스가 오버레이되는 시뮬레이션 결과를 실시간 프리뷰로 보여주어야 합니다.

## 10. Authentication & Authorization Flow
- **초기 진입점**: 애플리케이션 접속 시 Login.tsx가 가장 먼저 렌더링됩니다.
- **계정 생성 유도**: 계정이 없는 사용자를 위해 로그인 화면 내 '회원가입' 버튼을 통해 Signup.tsx로 이동하는 라우팅 흐름을 지원합니다.
- **관제 모드 진입**: 로그인(또는 회원가입) 완료 시 App.tsx의 상태(currentView)가 'dashboard'로 변경되며 다중 카메라 선별관제 콕핏(Monitor A/B)이 마운트됩니다.
