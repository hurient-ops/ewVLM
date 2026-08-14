# 종합 특화 UI 고도화 구현 계획서 (Phase 10 ~ Phase 13)

플랫폼의 완성도를 끌어올리기 위한 남은 4가지 기능 그룹(지능형 검색, GIS/대시보드, NVR 타임라인, 시스템 설정)의 전체 화면 UI 고도화 및 상태 관리 연동 계획입니다. 

## User Review Required

> [!IMPORTANT]
> 총 4개의 대규모 파트로 나뉘어 있으므로, 방대한 작업량이 수반됩니다. 본 기획안 승인 시, 1번(VSS 및 룰셋 코파일럿)부터 차례대로 자동화하여 구현해 나가겠습니다.
> 기존 기능과 충돌이 없도록 컴포넌트 단위로 모듈화하여 순차적으로 패치됩니다.

## Proposed Changes

---

### [Phase 10] 지능형 검색 및 분석 UI 고도화

#### [MODIFY] `frontend/src/components/VssSemanticSearch.tsx`
- **목표**: 자연어 쿼리를 백엔드로 전송하고 유사도에 따른 검색 결과 출력
- 검색 인풋 폼과 검색 버튼 이벤트 핸들러(`apiSearchVss`) 연결.
- Mock 데이터를 걷어내고, 실제 API 통신 결과 리스트(썸네일, 타임스탬프, 매칭 스코어) 출력 UI 구현.

#### [MODIFY] `frontend/src/components/NaturalLanguageRuleCopilot.tsx`
- **목표**: Zero-shot VLM 룰셋 검증을 위한 가상 시뮬레이션 콘솔 구현
- 좌측에 룰셋 작성 폼(자연어 프롬프트 입력창), 우측에 비디오 플레이어 배치.
- "테스트 실행" 버튼 클릭 시, 가상 로딩 스피너 작동 후 비디오 플레이어 위로 룰셋 통과/실패 및 바운딩 박스를 렌더링하는 시각적 피드백 구축.

---

### [Phase 11] 다중 모니터링 및 시각화 (GIS & BI)

#### [MODIFY] `frontend/src/components/GisSmartMap.tsx`
- **목표**: `useGisStore` 와 연동하여 지도 위에 다중 카메라 마커 및 툴팁 시각화
- 가짜 배경 이미지 대신 실제 SVG 기반의 미니멀 맵 배경 렌더링 또는 좌표 기반 마커 배치 컴포넌트 개발.
- 상태값(Normal/Critical)에 따른 마커 깜빡임(Ping) 애니메이션 추가.

#### [MODIFY] `frontend/src/components/RealtimeBiDashboard.tsx`
- **목표**: 차트 라이브러리를 활용한 통계 대시보드 시각화
- 텍스트 위주의 UI에서 막대형 그래프(CSS Grid 활용) 및 원형 진행률 게이지를 사용해 누적 알람 통계, 카메라별 트래픽 등을 대시보드 형태로 리팩토링.

---

### [Phase 12] NVR 재생 및 타임라인 컨트롤러

#### [MODIFY] `frontend/src/components/MultiChannelSyncPlayback.tsx`
- **목표**: 4분할 동기화 비디오 플레이어 렌더링
- 하단 타임라인 바 구현 (Zoom in/out 프로그레시브 스케일링은 CSS와 React 상태를 이용한 드래그 줌 방식으로 설계).
- 플레이/일시정지/배속 조작 패널 생성 및 4개 플레이어 일괄 통제 상태 관리 연동.

---

### [Phase 13] 시스템 설정 및 관리자 포탈

#### [MODIFY] `frontend/src/components/NvrStorageDashboard.tsx`
- **목표**: `useSystemHealthStore` 데이터를 연결한 실시간 시스템 메트릭 시각화
- 하드디스크 게이지(Progress Bar), CPU/RAM 사용량 동적 바인딩.

#### [MODIFY] `frontend/src/components/SystemAuditLogPortal.tsx`
- **목표**: 백엔드 REST API(`GET /api/v1/audit/logs`) 연동
- 그리드 기반의 데이터 테이블 UI 구현 및 페이지네이션/필터 기능 추가.

## Verification Plan

### Automated / Manual Verification
- 각 단계(Phase)의 구현이 끝날 때마다 컴포넌트의 렌더링이 깨지지 않는지 `npm run dev` 콘솔을 지속 확인.
- VSS 검색창에서 "안전모 미착용" 입력 후 검색 동작 시 에러가 나지 않는지, GIS 마커가 화면에 올바르게 노출되는지 브라우저에서 최종 확인.
