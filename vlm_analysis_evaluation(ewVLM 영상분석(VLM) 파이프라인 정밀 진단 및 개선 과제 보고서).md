# ewVLM 영상분석(VLM) 파이프라인 정밀 진단 및 개선 과제 보고서

현재 구현된 `ewVLM` 시스템의 영상분석 파이프라인은 엣지(Edge) 단에서의 YOLOv11 객체 탐지와 PaliGemma 2를 통한 1차 필터링(Fast-loop), 그리고 중앙 서버에서의 Llama 3.2 11B Vision을 활용한 심층 분석(Slow-loop)이라는 훌륭한 하이브리드 아키텍처를 갖추고 있습니다.

하지만 소스코드를 정밀하게 분석한 결과, 본격적인 프로덕션(Production) 및 엔터프라이즈 환경에 투입하기에는 **"영상(Video) 분석의 본질적 한계"**와 **"백엔드 시스템의 확장성"** 측면에서 몇 가지 미진한 부분과 개선이 필수적인 영역이 발견되었습니다.

---

## 🚨 1. 단일 프레임 의존성 (Temporal Context 부재)

현재 `execute_vlm_inference_pipeline` 로직을 보면, VLM에 영상을 전달할 때 비디오 클립을 분석하는 것이 아니라 **단 1장의 스틸 컷(Frame)만 추출하여 전송**하고 있습니다.

```python
# ewvlm_fastapi_gateway.py (Line 372)
base64_img, _, _ = vlm_bridge.extract_and_encode_frame(video_path, 0)
```

- **문제점:** 로그 상에는 `Applying SlowFast Token compression: 300 frames -> 45 compressed token embeddings` 라고 출력되지만, 이는 시뮬레이션된 Mock 로그일 뿐 실제로는 단일 이미지만 전송됩니다. 스틸 컷 1장으로는 '배회', '폭행', '침입 중'과 같은 시계열(시간의 흐름)이 중요한 동적 이벤트를 절대 판별할 수 없습니다.
- **개선 방안:** 영상 클립(예: 3~5초)에서 4~8장의 프레임을 균일하게 추출하여 연속된 이미지 프롬프트(Multi-image prompt)로 구성하거나, 비디오 네이티브 처리가 가능한 모델(예: LLaVA-Video, Gemini 1.5 Pro)로 업그레이드하여 시계열 추론(Temporal Reasoning)을 수행해야 합니다.

## 🚨 2. 비정형 텍스트 파싱의 취약점 (Structured Output 부재)

VLM 모델로부터 결과를 받아와서 위협 수준을 판별하는 로직이 매우 단순한 문자열 매칭(String Matching)에 의존하고 있습니다.

```python
# ewvlm_fastapi_gateway.py (Line 427)
if "위협 수준] 심각" in caption:
    detected_actions.append("critical_danger")
```

- **문제점:** LLM/VLM은 생성형 모델이므로 출력 형식이 미세하게 달라질 수 있습니다(예: "위협 수준: 심각" 또는 "현재 위협 수준은 심각입니다"). 현재 로직은 텍스트가 정확히 일치하지 않으면 오작동하거나 이벤트를 누락할 확률이 높습니다.
- **개선 방안:** LM Studio / Ollama의 **JSON Mode (또는 Function Calling)** 기능을 강제하여, 모델이 반드시 정해진 JSON 스키마(`{"threat_level": "critical", "reason": "...", "confidence": 0.95}`)로 응답하도록 프롬프트를 재설계해야 합니다.

## 🚨 3. 객체 추적(Object Tracking) 알고리즘 부재

`fast_loop.py`에서 YOLOv11을 통해 객체를 탐지할 때, 프레임 간 동일 객체를 식별하는 Tracking 알고리즘(예: DeepSORT, ByteTrack)이 빠져있습니다.

```python
# fast_loop.py (Line 185)
detected_objects.append({
    "target_uid": f"{class_name}_{int(time.time()*1000)}", ...
})
```

- **문제점:** 카메라 앞에 서 있는 동일한 인물이라도 매 프레임마다 새로운 `target_uid`가 발급됩니다. 이로 인해 동일한 이벤트를 중복해서 VLM으로 쏘게 되어(Throttling이 없다면) 백엔드 VRAM 폭발과 API 과부하를 초래할 수 있습니다.
- **개선 방안:** YOLO 결과에 ByteTrack Tracker를 결합하여 객체에 고유 ID를 부여하고, "새로운 ID가 등장했을 때" 또는 "특정 ID가 위험 구역에 진입했을 때"만 이벤트를 트리거하도록 로직을 고도화해야 합니다.

## 🚨 4. VLM 워커 큐 및 백프레셔(Backpressure) 제어 미흡

API Gateway에서 `BackgroundTasks`를 통해 VLM 추론을 비동기로 넘기고 있으나, 시스템 자원(VRAM, 동시성)에 대한 엄격한 제어 장치가 부족합니다.

- **문제점:** 4대의 카메라에서 동시에 다수의 이벤트가 발생하면 `BackgroundTasks`에 수십 개의 추론 작업이 쏟아집니다. LM Studio나 Ollama는 동시 요청이 몰리면 OOM(Out of Memory)으로 크래시가 발생하거나 응답 지연이 기하급수적으로 늘어납니다.
- **개선 방안:** `Redis Queue (RQ)`나 `Celery`, 혹은 파이썬 내부의 `asyncio.Queue`를 도입하여 VLM 워커의 최대 동시 처리량(Concurrency Limit)을 모델 크기에 맞게 1~2개로 제한하는 큐 링(Queuing) 시스템을 구축해야 합니다.

## 🚨 5. pgvector 등 벡터 DB 시맨틱 검색 미구현

시스템 스펙 상에는 "database entries with pgvector"를 사용한다고 되어있으나, 실제 `models.EventLog`는 단순한 SQLite `String` 필드(`semantic_caption`)로만 구성되어 있습니다.

- **문제점:** 사용자가 "빨간 모자를 쓰고 담장을 넘는 사람 찾아줘" 와 같이 자연어로 과거 이벤트를 검색(Semantic Search)하는 기능이 불가능합니다.
- **개선 방안:** VLM이 생성한 텍스트 캡션을 텍스트 임베딩 모델(예: `text-embedding-3` 또는 로컬 BERT)을 통과시켜 768/1536 차원의 벡터로 변환한 뒤, SQLite 에서는 `sqlite-vec` 확장이나 `ChromaDB` / `Milvus` 같은 벡터 데이터베이스에 저장하는 파이프라인을 추가해야 진정한 차세대 VLM 관제 시스템이 완성됩니다.

---

### 💡 총평 및 다음 단계 권장 사항

현재 시스템은 **UI와 시스템 통신(연동) 측면에서는 완벽한 데모 수준**에 도달했으나, **코어 AI 로직과 백엔드 데이터 처리의 깊이**가 다소 얕은(Mock-up) 상태입니다.

만약 실제 프로덕션 수준으로 시스템을 끌어올리고 싶으시다면, 위 5가지 항목 중 가장 우선적으로 **1. 다중 프레임 비디오 분석(시계열 컨텍스트 도입)** 및 **2. JSON 구조화 출력(Structured Output) 적용**을 진행하는 것을 강력히 권장합니다. 

해당 항목들 중 즉각적인 보완 코딩이 필요한 부분을 말씀해 주시면, 바로 분석 및 리팩토링을 진행하겠습니다!
