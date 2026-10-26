# [GIS 에이전트] Task 1: 공간 좌표 변환 공식 고도화 구현 계획

기존의 단순 비례식(Mock)으로 작성되었던 2D-3D 공간 매핑 공식을 수학적으로 엄밀한 **OpenCV 기반의 원근 투영(Perspective Projection) 및 평면 교차(Ray-Plane Intersection) 알고리즘**으로 완전히 대체합니다.

## User Review Required

> [!IMPORTANT]
> 본 알고리즘은 **지면이 평탄하다(Ground Plane = 0)**는 가정을 기반으로 동작합니다. 카메라가 바라보는 지형에 큰 고도 차이(경사)가 있을 경우 오차가 발생할 수 있습니다. 
> 또한 입력되는 `focal_length` 값이 이미지 픽셀 단위(Pixel Focal Length)라고 가정하고 식을 구성합니다. (만약 mm 단위일 경우 센서 사이즈를 알아야 하므로 추가 변환 계수가 필요할 수 있습니다).

## Open Questions

> [!WARNING]
> 현재 UI에서 전달되는 `tilt` 값이 지면을 향해 아래로 숙일 때 음수(-)인가요, 양수(+)인가요? 
> 계획된 수식에서는 **0도가 수평(Horizon)**, **양수(Positive)** 각도가 아래(Ground)를 향하는 것으로 기준(Pitch Angle)을 잡고 코드를 작성할 예정입니다. 혹시 반대라면 승인하실 때 알려주세요!

## Proposed Changes

### 백엔드 (FastAPI)

#### [MODIFY] `backend/ewvlm_fastapi_gateway.py`
기존 `transform_coordinates` 함수의 비례식 하드코딩 로직을 삭제하고 다음의 수학적 알고리즘(OpenCV/Numpy 활용)을 도입합니다.

1. **Intrinsic Matrix (내부 파라미터 $K$) 생성**: 
   - $f_x, f_y$ = `request.focal_length`
   - $c_x, c_y$ = 1920/2, 1080/2 (이미지 중앙점)
2. **Rotation Matrix (회전 변환 $R$) 생성**:
   - `request.tilt` 각도(Pitch)를 라디안으로 변환하여 3x3 회전 행렬을 생성. 카메라가 틸트다운 하는 것을 World 좌표계 기준 $X$축 회전으로 매핑.
3. **Ray-Plane Intersection (광선-평면 교차)**:
   - 2D 픽셀 좌표 $(u, v)$에 대해 역투영(Inverse Projection)을 수행하여 카메라에서 지면으로 향하는 3D 광선 벡터(Ray Vector) $D = R^{-1} K^{-1} \begin{bmatrix} u \\ v \\ 1 \end{bmatrix}$ 계산.
   - 카메라의 높이 `request.altitude` (World $Z$축)를 기준으로, 광선이 지면($Z=0$)과 교차하는 3D 점 $(X, Y, 0)$ 산출.
4. **결과 산출**:
   - 카메라 수직 아래(원점)로부터 타겟 객체까지의 실제 평면 거리 $d = \sqrt{X^2 + Y^2}$ 반환.

## Verification Plan

### Automated Tests
- `pytest` 환경은 구축되어 있지 않으므로, 더미 데이터를 넣고 단위 수학 검증 스크립트를 `scratch/` 에 생성하여 계산값이 상식적인 기하학 결과와 일치하는지 단독 테스트 진행.

### Manual Verification
- NVR UI 화면(Frontend)의 영상 캔버스에서 특정 객체(Bounding Box)를 클릭 시, 화면에 표시되는 거리(m) 값이 카메라 높이와 틸트각을 고려했을 때 오차 없이 실제 거리와 유사하게 나오는지 사용자가 육안으로 확인.
