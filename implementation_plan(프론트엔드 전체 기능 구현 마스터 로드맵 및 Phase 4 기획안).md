# 프론트엔드 전체 기능 구현 마스터 로드맵 및 Phase 4 기획안

현재 27개의 UI 화면 중 대다수가 디자인 중심의 껍데기(Mock) 상태입니다.
이를 모두 실제 동작하는 화면으로 탈바꿈하기 위해 아래와 같이 단계별(Phase) 기획을 수립했습니다.

## 🗺️ 전체 화면 기능 활성화 마스터 로드맵

### ✅ Phase 1~3 (완료)
- UI 27종 컴포넌트 뼈대 구축 완료
- 실시간 비디오 스트리밍(YOLO) 및 Llama 3.2 Vision 백엔드 연동

### 🚀 Phase 4: 핵심 관제 데이터 실연동 (이번 진행 목표)
가장 중요한 **관제/검색/위치** 화면들에 먼저 실제 DB 데이터를 연결합니다.
- **VSS 시맨틱 서치 (`VssSemanticSearch.tsx`)**: 하드코딩된 검색결과를 버리고 REST API로 Llama VLM 로그 조회.
- **이벤트 리뷰 센터 (`EventReviewCenter.tsx`)**: DB에서 타임라인 이벤트를 시간순으로 불러와 렌더링.
- **카카오맵 GIS (`GisSmartMap.tsx`)**: 백엔드에서 카메라 위/경도를 불러와 동적으로 마커 생성.

### 🔐 Phase 5: 인증 및 시스템 모니터링 (다음 단계)
관리자가 시스템을 통제하고 권한을 관리하는 화면들을 활성화합니다.
- **JWT 로그인/가입 (`Login.tsx`, `Auth` 관련)**: 실제 DB 기반 사용자 인증 처리 및 세션 관리.
- **시스템 헬스 모니터 (`SystemHealthDashboard.tsx`)**: 서버 CPU, 메모리, GPU 사용량, Llama 추론 지연시간 등을 API로 받아와 실시간 차트로 표현.
- **감사 로그 포털 (`SystemAuditLogPortal.tsx`)**: 사용자 로그인 이력, SOP 실행 내역 등을 DB에서 조회.

### 🎛️ Phase 6: 고급 제어 및 하드웨어 연동 (최종 단계)
실제 물리 장비와 AI 설정값을 직접 건드리는 화면들입니다.
- **ONVIF PTZ 제어기 (`OnvifPtzController.tsx`)**: 백엔드 파이썬 스크립트와 연동하여 물리 CCTV 카메라 회전 및 줌아웃 제어 API 연결.
- **AI 캘리브레이션 (`AiCalibrationPanel.tsx`)**: Llama Vision 프롬프트 튜닝, YOLO 임계값(Confidence) 조절 등을 UI에서 직접 수정 후 백엔드에 반영.
- **리포트 센터 (`ReportCenter.tsx`)**: 주간/월간 알람 통계를 PDF나 엑셀로 추출하는 기능.

---

## User Review Required
> [!IMPORTANT]
> 27개의 모든 화면을 한꺼번에 연동하면 시간이 너무 오래 걸리고 오류 추적이 어렵습니다.
> 따라서 위 마스터 로드맵처럼 **Phase 4 (핵심 화면 연동)** -> **Phase 5 (인증/모니터링)** -> **Phase 6 (고급 제어)** 순서로 쪼개어 개발하는 방향을 제안합니다.

## Open Questions
> [!NOTE]
> 1. 제안해 드린 기능 개발 순서(로드맵)가 적절한가요? (예: 시스템 헬스를 먼저 보고 싶다면 Phase 4와 5를 바꿀 수 있습니다.)
> 2. 순서가 마음에 드신다면, 지금 바로 **Phase 4(검색, 리뷰, 지도)** 백엔드 REST API 신설 및 화면 연동을 시작해도 될까요?
