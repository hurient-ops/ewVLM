# ewVLM 하드웨어 및 실시간 인프라 연동 기획안 (Phase 8)

현재 100% 완료된 프론트엔드 UI 및 백엔드 CRUD API를 기반으로, 실제 VMS 현장에 배치하기 위해 물리적인 하드웨어 및 실시간 AI 스트리밍을 연동하는 핵심 파이프라인(Phase 8) 구축 계획입니다.

## User Review Required

> [!WARNING]
> **하드웨어 제약 및 환경 준비**
> 본 개발 단계부터는 가상 데이터가 아닌 **실제 IP 카메라(RTSP 지원)** 또는 물리적 **GPU(VLM 구동용)** 환경이 필요합니다. 로컬 테스트를 위해 OBS 스튜디오나 스마트폰 카메라 앱(RTSP 서버)을 활용한 모의 카메라 환경 구축이 선행되어야 할 수 있습니다.

> [!IMPORTANT]
> **Media Server 아키텍처 결정**
> 다수의 RTSP 스트림을 브라우저에 지연 없이 띄우려면 중간에 스트리밍 서버가 필수적입니다. 본 기획안은 가볍고 Go 언어로 작성되어 성능이 뛰어난 오픈소스 **MediaMTX**를 미디어 브릿지로 사용하는 방안을 제안합니다.

## Open Questions

> [!IMPORTANT]
> 1. **가장 먼저 구축을 희망하시는 파트는 무엇인가요?** (예: 실시간 카메라 연동부터 할지, 아니면 VLM 소켓 통신을 먼저 구축할지)
> 2. **PTZ 연동 관련:** 실제 보유하고 계신 ONVIF 지원 PTZ 카메라 모델이 있으신가요? (테스트 환경 파악용)
> 3. **VLM AI 모델 관련:** 현재 구동할 실제 VLM 모델은 로컬(Ollama + LLaVA 등) 환경을 그대로 쓰실 예정이신가요, 아니면 OpenAI API(GPT-4o)와 같은 클라우드 모델을 병행하실 예정이신가요?

## Proposed Changes

본 계획은 크게 4가지 컴포넌트로 나뉘어 점진적으로 파일과 시스템이 추가될 예정입니다.

---

### 1. 🎥 실시간 미디어 서버 (MediaMTX) 파이프라인
CCTV 카메라의 RTSP 스트림을 브라우저가 재생 가능한 WebRTC 형식으로 변환합니다.

#### [NEW] `e:\projects\ewVLM\backend\mediamtx.yml`
- MediaMTX 서버 설정 파일. 카메라 IP 목록(rtsp://...)을 매핑하여 WebRTC 스트림 주소 생성.
#### [MODIFY] `e:\projects\ewVLM\backend\docker-compose.yml`
- 기존 FastAPI/SQLite 컨테이너에 MediaMTX 컨테이너를 추가하여 서버 런타임 통합.
#### [MODIFY] `e:\projects\ewVLM\frontend\src\components\GisSmartMap.tsx` 및 `MonitorA` 컴포넌트들
- 가짜 이미지를 제거하고 `WebRTC Player` 라이브러리를 삽입하여 실시간 영상 스트림 바인딩.

---

### 2. 🤖 VLM 실시간 프레임 분석 소켓 (WebSocket) 연동
기존 폴링(Polling) 방식의 가짜 이벤트 발생을 버리고, 양방향 소켓을 통해 초당 프레임 감지 결과를 수신합니다.

#### [NEW] `e:\projects\ewVLM\backend\websocket_manager.py`
- 클라이언트(프론트엔드)와 실시간 소켓 세션을 맺고 VLM 모델의 분석 결과(JSON)를 브로드캐스트.
#### [MODIFY] `e:\projects\ewVLM\backend\fast_loop.py`
- 랜덤 이벤트를 발생시키던 코드를 수정하여, 실제 RTSP 스트림 프레임을 OpenCV로 캡처 ➡️ VLM 모델로 추론 ➡️ WebSocket으로 결과 전송하는 리얼 루프(Real Loop)로 고도화.
#### [MODIFY] `e:\projects\ewVLM\frontend\src\store\useEventLogStore.ts`
- 기존 HTTP API 호출 대신 `WebSocket API`를 연결하여 상태를 업데이트하도록 수정.

---

### 3. 🕹️ 하드웨어 PTZ (ONVIF) 직접 제어 연동
UI 버튼을 누를 때 카메라 렌즈가 물리적으로 회전하도록 SOAP/ONVIF 패킷을 전송합니다.

#### [NEW] `e:\projects\ewVLM\backend\onvif_controller.py`
- Python `onvif-zeep` 라이브러리를 활용하여 카메라의 IP/계정으로 접근하고 `AbsoluteMove`, `ContinuousMove`, `Stop` 명령을 내리는 클래스 구현.
#### [MODIFY] `e:\projects\ewVLM\backend\ewvlm_fastapi_gateway.py`
- `POST /api/v1/cameras/{id}/ptz` 라우터 구현. (방향, 줌, 속도 파라미터 수신).
#### [MODIFY] `e:\projects\ewVLM\frontend\src\components\GisSmartMap.tsx`
- 조그셔틀(PTZ 십자키) 및 줌 인/아웃 버튼에 `onMouseDown`, `onMouseUp` 이벤트를 바인딩하여 PTZ API 호출 (누를 때 이동, 뗄 때 정지).

---

### 4. 📼 NVR 및 타임라인 싱크 (Playback) 구축
녹화된 대용량 영상을 타임라인 UI와 매핑합니다.

#### [NEW] `e:\projects\ewVLM\backend\playback_service.py`
- NVR 폴더에 저장된 `.mp4` 파일의 메타데이터(시작 시간, 길이)를 읽어 프론트엔드가 요청한 `timestamp`에 해당하는 HLS 청크(Chunk)를 스트리밍하는 라우터.
#### [MODIFY] `e:\projects\ewVLM\frontend\src\components\EventReviewCenter.tsx`
- 타임라인 드래그 이벤트 시, 해당 시간대(`timestamp`)를 백엔드로 넘겨 `video` 태그의 `currentTime` 및 `src`를 동적으로 변경하는 로직 구현.

## Verification Plan

### Automated Tests
- RTSP ➡️ WebRTC 변환 테스트 스크립트를 통해 스트림 지연시간(Latency)이 1초 미만인지 확인합니다.
- VLM WebSocket의 부하 테스트를 진행하여 초당 30개 이상의 이벤트가 들어와도 메모리 누수가 없는지 검증합니다.

### Manual Verification
1. **스마트폰 IP Webcam 앱** 등을 활용하여 로컬 네트워크상에 가상 RTSP 카메라를 켭니다.
2. 브라우저에서 `Monitor A`에 내 폰 카메라 영상이 실시간으로 부드럽게 송출되는지 확인합니다.
3. PTZ 방향키를 클릭하여 백엔드 로그에 ONVIF 제어 패킷이 정상적으로 발송되는지 확인합니다.
4. VLM 분석 탭에서 가짜 데이터가 아닌, 카메라 화면 속 사물(예: 사람 등장)에 반응하여 소켓으로 알람이 뜨는지 듀얼 모니터로 관찰합니다.
