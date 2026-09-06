# ewVLM 프로젝트 최종 최적화 및 안정화 계획 (Phase 20+)

본 과제는 앞선 MOCK 데이터 잔재 현황 분석을 기반으로, 가장 치명적이고 중요한 4가지 개선 항목을 해결하여 시스템을 100% 프로덕션(Production) 레벨로 끌어올리기 위한 최종 계획서입니다.

## User Review Required

> [!WARNING]
> 과거 VSS 시맨틱 검색에서 임시로 사용하던 더미 엔드포인트(`line 1145`)와 `DATABASE_MOCK` 변수를 완전히 삭제합니다. 만약 해당 배열이나 경로에 강하게 결합된 과거 프론트엔드 코드가 있다면 에러가 발생할 수 있습니다. 

## Open Questions

없음.

## Proposed Changes

---

### [정리] 레거시 MOCK 데이터베이스 및 중복 경로 제거

#### [MODIFY] [ewvlm_fastapi_gateway.py](file:///e:/projects/ewVLM/backend/ewvlm_fastapi_gateway.py)
- 백엔드 파일 상단에 선언되어 있는 `DATABASE_MOCK = { ... }` 전역 변수 구조체를 완전히 삭제하여 메모리 누수를 원천 차단합니다.
- `vlm_task_worker` 루프 등에서 `DATABASE_MOCK["vlm_events"].append(...)` 형태로 배열에 값을 쑤셔넣던 더미 코드 블록을 삭제합니다.
- `POST /api/v1/vss/search` 경로가 중복 정의되어 있습니다. 상단(약 1145 라인)에 위치한 "키워드 기반의 더미 의도 추출" 라우트를 과감히 삭제하고, 하단의 `sentence-transformers` 기반 진짜 시맨틱 검색 라우트 하나만 남겨 충돌을 해소합니다.

---

### [AI 연동] 진짜 AI 사건 종합 보고서(Report) 생성기 구축

#### [MODIFY] [ewvlm_fastapi_gateway.py](file:///e:/projects/ewVLM/backend/ewvlm_fastapi_gateway.py)
- `GET /api/v1/events/{id}/report` 호출 시 현재 뿜어내고 있는 하드코딩된 `"🚨 [VLM 종합 보고서..."` 텍스트를 삭제합니다.
- `id`(escalation_id)를 통해 SQLite DB에서 실제 `EventLog` 엔티티를 조회하도록 쿼리 로직(`select`)을 추가합니다.
- 조회된 사건의 캡션(`semantic_caption`)과 위험도를 기반으로, 기존에 구축되어 있는 `LMStudioVLMBridge.query_lmstudio_vision` (프롬프트 주입) 함수에 텍스트를 던져 **"관제사에게 보고할 실제 한국어 AI 요약 리포트"** 를 생성한 뒤 반환하도록 파이프라인을 연결합니다.

---

### [UI 연동] PTZ 조이스틱 컨트롤러 실제 API 연결

#### [MODIFY] [MonitorALiveControl.tsx](file:///e:/projects/ewVLM/frontend/src/components/MonitorALiveControl.tsx)
- 현재 UI 상의 껍데기 버튼(상/하/좌/우/줌인/줌아웃)들에 바인딩된 빈 이벤트 리스너를 교체합니다.
- 클릭 이벤트 발생 시 백엔드 엔드포인트인 `POST /api/v1/camera/ptz` 로 `{"action": "up", "camera_id": slot.cameraId}` 와 같은 Payload를 담아 HTTP(Axios/Fetch) 요청을 쏘도록 통신부를 작성합니다.

---

### [인프라] 물리 통신 프로토콜 실패 처리 (Graceful Degradation)

#### [MODIFY] [ewvlm_fastapi_gateway.py](file:///e:/projects/ewVLM/backend/ewvlm_fastapi_gateway.py)
- `get_nvr_status` 등에서 난수를 뱉어내는 `_get_mock_stats()` 대신, 향후 `pysnmp` 패키지 등의 실제 로직이 들어갈 자리에 `try-except` 블록을 씌우고, 실패 시나리오(장비 연결 끊김 등)에서만 Mock 난수를 반환하도록 "안전한 롤백(Fallback)" 구조를 완성합니다.

---

## Verification Plan

### Automated Tests
- 백엔드 파일(`ewvlm_fastapi_gateway.py`) 수정 후 `python -m py_compile` 을 통해 문법 및 Indentation 에러 여부 점검.
- 프론트엔드(`MonitorALiveControl.tsx`) TS 컴파일 에러 검사.

### Manual Verification
- 멀티 캔버스 모니터링 화면에서 카메라 슬롯의 PTZ 십자 패드를 눌러봤을 때, 브라우저 네트워크 탭에 `POST /api/v1/camera/ptz` 요청이 정상적으로 200 OK를 띄우는지 점검합니다.
- 사건 상세 탭을 눌러 VLM 리포트를 조회할 때, 매번 똑같은 문구가 아닌 AI가 실제로 사건에 맞게 동적으로 텍스트를 생성(Generation)해 내는지 눈으로 확인합니다.
