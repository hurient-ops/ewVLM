# Phase 2: 데이터베이스(DB) 연동 및 영구 저장 파이프라인 구축

본 계획은 ewVLM 관제 플랫폼의 Phase 2에 해당하는 **실제 데이터베이스 연동 작업**입니다. 현재 임시(메모리)로 관리되는 이벤트 로그를 영구 저장하고, 프론트엔드 구동 시 과거의 이벤트 이력을 모두 불러올 수 있도록 아키텍처를 고도화합니다.

## ⚠️ User Review Required (중요 확인 사항)

> [!WARNING]
> **데이터베이스 엔진 선택 및 환경 셋팅**
> 원본 명세서에는 `PostgreSQL` 및 `pgvector`(시맨틱 검색용) 도입이 명시되어 있습니다. 
> 
> 현재 사용 중이신 Windows 로컬 PC에 **PostgreSQL(+pgvector 익스텐션)**이 이미 설치되어 구동 중이신가요? 
> 만약 설치되어 있지 않다면, **1) Docker를 이용해 즉시 구성**하거나, **2) 일단 개발(테스트) 편의를 위해 로컬 파일 기반인 SQLite로 1차 구축** 후 나중에 Postgres로 마이그레이션하는 방법 중 하나를 선택해 주셔야 합니다.

## ❓ Open Questions

- 데이터베이스 접속 정보(DB URL, 비밀번호 등)를 어떻게 설정할지 환경 변수(`.env`) 셋팅 방식을 승인해 주시겠습니까?
- `pgvector`를 활용한 자연어 검색(VSS) 기능까지 이번 Phase 2에서 한 번에 구현할까요? 아니면 우선 **일반 이벤트 저장/불러오기**를 완성한 후 시맨틱 검색을 별도의 Phase로 분리할까요? (분리를 권장합니다.)

---

## 🛠️ Proposed Changes (구현 세부 내용)

### 1. 백엔드 데이터베이스 ORM 계층 신설

#### [NEW] [database.py](file:///e:/projects/ewVLM/backend/database.py)
- **SQLAlchemy (Async)**를 이용한 비동기 데이터베이스 엔진 및 세션 관리자(Session Local) 구성.

#### [NEW] [models.py](file:///e:/projects/ewVLM/backend/models.py)
- `EventLog` 테이블 스키마 정의.
- 컬럼 구성: `id` (Primary Key), `escalation_id`, `camera_id`, `timestamp`, `trigger_class`, `confidence`, `crop_box_coordinates`, `video_segment_chunk_path`.

#### [NEW] [crud.py](file:///e:/projects/ewVLM/backend/crud.py)
- 데이터베이스 쿼리 함수 분리: `create_event()`, `get_recent_events()`.

---

### 2. 게이트웨이(FastAPI) 엔드포인트 확장

#### [MODIFY] [ewvlm_fastapi_gateway.py](file:///e:/projects/ewVLM/backend/ewvlm_fastapi_gateway.py)
- VLM 브릿지로부터 수신하는 POST `/api/v1/escalation/trigger` 엔드포인트 수정:
  - 이벤트를 수신하면 WebSocket 브로드캐스트 전에 **데이터베이스에 영구 저장(`crud.create_event`)**.
- 프론트엔드용 신규 REST API 추가:
  - GET `/api/v1/events`: 과거의 이벤트 내역을 DB에서 불러와 반환.

---

### 3. 프론트엔드 히스토리(과거 내역) 연동

#### [MODIFY] [client.ts](file:///e:/projects/ewVLM/frontend/src/api/client.ts)
- `API` 객체에 `fetchEvents()` 함수를 추가하여 GET `/api/v1/events` 엔드포인트를 호출하도록 구성.

#### [MODIFY] [useEventLogStore.ts](file:///e:/projects/ewVLM/frontend/src/store/useEventLogStore.ts)
- 백엔드로부터 가져온 과거 히스토리 배열을 상태에 덮어쓰는(Initialize) 액션 함수 추가.

#### [MODIFY] [EventReviewCenter.tsx](file:///e:/projects/ewVLM/frontend/src/components/EventReviewCenter.tsx)
- 컴포넌트가 처음 렌더링(Mount)될 때(또는 대시보드 진입 시) 백엔드의 REST API를 호출하여 과거 이벤트 목록을 뷰에 즉시 적재(Hydration).

---

## ✅ Verification Plan (검증 계획)

### Automated Tests (자동 검증)
- 백엔드 서버(FastAPI) 재시작 후 데이터베이스 테이블 자동 생성 여부 확인.
- 브릿지 스크립트(`ewvlm_ollama_bridge.py`) 재구동을 통해 새로 발생한 이벤트가 DB에 정상 삽입(Insert)되는지 로그 확인.

### Manual Verification (수동 검증)
- 프론트엔드 브라우저 화면 새로고침(F5) 시, 이전에 발생했던(저장된) 가상 VLM 이벤트들이 초기화되지 않고 [이벤트 리뷰] 탭의 대기열에 과거 내역으로 안전하게 남아있는지 육안 확인.
