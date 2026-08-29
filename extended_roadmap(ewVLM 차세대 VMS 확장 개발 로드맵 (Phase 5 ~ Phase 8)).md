# ewVLM 차세대 VMS 확장 개발 로드맵 (Phase 5 ~ Phase 8)

현재 구현된 메인 파이프라인(관제-AI 감지-SOP-보안)의 바탕 위에, 껍데기(UI)만 남은 고급 기능 12개를 어떠한 논리적 순서로 백엔드/인프라와 통합해 나갈지에 대한 전략적 확장 로드맵입니다.

가장 시각적이고 가치가 높은 **데이터 검색/영상 처리**부터 시작하여, **물리적 하드웨어 제어**, **인프라 자동화**, 마지막으로 **스스로 진화하는 MLOps 체계** 순으로 개발하는 것을 추천합니다.

---

## 🚀 Phase 5: 의미 기반 AI 검색 및 영상 프라이버시 처리 (Data & Video Processing)
*가장 수요가 높고 AI의 가치를 직관적으로 보여주는 데이터 레이어를 완성합니다.*

- **`VssSemanticSearch.tsx` (자연어 영상 검색 연동)**
  - **개발 내용**: 사용자가 텍스트(예: "모자 쓴 수상한 사람")를 입력하면, 텍스트 임베딩 모델(CLIP 등)을 거쳐 백엔드 벡터 DB(Milvus)에 저장된 영상 메타데이터와 대조하는 API를 구축합니다.
- **`PrivacyExportWorkshop.tsx` (프라이버시 오토 마스킹 반출)**
  - **개발 내용**: 백엔드에 FFmpeg와 Face/License Plate Detection(YOLO 등) 파이프라인을 구축하여, 프론트에서 영상 반출 요청 시 서버가 백그라운드에서 자동으로 모자이크 처리를 수행한 후 다운로드 링크를 제공하도록 개발합니다.
- **`RealtimeBiDashboard.tsx` (비즈니스 인텔리전스 통계)**
  - **개발 내용**: 수집된 객체 감지 로그를 기반으로 시간대별 히트맵(Heatmap)과 피플 카운팅 데이터를 Aggregation하는 스케줄러를 백엔드에 구축합니다.

---

## 📷 Phase 6: 물리적 하드웨어 능동 제어 (Physical PTZ & ONVIF Layer)
*수동적인 관찰을 넘어, 시스템이 스스로 카메라를 움직이고 대상을 추적하는 액티브 계층을 구현합니다.*

- **`PtzPatrolSchedule.tsx` & `PtzTargetHandover.tsx` (PTZ 스케줄링 및 핸드오버)**
  - **개발 내용**: 백엔드에 ONVIF 프로토콜 라이브러리(또는 벤더 SDK)를 탑재하여, UI에서 설정한 스케줄이나 대상 좌표에 따라 실제 카메라 렌즈(Pan/Tilt/Zoom)를 움직이는 명령(Command) 제어 로직을 작성합니다.
- **`GeometryCalibrationConsole.tsx` (공간 캘리브레이션)**
  - **개발 내용**: 2D 픽셀을 3D 실제 물리 공간(미터)으로 변환하는 투영 변환(Perspective Transformation) 행렬을 백엔드에서 계산하는 수학적 파이프라인을 연동합니다.

---

## 🛡️ Phase 7: 인프라 자가 치유 및 모니터링 (DevOps & Edge Infra)
*현장에 설치된 엣지(Edge) 기기들과 네트워크가 뻗지 않도록 무중단 시스템을 구축합니다.*

- **`NetworkTopologyMonitor.tsx` (네트워크/PoE 모니터링)**
  - **개발 내용**: 백엔드에 SNMP 폴링(Polling) 데몬을 띄워 실제 스위치 허브의 포트별 네트워크 트래픽과 카메라에 들어가는 PoE 전력량(Watt)을 실시간 수집하여 UI에 쏩니다.
- **`HardwareSelfHealingShell.tsx` (하드웨어 원격 치유)**
  - **개발 내용**: 엣지 NPU/GPU 보드의 온도를 모니터링하다가 임계치 초과 시 백엔드가 SSH 터널링을 통해 원격으로 도커 컨테이너를 재시작하거나 쿨링 팬 속도를 조절하는 복구 스크립트를 작성합니다.

---

## 🧠 Phase 8: MLOps 체계 및 유틸리티 (Continuous Learning & Mobile)
*시스템이 운영될수록 스스로 똑똑해지는 학습 자동화 체계를 완성합니다.*

- **`LoraFinetuningConsole.tsx` (엣지 AI 맞춤형 파인튜닝)**
  - **개발 내용**: 작업자가 현장에서 오탐지된 이미지를 크롭하여 전송하면, 클라우드 GPU에서 LoRA(Low-Rank Adaptation) 학습 파이프라인을 돌려 가중치를 업데이트하고 이를 엣지 NVR에 OTA(Over-The-Air)로 재배포하는 아키텍처를 구현합니다.
- **`PromptGatewayDeploy.tsx` (프롬프트 라우팅 최적화)**
  - **개발 내용**: 다양한 VLM 모델 간의 프롬프트 버전을 관리하고 카메라 환경(주간/야간)에 따라 최적의 프롬프트를 라우팅해주는 백엔드 엔진을 개발합니다.
- **`MobilePatrolApp.tsx` & `MassDeviceConfigClone.tsx` (순찰 앱 및 일괄 설정)**
  - **개발 내용**: 모바일 푸시 서버(FCM) 구축, 수백 대의 NVR 환경설정을 한 번에 복제하는 배치(Batch) 서버 연동.

---

> [!NOTE]
> 위 로드맵은 난이도와 시각적 체감 효과를 고려하여 배열된 최적의 순서입니다.
> 당장 다음 단계로 **Phase 5 (의미 기반 검색 및 프라이버시 마스킹 연동)** 부터 시작하는 것을 권장드립니다. 동의하시면 바로 개발 기획에 착수하겠습니다!
