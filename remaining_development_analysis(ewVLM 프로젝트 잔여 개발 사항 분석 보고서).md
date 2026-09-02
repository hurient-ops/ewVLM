# ewVLM 프로젝트 잔여 개발 사항 분석 보고서

현재 시스템의 화면 UI와 프론트엔드 라우팅은 훌륭하게 구현되어 있으나, 이면의 백엔드 로직(`ewvlm_fastapi_gateway.py`) 및 데이터베이스 연동 수준을 분석한 결과 **상당수의 기능이 가짜 데이터(Mocking)를 반환하거나 UI 시뮬레이션 단계**에 머물러 있는 것을 확인했습니다.

앞으로 실제 운영 환경 수준으로 고도화하기 위해 진행해야 할 **추가 개발 사항(DB 설계 및 실제 로직 연동)**을 도메인별로 세부 정리했습니다.

---

## 1. MLOps 및 AI 모델 파이프라인 (완전 구현 필요)
현재 AI 모델 배포 및 학습 관련 엔드포인트는 실제 ML 워크플로우와 연동되지 않고 `asyncio.sleep()`으로 지연만 시뮬레이션하고 있습니다.

- **LoRA 파인튜닝 콘솔 (`/lora-finetuning`)**: 
  - `POST /api/v1/mlops/train/lora`: 학습 시작 시 DB에 Job 상태를 생성하고, 실제 Python 하위 프로세스나 GPU 스케줄러(Ray 등)를 트리거하도록 연동해야 합니다.
- **프롬프트 게이트웨이 배포 (`/prompt-gateway`)**:
  - `POST /api/v1/mlops/deploy/prompt`: 엣지 노드로 프롬프트를 배포할 때, 각 엣지 디바이스의 Agent 서버와 실제 통신하여 프롬프트를 업데이트하는 로직이 필요합니다.
- **자연어 기반 Rule Copilot (`/nl-rule-copilot`)**:
  - `POST /api/v1/sop/rules/generate`: 현재는 하드코딩된 규칙("AI_Rule_123...")을 반환합니다. 실제 LLM API(OpenAI 또는 내부 LLaMA)를 호출하여 사용자 프롬프트를 JSON 규칙으로 변환하는 로직 구현이 필요합니다.

## 2. 보안 관제 (VMS) 및 데이터 내보내기 (로직 연동 필요)
영상 검색 및 반출 기능은 관제 시스템의 핵심이지만 현재는 파일 이름만 가짜로 생성하여 반환합니다.

- **프라이버시 안면 마스킹 반출 (`/privacy-export`)**:
  - `POST /api/v1/video/export/masking`: 실제 FFmpeg 기반의 영상 트랜스코딩 및 AI 객체 검출(YOLO)을 통한 모자이크 처리 파이프라인(Celery 등의 백그라운드 워커)이 연동되어야 합니다.
- **포렌식 영상 다중 채널 반출 (`/multi-channel-sync`)**:
  - `POST /api/v1/records/export`: 타임스탬프를 기준으로 NVR 스토리지 디렉토리에서 여러 카메라의 영상을 병합 또는 분리 추출하는 로직이 필요합니다.
- **NVR 스토리지 대시보드 (`/nvr-storage`)**:
  - 파일 시스템(OS 모듈)을 읽어와 실제 하드디스크 볼륨의 용량과 보관 주기를 DB 설정에 맞게 로테이션(오래된 영상 삭제)하는 백그라운드 스케줄러가 필요합니다.

## 3. 상황 전파 및 모바일 순찰 (상태 관리 DB 필요)
이벤트(Alert) 발생 시 WebSocket을 통한 단순 브로드캐스트는 구현되어 있으나, 영구적인 상태 관리(State Management)가 없습니다.

- **재난 버추얼 워룸 (`/disaster-war-room`) & 모바일 순찰 앱 (`/mobile-patrol`)**:
  - `POST /api/v1/alerts/{alert_id}/dispatch`: 지시가 내려지면 RDBMS(PostgreSQL/SQLite)의 `Dispatch` 테이블에 저장되고, 순찰자가 확인(Ack)하거나 완료(Resolve) 처리를 할 수 있는 API 상태 머신 연동이 필요합니다.
- **IP 오디오 방송 (`/ip-audio`)**:
  - `POST /api/v1/audio/broadcast`: 실제 SIP/RTSP 프로토콜을 사용해 네트워크 스피커로 TTS 오디오 스트림을 전송하는 로직이 필요합니다.

## 4. BI 대시보드 및 감사 로그 (DB 쿼리 연동)
- **실시간 BI 대시보드 (`/realtime-bi`)**:
  - `GET /api/v1/bi/stats`: 임의의 난수(Random) 연산이 아니라, 이벤트 로그 DB에서 특정 시간대별 통계(`GROUP BY` 및 시간 집계) 쿼리를 수행하여 데이터를 반환해야 합니다.
- **시스템 감사 로그 (`/system-audit`)**:
  - `GET /api/v1/audit/logs`: 7개의 가짜 로그 목록 대신, 실제로 발생한 API 요청 및 로그인 기록을 DB에서 페이징(Pagination)하여 불러오도록 구현해야 합니다.

## 5. 인프라 관리 (장비 및 네트워크)
- **네트워크 토폴로지 맵 (`/network-topology`)**:
  - 프론트엔드에 하드코딩된 노드 데이터 대신, 백엔드에서 실제 핑(ICMP Ping)이나 SNMP 폴링 상태를 수집하여 DB에 캐싱한 최신 데이터를 제공해야 합니다.
- **기하학 캘리브레이션 (`/geometry-calib`)**:
  - 사용자가 드래그한 좌표(Matrix) 값을 DB에 저장하고, 추후 VLM/YOLO 분석 시 해당 좌표계 기준으로 변환해 주는 로직 연동이 필요합니다.

---

> [!IMPORTANT]
> 화면상으로는 이미 모든 것이 갖춰진 것처럼 보이지만, 실제 상용화 및 운영을 위해서는 위 기능들을 **실제 백엔드 로직과 데이터베이스로 대체하는 작업**이 필수적입니다.
> 
> 우선적으로 **어떤 도메인(MLOps, 관제 반출, BI 통계 등)**부터 실제 로직 개발을 시작할지 피드백 주시면, 해당 영역에 대한 상세 구현 계획(Implementation Plan)을 작성하여 개발을 진행하겠습니다!
