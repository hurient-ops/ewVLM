# ewVLM 폐쇄망 자체 로컬 파인튜닝 엔진 구축 및 종합 개발 계획서

## 1. 프레임워크 기술 검토 및 선정 결과

### Q. 학습 엔진 구축에 LLaMA-Factory나 Unsloth는 필요 없는가?
**A. 결론부터 말씀드리면, 검증된 오픈소스 코어(LLaMA-Factory/PEFT)를 내부 엔진으로 캡슐화(Wrapper)하고, ewVLM 전용 자동화 파이프라인으로 감싼 "자체 로컬 학습 체계(In-House Training System)"를 구축하는 것이 가장 안전하고 강력한 접근법입니다.**

밑바닥(Scratch)부터 PyTorch 루프를 전부 직접 개발할 경우, 멀티모달 VLM의 패딩 토큰 정렬, LoRA 타겟 모듈(`q_proj`, `v_proj` 등) 맵핑, 그래디언트 누적, 4-bit 양자화 역전파 등에서 방대한 버그와 유지보수 비용이 발생합니다. 반면 검증된 엔진을 코어로 탑재하면 즉시 현업에서 쓸 수 있는 신뢰성을 확보할 수 있습니다.

---

### [기술 비교 분석]

| 구분 | Unsloth | LLaMA-Factory | **ewVLM 자체 로컬 학습 체계 (선정)** |
| :--- | :--- | :--- | :--- |
| **현재 컴퓨터 설치 상태** | 미설치 | **이미 v0.9.6 설치 완료 확인됨** | **설치된 LLaMA-Factory를 코어로 내장** |
| **운영체제 호환성** | Linux / WSL2 필수 (Windows 네이티브 컴파일 오류 빈번) | **Windows / Linux 모두 완벽 호환** | **Windows 네이티브 및 폐쇄망 서버 100% 호환** |
| **폐쇄망(Air-Gapped) 지원** | 추가 종속성 필요 | **`HF_HUB_OFFLINE=1` 완전 오프라인 지원** | **외부 통신 0%, 100% 로컬 파일/DB만 참조** |
| **VLM (Vision) 지원** | Llama Vision, Qwen-VL 등 지원 | **PaliGemma, Llama-3.2-Vision, Qwen2-VL 네이티브 지원** | **ewVLM 관제 비전 도메인에 특화된 자동화** |
| **운영 편의성** | 개별 스크립트 작성 필요 | 별도 WebUI 존재 (VMS와 분리됨) | **ewVLM 관제 화면(`LoraFinetuningConsole`)에서 원클릭 제어** |

> **시스템 점검 결과**:
> 사용자 PC(`Python 3.13`)에 이미 **`LLaMA-Factory (v0.9.6.dev0)`**, **`peft`**, **`bitsandbytes`**, **`accelerate`** 패키지가 완벽하게 설치되어 정상 import 가능한 상태입니다.
> 따라서 별도 외부 패키지 추가 설치 없이, 이미 갖춰진 자원을 활용해 **"ewVLM 자체 폐쇄망 MLOps 파이프라인"**을 즉시 구축할 수 있습니다.

---

## 2. ewVLM 자체 로컬 학습 체계(In-House MLOps) 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 ewVLM Frontend                                          │
│  [관제 오탐/정탐 피드백] ──> [LoraFinetuningConsole] ──> [원클릭 학습 시작 / 실시간 Loss 차트]│
└────────────────────────────┬─────────────────────────────▲──────────────────────────────┘
                             │ REST / WebSocket            │ WebSocket (/ws/lora/telemetry)
┌────────────────────────────▼─────────────────────────────┴─────────────────────────────┐
│                           ewVLM In-House MLOps Layer                                    │
│                                                                                         │
│  1. [Dataset Orchestrator]                                                              │
│     - SQLite feedback_logs 조회 ──> LLaMA-Factory 포맷(dataset_info.json + data.jsonl)  │
│                                                                                         │
│  2. [Local Training Engine Worker]                                                      │
│     - LLaMA-Factory 0.9.6 Core Wrapper (HF_HUB_OFFLINE=1, local_files_only=True)        │
│     - BitsAndBytes 4-bit QLoRA 구동 (GTX 1660S 6GB VRAM 완벽 지원)                      │
│                                                                                         │
│  3. [Telemetry Bridge]                                                                  │
│     - Trainer Callback 파싱 ──> Epoch, Step, Loss, GPU VRAM 실시간 브로드캐스트         │
│                                                                                         │
│  4. [Adapter Hot-Swapper]                                                               │
│     - 학습 완료된 .safetensors 어댑터를 Fast-Loop & VLM 게이트웨이에 무중단 핫 리로드      │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 세부 개발 명세 및 구현 항목

