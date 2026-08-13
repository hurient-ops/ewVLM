# ewVLM-Core Full-Stack Integration Plan

## Goal Description
프론트엔드 명세서(`ewvlm-frontend-spec-v2.md`)와 백엔드 명세서(`ewvlm-dev-spec-v5.md`) 분석을 기반으로, 현재 정적 UI 및 로컬 상태(Local State) 기반으로 구성된 프론트엔드를 Zustand 전역 상태 및 FastAPI 백엔드 연동 체계로 고도화합니다. 또한, VLM 추론을 담당하는 백엔드 게이트웨이 및 Ollama 브릿지를 연동하여 실시간 지능형 영상 관제 파이프라인(Dual-Loop Architecture)을 완성합니다.

> [!NOTE]
> 본 계획은 프론트엔드의 3대 격리 스토어(Camera, EventLog, SOP) 구축과 백엔드의 WebSocket/REST API 통합을 최우선 목표로 합니다.

## User Review Required
> [!IMPORTANT]
> - **대규모 UI 컴포넌트 변환**: `frontend/src` 폴더에 28개 이상의 Stitch HTML 파일이 존재합니다. 한 번에 모두 변환하기에는 작업량이 방대하므로, **핵심 관제 화면(`MonitorALiveControl`, `EventReviewCenter` 등)을 우선적으로 React 컴포넌트로 변환**하고 점진적으로 확장하는 방식을 제안합니다.
> - **`py.sh` 파일 확인**: 요청하신 내용 중 `backend` 폴더의 `py.sh` 파일이 언급되었으나, 현재 디렉토리 목록에는 `install_ewvlm_models.sh`와 파이썬 스크립트들만 확인됩니다. 해당 스크립트에 대한 추가 확인이 필요할 수 있습니다.

## Open Questions
> [!WARNING]
> 1. 실제 테스트를 위한 ONVIF RTSP 카메라 스트림 URL이 준비되어 있습니까? (없다면 현재처럼 Mock 영상 소스로 진행합니다)
> 2. 프론트엔드 Zustand 스토어 적용 시, 기존 `MonitorCanvas.tsx` 내부의 임시 데이터를 먼저 연동하는 것으로 시작할까요?

## Proposed Changes

---

### [Frontend] State Management & Network Layer
Zustand를 활용하여 명세서에 정의된 4개의 독립 스토어를 구축하고, 백엔드 통신 모듈을 추가합니다.

#### [NEW] `frontend/src/store/useCameraStore.ts`
- 카메라 채널(1~4분할) 및 스트림 링크 상태 관리

#### [NEW] `frontend/src/store/useEventLogStore.ts`
- 백엔드 WebSocket을 통해 수신되는 실시간 VLM 판독 로그 관리

#### [NEW] `frontend/src/store/useSopStore.ts`
- VLM 에스컬레이션 트리거 시 매핑되는 재난 규정(SOP) 가이드라인 관리

#### [NEW] `frontend/src/store/useAuthStore.ts`
- 로그인 및 회원가입 관련 사용자 인증 상태 관리 (`App.tsx`의 `currentView` 대체)

#### [NEW] `frontend/src/api/client.ts`
- Axios를 이용한 REST API 클라이언트 설정 (Base URL: `http://localhost:8000`)
- WebSocket 연결 매니저 구현

#### [MODIFY] `frontend/src/App.tsx`
- 기존 React `useState` 기반 로직을 Zustand 스토어로 마이그레이션
- 컴포넌트 마운트 시 WebSocket 연결 초기화

---

### [Frontend] React Component Migration
Stitch 기반 원본 HTML 화면 중 핵심 관제 화면을 우선적으로 React/TypeScript화합니다.

#### [NEW] `frontend/src/components/MonitorALiveControl.tsx`
- 1/4분할 관제 화면 및 카메라 드래그 앤 드롭 UI 구현
- 원본 `MonitorALiveControl.html` 기준

#### [NEW] `frontend/src/components/EventReviewCenter.tsx`
- 이벤트 발생 내역 조회 및 VSS 시맨틱 검색 UI 구현
- 원본 `EventReviewCenter.html` 기준

---

### [Backend] FastAPI Gateway & Bridge Integration
프론트엔드의 실시간 업데이트를 지원하기 위해 백엔드 구조를 보강합니다.

#### [MODIFY] `backend/ewvlm_fastapi_gateway.py`
- WebSocket 엔드포인트(`/ws/events`) 추가: 프론트엔드 `useEventLogStore` 및 `useSopStore`와 실시간 양방향 통신 구현
- 기존 Mock 데이터 로직을 WebSocket Push 모델로 연결

#### [MODIFY] `backend/ewvlm_ollama_bridge.py`
- Gateway와 브릿지 간의 에스컬레이션 통신 로직 강화
- 필요 시 실제 Llama 3.2 Vision 로컬 구동 API와 결합 (Mock 해제 옵션 추가)

## Verification Plan
### Automated & Manual Verification
- **Frontend State**: Redux DevTools를 통해 Zustand 스토어 상태 변경이 컴포넌트 재렌더링에 미치는 영향 확인
- **WebSocket 연동**: FastAPI 백엔드를 띄운 상태에서 `ewvlm_ollama_bridge.py` 스크립트를 수동 실행하여, VLM 에스컬레이션 로그가 프론트엔드 알림 패널에 즉시 팝업되는지 육안 확인
- **Routing**: Login -> Dashboard (MonitorALiveControl) 뷰 전환 테스트
