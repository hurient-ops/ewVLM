# Phase 2: 백엔드 핵심 인프라 및 AI 듀얼루프 연동 기획안

Phase 1에서 프론트엔드 모의(Mock-up) 화면들이 완성되었으므로, 이제 실제 데이터가 흐르는 백엔드 파이프라인을 구축할 차례입니다.
이 기획안은 PostgreSQL(pgvector), Kafka, YOLOv8(Fast-Loop), Llama 3.2 Vision(Slow-Loop)을 통합하는 설계 방향을 담고 있습니다.

## User Review Required
> [!IMPORTANT]
> 백엔드 환경 구동을 위해서는 **Docker** 설치가 필수적입니다. 로컬(Windows) 환경에 Docker Desktop이 설치 및 실행 중인지 확인해주세요. (PostgreSQL 및 Kafka 컨테이너 실행 용도)
> 만약 Docker를 사용할 수 없는 환경이라면 미리 말씀해주시기 바랍니다.

## Open Questions
> [!NOTE]
> 1. 영상 소스로 실제 RTSP 카메라 주소를 연결하시겠습니까? 아니면 로컬에 있는 샘플 비디오 파일(.mp4)을 사용하여 시뮬레이션 하시겠습니까? (시뮬레이션일 경우 테스트용 영상 파일 경로를 알려주세요)
> 2. VLM 임베딩 생성을 위해 Ollama 내에 어떤 임베딩 모델(예: `nomic-embed-text`)을 사용할지 지정된 것이 있나요? 없다면 표준 임베딩 방식을 구성하겠습니다.

## Proposed Changes

---

### Backend Infrastructure (Docker)
PostgreSQL(벡터 검색을 위한 pgvector 포함)과 실시간 메시지 큐링을 위한 Kafka 컨테이너를 구성합니다.

#### [NEW] `e:\projects\ewVLM\backend\docker-compose.yml`
- **PostgreSQL**: `ankane/pgvector` 이미지 사용 (5432 포트).
- **Kafka**: `confluentinc/cp-kafka` (또는 Kraft 모드 지원 이미지) 사용 (9092 포트).

---

### Database Integration (PostgreSQL + pgvector)
기존 로컬 SQLite 코드를 실제 PostgreSQL DB(비동기)로 전환합니다.

#### [MODIFY] `e:\projects\ewVLM\backend\database.py`
- `aiosqlite` 대신 `asyncpg` 기반의 PostgreSQL 연결 문자열로 변경.
- DB 연결 팩토리 업데이트.

#### [MODIFY] `e:\projects\ewVLM\backend\models.py`
- `pgvector.sqlalchemy` 모듈을 import 하여 텍스트/이미지 벡터 임베딩을 저장할 수 있는 `Vector` 타입 칼럼 추가 (`vlm_embeddings` 테이블 신설 혹은 `event_logs` 테이블 확장).

#### [MODIFY] `e:\projects\ewVLM\backend\requirements.txt`
- 누락되어 있는 `SQLAlchemy` 등의 패키지 명시적 추가.

---

### AI Dual-Loop Logic (Kafka + YOLOv8 + Llama 3.2 Vision)
진정한 AI 듀얼루프 시스템(Fast & Slow)을 구현합니다.

#### [NEW] `e:\projects\ewVLM\backend\fast_loop.py`
- **Fast-Loop (객체 탐지)**: `ultralytics` YOLOv8 모델을 로드하여 비디오 프레임을 분석합니다.
- 침입(사람), 특정 객체 등이 인식되면 즉시 Kafka `fast-loop-events` 토픽으로 JSON 이벤트를 발행(Produce)합니다.

#### [MODIFY] `e:\projects\ewVLM\backend\ewvlm_fastapi_gateway.py`
- 기존 `MockKafkaProducer` 클래스를 실제 `aiokafka` 프로듀서/컨슈머로 교체합니다.
- FastAPI가 구동될 때 Kafka 컨슈머가 백그라운드에서 동작하여 `fast-loop-events` 토픽을 구독(Subscribe)합니다.
- 이벤트를 수신하면 **Slow-Loop (Ollama VLM)**: `ewvlm_ollama_bridge.py`의 로직을 호출하여 캡처된 프레임을 Llama 3.2 Vision에 전달해 시맨틱 분석을 요청합니다.
- 결과를 PostgreSQL에 저장하고 WebSocket을 통해 프론트엔드로 브로드캐스트합니다.

## Verification Plan

### Automated/Manual Verification
- `docker-compose up -d`를 통해 DB와 Kafka가 정상적으로 구동되는지 확인.
- `python fast_loop.py`를 별도로 실행하여 YOLOv8 탐지 로그가 정상 출력되고 Kafka로 메시지가 넘어가는지 확인.
- FastAPI 서버(`uvicorn ewvlm_fastapi_gateway:app`)를 띄워 WebSocket으로 프론트엔드 대시보드(Monitor B 등)에 실시간 이벤트가 반영되는지 통합 테스트 진행.
