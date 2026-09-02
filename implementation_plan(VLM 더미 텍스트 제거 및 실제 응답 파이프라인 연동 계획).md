# VLM 더미 텍스트 제거 및 실제 응답 파이프라인 연동 계획

현재 시스템은 로컬 VLM 서버(LM Studio, Ollama)가 꺼져 있거나 응답이 없을 때, 백엔드 브릿지 로직에서 하드코딩된 가짜(Dummy) 상황 텍스트("유독 가스 누출", "낙상 사고" 등)를 무조건 반환하도록 되어 있습니다. 또한 API Gateway는 VLM의 실제 판단과 무관하게 무조건 `safety_violation` 위험 상태로 이벤트를 브로드캐스팅합니다.

이를 **실제 프로덕션 환경에 맞게 동적(Dynamic) 파이프라인으로 개편**합니다.

## User Review Required

> [!IMPORTANT]
> 현재 시스템 리소스 안정화를 위해 LM Studio와 Ollama를 끄고 개발 중이신 상황을 고려하여, **VLM 서버가 꺼져 있을 때 가짜 알람(오탐)을 띄우지 않고 시스템 장애(AI Offline) 상태로 정확하게 보고**하도록 구현합니다. 

## Open Questions

> [!TIP]
> VLM 서버가 켜져서 실제 응답을 줄 때, 프롬프트에서 `[위협 수준] (안전/경고/심각)`을 요구하고 있습니다. 만약 VLM이 `안전`이라고 답변하면, 알람을 띄우지 않고 그냥 로그만 남기도록(필터링) 처리할까요? (현재는 무조건 알람이 뜹니다.)

## Proposed Changes

### Backend

#### [MODIFY] `backend/ewvlm_lmstudio_bridge.py` & `backend/ewvlm_ollama_bridge.py`
- 통신 실패(`except Exception as e`) 시 하드코딩된 `mock_caption` 반환 로직을 제거합니다.
- 대신 `[VLM_OFFLINE] AI 서버에 연결할 수 없습니다.`라는 명확한 에러 텍스트를 반환하여 Gateway가 상황을 인지할 수 있도록 수정합니다.

#### [MODIFY] `backend/ewvlm_fastapi_gateway.py` (`simulate_slow_loop_inference` 함수)
- VLM 브릿지에서 넘어온 텍스트가 `[VLM_OFFLINE]`일 경우, 가짜 위협 알람이 아닌 **시스템 운영 경고 로그(Operational Alert)**로 처리합니다.
- VLM 서버가 정상 동작하여 응답이 올 경우, 정적 하드코딩된 `detected_dangerous_actions` 및 `recommended_sop_id`를 제거하고, **VLM의 실제 텍스트 내용을 파싱하여 동적으로 상황을 부여**하도록 파이프라인을 수정합니다.
- 함수명도 `simulate_slow_loop_inference`에서 실제 연동을 의미하는 `execute_vlm_inference_pipeline`으로 리팩토링합니다.

## Verification Plan

### Manual Verification
1. LM Studio와 Ollama를 **끈 상태**에서 관제 화면을 관찰합니다. 가스 누출이나 낙상 등 이상한 가짜 알람 대신, "AI 서버 연결 실패"라는 정확한 에러 로그가 찍히는지 확인합니다.
2. (선택 사항) 시스템 여유가 될 때 LM Studio를 **켠 상태**로 테스트하여, AI가 판단한 실제 위협 결과만이 화면에 알람으로 표출되는지 확인합니다.
