# Phase 20 & 21: 백엔드 DB 연동 완료 보고서

## [Phase 20] MLOps 및 AI 모델 파이프라인
지정해주신 첫 번째 도메인인 **[MLOps 및 AI 모델 파이프라인]** 영역의 가짜 데이터(Mocking) 구조를 제거하고 실제 데이터베이스와 연동하는 작업을 성공적으로 완료했습니다! 🎉

### 주요 변경 사항
1. **데이터베이스 모델 추가 (`models.py`)**
   - `MLOpsJob`, `PromptDeployment`, `SOPRule` 추가
2. **백엔드 로직 (`ewvlm_fastapi_gateway.py` / `crud.py`)**
   - 자연어 룰 매핑 및 LORA 파인튜닝 비동기 워커 연결 완료

---

## [Phase 21] 보안 관제(VMS) 및 데이터 내보내기 
두 번째 도메인인 **[보안 관제(VMS) 및 데이터 내보내기]** 영역 역시 Mock 데이터를 걷어내고 백엔드 API 연동을 성공적으로 완수했습니다. 🔒

### 주요 변경 사항
1. **데이터베이스 모델 추가 (`models.py`)**
   - **`ExportJob`**: 프라이버시 안면 마스킹 반출, 다중 채널 포렌식 영상 반출 등의 비동기 작업 상태(`PENDING` -> `PROCESSING` -> `COMPLETED`)를 영구 저장합니다.
   - **`NvrNode`**: 하드코딩되어 있던 NVR(녹화 서버)의 엣지 노드 정보를 DB에 저장하여 다중화(Primary/Failover) 관리를 지원합니다.

2. **반출 파이프라인 연동 (`ewvlm_fastapi_gateway.py`)**
   - `POST /api/v1/video/export/masking` 및 `POST /api/v1/records/export` 엔드포인트 호출 시, 단순히 시간만 지연시키던 Mock 로직을 제거하고 **`FastAPI BackgroundTasks`**를 활용하여 백그라운드 렌더링 워커 큐를 통과하도록 구현했습니다.

3. **NVR 상태 실시간 모니터링 (`NvrStorageDashboard`)**
   - 기존에 프론트엔드에 하드코딩되었던 디스크 볼륨 정보(예: `VOLUME-A`, `VOLUME-B`, HDD 0~3)를 새로운 백엔드 API **`GET /api/v1/nvr/status`**를 폴링(Polling)하도록 교체했습니다.
   - 현재 화면에서는 실제 DB에서 가져온 NVR 상태(`ACTIVE`, `WARNING`, `STANDBY`)에 따라 CPU/RAM 부하와 스토리지 용량이 실시간 변동값을 반영해 표시됩니다.

## 검증 결과
- 포렌식 영상 반출 API(`curl(Python)`) 호출 시 성공적으로 DB에 `ExportJob`이 스케줄링(Job ID 1 발급)되는 것을 확인했습니다.
- NVR 대시보드 컴포넌트가 백엔드의 `/api/v1/nvr/status`를 호출하여 3개의 노드(Primary 2대, Failover 1대) 상태를 정상적으로 수신 및 렌더링하는 것을 확인했습니다.

---

> [!TIP]
> 이제 시스템의 영상 반출 이력과 NVR 상태 관리가 모두 데이터베이스 기반으로 작동하여 시스템 재시작 후에도 추적이 가능합니다!
>
> 다음으로는 세 번째 도메인인 **[사용자 권한 및 감사 로그 (Auth Matrix / Audit Log)]** 영역의 실제 구현을 이어나갈까요?
