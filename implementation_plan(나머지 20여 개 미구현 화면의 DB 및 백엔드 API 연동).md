# [목표] 나머지 20여 개 미구현 화면의 DB 및 백엔드 API 연동

기존 Phase 20, 21에서 완료한 모델 파이프라인, 비디오 반출, NVR, 보안 관리자 화면 외에도 프론트엔드(`frontend/src/components/` 등)에는 20여 개의 화면들이 여전히 Mock 데이터(가짜 데이터)에 의존하고 있습니다.

이 화면들을 논리적인 도메인 그룹(Cluster)으로 묶어 순차적으로 실제 데이터베이스(SQLite) 및 FastAPI 백엔드와 연동하는 작업을 진행하고자 합니다.

## User Review Required

> [!WARNING]  
> 남은 화면의 수가 20개가 넘어 한 번에 모든 작업을 수행하기엔 범위가 너무 큽니다. 따라서 논리적으로 연관된 **3개의 클러스터(Cluster)** 로 나누어 순차적으로 작업을 진행할 것을 제안합니다. 아래의 **[Cluster 1]** 부터 먼저 시작하는 것에 동의하시는지 검토 부탁드립니다.

## Open Questions

> [!IMPORTANT]
> 1. 모든 화면을 100% 실데이터로 완벽히 연동할지, 아니면 핵심 컴포넌트(예: 카메라 등록, PTZ 설정, 토폴로지 등) 위주로 집중할지 의견이 있으신가요? (본 계획은 핵심 화면 위주로 완전 연동을 목표로 합니다.)

## Proposed Changes

### [Cluster 1] 카메라 디바이스 및 PTZ 패트롤 관리 (최우선)
가장 기본이 되는 카메라 장비 인벤토리 관리와 PTZ(Pan-Tilt-Zoom) 스케줄링을 DB 기반으로 변경합니다.
- **연동 대상 프론트엔드 컴포넌트**: `CameraListManager.tsx`, `CameraSetupConfig.tsx`, `PtzTourScheduler.tsx`, `PtzPatrolSchedule.tsx`
- **수행 내용**:
  - `models.py`에 `Camera` 및 `PtzSchedule` 모델 고도화 또는 신규 추가
  - 프론트엔드 목록에서 하드코딩 배열을 제거하고 `API.getCameras()` 등과 연결하여 CRUD 활성화

---

### [Cluster 2] 비디오 플레이백 및 이벤트 워크스페이스
단순히 영상을 띄워놓는 것에 그치지 않고, 다중 채널 재생 및 알람 관제를 서버에서 제어하도록 수정합니다.
- **연동 대상 프론트엔드 컴포넌트**: `MultiChannelSyncPlayback.tsx`, `AlertCenterDashboard.tsx`, `DisasterVirtualWarRoom.tsx`, `EventReviewCenter.tsx`
- **수행 내용**:
  - `models.py`에 `Event` (알람) 모델을 고도화하여 실제 워크룸(War Room)과 이벤트 리뷰 센터의 피드 연동
  - `API.getEvents()`를 통해 실시간/과거 이벤트 타임라인 시각화

---

### [Cluster 3] AIOps, 엣지 노드 및 네트워크 토폴로지
고급 시스템 관제 기능들을 연동합니다.
- **연동 대상 프론트엔드 컴포넌트**: `EdgeAiOrchestration.tsx`, `HardwareSelfHealingShell.tsx`, `NetworkTopologyMonitor.tsx`, `MassDeviceConfigClone.tsx`
- **수행 내용**:
  - `EdgeNode` 상태 및 `Topology` 맵 구성 데이터를 백엔드에서 제공(`GET /api/v1/infra/topology`)
  - AIOps 자가 치유(`heal_hardware_node`) 프로세스의 비동기 처리 추적 (DB 로깅)

## Verification Plan

### Automated Tests
- 각 클러스터 작업 완료 시 `python -c "import requests; ..."` 스크립트를 통해 신규 생성된/수정된 API 엔드포인트의 `200 OK` 및 반환 스키마 무결성 검증

### Manual Verification
- `npm run dev` (프론트엔드) 상태에서 각각의 화면에 진입하여:
  - 브라우저 Console 에러 여부 확인 (React 크래시 방지)
  - 등록/수정/삭제 등 액션 시 UI가 정상적으로 상태 업데이트(State Update)를 반영하는지 테스트
