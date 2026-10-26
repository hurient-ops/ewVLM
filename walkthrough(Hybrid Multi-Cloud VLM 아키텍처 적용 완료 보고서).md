# Hybrid Multi-Cloud VLM 아키텍처 적용 완료 보고서

사용자님의 설계 기획안을 바탕으로, 기존의 단일 로컬 모델 기반(LM Studio) 추론 구조를 전면 리팩토링하여 **Hybrid Multi-Cloud VLM 아키텍처**를 완벽하게 구현하였습니다!

이제 로컬 컴퓨터의 사양이나 VRAM 부족 문제와 무관하게, 외부의 강력한 서버 자원을 빌려 최상급 비전 모델 3개를 상황에 맞게 1차 Edge 검증과 2차 심층 분석에 병렬 활용할 수 있게 되었습니다. 또한, 추후 고성능 로컬 장비가 들어오면 언제든 오프라인 환경으로 전환할 수 있는 **스탠바이 모드(Standby Mode)**가 함께 탑재되었습니다. 🎉

## 🛠️ 주요 변경 사항

### 1. `HybridEdgeValidator`로 1차 초고속 검증(Fast-Loop) 개편
- [paligemma_edge_validator.py](file:///e:/projects/ewVLM/backend/paligemma_edge_validator.py)를 전면 수정하여, 로컬 모델이 아닌 클라우드 API 기반의 **HybridEdgeValidator**를 적용했습니다.
- 실시간 영상(0.2초 간격 캡쳐)을 모니터링하다가 객체(사람, 자동차 등)가 감지되면, 5초의 Time-to-Live(TTL) 타임아웃을 걸고 초고속으로 클라우드 API(기본값: Groq의 Llama 3.2 11B Vision)에 1차 위험성 판별을 요청합니다.
- 네트워크 단절이나 클라우드 오류 시 즉시 동작할 수 있도록, 환경 변수 `USE_LOCAL_EDGE=true` 설정만으로 기존의 로컬 검증 모드로 즉시 스왑(Swap)되는 안전장치를 설계했습니다.

### 2. 다중 클라우드 2차 심층 분석망(Slow-Loop) 통합
- [ewvlm_fastapi_gateway.py](file:///e:/projects/ewVLM/backend/ewvlm_fastapi_gateway.py) 내의 VLM 호출 로직을 개편하여, 단일 로컬 호출 함수(`query_lmstudio_vision`)에서 클라우드/로컬 통합 호출 함수(`query_vision`)로 100% 교체 완료하였습니다.
- VLM 선택 리스트 UI 표출 항목을 **3대 클라우드 모델(Groq, Upstage, Hugging Face PaliGemma)**이 기본으로 제공되도록 하였고, `USE_LOCAL_VLM` 플래그가 켜졌을 때만 로컬 모델 리스트를 다시 스캔하도록 로직을 추가했습니다.
- [ewvlm_lmstudio_bridge.py](file:///e:/projects/ewVLM/backend/ewvlm_lmstudio_bridge.py)에서 `paligemma` 모델의 라우팅 주소를 Hugging Face Inference API의 공식 주소(`google/paligemma-3b-mix-224`)로 정확히 매핑하여 구동되도록 패치했습니다.

### 3. 하이브리드 구동 런처 패치
- 일괄 실행 스크립트인 [run_ewvlm_all.bat](file:///e:/projects/ewVLM/run_ewvlm_all.bat) 파일을 업데이트 하였습니다. 
- 기존 4번째 단계였던 LM Studio 구동 단계를 **[STANDBY] Local VLM Bridge** 모드로 변경하고, 현재 다중 클라우드로 실행 중이며 로컬 엔진은 추후 구축을 위해 대기 중이라는 안내 메시지를 터미널에 명확히 표출하도록 수정했습니다.

---

> [!TIP]
> **하이브리드 환경 변수(env) 스왑 가이드**
> 백엔드 폴더(`backend/`) 내에 `.env` 파일 또는 시스템 환경 변수로 아래 항목만 조절하시면, 클라우드와 로컬을 자유자재로 넘나들며 시스템을 구동할 수 있습니다.
> 
> ```env
> # --- 클라우드 API Key ---
> GROQ_API_KEY=your_groq_api_key_here
> UPSTAGE_API_KEY=your_upstage_api_key_here
> HF_API_KEY=your_huggingface_api_key_here
>
> # --- 로컬(Standby) 스왑 플래그 ---
> # true로 설정 시 클라우드 통신을 끊고 LM Studio/Ollama 로컬 모델로 전체 전환됩니다.
> USE_LOCAL_EDGE=false
> USE_LOCAL_VLM=false
> LOCAL_VLM_PROVIDER=lmstudio
> ```
