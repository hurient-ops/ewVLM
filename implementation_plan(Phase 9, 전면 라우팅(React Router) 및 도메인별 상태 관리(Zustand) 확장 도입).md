# Phase 9: 전면 라우팅(React Router) 및 도메인별 상태 관리(Zustand) 확장 도입

현재 프론트엔드의 화면 전환은 `App.tsx` 내에서 단순히 문자열 상태(`currentView`)에 의존하여 렌더링을 갈아끼우는 단일 컴포넌트 스위칭 방식으로 구현되어 있습니다. 
플랫폼이 향후 28개 도메인(GIS, NVR 시스템 관리, VSS 검색 등)으로 확장됨에 따라 URL 기반의 독립적인 접근, 브라우저 뒤로가기 지원, 그리고 모듈화된 상태 관리가 필수적입니다.

## User Review Required

> [!IMPORTANT]
> 본 작업은 기존 `App.tsx`와 `Sidebar.tsx`의 렌더링 코어 로직을 전면 개편하는 구조적(Architectural) 변경 작업입니다.
> 화면 간의 전환 방식이 URL 기반(예: `localhost:5173/monitor/live`)으로 완전히 교체되므로, 구현 직후 기존에 동작하던 화면 이동이 끊김없이 부드럽게 이어지는지 테스트가 필요합니다.

## Open Questions

> [!NOTE]
> 회원가입 화면(`/auth/signup`) 작업도 함께 구성하여 로그인 페이지와 분리할 예정입니다. 기존 상태 유지에 동의하시나요?

## Proposed Changes

---

### 라우터 코어 및 레이아웃 도입

#### [MODIFY] `package.json`
- `react-router-dom` v6 설치 및 의존성 추가 (이미 있다면 버전 확인)

#### [NEW] `frontend/src/layouts/MainLayout.tsx`
- 좌측 **내비게이션 사이드바**와 상단 **상태 바(Header)**를 모든 하위 라우트에서 공통으로 감싸주는 레이아웃 셸(Shell) 컴포넌트를 신규 작성합니다.
- `react-router-dom`의 `<Outlet />`을 중앙 캔버스 영역에 배치합니다.

#### [MODIFY] `frontend/src/App.tsx`
- 기존 `currentView` 기반 `switch-case` 구문을 전면 삭제합니다.
- `<BrowserRouter>`와 `<Routes>`를 도입하여 다음과 같은 라우팅 구조를 수립합니다.
  - `/` -> `Login` (기본 로그인 화면)
  - `/auth/signup` -> `Signup` (회원가입 화면)
  - `/*` -> `MainLayout` 아래 하위 라우트 연결
    - `/monitor/live` -> `MonitorALiveControl`
    - `/monitor/vlm` -> `MonitorBLayout` (VLM 분석)
    - `/vss/search` -> `VssSemanticSearch`
    - `/gis/map` -> `GisSmartMap`
    - `/system/audit` -> `SystemAuditLogPortal`

#### [MODIFY] `frontend/src/components/Sidebar.tsx`
- 메뉴 클릭 시 기존 `useStore.setCurrentView()` 호출을 삭제하고, React Router의 `useNavigate` 훅을 사용한 URL 이동 방식으로 교체합니다.
- 현재 활성화된 URL 경로(`useLocation`)를 인식하여 좌측 메뉴바의 **활성(Active) 네온 스타일**이 정확히 점등되도록 수정합니다.

---

### 도메인별 상태 관리 스토어 분리 (Zustand)

#### [NEW] `frontend/src/store/usePtzStore.ts`
- 하드웨어 PTZ 제어에 필요한 8축 방향, 줌 상태, 자율 순찰(Tour) 프리셋 매핑 상태를 전담하는 상태 스토어를 신규 설계합니다.

#### [NEW] `frontend/src/store/useGisStore.ts`
- `GisSmartMap` 컴포넌트에서 지도상의 카메라 마커 좌표(Lat/Lng), CCTV 방향 및 화각 렌더링, 팝업 상태를 총괄 제어하는 스토어를 설계합니다.

#### [NEW] `frontend/src/store/useSystemHealthStore.ts`
- NVR 디스크 용량, CPU/메모리 부하, 네트워크(PoE) 트래픽 상태를 모니터링하기 위한 헬스체크 데이터를 보관하는 스토어를 분리합니다.

## Verification Plan

### Automated / Manual Verification
- `npm run dev` 실행 후 `http://localhost:5173/monitor/live` 등 URL을 통해 개별 화면에 직접 접속(Direct Access)이 가능한지 확인합니다.
- 좌측 사이드바 클릭 시 화면 깜빡임(Full Reload) 없이 즉각적으로 중앙 캔버스가 교체되는지(SPA 라우팅) 확인합니다.
- 새로고침 시에도 현재 보고 있던 화면 및 URL이 유지되는지 검증합니다.
