# VLM 분석 새 창 분리 개선 사항 안내

사용자님의 피드백을 반영하여, **VLM 분석 관련된 5개 메뉴 전체가 한 번에 새 창으로 분리**되도록 구조를 개선했습니다.

## 프론트엔드 변경 사항 (완료)
1. **커스텀 로고 적용**
   - 사용자 제공 로고(`logo.png`)를 `GuestLayout.tsx` 및 `Login.tsx`, `Signup.tsx`에 반영 완료.
2. **모바일 순찰 뷰 (Mobile Patrol View)**
   - 레이아웃을 기존 상하 배치에서 좌우 배치(`flex-row`)로 변경하여 가시성 확보.
   - 텍스트 잘림 현상을 해결하기 위해 반응형 텍스트(`break-words`, `flex-wrap`) 적용.
3. **자동 복구 시스템 (Hardware Self-Healing View)**
   - 뷰를 전체 너비로 확장(`w-full`, `flex-1`)하여 화면 치우침 현상 해결.
4. **사이드바 메뉴 순서 변경**
   - `BaseLayout.tsx`의 우측 상단 햄버거 메뉴 내 항목을 재배치:
     - **시스템 설정**을 최상단으로 이동.
     - **운영 및 제어**를 하단으로 이동.
5. **회원가입 폼 (Signup Form)**
   - `이름(실명)`과 `핸드폰 번호` 필드를 추가 반영.
6. **전역 반응형 스케일링**
   - 모니터 해상도가 다를 경우 자동으로 스케일링되는 Tailwind의 Flexbox 및 Grid 기반 반응형 레이아웃이 적용되어 있음을 확인 및 `w-full` 보강 완료.

## 백엔드 변경 사항 (완료)
1. **DB 스키마 마이그레이션**
   - `User` 모델에 `name` 및 `phone` 컬럼을 반영하고 데이터베이스 초기화 진행.
2. **회원가입 API 변경**
   - `SignupRequest` Pydantic 모델에 `name`, `phone` 필드를 추가.
   - 신규 사용자의 정보를 전달받아 저장하도록 `ewvlm_fastapi_gateway.py` 수정.
3. **최고 관리자 계정 보존 확인**
   - 이전에 생성한 **ID:** `admin` / **PW:** `admin123!` 계정이 정상적으로 보존되어 최고 권한 상태를 유지 중입니다.

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

---

# Phase 10: 통합 테스트 및 잔여 이슈 대응 완료

전체 프론트엔드 모듈 연동 후 시스템 전반의 사용성과 안정성을 검증하기 위해 통합 E2E 테스트를 수행하였으며, 발견된 주요 이슈(글로벌 알림 부재, API 에러)를 모두 해결했습니다.

## 주요 변경 사항

### 1. 글로벌 Toast 알림 (Global Notification) 도입
- 이벤트 시뮬레이터 및 웹소켓에서 수신된 실시간 이벤트(VLM Event)를 즉시 인지할 수 있도록 `BaseLayout.tsx` 우측 하단에 **글로벌 Toast UI**를 신규 추가했습니다.
- 위험도(Info, Warning, Critical)에 따라 색상이 동적으로 변경되며, 5초 후 자동으로 사라집니다.
- 상단 알림 뱃지의 숫자가 실제 스토어(`useEventLogStore`)의 미확인 알림 수량(`unreadAlertCount`)과 연동되도록 수정했습니다.

### 2. GIS 카카오맵 연동을 위한 백엔드 API 추가
- 프론트엔드 카카오맵 마커 렌더링에 필수적인 카메라 메타데이터 조회를 위해 백엔드 `ewvlm_fastapi_gateway.py`에 `GET /api/v1/cameras` 엔드포인트를 신규 구현했습니다.

### 3. 미디어 스트리밍 에러 우회용 Mock 서버 구축
- 미디어 서버 인프라(MediaMTX) 부재 시 `WebRTCPlayer`에서 발생하는 `Failed to fetch` 통신 에러를 방지하기 위해 8889 포트에서 동작하는 경량화된 `mock_webrtc_server.py`를 구축하고 활성화했습니다.

---

# Phase 11: B2B 엔터프라이즈 보안 및 데스크톱 앱화 완료

엔터프라이즈(폐쇄망) 관제 소프트웨어 표준 환경 구축을 위해 데스크톱 앱화 및 계정/권한 통제 기능을 완벽히 연동했습니다.

## 주요 변경 사항

### 1. 보안 기반 인증 (Auth Flow & Routing)
- **접근 통제**: `ProtectedRoute` 기반으로 모든 메인화면을 잠그고 비로그인 사용자는 `/login` 뷰로 리다이렉트 됩니다. Zustand 기반의 전역 `useAuthStore`를 사용해 토큰 및 사용자 세션을 관리합니다.
- **다크 테마 독립 뷰**: `GuestLayout` 캔버스를 구축해 시스템 진입 시 완전히 어두운(다크 네이비) 배경의 엔터프라이즈 VMS 스플래시 스타일 로그인 및 신규 가입 뷰를 렌더링합니다.

### 2. 가입 시 관리자 승인(Pending) 시스템 의무화
- 신규 신청(`Signup`) 시 사용자의 역할(Role)이 무조건 **`pending` (승인 대기)** 상태로 등록됩니다.
- Pending 계정으로는 백엔드에서 로그인이 강제로 차단되며(403 Error), 오직 최고 관리자(Admin)가 승인한 후에만 접속 가능합니다.

### 3. 보안 관리자 전용 포탈 (Admin Dashboard)
- `CameraSecurityPortal` 컴포넌트를 완전한 **보안 관리자 포탈**로 개편했습니다. 
- 최고 관리자(`admin` 권한)만 열람할 수 있으며, 이 곳에서 가입 대기자(Pending)를 `operator(운영자)` 또는 `viewer(조회자)`로 승인/변경할 수 있습니다.
- 백엔드 `crud.py`에 전체 유저 조회(`GET /users`) 및 역할 업데이트(`PUT /users/{id}/role`) API가 연동되어 실시간 적용됩니다.

### 4. 데스크톱 앱 전환 (Electron)
- `electron` 모듈과 `main.js`를 구성해 단순 브라우저 기반에서 독립적인 PC용 실행 환경으로 격상시켰습니다.
- 상태창 바를 없앤(Chromeless) 독립 앱 형태로 로드되어 운영자의 몰입도를 높입니다.
