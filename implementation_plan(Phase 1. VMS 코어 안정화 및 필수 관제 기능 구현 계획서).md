# Phase 1: VMS 코어 안정화 및 필수 관제 기능 구현 계획서

사용자님이 지적하신 카메라 목록/설정의 치명적인 버그(그룹 관리 휘발성, 해상도 누락)를 우선적으로 해결하고, NVR 대시보드와 다채널 동기화 재생의 실제 연동을 진행하는 1단계 구현 계획서입니다.

## User Review Required

> [!WARNING]
> 백엔드 데이터베이스 스키마(SQLite)에 새로운 테이블(`CameraGroup`)이 추가됩니다. 앱이 재시작될 때 마이그레이션(테이블 자동 생성)이 실행되며 기존 카메라 데이터는 보존됩니다.

> [!IMPORTANT]
> 다채널 동기화 재생의 경우, 백엔드에서 실제로 저장된 녹화 파일(.mp4)을 스트리밍해야 합니다. 현재 저장된 더미 영상이 없으므로, 데모용 MP4 파일을 `backend/records` 폴더에 생성하고 연결하는 임시 조치를 포함하겠습니다.

## Proposed Changes

### 백엔드 (Backend - FastAPI & DB)

---

#### [MODIFY] [models.py](file:///e:/projects/ewVLM/backend/models.py)
- `CameraGroup` 데이터베이스 테이블 모델을 신규 추가합니다. (필드: id, name, description)

#### [MODIFY] [crud.py](file:///e:/projects/ewVLM/backend/crud.py)
- `get_groups()`, `create_group()`, `delete_group()` 함수를 추가합니다.
- `update_camera()` 함수에서 `group_id`를 `None`(Null)으로 업데이트할 수 있도록 로직을 수정합니다. (현재는 None일 경우 업데이트가 무시되고 있음)

#### [MODIFY] [ewvlm_fastapi_gateway.py](file:///e:/projects/ewVLM/backend/ewvlm_fastapi_gateway.py)
- 카메라 그룹 관련 REST API 라우터를 추가합니다. (`GET /api/v1/groups`, `POST /api/v1/groups`, `DELETE /api/v1/groups/{group_id}`)
- 하드웨어 리소스 정보를 반환하는 `/api/v1/system/health` 엔드포인트를 추가하여 실제 또는 리얼한 시뮬레이션 지표(CPU/RAM/네트워크)를 JSON으로 서빙합니다.

### 프론트엔드 (Frontend - React & Zustand)

---

#### [MODIFY] [useCameraStore.ts](file:///e:/projects/ewVLM/frontend/src/store/useCameraStore.ts)
- 하드코딩되어 있던 `initialGroups` 배열을 제거하고, `fetchGroups` 함수를 추가하여 백엔드 API로부터 카메라 그룹 목록을 불러옵니다.
- `addGroup`, `deleteGroup` 시 API 통신을 수행하도록 연동합니다.

#### [MODIFY] [CameraSetupConfig.tsx](file:///e:/projects/ewVLM/frontend/src/components/CameraSetupConfig.tsx)
- 프로필 및 스트림 해상도 설정 드롭다운 메뉴에 사용자님이 요청하신 `*SD (704x480)` 해상도 옵션을 추가합니다.

#### [MODIFY] [useSystemHealthStore.ts](file:///e:/projects/ewVLM/frontend/src/store/useSystemHealthStore.ts) (및 연관 대시보드 컴포넌트)
- 정적 데이터(Static Data)로 하드코딩된 서버 상태를, `useEffect` 및 `setInterval`을 이용해 백엔드의 `/api/v1/system/health` 에서 폴링(Polling)하도록 변경합니다.

#### [MODIFY] [MultiChannelSyncPlayback.tsx](file:///e:/projects/ewVLM/frontend/src/components/MultiChannelSyncPlayback.tsx)
- 백엔드 `/api/v1/records` API를 통해 현재 시스템에 기록된 녹화 영상 파일 목록을 받아오고, HTML5 Video 객체를 통해 타임라인 기반 다채널 동기화 재생 로직을 활성화합니다.

## Verification Plan

### Automated Tests
- 없음 (현재 단위 테스트 체계 부재)

### Manual Verification
1. 브라우저를 새로고침해도 **새로 만든 카메라 그룹**과 **카메라의 소속 그룹 설정**이 초기화되지 않고 유지되는지 확인합니다.
2. 미배정 카메라 필터링 시 정확한 대수가 출력되는지 확인합니다.
3. 카메라 해상도 드롭다운에 `704x480`이 정상 노출되는지 확인합니다.
4. NVR 스토리지 대시보드의 CPU, RAM 등 메트릭 수치가 실시간(예: 3초 간격)으로 변동하며 렌더링되는지 확인합니다.
