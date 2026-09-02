# [1차 개선] 다중 프레임 분석(Temporal Context) 및 구조화된 출력(JSON) 적용

현재 VLM 영상분석 파이프라인이 안고 있는 단일 프레임 의존성(스틸컷 1장으로 동적 이벤트 판별 불가)과 단순 텍스트 매칭의 파싱 취약점을 개선합니다. 사용자의 "순서대로 하나씩 진행" 요청에 따라, 가장 시급하고 핵심적인 첫 두 항목(1번, 2번 개선점)에 대한 통합 리팩토링을 먼저 진행합니다.

## 변경 목적 (Goal)
1. **Multi-Frame Grid (Temporal Context):** `fast_loop.py`에서 최근 프레임을 버퍼링(메모리 큐)하여 이벤트 발생 시 4장의 프레임(예: 과거~현재)을 2x2 그리드 이미지로 병합(Stitching)합니다. 이를 통해 한 번의 VLM API 호출로도 모델이 시간적 변화(Temporal Context)를 인식할 수 있게 합니다.
2. **Structured JSON Output:** `ewvlm_fastapi_gateway.py`와 `ewvlm_lmstudio_bridge.py`의 프롬프트를 고도화하여 VLM이 반드시 정해진 JSON 스키마로 응답하게 만들고, 파이썬의 `json.loads`로 확실하게 위협 수준과 권장 조치를 파싱합니다.

> [!IMPORTANT]
> **다중 이미지 vs 그리드(Grid) 이미지 선택 전략**
> 일부 오픈소스 VLM(예: LLaVA, 일반 Llama Vision)은 API 호환성 문제로 한 프롬프트에 여러 장의 이미지를 넣으면 에러가 나거나 맥락을 상실할 수 있습니다. 4장의 이미지를 OpenCV로 하나의 2x2 이미지(Grid)로 합쳐서 보내는 방식을 사용하면, 모든 VLM과 호환되면서도 토큰 소비를 극적으로 줄이고 시계열 변화를 한 눈에 파악하게 할 수 있습니다.

## Proposed Changes

---

### `fast_loop.py` (Fast-loop 객체 탐지 및 엣지 필터링)

#### [MODIFY] [fast_loop.py](file:///e:/projects/ewVLM/backend/fast_loop.py)
- `collections.deque`를 사용하여 각 카메라별로 최근 30~60프레임(약 1~2초 분량)을 메모리에 순환 저장(Sliding Window)하는 버퍼 로직 추가.
- `escalation` 트리거 발생 시, 큐에 쌓인 프레임 중 일정한 간격으로 4장을 추출하여 2x2 그리드 형태의 단일 이미지로 합성.
- 생성된 그리드 이미지를 `video_segment_chunk_path`로 저장하고 API Gateway로 전송.

---

### `ewvlm_fastapi_gateway.py` (API Gateway & VLM 스케줄러)

#### [MODIFY] [ewvlm_fastapi_gateway.py](file:///e:/projects/ewVLM/backend/ewvlm_fastapi_gateway.py)
- `execute_vlm_inference_pipeline` 내의 VLM 프롬프트를 전면 수정하여, "다음 4컷의 이미지는 시간 순서대로 배열된 CCTV 영상입니다."라는 맥락(Context)을 부여.
- 응답 형식을 강제로 지정: "반드시 아래 JSON 형식으로만 응답하시오: `{"threat_level": "critical_danger" | "safety_warning" | "safe", "summary": "...", "action": "..."}`"
- `"위협 수준] 심각"` 문자열 탐색 로직을 제거하고, 정규식 또는 `json.loads`를 통한 견고한 구조체 파싱(Structured Parsing) 적용.

---

### `ewvlm_lmstudio_bridge.py` & `ewvlm_ollama_bridge.py`

#### [MODIFY] [ewvlm_lmstudio_bridge.py](file:///e:/projects/ewVLM/backend/ewvlm_lmstudio_bridge.py)
- 프롬프트에 명시적인 `response_format` 인스트럭션 추가 (또는 시스템 메시지 강화).
- (Ollama 브릿지도 동일한 규격 적용)

---

## Verification Plan

### 수동 검증 (Manual Verification)
- 서버 구동 후 더미 비디오(`sample_video.mp4` 또는 `mock_videos/cam-01.mp4`)에서 이벤트가 트리거되는 것을 확인.
- `temp` 폴더에 생성되는 `video_segment_chunk_path` 이미지가 4컷(2x2) 형태의 그리드로 올바르게 생성되는지 육안 확인.
- VLM의 답변이 정확히 JSON 형태로 떨어지는지 터미널 로그와 `EventLog` 데이터베이스 저장 내역(semantic_caption 필드)을 통해 검증.

> [!NOTE]
> 해당 계획은 전체 진단 보고서의 1번, 2번 개선안에 해당하며, 이 작업이 완료되어 승인되면 객체 추적(3번) 및 백프레셔 큐(4번), VectorDB(5번) 작업으로 순차 진행할 예정입니다.
