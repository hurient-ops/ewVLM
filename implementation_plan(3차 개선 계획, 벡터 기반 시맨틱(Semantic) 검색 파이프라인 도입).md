# 3차 개선 계획: 벡터 기반 시맨틱(Semantic) 검색 파이프라인 도입

마지막 취약점인 "단순 키워드 매칭 검색의 한계"를 해결하기 위해 벡터 임베딩 기반의 시맨틱 검색(자연어 문맥 검색)을 도입합니다.

## User Review Required

> [!IMPORTANT]
> **벡터 데이터베이스 아키텍처 결정 요청**
> 
> 현재 `database.py`를 보면 로컬 환경(`sqlite+aiosqlite`)을 폴백(Fallback)으로 사용 중입니다. SQLite에는 `pgvector` 확장을 바로 사용할 수 없습니다. 따라서 다음 아키텍처로 구현하고자 하는데 동의하시는지 확인 부탁드립니다.
>
> 1. **임베딩 스토리지**: `models.EventLog` 테이블에 `embedding = Column(JSON)` 필드를 추가하여 텍스트 임베딩 벡터를 저장합니다.
> 2. **임베딩 모델**: 로컬 환경을 고려하여 `sentence-transformers` 패키지(예: `all-MiniLM-L6-v2` 모델)를 사용하여 VLM이 생성한 `semantic_caption`을 384차원 벡터로 변환합니다.
> 3. **검색 API (`GET /api/v1/search/semantic`)**: 사용자가 "어제 헬멧 안 쓴 사람 찾아줘"라고 검색하면, 질문을 벡터화한 뒤 DB의 이벤트 임베딩들과 **코사인 유사도(Cosine Similarity)**를 계산하여 가장 문맥이 유사한 상위 K개의 이벤트를 반환합니다.

## Proposed Changes

### [e:\projects\ewVLM\backend\models.py]

- **[MODIFY]** `EventLog` 모델 수정
  - `embedding = Column(JSON, nullable=True)` 추가 (SQLite 호환을 위해 JSON 배열로 저장)

### [e:\projects\ewVLM\backend\ewvlm_fastapi_gateway.py]

- **[MODIFY]** 임베딩 생성 및 저장 로직 추가
  - `sentence_transformers`를 이용한 경량 임베딩 헬퍼 함수 추가.
  - `execute_vlm_inference_pipeline`에서 VLM이 반환한 `semantic_caption`을 벡터화하여 데이터베이스에 저장할 때 `embedding` 필드에도 함께 기록하도록 수정.
- **[NEW]** `/api/v1/search/semantic` 엔드포인트 생성
  - 파라미터로 `query` (검색어), `limit` (반환 개수)를 받음.
  - 검색어를 벡터화한 뒤, 전체 `EventLog`의 임베딩과 Numpy를 사용하여 코사인 유사도를 계산하고 정렬하여 결과 반환.

## Verification Plan

### Manual Verification
1. API에 `sentence-transformers`를 적용한 후, VLM 이벤트가 발생할 때 DB의 `embedding` 컬럼에 Float 배열이 정상 저장되는지 확인.
2. Swagger UI (`/docs`)에서 `/api/v1/search/semantic`에 "비인가자의 침입 흔적" 같은 모호한 문장으로 검색 시, 해당 상황과 의미적으로 가장 유사한 이벤트가 최상단에 검색되는지 확인.
