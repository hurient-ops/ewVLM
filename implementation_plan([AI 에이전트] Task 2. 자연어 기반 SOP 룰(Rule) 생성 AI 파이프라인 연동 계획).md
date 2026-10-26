# [AI 에이전트] Task 2: 자연어 기반 SOP 룰(Rule) 생성 AI 파이프라인 연동 계획

단순히 If-Else 키워드("차량", "화재")로 객체를 매칭하던 기존 로직을 걷어내고, Ollama LLM(Local Llama)을 활용하여 사용자의 자연어 프롬프트를 명확한 JSON 구조로 파싱하는 지능형 Function Calling(프롬프트 엔지니어링) 구조로 교체합니다.

## User Review Required

> [!IMPORTANT]
> 로컬 환경에 Ollama 서버(`http://localhost:11434`)가 기동 중이지 않은 경우 시스템이 멈추지 않고(Graceful Degradation), 기존의 단순 키워드 매칭(Mock) 모드로 자동 Fallback(우회)하도록 안전장치를 적용할 예정입니다.

## Proposed Changes

### 백엔드 (FastAPI)

#### [MODIFY] `backend/ewvlm_fastapi_gateway.py`
기존 `generate_sop_rule` 함수(`POST /api/v1/sop/rules/generate`)를 다음과 같이 업데이트합니다.

1. **비동기 HTTP 클라이언트 연동**:
   - `httpx` 또는 `aiohttp`를 사용하여 비동기로 Ollama API(`/api/generate`)를 호출하는 로직 작성. (기존 `requests` 동기 호출 대신 FastAPI의 비동기 특성을 살림)
2. **프롬프트 엔지니어링 (JSON Schema Enforcement)**:
   - System Prompt를 주입하여 LLM이 잡담 없이 엄격하게 JSON 포맷만 반환하도록 유도 (`"format": "json"` 옵션 사용).
   - 예상 JSON 스키마:
     ```json
     {
       "trigger_class": "person / vehicle / fire / weapon / etc",
       "severity": "high / medium / low",
       "confidence_threshold": 0.85
     }
     ```
3. **JSON 파싱 및 예외 처리 (Robustness)**:
   - LLM 응답을 `json.loads`로 파싱하며, 응답 형식이 깨진 경우 정규표현식(Regex)을 통한 JSON 추출 시도.
   - Ollama 서버 미응답 시 기존 하드코딩(If-Else) 방식의 Fallback 룰을 적용.
4. **DB 저장**:
   - 추출된 `trigger_class`를 바탕으로 `crud.create_sop_rule` 호출.

## Verification Plan

### Automated Tests
- `httpx`를 통해 로컬 스크립트를 작성하여 프롬프트("빨간 옷 입은 의심스러운 사람이 배회하면 알림 줘")를 전송했을 때 정확히 `trigger_class: person`, `severity: high` JSON이 파싱되는지 검증.

### Manual Verification
- 프론트엔드 UI의 SOP 룰 등록 팝업에서 자연어를 입력하고 룰을 생성한 뒤, 테이블에 저장된 `target_object` (trigger_class) 가 정상적으로 AI를 통해 분류되었는지 확인.
