# [백엔드 에이전트] Task 3: NVR 하드웨어 실시간 리소스 모니터링 연동 계획

현재 `/api/v1/system/health` 엔드포인트는 `psutil`을 사용해 CPU와 RAM을 가져오고 있으나, **네트워크 트래픽(NET Rx)은 하드코딩(Mock)되어 있고 GPU 사용량은 아예 누락**되어 있습니다. NVR(Network Video Recorder) 특성상 VLM 모델 추론과 영상 스트리밍 처리로 인해 GPU 및 네트워크 상태 모니터링이 필수적입니다.

이에 따라 백엔드 코드를 리팩토링하여 **실제 GPU 및 네트워크 대역폭(Gbps) 데이터**를 가져오는 파이프라인을 구축합니다.

## Proposed Changes

### 백엔드 (FastAPI)

#### [MODIFY] `backend/ewvlm_fastapi_gateway.py`
기존 `get_system_health` 함수(`GET /api/v1/system/health`)를 업데이트합니다.

1. **실제 네트워크 스루풋(Gbps) 계산 (psutil 활용)**:
   - `psutil.net_io_counters()`를 활용해 실제 시스템의 네트워크 Rx(수신) 바이트를 가져옵니다.
   - 전역 변수(상태 캐시)를 활용하여 이전 API 호출 시점과의 시간 차이(Delta) 및 바이트 차이를 계산해 **현재 순간의 Gbps(기가비트 초당 속도)**로 환산합니다.

2. **GPU 리소스 모니터링 추가 (nvidia-smi 연동)**:
   - Python `subprocess` 모듈을 이용해 `nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits` 명령어를 비동기적으로 실행합니다.
   - 윈도우 환경에서 `nvidia-smi`를 찾을 수 없거나 NVIDIA GPU가 없는 시스템(Fallback)의 경우, 프로그램이 뻗지 않고 Mock 데이터(0% 또는 가상의 수치)를 반환하도록 `try-except` 예외처리를 완벽하게 구성합니다.
   - 반환되는 JSON 메트릭 배열에 GPU 항목(`{"id": "gpu", "label": "GPU", "value": gpu_usage, "unit": "%"}`)을 추가합니다.

## Verification Plan

### Automated Tests
- Python 인터프리터에서 수정된 시스템 헬스 함수를 단독으로 호출하여 반환된 배열에 CPU, RAM, DISK 외에 GPU와 실제 네트워크 사용량이 잘 매핑되는지 검증합니다.

### Manual Verification
- 클라이언트(프론트엔드)에서 주기적으로 대시보드의 NVR Resource 영역(Gauge/Progress Bar)이 새로고침될 때 실제 워크스테이션의 성능 메트릭과 일치하는지 육안으로 확인합니다.
