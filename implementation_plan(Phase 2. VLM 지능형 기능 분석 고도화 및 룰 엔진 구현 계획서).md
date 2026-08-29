# Phase 2: VLM 지능형 기능 분석 고도화 및 룰 엔진 구현 계획서

사용자님이 말씀해주신 "Natural Language Rule Copilot에서 시뮬레이션 버튼 실패" 버그를 완벽히 픽스하고, 당사의 핵심 경쟁력인 **지능형 기능(VLM 이벤트 & 룰 엔진)**의 UI/UX를 고도화하는 2단계 계획서입니다.

## User Review Required

> [!TIP]
> 배포(Deploy) 버튼을 누르면 단순히 화면이 끝나는 것이 아니라, **실제로 가상의 VLM 이벤트(예: 트럭 감지)를 백엔드에 발생**시켜 관제 대시보드에서 알람이 울리도록 시나리오를 연결하려고 합니다. 

## Proposed Changes

### 백엔드 (Backend - FastAPI & DB)
---
#### [MODIFY] [ewvlm_fastapi_gateway.py](file:///e:/projects/ewVLM/backend/ewvlm_fastapi_gateway.py)
- `generate_sop_rule` 엔드포인트의 입력 모델(`NLRuleRequest`) 및 출력 구조를 프론트엔드(Axios)와 완벽히 일치하도록 점검하고 디버깅합니다. (시뮬레이션 실패 원인 제거)
- 프론트엔드에서 수동으로 모의 이벤트를 주입(Inject)할 수 있는 테스트용 POST 엔드포인트(`/api/v1/events/simulate`)를 추가합니다.

### 프론트엔드 (Frontend - React & Zustand)
---
#### [MODIFY] [NaturalLanguageRuleCopilot.tsx](file:///e:/projects/ewVLM/frontend/src/components/NaturalLanguageRuleCopilot.tsx)
- `handleSimulate` 실행 시 발생하는 500 에러 및 파라미터 불일치 버그를 해결합니다.
- 시뮬레이션(Simulation) 완료 후, 우측 카메라 프리뷰 화면에 **실시간 바운딩 박스(Bounding Box)** 및 추적 애니메이션 UI를 추가하여 시각적 효과(Wow Point)를 극대화합니다.
- **[배포(Deploy) 버튼]** 클릭 시, 방금 생성된 룰을 기반으로 백엔드에 모의 이벤트를 발생시켜 관제 화면으로 넘어가면 알람이 들어와 있도록 워크플로우를 연결합니다.

#### [MODIFY] [EventLogDashboard.tsx](file:///e:/projects/ewVLM/frontend/src/components/EventLogDashboard.tsx) (및 관련 스토어)
- 발생한 VLM 지능형 이벤트 로그를 단순히 텍스트 리스트가 아니라, 썸네일과 신뢰도(Confidence Score), 매칭된 객체(Object)를 강조하는 카드로 리팩토링합니다.
- 특정 이벤트를 클릭하면 팝업 모달이 뜨면서 해당 시점의 "녹화 영상 스트리밍(Phase 1 연동 결과물)"이 재생되도록 합니다.

## Verification Plan

### Manual Verification
1. 자연어 룰 코파일럿에서 프롬프트를 입력하고 "시뮬레이션 시작"을 누를 때 성공 텍스트와 우측 가상 바운딩 박스가 예쁘게 그려지는지 확인.
2. "AI 규칙 양산 및 배포" 클릭 후, 이벤트 대시보드로 이동하면 방금 만든 룰에 의한 경고 알람 로그가 실시간으로 쌓이는지 확인.
3. 이벤트 로그 클릭 시, 영상 팝업이 부드럽게 렌더링되는지 확인.
