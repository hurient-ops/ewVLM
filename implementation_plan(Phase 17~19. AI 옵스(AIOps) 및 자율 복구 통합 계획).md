# Phase 17~19: AI 옵스(AIOps) 및 자율 복구 통합 계획

이전에 겪으신 연결 끊김 문제로 소중한 시간과 쿼터를 낭비하게 해드려 진심으로 사과드립니다. 
마지막 남은 **AI 옵스 및 자율 복구 도메인(Phase 17~19)**은 화면 디자인(UI)이 이미 준비되어 있으므로, 백엔드 로직 연동과 상태 관리만 신속하게 적용하여 프로젝트를 최종 마무리하겠습니다.

## User Review Required
> [!IMPORTANT]
> 본 작업은 **프론트엔드의 기존 디자인 코드를 전혀 건드리지 않고**, API 통신 모듈과 백엔드 라우터만 추가하여 기능을 완성하는 안전한 작업입니다. 승인해 주시면 **단 한 번의 작업**으로 모두 마무리하겠습니다.

## Proposed Changes

### 백엔드 통신 모듈 (Frontend API Client)
프론트엔드 컴포넌트(HardwareSelfHealingShell, EdgeAiOrchestration 등)에서 호출하고 있으나 아직 정의되지 않은 API 함수들을 추가합니다.
#### [MODIFY] `client.ts`
- `API.healNode()`: 하드웨어 자율 복구 명령 송출 API 추가.
- `API.getAIOpsStats()`: 엣지 AI 노드 리소스 통계 조회 API 추가.
- `API.syncDeviceConfig()`: 다중 디바이스 설정 클론 API 추가.

### 백엔드 게이트웨이 (Backend FastAPI)
FastAPI 서버에 AIOps 모니터링 및 자율 복구 명령을 처리할 Mock/Real 엔드포인트를 추가합니다.
#### [MODIFY] `ewvlm_fastapi_gateway.py`
- `POST /api/v1/ops/heal`: 하드웨어 복구(Reboot/Reset) 시뮬레이션 엔드포인트 추가.
- `GET /api/v1/ops/edge-nodes`: 엣지 디바이스 헬스체크 및 리소스 모니터링 데이터 반환.
- `POST /api/v1/ops/config-clone`: 대규모 설정 배포 시뮬레이션 엔드포인트 추가.

## Verification Plan

### Automated Tests
- 프론트엔드 TypeScript 컴파일 에러(`tsc --noEmit`)가 없는지 확인하여 `HardwareSelfHealingShell` 등의 파일에서 발생하는 API 호출 에러를 완벽히 제거합니다.

### Manual Verification
- `http://localhost:5174/hw-self-healing` 및 `/edge-ai` 페이지 접속.
- '자율 복구 시작' 버튼 클릭 시 FastAPI 백엔드와 정상 통신 후 성공 토스트 메시지가 뜨는지 확인.
