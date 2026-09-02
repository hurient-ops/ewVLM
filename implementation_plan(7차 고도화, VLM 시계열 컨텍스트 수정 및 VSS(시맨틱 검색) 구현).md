# 7차 고도화: VLM 시계열 컨텍스트 수정 및 VSS(시맨틱 검색) 구현

이전 분석 보고서(`vlm_analysis_evaluation.md`)에서 식별된 **"VLM 코어 분석 파이프라인"**의 잔여 개선 과제 중 1번(다중 프레임 시계열)과 5번(시맨틱 검색) 항목을 상용 수준으로 끌어올리는 7차 개선안입니다.

## User Review Required
> [!IMPORTANT]
> - VSS 자연어 검색(Semantic Search) 기능 구현을 위해 `SentenceTransformer` 모델(`all-MiniLM-L6-v2`)을 사용하여 메모리 내장 배열 기반의 코사인 유사도 연산을 수행합니다. SQLite 환경에서의 한계를 보완하는 방식으로 별도의 무거운 VectorDB 설치 없이 빠른 검색이 가능해집니다.

## Proposed Changes

---

### `ewvlm_fastapi_gateway.py`

#### [MODIFY] `ewvlm_fastapi_gateway.py`
1. **시계열 다중 프레임(Temporal Grid) 바이패스 버그 수정**
   - 현재 `execute_vlm_inference_pipeline` 로직은 카메라에 RTSP 주소가 있으면 `fast_loop.py`가 힘들게 만들어 넘겨준 4프레임 병합 그리드(2x2)를 무시하고 RTSP에서 실시간 스틸 컷(1장)을 새로 추출하고 있습니다.
   - RTSP URL 유무와 상관없이 무조건 `video_segment_chunk_path`(2x2 그리드 이미지)를 VLM 엔진에 전달하도록 수정하여 VLM이 "시간적 맥락(Temporal Context)"을 잃지 않게 합니다.

2. **VSS(Video Semantic Search) 엔드포인트 신설**
   - 프론트엔드가 호출하는 `POST /api/v1/vss/search` 엔드포인트를 신규 구현합니다.
   - 사용자의 자연어 쿼리(`query`)를 `get_text_embedding()`으로 384차원 벡터로 인코딩한 뒤, DB의 `EventLog` 데이터들을 모두 로드하여 코사인 유사도(Cosine Similarity)를 계산하고 상위 `limit` 개의 이벤트를 반환합니다.

3. **이벤트 생성 시 임베딩(Embedding) 저장 로직 추가**
   - VLM 분석이 완료되고 `crud.create_event`를 호출할 때, `caption` 텍스트를 `get_text_embedding()` 함수로 벡터화하여 DB에 함께 저장(Insert)하도록 백그라운드 파이프라인을 수정합니다.

---

### `crud.py`

#### [MODIFY] `crud.py`
1. **`create_event` 스키마 확장**
   - `EventLog` 테이블에 `embedding` 값이 저장될 수 있도록 `event_data.get("embedding")` 파싱 및 할당 로직을 추가합니다.

---

## Verification Plan

### 수동 검증 (Manual Verification)
1. 시스템 가동 후 CCTV에 객체(사람/차량)가 탐지될 때 생성되는 이벤트 썸네일(video_segment_chunk_path)이 **2x2 그리드 형식으로 정상 노출**되는지 UI에서 확인합니다.
2. 프론트엔드의 좌측 패널 `자연어 기반 영상 검색 (VSS)` 메뉴로 이동합니다.
3. 검색창에 **"빨간 모자를 쓴 사람"** 또는 **"트럭 진입"** 과 같이 자연어 쿼리를 입력하고 검색 버튼을 누릅니다.
4. 새로 만든 `/api/v1/vss/search` 엔드포인트가 유사도에 기반하여 관련 과거 이벤트들을 정확하게 리스팅하는지 확인합니다.
