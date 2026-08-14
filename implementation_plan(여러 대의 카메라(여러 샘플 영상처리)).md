# [Goal Description]

현재 단일 샘플 비디오(sample_video.mp4)로만 작동하는 `fast_loop.py`와 더미(Dummy) WebRTC 플레이어를 전면 개편하여, **여러 대의 카메라(여러 샘플 영상)를 동시에 스트리밍하고 각각에 대해 개별적인 YOLO 객체 인식 및 Llama 3.2 VLM 분석이 가능하도록 실제 구동 가능한 멀티 채널 AI 파이프라인**을 구축합니다.

## User Review Required

## User Review Required

> [!WARNING]
> 파이썬에서 여러 개의 영상을 동시에 디코딩하고 YOLO 모델을 각각 돌리는 것은 CPU/GPU 자원을 매우 크게 소모합니다.
> **Q. 영상은 최대 몇 개까지 처리할 수 있나요?**
> A. 현재 개발용 PC의 사양(CPU/GPU)에 따라 다릅니다. 순수 CPU로 돌릴 경우 4채널 이상부터는 심한 지연(렉)이 발생할 수 있습니다. GPU(CUDA)가 설정되어 있다면 8~16채널도 무난합니다. 이번 시뮬레이션에서는 UI와 동일하게 **최대 4채널**을 기본 세팅으로 구성하겠습니다.

> [!TIP]
> **Q. PC 리소스에 맞게 프레임을 그때그때 조정할 수 있나요?**
> A. 네, 가능합니다! `fast_loop.py` 내부에 `TARGET_FPS` 환경 변수(또는 설정값)를 추가하여, PC가 힘들어하면 초당 2프레임으로 낮추고, 여유가 있으면 초당 15프레임으로 올릴 수 있도록 **동적 프레임 조절 기능**을 계획에 추가 반영했습니다. (필요 시 API를 통해 실행 중에도 조절할 수 있도록 설계하겠습니다)

## Open Questions

없습니다. 승인해 주시면 즉시 개발을 시작합니다.

## Proposed Changes

### Backend

#### [MODIFY] `e:\projects\ewVLM\backend\fast_loop.py`
- 단일 영상 처리 로직을 멀티 영상 비동기(Async) 처리 로직으로 전면 재작성합니다.
- 카메라 ID별로 딕셔너리(`latest_frames`)를 만들어 최신 프레임을 각각 저장합니다.
- `http://localhost:8890/stream/{camera_id}` 경로를 생성하여, 프론트엔드가 특정 카메라의 실시간 영상을 가져갈 수 있도록 MJPEG 스트림 라우터를 구축합니다.
- YOLO 탐지 시, 하드코딩된 'CAM-01'이 아닌 실제 탐지된 카메라의 ID(`CAM-01`, `CAM-02` 등)를 API Gateway로 전송하여 VLM 분석이 특정 카메라별로 정확히 매칭되도록 합니다.

### Frontend

#### [MODIFY] `e:\projects\ewVLM\frontend\src\components\WebRTCPlayer.tsx`
- 기존의 작동하지 않는 가짜 WebRTC 연결 코드를 제거합니다.
- 백엔드(`fast_loop.py`)가 쏴주는 실시간 AI 분석 영상(YOLO 바운딩 박스가 그려진 MJPEG)을 화면에 직접 띄우기 위해 `<img src="http://localhost:8890/stream/{cameraId}" />` 태그 기반의 실시간 플레이어로 전면 개편합니다.

#### [MODIFY] `e:\projects\ewVLM\frontend\src\components\MonitorALiveControl.tsx`
- 드래그 앤 드롭 시, `WebRTCPlayer`에 정확한 `camera_id` (예: `cam-01`)를 전달하도록 props 체계를 수정합니다.
- MJPEG 플레이어 전환에 맞게 UI 레이아웃의 에러 처리 부분을 최적화합니다.

## Verification Plan

### Manual Verification
1. `fast_loop.py` 백그라운드 재실행
2. 프론트엔드 모니터 관제 화면에서 좌측 자산 탐색기의 카메라 4대를 우측 빈 슬롯으로 드래그 앤 드롭
3. 4개의 슬롯에서 동시에 영상이 재생되며 YOLO 바운딩 박스가 각기 그려지는지 육안 확인
4. 특정 채널에서 객체가 탐지되었을 때, VLM 분석 이벤트 로그가 해당 채널 번호로 정확하게 분리되어 뜨는지 확인
