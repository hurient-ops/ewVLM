# 2차 개선 계획: 객체 추적(ByteTrack) 및 VLM 워커 큐(Backpressure) 도입

본 계획서는 사전에 수립된 VLM 분석 파이프라인 취약점 진단 보고서의 3번, 4번 항목을 해결하기 위한 2차 개선 작업입니다.

## User Review Required

> [!IMPORTANT]
> **설계 결정 사항 확인 요청**
> 
> 1. **객체 추적기 선택**: Ultralytics YOLO에 내장된 강력하고 가벼운 `ByteTrack`(`model.track(persist=True)`)을 사용하려고 합니다. 코드가 단순해지고 CPU 부하가 적습니다.
> 2. **워커 큐(Worker Queue) 정책**: VLM 엔진(Ollama/LM Studio)의 VRAM 폭발을 방지하기 위해 API Gateway(`ewvlm_fastapi_gateway.py`)에 최대 크기가 50인 `asyncio.Queue`를 도입합니다. 큐가 꽉 차면 후속 VLM 에스컬레이션은 무시(Drop)하고 `429 Too Many Requests`를 반환하도록 설계할 예정입니다. 
> 
> 이 방안으로 진행해도 괜찮은지 확인 부탁드립니다.

## Proposed Changes

### [e:\projects\ewVLM\backend\fast_loop.py]

- **[MODIFY]** 객체 탐지 루프(`camera_loop`) 수정
  - 기존 `model(frame)` 호출을 `model.track(frame, persist=True)`로 변경하여 객체 추적 활성화.
  - 객체의 고유 ID(`track_id`)를 활용하여 동일한 사람/차량이 계속 화면에 머물 때 발생하는 **중복 에스컬레이션 방지 로직** 구현. (카메라별 단순 10초 쿨다운을 객체 ID 단위의 쿨다운으로 정밀화)

### [e:\projects\ewVLM\backend\ewvlm_fastapi_gateway.py]

- **[MODIFY]** `vlm_worker` 태스크 및 Queue 도입
  - 전역 `vlm_task_queue = asyncio.Queue(maxsize=50)` 생성.
  - FastAPI 시작 시점(`@app.on_event("startup")`)에 백그라운드에서 무한 루프를 도는 `vlm_worker_loop` 코루틴 실행.
  - `trigger_escalation` API는 기존의 `background_tasks.add_task(...)` 대신 `vlm_task_queue.put_nowait(req)`를 호출. 큐가 가득 찼다면 `HTTP 429` 에러 반환(Backpressure 제어).
  - 워커는 큐에서 순차적으로 하나씩 꺼내어 기존의 `execute_vlm_inference_pipeline`을 실행함으로써, 다수의 카메라에서 동시다발적 트리거가 발생해도 **VLM 추론은 철저히 직렬화(순차 처리)**되어 시스템 다운을 완벽히 방지함.

## Verification Plan

### Manual Verification
1. `fast_loop.py` 실행 후, 사람이 카메라 앞을 계속 서성일 때 중복 에스컬레이션이 일어나지 않고 ID 기반으로 통제되는지 확인.
2. 여러 대의 카메라(또는 루프)에서 강제로 다발성 이벤트를 쏴서 API Gateway의 Queue에 쌓인 뒤, VLM 추론이 터지지 않고 순서대로 하나씩 처리되는지 백엔드 로그 확인.
