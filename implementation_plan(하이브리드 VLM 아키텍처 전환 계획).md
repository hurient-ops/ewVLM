# 하이브리드 VLM 아키텍처 전환 계획 (클라우드 API + 로컬 스탠바이)

사용자 피드백을 반영하여, 기본 분석을 클라우드 API(Groq, Upstage, Hugging Face)로 처리하되, 추후 고성능 로컬 서버(GPU)가 도입되었을 때 손쉽게 로컬 환경(LM Studio, Ollama)으로 전환할 수 있는 **하이브리드(Hybrid) 아키텍처**를 구축합니다.

## 핵심 반영 사항 (User Comments Addressed)
1. **1차 엣지 검증 모델 선정:** 권장된 대로 빠르고 강력한 `Groq (llama-3.2-11b-vision-preview)`를 기본 검증 모델로 적용합니다.
2. **로컬 VLM (LM Studio/Ollama) 지원 유지:** `run_ewvlm_all.bat`에서 로컬 브릿지 코드를 삭제하지 않고, 추후 고성능 서버 마련 시 즉시 전환할 수 있도록 구조를 유지(스탠바이)합니다.
3. **3대 클라우드 VLM 라인업 구성:** Groq, Upstage에 더해 **Paligemma (Hugging Face API)** 까지 총 3가지 모델을 모두 연동하여 개발 및 선택할 수 있도록 구성합니다.

---

## 변경 제안 (Proposed Changes)

### 1. 엣지 검증기 다중 모델 지원 (`paligemma_edge_validator.py`)
- 현재 LM Studio(로컬) 하드코딩된 API 호출 방식을 **동적 라우팅 방식**으로 개편합니다.
- **클라우드 모드 (기본값):** Groq API(`llama-3.2-11b-vision-preview`)를 통해 초고속(5초 타임아웃) 1차 검증을 수행합니다.
- **로컬 모드 (옵션):** 환경 변수나 설정 플래그(예: `USE_LOCAL_EDGE=True`)를 통해 언제든 기존 LM Studio(`http://127.0.0.1:1234`) 또는 Ollama로 스위칭할 수 있는 분기 로직을 추가합니다.

### 2. 백엔드 게이트웨이 및 클라우드 연동 (`ewvlm_fastapi_gateway.py` & `ewvlm_lmstudio_bridge.py`)
- 백엔드 내부의 오류가 발생하던 로컬 전용 호출(`query_lmstudio_vision`)을 **`query_vision`** (하이브리드 라우터)으로 모두 교체합니다.
- **3대 VLM 모델 통합 연동:**
  1. `Llama 3.2 11B Vision` (via **Groq API**)
  2. `Solar Vision` (via **Upstage API**)
  3. `PaliGemma 3B` (via **Hugging Face API**)
- 프론트엔드 UI의 `get_vlm_models` 호출 시 위 3가지 클라우드 모델을 기본 선택지로 제공하여, 사용자가 원하는 모델을 실시간으로 선택해 분석할 수 있도록 합니다.

### 3. 구동 스크립트 유지보수 (`run_ewvlm_all.bat`)
- 기존 `python ewvlm_lmstudio_bridge.py` 독립 실행 코드를 삭제하지 않고 유지합니다.
- 단, 현재 시스템은 클라우드를 기본으로 사용하므로, 해당 콘솔 창에 **"[대기 중] 추후 로컬 서버 도입 시 LM Studio와 연동할 수 있는 Standby 브릿지입니다."** 라는 안내 메시지를 출력하도록 스크립트를 수정합니다.

---

## 검증 계획 (Verification Plan)

### 수동 및 통합 검증
1. **클라우드 API 통신 검증:** 엣지 검증기(Fast-Loop)가 Groq API를 호출하여 성공적으로 400 에러 없이 작동하는지 로그(`fast_loop.py`)를 통해 확인.
2. **다중 모델 선택 검증:** 프론트엔드 UI에서 Groq, Upstage, Paligemma 중 하나를 선택했을 때 백엔드가 정상적으로 해당 클라우드 API 공급자(Provider)로 페이로드를 전달하는지 테스트.
3. **로컬 스탠바이 검증:** `run_ewvlm_all.bat` 실행 시 브릿지 모듈이 정상적으로 대기 상태를 표시하며, 에러 없이 시스템이 올라오는지 확인.
