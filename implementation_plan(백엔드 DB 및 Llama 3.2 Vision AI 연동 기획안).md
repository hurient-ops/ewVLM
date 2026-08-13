# Phase 3: 백엔드 DB 및 Llama 3.2 Vision AI 연동 기획안

프론트엔드 전체 UI 구현과 실시간 YOLO 분석(Fast-Loop) 스트리밍 연동이 성공적으로 완료되었습니다.
이제 시스템이 실제 데이터를 영구 보존하고, 단순 텍스트가 아닌 실제 VLM 모델(Llama 3.2 Vision)을 통해 분석 결과를 도출하도록 백엔드 파이프라인을 완성할 차례입니다.

## User Review Required
> [!IMPORTANT]
> 현재 시스템 터미널 환경에서 `docker` 명령어를 인식하지 못하는(PATH 미등록) 문제가 확인되었습니다. (Docker Desktop을 설치하셨으나 터미널 재시작 등이 필요할 수 있습니다). 
> **따라서, 개발 속도를 높이기 위해 복잡한 Docker(PostgreSQL, Kafka) 설정 없이, 우선 백엔드 내장형 DB인 `SQLite`(SQLAlchemy 활용)와 직접적인 REST API 통신 구조로 개발을 시작하겠습니다.** 추후 상용화 단계에서 PostgreSQL로 손쉽게 마이그레이션 할 수 있도록 ORM 구조로 설계합니다.

## Open Questions
> [!WARNING]
> 1. **Llama 3.2 Vision 접속 주소**: 현재 띄워두신 Llama 3.2 Vision API 서버의 Endpoint 주소(예: `http://localhost:11434` 또는 `http://localhost:8000/v1`)를 알려주시면 해당 주소로 연동 코드를 작성하겠습니다. 
> 2. 위 계획대로 일단 내장형 SQLite DB를 기반으로 빠르게 개발을 시작해도 괜찮으신가요?

---

## Proposed Changes

### 1. Database ORM 구현 (SQLite)
`aiosqlite` 및 `SQLAlchemy`를 사용하여 카메라 메타데이터 및 AI 이벤트 로그를 저장할 데이터베이스 모델을 구축합니다.

#### [MODIFY] `e:\projects\ewVLM\backend\database.py`
- 비동기 SQLite DB 연결 및 세션 팩토리 초기화 코드 작성

#### [NEW] `e:\projects\ewVLM\backend\models.py`
- `Camera` 테이블: 카메라 ID, 이름, IP, 위경도 좌표 저장
- `EventLog` 테이블: 발생 시간, 카메라 ID, 이벤트 종류, 신뢰도 등 저장
- `VLMResult` 테이블: Llama 3.2 Vision이 분석한 결과 텍스트 저장

---

### 2. Llama 3.2 Vision 연동 브릿지 개발
YOLO가 잘라낸 이미지(Crop)를 Llama 모델로 전송하여 결과를 받아오는 통신 모듈을 개발합니다.

#### [NEW] `e:\projects\ewVLM\backend\ewvlm_llama_bridge.py`
- 비동기 HTTP(REST) 또는 OpenAI 호환 클라이언트를 사용하여 Llama 3.2 Vision API 서버와 통신하는 함수 구현.
- 이미지를 Base64로 인코딩하고 프롬프트(예: "이 상황을 묘사하고 위험도를 판단해 줘")와 함께 전송.

---

### 3. FastAPI Gateway 통합
가짜(Mock) 데이터를 실제 DB 및 Llama API 결과로 대체합니다.

#### [MODIFY] `e:\projects\ewVLM\backend\ewvlm_fastapi_gateway.py`
- `/api/escalate` 엔드포인트에서 이벤트를 수신하면 `EventLog` DB에 Insert.
- `ewvlm_llama_bridge.py`를 호출하여 백그라운드에서 VLM 분석을 수행.
- 분석 완료 시 `VLMResult` DB에 Insert 하고 WebSocket을 통해 프론트엔드로 브로드캐스트.

---

## Verification Plan

### Automated Tests
- 없음

### Manual Verification
1. `backend/database.py`를 실행하여 SQLite DB 파일(`.db`)과 테이블이 정상 생성되는지 확인.
2. `fast_loop.py`를 실행해 YOLO 이벤트가 발생했을 때, 게이트웨이가 DB에 저장하고 로그를 남기는지 확인.
3. Llama 3.2 Vision 서버가 실제로 호출되어 응답이 프론트엔드 `Monitor B` 화면에 출력되는지 최종 확인.
