# 🧠 Task 2: 자연어 기반 SOP 룰(Rule) 생성 AI 파이프라인 연동 완료

AI & Vision Engineer Agent가 **Task 2: LLM(Llama 3.2)을 활용한 자연어 SOP 룰 파싱(Function Calling) 기능**을 성공적으로 연동했습니다!

## 🚀 고도화된 기능 (Prompt Engineering)

이전에는 사용자가 "빨간 옷 입은 사람이 나타나면 알림 줘"라고 입력하면 단어 안에 "사람"이나 "차량"이 있는지 단순 If-Else 구문으로만 필터링했습니다. 이제는 FastAPI 서버가 백그라운드에서 실시간으로 LLM을 호출하여 문맥을 파악하고 정형화된 데이터를 추출합니다.

### 1. LLM 비동기 연동 (`httpx`)
`requests` 대신 `httpx.AsyncClient`를 사용하여 비동기로 통신하므로, LLM 모델이 추론을 진행하는 1~2초 동안에도 FastAPI 서버가 멈추지 않고 다른 요청(비디오 스트리밍 등)을 원활하게 처리할 수 있습니다.

### 2. 엄격한 JSON Output 제어
Ollama의 `format: json` 기능을 활성화하고, 다음과 같은 System Prompt를 부여하여 AI가 불필요한 인삿말 없이 정확한 Data Schema만 반환하도록 통제(Function Calling 유사 동작)했습니다.
```text
You are a strict JSON parser for an AI surveillance system.
Extract the target object to detect from the user's natural language input.
Possible target classes: "person", "vehicle", "fire", "weapon".
...
Return ONLY valid JSON with no markdown and no other text: {"trigger_class": "detected_class"}
```

### 3. 무중단 Fallback 구조 (Graceful Degradation)
> [!TIP]
> 만약 로컬 서버의 GPU 메모리 부족으로 Ollama가 뻗거나, 아예 설치되지 않은 환경이라도 시스템은 멈추지 않습니다!

`try-except` 블록으로 LLM API 호출을 감싸, 만약 연결이 실패(Connection Error)하거나 JSON 파싱 에러가 발생하면 즉시 과거에 쓰던 "단순 키워드 매칭(Mock) 모드"로 전환되어 룰을 정상 등록하도록 안전장치를 마련했습니다.

## ✅ 수정된 소스코드
- **[백엔드 API 로직]**: [backend/ewvlm_fastapi_gateway.py:L1367-L1412](file:///e:/projects/ewVLM/backend/ewvlm_fastapi_gateway.py#L1367-L1412) (`generate_sop_rule` 엔드포인트)

이를 통해 이제 "소총을 든 괴한이 1층에 나타나면" 같은 복잡한 문장에서도 `weapon`이라는 정확한 객체를 AI가 능동적으로 분류해 DB에 저장할 수 있게 되었습니다!
