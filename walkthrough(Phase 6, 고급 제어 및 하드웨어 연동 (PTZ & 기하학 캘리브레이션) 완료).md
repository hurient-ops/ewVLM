# Phase 6: 고급 제어 및 하드웨어 연동 (PTZ & 기하학 캘리브레이션) 완료

수동 PTZ 제어 및 3차원 공간 캘리브레이션 파라미터를 저장할 수 있는 하드웨어 제어 인터페이스 연동 작업을 완료하였습니다.

## 주요 변경 사항

### 1. 백엔드 모델 및 API 추가
- `models.py`: PTZ 제어 이력을 남기기 위한 `PTZLog` 모델과 공간 보정값을 저장하는 `CameraCalibration` 모델을 추가했습니다.
- `crud.py`: 해당 모델에 대한 데이터 등록 및 조회 로직(Mock Data Storage 역할)을 구현했습니다.
- `ewvlm_fastapi_gateway.py`:
  - `POST /api/v1/cameras/{camera_id}/ptz`: 카메라 팬/틸트/줌 명령을 수신하여 `PTZLog` 및 `AuditLog` 에 기록합니다.
  - `POST /api/v1/cameras/{camera_id}/calibration`: 3차원 기하학 보정 정보를 수신하여 저장하며, 이 또한 무결성 확인을 위한 AuditLog 로 기록합니다.

### 2. 프론트엔드 연동
- **API 클라이언트 (`client.ts`)**: 백엔드의 PTZ 및 Calibration 엔드포인트와 통신할 수 있는 API 메서드(`controlPtz`, `saveCalibration`)를 구현했습니다.
- **PTZ 제어 화면 (`PtzTargetHandover.tsx`)**:
  - 하단의 조그 셔틀(Jog Shuttle)의 방향 버튼 및 줌(IN/OUT) 버튼 클릭 시 이벤트 핸들러가 작동하여 `controlPtz` API를 호출합니다.
- **캘리브레이션 뷰 (`GeometryCalibrationConsole.tsx`)**:
  - 3차원 고도, 틸트 각도, 초점 거리 입력 필드를 React의 `useState` 와 양방향 바인딩 시켰습니다.
  - "보정 적용" 버튼 클릭 시 입력된 값을 읽어들여 백엔드로 저장 요청을 보냅니다.

## 검증 내역
- 백엔드 서버가 재시작되어 새 데이터베이스 스키마와 엔드포인트가 반영되었습니다.
- 테스트용 스크립트 실행을 통해 `POST` 요청이 성공적으로 처리되고 DB 모델에 등록되는 것을 확인하였습니다.

모든 Phase 요구사항에 대한 핵심 개발이 거의 마무리되었습니다. 추가로 진행하고 싶은 특정 컴포넌트나 마무리 패키징(빌드) 관련 작업이 있다면 말씀해 주세요!
