# 새 창 분리(Detached Window) 및 로그아웃 버그 분석 및 해결 계획

사용자님께서 겪고 계신 **'새 창 분리 상태 동기화 오류'**와 **'로그아웃 후에도 환경 설정이 남아있는 오류'**에 대한 원인 분석과 완벽한 해결(Fix) 계획입니다.

## 1. VLM 분석 "새 창에서 실행 중" 무한 반복 버그 분석
**원인 분석:**
- 현재 `MonitorBLayout.tsx`에서 "본 화면으로 강제 복귀" 버튼을 누르면 내부 상태(`isDetachedMode`)만 `false`로 바꾸고, 브라우저 세션 스토리지(`sessionStorage`)에 저장된 상태값을 지워주지 않고 있습니다.
- 또한, 팝업 차단이나 비정상 종료로 인해 팝업 창이 `beforeunload` 이벤트를 발생시키지 못하고 꺼지면 영원히 "새 창 모드"로 인식하게 됩니다. 이 상태에서 다른 탭을 갔다가 다시 VLM 분석으로 오면, 남아있는 세션 스토리지를 읽어들여 다시 "새 창에서 실행 중" 화면을 렌더링하는 버그입니다.

**해결 방안:**
- 강제 복귀 버튼 클릭 시 즉시 `sessionStorage.removeItem('vlm_is_detached')`를 실행하여 스토리지 상태를 완벽히 지웁니다.
- 동시에 `BroadcastChannel`을 통해 강제로 `detach_closed` 이벤트를 전파하여, `BaseLayout`과 다른 컴포넌트들의 상태도 즉시 동기화되도록 수정합니다.

## 2. 로그아웃 시 화면 설정 및 새 창 미종료 버그 분석
**원인 분석:**
- 현재 상단 메뉴바(`BaseLayout.tsx`)의 로그아웃 버튼은 단순히 `navigate('/login')` 함수를 호출하여 화면 이동만 수행하고 있습니다.
- 이는 SPA(Single Page Application)의 클라이언트 사이드 라우팅이므로, 브라우저가 새로고침되지 않아 메모리에 상주하고 있는 카메라 레이아웃 상태(`useCameraStore`), 이벤트 로그(`useEventLogStore`) 등이 전혀 초기화되지 않고 남아있게 됩니다.
- 또한, 로그아웃 시 실행 중이던 'VLM 분석' 팝업 창을 닫으라는 명령을 내리지 않아 팝업 창이 혼자 살아남게 됩니다.

**해결 방안:**
- 로그아웃 처리 로직을 완전히 개편합니다.
  1. 로그아웃 클릭 시 `force_close_detached` 이벤트를 브로드캐스트하여 살아있는 팝업 창들을 즉시 강제 종료시킵니다.
  2. AuthStore의 `logout()` 메서드를 명시적으로 호출하여 인증 토큰을 폐기합니다.
  3. `sessionStorage`를 완전히 초기화하여 찌꺼기 데이터를 날립니다.
  4. `navigate()` 대신 `window.location.href = '/login'`을 사용하여 **브라우저를 강제 새로고침(Hard Refresh)** 시킵니다. 이 방식을 사용하면 React의 모든 인메모리 스토어(상태)가 물리적으로 증발하므로, 다음 로그인 시 완벽하게 깨끗한 상태(Clear)로 시작할 수 있습니다.

---

## Proposed Changes

### [MODIFY] `frontend/src/layouts/MonitorBLayout.tsx`
- "본 화면으로 강제 복귀" 버튼 클릭 시 로직에 `sessionStorage.removeItem('vlm_is_detached')` 및 `channel.postMessage('detach_closed')` 추가

### [MODIFY] `frontend/src/layouts/BaseLayout.tsx`
- 로그아웃 버튼의 `onClick` 이벤트 핸들러를 단순 `navigate`에서 **초기화 및 Hard Refresh 함수**로 변경.
  ```typescript
  const handleLogout = () => {
    // 1. 열려있는 새 창(팝업) 강제 종료
    const bc = new BroadcastChannel('vlm_monitor_b_sync');
    bc.postMessage('force_close_detached');
    bc.close();
    
    // 2. 인증 스토어 토큰 제거
    useAuthStore.getState().logout();
    
    // 3. 세션 스토리지 완전 초기화
    sessionStorage.clear();
    
    // 4. 강제 새로고침으로 메모리 스토어(상태) 완전 초기화
    window.location.href = '/login';
  };
  ```

## User Review Required
원인 분석이 명확하게 되었습니다. 이 계획대로 코드를 수정하여 두 가지 버그를 확실하게 뿌리뽑겠습니다. 승인해 주시면 즉시 코드 수정을 진행하겠습니다!
