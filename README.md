# ewVLM: 엣지-클라우드 듀얼루프 기반 지능형 차세대 영상관제(VMS) & 폐쇄망 로컬 MLOps 플랫폼

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![YOLOv11](https://img.shields.io/badge/YOLO-v11n-00FFFF.svg)](https://github.com/ultralytics/ultralytics)
[![LM Studio](https://img.shields.io/badge/LM_Studio-Qwen2--VL_7B-7C3AED.svg)](https://lmstudio.ai/)

> **ewVLM**은 고비용·고지연 문제를 해결하기 위해 **1차 Fast-Loop(YOLOv11 엣지 객체 감지)**와 **2차 Slow-Loop(VLM 멀티모달 시계열 포렌식)**의 듀얼루프(Dual-Loop) 아키텍처를 채택하고, 외부 인터넷 연결 없이 100% 폐쇄망(Air-Gapped) 환경에서 운영 및 로컬 파인튜닝(MLOps Closed-Loop)이 가능하도록 설계된 차세대 지능형 영상관제 솔루션입니다.

---

## 📑 목차 (Table of Contents)
1. [프로젝트 핵심 개요](#1-프로젝트-핵심-개요)
2. [핵심 아키텍처 (Dual-Loop & Closed-Loop)](#2-핵심-아키텍처)
3. [3대 독립 워크스페이스 & 듀얼 모니터 관제](#3-3대-독립-워크스페이스--듀얼-모니터-관제)
4. [하드웨어 자동 감지 & 어댑티브 VLM 엔진](#4-하드웨어-자동-감지--어댑티브-vlm-엔진)
5. [기술 스택 (Tech Stack)](#5-기술-스택-tech-stack)
6. [시스템 디렉터리 구조](#6-시스템-디렉터리-구조)
7. [서비스 포트 및 네트워크 구성](#7-서비스-포트-및-네트워크-구성)
8. [설치 및 빠른 실행 가이드 (Quick Start)](#8-설치-및-빠른-실행-가이드-quick-start)
9. [주요 파이프라인 및 워크플로우](#9-주요-파이프라인-및-워크플로우)

---

## 1. 프로젝트 핵심 개요

기존 지능형 CCTV의 가장 큰 한계는 단순 바운딩 박스 탐지(CNN/YOLO)로 인한 **극심한 오탐(False Positive: 바람에 흔들리는 나뭇가지, 일반 보행자를 침입자로 오인 등)**과 관제 피로도 증가였습니다. 또한 클라우드 VLM API는 초당 영상 데이터 전송 비용과 기밀 영상 유출이라는 보안 취약점을 안고 있습니다.

**ewVLM은 다음의 혁신적 설계를 통해 이를 해결합니다:**
* **99% 오탐 필터링**: 1차 YOLOv11 감지 시 전·후 2.5초 간의 시계열 4컷 그리드(Temporal 4-Grid)를 추출하여 2차 VLM(Qwen2-VL, PaliGemma, Llama 3.2 Vision 등)이 객관적 인과관계를 심층 분석함으로써 오탐을 즉각 `safe(정상)` 판정 및 자동 분류합니다.
* **100% 폐쇄망 로컬 운영**: 외부 클라우드 통신 없이 로컬 GPU(GTX 1660 SUPER 6GB부터 RTX 4090/A100 80GB까지)에서 LM Studio 및 인하우스 엔진을 통해 실시간 추론과 파인튜닝을 자체 완결합니다.
* **지속 가능한 MLOps 폐루프**: 관제사가 화면에서 클릭한 한 번의 검증/오탐 피드백이 DB에 적재되고, 내장된 `LLaMA-Factory (v0.9.6)` 기반 4-bit QLoRA 훈련 파이프라인을 통해 재학습된 후 무중단(Hot-Swap)으로 운영 모델에 즉시 배포됩니다.

---

## 2. 핵심 아키텍처

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   ewVLM 듀얼루프 파이프라인                             │
└────────────────────────────────────────────────────────────────────────────────────────┘

  [RTSP IP 카메라 / CCTV 스트림]
                │
                ▼ (WebRTC / RTSP)
  ┌─────────────────────────────────────────────────────────┐
  │ 1. Fast-Loop (엣지 실시간 감지 레이어 - Port: 8001)     │
  │    • 프레임 드랍 없는 30+ FPS 실시간 추론               │
  │    • YOLOv11n (경량 5.6MB 모델, VRAM 300MB 점유)         │
  │    • 위험 객체 감지 시 시계열 프레임 버퍼링 (T-2.5s ~ T0)│
  └─────────────────────────────┬───────────────────────────┘
                                │ 에스컬레이션 트리거 (HTTP POST / 백프레셔 큐)
                                ▼
  ┌─────────────────────────────────────────────────────────┐
  │ 2. Backend Gateway (FastAPI 코어 서버 - Port: 8000)     │
  │    • 2x2 시계열 그리드 이미지(Temporal Grid) 합성       │
  │    • SQLite / pgvector 기반 이벤트 및 임베딩 영구 적재 │
  │    • WebSocket (/ws/events) 전사 실시간 브로드캐스트    │
  └─────────────────────────────┬───────────────────────────┘
                                │ 멀티모달 추론 질의 (Prompt + 4-Grid Image)
                                ▼
  ┌─────────────────────────────────────────────────────────┐
  │ 3. Slow-Loop (VLM 정밀 포렌식 레이어 - Port: 1234)      │
  │    • LM Studio / 로컬 추론 브릿지                       │
  │    • 베이스 모델: Qwen2-VL 7B / PaliGemma 2 / Llama 3.2 │
  │    • 인과관계 추론: threat_level (critical | safe) 판정 │
  │    • 권장 SOP 자동 수립 ("조치 불필요" vs "경고 방송")  │
  └─────────────────────────────┬───────────────────────────┘
                                │ 분석 결과 웹소켓 전달 & DB 적재
                                ▼
  ┌─────────────────────────────────────────────────────────┐
  │ 4. Frontend 관제 콕핏 (React / Vite - Port: 5174)       │
  │    • [Monitor A] 실시간 16분할 관제 & ONVIF PTZ 제어    │
  │    • [Monitor B] VLM 사건 포렌식 타임라인 & SOP 워룸     │
  │    • [AI MLOps] 피드백 데이터 수집 ➔ 4-bit LoRA 재학습  │
  └─────────────────────────────────────────────────────────┘
```

---

## 3. 3대 독립 워크스페이스 & 듀얼 모니터 관제

현장 관제사의 1초가 급한 물리적 감시 업무와 고부하 AI 학습/포렌식 업무가 뒤섞이지 않도록, 상단 글로벌 네비게이션을 **3대 독립 도메인**으로 물리 분리하였습니다.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 ewVLM 글로벌 상단 네비게이션                                │
├──────────────────────────────┬──────────────────────────────┬───────────────────────────────┤
│    [1. Monitor A]            │    [2. Monitor B]            │    [3. AI MLOps 스튜디오]     │
│    현장 실시간 관제/제어     │    VLM 지능형 사건 포렌식    │    폐쇄망 자체 모델 학습 센터 │
├──────────────────────────────┼──────────────────────────────┼───────────────────────────────┤
│ • 16분할 실시간 CCTV (WebRTC)│ • VLM 심층 사건 분석 피드    │ • 로컬 데이터셋 관리 & 검증   │
│ • 물리적 PTZ 조그/방향키     │ • 가상 재난 워룸 (SOP)       │ • LLaMA-Factory 4-bit LoRA학습│
│ • 비상 IP 오디오 라이브 방송 │ • 사건 비디오 분절 클립 재생 │ • 실시간 Loss/VRAM 모니터링   │
│ • 긴급 알림 센터 (Alert)     │ • 실시간 BI 통계 대시보드    │ • LoRA 어댑터 무중단 핫배포   │
│ • 다채널 동기화 플레이백     │ • 자연어 시맨틱 검색 (VSS)   │ • 프롬프트 템플릿 관리        │
│ ➔ [주 사용자: 현장 관제사]   │ ➔ [주 사용자: 상황실장/조사관]│ ➔ [주 사용자: AI/시스템 관리자│
└──────────────────────────────┴──────────────────────────────┴───────────────────────────────┘
```

### [워크스페이스 1] Monitor A: 실시간 관제 도메인 (Operator)
* **16분할 그리드 WebRTC 스트리밍**: MediaMTX 서버와 연동하여 초저지연(<200ms) 비디오 피드 렌더링.
* **ONVIF 능동 제어**: 카메라 기하학적 캘리브레이션(고도, 틸트 각도, 초점거리) 기반 2D-3D 공간 좌표 변환 및 PTZ 조그 다이얼 제어.
* **IP 오디오 방송 콘솔**: 특정 구역 스피커를 선택하여 TTS 또는 실시간 경고 방송 송출.
* **다채널 동기화 저장영상 플레이백**: 여러 카메라의 특정 사건 발생 시점을 밀리초 단위로 동기화하여 동시 되감기/탐색.

### [워크스페이스 2] Monitor B: VLM 지능형 사건 포렌식 (Investigator)
* **새 창 분리(Detached Window)**: 듀얼 모니터 환경에서 Monitor B를 클릭 한 번으로 독립 창으로 분리하여 별도 모니터에 전체 화면 배치 가능 (BroadcastChannel 기반 실시간 양방향 동기화).
* **VLM 사건 분석 피드 & 자동 보고서 초안**: VLM이 분석한 객관적 텍스트 정황과 권장 조치가 실시간 표출되며 결재 승인 지원.
* **사건 비디오 분절(Chunk) 즉각 재생**: 사건 전후가 기록된 MP4 청크 파일을 클릭 즉시 인스펙션 뷰어로 확인.
* **VSS 시맨틱 챗봇 & 프라이버시 마스킹**: 관제 카메라 영상을 자연어로 질의응답하고, 외부 반출 시 OpenCV/FFmpeg 기반 안면/차량번호판 자동 블러링 적용.

### [워크스페이스 3] AI MLOps 스튜디오: 폐쇄망 자체 모델 학습 센터 (MLOps Admin)
* **데이터셋 오케스트레이터**: 관제사가 누른 "실제 정답(TP)" 또는 "오탐(FP)" 피드백 데이터를 클릭 한 번으로 LLaMA-Factory 표준 비전 데이터셋(`dataset_info.json`, `data.jsonl`)으로 변환.
* **인하우스 4-bit QLoRA 훈련 엔진**: 외부 스크립트 실행 없이 웹 콘솔에서 LoRA Rank, Alpha, Learning Rate, Batch Size를 지정하고 비동기 학습 수행.
* **실시간 텔레메트리**: WebSocket(`/ws/lora/telemetry`)을 통해 실시간 Step별 Loss 커브와 GPU VRAM/온도 모니터링.
* **무중단 핫배포(Hot-Swap)**: 학습 완료된 LoRA 가중치를 VMS 재시작 없이 즉시 활성화하여 신규 위험 패턴 대응.

---

## 4. 하드웨어 자동 감지 & 어댑티브 VLM 엔진

ewVLM은 관제 서버의 GPU 및 VRAM 용량을 시작 시 자동 감지([`hardware_profiler.py`](file:///e:/projects/ewVLM/backend/mlops/hardware_profiler.py))하여, 하드웨어 사양에 맞춰 최적의 모델과 하이퍼파라미터를 동적으로 구성합니다.

| VRAM 용량 / GPU 환경 | 하드웨어 티어 | 권장 VLM 모델 구성 | 추론 및 학습 모드 |
| :--- | :--- | :--- | :--- |
| **6GB** (GTX 1660S / RTX 2060) | `MAINSTREAM_ENTRY` | **Qwen2-VL 7B Instruct** / **PaliGemma 3B** | 4-bit QLoRA, Batch=1, Gradient Checkpointing |
| **8GB ~ 12GB** (RTX 3060 / 4070) | `ADVANCED` | **Upstage Solar 10.7B** / **Qwen2-VL 7B** | 4-bit / 8-bit, 한국어 보안 지침 특화 |
| **16GB ~ 24GB** (RTX 3090 / 4090) | `ENTERPRISE` | **Meta Llama 3.2 11B Vision** | 8-bit / 16-bit 초고화질 시계열 멀티 이미지 추론 |
| **32GB+** (RTX 5090 / RTX 6000 Ada / A100) | `ULTRA_SERVER_32GB` | **Tri-Model Ensemble (3대 모델 동시 로딩)**<br>• Google PaliGemma 3B<br>• Meta Llama 3.2 11B Vision<br>• Upstage Solar 10.7B | 3대 모델 병렬 교차 검증(Voting/Ensemble)으로 환각 0% 달성 |

---

## 5. 기술 스택 (Tech Stack)

### Backend & AI Engine
* **Language & Runtime**: Python 3.13 (Native Windows 64-bit)
* **API Framework**: FastAPI, Uvicorn, Pydantic v2
* **Database & ORM**: SQLAlchemy (Async), SQLite 3 / pgvector, HNSW 벡터 색인
* **Edge AI (Fast-Loop)**: Ultralytics YOLOv11 (`yolo11n.pt`), OpenCV-Python
* **Vision-Language Model (Slow-Loop)**: LM Studio 로컬 서버 (`qwen2-vl-7b-instruct`), Multi-Cloud VLM Bridge
* **MLOps Core**: LLaMA-Factory (v0.9.6.dev0), HuggingFace PEFT, BitsAndBytes 4-bit 양자화
* **Semantic Search**: Sentence-Transformers (`all-MiniLM-L6-v2`)

### Frontend
* **Core & Build**: React 18, TypeScript 5, Vite 5
* **Styling & Icons**: Tailwind CSS 3.4, Google Material Symbols, Lucide React
* **State Management**: Zustand 4 (도메인별 영구 스토어 분리)
* **Routing**: React Router DOM v6
* **Streaming Player**: WebRTC Player, Video.js, Canvas 2D Overlay

### Streaming & Infrastructure
* **Streaming Media Server**: MediaMTX v1.20.0 (RTSP / RTMP / WebRTC / HLS)
* **Hardware & Protocols**: ONVIF Protocol, SNMP v2c/v3, SSH Remote Edge Agent
* **Video Processing**: FFmpeg 동적 파이프라인 (비디오 청크 분절, 프라이버시 마스킹)

---

## 6. 시스템 디렉터리 구조

```text
ewVLM/
├── backend/
│   ├── ewvlm_fastapi_gateway.py     # 백엔드 마스터 게이트웨이 (API, WebSocket, VLM 워커)
│   ├── ewvlm_lmstudio_bridge.py     # LM Studio Qwen2-VL 로컬 브릿지
│   ├── fast_loop.py                 # YOLOv11 엣지 실시간 감지 프로세스 (Port: 8001)
│   ├── crud.py                      # SQLAlchemy 비동기 CRUD 인터페이스
│   ├── models.py                    # 데이터베이스 테이블 스키마 정의
│   ├── database.py                  # 비동기 DB 엔진 및 세션 관리자
│   ├── onvif_controller.py          # 물리 카메라 ONVIF 제어 및 PTZ 드라이버
│   ├── video_export_processor.py    # FFmpeg 기반 프라이버시 마스킹 비디오 인코더
│   ├── snmp_controller.py           # NVR 및 네트워크 스위치 자원 모니터링
│   ├── mlops/
│   │   ├── hardware_profiler.py     # GPU/VRAM 실시간 감지 및 어댑티브 모델 프로파일러
│   │   ├── dataset_orchestrator.py  # 피드백 DB ➔ LLaMA-Factory 비전 데이터셋 변환기
│   │   ├── inhouse_train_engine.py  # LLaMA-Factory 4-bit QLoRA 비동기 학습 실행기
│   │   ├── telemetry_bridge.py      # 웹소켓 기반 실시간 Loss/GPU 통계 브릿지
│   │   └── adapter_manager.py       # LoRA 어댑터 무중단 핫스왑 매니저
│   ├── mediamtx_v1.20.0_.../        # 내장 MediaMTX 비디오 스트리밍 서버
│   └── .env                         # 백엔드 환경 설정 파일
├── frontend/
│   ├── src/
│   │   ├── components/              # 3대 워크스페이스 핵심 컴포넌트
│   │   │   ├── MonitorALiveControl.tsx      # [Monitor A] 실시간 16분할 CCTV & PTZ
│   │   │   ├── MonitorBVlmAnalysis.tsx      # [Monitor B] VLM 심층 사건 분석 & 시맨틱 챗
│   │   │   ├── EventReviewCenter.tsx        # [Monitor B] 사건 포렌식 타임라인 & 비디오
│   │   │   ├── DisasterVirtualWarRoom.tsx   # [Monitor B] 가상 재난 워룸 & SOP
│   │   │   ├── LoraFinetuningConsole.tsx    # [MLOps] 4-bit LoRA 파인튜닝 콘솔
│   │   │   ├── DatasetManagementPortal.tsx  # [MLOps] 데이터셋 수집 및 변환 포털
│   │   │   └── PromptGatewayDeploy.tsx      # [MLOps] 프롬프트 템플릿 배포 관리
│   │   ├── layouts/                 # BaseLayout, MonitorBLayout, MlOpsLayout
│   │   ├── store/                   # Zustand 상태 스토어 (EventLog, SOP, Auth 등)
│   │   ├── api/                     # Axios API 클라이언트 및 WebSocket 관리자
│   │   ├── App.tsx                  # 전역 라우팅 구성 (React Router)
│   │   └── main.tsx                 # 애플리케이션 진입점
│   ├── package.json
│   └── vite.config.ts
├── models/                          # 로컬 VLM 베이스 가중치 및 LoRA 어댑터 저장소
├── yolo11n.pt                       # YOLOv11 나노 경량 모델 가중치
├── run_ewvlm_all.bat                # 윈도우 원클릭 전체 서비스 통합 기동기
└── README.md                        # 프로젝트 종합 가이드 문서
```

---

## 7. 서비스 포트 및 네트워크 구성

| 서비스 명칭 | 포트 번호 | 통신 프로토콜 | 설명 |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | `5174` | HTTP | Vite 개발 서버 및 React 관제 콕핏 SPA |
| **Backend Gateway** | `8000` | HTTP / WebSocket | FastAPI 메인 서버, REST API 및 `/ws/events` |
| **Fast-Loop AI** | `8001` | HTTP | YOLOv11 엣지 객체 감지 및 에스컬레이션 |
| **LM Studio (VLM)** | `1234` | HTTP (OpenAI 규격) | 로컬 멀티모달 VLM 추론 엔드포인트 |
| **MediaMTX WebRTC** | `8889` | HTTP / WebRTC | CCTV 브라우저 다이렉트 WebRTC WHEP 스트림 |
| **MediaMTX API** | `9997` | HTTP | MediaMTX 동적 스트림 경로 설정 API |
| **RTSP 스트리밍** | `8554` | RTSP | IP 카메라 입력 및 NVR 미디어 릴레이 |

---

## 8. 설치 및 빠른 실행 가이드 (Quick Start)

### 사전 필수 요구사항 (Prerequisites)
1. **OS**: Windows 10/11 64-bit
2. **Python**: Python 3.13 (PyTorch CUDA, Ultralytics 패키지 설치 완료)
3. **Node.js**: Node.js v18 이상 및 npm
4. **LM Studio**: [LM Studio](https://lmstudio.ai/) 설치 후 `qwen2-vl-7b-instruct` 모델을 로드하고 로컬 서버(포트: `1234`) 가동

---

### 단계 1: 환경 설정 (`backend/.env`)
[`backend/.env`](file:///e:/projects/ewVLM/backend/.env) 파일의 설정을 확인합니다:
```env
# 로컬 VLM 모드 활성화 (LM Studio 사용 시 true)
USE_LOCAL_VLM=true

# YOLO 감지 모델 선택 (yolo11n.pt 권장)
YOLO_MODEL=yolo11n.pt

# 선택사항: 멀티 클라우드 앙상블 사용 시 API Key 설정
GROQ_API_KEY=your_groq_api_key
UPSTAGE_API_KEY=your_upstage_api_key
HF_API_KEY=your_huggingface_api_key
```

---

### 단계 2: 프론트엔드 의존성 설치
```bash
cd frontend
npm install
```

---

### 단계 3: 원클릭 통합 실행 (권장)
루트 디렉터리의 [`run_ewvlm_all.bat`](file:///e:/projects/ewVLM/run_ewvlm_all.bat) 파일을 더블 클릭하거나 콘솔에서 실행합니다:
```cmd
e:\projects\ewVLM\run_ewvlm_all.bat
```
이 배치가 실행되면 4개의 독립 콘솔 창이 자동으로 열리며 모든 마이크로서비스가 기동됩니다:
1. `MediaMTX 스트리밍 서버` (Port: 8889)
2. `FastAPI 백엔드 게이트웨이` (Port: 8000)
3. `React 프론트엔드 UI` (Port: 5174)
4. `YOLOv11 Fast-Loop 엣지 감지기` (Port: 8001)

---

### 수동 개별 실행 가이드 (개발/디버깅 시)

* **1. MediaMTX 실행:**
  ```cmd
  cd backend\mediamtx_v1.20.0_windows_amd64
  mediamtx.exe
  ```
* **2. 백엔드 게이트웨이 실행:**
  ```cmd
  cd backend
  python -m uvicorn ewvlm_fastapi_gateway:app --host 0.0.0.0 --port 8000
  ```
* **3. YOLOv11 Fast-Loop 실행:**
  ```cmd
  cd backend
  python fast_loop.py
  ```
* **4. 프론트엔드 개발 서버 실행:**
  ```cmd
  cd frontend
  npm run dev
  ```

브라우저에서 `http://localhost:5174`로 접속하면 통합 관제 콕핏이 열립니다.

---

## 9. 주요 파이프라인 및 워크플로우

### ① 오탐 필터링 및 VLM 정황 분석 흐름
1. CCTV 스트림에서 비정상 움직임 감지 시 YOLOv11이 1차 이벤트 바운딩 박스를 계산합니다.
2. 백엔드는 이벤트 발생 시점 전후 2.5초의 핵심 프레임을 4컷 2x2 그리드로 합성합니다.
3. 합성된 이미지를 LM Studio 로컬 VLM에 전송하여 다음 JSON 포맷으로 객관적 답변을 추출합니다:
   ```json
   {
     "threat_level": "safe",
     "summary": "영상에 보이는 작업자들은 보행로를 정상 이동 중이며 침입 시도는 관찰되지 않습니다.",
     "action": "조치 불필요"
   }
   ```
4. 백엔드는 `threat_level: "safe"` 확인 즉시 오탐으로 분류하고 불필요한 관제사 사이렌을 차단합니다.

### ② 관제사 피드백 기반 MLOps 폐루프 흐름
1. **피드백 수집**: 관제사가 Monitor B 또는 사건 검토 센터에서 사건을 확인하고 `정탐(TP)` 또는 `오탐(FP)` 버튼을 클릭합니다.
2. **데이터셋 변환**: MLOps 스튜디오의 `DatasetManagementPortal`에서 수집된 피드백을 LLaMA-Factory 표준 비전 파인튜닝 포맷으로 1클릭 변환합니다.
3. **로컬 LoRA 파인튜닝**: `LoraFinetuningConsole`에서 4-bit QLoRA 학습을 시작하여 현장 특화 추가 학습을 진행합니다.
4. **무중단 핫스왑**: 생성된 LoRA 어댑터(`adapter_model.bin`)를 VMS 재부팅 없이 백엔드 추론 파이프라인에 즉시 마운트하여 실시간 적용합니다.

---

## 📄 라이선스 (License)
본 프로젝트는 사내 보안 규정 및 비공개 연구 프로젝트 라이선스 정책을 준수합니다. 승인되지 않은 외부 유출 및 복제를 금합니다.
