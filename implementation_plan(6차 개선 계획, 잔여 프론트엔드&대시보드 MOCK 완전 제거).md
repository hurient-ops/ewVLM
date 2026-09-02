# 6차 개선 계획: 잔여 프론트엔드/대시보드 MOCK 완전 제거

이전 단계에서 핵심 백엔드/MLOps/하드웨어 제어 파이프라인의 시뮬레이션을 모두 걷어내고 실무 수준으로 격상시켰습니다. 마지막으로, 시스템 내부 및 대시보드 표출부에 남아 있는 잔여 MOCK(더미 데이터 반환 및 시뮬레이션)을 완전 삭제하여 100% 실데이터 기반 동작으로 전환합니다.

## User Review Required

> [!IMPORTANT]
> **대시보드 통계(BI Stats) 집계 방식 결정**
>
> 현재 `RealtimeBiDashboard`에 표시되는 인파, 차량, 고위험군 누적 수치는 백엔드의 `/api/v1/bi/stats`에서 하드코딩된 값(45,820 등)을 던져주고 있습니다. 이를 실제 DB의 `EventLog` 테이블을 조회하여 다음과 같이 카운팅하고자 합니다. 동의하시나요?
> - **personCount**: 이벤트 분석 결과(semantic_caption)에 '사람', '인파', '배회' 등이 포함된 로그 수 합산
> - **vehicleCount**: '차량', '주차', '진입' 등이 포함된 로그 수 합산
> - **highRiskCount**: `level`이 'critical'인 이벤트 로그 수 합산

## Proposed Changes

### [e:\projects\ewVLM\frontend\src\hooks\useEventSimulator.ts]
- **[DELETE]** 프론트엔드 단독으로 시연용 가짜 이벤트를 뿜어내던 시뮬레이터 훅 파일을 완전히 삭제합니다. (100% 백엔드 WebSocket 의존)

### [e:\projects\ewVLM\frontend\src\App.tsx]
- **[MODIFY]** `useEventSimulator` 임포트 구문 및 주석 처리된 호출부 삭제.

### [e:\projects\ewVLM\backend\ewvlm_fastapi_gateway.py]
- **[MODIFY]** `/api/v1/bi/stats` 엔드포인트
  - 하드코딩 수식(`base_person = 45820`) 제거
  - DB의 `EventLog` 테이블 전체 데이터를 비동기로 조회 후, 반복문을 통해 텍스트 검색 및 레벨 비교를 거쳐 실제 누적 통계치(person, vehicle, highRisk)를 계산해 반환하도록 로직 개편.

### [e:\projects\ewVLM\backend\ewvlm_fastapi_gateway.py] (대규모 프로비저닝)
- **[MODIFY]** `/api/v1/devices/config/sync` 엔드포인트
  - 단순 `asyncio.sleep(0.1)` 딜레이만 주던 더미 코드를 걷어내고, 실제 `onvif_controller`의 `get_controller()`를 호출하여 대상 카메라들에 비동기 병렬 접속을 시도하는 실제 푸시(Provisioning) 파이프라인으로 전환합니다. (접속 실패 시 안전하게 무시)

## Verification Plan
1. 브라우저에서 Realtime BI Dashboard 진입 시, 터무니없이 높은 4만 단위의 가짜 수치가 아닌 현재 DB에 쌓인 실제 이벤트 개수 기반의 통계가 뜨는지 확인.
2. 대규모 장비 일괄 설정(Mass Device Config) 실행 시 백엔드 터미널 로그에 실제 ONVIF 타임아웃/통신 시도 로그가 남는지 확인.
