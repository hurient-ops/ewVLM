# Phase 5: 의미 기반 검색, 프라이버시 마스킹, BI 대시보드 연동 계획

로드맵에 따라 "데이터 레이어 및 영상 처리"의 핵심인 **Phase 5** 통합을 위한 구현 계획입니다. 현재 껍데기뿐인 UI들을 백엔드 파이프라인과 완벽하게 연결하여 실시간 통계 및 실제 기능을 동작시킵니다.

## 1. 구현 목표 및 범위
1. **`VssSemanticSearch` (의미 기반 영상 검색)**: 
   - 프론트엔드가 이미 백엔드(`/api/v1/vss/search`)와 일부 연결되어 있으나, 검색 시 AI가 쿼리를 어떻게 분석했는지(Search Intent - 객체, 행동, 시간)를 사용자에게 명확히 시각화하여 VLM의 추론 과정을 노출합니다.
2. **`PrivacyExportWorkshop` (프라이버시 오토 마스킹)**: 
   - 임의의 `setTimeout`을 걷어내고, 실제 백엔드 API(`/api/v1/video/export/masking`)를 신설하여 비디오 렌더링/마스킹 파이프라인(모의)을 호출합니다.
   - 워터마크, 코덱 설정 등을 백엔드로 전송하고 처리 완료 응답을 받도록 구현합니다.
3. **`RealtimeBiDashboard` (실시간 비즈니스 인텔리전스)**:
   - 프론트엔드의 가짜 하드코딩 수식(`45820 + criticalCount * 12`)을 제거합니다.
   - 백엔드에 `/api/v1/bi/stats` 엔드포인트를 신설하여 실제 시스템 이벤트 로그를 기반으로 누적 사람/차량 수, 히트맵 상태를 계산하여 내려주도록 연동합니다.

## 2. 작업 상세 내역 (Proposed Changes)

### Backend (FastAPI Gateway)
- **[MODIFY]** `backend/ewvlm_fastapi_gateway.py`
  - `GET /api/v1/bi/stats`: 누적 객체 계수(사람, 차량) 및 위험 지표 반환 API 추가.
  - `POST /api/v1/video/export/masking`: 영상 마스킹 처리 시뮬레이션 및 완료 메시지 반환 API 추가.

### Frontend (API Client)
- **[MODIFY]** `frontend/src/api/client.ts`
  - `exportPrivacyVideo(config: any)` 함수 추가.
  - `getBiStats()` 함수 추가.

### Frontend (UI Components)
- **[MODIFY]** `frontend/src/components/VssSemanticSearch.tsx`
  - 백엔드에서 반환된 `search_intent`를 분석하여 "분석된 객체", "행동 컨텍스트", "시간 필터" 배지로 깔끔하게 렌더링하도록 UI 고도화.
- **[MODIFY]** `frontend/src/components/PrivacyExportWorkshop.tsx`
  - `handleExport` 함수를 `exportPrivacyVideo` API 호출로 변경하고 결과(성공 알림 등)를 표시.
- **[MODIFY]** `frontend/src/components/RealtimeBiDashboard.tsx`
  - `useEffect`로 `getBiStats` 호출 및 로컬 상태(`useState`)에 데이터 바인딩. 가짜 데이터 렌더링 제거.

## 3. 사용자 피드백 요청 (Open Questions)

> [!IMPORTANT]
> **Privacy Export 관련 다운로드 시뮬레이션**
> 프라이버시 마스킹 영상 반출 API가 호출된 후, 프론트엔드에서 실제로 **가짜 MP4 파일이나 ZIP 파일**을 다운로드 받는 브라우저 액션까지 시뮬레이션으로 구현해 드릴까요? 아니면 단순히 "반출이 완료되었습니다"라는 성공 알림 메시지로 갈음할까요?

> [!NOTE]
> 계획이 승인되면 위 항목들을 순차적으로 연동 및 테스트하겠습니다. 우측 상단의 **Proceed** 버튼을 눌러 승인해 주시거나, 수정이 필요한 사항을 말씀해 주세요!
