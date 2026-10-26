# 🗺️ Task 1: GIS 공간 좌표 변환 알고리즘 고도화 결과 보고

GIS & Mathematics Agent가 **Task 1: 카메라 2D 화면 좌표를 3D 공간 위경도로 변환하는 투영 공식 고도화**를 성공적으로 마무리했습니다. 

## 🛠️ 적용된 수학적 알고리즘 (OpenCV Perspective Transformation)

기존에 하드코딩되었던 대략적 비례식(Mock)을 걷어내고, 카메라의 설치 고도, 틸트각, 초점거리를 활용해 실제 물리적인 빛의 경로(Ray)를 추적하는 **Ray-Plane Intersection(광선-평면 교차)** 기법을 적용했습니다.

### 1. 카메라 Intrinsic 행렬 ($K$) 구성
입력된 초점거리(Focal Length)와 1920x1080 해상도를 바탕으로 $3 \times 3$ 카메라 고유 매트릭스 $K$를 생성합니다. 이를 역행렬($K^{-1}$) 취하여 2D 픽셀을 3D 방향 벡터(Ray)로 변환합니다.

### 2. 카메라 Extrinsic 회전 매트릭스 ($R$) 구성
카메라 좌표계와 월드 좌표계(World Coordinate System)의 축을 맞추고, PTZ 카메라가 땅을 바라보는 틸트(Pitch Down) 각도를 $3 \times 3$ 회전 행렬($R_{tilt}$)로 정의합니다. 카메라 좌표계 기준의 Ray를 월드 좌표계의 Ray로 회전 변환합니다.

### 3. 지면(Ground Plane) 교차점 계산
지면을 월드 좌표계의 $Z=0$ 평면으로 가정하고, 카메라의 위치(고도, Altitude) $C = (0, 0, H)$에서 출발한 광선(Ray)이 지면과 만나는 $t$ 값을 매개변수 방정식으로 구합니다.
> $0 = H + t \cdot Ray_Z \implies t = -H / Ray_Z$

교차점의 3D 공간 좌표 $(X, Y)$를 구하여 카메라 수직 하단(원점)으로부터의 **실제 평면 거리(Distance)**와 **좌우 오프셋(Offset X)**을 미터(m) 단위로 정확하게 산출합니다.

## 🧪 단독 스크립트 검증(Test) 결과
수학 모형 검증 스크립트(`scratch/test_calibration.py`)를 통해 논리적 무결성을 검증했습니다.
- 고도 10m, 아래로 45도 기울어진 카메라 중심점(960, 540) 거리 연산 결과: **10.0m** (이론상 $\tan(45^{\circ}) = 1$이므로 $10m / 1 = 10m$와 정확히 일치)
- 화면 하늘 부분을 클릭 시($Ray_Z \ge 0$): **무한대(`inf`) 반환** 정상 동작

## ✅ 완료된 소스코드 위치
- **[백엔드 API 로직]**: [backend/ewvlm_fastapi_gateway.py:L1271-1341](file:///e:/projects/ewVLM/backend/ewvlm_fastapi_gateway.py#L1271-L1341) (`transform_coordinates` 엔드포인트)

이 알고리즘을 통해 향후 화면에 감지된 객체의 정확한 실세계(World) 위치를 파악하고, 여러 카메라 간 객체 추적(Handover)을 할 때 매우 정밀한 GPS 매핑이 가능해졌습니다.
