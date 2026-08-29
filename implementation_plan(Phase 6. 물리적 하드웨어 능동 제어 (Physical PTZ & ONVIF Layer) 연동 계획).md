# Phase 6: 물리적 하드웨어 능동 제어 (Physical PTZ & ONVIF Layer) 연동 계획

이번 Phase에서는 UI에 머물러있던 PTZ 제어와 캘리브레이션 기능들을 백엔드 API와 물리적 모델을 통해 실제 작동하도록 연동합니다.

## User Review Required
> [!NOTE]
> - `onvif-zeep` 모듈이 백엔드에 설치되어 있지 않으면 `onvif_controller.py`가 **Mock 모드**로 동작하게 됩니다. 시스템 상 실제 카메라 연결이 안되더라도 에러 없이 콘솔 로그로 PTZ 명령을 확인할 수 있도록 Mock 모드를 적극 활용할 예정입니다.
> - 공간 캘리브레이션은 복잡한 3D 투영 매트릭스 전체를 다 구현하기보다는, 입력된 `altitude`, `tilt`, `focal_length`를 바탕으로 **간략화된 평면 투영(Ground Plane Projection) 수학 수식**을 적용하여 데모가 정상 동작하는 것을 보여주는 데 초점을 맞추겠습니다. 동의하시나요?

## Proposed Changes

### Backend API
#### [MODIFY] `backend/ewvlm_fastapi_gateway.py`
- 캘리브레이션 기반 좌표 변환 엔드포인트 신설 (`POST /api/v1/cameras/{camera_id}/transform`):
  - 프론트에서 2D 픽셀 좌표 `(x, y)`를 보내면, 저장된 캘리브레이션 파라미터를 역산하여 물리적 지면 거리 `(meter)`를 반환하는 수학적 파이프라인 연동.

### Frontend Components
#### [MODIFY] `frontend/src/api/client.ts`
- `transformCoordinate(cameraId, x, y)` 함수를 추가하여 백엔드 변환 API와 통신.

#### [MODIFY] `frontend/src/components/GeometryCalibrationConsole.tsx`
- 영상 피드 위에 `onClick` 이벤트를 부여하여, 클릭 시 해당 지점의 픽셀 좌표를 백엔드로 전송.
- 응답받은 **실제 물리적 거리(m)**를 오버레이(Tooltip 형태)로 시각화하여, 공간 캘리브레이션이 실제로 작동하고 있음을 증명.

#### [MODIFY] `frontend/src/components/PtzPatrolSchedule.tsx`
- '순찰 시작/중지' 버튼 클릭 시, 상태만 변경하는 것이 아니라 `API.controlPtz`를 호출하여 백엔드에 `PATROL_START` / `PATROL_STOP` 명령을 하달하도록 연동.

#### [MODIFY] `frontend/src/components/PtzTargetHandover.tsx`
- 이미 작성된 `handlePtz` 함수(조그 셔틀 컨트롤)가 API 호출 성공 시 UI 상에 작은 Toast 알림을 띄우거나, 콘솔 로그 외에도 시각적 피드백을 제공하도록 보강.

## Verification Plan
### Manual Verification
1. **PtzPatrolSchedule**: 순찰 시작 버튼 클릭 시 UI가 변경됨과 동시에 백엔드 로그에 `PATROL_START`가 찍히는지 확인.
2. **PtzTargetHandover**: Jog 셔틀 방향키(상, 하, 좌, 우) 클릭 시 백엔드 `onvif_controller.py`의 Mock 로그가 찍히는지 확인.
3. **GeometryCalibrationConsole**: 화면 클릭 시 클릭한 곳에 핑(Ping)이 찍히고 "거리: X.X m" 식의 툴팁이 뜨는지 확인. 고도나 틸트를 변경한 후 클릭하면 거리가 다르게 나오는지 확인.
