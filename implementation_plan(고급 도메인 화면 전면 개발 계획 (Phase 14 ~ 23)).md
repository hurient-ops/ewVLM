# 고급 도메인 화면 전면 개발 계획 (Phase 14 ~ 23)

프론트엔드 명세서(`ewvlm-frontend-spec-v2.md`)에 정의된 나머지 10종의 확장 고급 도메인 UI 화면을 순차적으로 개발하고, 라우터(`App.tsx` 등)에 연결하여 플랫폼 확장을 마무리합니다.

## User Review Required

> [!WARNING]
> 본 작업은 총 10개의 독립적인 복합 대시보드 및 콘솔 화면을 개발하는 대규모 작업입니다. 순차적으로 진행하며 진행 상황을 `task.md`를 통해 추적할 예정입니다.

## Proposed Changes

### 1. PTZ 및 오디오 제어 도메인 (Phase 14 ~ 16)
- **[NEW] `src/components/PtzHandoverConsole.tsx`**: 다중 카메라 간 타겟 락온 및 궤적 인계(Handover) 시각화. (`/ptz/handover`)
- **[NEW] `src/components/PtzTourScheduler.tsx`**: P1~P5 프리셋 기반의 지능형 자율 PTZ 순찰 투어 스케줄러. (`/ptz/tour`)
- **[NEW] `src/components/IpAudioBroadcastConsole.tsx`**: 다중 구역 IP 스피커 대상 TTS 방송 송출 및 비상벨 인터컴 콘솔. (`/audio/broadcast`)

### 2. AI 옵스(AIOps) 및 자율 복구 도메인 (Phase 17 ~ 19)
- **[NEW] `src/components/AiLoraFineTuningConsole.tsx`**: 오탐지 피드백 기반 VLM/YOLO 모델 LoRA 미세조정 루프 시각화. (`/ai/lora`)
- **[NEW] `src/components/EdgeAiOrchestrator.tsx`**: 다수의 에지(Edge) 서버 노드 및 NVIDIA NIM 컨테이너 상태 모니터링. (`/ai/orchestration`)
- **[NEW] `src/components/SystemSelfHealingShell.tsx`**: 하드웨어 에러 탐지 시 자율 복구 스크립트 실행 및 로그 콘솔. (`/system/self-healing`)

### 3. 특수 작전 및 보안 도메인 (Phase 20 ~ 22)
- **[NEW] `src/components/EmergencyWarRoom.tsx`**: 재난 발생 시 지도, 라이브 영상, 유관기관 협업 채팅을 통합한 워룸(War-Room) 콘솔. (`/emergency/war-room`)
- **[NEW] `src/components/PrivacyExportWorkshop.tsx`**: 영상 반출 전 얼굴 및 번호판 자동 모자이크 비식별화 처리 및 진행률 모니터링. (`/privacy/export`)
- **[NEW] `src/components/NetworkTopologyMonitor.tsx`**: 카메라-PoE 스위치-NVR 간의 물리적 네트워크 토폴로지 맵 시각화. (`/system/network`)

### 4. 모바일 도메인 및 라우팅 연결 (Phase 23)
- **[NEW] `src/components/MobilePatrolView.tsx`**: 현장 요원을 위한 ewVLM 모바일 패트롤 앱 전용 뷰 (반응형 특화 뷰). (`/mobile/patrol`)
- **[MODIFY] `src/App.tsx` (또는 중앙 라우터 컴포넌트)**: 새롭게 추가된 10개의 컴포넌트들에 대한 경로(Route) 및 사이드바 내비게이션 메뉴 연결 추가.

## Verification Plan

### Automated Tests
- TypeScript 컴파일 무결성 검증 (`tsc --noEmit`).
- 린트 에러 검증 (`npm run lint`).

### Manual Verification
- 새로 추가된 10개의 주소 라우팅이 정상 작동하는지 확인.
- 각 화면의 UI 컴포넌트가 다크 테마(WCAG AA) 가이드라인에 맞추어 깨짐 없이 표시되는지 육안 확인.
