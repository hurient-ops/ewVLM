# VLM 분석 화면 전체 새 창 분리 구현 (Monitor B Layout Detach)

현재 `EventReviewCenter.tsx`에만 국한되어 있던 "새 창으로 분리" 기능을, 좌측 5개의 메뉴를 모두 포함하는 `MonitorBLayout.tsx` 단위로 승격(Hoist)하여 전역적으로 분리할 수 있도록 개선합니다. 또한 본 화면(Monitor A)에서도 분리 상태를 명확히 인지하고 제어할 수 있도록 UX를 개편합니다.

## User Review Required

> [!WARNING]
> 이 변경으로 인해 `App.tsx`의 라우팅 구조 일부가 정리되고, `EventReviewCenter`의 단독 분리 기능이 제거되며, `MonitorBLayout` 전체가 분리되는 방식으로 변경됩니다. 기능 작동 방식의 패러다임이 변경되므로 아래 내용을 확인해 주세요.

## Open Questions

> [!IMPORTANT]
> 1. 본 화면(메인 창)에서 VLM 분석 탭을 클릭했을 때, 현재 새 창으로 열려 있다면 "새 창에서 실행 중입니다"라는 안내 화면(Placeholder)을 보여주고 본 화면으로 강제 복귀할 수 있는 버튼을 제공하는 방식이 괜찮으신가요? (기존 Event Review Center와 동일한 방식입니다)
> 2. 새 창의 기본 해상도(크기)를 1400x900으로 설정하려고 하는데, 적당하신가요?

## Proposed Changes

---

### App.tsx & Global Layouts

기존에 존재하던 불필요한 단독 Detach 라우트를 제거하고, `BaseLayout`에서 새 창 여부를 감지하여 Top Header를 숨기는 로직을 추가합니다.

#### [MODIFY] `App.tsx`
- `<Route path="/event-review-detached" />` 라우트 제거.
- 이제 모든 분리된 창은 기존 라우트를 그대로 사용하되, `window.name`을 통해 분리 여부를 인식합니다.

#### [MODIFY] `BaseLayout.tsx`
- `window.name === 'VLM_Detached'` 일 경우 글로벌 Top Header(네비게이션 탭 등)를 렌더링하지 않고 `<Outlet />`만 렌더링하여 새 창을 깔끔하게 유지합니다.
- 메인 창일 경우 `BroadcastChannel('vlm_monitor_b_sync')`을 수신하여 VLM 분석이 분리된 상태인지(`isDetachedMode`) 추적합니다.
- 분리된 상태라면 "VLM 분석" 탭 옆에 팝업 아이콘(`open_in_new`)을 표시하여 사용자에게 분리 상태임을 시각적으로 안내합니다.

---

### Monitor B (VLM 분석 영역)

`MonitorBLayout`이 분리 로직의 주체가 됩니다.

#### [MODIFY] `MonitorBLayout.tsx`
- `EventReviewCenter`에 있던 `BroadcastChannel` 통신 로직을 이곳으로 이동합니다.
- 화면 우측 상단에 "새 창으로 분리" (메인 창) / "본 화면으로 복귀" (분리된 창) 버튼을 추가합니다.
- 메인 창에서 분리 모드가 활성화되어 있을 경우, 사이드바와 콘텐츠 대신 **"VLM 분석이 새 창에서 실행 중입니다"** 라는 안내 화면과 강제 복귀 버튼을 표시합니다.

---

### Components

#### [MODIFY] `EventReviewCenter.tsx`
- 기존에 내부적으로 가지고 있던 `isDetachedView` prop, `BroadcastChannel` 로직, 분리 버튼, 안내 화면 렌더링 로직을 **모두 제거**합니다.
- 순수하게 이벤트 리뷰 센터 기능만 담당하는 컴포넌트로 단순화합니다.

## Verification Plan

### Manual Verification
1. `Monitor A` 등 본 화면에서 상단의 **VLM 분석** 탭 클릭
2. `Monitor B` 화면(좌측 5개 메뉴)이 정상 렌더링되는지 확인
3. 우측 상단의 **새 창으로 분리** 버튼 클릭
4. 새 창이 열리며 좌측 5개 메뉴와 콘텐츠가 포함된 전체 `Monitor B` 레이아웃이 렌더링되는지 확인 (Top Header는 없어야 함)
5. 본 화면은 "VLM 분석이 새 창에서 실행 중입니다"라는 Placeholder로 변경되는지 확인
6. 본 화면의 상단 네비게이션 "VLM 분석" 탭 옆에 새 창 표시 아이콘이 나타나는지 확인
7. 분리된 창에서 5개 메뉴 간 이동이 정상적으로 동작하는지 확인
8. 분리된 창을 닫거나, 메인 창에서 "본 화면으로 강제 복귀" 버튼을 클릭 시 원래 상태로 매끄럽게 돌아오는지 확인
