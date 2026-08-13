# Phase 2: 백엔드 핵심 인프라 및 AI 듀얼루프 구축 완료 안내

승인해주신 Phase 2 기획안에 따라 백엔드 인프라와 AI 듀얼루프(Fast-Loop & Slow-Loop) 파이프라인 개발을 모두 성공적으로 완료했습니다! 🎉

## 🛠️ 구현된 기능 및 변경 사항

### 1. Docker Compose 기반 백엔드 인프라 (`docker-compose.yml`)
- 벡터 임베딩 저장을 위한 **PostgreSQL (pgvector 확장 포함)** 환경 구성 완료.
- 실시간 이벤트 브로커 역할을 하는 **Apache Kafka & Zookeeper** 환경 구성 완료.

### 2. 데이터베이스 연동부 고도화 (`database.py`, `models.py`)
- SQLite 기반이던 로컬 테스트 모드를 **PostgreSQL + asyncpg 비동기 접속** 방식으로 전환했습니다.
- `models.py` 내 `EventLog` 테이블에 VLM 시맨틱 분석 결과를 저장할 수 있도록 **pgvector `Vector(768)`** 칼럼을 신설했습니다.
- `requirements.txt`에 필요한 패키지(`SQLAlchemy`, `asyncpg`, `pgvector`, `aiokafka`)를 추가했습니다.

### 3. YOLOv8 기반 Fast-Loop 파이프라인 (`fast_loop.py`)
- **실시간 객체 탐지**: 카메라(웹캠 또는 영상 소스)로부터 프레임을 가져와 `ultralytics` YOLOv8 모델로 사람/차량 등의 객체를 감지합니다.
- 특정 위험 객체가 감지되면 **Kafka `fast-loop-events` 토픽**으로 즉시 JSON 에스컬레이션 알림을 발행(Produce)합니다.

### 4. FastAPI Gateway 및 Ollama VLM 연동 (Slow-Loop) (`ewvlm_fastapi_gateway.py`)
- **Kafka Consumer**: 백그라운드에서 Kafka 메시지를 수신(`aiokafka`) 대기합니다.
- Fast-Loop에서 경고가 접수되면, 즉각 `OllamaVLMBridge`를 호출하여 **Llama 3.2 11B Vision** 모델에 프레임 이미지와 프롬프트를 넘겨 상세한 상황 요약(한국어 3줄 요약 등)을 시맨틱 캡션으로 추론받습니다.
- 추출된 정보와 벡터값은 PostgreSQL에 영구 저장되며, 동시에 프론트엔드로 WebSocket을 통해 전송됩니다.

---

## 🚀 실행 가이드 (로컬에서 테스트해 보는 방법)

> [!WARNING]
> 실행 전 로컬에 **Docker Desktop**이 실행 중인지 확인해주세요!

**1단계: 인프라 구동 (DB & Kafka)**
터미널을 열고 `backend` 디렉토리로 이동한 뒤 아래 명령어를 실행하세요.
```bash
cd e:\projects\ewVLM\backend
docker compose up -d
```
*(초기 구동 시 Kafka와 PostgreSQL 이미지를 다운로드하느라 시간이 소요될 수 있습니다.)*

**2단계: Python 패키지 설치**
```bash
pip install -r requirements.txt
```

**3단계: FastAPI Gateway (Slow-Loop 서버) 실행**
```bash
uvicorn ewvlm_fastapi_gateway:app --host 0.0.0.0 --port 8000
```
*(이때 DB 테이블이 자동 생성되며 Kafka Consumer가 백그라운드에서 동작을 시작합니다.)*

**4단계: YOLOv8 Fast-Loop 실행**
새로운 터미널 창을 열고 아래 명령어를 실행하여 웹캠(기본값) 혹은 영상 파일 분석을 시작합니다.
```bash
cd e:\projects\ewVLM\backend
python fast_loop.py
```

이제 VLM 엔진이 위험을 감지하고 프론트엔드로 실시간 브로드캐스트하는 완벽한 흐름이 작동합니다! 추가적으로 보완할 점이나 확인하실 부분이 있다면 언제든 말씀해 주세요.
