# Phase 7: 누락 기능 연동 및 시맨틱 API 활성화 (최종 고도화)

기존 분석 보고서에서 발견된 주요 누락 항목(VSS 시맨틱 검색, 회원가입, VLM 사건 보고서 생성)들을 실제 시스템에 연동하여 명세서 요구사항 100% 달성을 목표로 합니다.

## User Review Required

> [!WARNING]  
> **VSS (시맨틱 검색) DB 환경에 대한 결정 사항**  
> 원래 기획서에는 PostgreSQL 및 `pgvector` 기반의 벡터 검색을 명시하였으나, 현재 로컬 환경의 복잡도를 낮추기 위해 **SQLite**로 구동 중입니다.  
> 만약 PostgreSQL(pgvector)로 전환하려면 Docker 세팅 및 DB 마이그레이션이 필요합니다.  
> **본 계획안은 기존 SQLite 환경을 유지하면서, 백엔드 내부 로직에서 단순 문자열/키워드 유사도 매칭(`difflib` 등)을 사용해 VSS(시맨틱 검색) 기능이 동작하는 것처럼 모의(Mock) 구현하는 방안을 제안합니다.** (기능 시각화 목적 최적화)

## Proposed Changes

---
### 1. 백엔드 (Backend API) 신설 및 CRUD 업데이트

#### [MODIFY] `e:\projects\ewVLM\backend\crud.py`
- 신규 사용자 가입 처리를 위한 `create_user` 함수 추가 (Bcrypt 비밀번호 해싱 적용).
- 시맨틱 검색을 모방하는 `search_events_semantic(query)` 함수 추가. (SQLite DB의 `EventLog.semantic_caption` 등을 단순 텍스트 매칭하여 유사도 높은 순으로 반환).

#### [MODIFY] `e:\projects\ewVLM\backend\ewvlm_fastapi_gateway.py`
- **Signup API**: `POST /api/v1/auth/signup` 추가.
- **VSS API**: `POST /api/v1/vss/search` 추가. 프론트엔드의 자연어 검색 질의를 받아 `crud.py`의 모의 VSS 함수 호출.
- **Event Report API**: `GET /api/v1/events/{id}/report` 추가. 특정 사건의 타임라인과 지자체 가이드라인을 융합한 "가상의 VLM 자동 요약 리포트 텍스트" 반환.
- **Trigger 고도화**: `POST /api/v1/escalation/trigger` 반환 스키마에 바운딩 박스(x,y,w,h) 및 어텐션 스코어를 추가하여 UI 시각화 강화.

---
### 2. 프론트엔드 (Frontend UI) 연동

#### [MODIFY] `e:\projects\ewVLM\frontend\src\api\client.ts`
- `signup(username, password)` 메서드 추가.
- `searchVss(query)` 메서드 추가.
- `getEventReport(eventId)` 메서드 추가.

#### [MODIFY] `e:\projects\ewVLM\frontend\src\components\Signup.tsx`
- 단순히 폼만 있던 컴포넌트에 상태(State)와 `onChange`, `onSubmit` 핸들러를 붙여 실제 `API.signup`을 호출하고 성공 시 로그인 페이지로 이동하도록 로직 연동.

#### [MODIFY] `e:\projects\ewVLM\frontend\src\components\VssSemanticSearch.tsx`
- 사용자 검색 텍스트를 받아 `API.searchVss`에 넘기고, 반환된 이벤트 배열을 좌측 타임라인에 렌더링. 검색 중 로딩 스피너 및 자연어 처리 애니메이션 추가.

#### [MODIFY] `e:\projects\ewVLM\frontend\src\components\EventReviewCenter.tsx`
- 이벤트 클릭 시 `API.getEventReport`를 호출하여 화면 우측 `Incident Report (AI Auto-Generated)` 영역에 실제 텍스트가 바인딩되도록 변경.

## Verification Plan

### Automated Tests
- `curl` 또는 Python 테스트 스크립트로 `/api/v1/auth/signup`, `/api/v1/vss/search` 엔드포인트의 200 OK 여부를 검증합니다.

### Manual Verification
- 브라우저를 열어 회원가입 페이지에서 새 계정 생성 및 로그인을 시도합니다.
- `자연어 룰셋 코파일럿` 또는 `VSS 시맨틱 검색` 페이지에서 텍스트(예: "빨간 가방을 멘 사람")를 검색해 검색 결과가 팝업되는지 확인합니다.
- 사건 리뷰 센터에서 이벤트를 클릭하여 AI 텍스트 리포트가 화면에 표시되는지 확인합니다.
