# Phase 3: 비상 프로토콜 SOP 연동 및 타 시스템(방송, 출입통제) 연계 계획서

Phase 3에서는 VLM 지능형 이벤트 발생 시 연동되는 **비상 프로토콜(SOP)을 시각화하고, IP 방송 및 타 시스템과의 연계 통신 인터페이스**를 구현합니다.

## User Review Required

> [!TIP]
> SOP 체크리스트를 `DisasterVirtualWarRoom` 화면에 통합하여, 실제 재난 발생 시 담당자가 단계별로 조치(방송 송출, 대피 유도 등)를 클릭하며 완수할 수 있도록 워크플로우를 고도화할 예정입니다. 

## Proposed Changes

### 백엔드 (FastAPI)
---
#### [MODIFY] [ewvlm_fastapi_gateway.py](file:///e:/projects/ewVLM/backend/ewvlm_fastapi_gateway.py)
- `POST /api/v1/audio/broadcast` 엔드포인트를 신규 구축하여 프론트엔드에서 전송하는 TTS 문자열과 대상 구역(Zone) 정보를 처리합니다.
- (Mock) TTS 오디오 변환 시뮬레이션 지연을 구현하고, WS 스트림으로 `broadcast_started` 메시지를 방출하도록 연동합니다.

### 프론트엔드 (React, Zustand)
---
#### [MODIFY] [client.ts](file:///e:/projects/ewVLM/frontend/src/api/client.ts)
- `broadcastAudio(zone: string, message: string)` API 클라이언트 함수를 추가합니다.

#### [MODIFY] [DisasterVirtualWarRoom.tsx](file:///e:/projects/ewVLM/frontend/src/components/DisasterVirtualWarRoom.tsx)
- `useSopStore`를 연동하여, "중대 재난 대응 프로토콜" 하단에 **동적 SOP 체크리스트(예: 현장 제어, 문서화 등)** 컴포넌트를 구현합니다.
- 담당자가 체크박스를 클릭 시 상태가 업데이트(완료선 긋기 및 색상 변경)되도록 구현합니다.
- 우측 비디오 피드 상단에 활성화된 이벤트를 렌더링합니다.

#### [MODIFY] [IpAudioBroadcastConsole.tsx](file:///e:/projects/ewVLM/frontend/src/components/IpAudioBroadcastConsole.tsx)
- "빠른 시나리오" 버튼이나 텍스트를 입력하고 "방송 송출" 버튼 클릭 시 `API.broadcastAudio`가 호출되도록 통신 레이어를 입힙니다.
- 버튼을 눌렀을 때 송출 중임을 알리는 스피너나 프로그래스 애니메이션을 추가하여 UI 피드백을 강화합니다.

## Verification Plan

### Manual Verification
1. `NaturalLanguageRuleCopilot`에서 배포하여 이벤트를 발생시킨 뒤, `DisasterVirtualWarRoom`에 들어가면 해당 이벤트에 대한 SOP 체크리스트가 떠 있는지 확인합니다.
2. 체크리스트의 항목을 클릭 시, 완료선이 그어지고 저장되는지 봅니다.
3. `IpAudioBroadcastConsole`로 이동하여 문구를 입력하고 [송출] 버튼을 눌렀을 때, 백엔드 API가 정상 호출되며 "방송 송출 중" 애니메이션이 동작하는지 테스트합니다.
