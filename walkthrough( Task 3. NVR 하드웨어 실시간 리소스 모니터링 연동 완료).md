# 🛠️ Task 3: NVR 하드웨어 실시간 리소스 모니터링 연동 완료

백엔드 에이전트(Backend Engineer Agent)가 **Task 3: 시스템 헬스체크 API(`/api/v1/system/health`)의 모니터링 데이터 실시간 연동** 작업을 성공적으로 마쳤습니다!

## 🚀 적용된 주요 기능

이전에는 데모를 위해 가상의 트래픽(Gbps) 난수를 발생시키고, 정작 가장 중요한 GPU 사용량은 아예 측정하지 않았습니다. 이제는 백엔드가 실제 호스트 머신의 리소스를 직접 긁어와 대시보드에 뿌려줍니다.

### 1. 실시간 Network Throughput (Gbps) 연산
Python의 `psutil.net_io_counters()`를 활용해 실제 네트워크 인터페이스 카드로 들어오는 누적 수신 바이트(Bytes)를 가져옵니다. 
FastAPI가 호출될 때마다 이전 호출 시간과의 차이(Delta Time)와 바이트 차이를 계산해 **정확한 현재 순간의 초당 기가비트(Gbps)** 대역폭을 연산해 반환합니다.

### 2. 비동기 GPU 모니터링 (`nvidia-smi`)
AI 기반 NVR 시스템의 핵심 리소스인 GPU를 모니터링하기 위해 `asyncio.create_subprocess_exec`를 사용했습니다. 
백그라운드에서 `nvidia-smi --query-gpu=utilization.gpu` 명령어를 논블로킹(Non-blocking)으로 빠르고 가볍게 실행하여 GPU 로드율(%)을 수집합니다.

> [!TIP]
> **무중단 설계 (Fallback):** 만약 `nvidia-smi` 명령어가 없는 운영체제(예: 일반 데스크탑 등)이거나 시스템에 GPU가 빠져 있더라도 백엔드가 다운되지 않습니다! 에러를 조용히 무시하고 GPU 사용률을 `0%`로 안전하게 반환하도록 예외 처리를 튼튼하게 구현했습니다.

## ✅ 수정된 소스코드
- **[백엔드 API 로직]**: [backend/ewvlm_fastapi_gateway.py:L975-L1015](file:///e:/projects/ewVLM/backend/ewvlm_fastapi_gateway.py#L975-L1015) (`get_system_health` 엔드포인트)

이제 프론트엔드의 모니터링 뷰에서 NVR의 CPU, RAM, DISK뿐만 아니라 **실제 네트워크 부하와 GPU 과부하 상태**까지 100% 리얼타임으로 관제할 수 있습니다!
