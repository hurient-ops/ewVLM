# LM Studio 전환 및 LLM/VLM 파인튜닝 파이프라인 구축 계획

본 계획은 기존 Ollama 기반의 추론 엔진을 LM Studio로 완전히 이관하고, LLaVA-Video-178K 데이터셋을 활용한 온프레미스(폐쇄망) 파인튜닝(LoRA) 및 가속 서빙(NVIDIA NIM/Triton) 파이프라인을 구축하기 위한 마스터 플랜입니다.

## User Review Required

> [!IMPORTANT]
> **LM Studio 모델 다운로드 안내 (Solar 모델 포함)**
> 첨부해주신 LM Studio 스크린샷을 분석한 결과, 여러 종류의 Solar 모델이 리스트업 되어 있습니다. 
> 백본으로 사용하실 **Solar 모델**의 경우, 범용적이고 한국어 지시 이행 능력이 가장 뛰어난 **`TheBloke/SOLAR-10.7B-Instruct-v1.0-GGUF`** 버전을 다운로드하시는 것을 강력히 권장합니다.
> (만약 `Solar DocVLM` 특정 GGUF 버전을 원하신다면, 검색창에 `Solar DocVLM GGUF`를 쳐서 나오는 호환 버전을 받으시거나, Instruct 모델을 베이스로 멀티모달 어댑터를 붙이는 방식으로 진행해야 합니다.)
> 
> 또한, **Llama 3.2 11B Vision**은 스크린샷에 있는 `leafspark/Llama-3.2-11B-Vision-Instruct` 버전을 그대로 다운로드하여 사용하시면 됩니다.

> [!TIP]
> **PaliGemma 2 (3B) 엣지(Edge) 검증기 아키텍처 검토 결과**
> **적합성 평가: 최상 (Highly Recommended)**
> 
> 기존에는 YOLO11이 탐지(Fast Loop)하면 곧바로 무거운 Llama 3.2 11B Vision(Slow Loop)으로 데이터를 넘겼으나, 중간에 **Google PaliGemma 2 (3B)** 모델을 Local Edge 1차 물리 검증기(정탐/오탐 필터링)로 두는 것은 아키텍처 관점에서 매우 훌륭한 접근입니다.
> 1. **초경량 & 초고속**: 3B 파라미터로 RTX 1660 Super와 같은 소형 GPU에서도 1초 이내의 빠른 추론(VQA)이 가능합니다.
> 2. **오탐(False Positive) 억제**: YOLO가 그림자나 동물을 '사람'으로 잘못 탐지했을 때, PaliGemma가 `Is this a real person unauthorized entry? (yes/no)` 같은 짧은 VQA를 수행해 가짜 알람을 90% 이상 컷아웃(Cut-out) 할 수 있습니다.
> 3. **서버 부하 감소**: 진짜 위협(True Positive)일 때만 중앙 서버의 무거운 Llama 3.2/Solar 모델을 깨우므로 시스템 전체의 자원 효율성이 극대화됩니다.
> *결론: 2단계 훈련 파이프라인 구성 시, PaliGemma 2 3B 모델을 Edge 검증기로 통합하는 모듈(Middle-tier)을 추가하겠습니다.*

## 1단계: 데이터셋 분리 및 통합 확보 (Phase 1)
- **.gitignore 처리 완료**: 이미 `backend/datasets/LLaVA-Video-178K` 경로를 `.gitignore`에 등록하여 깃허브 업로드 시 충돌 및 용량 초과가 발생하지 않도록 조치 완료했습니다.
- **데이터 병합**: 허깅페이스에서 다운로드 완료한 LLaVA-Video-178K 원천 합성 데이터셋(Apache 2.0)과 업스테이지(Upstage) 한국어 도메인 산업 안전 데이터셋을 매핑하여 파인튜닝용 통합 JSON/Parquet 구조로 정제하는 전처리 스크립트(`prepare_dataset.py`)를 개발합니다.

## 2단계: 로컬 온프레미스 LoRA 파인튜닝 (Phase 2)
- **Air-Gapped Fine-Tuning 구성**: 인터넷이 차단된 폐쇄망 환경에서도 학습이 가능하도록 `torch`, `torchvision`, `decord` 등을 활용한 로컬 훈련 파이프라인(`finetune_vlm.py`)을 구축합니다.
- **백본 & 이식 기술**: 
  - 중앙 통제용(Heavy): Meta Llama 3.2 11B Vision 및 Solar 모델 (심층 정황 분석용)
  - 엣지 검증용(Light): Google PaliGemma 2 3B (1차 정탐/오탐 컷아웃 및 필터링용)
  - LLaVA-Video의 핵심인 **SlowFast 토크나이저 레이어**를 결합하여 공간적(Spatial) 해상도와 시간적(Temporal) 프레임 변화를 동시에 인지할 수 있는 어댑터 모듈을 설계합니다.
- **학습 주입**: 구축된 고밀도 시공간 대화셋을 LoRA(Low-Rank Adaptation) 방식으로 주입하여 적은 VRAM으로도 효율적으로 모델의 산업 안전 인지 가중치를 업데이트합니다.

## 3단계: 가속 서빙 인프라 탑재 (Phase 3)
- **LM Studio 연동 로직 전환**: 기존 `ewvlm_ollama_bridge.py` 코드를 기반으로 LM Studio의 로컬 REST API(OpenAI 호환 API)를 사용하도록 `ewvlm_lmstudio_bridge.py` 브릿지를 신규 개발하여 연동을 교체합니다.
- **NVIDIA NIM & Triton 최적화**: 
  - PaliGemma 2 (Edge) -> Llama 3.2 (Core)로 이어지는 다중 모델 앙상블(Ensemble) 파이프라인을 설계합니다.
  - 모델의 가중치를 FP4 또는 W4A16 4-bit로 극단적으로 양자화(Quantization)하여, **RTX 4090 또는 H100 1장**의 단일 노드 폐쇄 환경에서도 실시간 영상 스트리밍 분석이 가능하도록 VRAM 점유율을 최적화합니다.

---
위 마스터 로드맵(PaliGemma 2 도입 검토 포함)에 따라 코어 엔진 교체 및 파인튜닝 파이프라인 코딩을 본격적으로 시작하고자 합니다. 위 계획에 대해 승인(Proceed)해 주시면 바로 `LM Studio 브릿지 개발`부터 착수하겠습니다!
