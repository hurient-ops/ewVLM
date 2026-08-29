# Phase 10: 포렌식 타임라인 및 감사 추적 (Forensics & Audit) 연동 계획

ewVLM 고도화의 두 번째 스텝(Phase 10)으로, 과거 이벤트에 대한 정밀 조사(Forensics) 기능과 시스템 내 보안 위반 사항을 추적하는 감사 로그(Audit Trail) 시스템을 구축합니다.

## User Review Required
> [!NOTE]
> 영상 내보내기(Export)는 실제 MP4 파일을 생성하는 대신 프론트엔드에서 비동기 로딩(프로그레스바) 후 다운로드 링크를 제공하는 형태로 모의(Simulate) 구현됩니다.

## Proposed Changes

### Backend API
#### [MODIFY] `backend/ewvlm_fastapi_gateway.py`
- **포렌식 영상 내보내기 API 추가 (`POST /api/v1/records/export`)**: 지정된 채널과 시간 구간에 대한 영상을 병합하고, VLM 이벤트 마커 메타데이터를 입혀 추출하는 시뮬레이션 엔드포인트를 신설합니다.
- **감사 로그 조회 API 추가 (`GET /api/v1/audit/logs`)**: "누가", "언제", "어떤 기기(IP)"에서 "무슨 행동(PTZ 조작, 로그인, 권한 변경 등)"을 했는지 보여주는 가상의 Audit Log DB를 반환합니다.

### Frontend Components
#### [MODIFY] `frontend/src/components/MultiChannelSyncPlayback.tsx`
- 기존의 다채널 동기화 플레이백 컴포넌트에 **'구간 지정 내보내기'** 기능을 추가합니다.
- 내보내기 버튼(Download) 클릭 시 모달창이 열리며, 타임라인 구간(시작~종료)을 선택하고 백엔드 API를 호출하여 내보내기 진행 상태(Progress)를 시각적으로 보여줍니다.

#### [NEW] `frontend/src/components/SystemAuditLogPortal.tsx`
- 전체 시스템 조작 이력을 열람할 수 있는 시스템 감사 로그 포탈 컴포넌트를 신규 개발합니다.
- 데이터 테이블 형태로 로그를 렌더링하며, 심각도(Info, Warning, Critical)와 액션 유형별 필터링 기능을 제공합니다.

#### [MODIFY] `frontend/src/App.tsx`
- 신규 생성한 `SystemAuditLogPortal` 컴포넌트를 import 하고 라우팅을 활성화합니다. (현재 메뉴 드롭다운 링크는 이미 존재합니다.)

## Verification Plan
1. **포렌식 내보내기**: 상단 탭의 `저장영상`으로 이동하여 하단 유틸리티 툴바의 `다운로드` 아이콘을 클릭, 모달에서 내보내기를 실행하고 로딩 상태와 완료 메시지를 확인합니다.
2. **시스템 감사 로그**: 우측 상단 톱니바퀴 > `시스템 설정` > `시스템 감사 이력` 메뉴로 진입하여 테이블 형태로 렌더링되는 모의 감사 로그를 확인합니다.
