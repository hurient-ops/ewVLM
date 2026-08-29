# Phase 7: 인프라 자가 치유 및 상태 모니터링 (DevOps & Edge Infra) 연동 계획

이번 Phase에서는 네트워크 스위치 폴링(SNMP) 데이터의 시각화와 엣지 기기의 원격 자가 치유(Self-Healing) 기능을 백엔드와 연결하여 작동하도록 만듭니다.

## User Review Required
> [!NOTE]
> 실제 NVR이나 네트워크 스위치의 SNMP 데이터를 폴링하려면 물리 장비가 필수적입니다. 따라서 백엔드 쪽에 **시뮬레이션된 인프라 폴링 데이터(네트워크 트래픽, 온도, PoE 전력량 등)** 를 반환하는 가상 API를 구축하여 연동하고자 합니다. UI 상에서 실제와 똑같이 데이터를 받아오는 파이프라인은 완벽히 동작하게 됩니다. 이에 동의하시나요?

## Proposed Changes

### Backend API
#### [MODIFY] `backend/ewvlm_fastapi_gateway.py`
- **인프라 토폴로지 엔드포인트** (`GET /api/v1/infra/topology`):
  - 각 스위치와 NVR, 카메라 노드의 상태 정보(상태, 업타임, 네트워크 트래픽, 소비 전력, 온도 등)를 담은 JSON 객체를 반환합니다.
- **자가 치유 명령 엔드포인트** (`POST /api/v1/infra/heal`):
  - 인자로 전달된 `node_id`와 `action`에 따라, (비동기 대기 후) 복구 성공 상태를 반환하여 SSH 터널링을 통한 리부트나 쿨러 조정 스크립트 실행을 모사합니다.

### Frontend Components
#### [MODIFY] `frontend/src/api/client.ts`
- `getTopology()` 와 `healNode(nodeId, action)` 메서드를 추가합니다.

#### [MODIFY] `frontend/src/components/NetworkTopologyMonitor.tsx`
- **데이터 페칭**: 컴포넌트 마운트 시 `API.getTopology()`를 호출합니다.
- **인스펙터 패널 연동**: 왼쪽의 SVG 맵에서 특정 노드를 클릭했을 때, 우측 인스펙터 패널(Inspector Panel)에 하드코딩된 텍스트가 아닌 백엔드에서 가져온 실시간 모니터링 수치(처리량, PoE 전력, 온도 등)가 표출되도록 State 구조를 개편합니다.

#### [MODIFY] `frontend/src/components/HardwareSelfHealingShell.tsx`
- **자가 치유 기능 연동**: 단순히 `setTimeout`으로 동작하던 '자율 복구 시작' 버튼을 백엔드의 `API.healNode`와 연결합니다. API 응답이 돌아올 때까지 로딩 상태를 유지하고 완료 시 시각적 피드백(Toast)을 제공합니다.

## Verification Plan
### Manual Verification
1. **NetworkTopologyMonitor**: 화면 로딩 후 우측 인스펙터 패널에 노드를 클릭했을 때, 매번 다른 데이터(백엔드에서 가져온 데이터)가 노출되는지 확인합니다.
2. **HardwareSelfHealingShell**: 자율 복구 버튼 클릭 시 `isHealing` 상태로 변경되고, 수 초 뒤 복구 성공 토스트 알림이 팝업되는지 점검합니다.
