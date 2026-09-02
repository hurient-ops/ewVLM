# ewVLM 미구현 및 Mock 의존 현황 보고서

현재 프로젝트 디렉토리 전체를 면밀히 재검토한 결과, 시스템의 핵심 뼈대(인터페이스, 컴포넌트 라우팅, 기본 관제 레이아웃)는 구성되어 있으나, **실제 프로덕션 레벨의 동작을 위해 백엔드 로직 연동 및 실제 데이터 파이프라인 구축이 필요한 부분**이 다수 발견되었습니다. 

특히 하드웨어 제어, 고급 AI 파이프라인, 비디오 스트리밍 영역에서 **Mock(가짜) 데이터와 시뮬레이터에 의존**하고 있는 상태입니다.

---

## 1. 프론트엔드 (UI 껍데기만 존재하거나 연동 미비인 컴포넌트)

아래 컴포넌트들은 UI 화면(Shell)은 퍼블리싱 되어 있으나, 실제 동작하는 백엔드 API가 연결되어 있지 않습니다.

### 🧠 차세대 AI & VLM 심화 기능
- **`VssSemanticSearch.tsx` (의미 기반 영상 검색)**: "빨간 옷 입은 사람" 등 자연어 검색을 위한 Vector DB 연동 및 메타데이터 파이프라인 미구현.
- **`LoraFinetuningConsole.tsx` (엣지 AI 파인튜닝)**: 현장 영상 데이터를 수집하여 모델(LoRA)을 재학습시키고 배포하는 MLOps 파이프라인 부재.
- **`PromptGatewayDeploy.tsx` (프롬프트 라우팅 관리)**: 카메라 상황에 맞는 다중 프롬프트 분기, A/B 테스트 등 프롬프트 엔지니어링 관리 로직 미연동.

### 🔌 하드웨어 및 인프라 제어
- **`PtzPatrolSchedule.tsx` / `PtzTargetHandover.tsx`**: 화면상 버튼은 존재하나 클릭 시 콘솔 로그만 출력되며, 실제 카메라 렌즈 제어(ONVIF/PTZ) 로직 연결 안 됨.
- **`NetworkTopologyMonitor.tsx`**: PoE 전력, 네트워크 트래픽 등 스위치 장비의 실시간 SNMP 데이터를 가져오는 로직 부재.
- **`HardwareSelfHealingShell.tsx`**: 엣지 디바이스 온도 상승이나 메모리 누수 시 물리적인 자동 재부팅/복구를 수행하는 데몬(Agent) 연결 안 됨.

### 📊 데이터 분석 및 프라이버시
- **`PrivacyExportWorkshop.tsx` (프라이버시 반출)**: 영상 내 인물 모자이크 및 번호판 블러(Blurring) 처리 후 MP4로 렌더링(FFmpeg)하여 다운로드하는 기능 부재.
- **`RealtimeBiDashboard.tsx` (BI 통계 대시보드)**: 장기 누적 데이터(히트맵, 피플카운팅 등)를 집계하고 쿼리하는 백엔드 로직 미구현.

### 🛠 관리자 유틸리티
- **`MassDeviceConfigClone.tsx`**: 다수의 카메라나 엣지 장비 설정을 일괄 복제 및 배포(Provisioning)하는 기능 미구현.
- **`MobilePatrolApp.tsx`**: 모바일 푸시 알림(FCM) 및 GPS 웹소켓 연동 미구현.

---

## 2. 백엔드 (Mock Data 및 더미 로직 의존 현황)

코드베이스 검색 결과, 수많은 부분에서 하드웨어 연동의 어려움을 피하기 위해 `Mock(가짜/시뮬레이션)` 데이터를 반환하고 있습니다. 실제 환경 투입을 위해서는 이들을 전부 Real Data 연동으로 교체해야 합니다.

1. **AI 추론(VLM) 결과의 Mocking**
   - `ewvlm_ollama_bridge.py`, `ewvlm_lmstudio_bridge.py`: 카메라의 캡처 이미지를 실제로 분석하지 못할 때, **사전에 정의된 가짜 캡션(Dummy Caption)**("지면 상에 누출된 유독 가스로 추정되는 백색 연기가...", "CCTV-0024 서쪽 옹벽 인근 낙상...")을 반환하는 하드코딩이 들어 있습니다. 실영상 캡처 실패 시 더미 이미지(base64)를 뱉어내기도 합니다.

2. **비디오 스트리밍 (Mock WebRTC / 파일 재생)**
   - `mock_webrtc_server.py`: 실제 WebRTC 미디어 서버(Janus/Mediamtx 등)가 아닌 임시 HTTP 서버로 스트리밍을 흉내내고 있습니다.
   - `fast_loop.py`: 실제 RTSP 실시간 스트림 연결 실패 시, `mock_videos/` 폴더 안의 로컬 `.mp4` 파일을 읽어와 마치 실시간 카메라인 것처럼 속여 재생하고 있습니다.

3. **이벤트 및 카메라 정보 시뮬레이션**
   - `useEventSimulator.ts`: 백엔드에서 실시간 WebSocket 이벤트를 받는 대신, 프론트 자체 타이머를 돌려 무작위 이벤트를 띄우고 있습니다.
   - `MonitorALiveControl.tsx`: 백엔드 API에서 카메라 리스트를 불러오지 않고 `MOCK_CAMERAS` 상수를 사용해 카메라 트리를 하드코딩으로 그리고 있습니다.
   - 데이터베이스 연동(`ewvlm_fastapi_gateway.py` 등) 부분에서도 DB 연결이 원활하지 않을 때 `DATABASE_MOCK`이라는 딕셔너리에 데이터를 저장하는 폴백 구조가 남아있습니다.

4. **하드웨어 제어 (Mock PTZ)**
   - `onvif_controller.py`: 라이브러리(`onvif-zeep`) 부재 또는 연결 실패 시, 에러 없이 콘솔에 로그만 남기고 성공한 척하는 `Mock Mode`로 동작합니다.
