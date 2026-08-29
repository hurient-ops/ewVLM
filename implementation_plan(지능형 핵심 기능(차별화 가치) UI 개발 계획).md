# 지능형 핵심 기능(차별화 가치) UI 개발 계획

제안해 드린 방향성 중 첫 번째이자 ewVLM 솔루션의 가장 핵심적인 무기가 될 **지능형 기능(Intelligent Features) 3종**에 대한 프론트엔드/백엔드 연동 개발 계획입니다.

## User Review Required
> [!IMPORTANT]
> 본 계획은 프론트엔드 UI를 단순히 그리는 것을 넘어, 백엔드(`ewvlm_fastapi_gateway.py`)에 피드백 수집 및 VLM 시뮬레이션 API를 추가하여 실제 시스템처럼 작동하게 만드는 과정이 포함되어 있습니다. 내용을 확인하시고 'Proceed' 버튼을 눌러 승인해 주시면 개발을 시작하겠습니다.

## Open Questions
> [!TIP]
> 1. 이벤트 리뷰 시 관제사가 '오탐(무시)' 처리를 하면 해당 이벤트를 삭제 상태로 숨길까요, 아니면 취소선 처리 후 남겨둘까요? (현재 계획: 리스트에서 즉시 제거하여 집중도를 높임)
> 2. 코파일럿(자연어 룰셋) 적용 시 백엔드에 저장할지, 아니면 현재처럼 Zustand Store(로컬 상태)에 임시로 저장할지 결정이 필요합니다. (현재 계획: 우선 Store에 연동하여 UI 테스트가 가능하게 구현)

---

## Proposed Changes

### 1. 이벤트 리뷰 센터 (Event Review Center)
관제사가 VLM의 탐지 결과를 리뷰하고 정답(True) / 오답(False) 피드백을 주어 모델 재학습(Active Learning)용 데이터를 수집하는 핵심 화면입니다.

#### [MODIFY] `e:\projects\ewVLM\backend\ewvlm_fastapi_gateway.py`
- `POST /api/v1/events/{escalation_id}/feedback` API 엔드포인트 추가
- 관제사의 피드백(검증/무시)을 받아 DB(또는 Mock 상태)에 업데이트하고 로깅

#### [MODIFY] `e:\projects\ewVLM\frontend\src\api\client.ts`
- 피드백 API 호출 함수(`submitEventFeedback`) 추가

#### [MODIFY] `e:\projects\ewVLM\frontend\src\components\EventReviewCenter.tsx`
- 하단 Action 패널의 "무시 (오탐)" 및 "검증: 실제 이벤트" 버튼에 `onClick` 핸들러 연결
- API 호출 완료 시 대기열(리스트)에서 해당 이벤트를 부드럽게 제거(애니메이션)하고 다음 이벤트 자동 선택

### 2. 자연어 기반 영상 검색 (VSS Semantic Search)
"빨간 모자를 쓴 사람 찾아줘"와 같은 자연어 검색 쿼리의 의도를 시각적으로 보여주고 결과를 뿌려주는 화면입니다.

#### [MODIFY] `e:\projects\ewVLM\backend\ewvlm_fastapi_gateway.py`
- `POST /api/v1/vss/search` 개선: 단순 키워드 검색이 아닌, 자연어에서 추출한 '검색 의도(Intent - 타겟 객체, 행동, 장소)'를 함께 반환하도록 Mock VLM 로직 고도화

#### [MODIFY] `e:\projects\ewVLM\frontend\src\components\VssSemanticSearch.tsx`
- 백엔드에서 넘겨준 '검색 의도'를 검색창 하단 칩(Chip) 형태로 시각화
- 검색 결과 타일의 썸네일과 신뢰도를 실제 데이터에 맞게 동적 렌더링하도록 UI 개선

### 3. 자연어 관제 룰셋 코파일럿 (NL Rule Copilot)
사용자가 "정문에 트럭이 역주행하면 알림"이라고 쓰면 VLM이 시스템 룰셋(SOP)으로 변환해주는 화면입니다.

#### [MODIFY] `e:\projects\ewVLM\backend\ewvlm_fastapi_gateway.py`
- `POST /api/v1/sop/rules/generate` API 추가: 자연어 입력 시 `trigger_class`, `confidence_threshold`, `target_object` 등을 구조화된 JSON으로 변환하여 반환

#### [MODIFY] `e:\projects\ewVLM\frontend\src\components\NaturalLanguageRuleCopilot.tsx`
- "제로샷 시뮬레이션 시작" 클릭 시 신규 API 연동 및 AI 응답(말풍선) 동적 렌더링
- "라이브 자산에 배포" 클릭 시 글로벌 상태(`useSopStore`)에 룰을 등록하여 다른 화면에서도 확인 가능하도록 연결

---

## Verification Plan

### Automated / Backend Tests
- 백엔드에 새로 추가된 `/feedback`, `/generate` API의 cURL 또는 Python 스크립트 테스트 호출
- 상태 코드가 정상(`200 OK`)인지 확인

### Manual Verification
1. **Event Review Center:** 왼쪽 큐에서 이벤트를 선택하고 "검증" 또는 "무시"를 클릭했을 때 대기열에서 사라지는지 눈으로 확인.
2. **VSS Semantic Search:** 검색창에 "서쪽 계단 근처에서 쓰러진 사람" 입력 후 Enter 시, 필터 조건(의도)이 UI에 제대로 쪼개져서 나타나는지 확인.
3. **Rule Copilot:** 텍스트를 입력하고 '배포'를 눌렀을 때 오류 없이 룰셋이 생성되는지 확인.
