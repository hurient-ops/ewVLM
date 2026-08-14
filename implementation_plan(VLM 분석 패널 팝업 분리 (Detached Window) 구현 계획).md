# VLM 분석 패널 팝업 분리 (Detached Window) 구현 계획

사용자님의 요청에 따라 VLM 분석(Event Review Center) 화면을 별도의 브라우저 창으로 분리하고, 다시 본 화면으로 합칠 수 있는 기능을 구현합니다. 다중 모니터 환경에서 관제 효율을 극대화하기 위해 자주 사용되는 방식입니다.

## 기능 개요
- **분리하기 (Detach)**: 메인 화면에서 버튼을 누르면 VLM 분석 컴포넌트가 새 브라우저 창(팝업)으로 뜹니다. 메인 화면의 해당 영역은 "새 창에서 실행 중"이라는 플레이스홀더로 대체됩니다.
- **합치기 (Attach)**: 팝업 창에서 '다시 합치기' 버튼을 누르거나 창을 닫으면(X 버튼), 메인 화면의 플레이스홀더가 사라지고 다시 원래대로 VLM 분석 화면이 나타납니다.
- **상태 동기화**: 브라우저의 `BroadcastChannel` API를 사용하여 메인 창과 분리된 창 간의 상태(열림/닫힘)를 실시간으로 동기화합니다.

## Proposed Changes

### 1. 라우팅 추가 (App.tsx)
분리된 창은 상단 헤더나 좌측 사이드바 없이 VLM 화면만 꽉 차게 보여야 합니다. 이를 위해 레이아웃이 없는 독립된 라우트를 추가합니다.
#### [MODIFY] [App.tsx](file:///e:/projects/ewVLM/frontend/src/App.tsx)
- `<Route path="/event-review-detached" element={<EventReviewCenter isDetachedView={true} />} />` 라우트를 `BaseLayout` 외부에 추가합니다.

### 2. VLM 분석 화면 개선 (EventReviewCenter.tsx)
기존 화면을 수정하여 팝업 분리 모드와 통신 로직을 추가합니다.
#### [MODIFY] [EventReviewCenter.tsx](file:///e:/projects/ewVLM/frontend/src/components/EventReviewCenter.tsx)
- **Props 추가**: `isDetachedView?: boolean`
- **BroadcastChannel 연동**: `vlm_window_sync` 채널을 생성하여 `detach`, `attach`, `ping` 등의 메시지를 주고받습니다.
- **메인 화면 (isDetachedView = false)**:
  - 우측 상단에 `[새 창으로 분리]` 버튼 추가.
  - 분리 상태일 경우 기존 UI 대신 "현재 VLM 분석이 새 창에서 실행 중입니다" 플레이스홀더와 `[본 화면으로 가져오기]` 버튼 표시.
- **분리된 화면 (isDetachedView = true)**:
  - 우측 상단에 `[본 화면으로 복귀]` 버튼 추가 (클릭 시 창 닫힘 및 메인 화면에 알림).
  - 브라우저 창 닫기(`beforeunload` 이벤트) 시 메인 화면에 알림 전송.

## User Review Required
> [!IMPORTANT]
> 새 창 분리 시 브라우저의 팝업 차단 설정에 의해 창이 열리지 않을 수 있습니다. 이 경우 사용자에게 팝업 차단 해제를 요청하는 알림을 띄우는 로직도 포함할 계획입니다. 

위 계획대로 구현을 시작할까요? 승인해주시면 바로 작업을 진행하겠습니다!
