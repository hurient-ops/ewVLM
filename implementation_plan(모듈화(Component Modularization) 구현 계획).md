# 모듈화(Component Modularization) 구현 계획

사용자님의 지시에 따라, 기존 VMS에도 존재하는 부가 관제 및 시스템 UI(GIS 스마트 맵, NVR 스토리지 대시보드, 시스템 감사 로그) 기능들의 단일(Monolithic) 컴포넌트를 작고 재사용 가능한 하위 모듈로 분리하여 코드의 유지보수성과 가독성을 높이는 아키텍처 리팩토링을 진행하겠습니다.

## ⚠️ User Review Required

현재 각 시스템 UI는 약 150~300줄 이상의 코드가 하나의 파일에 하드코딩된 상태로 존재합니다. 이를 기능별로 잘게 쪼개어 `src/components/` 하위에 각 도메인별 폴더(예: `gis/`, `nvr/`, `audit/`)를 생성하고 그 안에 하위 컴포넌트들을 위치시키는 방식을 제안합니다.

## ❓ Open Questions

- **컴포넌트 디렉토리 구조**: 하위 컴포넌트들을 기존 `src/components/` 루트에 모두 풀어서 넣을까요, 아니면 각 기능별 폴더(`src/components/gis/`, `src/components/nvr/` 등)를 생성하여 깔끔하게 그룹화하는 것이 좋을까요? (기능별 폴더 그룹화를 강력히 권장합니다.)

## 🛠️ Proposed Changes

### 1. GIS 스마트 맵 (`GisSmartMap.tsx`) 분리
거대한 지도 컴포넌트를 다음과 같이 분리합니다.
- `src/components/gis/GisSmartMap.tsx` (컨테이너 역할)
- `src/components/gis/MapContainer.tsx` (카카오맵 API 렌더링 및 마커 관리)
- `src/components/gis/CameraSidebar.tsx` (우측 카메라 목록 및 WebRTC 플레이어 영역)
- `src/components/gis/MapControls.tsx` (검색창, 지도 타입 토글 등 오버레이 컨트롤)

### 2. NVR 스토리지 대시보드 (`NvrStorageDashboard.tsx`) 분리
하드웨어 메트릭과 서버 노드 목록을 그리는 복잡한 대시보드를 분리합니다.
- `src/components/nvr/NvrStorageDashboard.tsx` (컨테이너 역할)
- `src/components/nvr/NvrDashboardHeader.tsx` (타이틀 및 전체 가동 시간)
- `src/components/nvr/ServerNodeList.tsx` (왼쪽 녹화 서버 목록)
- `src/components/nvr/ResourceUtilization.tsx` (우측 상단 CPU, RAM, 네트워크 트래픽 등 리소스 메트릭)
- `src/components/nvr/StorageVolumeStatus.tsx` (우측 하단 물리 디스크 볼륨 상태)

### 3. 시스템 감사 로그 (`SystemAuditLogPortal.tsx`) 분리
감사 로그 포탈을 벤토 그리드(Bento Grid) 섹션별로 분리합니다.
- `src/components/audit/SystemAuditLogPortal.tsx` (컨테이너 역할)
- `src/components/audit/AuditPortalHeader.tsx` (포탈 헤더 및 내보내기 버튼)
- `src/components/audit/LedgerStatusPanel.tsx` (원장 상태 및 암호화 블록 시각화 패널)
- `src/components/audit/AuditLogTable.tsx` (실제 로그 데이터 테이블)

### 4. 기존 파일 정리
- 위 작업이 끝나면 기존에 `src/components/` 최상단에 있던 `GisSmartMap.tsx`, `NvrStorageDashboard.tsx`, `SystemAuditLogPortal.tsx` 파일들은 삭제(또는 라우터에서 새 경로로 연결 후 삭제)합니다.
- `src/App.tsx` (또는 라우팅 파일)에서 참조하는 경로를 신규 디렉토리로 업데이트합니다.

## ✅ Verification Plan

### 수동(Manual) 검증
- [ ] 프론트엔드 라우터(네비게이션)를 클릭하여 `GisSmartMap`, `NvrStorageDashboard`, `SystemAuditLogPortal` 화면이 기존과 동일한 UI/UX로 깨짐 없이 나타나는지 확인합니다.
- [ ] 각 화면의 상태(State)가 모듈 분리 후에도 정상적으로 공유되고 동작하는지(예: 마커 클릭 시 영상 팝업 등) 테스트합니다.
