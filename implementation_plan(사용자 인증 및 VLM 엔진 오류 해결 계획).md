# 사용자 인증 및 VLM 엔진 오류 해결 계획

고객님, 말씀하신 두 가지 문제를 완벽하게 파악했습니다.

### 1. "로그인 없이 막 들어가지네 / monitor-b가 단독으로 열리네" 문제
기존 개발용 코드에 로그인 유지(Persist) 기능이 브라우저의 `localStorage`에 하드코딩 수준으로 박혀 있어서 한 번 로그인되면 영원히 유지되고 있었습니다. 또한 `monitor-b`를 누구나 주소만 치면 들어갈 수 있는 보안 허점이 있었습니다.

**해결 방안:**
- `useAuthStore.ts`의 스토리지를 브라우저를 끄면 날아가는 `sessionStorage`로 강등시킵니다.
- `MonitorBLayout.tsx`에 "부모 창(Monitor A)에서 [새창 분리] 버튼으로 띄운 것이 아니면 무조건 Monitor A나 로그인 화면으로 강제 튕겨내는" 보호 로직(`window.opener` 체크)을 추가합니다.

### 2. VLM 엉뚱한 텍스트 송출의 "진짜" 원인 (Llama 3.2 충돌)
프레임 버그를 고쳐서 실제 CCTV 이미지를 잘 넘겨주었는데도, Ollama가 **HTTP 500 에러**를 뿜으며 뻗어버리고 있었습니다. 확인해본 결과, 고객님 PC에 설치된 Ollama 버전이 구버전이라 최신 **Llama 3.2 Vision의 모델 아키텍처(`mllama`)를 아예 인식하지 못하고 튕겨내는 치명적 에러**가 발생하고 있습니다.
(`error loading model: unknown model architecture: 'mllama'`)

**해결 방안:**
이 부분은 코드 수정만으로는 불가능하며, 고객님께서 직접 **Ollama 프로그램을 최신 버전으로 업데이트(재설치)** 해주셔야만 Llama 3.2 Vision을 띄울 수 있습니다. (만약 오프라인망이라 업데이트가 불가능하시다면, 구버전 Ollama에서도 잘 돌아가는 `llava` 모델로 백엔드 코드를 우회시켜 드릴 수 있습니다.)

---

## 🛠️ 수정 계획 (Proposed Changes)

#### [MODIFY] `e:\projects\ewVLM\frontend\src\store\useAuthStore.ts`
- Zustand의 `persist` 저장소를 `sessionStorage`로 변경하여 세션 기반 인증으로 전환합니다.

#### [MODIFY] `e:\projects\ewVLM\frontend\src\layouts\MonitorBLayout.tsx`
- 컴포넌트 마운트 시 `window.opener` 존재 여부를 검사하여, 주소창에 직접 타이핑해서 들어온 경우 `/monitor-a`로 강제 리다이렉트 시킵니다.

> [!WARNING]
> **VLM 엔진 조치 필요 사항**
> 코드를 패치한 후, 고객님께서는 Ollama 공식 홈페이지에서 최신 버전의 Ollama를 다운받아 덮어쓰기 업데이트를 해주셔야 합니다. 만약 망분리 등으로 업데이트가 당장 불가능하시다면 피드백으로 알려주세요! (`llava` 모델로 임시 우회해드리겠습니다.)

수정 계획이 마음에 드신다면 **Proceed(승인)** 버튼을 눌러주세요!
