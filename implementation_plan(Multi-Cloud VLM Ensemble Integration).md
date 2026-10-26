# Multi-Cloud VLM Ensemble Integration

## Goal Description
현재 사용자의 로컬 환경 제약(VRAM 등)으로 인해, 기존 LM Studio를 거치던 단일 로컬 AI 추론 방식을 전면 개편합니다.
사용자의 원래 기획대로 **Llama 3.2 Vision, Upstage Solar, Google PaliGemma** 3개 모델을 모두 사용하여 병렬 앙상블 교차 검증을 수행할 수 있도록, 각각의 모델을 클라우드 API를 통해 라우팅하는 Multi-Cloud VLM 브릿지 구조로 리팩토링합니다.

> [!IMPORTANT]
> **User Review Required**
> 이 계획을 승인하시면, 기존 로컬 기반의 코드가 클라우드 기반으로 변경됩니다. 각 클라우드 서비스(Together AI, Upstage, Hugging Face)의 API Key가 필요하며, 테스트를 위한 더미(Dummy) Key를 임시로 사용하거나 실제 발급받으신 Key를 입력받아 적용할 수 있습니다.

## Open Questions
> [!WARNING]
> 1. API 키 관리: 하드코딩 대신 환경변수(`.env`)를 사용하여 관리하는 방안으로 진행해도 될까요?
> 2. PaliGemma 호환성: PaliGemma 모델은 OpenAI 호환 규격이 아닌 Hugging Face Inference API(커스텀 JSON 구조)를 사용해야 합니다. 이를 수용할 수 있도록 통신 모듈을 분기 처리하겠습니다. 동의하시나요?

## Proposed Changes

---

### Backend VLM Bridge (API Routing)

#### [MODIFY] [ewvlm_lmstudio_bridge.py](file:///e:/projects/ewVLM/backend/ewvlm_lmstudio_bridge.py)
- `__init__` 함수에 Together AI(Llama용), Upstage(Solar용), Hugging Face(PaliGemma용) 등 다중 API Key 환경변수를 로드하는 로직 추가.
- `query_lmstudio_vision` 함수명을 `query_cloud_vlm`으로 변경 또는 내부 라우팅 로직(Switch-Case 방식) 구현.
- `model_name` 인자에 따라 3가지 API(Together, Upstage, HF)로 분기하여 각각에 맞는 헤더(Authorization)와 페이로드 형식 구성.

#### [MODIFY] [ewvlm_fastapi_gateway.py](file:///e:/projects/ewVLM/backend/ewvlm_fastapi_gateway.py)
- `/v1/models` 감지 로직(LM Studio 로컬 감지)을 비활성화하고, 고정된 클라우드 모델 3종(Llama 3.2 Vision, Solar, PaliGemma)을 `active_vlm_models`로 주입하도록 변경.
- 동시 비동기 호출(`asyncio.gather`) 부분에서 새로 리팩토링된 브릿지의 멀티 라우팅을 타도록 수정.

## Verification Plan

### Automated Tests
- 프롬프트 게이트웨이 및 `/api/v1/escalation/trigger` 엔드포인트를 호출하여 각 클라우드 API에 정상적으로 요청이 분기되는지 로그 확인 (API Key 부재 시 HTTP 401 에러로 라우팅 작동 여부 검증).

### Manual Verification
- 사용자가 프론트엔드 모니터 A 화면에서 VLM 앙상블(다중 모델)을 체크한 뒤 알람 이벤트를 발생시켜, 3개 모델의 교차 검증 결과가 통합 캡션으로 화면에 잘 표출되는지 테스트.
