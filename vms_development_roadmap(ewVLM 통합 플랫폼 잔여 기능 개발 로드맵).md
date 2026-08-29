# ewVLM 통합 플랫폼 잔여 기능 개발 로드맵

현재 뼈대(UI)만 구성된 약 20여 개의 기능들을 가장 효율적이고 안정적으로 완성하기 위한 **4단계(Phase) 개발 로드맵**을 제안합니다.

시스템의 근간이 되는 '기본기'를 먼저 다진 후, 당사 솔루션의 핵심 가치인 '지능형 관리 도구'를 고도화하고, 마지막으로 '엔터프라이즈 부가 기능'을 완성하는 순서가 가장 이상적입니다.

---

## 🏗️ Phase 1: VMS 코어 안정화 및 필수 관제 기능 완성 (우선순위: 최상)
> 가장 먼저 사용자님이 겪으셨던 버그(카메라 그룹 미배정 문제, 해상도 드롭다운 누락 등)를 해결하고, 영상 보안 시스템의 가장 핵심인 **녹화 및 카메라 제어의 신뢰성**을 확보해야 합니다.

1. **카메라 관리 및 설정 고도화 (`CameraListManager`, `CameraSetupConfig`)**
   - **How:** 프론트엔드 Zustand 스토어와 백엔드 SQLite DB(또는 설정 파일) 간의 양방향 동기화 구현. 
   - **Target:** 그룹 생성/삭제, 프로필 해상도(SD 704x480 등) 동적 적용, RTSP 스트림 재시작 로직 연동.
2. **NVR 스토리지 대시보드 연동 (`NvrStorageDashboard`)**
   - **How:** 백엔드(FastAPI)에 하드웨어 리소스(CPU, RAM, 디스크 볼륨, 네트워크)를 주기적으로 수집하는 백그라운드 태스크(psutil 활용) 구현 후 웹소켓/API로 프론트엔드와 연동.
3. **다채널 동기화 재생 (`MultiChannelSyncPlayback`)**
   - **How:** MediaMTX의 녹화(Record) 기능이나 외부 NVR 스토리지 API와 연동하여, HLS 플레이어를 통해 타임라인 기반 동기화 재생(Play/Pause/Seek) 로직 구현.

---

## 🧠 Phase 2: VLM 및 엣지 AI 파이프라인 제어 권한 확보 (우선순위: 상)
> ewVLM의 핵심 차별화 포인트인 AI 지능형 기능을 시스템 관리자가 직접 통제하고 최적화할 수 있는 인프라 UI를 완성합니다.

1. **프롬프트 게이트웨이 및 배포 (`PromptGatewayDeploy`)**
   - **How:** 백엔드에 프롬프트 버전 관리 시스템 구축. 카메라 채널별로 다르게 적용할 시스템 프롬프트(예: Moondream용 특화 프롬프트)를 할당하고 핫 리로드(Hot-reload)하는 기능 구현.
2. **VLM 분석 모니터 (`MonitorBVlmAnalysis`)**
   - **How:** 웹소켓을 통해 실시간으로 들어오는 VLM 메타데이터(바운딩 박스 좌표, 객체 캡션, 신뢰도)를 캔버스(Canvas)에 오버레이 드로잉하는 렌더링 최적화 로직 구현.
3. **시맨틱 벡터 DB 관리 (`SemanticVectorPortal`)**
   - **How:** ChromaDB 또는 Qdrant API와 연동하여 현재 인덱싱된 벡터 메타데이터 개수를 조회하고, 임베딩 클러스터 헬스 체크 및 인덱스 리빌딩(Re-indexing) 기능 구현.
4. **LoRA 미세조정 & 엣지 AI 제어 (`LoraFinetuningConsole`, `EdgeAiOrchestration`)**
   - **How:** 오답 피드백(Active Learning)으로 쌓인 데이터셋을 로컬 학습 스크립트와 연동. 학습 진행률(Epoch, Loss) 추이를 차트로 렌더링.

---

## 🏢 Phase 3: 엔터프라이즈 운영 및 보안 체계 통합 (우선순위: 중)
> 시스템이 대규모(수십~수백 대의 카메라)로 확장될 때 필요한 보안 및 무결성 검증 기능을 연동합니다.

1. **다중 사이트 권한 매트릭스 (`MultiSiteAuthMatrix`)**
   - **How:** 백엔드 JWT 토큰 기반의 Role-Based Access Control(RBAC) 구현. 운영자, 관리자, 뷰어 등 등급에 따른 API 접근 제어 로직 작성.
2. **네트워크 토폴로지 모니터 (`NetworkTopologyMonitor`)**
   - **How:** ICMP Ping 또는 SNMP 프로토콜을 백엔드에서 폴링하여 각 노드(카메라, NVR, 스위치)의 활성 상태를 트리 맵(D3.js 또는 React Flow)에 실시간 반영.
3. **프라이버시 마스킹 영상 반출 (`PrivacyExportWorkshop`)**
   - **How:** OpenCV 또는 FFmpeg 필터를 백엔드에서 구동하여 특정 바운딩 박스 영역을 블러(Blur) 처리한 MP4 렌더링 파이프라인 및 다운로드 기능 구현.
4. **시스템 감사 로그 완벽 연동 (`SystemAuditLogPortal`)**
   - **How:** 현재 읽기만 가능한 감사 로그에, 실제 주요 설정 변경 시 자동으로 암호화 해시(SHA-256) 트랜잭션이 생성되도록 백엔드 인터셉터(Middleware) 추가.

---

## 🚀 Phase 4: 재난 대응 및 부가 관제 유틸리티 완성 (우선순위: 하)
> 일반적인 관제를 넘어선 특수 상황 대응(재난 워룸, 모바일 순찰) 기능들을 마지막으로 완성합니다.

1. **재난 가상 워룸 (`DisasterVirtualWarRoom`)**
   - **How:** WebRTC 화상 채팅(Peer-to-Peer) 통신 방 개설 기능 및 화면 공유, 레이아웃 동기화 로직 구현.
2. **실시간 BI 통계 대시보드 (`RealtimeBiDashboard`)**
   - **How:** VLM이 검출한 객체 빈도, 이벤트 발생 통계(시간대별, 지역별)를 DB GroupBy 쿼리로 묶어 Recharts 등 차트 라이브러리로 시각화.
3. **모바일 순찰 앱 연동 및 IP 오디오 (`MobilePatrolApp`, `IpAudioBroadcastConsole`)**
   - **How:** PWA(Progressive Web App) 형태의 모바일 레이아웃 최적화, Web Push 알림 연동. 백엔드에서 카메라 스피커(ONVIF)로 TTS 스트림 송출 기능 연동.
4. **PTZ 고급 제어 (`PtzPatrolSchedule`, `PtzTargetHandover`)**
   - **How:** ONVIF Preset Tour(자동 순찰) API 연동. VLM 트래킹 좌표를 PTZ 이동 명령으로 변환하는 핸드오버 알고리즘 구현.
