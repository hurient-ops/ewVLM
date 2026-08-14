# VLM 분석 새 창 분리 개선 사항 안내

사용자님의 피드백을 반영하여, **VLM 분석 관련된 5개 메뉴 전체가 한 번에 새 창으로 분리**되도록 구조를 개선했습니다.

## 주요 변경 사항

### 1. `Monitor B` 레이아웃 전체 분리
기존 `이벤트 리뷰 센터`에만 있던 분리 버튼을 제거하고, 전체 VLM 분석 메뉴를 담당하는 `Monitor B Layout` 우측 상단으로 이동시켰습니다. 이제 새 창 분리 시 좌측 사이드바(5개 메뉴)가 모두 포함되어 나타납니다.

### 2. 메인 창 (Monitor A) 동기화 및 안내
- 메인 창과 분리된 창 간에 `BroadcastChannel`을 통해 실시간으로 상태가 동기화됩니다.
- 창이 분리된 상태에서 본 화면의 **VLM 분석** 탭을 클릭하면 화면이 깨지지 않고, **"VLM 분석이 새 창에서 실행 중입니다"**라는 깔끔한 안내 화면이 나타납니다.
- 본 화면에서 해당 안내 화면에 있는 **[본 화면으로 강제 복귀]** 버튼을 누르면 즉시 분리된 창을 닫고 원래 상태로 돌아옵니다.

### 3. 상단 네비게이션 시각적 힌트 추가
본 화면 상단의 **[VLM 분석]** 탭 우측에 작게 새 창 아이콘(`open_in_new`)이 나타나도록 하여, 현재 해당 기능이 별도 모니터에서 활성화되어 있음을 직관적으로 알 수 있게 수정했습니다.

## 테스트 방법
1. 상단의 **VLM 분석** 탭 클릭
2. 우측 상단 팝업 버튼 **[새 창으로 분리]** 클릭
3. 새 창이 열리고 5개의 메뉴가 모두 있는지 확인
4. 원래의 화면으로 돌아가서 **VLM 분석** 탭에 새 창 아이콘이 있는지 확인 및 클릭 시 "새 창에서 실행 중입니다" 안내가 나오는지 확인
5. 새 창을 종료하거나 강제 복귀 버튼을 눌러 원상태로 복구되는지 확인

---

# Phase 8: 하드웨어 및 실시간 인프라 연동 완료

이전 모의(Mock) 데이터를 대체하여 **실제 하드웨어(PTZ, NVR) 및 실시간 WebSocket 이벤트 연동** 작업을 성공적으로 마무리했습니다.

## 주요 변경 사항

### 1. 실시간 미디어 스트리밍 (WebRTC) 구축
- **MediaMTX 서버 통합:** 백엔드 `docker-compose.yml` 에 `mediamtx` 컨테이너를 추가하여 기존 목업 이미지가 아닌 **RTSP(실시간 스트리밍 프로토콜)를 WebRTC로 변환**하여 브라우저에 송출합니다.
- **WebRTCPlayer 컴포넌트:** 지연(Latency)이 거의 없는 `<WebRTCPlayer />` 컴포넌트를 구현하여 `MonitorALiveControl.tsx`와 `GisSmartMap.tsx`의 가짜 이미지를 대체했습니다.

### 2. VLM 실시간 프레임 분석 소켓 (WebSocket) 연동
- 백엔드에 `websocket_manager.py`를 신규 도입하고 API Gateway(`ewvlm_fastapi_gateway.py`)에 연결했습니다.
- 백엔드의 AI 추론 모듈(`fast_loop.py`)이 객체를 탐지하면 즉각적으로 WebSocket을 통해 브라우저로 알람(VLM Events)을 쏩니다.
- 프론트엔드의 `api/client.ts`와 상태 관리(`useEventLogStore.ts`)에서 이를 실시간으로 수신받도록 구현되었습니다.

### 3. 하드웨어 PTZ (Pan-Tilt-Zoom) ONVIF 직접 제어
- 백엔드에 `onvif_controller.py` 모듈을 생성하여 물리 카메라 렌즈를 상하좌우(PTZ) 조작하는 API(`POST /api/v1/cameras/{camera_id}/ptz`)에 연결했습니다.
- 프론트엔드 UI의 **조그셔틀 버튼 (상하좌우 및 대각선, 줌)**에 마우스를 누를 때(`onMouseDown`) 이동 시작, 마우스를 뗄 때(`onMouseUp`) 멈춤 신호(`stop`)가 가도록 마우스 이벤트를 완벽하게 바인딩했습니다.

### 4. NVR 및 타임라인 싱크 (Playback) 구축
- 백엔드에 `playback_service.py`를 신규 작성하여, 녹화된 MP4 파일을 HTTP Range 요청 기반의 스트리밍으로 내려주도록 구현했습니다 (`/api/v1/nvr/playback/{camera_id}`).
- 이벤트 리뷰 센터(`EventReviewCenter.tsx`)의 매트릭스 뷰포트에 모의 배경 이미지를 지우고, **실제 VOD 플레이어(HTML5 `<video>`)**를 배치했습니다.
- 좌측 대기열에서 이벤트를 클릭하면, 해당 이벤트 기록(`activeLogId`)을 바탕으로 NVR 녹화 영상 타임라인이 자동으로 이동(`?t=...`)하여 재생되도록 구현되었습니다.

---

# Phase 9: 전면 라우팅(React Router) 및 도메인별 상태 관리(Zustand) 확장 도입

향후 확장될 28개의 하위 도메인(UI)을 수용하기 위한 코어 아키텍처 개편 및 상태 관리 인프라 확장을 완료했습니다.

## 주요 변경 사항

### 1. React Router v6 기반 전역 라우팅 구성
- 기존 `App.tsx`의 렌더링 스위칭 방식을 **React Router v6** 표준 라우팅으로 전면 개편했습니다 (`<BrowserRouter>`, `<Routes>`, `<Route>`).
- 이제 각 화면별 고유 URL(예: `/monitor-a`, `/monitor-b`, `/vss-semantic-search`) 접속 및 브라우저 뒤로가기/앞으로가기 내비게이션을 완벽하게 지원합니다.
- `BaseLayout.tsx` 및 `MonitorBLayout.tsx`를 통해 상단 헤더바와 좌측 사이드바가 라우팅 간에도 유지되는 깔끔한 SPA(Single Page Application) 구조가 확립되었습니다.

### 2. 도메인별 전문 상태 관리(Zustand) 확장
- 향후 추가될 핵심 모듈을 위한 3대 스토어를 선제적으로 구축했습니다.
- `usePtzStore.ts`: 하드웨어 카메라 PTZ 프리셋 및 자율 순찰 정보 상태 관리
- `useGisStore.ts`: 지도상 CCTV 좌표 배치 및 팝업 상태 렌더링 제어
- `useSystemHealthStore.ts`: NVR 서버 디스크, 네트워크 부하, CPU 헬스 상태 모니터링 관리
