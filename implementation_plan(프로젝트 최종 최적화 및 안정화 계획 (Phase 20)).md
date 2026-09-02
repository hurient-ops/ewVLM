# 프로젝트 최종 최적화 및 안정화 계획 (Phase 20)

사용자님께서 제안해주신 최종 보완 사항 3가지를 완벽하게 처리하기 위한 구현 계획서입니다.
현재 시스템의 골격은 모두 완성되어 있으므로, 이 단계에서는 **데이터 정합성**, **프로덕션 수준의 안정성(타입 매칭)**, 그리고 **VLM 모델 파라미터 최적화**에 집중합니다.

## Proposed Changes

### 1. VLM 모델 교체 및 프롬프트/파라미터 최적화
**대상 파일:** `backend/ewvlm_lmstudio_bridge.py`, `frontend/src/components/MonitorALiveControl.tsx`
- **로직 변경:**
  - 기본 선택 모델을 `Llama-3.2-11B-Vision-Instruct`로 완전히 고정합니다.
  - 온도(Temperature) 파라미터를 `0.2` -> `0.1`로 낮추어 관제 환경에 맞게 좀 더 사실적이고 일관된(Deterministic) 답변을 유도합니다.
  - 최대 토큰(Max Tokens)을 `512` -> `300`으로 줄여 추론 레이턴시(속도)를 최적화합니다.
  - 프롬프트를 기존의 단순 텍스트 서술형에서 **[상황], [위협 수준], [권장 조치]** 등 구조화된 포맷으로 응답하도록 강력한 컨텍스트(System Prompt)를 주입합니다.

---

### 2. 미구현 페이지 로직 (API Gateway) 연동
현재 UI단에 목업(Mockup) 데이터만 하드코딩 되어있는 페이지들의 데이터를 실제 API와 연결합니다. 방대한 페이지 중, 관제 시스템의 핵심인 다음 4개 컴포넌트를 우선적으로 백엔드와 연결 제안합니다.

**대상 파일:** `frontend/src/api/client.ts`, `backend/ewvlm_fastapi_gateway.py`, 및 여러 UI 컴포넌트

#### [MODIFY] `MultiChannelSyncPlayback.tsx`
- **변경:** 하드코딩된 비디오 재생 로직을 실제 백엔드 녹화본 검색 API와 연결. (TS 에러인 `API` 모듈 누락 문제도 동시 해결)

#### [MODIFY] `PromptGatewayDeploy.tsx`
- **변경:** VLM 프롬프트를 엣지 디바이스로 배포하는 가짜 로직을 실제 `deployPrompt` API로 라우팅.

#### [MODIFY] `NaturalLanguageRuleCopilot.tsx`
- **변경:** AI 자연어 룰 생성 시 `setTimeout`으로 지연되던 가짜 로직을 `generateSopRule` 백엔드 API와 실제 통신하도록 교체.

#### [MODIFY] `MultiSiteAuthMatrix.tsx`
- **변경:** 사용자 권한 변경 시 `updateUserRole` 백엔드 API를 호출하여 DB를 업데이트하는 로직으로 변경.

---

### 3. TypeScript (TS) 에러 20여 개 디버깅 (프로덕션 빌드 대응)
**대상 파일:** `App.tsx`, `MassDeviceConfigClone.tsx`, `MonitorCanvas.tsx`, `NetworkTopologyMonitor.tsx`, `Signup.tsx` 등 12개 파일

- **문제점:** 현재 `npm run build` 실행 시 약 20개의 타입 매칭 에러(Boolean 자리에 String이 들어감, 존재하지 않는 속성 호출 등)가 발생하여 실제 배포가 불가능한 상태입니다.
- **해결 방안:**
  - `stddeviation` -> `stdDeviation` 등 React SVG 카멜케이스 오타 수정.
  - `<button disabled="true">` 처럼 쓰여진 String 타입 에러를 `<button disabled={true}>` 형태로 일괄 교체.
  - 스토어(Store) 타입 정의(`useCameraStore.ts` 등)에 누락된 `isActive`, `escalationId` 등의 타입을 명시적으로 선언하여 인터페이스 정합성 충족.
  - `Signup.tsx`의 파라미터 개수 불일치 오류 수정.

## User Review Required

> [!IMPORTANT]
> 2번 "미구현 페이지 로직 연동"의 경우, 모든 20여 개 하위 페이지를 전부 완벽하게 1:1로 백엔드 DB와 연동하기에는 개발 시간이 꽤 많이 소요될 수 있습니다. 
> 
> 계획서에 작성한 **4대 핵심 컴포넌트(재생, 프롬프트 배포, 자연어 룰, 권한 설정)** 외에, **"이 페이지는 꼭 백엔드와 연결되어 동작하는 모습을 보고 싶다"** 하시는 특별한 페이지가 있으시다면 피드백으로 남겨주시면 해당 부분을 우선순위로 함께 연동하겠습니다! (없으시다면 계획대로 진행하겠습니다.)

승인(Proceed) 버튼을 눌러주시면 즉각적으로 전체 파일 수정 및 타입스크립트 에러 클리어 작업을 시작하겠습니다!