### 모듈 1. 데이터셋 자동 오케스트레이터 (`backend/mlops/dataset_orchestrator.py`)
* **기능**: 관제사의 오탐/정탐 판정 데이터를 LLaMA-Factory 멀티모달 표준 데이터셋으로 자동 변환.
* **산출 파일**:
  * `data/finetune/dataset_info.json`: LLaMA-Factory 인식용 데이터셋 레지스트리
  * `data/finetune/ewvlm_vision_train.json`: `{"messages": [{"role": "user", "content": "<image>상황 분석"}, {"role": "assistant", "content": "정답 라벨"}]}`
  * `data/finetune/images/`: 캡처된 현장 CCTV 스냅샷 파일 자동 동기화

### 모듈 2. 자체 폐쇄망 훈련 엔진 (`backend/mlops/inhouse_train_engine.py`)
* **기능**: LLaMA-Factory 파인튜닝 엔진을 백엔드 비동기 태스크(Worker)로 기동/정지.
* **주요 설정**:
  * `stage: sft`, `finetuning_type: lora`, `quantization_bit: 4` (QLoRA)
  * `template: paligemma` 또는 `llama3` (로컬 베이스 모델에 맞춰 자동 선택)
  * `cutoff_len: 1024`, `gradient_accumulation_steps: 4`, `fp16: true`
  * 완전 오프라인 강제: `os.environ["HF_HUB_OFFLINE"] = "1"`

### 모듈 3. 실시간 학습 텔레메트리 브리지 (`backend/mlops/telemetry_bridge.py`)
* **기능**: 훈련 도중 발생하는 학습 손실(Loss), 잔여 시간(ETA), VRAM 사용량을 1초 단위로 수집.
* **엔드포인트**: WebSocket `/ws/lora/telemetry` 및 `GET /api/v1/lora/status`

### 모듈 4. 가중치 무중단 핫 스왑 매니저 (`backend/mlops/adapter_manager.py`)
* **기능**: 훈련이 끝나면 생성된 LoRA 어댑터를 VMS 서버를 재시작하지 않고 추론 파이프라인에 즉시 주입.
* **엔드포인트**: `POST /api/v1/lora/adapters/activate`

---

## 4. 4단계 개발 실행 계획 (Roadmap)

### 📍 [Phase 1] 백엔드 코어 클린업 & 로컬 VLM 보고서 생성
1. `ewvlm_fastapi_gateway.py` 내 잔여 `DATABASE_MOCK` 전역 배열 완전 제거 (메모리 누수 차단)
2. `POST /api/v1/vss/search` 중복 라우트 정리 (로컬 임베딩 기반 단일화)
3. 로컬 VLM을 통한 실시간 사건 보고서 자동 생성 엔드포인트 구현 (`/api/v1/events/{id}/report`)
4. 관제사 피드백 데이터 영구 적재용 `feedback_logs` 테이블 구축

### 📍 [Phase 2] ewVLM 자체 폐쇄망 MLOps 엔진 구축 (LLaMA-Factory 코어 래핑)
1. `dataset_orchestrator.py`: DB 피드백 기반 자동 LLaMA-Factory Vision 데이터셋 생성기 구현
2. `inhouse_train_engine.py`: 설치된 LLaMA-Factory를 감싼 완전 오프라인 4-bit QLoRA 학습기 구현
3. `telemetry_bridge.py`: 실시간 Loss, Epoch, VRAM 텔레메트리 웹소켓 파이프라인 구축
4. 비동기 훈련 제어 REST API (`/api/v1/lora/train/start`, `stop`, `status`) 완성

### 📍 [Phase 3] 프론트엔드 연동 및 잔여 MOCK 제거
1. `LoraFinetuningConsole.tsx`:
   * 자체 로컬 학습 엔진과 완전 바인딩 (데이터셋 통계, 파라미터 조절, 실시간 Loss 차트, 어댑터 적용 버튼)
2. `MonitorALiveControl.tsx`: PTZ 조그/방향키 조작 시 실제 백엔드 `/api/v1/camera/{id}/ptz` 제어 통신 연결
3. `EventReviewCenter.tsx`: 사건 포렌식 타임라인 클릭 시 실제 분절 MP4 비디오 재생 연동
4. `MonitorCanvas.tsx`: 디버깅용 `triggerMockAlert` 완전 제거

### 📍 [Phase 4] 어댑터 무중단 핫 리로드 & 폐쇄망 E2E 검증
1. `adapter_manager.py`로 Fast-Loop 및 게이트웨이 VLM에 LoRA 어댑터 무중단 교체/적용 검증
2. 폐쇄망 환경에서의 전체 파이프라인(피드백 -> 학습 -> 가중치 갱신 -> 실시간 추론) E2E 테스트
3. 폐쇄망 운영 매뉴얼 및 원클릭 구동 스크립트 최종 업데이트
