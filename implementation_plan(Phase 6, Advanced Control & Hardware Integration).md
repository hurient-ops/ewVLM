# Phase 6: Advanced Control & Hardware Integration

이 단계에서는 PTZ(Pan-Tilt-Zoom) 카메라 제어, 3차원 기하학 AI 캘리브레이션, 그리고 하드웨어 자산 및 리포팅 기능의 백엔드 연동을 구현합니다.

## User Review Required
> [!IMPORTANT]
> 백엔드의 경우 실제 카메라 하드웨어가 연결되어 있지 않으므로, PTZ 조작 및 캘리브레이션 값 저장은 Mocking(DB 저장 또는 In-memory 저장) 형태로 응답하도록 구현합니다. 실제 환경에서 사용하는 프로토콜(ONVIF 등)과의 연동은 제외되고 REST API 인터페이스만 구현되는 것에 동의하시나요?

## Proposed Changes

---

### Backend Components

#### [MODIFY] [models.py](file:///e:/projects/ewVLM/backend/models.py)
- **추가**: `CalibrationData` 및 `PTZPreset` 등 카메라 부가 설정을 저장할 수 있는 DB 테이블 혹은 Camera 테이블의 확장 컬럼 추가.

#### [MODIFY] [crud.py](file:///e:/projects/ewVLM/backend/crud.py)
- **추가**: PTZ 조작 로그 기록 및 캘리브레이션 정보 CRUD 로직 추가.

#### [MODIFY] [ewvlm_fastapi_gateway.py](file:///e:/projects/ewVLM/backend/ewvlm_fastapi_gateway.py)
- **추가**: `POST /api/v1/cameras/{camera_id}/ptz` - 수동/자동 PTZ 제어 명령 엔드포인트.
- **추가**: `POST /api/v1/cameras/{camera_id}/calibration` - 기하학 보정 및 가상 펜스 설정 저장 엔드포인트.

---

### Frontend Components

#### [MODIFY] [client.ts](file:///e:/projects/ewVLM/frontend/src/api/client.ts)
- **추가**: `ptzControl(cameraId, pan, tilt, zoom)` 및 `saveCalibration(cameraId, data)` 등 하드웨어 연동 API 함수 작성.

#### [MODIFY] [PtzTargetHandover.tsx](file:///e:/projects/ewVLM/frontend/src/components/PtzTargetHandover.tsx) / [MonitorALiveControl.tsx](file:///e:/projects/ewVLM/frontend/src/components/MonitorALiveControl.tsx)
- **기능 연동**: UI 상의 조그셔틀(Jog Shuttle) 버튼 및 방향 버튼 클릭 시 백엔드 PTZ API를 호출하도록 이벤트 핸들러 연동.
- **피드백 추가**: 성공/실패 시 화면에 알림 토스트 또는 상태 표시 적용.

#### [MODIFY] [GeometryCalibrationConsole.tsx](file:///e:/projects/ewVLM/frontend/src/components/GeometryCalibrationConsole.tsx)
- **기능 연동**: '보정 적용' 버튼 클릭 시 폼에 입력된 고도(Z축), 틸트 각도(Pitch), 초점 거리 값을 백엔드 API로 전송.

## Verification Plan

### Automated Tests
- 백엔드 재시작 후 `curl` 또는 Swagger UI를 이용해 PTZ/캘리브레이션 API 정상 동작 여부 확인.

### Manual Verification
- 브라우저 서브 에이전트를 사용하여 다음을 테스트:
  1. `MonitorALiveControl` 또는 `PtzTargetHandover` 페이지에서 PTZ 조그셔틀 방향 버튼 클릭 (API 호출 발생 확인).
  2. `GeometryCalibrationConsole` 페이지에서 파라미터 값 변경 후 '보정 적용' 버튼 클릭 (저장 성공 메시지 확인).
