# Phase 12: 상용화 및 심층 연동 (Production Readiness & Deep Integration)

초기 기획된 MVP 로드맵(Phase 1~11)이 성공적으로 마무리됨에 따라, 시스템을 실제 환경(Real World)에서 구동할 수 있도록 가상(Mock) 데이터를 걷어내고 실제 하드웨어 및 소프트웨어 스택과 연동하는 추가 고도화 단계를 제안합니다.

## User Review Required
> [!IMPORTANT]
> 본 계획은 백엔드의 핵심 아키텍처를 실제 상용 수준으로 교체하는 대규모 작업입니다. 모든 항목을 한 번에 진행하기보다 **우선순위(Priority)** 가 높은 항목부터 단계적으로 진행하는 것을 권장합니다.

## Open Questions
> [!NOTE]
> 1. AI 모델 연동(Step 3) 시, **로컬 서버 내 구축(Ollama, vLLM 등)** 과 **외부 클라우드 API(OpenAI GPT-4V, Gemini 등)** 중 어느 방향을 선호하시나요?
> 2. 카메라 영상(Step 2) 테스트를 위해 현재 사용 중인 실제 **RTSP IP 카메라**가 준비되어 있으신가요?

---

## Proposed Changes (진행 단계별 세부 계획)

### [Step 1] 백엔드 데이터베이스(DB) 완전 연동 (Full CRUD)
현재 일부 하드코딩된 Mock 데이터를 제거하고, SQLAlchemy와 SQLite(추후 PostgreSQL 확장 가능)를 100% 활용합니다.
- **대상 파일**: `backend/ewvlm_fastapi_gateway.py`, `backend/crud.py` (신규)
- **작업 내용**: 
  - 카메라 등록/수정/삭제 시 DB에 영구 저장 및 상태 관리
  - 알람, 감사 로그(Audit Logs), 사용자 권한을 모두 DB 스키마에 맞게 맵핑
  - 앱 재시작 시에도 모든 데이터가 초기화되지 않고 유지되도록 보장

### [Step 2] 실제 JWT 기반 로그인 및 보안 강화
- **대상 파일**: `backend/ewvlm_fastapi_gateway.py`, `frontend/src/api/client.ts`
- **작업 내용**:
  - `passlib`, `python-jose`를 도입하여 비밀번호 해싱(Bcrypt) 및 JWT 액세스 토큰 발급
  - 모든 프라이빗 API 엔드포인트에 `Depends(get_current_user)` 인증 미들웨어 적용
  - 프론트엔드에서 인증 토큰을 로컬 스토리지에 저장하고, Axios 인터셉터를 통해 모든 API 요청에 Bearer 헤더 주입

### [Step 3] 실제 하드웨어/서버 리소스 모니터링 (psutil 연동)
- **대상 파일**: `backend/ewvlm_fastapi_gateway.py` (get_system_health API 수정)
- **작업 내용**:
  - 파이썬 `psutil`, `GPUtil` 라이브러리를 추가하여 실제 구동 환경의 리소스 메트릭 읽기
  - CPU 코어별 사용량, 여유 RAM, 디스크 스토리지 정보, (가능한 경우) GPU 온도 및 사용량을 실시간 반환
  - 프론트엔드의 대시보드가 실제 서버의 숨쉬는 상태를 반영하도록 업데이트

### [Step 4] 실제 RTSP/WebRTC 스트리밍 연동 (MediaMTX 딥 인테그레이션)
- **대상 파일**: `frontend/src/components/MonitorALiveControl.tsx`, 백엔드 스트리밍 라우트
- **작업 내용**:
  - 더미 MP4 영상을 걷어내고, WebRTC 프로토콜을 사용해 브라우저에 지연 없는 스트리밍 송출
  - MediaMTX API와 직접 통신하여 카메라 RTSP URL을 On-demand로 WebRTC 채널로 변환하고, 프론트엔드 Video 태그에 연결 (`WebRTC API` 활용)

### [Step 5] 실제 VLM(비전 언어 모델) 파이프라인 연결
- **대상 파일**: `backend/ewvlm_fastapi_gateway.py` (VLM Task 큐), `backend/ai_engine.py` (신규)
- **작업 내용**:
  - `asyncio.sleep`으로 모방했던 AI 추론을 제거하고, 실제 로컬 프로세스(예: Ollama LLaVA 모델)를 호출하여 RTSP 스트림의 현재 프레임(이미지)을 넘겨 분석
  - 자연어 룰(Prompt)에 맞춰 "이 화면에 비정상적인 행위가 있는지?" 판독 후 결과를 DB에 기록하고 웹소켓으로 프론트엔드에 전달

---

## Verification Plan
각 Step이 완료될 때마다 다음 항목을 검증합니다:
- **DB & Auth**: 서버 재부팅 후 기존 로그인 정보 유지 확인, 권한 없는 API 접근 시 `401 Unauthorized` 차단 확인.
- **Resource**: 대시보드 리소스 그래프가 작업 관리자의 실제 수치와 일치하는지 확인.
- **Streaming**: 실제 IP 카메라 또는 모의 RTSP 서버를 연결해 프론트엔드에서 1초 미만 지연으로 재생되는지 확인.
- **AI Engine**: 테스트 이미지를 주입했을 때 실제 텍스트 결과값이 리턴되는지 확인.
