# Phase 9: 통합 관제 및 실시간 현장 통신 (Incident & Dispatch) 연동 계획

ewVLM 고도화의 첫 번째 스텝(Phase 9)으로, 중앙 관제실(웹)과 현장 순찰 요원(모바일 앱) 간의 **실시간 알람 디스패치(Dispatch) 시스템**을 구축합니다.

## User Review Required
> [!NOTE]
> 본 단계에서는 **WebSocket 기반의 실시간 양방향 통신**을 도입합니다. 백엔드에서 가상의 위협 상황(침입 감지 등)을 모의 생성하여 웹소켓으로 쏘면, 이를 웹 관제 센터에서 확인하고 모바일 앱으로 "디스패치(출동 명령)"하는 흐름을 구현합니다.

## Open Questions
> [!TIP]
> 1. `AlertCenterDashboard`(알람 센터) 화면으로 이동하는 메뉴 버튼을 우측 상단 '환경 설정(톱니바퀴)' 드롭다운의 "운영 및 제어" 섹션에 추가하는 것이 괜찮으신가요? 
> 2. 모의 알람이 주기적으로(예: 15초마다 1번씩) 발생하도록 백그라운드 태스크를 켜둘까요, 아니면 시연의 편의성을 위해 버튼을 눌렀을 때만 모의 알람이 발생하도록 할까요? (기본적으로는 버튼 클릭 또는 특정 상황에서 트리거 되도록 구현할 예정입니다.)

## Proposed Changes

### Backend API
#### [MODIFY] `backend/ewvlm_fastapi_gateway.py`
- **웹소켓(WebSocket) 엔드포인트 추가 (`/ws/alerts`)**: 프론트엔드의 연결을 수락하고 활성 클라이언트(모바일/웹)를 관리합니다.
- **알람 상태 변경 API 추가 (`POST /api/v1/alerts/{alert_id}/dispatch`)**: 관제사가 알람을 확인하고 '현장 출동' 상태로 변경하면, 해당 내역을 웹소켓을 통해 현장 요원(Mobile)에게 브로드캐스트합니다.

### Frontend Components
#### [NEW] `frontend/src/components/AlertCenterDashboard.tsx`
- 실시간으로 쏟아지는 위협(Alerts)을 큐(Queue) 형태로 관리하는 메인 관제 보드입니다.
- 들어온 알람을 클릭하고, 우측 인스펙터 패널에서 **"현장 요원 디스패치"** 버튼을 눌러 모바일 기기로 지시를 내립니다.

#### [MODIFY] `frontend/src/components/MobilePatrolApp.tsx`
- 백엔드(`/ws/alerts`)와 웹소켓으로 연결합니다.
- 웹소켓을 통해 수신된 '디스패치' 메시지를 파싱하여 상단의 **비상 알림(Emergency Banner)** 에 실시간으로 동적 표시합니다. (기존 하드코딩된 '침입 감지 - Sector C' 데이터 교체)

#### [MODIFY] `frontend/src/App.tsx` & `frontend/src/layouts/BaseLayout.tsx`
- `<Route path="/alert-center" element={<AlertCenterDashboard />} />` 라우팅 추가.
- `BaseLayout.tsx`의 톱니바퀴 드롭다운에 "통합 알람 센터" 메뉴 엔트리 추가.

## Verification Plan
1. 브라우저 창 2개를 엽니다 (하나는 `/alert-center`, 다른 하나는 `/mobile-patrol`).
2. 관제 화면(Alert Center)에서 임의의 모의 알람을 생성하고 `디스패치(출동)` 버튼을 클릭합니다.
3. 다른 창의 모바일 순찰 화면(Mobile Patrol) 상단에 실시간으로 디스패치된 알람 배너가 즉각적으로 뜨는지 딜레이 없이 확인합니다.
