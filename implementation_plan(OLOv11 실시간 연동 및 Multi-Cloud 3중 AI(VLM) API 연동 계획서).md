# YOLOv11 실시간 연동 및 Multi-Cloud 3중 AI(VLM) API 연동 계획서

사용자님의 요청에 따라, 기존에 "로컬 껍데기(Mock/Standby)"로만 동작하던 VLM 분석 파이프라인을 뜯어고쳐 **실제 3개의 클라우드 AI API(Groq, Upstage, HF PaliGemma)와 완벽하게 연동**하는 마스터 플랜을 수립했습니다.

## 1. Multi-Cloud VLM(3중 AI) API 연동 아키텍처

현재 시스템은 로컬의 `LM Studio(localhost:1234)`만 바라보게 하드코딩되어 있습니다. 이를 실제 글로벌/로컬 최고 수준의 AI API들과 직접 통신하도록 백엔드 브릿지를 전면 확장합니다.

### 🚀 연동 대상 AI 모델 및 엔드포인트
1. **Groq (Llama 3.2 11B Vision)**: 초고속 추론 특화. `api.groq.com/openai/v1/chat/completions` 사용.
2. **Upstage (Solar DocVLM / Vision)**: 한국어 및 산업 도메인 특화. `api.upstage.ai/v1/solar/chat/completions` 사용.
3. **HuggingFace (Google PaliGemma)**: 엣지 검증 및 빠른 VQA 특화. `api-inference.huggingface.co/models/google/paligemma-3b-mix-448` 사용.

### 🛠 Proposed Changes (백엔드)

#### [NEW] `backend/multicloud_vlm_bridge.py`
- 위 3가지 AI 회사의 공식 API 규격(REST API / OpenAI Compatible)에 맞춰 비디오 프레임(Base64)과 프롬프트를 전송하고 JSON 응답을 받아오는 전용 브릿지 모듈을 신규 생성합니다.

#### [MODIFY] `backend/ewvlm_fastapi_gateway.py`
- 기존에 강제로 `LM Studio`로만 보내던 로직을 조건부 라우팅으로 변경합니다.
- `USE_LOCAL_VLM=false` (기본값)일 경우, `multicloud_vlm_bridge.py`를 호출하여 **Groq, Upstage, HF 중 선택된 모델(또는 앙상블) API를 호출**하도록 변경합니다.

#### [MODIFY] `.env` (환경 변수)
- API 통신을 위해 인증키 입력을 위한 환경 변수(`GROQ_API_KEY`, `UPSTAGE_API_KEY`, `HF_API_KEY`) 체계를 구축합니다. (실제 키는 보안상 사용자가 직접 기입할 수 있게 가이드합니다.)

---

## 2. 프론트엔드 YOLOv11 영상 출력 버그 수정 (기존 플랜 포함)

현재 화면에 나오는 영상은 YOLOv11 객체 인식이 안 되는 것이 아니라, 프론트엔드가 YOLOv11을 거치지 않은 **원본 영상(MediaMTX, 8889번 포트)**을 바라보고 있기 때문입니다. 이를 YOLO 분석 송출 포트(`8001`)로 바로잡습니다.

### 🛠 Proposed Changes (프론트엔드)

#### [MODIFY] `frontend/src/components/MonitorCanvas.tsx` 외 3건
- `MonitorCanvas.tsx`, `PtzTargetHandover.tsx`, `MonitorALiveControl.tsx`, `PtzControlOverlay.tsx` 컴포넌트 내부의 `WebRTCPlayer` `streamUrl`을 `http://localhost:8889/...` 에서 `http://localhost:8001/webrtc/...` 로 모두 교체.

## User Review Required

> [!CAUTION]
> 1. 프론트엔드 주소 변경은 즉시 효과가 나타납니다.
> 2. **3대 AI 모델 연동의 경우, 실제 서버 코드가 구현되더라도 사용자님께서 각 회사의 API KEY를 발급받아 시스템에 입력하셔야만 정상적으로 영상을 클라우드 AI로 넘겨 분석할 수 있습니다.**
> 
> 해당 계획에 동의하시면 **Proceed**를 눌러주세요. 즉시 개발에 착수하겠습니다.
