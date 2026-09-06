# ewVLM 잔여 MOCK 데이터 및 추가 개발 요소 최종 분석 보고서

그동안의 고도화 작업으로 핵심 파이프라인(실시간 WebRTC, VSS 시맨틱 검색, AI 추론 워커 등)이 성공적으로 구축되었습니다. 하지만 소스 코드 전수 조사 결과, 개발 편의상 임시로 남겨두었던 **더미(Mock) 로직과 레거시 코드**가 일부 남아있습니다. 향후 프로덕션(Production) 레벨로 진입하기 위해 추가로 개발 및 정리해야 할 항목들을 아래와 같이 세밀하게 정리했습니다.

---

## 1. 백엔드 (Backend API & Logic) 잔여 MOCK

### A. 레거시 MOCK 데이터베이스 구조 남용 (`ewvlm_fastapi_gateway.py`)
- **현황**: 실제 SQLite/PostgreSQL 연동(Phase 20)이 완료되어 `crud.create_event` 등으로 DB 쓰기가 이루어지고 있음에도 불구하고, 과거에 쓰던 `DATABASE_MOCK` 전역 인메모리 배열에 이벤트를 이중으로 밀어넣는 코드(`line 555-574` 등)가 삭제되지 않고 남아있습니다.
- **조치 필요**: `DATABASE_MOCK` 변수와 이에 관련된 `append()` 로직을 모두 제거하여 메모리 누수 방지 및 코드 깔끔화가 필요합니다.

### B. VSS(시맨틱 검색) 엔드포인트 중복 및 데드 코드
- **현황**: `POST /api/v1/vss/search` 라우트가 파일 내에 2개 존재합니다. 
  - `line 1145`: 자연어에서 키워드 기반으로 가짜 의도(Intent)를 추출(`Mock VLM extracting intent`)하는 과거의 레거시 라우트.
  - `line 1946`: `sentence-transformers`를 활용하여 실제 임베딩 벡터 내적(Dot Product)을 계산하는 완성형 라우트.
- **조치 필요**: 상단에 위치한 레거시 라우트(1145행)를 삭제하고, 완성된 진짜 라우트로 단일화해야 합니다.

### C. VLM 챗봇 및 사건 보고서(Report) 생성 시뮬레이션
- **현황**: `/api/v1/events/{id}/report` 호출 시 AI가 보고서를 써주는 대신 고정된 문자열(`"🚨 [VLM 종합 보고서 - 사건 {id}]..."`)을 그대로 반환하는 하드코딩 상태입니다.
- **조치 필요**: 기존에 구축된 `LMStudioVLMBridge`를 활용해, 해당 사건의 캡션과 이미지를 넘겨 실제 Llama 3.2 모델이 자연어 보고서를 생성(Generation)하도록 연동해야 합니다.

### D. 외부 연동 시뮬레이션 (SOP, 블록체인, ONVIF, SNMP)
- **SOP 자동 대응**: `simulate_sop_response()` 함수가 `asyncio.sleep()`으로 시간만 지연시킬 뿐 실제 외부 시스템이나 하이퍼레저 블록체인에 트랜잭션을 전송하지 않습니다.
- **카메라/NVR 제어**: ONVIF 칼리브레이션, 매스 프로비저닝 시 `logger.info("Mock provisioning ONVIF...")`처럼 콘솔에만 출력됩니다.
- **하드웨어 모니터링**: NVR의 CPU/RAM 자원 상태를 가져오는 API(`get_nvr_status`)가 `_get_mock_stats()`를 호출하여 난수(랜덤값)를 발생시키고 있습니다.
- **조치 필요**: 실제 통신 패키지(예: `onvif-zeep`, `pysnmp`)를 연동하고 실패 시 예외 처리(Graceful Degradation)를 하는 구조로 개편해야 합니다.

### E. AI Copilot 및 Active Learning 피드백
- **현황**: 관제사가 오탐/정탐 피드백을 줄 때 DB 반영 로직이 누락(`Mocking the DB update` 주석)되었으며, VLM Copilot의 규칙 생성도 단순 키워드 매칭(Mock)으로 이루어집니다.
- **조치 필요**: 피드백 데이터를 실제 DB(`models.py` 확장)에 기록하고, 추후 LoRA 파인튜닝 데이터셋으로 직접 활용되도록 쿼리를 작성해야 합니다.

---

## 2. 프론트엔드 (Frontend React UI) 잔여 MOCK

### A. UI 동작 테스트용 트리거 이벤트
- **`MonitorCanvas.tsx`**: 영상 슬롯을 마우스로 클릭하면 가짜 이벤트를 발생시키는 디버깅용 함수(`triggerMockAlert(slotId)`)가 그대로 잔존해 있습니다.
- **조치 필요**: 프로덕션 빌드 전 해당 마우스 클릭 트리거를 제거하거나 실제 이벤트 발생 API로 대체해야 합니다.

### B. PTZ 컨트롤러 및 하드웨어 연동부
- **`MonitorALiveControl.tsx`**: UI 상에는 카메라를 제어할 수 있는 멋진 조이스틱과 PTZ 오버레이 버튼이 존재하지만, 클릭 시 백엔드의 `/api/v1/camera/ptz` 등에 명령을 쏘는 API 로직(`fetch` 또는 `axios` 호출)이 바인딩되어 있지 않습니다.
- **조치 필요**: 상태 관리 스토어나 이벤트를 통해 실제 백엔드 제어 명령(Axios)을 발생시키도록 연결해야 합니다.

### C. 데이터 없는 차트(Chart) 렌더링
- **`MassDeviceConfigClone.tsx` 등**: 통계 요약이나 엣지 디바이스 뷰에 하드코딩된 트리 뷰(`{/* Tree View Mockup */}`)나 더미 차트가 들어가 있습니다.
- **조치 필요**: 백엔드의 상태 조회 API를 호출하여 React의 `useEffect` 훅으로 실제 통계 데이터를 맵핑(Mapping)해야 합니다.

---

## 3. 총평 및 개발 우선순위 제안

시스템의 가장 중요한 "영상 분석 파이프라인"과 "스트리밍 시각화"는 완성되었으나, **주변부 서브 기능(보고서 자동 생성, 통계 차트, 하드웨어 장비 연동)에 목업(Mock)이 집중**되어 있습니다. 

**추천하는 향후 개발 우선순위:**
1. **[정리]** 백엔드의 `DATABASE_MOCK` 메모리 누수 위험 코드 및 중복 VSS 라우트 제거 (최우선)
2. **[AI 연동]** 하드코딩된 사건 보고서 API를 `LMStudioVLMBridge`와 연결하여 "진짜 AI 보고서" 생성 기능 완성
3. **[UI 연동]** 프론트엔드의 PTZ 컨트롤러 버튼에 실제 백엔드 호출 API 연결
4. **[인프라]** ONVIF, SNMP 등 물리적 장비 통신 프로토콜 구현 (실제 도입 환경에 맞춰 진행)
