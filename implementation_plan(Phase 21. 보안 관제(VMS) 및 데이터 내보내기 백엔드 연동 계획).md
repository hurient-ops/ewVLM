# Phase 21: 보안 관제(VMS) 및 데이터 내보내기 백엔드 연동 계획

**목표**: `PrivacyExportWorkshop`, `MultiChannelSyncPlayback`, `NvrStorageDashboard` 컴포넌트에 대한 영상 반출 로직 및 NVR 상태 조회 기능을 실제 DB와 백그라운드 워커 기반으로 연동합니다.

---

## 1. 신규 데이터베이스 모델 추가 (`models.py`)

### [NEW] `ExportJob` (영상 반출 작업 관리)
프라이버시 영상(안면 모자이크) 및 다중 채널 포렌식 영상 반출 상태를 추적합니다.
- `id` (Integer, PK)
- `job_type` (String, e.g., 'PRIVACY_MASKING', 'FORENSIC_SYNC')
- `target_cameras` (String)
- `status` (String, e.g., 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')
- `download_url` (String, Nullable)
- `requested_at` (DateTime)
- `completed_at` (DateTime, Nullable)

### [NEW] `NvrNode` (NVR 스토리지 노드 상태 관리)
하드코딩되어 있던 NVR 노드 정보를 DB 기반으로 관리합니다.
- `id` (Integer, PK)
- `node_name` (String)
- `ip_address` (String)
- `role` (String, e.g., 'PRIMARY', 'FAILOVER')
- `status` (String, e.g., 'ACTIVE', 'WARNING', 'STANDBY')
- `cpu_usage` (Float)
- `ram_usage` (Float)
- `storage_total_tb` (Float)
- `storage_used_tb` (Float)

---

## 2. 데이터 접근 계층 구현 (`crud.py`)

- `create_export_job(db, job_type, cameras)`: 반출 작업 시작 및 대기 상태 저장
- `update_export_job_status(db, job_id, status, url)`: 반출 완료 시 상태와 다운로드 URL 업데이트
- `get_nvr_nodes(db)`: 등록된 NVR 노드 목록과 현재 리소스(Mock된 실시간 변동값 적용) 조회 
- `seed_nvr_nodes_if_empty(db)`: DB 초기화 시 기본 3개의 NVR 노드 자동 생성

---

## 3. 백엔드 API 연동 (`ewvlm_fastapi_gateway.py`)

- **`POST /api/v1/video/export/masking`** (프라이버시 마스킹 반출)
  - `ExportJob` 생성 후 즉시 `PROCESSING` 상태와 Job ID 반환.
  - `BackgroundTasks`를 통해 가상의 FFmpeg 처리 시간(5초) 대기 후 `COMPLETED` 및 URL(`export_xxx.zip`) 업데이트.
- **`POST /api/v1/records/export`** (다중 채널 반출)
  - `ExportJob` 생성 및 백그라운드 처리 예약.
- **`GET /api/v1/nvr/status`** (NVR 상태 모니터링)
  - DB에서 `NvrNode` 목록을 불러오며, 응답 시 `psutil` 라이브러리를 활용하거나 난수를 주입해 실제 서버의 디스크 용량 변화를 반영한 형태로 반환.

---

## 4. 프론트엔드 연동 (`src/api/client.ts` 및 NVR 화면)

- `client.ts`에 `getNvrStatus()` API 엔드포인트 추가
- `ServerNodeList.tsx`와 `StorageVolumeStatus.tsx`가 더 이상 하드코딩된 데이터를 쓰지 않고, 해당 API의 반환값을 `useEffect`로 불러와 화면을 그리도록 수정

> [!NOTE]
> 위 계획에 동의하시면 **승인(Proceed)** 버튼을 눌러주세요. 즉시 `models.py`, `crud.py`, `ewvlm_fastapi_gateway.py` 수정 및 NVR 화면 연동 작업을 시작하겠습니다!
