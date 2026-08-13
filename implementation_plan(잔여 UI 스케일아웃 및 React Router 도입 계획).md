# Phase 2: 잔여 UI 스케일아웃 및 React Router 도입 계획

본 계획은 기존 상태 기반(state-based) 렌더링 대신 **React Router(react-router-dom)**를 도입하여 완벽한 Single Page Application(SPA) 아키텍처를 구성하고, 25개가 넘는 나머지 다운로드된 HTML 스크린들을 모두 React 컴포넌트(TSX)로 일괄 변환하여 메뉴에 연동하는 작업입니다.

## ⚠️ User Review Required

> [!WARNING]
> **대규모 HTML -> TSX 일괄 변환**
> 25개가 넘는 HTML 파일을 모두 수작업으로 변환하는 것은 비효율적이므로, **파이썬 자동화 스크립트**를 하나 작성하여 일괄 파싱(HTML 주석 처리, `class` -> `className` 치환, 단일 닫기 태그 처리 등) 후 `frontend/src/components`에 자동으로 생성할 계획입니다. 이에 동의하시는지 확인 부탁드립니다.

> [!IMPORTANT]
> **전역 레이아웃 및 네비게이션(Sidebar) 신설**
> 현재 25+개의 화면들을 이동하려면 접근할 수 있는 메뉴가 필요합니다. 
> 좌측이나 상단에 **모든 25개 화면의 링크를 모아둔 테스트용 Sidebar/Menu** 컴포넌트를 레이아웃단에 임시/정규용으로 하나 배치하려고 하는데 괜찮으실까요?

## ❓ Open Questions

- React Router 버전은 최신 안정 버전인 v6(또는 v7)을 사용할 예정인데, 특정 버전을 지정할 필요가 있습니까? (기본적으로 최신 버전을 사용합니다.)
- 이미 작업이 완료된 화면들(Login, Signup, MonitorALiveControl, EventReviewCenter)은 기존 코드를 그대로 유지하고 라우터만 연동하면 될까요?

---

## 🛠️ Proposed Changes (구현 세부 내용)

### 1. 라우터 패키지 설치
- `npm install react-router-dom` 명령을 실행하여 프론트엔드 라우팅 의존성 추가.

### 2. 컴포넌트 일괄 변환 파이썬 스크립트 작성 (자동화)

#### [NEW] [convert_html_to_tsx.py](file:///e:/projects/ewVLM/convert_html_to_tsx.py)
- `frontend/src/` 에 위치한 `*.html` 파일(Login 등 기변환 파일 제외)들을 읽어옵니다.
- 정규식(RegEx) 및 문자열 치환을 활용해 React 문법에 맞게 변환합니다 (`class=` -> `className=`, 빈 태그 `/>` 닫기 등).
- 결과를 `frontend/src/components/[ComponentName].tsx`로 저장합니다.
- (실행 후) 생성된 파일들에 대해 `npm run lint` 혹은 `tsc`로 문법 오류를 검증 및 보정합니다.

### 3. 라우팅 아키텍처 적용 (App.tsx 및 Main.tsx 개편)

#### [NEW] [GlobalLayout.tsx](file:///e:/projects/ewVLM/frontend/src/components/GlobalLayout.tsx)
- 현재 `App.tsx`에 있는 Global Header와 새로 추가할 Sidebar 메뉴를 포함하는 레이아웃 컴포넌트.
- 내부에 `<Outlet />`을 배치하여 라우팅된 하위 화면들이 표시되게 합니다.

#### [MODIFY] [App.tsx](file:///e:/projects/ewVLM/frontend/src/App.tsx)
- 기존 `useAuthStore`의 `currentView` 기반 화면 전환 로직을 걷어냅니다.
- `<BrowserRouter>`, `<Routes>`, `<Route>` 구문으로 교체합니다.
- `Login`, `Signup` 라우트와 나머지 25+개 대시보드 하위 라우트들을 매핑합니다.

#### [MODIFY] [index.css](file:///e:/projects/ewVLM/frontend/src/index.css)
- 필요시 새로 구성되는 레이아웃(Sidebar 등)을 위한 Tailwind 커스텀 유틸리티를 추가합니다.

---

## ✅ Verification Plan (검증 계획)

### Automated Tests (자동 검증)
- 스크립트로 생성된 25+개 컴포넌트가 TypeScript 컴파일(`tsc --noEmit`) 에러 없이 완벽히 빌드되는지 확인합니다.
- `npm run dev` 실행 후 서버가 오류 없이 구동되는지 확인합니다.

### Manual Verification (수동 검증)
- `http://localhost:5174/` 로 접속하여 로그인 후 대시보드 화면이 나오는지 확인합니다.
- 새롭게 추가된 네비게이션 메뉴를 클릭하여 25개 화면 간 이동이 새로고침 없이(SPA 방식) 즉시 즉시 이뤄지는지 시각적으로 확인합니다.
