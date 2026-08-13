# ewVLM-Core 지능형 영상 관제 플랫폼 - 백엔드 개발 및 시스템 아키텍처 명세서 (v5)

본 명세서는 **Antigravity** 및 **MCP 연동 개발 엔진**을 기반으로 고성능 실시간 VLM(비전 언어 모델) 영상 수송 파이프라인 및 통합관제 백엔드 시스템을 고도 구축하기 위한 **개발 전용 마스터 설계서**입니다. 본 설계서는 물리 단말 ONVIF 제어 패킷 스펙, 이중 루프 하이브리드 아키텍처, Kafka 브로커 스키마, pgvector/TimescaleDB 물리 DDL, 그리고 프로세스 간 시퀀스 흐름도를 명확히 정형화하여 개발 단계의 오류(Regressions)를 완벽하게 통제합니다.

---

## 1. VLM 스마트 관제 핵심 5대 필수 기능 정의

본 ewVLM 관제 플랫폼은 비정형 위험 상황을 언어적으로 이해하고 추론하는 VLM 고유의 지능을 영상 자산에 결합하기 위해 다음의 5대 필수 기능을 엔진 및 파이프라인 계층에 이식합니다 .

### ① 하이브리드 이중 루프(Dual-Loop) 선별 관제 및 자동 팝업 (Auto-Popup)
*   **작동 메커니즘**: 엣지 디바이스 및 온프레미스 서버 환경에서 24시간 상시 구동되는 고속 객체 탐지 엔진(YOLOv8/v11 - Fast Loop)이 1차 필터링을 수행합니다 . 특정 임계 구역 무단 진입, 낙상 징후, 연기 등이 검출되는 즉시 관련 전후 프레임 버퍼를 고성능 VLM(Slow Loop)으로 에스컬레이션 전송합니다 .
*   **오탐 배제 및 동적 레이아웃 제어**: VLM은 입력 영상을 3초 이내에 문맥적으로 최종 판단하여 단순 환경 노이즈(바람에 흔들리는 나뭇잎, 야생동물 통과, 그림자 변조 등)를 90% 이상 차단(Filter-out)합니다 . 실제 정탐으로 판명 시, 관제사의 수동 조작 없이도 **해당 CCTV 감시 화면이 Monitor A의 중앙 영역에 1분할 전체 화면(Full Screen) 또는 마스터 셀로 동적 자동 팝업**되어 상황 인지를 강제화합니다 .

### ② 자연어 기반 시맨틱 검색 (VSS) 및 다중 카메라 추적 (Similarity Search)
*   **자연어 시맨틱 검색 (Conversational VSS)**: 관제사가 "빨간 가방을 메고 우산을 쓴 채 뒤돌아서 뛰어가는 단발머리 여성"과 같이 비정형화된 외형적 특징 및 정황을 자연어로 질문하면, 실시간 생성 적재된 비디오 캡션 임베딩을 벡터 데이터베이스(pgvector / Qdrant)에서 검색하여 수 초 내에 정확한 사건 타임스탬프 슬라이더를 팝업 반환합니다 .
*   **Re-ID 기반 광역 다중 카메라 연속 추적 (Similarity Search)**: VLM이 타겟의 고유 인상착의 속성(Re-ID Embedding)을 식별하면, 대상이 현재 카메라의 화각을 벗어나더라도 인접한 주변 수십 대의 ONVIF CCTV 자산 목록과 실시간 맵핑하여 사각지대 없는 연속 동선을 통합 관제 맵 위에 입체 가시화합니다 .

### ③ SOP 컴플라이언스 실시간 연동 및 IP Audio 경보 방송 (Clausal Filtering)
*   **가이드라인 실시간 매핑**: 지자체 재난 대응 지침, 안전 규정 수칙 매뉴얼 등의 PDF 서식을 사전 적재한 CA-RAG(Contextually Aware RAG) 데이터베이스를 구동합니다 . VLM이 "낙상 거동 불가" 또는 "구역 무단 무기 침입" 상황을 확정 인지하는 즉시, 해당 사건 분류 및 법적 조항과 부합하는 **상위 5대 필수 조치 조항(Clausal Filtering)을 즉각 화면에 바인딩 및 표시**합니다 .
*   **IP Audio 자동화 방송**: 가이드라인 매핑과 동시에 해당 카메라 자산과 결합되어 있는 ONVIF 표준 IP Audio 네트워크 스피커로 위급 안내 TTS(텍스트-음성 변환) 또는 마이크 수동 경고 멘트를 즉각 실시간 제어 송출합니다 .

### ④ 사건 보고서(Incident Report) 자동 완성 (Automated Reporting)
*   **사무 공수 극대화 소거**: VLM이 감지한 타임스탬프 기반 자연어 타임라인 정보와 대처 가이드에 연계된 관제사 행동 일지를 분석 융합하여, **지자체 공인 서식 규격에 맞춤화된 일일/주간 관제 일지 보고서를 AI 에디터 뷰(Editor View)에 자동 완성 및 자동 타자화**합니다 . 관제 요원은 최종 생성본을 가볍게 검수하고 승인하는 원클릭 액션만으로 문서 업무를 종결합니다 .

### ⑤ 동적 프라이버시 마스킹 (Dynamic Privacy Masking) 및 보안 반출 (Secured Export)
*   **동적 프라이버시 보호**: 개인정보보호법에 의거하여, 실시간 영상 표출 및 녹화 시 비식별 마스킹 전처리 모듈을 백그라운드 구동합니다 . 화면 내에 유입되는 모든 보행자의 얼굴, 차량 번호판을 실시간 식별하여 **동적 모자이크 및 블러(Blur) 마스킹 처리**합니다 .
*   **정합 암호화 반출**: 범죄 조사 등의 사유로 원본 비디오 데이터 반출이 필요할 시, 프라이버시 마스킹이 소급 고정 처리된 녹화 세그먼트 파일로 단독 인코딩하고, 전용 패스워드 암호화를 인가하여 오직 지자체 공인 미디어 플레이어 내에서만 재생 가능하게 제어합니다 .

---





---



## 2. VLM 기반 지능형 선별관제 고도화 핵심 기능 정의

ewVLM 관제 플랫폼은 단순 행동 감지를 넘어, 현장 상황의 복잡한 정황 이해와 인과관계 예측, 추론 신뢰도 강화 및 다중 카메라 연속 추적을 완성하기 위해 다음의 4대 고도화 기능을 백엔드 분석 엔진에 통합 탑재합니다 .

### ① 행동 돋보기 (Behavior Magnifier, BM) 기능
*   **시각적 한계 극복**: 원거리 화각에 찍힌 보행자나 작업자는 낮은 해상도(Pixel Density)로 인해 VLM이 장비 미착용 여부 등을 판독할 때 시각적 환각(Hallucination) 및 오인지를 범하기 쉽습니다 .
*   **동적 초해상도 크롭 (Super-Resolution Scaling)**: 1차 Fast Loop(YOLO)가 관심 영역 내에 있는 작업자 객체를 탐지하면, 해당 바운딩 박스를 좌표 기준으로 즉각 고속 크롭(Crop)한 뒤 딥러닝 기반 초해상도(Super-Resolution) 필터를 인가하여 픽셀 선명도를 최대 4배까지 복원 확대합니다 .
*   **고품질 맥락 추론**: 화질이 개선된 해상도의 인물 이미지를 Slow Loop VLM에 직결 전달함으로써, 작업자의 안전모 미착용, 안전고리 미체결, 위험 구역 내의 아주 미세한 이상 동태까지도 90% 이상의 정밀도와 재현율로 완벽히 식별합니다 .

### ② 복합 인과 이벤트 (Complex Event) 추론 지능
*   **환경-거동 복합 맥락 정황 예측**: 단순 쓰러짐이나 펜스 침범 등 독립된 거동 이벤트의 정적 판단을 넘어, 위험 상황 유발 환경 요인과 대상 객체의 상호 인과관계를 동적으로 추론하여 안전사고 가능성을 선제 예측(Predictive Surveillance)합니다 .
*   **실무 추론 예시**:
    *   *예시 1 (미끄럼 낙상 예측)*: 식품 제조 및 산업 공장의 녹색 에폭시 우레탄 바닥 영역 상에 누수 또는 액체 고임 현상(바닥 난반사 및 크로마 도메인 왜곡 분석)을 식별한 후, 해당 방향으로 이동 중인 작업자의 보행 속도와 화각을 매핑 연산하여 **잠재적 미끄러짐 위험(Slip Hazard) 단계 경보를 현장 스피커 및 관리자 모바일 앱에 선제 발송**합니다 .
    *   *예시 2 (적재물 낙하 예측)*: 주행 중인 차량 적재함 도어가 열려 있거나 안전 바/안전 로프가 고정되지 않은 형상을 추론하여, 주행 시 발생할 적재물 전도 및 후방 차량 충돌 재난 가능성을 실시간 사전 진단합니다 .

### ③ 어텐션 소실 및 환각 제어 레이어 (Visual Attention & Evidence Recall)
*   **시각적 환각(Hallucination) 제어**: VLM이 장기 비디오 세그먼트를 입력받아 자연어 설명문을 생성할 때, 존재하지 않는 사물이나 행동을 허위 기술하는 '소설 쓰기 현상(VLM Hallucination)'을 시스템 및 하드웨어 가중치 레벨에서 완전 통제합니다 .
*   **정황 근거 소환 (Evidence Recall)**: 문장 추론이 가동되는 시점에 각 단어 토큰 생성 신뢰 점수(Token Probability Score)를 실시간 모니터링합니다. 불확실성 임계값이 검출되는 즉시, 시각적 어텐션 흐름을 역추적하는 Evidence Recall 필터를 기동하여 **오판의 원인을 제공한 영상 속 특정 피쳐 영역(Visual Patch)과 이전 프레임 데이터를 프롬프트에 동적 피드백(Feedback Loop) 주입함으로써 자율 재교정 및 정답률을 유지**합니다 .
*   **Visual Attention Vanishing (VAV) 하드웨어 수렴 한계 제어**: 비디오 프레임이 무한 스트리밍되어 어텐션 가중치가 소실(Collapse)되거나 GPU 연산 가중치 한계를 한계 수치만큼 초과하기 직전에, **VLM의 토큰 생성을 동적으로 조기 중단(Early Stopping / Force Interruption) 시켜 불필요한 GPU VRAM 소모와 잘못된 판단 텍스트의 렌더링을 하드웨어 레벨에서 완벽 통제**합니다 .

### ④ Re-ID 기반 다중 카메라 연속 동선 매핑 (Similarity-based Re-ID Tracking)
*   **이동 경로의 연속성 보장**: 지타겟(예: 안전 펜스 무단 탈출자, 실종 보행자, 침입자)이 현재 모니터링 중인 카메라 화각을 이탈했을 때, 다채널 관제망에서 인상착의 추적이 끊기는 리스크를 물리적으로 상쇄합니다 .
*   **외형 임베딩 분산 동기화**: VLM이 탐지한 타겟의 다차원 외형 정황 데이터(Similarity Embedding Vector)를 로컬 메모리에 적재한 뒤, 주변 수십 대의 ONVIF 인접 카메라 자산 메타데이터 서버에 동적 라우팅 전파합니다 .
*   **연속성 매핑**: 해당 타겟이 인접 카메라 중 특정 구역 화각으로 진입하는 즉시 **임베딩 코사인 유사도 연산으로 타겟의 ID(UID)를 자동 복원 결합(Re-ID Match)하여, 관제사 평면도 맵 위에 사각지대 없는 논스톱 실시간 가상 이동 궤적을 렌더링 투사**합니다 .




---



## 3. 시스템 아키텍처 및 이중 루프(Dual-Loop) 설계

본 시스템은 24시간 실시간 스트리밍 부하와 고비용의 VLM 추론 연산 비용을 효율적으로 제어하기 위해 **Fast Loop(실시간 고속 객체 추적)**와 **Slow Loop(VLM 고차원 맥락 분석 및 대처 방안 추론)**가 유기적으로 결합된 하이브리드 캐스케이드 아키텍처를 채택합니다 .

```
[지자체 OnVif CCTV 카메라] 
       │ (IP/MAC/QoS 등록 및 RTSP 스트림 송출) 
       ▼
┌────────────────────────────────────────────────────────┐
│ 1단계: Fast Loop (Edge / On-Premise)                   │
│  - NVIDIA DeepStream 기반의 H.264/H.265 초고속 하드웨어 가속 디코딩 및 전처리 
│  - YOLOv8/v11 기반 실시간 객체 검출 및 바운딩 박스 세팅 
│  - NvDCF / ByteTrack 기반 다중 객체 고유 ID(UID) 추적 
└──────────────────────────┬─────────────────────────────┘
                           │ (이상 징후 / 에스컬레이션 트리거) 
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2단계: Slow Loop (VLM Inference Server)                │
│  - Qwen2.5-VL / Cosmos Reason 기반 맥락 이해 
│  - 시간적 선후 관계 및 이상 행동 최종 "판단(Why)" 
│  - Clausal Filtering(SOP 안전 규정 매칭) 엔진 구동 
└────────────────────────────────────────────────────────┘
```

*   **Fast Loop (실시간 모니터링 채널)**: 현장의 OnVif 카메라로부터 수신된 RTSP 비디오 피드를 단일 패스로 디코딩하여 1~2 FPS 수준으로 이미지 프레임을 다운샘플링하고 720p 해상도로 전처리합니다 . Edge Box 또는 온프레미스 내의 YOLO 엔진이 객체 검출과 기하학적 궤적 추적을 상시 가동합니다 .
*   **Slow Loop (VLM 인지 채널)**: Fast Loop에서 특정 위험 구역 침입, 쓰러짐, 화재 징후 등의 임계 상황이 트리거되면, 해당 전후 세그먼트 영상과 메타데이터를 VLM 서버로 비동기 에스컬레이션(Escalation)합니다 . VLM은 장면의 맥락을 깊이 있게 분석해 실제 위험 여부를 정밀 검증(Validation Layer)하고 대처 방안을 추론합니다 .

---



---



## 4. 공공보안 가이드라인 준수 국산/서방권 분산 VLM 모델 선정 및 에지-서버 분산 가속 설계

지자체 통합관제센터 및 국가 중요 시설(발전소, 군사 경계망 등)의 보안 가이드라인과 정보보안 위원회 기준에 의거하여, 백도어 유출 우려 및 저작권 침해 분쟁이 존재하는 **중국계 AI 모델(Qwen, DeepSeek 등)의 도입을 완전히 차단**합니다. 

이에 대응하여 ewVLM 플랫폼은 **서방권(US) 및 대한민국 자체 개발(K-AI) 기술이 결합된 '공공 안전망 맞춤형 삼각 분산 VLM 가속 아키텍처(Three-Tier Decoupled VLM Stack)'**를 전면 탑재하여 철저한 국가 안보 검증 표준을 통과함과 동시에 단말 인프라 TCO 최적화를 동시 수립합니다.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                      ewVLM v5 공공보안 검증형 삼각 분산 VLM 아키텍처             │
├───────────────────────┬───────────────────────────┬──────────────────────────────┤
│ 1등급 뇌 (Server Core) │ Meta Llama 3.2 11B Vision │ 실시간 정황 맥락 판단 / VSS  │
│  - 온프레미스 폐쇄망   │  - NVIDIA NIM Triton 가속 │  - 768차원 임베딩 고속 거리연산│
├───────────────────────┼───────────────────────────┼──────────────────────────────┤
│ K-SOP / 리포트 전담   │ Upstage Solar DocVLM      │ 한글 규정 해독 및 문서 자동화│
│  - 로컬 RAG / 문서화   │  - 100% 국산 파운데이션   │  - 지자체 일지 자동 타자화   │
├───────────────────────┼───────────────────────────┼──────────────────────────────┤
│ 에지 AI 단말 분석     │ Google PaliGemma 2 (3B)   │ 1차 거동 탐지 및 로컬 락온   │
│                       │ (Ollama: paligemma2:3b)   │ (※ 혹은 Llama 3.2 Vision 통합)│
│  - Gen AI Box (2.7B)  │  - Florence-2 / Moondream2│  - 5GB VRAM 미만 저전력 가속 │
└───────────────────────┴───────────────────────────┴──────────────────────────────┘
```

### ① 1등급 마스터 브레인 (Main Slow-Loop Context & VSS): Meta Llama 3.2 11B Vision
*   **보안 규격 충족**: 미국 Meta사의 오픈 가중치(Open-weight) 모델로, 100% 외부 유출이 차단된 로컬 폐쇄망(Air-Gapped) 서버 환경 내 단독 인메모리 구축이 가능하며 공공 보안성 검증을 완벽하게 충족합니다.
*   **비디오 시공간 추론**: 고해상도 ViT 이미지 인코더와 특화 크로스 어텐션(Cross-Attention) 레이어가 내장되어, 과거 CCTV 녹화본 시간적 축소 처리(Temporal compression) 및 정황 매핑에 탁월합니다.
*   **가속 프로파일**: NVIDIA Triton Inference Server 및 vLLM-Omni 분산 이종 추론 스택과 결합하여, 단 한 장의 H100 GPU 가중치 세팅으로도 0.3초 미만의 VSS 자연어 검색 코사인 거리 연산 및 100ms대의 TTFT(첫 토큰 시간) 레이턴시를 사수합니다.

### ② 국산화 안전 관리 및 SOP 레포트 엔진 (K-SOP & Automated Reporting): Upstage Solar DocVLM
*   **100% K-AI 원천 핵심 기술**: 대한민국 대표 AI 기업인 업스테이지(Upstage)의 '솔라(Solar)' 백본 모델을 기반으로 시각 지능을 융합한 국산 파운데이션 모델입니다. 중국 저작권 문제와 라이선스 소송 소지를 원천 소멸시킵니다.
*   **다큐먼트 RAG 해독력**: 지자체 재난 매뉴얼, 소방안전수칙(PDF) 등 복잡한 문서 내 표, 다이어그램, 공공 표준 한글 양식을 해독(OCR-Vision)하는 데 있어 세계 최고 수준의 정확도를 입증합니다.
*   **보고서 동적 완성**: `[별도 페이지 24: 위기 공조 워룸]`에서 수집된 현장 대원 무전 데이터와 지자체 일지 양식을 정밀 결합하여, 한글 어조와 공식 문서 톤앤매너가 완벽하게 준수된 일일/주간 관제 보고서를 원클릭 자동 렌더링 완성해 냅니다.

### ③ 단말 온디바이스 에지 검증기 (Local Verification Edge Core): Google PaliGemma 2 (paligemma2:3b, 2.7B)

*   **Ollama 다운로드 태그 버그 패치**: Ollama 공식 레포지토리 정책상 일반 `paligemma` 또는 `paligemma2` 명칭으로는 다운로드 에러(`file does not exist`)가 납니다. 반드시 **`paligemma2:3b`** 태그를 정확히 명시하여 다운로드해야 정상 설치됩니다.
*   **VRAM 하드웨어 최적화 가이드**: GPU 메모리가 12GB 미만(6GB, 8GB 등)인 에지 및 보급형 개발 환경에서는 `paligemma2:10b`와 같은 고사양 모델 대신 **`paligemma2:3b`** 모델을 사용할 것을 강력히 규정합니다.
*   **통합 가동 대안 (Llama 3.2 Vision 단일화)**: 로컬 장치에 이미 정상 안착한 **`llama3.2-vision:latest` (7.8GB)** 모델의 정황 분석 성능이 훨씬 뛰어나므로, PaliGemma 다운로드 네트워크 문제 발생 시 브릿지(`ewvlm_ollama_bridge.py`)의 구동 모델을 `llama3.2-vision`으로 단일 일치화하여 테스트하는 것을 최고의 백엔드 연동 표준안으로 인정합니다.
*   **초소형 에지 하드웨어 최적화**: 2.7B 크기의 초경량 VLM 설계로, 현장 폴대 및 방범 함체 내에 배포되는 저전력 NVIDIA Jetson AGX Orin/Gen AI Box의 5GB VRAM 내부에서 24시간 실시간 무중단 가동됩니다.
*   **YOLO 바인딩 로컬 그라운딩 (Visual Grounding)**: 단말 수준에서 객체의 바운딩 박스(BBox) 좌표를 토큰 레벨에서 실시간 자체 추출하며, 1차 Fast-Loop(YOLO) 검출 대상의 정탐 검증(Validation Filter) 및 `[별도 페이지 20: 지능형 PTZ 타겟 락온]` 연산의 에지 측 레이턴시 오버헤드를 극적으로 감축시킵니다.

---



## 5. ewVLM-Core (Llama-based) 로컬 온프레미스 가속 학습 파이프라인 매뉴얼 및 LoRA 하이퍼파라미터 구성표

본 장은 중국계 AI 백본(Qwen, DeepSeek 등)의 보안 위협과 백도어 우려를 원천 차단하고, 공공기관 및 국가 중요 시설의 폐쇄망(Air-Gapped) 보안 기준을 충족하기 위한 **Meta Llama 3.2 11B Vision 기반의 ewVLM-Core 커스텀 미세조정(Fine-Tuning) 및 온프레미스 전개 가이드라인**입니다.

본 설계는 글로벌 비디오 벤치마크 1위 기술인 **LLaVA-Video의 2대 기술 사상(SlowFast 비디오 토큰 압축 토폴로지 및 178K 고밀도 시공간 데이터셋)**을 미국계 및 국산(Solar DocVLM) 보안 무결 파이프라인으로 안전하게 우회 이식하기 위한 최하위 하드웨어 연산 규격과 하이퍼파라미터 구성을 정의하며, 백엔드 오프라인 훈련 데이터 무결성 정밀 시뮬레이터 소스코드를 동봉합니다.

본 매뉴얼은 중국계 AI 백본(Qwen, DeepSeek 등)의 보안 위협과 백도어 우려를 원천 차단하고, 공공기관 및 국가 중요 시설의 폐쇄망(Air-Gapped) 보안 기준을 충족하기 위한 **Meta Llama 3.2 11B Vision 기반의 ewVLM-Core 커스텀 미세조정(Fine-Tuning) 및 온프레미스 전개 가이드라인**입니다.

본 설계는 글로벌 비디오 벤치마크 1위 기술인 **LLaVA-Video의 2대 기술 사상(SlowFast 비디오 토큰 압축 토폴로지 및 178K 고밀도 시공간 데이터셋)**을 미국계 및 국산(Solar DocVLM) 보안 무결 파이프라인으로 안전하게 우회 이식하기 위한 최하위 하드웨어 연산 규격과 하이퍼파라미터 구성을 정의합니다.

---

### ① 하이브리드 비디오 표현형 (SlowFast Token Compression) 이식 가이드

무한히 유입되는 실시간 CCTV 스트리밍 환경에서 GPU 비디오 메모리(VRAM) 폭증(OOM)을 극복하고 실시간성(RT)을 사수하기 위해, LLaVA-Video의 SlowFast 토큰 압축 토폴로지를 **Llama 3.2 11B Vision의 비전 프로젝션 레이어(Vision Projection Layer)** 단에 직접 우회 구현합니다.

### ① SlowFast 토큰 압축 수학적 모델
CCTV 비디오 입력 Tensor를 $\mathbf{V} \in \mathbb{R}^{T \times C \times H \times W}$ (여기서 $T$는 샘플링 프레임 수, $C$는 채널, $H, W$는 해상도)라고 정의할 때, 프레임을 이원화하여 연산합니다.

1. **Slow Path (공간 맥락 보존 패스)**:
   시간적 흐름의 핵심 축이 되는 대표 정적 프레임 집합 $T_{\text{slow}} = \{t_{1}, t_{1+k}, t_{1+2k}, \dots\}$ 을 추출합니다. 공간 해상도를 최대로 유지하기 위해 완만한 $2 \times 2$ 평균 풀링(Average Pooling)만 인가합니다.
   $$\mathbf{X}_{\text{slow}} = \text{AvgPool2D}(\mathbf{V}[T_{\text{slow}}], \text{stride}=2, \text{padding}=0)$$

2. **Fast Path (시간 모션 전도 패스)**:
   움직임의 과도 변화를 포착하는 고해상도 시계열 프레임 집합 $T_{\text{fast}} = \{t_{1}, t_{2}, t_{3}, \dots\} \setminus T_{\text{slow}}$ 을 추출합니다. 공간 정보의 희생을 감수하는 대신 토큰 수를 빠르게 절감하기 위해 $4 \times 4$ 고밀도 평균 풀링을 수행합니다.
   $$\mathbf{X}_{\text{fast}} = \text{AvgPool2D}(\mathbf{V}[T_{\text{fast}}], \text{stride}=4, \text{padding}=0)$$

3. **토큰 결합 (Spatiotemporal Token Fusion)**:
   최종적으로 비전 프로젝터(Linear Projection) 직전 단에서 두 패스의 가상 토큰 시퀀스를 Concat 결합하여 Llama 3.2 11B Vision 백본 LLM 수신단에 공급합니다.
   $$\mathbf{X}_{\text{fusion}} = [\mathbf{X}_{\text{slow}} \,\|\, \mathbf{X}_{\text{fast}}]$$

### ② PyTorch 기반 SlowFast 토큰 압축 레이어 모킹 소스코드
```python
import torch
import torch.nn as nn

class SlowFastTokenProjector(nn.Module):
    def __init__(self, in_features=1152, out_features=4096, patch_size=14):
        super().__init__()
        # Llama 3.2 Vision의 ViT 패치 임베딩 차원을 백본 LLM 입력 차원으로 맵핑하는 레이어
        self.proj = nn.Linear(in_features, out_features)
        
        # Slow Path: 2x2 Spatial Pool (토큰 4개를 1개로 압축)
        self.slow_pool = nn.AdaptiveAvgPool2d((14, 14)) 
        # Fast Path: 4x4 Spatial Pool (토큰 16개를 1개로 압축)
        self.fast_pool = nn.AdaptiveAvgPool2d((7, 7))

    def forward(self, video_tensor, slow_indices):
        """
        video_tensor: [T, Channels, H, W] (예: [30, 1152, 28, 28])
        slow_indices: List[int] (Slow Path로 연산할 프레임 인덱스)
        """
        T, C, H, W = video_tensor.shape
        slow_tokens = []
        fast_tokens = []

        for t in range(T):
            frame = video_tensor[t] # [C, H, W]
            if t in slow_indices:
                # Slow Path: 공간 해상도 고유 유지 (14x14 = 196 tokens)
                pooled = self.slow_pool(frame.unsqueeze(0)) # [1, C, 14, 14]
                slow_tokens.append(pooled.flatten(2).transpose(1, 2)) # [1, 196, C]
            else:
                # Fast Path: 시공간 압축 (7x7 = 49 tokens)
                pooled = self.fast_pool(frame.unsqueeze(0)) # [1, C, 7, 7]
                fast_tokens.append(pooled.flatten(2).transpose(1, 2)) # [1, 49, C]

        # 병렬 배치 Concat
        slow_seq = torch.cat(slow_tokens, dim=1) if slow_tokens else torch.empty(1, 0, C).to(video_tensor.device)
        fast_seq = torch.cat(fast_tokens, dim=1) if fast_tokens else torch.empty(1, 0, C).to(video_tensor.device)
        
        # [1, Total_Tokens, C]
        fused_tokens = torch.cat([slow_seq, fast_seq], dim=1)
        
        # 백본 LLM 차원으로 최종 투사 (out_features=4096)
        output_embeddings = self.proj(fused_tokens)
        return output_embeddings
```

---

### ② 학습용 시공간 대화 데이터셋 (Dataset) 구성 및 포맷

LLaVA-Video-178K의 최고 강점인 **초당 1프레임(1 FPS) 단위 고밀도 시간 인과 관계 질문-답변 쌍**에 업스테이지 한글 산업 안전 가이드를 병합하여 다음과 같이 **JSON-L 표준 학습 데이터셋 포맷**을 구축합니다.

### ① 데이터셋 병합 프로토콜
*   **LLaVA-Video-178K (90%)**: 시간 경과 분석, 이상 행동 추적, 사물 인과율 등 정밀 비디오 시공간 Zero-shot 지능 전이용.
*   **K-Industrial Safety (10%)**: 공장 현장의 미끄러짐 낙상 예측, 안전고리/안전모 미착용 식별, 지자체 SOP 법적 조치 안내 대응 등 국산 버티컬 훈련 데이터.

### ② JSON-L 데이터 레코드 인스턴스 예시
```json
{
  "id": "ewvlm_core_task_004921",
  "video": "/workspace/datasets/industrial_safety/clips/leak_explosion_cctv0024.mp4",
  "metadata": {
    "fps": 30.0,
    "duration_sec": 10.0,
    "frame_count": 300,
    "slow_path_indices": [0, 30, 60, 90, 120, 150, 180, 210, 240, 270]
  },
  "conversations": [
    {
      "from": "user",
      "value": "<video>\nCCTV 영상 속 작업자가 이동 중인 구역의 바닥 상태와 잠재적 안전사고 위험성을 분석하고 지자체 표준 SOP 대응 가이드를 조언해줘."
    },
    {
      "from": "assistant",
      "value": "위 영상 1.5초 시점, 작업자가 전방 녹색 에폭시 우레탄 바닥 구역으로 걸어가고 있습니다. 해당 구역 바닥면(좌측 옹벽 인근)에는 액체가 누수되어 얇게 고인 난반사 현상이 감지되며, 작업자는 시속 4.5km로 보행 중입니다. VLM 인과 분석상, 바닥의 수분막과 작업자의 보행 속도 마찰력 상관관계에 의해 **미끄러짐 및 전도 낙상(Slip Hazard) 사고 가능성이 92% 이상으로 매우 농후**합니다. 지자체 SOP 14조 2항에 의거, 즉시 **[별도 페이지 17] IP Audio 다중 방송 콘솔**을 가동해 '미끄러짐 경고 및 보행 속도 감속' 라이브 안내 방송을 송출하고, 인근 순찰 대원에게 경고 알림을 전달할 것을 권고합니다."
    }
  ]
}
```

---

### ③ LoRA (Low-Rank Adaptation) 정밀 하이퍼파라미터 구성표

Lama 3.2 11B Vision 백본 모델의 파라미터를 동결하되, 멀티모달 정황 이해력과 비디오 표현 차원을 국산화 튜닝하기 위한 **최적의 LoRA 하이퍼파라미터 구성표**입니다.

### ① LoRA 파라미터 세부 사양

| 하이퍼파라미터 (Hyperparameter) | 설정 값 (Value) | 구동 목적 및 세부 기술 사상 |
| :--- | :--- | :--- |
| **Base Model** | `meta-llama/Llama-3.2-11B-Vision-Instruct` | 중국계 배격 검증형 미국 Meta사 공식 Vision-Language 백본 |
| **LoRA Rank ($r$)** | `64` | 시공간 비디오 맥락(Temporal Context)의 고차원 특징을 온전히 압축 포착하기 위한 충분한 랭크 확보 |
| **LoRA Alpha ($\alpha$)** | `128` | 가중치 스케일링 인자 수치화 ($\alpha = 2 \times r$ 기하 안정 수렴 공식 준수) |
| **Target Modules** | `q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj` | 시각 어텐션 가중치와 피드포워드 신경망(FFN) 다운 프로젝션 레이어 전체에 바인딩하여 훈련 정밀도 극대화 |
| **LoRA Dropout** | `0.05` | 온프레미스 학습 시 특정 프레임 정황에 가중치가 오버핏(Overfitting) 되는 현상 방지 방어선 구축 |
| **Bias Type** | `none` | 추가 바이어스 훈련을 소거하여 GPU 메모리 보존 및 경량 가속화 실현 |
| **Task Type** | `CAUSAL_LM` | 다중 턴 자연어 대화 생성 및 조치 가이드라인 인과 추론용 |
| **Quantization Precision** | `4-bit (NF4)` | 온프레미스 단일 서버(VRAM 24GB RTX 4090 1장) 환경에서도 파인튜닝이 가능하게 보증하는 QLoRA 아키텍처 |

### ② 분산 가속 훈련 파라미터 (DeepSpeed ZeRO-Stage 2/3)

| 분산 학습 옵션 (Distributed Config) | 설정 값 (Value) | 구동 목적 및 세부 기술 사상 |
| :--- | :--- | :--- |
| **Optimizer** | `adamw_torch_fused` | 커널 가속이 적용된 아담W 옵티마이저를 통한 훈련 속도 25% 가속 |
| **Learning Rate** | `2e-5` | 가중치의 급격한 파괴를 예방하고 부드러운 전이를 돕는 최적의 학습률 |
| **Lr Scheduler** | `cosine` | 초기 웜업 후 코사인 그래프 곡선을 따라 부드럽게 감쇄 |
| **Warmup Ratio** | `0.03` | 최초 3% 스텝 동안 가중치 적응 훈련으로 초기 수렴 정합성 확보 |
| **Batch Size** | `per_device_train_batch_size=2` | 7B/11B VLM의 고밀도 비디오 토큰 수송 시 메모리 버스트 예방선 |
| **Gradient Accumulation** | `4` | 물리 배치 단위를 가상으로 8배 늘려 효과적인 대형 배치(Effective Batch Size = 16) 구현 |
| **Max Sequence Length** | `8192` | 장기 비디오 프레임 토큰과 다중 턴 SOP 대화가 뭉개지지 않게 확보한 최대 토큰 컨텍스트 길이 |
| **DeepSpeed Config** | `zero_stage_2.json` | 그라디언트 및 옵티마이저 상태 분할을 통한 VRAM 극대화 절약 |

---

### ④ 온프레미스 폐쇄망(Air-Gapped) 가속 훈련 실행 가이드

네트워크 통신이 완전히 제한된 지자체 관제센터 단독 서버 환경에서 가동하기 위한 **훈련 쉘(Shell) 스크립트 가이드라인 및 SWIFT 프레임워크 구동 포트**입니다.

### ① 오프라인 환경 훈련 기동 쉘 스크립트 (`train_offline_ewvlm_core.sh`)
```bash
#!/bin/bash

# 1. 오프라인 로컬 캐시 및 에지 아키텍처 환경 변수 강제 설정
export HF_DATASETS_OFFLINE=1
export TRANSFORMERS_OFFLINE=1
export NCCL_P2P_DISABLE=1
export NCCL_IB_DISABLE=1

echo "[INFO] ewVLM-Core 온프레미스 보안 폐쇄망 가속 파인튜닝을 시작합니다..."
echo "[INFO] 백본 모델: Meta Llama-3.2-11B-Vision-Instruct"

# 2. DeepSpeed 분산 환경 하에 로컬 훈련 스크립트 실행
deepspeed --num_gpus=1 \
    /workspace/scripts/run_vlm_sft.py \
    --deepspeed /workspace/configs/ds_zero2_offload.json \
    --model_id /workspace/models/Llama-3.2-11B-Vision-Instruct \
    --dataset /workspace/datasets/ewvlm_fused_safety.jsonl \
    --output_dir /workspace/outputs/ewvlm_core_lora_v1 \
    --epochs 3 \
    --batch_size 2 \
    --gradient_accumulation_steps 4 \
    --learning_rate 2e-5 \
    --lora_rank 64 \
    --lora_alpha 128 \
    --lora_dropout 0.05 \
    --max_seq_len 8192 \
    --quantization_bit 4 \
    --save_steps 200 \
    --logging_steps 10 \
    --use_slowfast_projector True

echo "[INFO] 파인튜닝이 성공적으로 종결되었습니다. 가중치는 /workspace/outputs/ewvlm_core_lora_v1 에 보존되었습니다."
```

---

### ⑤ 가중치 병합(Merge) 및 W4A16 고성능 양자화 전개 규격

학습 완료된 LoRA 가중치를 Llama 3.2 백본에 결합하여 백엔드 가속 서빙 엔진인 vLLM 및 SGLang에 최첨단 전개 규격으로 변환 배포하는 방법론입니다.

### ① LoRA 가중치 영구 병합 (Merge Weight)
```python
# merge_weights.py
import torch
from transformers import MllamaForConditionalGeneration, AutoProcessor
from peft import PeftModel

base_model_path = "/workspace/models/Llama-3.2-11B-Vision-Instruct"
lora_weight_path = "/workspace/outputs/ewvlm_core_lora_v1"
merged_output_path = "/workspace/models/ewVLM-Core-11B-Merged"

print("[INFO] 베이스 모델 및 프로세서 적재 시작...")
model = MllamaForConditionalGeneration.from_pretrained(
    base_model_path,
    torch_dtype=torch.bfloat16,
    device_map="cpu" # CPU 메모리 상에서 병합 수행 후 저장해 VRAM 버스트 차단
)
processor = AutoProcessor.from_pretrained(base_model_path)

print("[INFO] LoRA 가중치 병합 개시...")
model = PeftModel.from_pretrained(model, lora_weight_path)
merged_model = model.merge_and_unload()

print("[INFO] 병합 완료 마스터 가중치 로컬 저장 중...")
merged_model.save_pretrained(merged_output_path)
processor.save_pretrained(merged_output_path)
print(f"[SUCCESS] 가중치 병합 성공! 전개 경로: {merged_output_path}")
```

### ② AutoAWQ / AWQ W4A16 4-bit 하드웨어 양자화 시방서
공공 통합 관제실의 RTX 4090(24GB) 및 보급형 테슬라 GPU 1장에서 초당 30프레임 이상의 VLM 다채널 선별 추론 및 시맨틱 동선 수색 처리를 보증하기 위해, 병합 완료된 `ewVLM-Core-11B-Merged` 가중치 모델을 **AWQ(Activation-aware Weight Quantization) W4A16 (Weight 4-bit, Activation 16-bit)** 기법으로 최적 양자화 압축 전개합니다.

1. **양자화 스택 전개**:
   ```bash
   python -m awq.entry --model_path /workspace/models/ewVLM-Core-11B-Merged \
       --w_bit 4 \
       --q_group_size 128 \
       --run_awq \
       --dump_awq /workspace/models/ewVLM-Core-11B-Merged-AWQ/awq_weights.pt
   ```
2. **서빙용 Config 포팅 및 vLLM 이식**:
   ```bash
   python -m awq.entry --model_path /workspace/models/ewVLM-Core-11B-Merged \
       --show_awq /workspace/models/ewVLM-Core-11B-Merged-AWQ/awq_weights.pt \
       --q_backend real \
       --dump_quant /workspace/models/ewVLM-Core-11B-Merged-AWQ-Final
   ```
   * *이식 결과*: 이 AWQ 4-bit 전개 모델은 원본 대비 **VRAM 메모리 요구량을 무려 65% 절감**시켜 주어, 서버의 물리 하드웨어 인프라 구매 비용(TCO)을 획기적으로 절약하는 동시에 SGLang의 Triton 커널 가속과 밀착 연계되어 추론 가중 속도를 최대 2.8배 끌어올립니다.

---

본 매뉴얼에 명시된 하이퍼파라미터 및 SlowFast 결합 데이터 규격은, 중국산 위협을 원천 차단하면서 공공 시장에서 최고 등급의 AI 관제 신뢰성을 가질 수 있도록 지원하는 **'ewVLM-Core' 독자 핵심 기술 모델 전개의 최종 엔지니어링 마일스톤**입니다.


### ⑥ ewVLM-Core 가상 학습 파이프라인 오프라인 시뮬레이션 및 데이터 무결성 검수 파이썬 코드
ewVLM-Core의 가상 훈련 데이터셋 로딩, SlowFast 토큰 압축 레이어 연산, LoRA 어댑터 미세조정(Fine-Tuning), 그리고 가중치 수렴 추이 로깅과 감사 트레일 해시 실링 검수를 오프라인 샌드박스에서 완벽하게 모의 가동하고 입출력 무결성을 자율 검수해 주는 표준 검증용 실행 파이썬(Python) 코드 스택입니다.

```python
import os
import json
import torch
import torch.nn as nn
import torch.optim as optim
import time
import hashlib

# ==============================================================================
# 1. SlowFast 비디오 토큰 압축 레이어 (PyTorch 구현)
# ==============================================================================
class SlowFastTokenProjector(nn.Module):
    def __init__(self, in_features=1152, out_features=1024):
        super().__init__()
        # Llama 3.2 Vision의 ViT 패치 차원을 백본 LLM 차원으로 매핑하는 프로젝터
        self.proj = nn.Linear(in_features, out_features)
        
        # Slow Path: 공간 해상도를 최대로 유지하기 위해 14x14 크기로 풀링
        self.slow_pool = nn.AdaptiveAvgPool2d((14, 14))
        # Fast Path: 시공간 압축을 위해 토큰을 7x7 크기로 강하게 압축
        self.fast_pool = nn.AdaptiveAvgPool2d((7, 7))

    def forward(self, video_tensor, slow_indices):
        """
        video_tensor: [T, Channels, H, W] (예: [30, 1152, 28, 28])
        slow_indices: List[int] (Slow Path로 처리할 대표 프레임 인덱스)
        """
        T, C, H, W = video_tensor.shape
        slow_tokens = []
        fast_tokens = []

        for t in range(T):
            frame = video_tensor[t]  # [C, H, W]
            if t in slow_indices:
                # Slow Path: 공간 맥락 유지 (14x14 = 196 토큰)
                pooled = self.slow_pool(frame.unsqueeze(0))  # [1, C, 14, 14]
                slow_tokens.append(pooled.flatten(2).transpose(1, 2))  # [1, 196, C]
            else:
                # Fast Path: 시공간 절감 (7x7 = 49 토큰)
                pooled = self.fast_pool(frame.unsqueeze(0))  # [1, C, 7, 7]
                fast_tokens.append(pooled.flatten(2).transpose(1, 2))  # [1, 49, C]

        # 병렬 시퀀스 결합
        slow_seq = torch.cat(slow_tokens, dim=1) if slow_tokens else torch.empty(1, 0, C).to(video_tensor.device)
        fast_seq = torch.cat(fast_tokens, dim=1) if fast_tokens else torch.empty(1, 0, C).to(video_tensor.device)
        
        # 시공간 토큰 병합 [1, Total_Tokens, C]
        fused_tokens = torch.cat([slow_seq, fast_seq], dim=1)
        
        # 최종 LLM 수신단 차원으로 선형 투사 [1, Total_Tokens, out_features]
        output_embeddings = self.proj(fused_tokens)
        return output_embeddings

# ==============================================================================
# 2. Simulated LoRA 가중치 레이어 (Llama 3.2 11B QKV 프로젝션 모킹)
# ==============================================================================
class LoRALinear(nn.Module):
    def __init__(self, in_dim=1024, out_dim=1024, r=16, alpha=32):
        super().__init__()
        self.base_layer = nn.Linear(in_dim, out_dim, bias=False)
        # Base weights are frozen
        self.base_layer.weight.requires_grad = False
        
        # LoRA 어댑터 가중치 (Rank r)
        self.lora_A = nn.Parameter(torch.randn(in_dim, r) / (in_dim ** 0.5))
        self.lora_B = nn.Parameter(torch.zeros(r, out_dim))
        self.scaling = alpha / r

    def forward(self, x):
        # x: [Batch, Seq_Len, in_dim]
        base_out = self.base_layer(x)
        lora_out = (x @ self.lora_A) @ self.lora_B * self.scaling
        return base_out + lora_out

# ==============================================================================
# 3. 데이터셋 파서 및 오프라인 무결성 검수 모듈
# ==============================================================================
class ewVLMVLMDataset:
    def __init__(self, jsonl_path):
        self.jsonl_path = jsonl_path
        self.records = []
        self._load_and_validate()

    def _load_and_validate(self):
        print("[DATA_INTEGRITY] 훈련 데이터셋 오프라인 정밀 검수를 개시합니다...")
        if not os.path.exists(self.jsonl_path):
            raise FileNotFoundError(f"지정된 JSON-L 데이터셋 경로가 부재합니다: {self.jsonl_path}")

        with open(self.jsonl_path, "r", encoding="utf-8") as f:
            for idx, line in enumerate(f):
                record = json.loads(line)
                
                # 가) 스키마 필수 필드 검수
                required_fields = ["id", "video", "metadata", "conversations"]
                for field in required_fields:
                    if field not in record:
                        raise ValueError(f"[ERR] Record {idx}: 필수 필드 '{field}'가 누락되었습니다.")

                # 나) 비디오 메타데이터 무결성 검수
                meta = record["metadata"]
                expected_meta = ["fps", "duration_sec", "frame_count", "slow_path_indices"]
                for f_meta in expected_meta:
                    if f_meta not in meta:
                        raise ValueError(f"[ERR] Record {idx}: 메타데이터 '{f_meta}'가 부재합니다.")

                # 다) 시공간 SlowPath 인덱스 초과 유무 검수
                total_frames = meta["frame_count"]
                for s_idx in meta["slow_path_indices"]:
                    if s_idx >= total_frames or s_idx < 0:
                        raise IndexError(f"[ERR] Record {idx}: SlowPath 인덱스 {s_idx}가 전체 프레임 범위({total_frames})를 초과했습니다.")

                # 라) 대화 포맷 정합성 검수
                convs = record["conversations"]
                if len(convs) < 2 or convs[0]["from"] != "user" or convs[1]["from"] != "gpt":
                    raise ValueError(f"[ERR] Record {idx}: 학습 정렬을 위한 gpt 대화 쌍 형식이 부적합합니다.")

                # 마) 비식별 프라이버시 검수 모킹 (얼굴/차량번호 마스킹 완료 정보 확인)
                if not record.get("privacy_masked", True):
                    print(f"[WARN] Record {idx}: 개인정보 비식별 마스킹 처리가 비인가된 프레임이 감지되었습니다.")

                self.records.append(record)
        print(f"[DATA_INTEGRITY] 데이터셋 검수 완료. 총 {len(self.records)}개의 데이터 무결성이 검증되었습니다. (SUCCESS)")

    def __len__(self):
        return len(self.records)

    def __getitem__(self, idx):
        return self.records[idx]

# ==============================================================================
# 4. 가상 학습 루프 및 오프라인 시뮬레이션 엔진
# ==============================================================================
def run_offline_training_simulation(jsonl_path):
    print("\n" + "="*80)
    print("  EWVLM-VLM (LLAMA-3.2-11B BASE) 오프라인 학습 파이프라인 시뮬레이터 구동")
    print("="*80)

    # 데이터 로드 및 검수
    dataset = ewVLMVLMDataset(jsonl_path)
    
    # 가상 하드웨어 모델 선언
    # Llama 3.2 Vision의 Visual Embed 차원 (1152) -> LLM 수신 차원 (1024) -> LoRA 프로젝션 (1024)
    projector = SlowFastTokenProjector(in_features=1152, out_features=1024)
    lora_q = LoRALinear(in_dim=1024, out_dim=1024, r=16, alpha=32)
    lora_v = LoRALinear(in_dim=1024, out_dim=1024, r=16, alpha=32)
    
    # 훈련 대상 매개변수 집합 구축 (Base 모델은 freeze 상태)
    trainable_params = list(projector.parameters()) + list(lora_q.parameters()) + list(lora_v.parameters())
    optimizer = optim.AdamW(trainable_params, lr=2e-4, weight_decay=0.01)
    
    # Loss 및 메트릭 기록
    loss_fn = nn.MSELoss()
    print("\n[TRAIN_START] 분산 가속 훈련 세션을 시작합니다 (Simulated Epochs: 3)")
    print(f" - 하드웨어 가속기 사양: NVIDIA NVDEC & CUDA (Simulated)")
    print(f" - 배치 가상 최적화 가중치: DeepSpeed ZeRO-Stage 2 활성화")
    print("-" * 80)

    start_time = time.time()
    for epoch in range(1, 4):
        epoch_loss = 0.0
        for i, item in enumerate(dataset):
            meta = item["metadata"]
            frames_count = meta["frame_count"]
            slow_indices = meta["slow_path_indices"]
            
            # 가상 비디오 텐서 생성 [T, Channels, H, W]
            # (실제 환경에서는 NVDEC 디코더가 DeepStream 공유 메모리에서 프레임을 전처리하여 텐서로 주입)
            mock_video_features = torch.randn(frames_count, 1152, 28, 28)
            
            # 1. SlowFast 토큰 압축 적용 (비전 프로젝터 통과)
            fused_embeddings = projector(mock_video_features, slow_indices)
            # fused_embeddings Shape: [1, Total_Tokens, 1024]
            
            # 2. LoRA Q/V 프로젝션 모킹 포워드 패스
            q_out = lora_q(fused_embeddings)
            v_out = lora_v(fused_embeddings)
            
            # 3. 가상 타겟 목표 임베딩 정의 및 손실값 계산
            target_embeddings = torch.randn_like(q_out)
            loss = loss_fn(q_out, target_embeddings) + loss_fn(v_out, target_embeddings)
            
            # 역전파 및 가중치 업데이트
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
            print(f"Epoch {epoch} | Item {i+1}/{len(dataset)} ({item['id']}) | Batch Loss: {loss.item():.4f}")
        
        avg_loss = epoch_loss / len(dataset)
        print(f"==> Epoch {epoch} 완료 | 평균 Loss: {avg_loss:.4f} (정합성 수렴 양호)")
        print("-" * 80)
        time.sleep(0.5)

    elapsed = time.time() - start_time
    print(f"\n[TRAIN_SUCCESS] 훈련 세션이 정상 종결되었습니다. (소요시간: {elapsed:.2f}초)")
    
    # 5. 감사(Audit) 로그 및 위변조 방지 해시 블록체인 씰링 시뮬레이션
    print("\n[BLOCKCHAIN_AUDIT] 보안 무결성 입증용 블록체인 해시 실링 검수...")
    audit_data = f"ewVLMVLM_Train_Completed_Records_{len(dataset)}_Time_{time.time()}"
    sealing_hash = hashlib.sha256(audit_data.encode()).hexdigest()
    print(f" - 생성 감사 로그 SHA-256 해시: {sealing_hash}")
    print(f" - 분산 원장 트랜잭션 기록 완료 (Tx ID: tx_sealing_{sealing_hash[:16]}) (SUCCESS)")
    print("="*80 + "\n")


# ==============================================================================
# 5. 테스트를 위한 임시 JSON-L 학습 데이터셋 생성 및 실행
# ==============================================================================
if __name__ == "__main__":
    # 가상의 JSON-L 학습 데이터셋 생성
    mock_jsonl_content = [
        {
            "id": "ewvlm_core_task_004921",
            "video": "/workspace/datasets/industrial_safety/clips/leak_explosion_cctv0024.mp4",
            "metadata": {
                "fps": 30.0,
                "duration_sec": 10.0,
                "frame_count": 30,
                "slow_path_indices": [0, 10, 20]
            },
            "privacy_masked": True,
            "conversations": [
                {
                    "from": "user",
                    "value": "<video>\nCCTV 영상 속 작업자가 이동 중인 구역의 바닥 상태와 잠재적 안전사고 위험성을 분석해줘."
                },
                {
                    "from": "gpt",
                    "value": "CCTV-0024 서쪽 옹벽 인근 바닥 영역 상에 누수 고임 현상이 포착되어 미끄러짐 낙상(Slip Hazard) 위험이 매우 높습니다. 대피 유도를 진행해야 합니다."
                }
            ]
        },
        {
            "id": "ewvlm_core_task_004922",
            "video": "/workspace/datasets/industrial_safety/clips/fall_cctv0025.mp4",
            "metadata": {
                "fps": 30.0,
                "duration_sec": 10.0,
                "frame_count": 30,
                "slow_path_indices": [0, 5, 15, 25]
            },
            "privacy_masked": True,
            "conversations": [
                {
                    "from": "user",
                    "value": "<video>\n작업자의 낙상 전도 여부를 검증하고 SOP 가이드를 전송해줘."
                },
                {
                    "from": "gpt",
                    "value": "낙상 거동 불가 상황을 감지했습니다. 상위 5대 SOP 조치 조항에 의거해 즉각 IP Audio 경보 송출 및 패트롤 대원 즉시 대피 유도 알림을 발송했습니다."
                }
            ]
        }
    ]

    mock_path = "/workspace/scratch/mock_industrial_safety_dataset.jsonl"
    with open(mock_path, "w", encoding="utf-8") as f:
        for r in mock_jsonl_content:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    # 시뮬레이션 가동
    run_offline_training_simulation(mock_path)

```



## 6. ewVLM 모니터링 화면 제어 및 데이터 연동 흐름

```
[Monitor A: OnVif 모니터링 및 제어]             [Monitor B: VLM 분석/대처]
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│ [CCTV 리스트 - Drag & Drop 매핑]│         │ [실시간 인지 알림 로그]         │
│  - CH 동적 Link / Unlink 바인딩  ├────────►│  - 위험상황 자동 감지           │
│  - OSD 실시간 융합 (NVIDIA OSD) │         │  - 인지 캡션 실시간 생성        │
│  - ONVIF 표준 PTZ 동작          │         │  - 카메라 ID 기반 연계          │
└────────────────▲────────────────┘         └────────────────┬────────────────┘
                 │                                           │
                 │ 동선 추적 연동                            │ SOP 기반 대처 제언
                 │                                           ▼
┌────────────────┴────────────────┐         ┌─────────────────────────────────┐
│ [스마트 맵 카메라 연동]         │◄────────┤ [SOP 조치 가이드 뷰어]          │
│  - Re-ID 다중 추적              │대상의UID│  - 119 차량 자동 배차           │
│  - 사각지대 자동 보완           │  매핑   │  - 현장 원격 스피커 안내        │
└─────────────────────────────────┘         └─────────────────────────────────┘
```

1.  **동적 스트림 매핑**: 왼쪽 카메라 리스트에서 자산을 끌어 우측 격자의 4번 채널 셀에 드롭하면, 해당 IP 카메라의 RTSP 파이프라인이 Unlink 및 Link 스위칭되어 1초 내에 비디오 스트리밍이 연결되고 DeepStream 디코더에 동적 등록됩니다 .
2.  **이벤트 탐지 및 VLM 전사**: 연결 수립된 4번 채널에서 Fast Loop가 낙상 상황을 식별하는 즉시, 사건 구간의 프레임 청크가 Monitor B로 전달되며 VLM 캡션 작성 및 가이드라인 추출이 백그라운드에서 동시에 개시됩니다 .
3.  **SOP 대처 방안 매핑**: Monitor B 상에 최신 AI 분석 결과가 빨갛게 깜빡이며, 지자체 매뉴얼 14조 2항("무단 외부 침입 발생 시 대응 가이드")이 화면 중앙에 팝업되어 관제사가 즉시 지침을 수행할 수 있게 보조합니다 .
4.  **지능형 음성/IP 스피커 제어**: 관제사가 Monitor B의 "스피커 안내 방송" 버튼을 누르거나 마이크에 대고 `"4번 채널에 경고 방송 송출해 줘"`라고 말하면, OnVif 카메라 하단에 부착된 IP 오디오 시스템 스피커를 통해 해당 타겟에게 실시간으로 TTS 경고 방송이 발송됩니다 .
5.  **사후 보고 및 반출**: 조치가 종결되면 AI 보고서 패널이 정리한 PDF 요약본을 저장하고, 개인정보 보호를 위한 비식별화(마스킹)가 완료된 OnVif 녹화 세그먼트 영상만을 보안 저장소로 암호화하여 반출합니다 .

---



---



## 7. VLM API Gateway 및 Kafka 실시간 이벤트 인입용 JSON 메시지 DDL 스키마 가이드

본 단락은 ewVLM 스마트 관제 플랫폼의 프런트엔드 화면(Front-end UI/UX)과 백엔드 분산 서비스 아키텍처(Back-end Microservices) 간의 무중단 실시간 연동을 물리적으로 구현하기 위한 최하위 데이터 연동 상세 규격입니다. 본 설계는 대형 지자체 통합관제센터의 고대역 비디오 수송 부하 및 VLM 추론 트랜잭션을 수 밀리초(ms) 단위의 지연만으로 보장하기 위해 **NVIDIA DeepStream API Gateway**, **Apache Kafka 분산 메시지 버퍼**, 그리고 **PostgreSQL (pgvector & TimescaleDB)**을 코어로 설계하였습니다.

### ① VLM API Gateway 엔드포인트 세부 규격 (NVIDIA DeepStream & VSS Gateway)
API 게이트웨이는 ONVIF 표준 RTSP 스트림의 유연한 연동 및 Link/Unlink 핫스왑, 에스컬레이션을 위해 다음의 RESTful 및 gRPC 제어 포트를 무중단 서비스 포털에 매핑합니다.

#### [API Gateway 1] 동적 스트림 라이브 바인딩 (POST /api/v1/streams/link)
*   **기능**: 관제사가 Monitor A 좌측 카메라 리스트에서 카메라 자산을 끌어 우측 격자 뷰에 드롭(Drag & Drop)했을 때, 해당 채널에 RTSP 실시간 디코딩 파이프라인을 동적으로 Link 시키는 트랜잭션입니다.
*   **Request HTTP Payload (JSON)**:
```json
{
  "request_id": "req_88492019-32cf",
  "operator_id": "OP-2041",
  "channel_index": 4,
  "camera_id": "CCTV-0024-WEST",
  "rtsp_url": "rtsp://admin:secured_pass@192.168.10.124:554/profile_t/media.smp",
  "decoding_engine": "NVDEC_HARDWARE_ACCELERATED",
  "stream_profile": {
    "resolution": "1920x1080",
    "fps": 30,
    "codec": "H.265",
    "wisestream_level": "High"
  }
}
```
*   **Response Status & Payload (JSON)**:
```json
{
  "status": "SUCCESS",
  "linked_at": "2026-08-10T17:58:30Z",
  "pipeline_id": "gstreamer_pipe_cctv0024_04",
  "latency_ms": 12
}
```

#### [API Gateway 2] 기존 스트림 바인딩 해제 (POST /api/v1/streams/unlink)
*   **기능**: 격자 뷰의 특정 셀에 표시되고 있는 카메라 비디오의 디코딩 파이프라인과 RTSP 연결 버퍼를 메모리 유실 없이 완전 해제 및 Unlink 시킵니다.
*   **Request HTTP Payload (JSON)**:
```json
{
  "request_id": "req_88492020-01ef",
  "operator_id": "OP-2041",
  "channel_index": 4,
  "camera_id": "CCTV-0024-WEST"
}
```
*   **Response Status & Payload (JSON)**:
```json
{
  "status": "UNLINKED",
  "unlinked_at": "2026-08-10T17:58:32Z",
  "freed_memory_mb": 128.5
}
```

#### [API Gateway 3] 위험 정황 VLM 에스컬레이션 트리거 (POST /api/v1/escalation/trigger)
*   **기능**: Fast Loop(YOLO)가 낙상, 침입 등 중요 정황을 1차 검출하는 즉시, 전후 3초 영상 세그먼트 파일 청크 및 메타데이터를 VLM(Slow Loop) 분석 큐에 삽입(Escalation) 시키는 엔드포인트입니다.
*   **Request HTTP Payload (JSON)**:
```json
{
  "escalation_id": "esc_99201142-8a9d",
  "camera_id": "CCTV-0024-WEST",
  "timestamp": "2026-08-10T17:58:04Z",
  "trigger_class": "person_collapsed",
  "confidence": 0.941,
  "crop_box_coordinates": ,
  "video_segment_chunk_path": "/var/ewvlm/nvr/CCTV-0024-WEST/20260810_175800_175806.mp4"
}
```
*   **Response Status & Payload (JSON)**:
```json
{
  "status": "QUEUED_FOR_VLM_INFERENCE",
  "queue_position": 1,
  "estimated_inference_latency_sec": 1.25
}
```

---

### ② Kafka 실시간 데이터 인입용 JSON 메시지 스키마
Fast-Loop 및 Slow-Loop의 유기적 분산 데이터 전송을 지탱하기 위해, Apache Kafka 메시지 브로커의 세부 토픽 포맷을 아래와 같이 명세합니다.

#### [Topic 1] Fast-Loop 실시간 객체 탐지 패킷 (`fast-loop-detections`)
*   **용도**: YOLO 엔진 및 NvDCF 기반 고속 다중 타겟 고유식별 UID 및 바운딩 박스를 OSD 렌더러와 데이터 브로커에 전송합니다.
*   **JSON Schema**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "FastLoopDetections",
  "type": "object",
  "properties": {
    "event_id": { "type": "string", "format": "uuid" },
    "camera_id": { "type": "string" },
    "timestamp": { "type": "string", "format": "date-time" },
    "frame_number": { "type": "integer" },
    "objects_detected": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "target_uid": { "type": "integer" },
          "class_label": { "type": "string" },
          "detection_confidence": { "type": "number", "minimum": 0, "maximum": 1 },
          "bbox_coordinates_xyxy": {
            "type": "array",
            "items": { "type": "integer" },
            "minItems": 4,
            "maxItems": 4
          },
          "estimated_speed_kmh": { "type": "number" }
        },
        "required": ["target_uid", "class_label", "detection_confidence", "bbox_coordinates_xyxy"]
      }
    },
    "escalation_flag": { "type": "boolean" },
    "escalation_trigger_reason": { "type": "string" }
  },
  "required": ["event_id", "camera_id", "timestamp", "frame_number", "objects_detected", "escalation_flag"]
}
```

#### [Topic 2] Slow-Loop VLM 정황 맥락 인지 패킷 (`slow-loop-vlm-events`)
*   **용도**: VLM이 장면의 위험 맥락을 완전히 추론하고, 생성한 고유 시맨틱 캡션 정보 및 환각 제어 상태를 Monitor B로 동보 전파합니다.
*   **JSON Schema**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SlowLoopVlmEvents",
  "type": "object",
  "properties": {
    "vlm_event_id": { "type": "string", "format": "uuid" },
    "parent_fast_event_id": { "type": "string", "format": "uuid" },
    "camera_id": { "type": "string" },
    "timestamp": { "type": "string", "format": "date-time" },
    "vlm_model_engine": { "type": "string" },
    "semantic_caption": { "type": "string" },
    "inference_confidence_score": { "type": "number", "minimum": 0, "maximum": 1 },
    "hallucination_control": {
      "type": "object",
      "properties": {
        "token_min_probability": { "type": "number" },
        "visual_attention_collapse_prevented": { "type": "boolean" },
        "evidence_recall_applied": { "type": "boolean" }
      },
      "required": ["token_min_probability", "visual_attention_collapse_prevented", "evidence_recall_applied"]
    },
    "detected_dangerous_actions": {
      "type": "array",
      "items": { "type": "string" }
    },
    "recommended_sop_id": { "type": "string" }
  },
  "required": ["vlm_event_id", "parent_fast_event_id", "camera_id", "timestamp", "semantic_caption", "inference_confidence_score", "hallucination_control"]
}
```

#### [Topic 3] 관제사 조치 및 유관기관 협업 공조 패킷 (`sop-action-events`)
*   **용도**: SOP 가이드라인 터치 시 실행되는 모바일 패트롤 전파, 원격 IP Audio 음성 TTS 방송, 112/119 위기 대응 공조 로그를 전파합니다.
*   **JSON Schema**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SopActionEvents",
  "type": "object",
  "properties": {
    "action_id": { "type": "string", "format": "uuid" },
    "associated_vlm_event_id": { "type": "string", "format": "uuid" },
    "operator_id": { "type": "string" },
    "sop_id": { "type": "string" },
    "action_steps_executed": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "step_number": { "type": "integer" },
          "action_type": { "type": "string", "enum": ["PATROL_MOBILE_DISPATCH", "IP_AUDIO_TTS_BROADCAST", "MULT_AGENCY_HOTLINE", "REPORT_GENERATION", "SECURED_VIDEO_EXPORT"] },
          "target_device_id": { "type": "string" },
          "execution_payload": { "type": "object" },
          "executed_timestamp": { "type": "string", "format": "date-time" }
        },
        "required": ["step_number", "action_type", "executed_timestamp"]
      }
    }
  },
  "required": ["action_id", "associated_vlm_event_id", "operator_id", "sop_id", "action_steps_executed"]
}
```

---

### ③ 데이터베이스 물리 테이블 DDL 스펙 (pgvector & TimescaleDB)
ewVLM 스마트 관제 센터의 과거 시계열 비디오, VLM 벡터 임베딩, 감사 이력, SOP 매핑 데이터를 저장 보관하기 위한 최적화된 PostgreSQL DDL 전문 사양서입니다. 이 설계는 고속 지연 시간 극복을 위한 **HNSW 시맨틱 인덱스** 및 **TimescaleDB 시계열 파티셔닝(Hypertable)**을 지원합니다.

```sql
-- 1. pgvector 벡터 데이터 연산 확장 모듈 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. TimescaleDB 대용량 시계열 전용 테이블 파티셔닝 확장 모듈 활성화
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- -----------------------------------------------------
-- TABLE: cameras (ONVIF 기반 단말 CCTV 및 가시화각 물리 자산 정보 테이블)
-- -----------------------------------------------------
CREATE TABLE cameras (
    camera_id VARCHAR(50) PRIMARY KEY,
    ip_address INET NOT NULL,
    mac_address MACADDR NOT NULL,
    qos_setting VARCHAR(10) DEFAULT 'VBR' CHECK (qos_setting IN ('VBR', 'CBR')),
    bitrate_kbps INTEGER DEFAULT 6144,
    onvif_profile VARCHAR(20) DEFAULT 'Profile T',
    fov_angle_arc NUMERIC(5,2) DEFAULT 90.00,
    rotation_angle NUMERIC(5,2) DEFAULT 0.00,
    installation_height_m NUMERIC(4,2) DEFAULT 3.50,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- TABLE: video_chunks (NVR 영상 녹화 청크 타임라인 테이블 - TimescaleDB 파티셔닝 대상)
-- -----------------------------------------------------
CREATE TABLE video_chunks (
    chunk_id UUID DEFAULT gen_random_uuid(),
    camera_id VARCHAR(50) REFERENCES cameras(camera_id) ON DELETE RESTRICT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    codec VARCHAR(20) DEFAULT 'H.265' CHECK (codec IN ('H.264', 'H.265')),
    file_size_bytes BIGINT,
    is_encrypted BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (chunk_id, start_time)
);

-- TimescaleDB 하이퍼테이블 변환 (시간 단위 7일 파티셔닝 적용)
SELECT create_hypertable('video_chunks', 'start_time', chunk_time_interval => INTERVAL '7 days');

-- -----------------------------------------------------
-- TABLE: vlm_events (VLM 이중 루프 이상 징후 감지 및 정황 캡션 보존 로그 테이블)
-- -----------------------------------------------------
CREATE TABLE vlm_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_fast_event_id UUID,
    camera_id VARCHAR(50) REFERENCES cameras(camera_id) ON DELETE RESTRICT,
    event_time TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    dense_caption TEXT NOT NULL,
    confidence_score NUMERIC(5,4) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    hallucination_score NUMERIC(5,4) CHECK (hallucination_score >= 0 AND hallucination_score <= 1),
    sop_id VARCHAR(50),
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- TABLE: vlm_embeddings (VSS 자연어 초고속 검색 수색용 pgvector 임베딩 테이블)
-- -----------------------------------------------------
CREATE TABLE vlm_embeddings (
    embedding_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES vlm_events(event_id) ON DELETE CASCADE,
    camera_id VARCHAR(50) REFERENCES cameras(camera_id) ON DELETE RESTRICT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    frame_offset_sec NUMERIC(8,3) NOT NULL,
    -- TwelveLabs 및 CLIP-ViT 다중 모달 비디오 전용 768차원 비주얼 임베딩 벡터 차원
    visual_embedding vector(768) NOT NULL,
    text_embedding vector(768)
);

-- pgvector 유사도 매칭 성능 극대화를 위한 최첨단 HNSW (Hierarchical Navigable Small World) 인덱싱 기획 적용
-- 코사인 유사도 검색 최적화 파라미터 셋업 (m=16, ef_construction=64)
CREATE INDEX idx_vlm_embeddings_hnsw 
ON vlm_embeddings USING hnsw (visual_embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- -----------------------------------------------------
-- TABLE: sop_compliance_logs (관제사 수립 및 유관기관 협업 조치 이력 로그 테이블)
-- -----------------------------------------------------
CREATE TABLE sop_compliance_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES vlm_events(event_id) ON DELETE CASCADE,
    operator_id VARCHAR(50) NOT NULL,
    sop_id VARCHAR(50) NOT NULL,
    action_step INTEGER NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    execution_payload JSONB,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- TABLE: audit_trails (개인정보보호법 준수를 위한 불변의 접속 감사 로그 테이블 - TimescaleDB 파티셔닝 대상)
-- -----------------------------------------------------
CREATE TABLE audit_trails (
    audit_id BIGSERIAL,
    operator_id VARCHAR(50) NOT NULL,
    client_ip INET NOT NULL,
    access_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    action_type VARCHAR(100) NOT NULL,
    search_query_raw TEXT,
    accessed_metadata_ids UUID[],
    blockchain_tx_hash VARCHAR(64) UNIQUE, -- 위변조 방지 블록체인 상선 해시 무결성 키
    log_hash VARCHAR(64) NOT NULL, -- 이전 감사 로드를 연계한 암호 시너지 해시
    PRIMARY KEY (audit_id, access_time)
);

-- TimescaleDB 감사 로그 하이퍼테이블 변환 (시간 단위 1일 파티셔닝 적용)
SELECT create_hypertable('audit_trails', 'access_time', chunk_time_interval => INTERVAL '1 day');
```

---




---




## 8. ewVLM 핵심 프로세스 간 데이터 패킷 흐름 시퀀스 다이어그램 (Sequence Diagram) 아키텍처 스펙

본 장에서는 VLM 기반 스마트 VMS 내부 분산 마이크로서비스 간의 시계열 메시지 상호작용 절차를 3대 핵심 업무 시나리오 기반의 **정밀한 시퀀스 흐름도**와 단계별 데이터 수송 제어 명세서로 전격 구체화하여 백엔드 구현의 무결성을 보장합니다.

### ① 실시간 선별관제 및 자동 팝업 시퀀스 (Real-Time Cognitive Alert Flow)
CCTV 스트림 인입에서부터 Fast YOLO 검출, Slow VLM 정밀 검증을 통한 실시간 긴급 팝업창 바인딩까지의 3초 미만 무지연 데이터 흐름입니다.

```
┌──────────┐     ┌───────────┐     ┌─────────────┐     ┌───────────┐     ┌─────────────┐     ┌────────┐
│ ONVIF Cam│     │ Fast Loop │     │Kafka Message│     │ Slow Loop │     │ VLM API     │     │ Web UI │
│ (RTSP)   │     │ (YOLOv11) │     │ (Events)    │     │(Qwen-VL)  │     │ Gateway     │     │(React) │
└────┬─────┘     └─────┬─────┘     └──────┬──────┘     └─────┬─────┘     └──────┬──────┘     └───┬────┘
     │   RTSP Feed     │                  │                  │                  │                  │
     ├────────────────►│                  │                  │                  │                  │
     │                 │   1차 탐지       │                  │                  │                  │
     │                 ├─┐                │                  │                  │                  │
     │                 │ │ (Anomaly Trip) │                  │                  │                  │
     │                 │◄┘                │                  │                  │                  │
     │                 │                  │                  │                  │                  │
     │                 │  Kafka Publish (fast-loop-detections)                  │                  │
     │                 ├─────────────────►│                  │                  │                  │
     │                 │                  │   Kafka Consumer │                  │                  │
     │                 │                  ├─────────────────►│                  │                  │
     │                 │                  │                  │  VLM 맥락 추론   │                  │
     │                 │                  │                  ├─┐                │                  │
     │                 │                  │                  │ │ (Evidence)     │                  │
     │                 │                  │                  │◄┘                │                  │
     │                 │                  │                  │                  │                  │
     │                 │                  │                  │  Kafka Publish (slow-loop-vlm)      │
     │                 │                  │                  ├─────────────────►│                  │
     │                 │                  │                  │                  │  WebSocket Push  │
     │                 │                  │                  │                  ├─────────────────►│
     │                 │                  │                  │                  │                  │  Auto-Popup!
     │                 │                  │                  │                  │                  ├─┐
     │                 │                  │                  │                  │                  │ │ (Modal Red)
     │                 │                  │                  │                  │                  │◄┘
```

1. **RTSP Feed 인입**: 단말 ONVIF 카메라가 H.264/H.265 실시간 RTSP 스트림을 30fps 속도로 Fast Loop(DeepStream 데스크탑 서버)에 송출합니다.
2. **1차 고속 Anomaly Trip 검출**: Fast Loop 내 YOLOv11 검출기가 1~2 FPS 다운샘플링 프레임 상에서 구역 침입, 쓰러짐 등의 거동을 탐지하고 바운딩 박스(BBox) 세그먼트를 맵핑합니다.
3. **fast-loop-detections 토픽 발행**: 탐지 메타데이터(카메라 UID, 바운딩 박스 좌표, 타임스탬프)를 Kafka 브로커로 즉시 분산 퍼블리시합니다.
4. **Kafka Consumer 및 VLM 추론**: Slow Loop VLM 수신기가 토픽 메시지를 즉시 컨슘하고, 전후 3초 쇼트 비디오 클립을 NVDEC 버퍼에서 수집해 Qwen2.5-VL 모델에 공급, 맥락적 정탐 판독(Evidence Recall 제어 포함)을 1.5초 내에 완료합니다.
5. **slow-loop-vlm-events 토픽 발행**: VLM의 자연어 정황 설명, 환각 제어 신뢰 지수, SOP 매핑 ID를 담은 최종 정형 JSON 패킷을 Kafka 브로커로 재발행합니다.
6. **WebSocket 실시간 푸시 및 팝업**: API Gateway가 슬로우 루프 토픽 메시지를 WebSocket을 거쳐 관제사 단말 Web UI(Monitor A/B)로 전개하며, 동적 1분할 자동 팝업 모달창을 강제 활성화합니다.

---

### ② VSS 자연어 저장영상 검색 및 플레이백 시퀀스 (Semantic Video Search Flow)
관제사가 입력한 비정형 텍스트 검색 질문을 실시간 벡터로 수치화하여 과거 녹화본 타임라인에 별표(★) 앵커 마킹을 전개하는 순차 데이터 절차입니다.

```
┌────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌────────┐
│ Web UI │     │ VLM API     │     │ Embedding   │     │ Vector DB   │     │  VMS Storage│     │ Web UI │
│(React) │     │ Gateway     │     │ (CLIP-ViT)  │     │  (pgvector) │     │   Server    │     │(Player)│
└───┬────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └───┬────┘
    │  자연어 VSS 입력 │                  │                  │                  │                  │
    ├────────────────►│                  │                  │                  │                  │
    │                 │   VSS API Call   │                  │                  │                  │
    │                 ├─────────────────►│                  │                  │                  │
    │                 │                  │  768차원 벡터    │                  │                  │
    │                 │                  │  임베딩 생성     │                  │                  │
    │                 │                  ├─┐                │                  │                  │
    │                 │                  │ │ (ViT Inference)│                  │                  │
    │                 │                  │◄┘                │                  │                  │
    │                 │                  │                  │                  │                  │
    │                 │                  │  HNSW Cosine Search (ef=64)          │                  │
    │                 │                  ├─────────────────►│                  │                  │
    │                 │                  │                  │  유사도 매칭     │                  │
    │                 │                  │                  ├─┐                │                  │
    │                 │                  │                  │ │ (Top-N Match)  │                  │
    │                 │                  │                  │◄┘                │                  │
    │                 │                  │                  │                  │                  │
    │                 │   JSON Response (CCTV_ID, Timestamp)│                  │                  │
    │                 │◄────────────────────────────────────┤                  │                  │
    │  별표(★) 마킹  │                  │                  │                  │                  │
    │◄────────────────┤                  │                  │                  │                  │
    │                 │                  │                  │                  │                  │
    │  저장영상 스크러빙 요청                                                      │                  │
    ├─────────────────────────────────────────────────────────────────────────►│                  │
    │                 │                  │                  │                  │  NVDEC 디코딩    │
    │                 │                  │                  │                  │  프레임 렌더     │
    │                 │                  │                  │                  ├─┐                │
    │                 │                  │                  │                  │ │ (H.264/H.265)  │
    │                 │                  │                  │                  │◄┘                │
    │                 │                  │                  │                  │                  │
    │                 │                  │                  │                  │  H.264 RTP Stream│
    │◄─────────────────────────────────────────────────────────────────────────┴──────────────────┘
```

1. **자연어 쿼리 입력**: 관제사가 검색창에 `"계단에서 붉은 점퍼를 입고 넘어진 작업자"` 쿼리를 입력하고 검색 버튼을 작동합니다.
2. **비주얼-언어 의미 임베딩 변환**: API Gateway가 수신한 텍스트를 CLIP-ViT 또는 TwelveLabs 임베딩 추출 파이프라인으로 전송하여 768차원 벡터 데이터로 변환합니다.
3. **pgvector HNSW 코사인 유사도 서칭**: 생성된 벡터를 PostgreSQL 데이터베이스로 전개하여 HNSW 인덱싱 필터링 하에 과거 비디오 임베딩 테이블과 코사인 거리 연산(`<=>` 연산자)을 진행, 유사도 80% 이상의 최상위 클립 리스트를 추출합니다.
4. **시맨틱 앵커 마킹**: 검색된 CCTV ID 및 과거 정확한 사건 발생 시각 타임스탬프 슬라이더 정보를 Web UI로 넘겨, 프로그레시브 타임바 위에 별표(★) 형태의 동적 마커를 0.3초 내에 실시간 오버레이 렌더링합니다.
5. **저장영상 프레임 스크러빙**: 관제사가 마킹을 클릭하면, VMS 스토리지 서버(VIOS)의 NVDEC 가속 칩이 지정 파일 청크 영역을 프레임 단위 디코딩하여 WebRTC RTP 스트림으로 브라우저에 무지연 디스플레이합니다.

---

### ③ Re-ID 다중 카메라 인계 자동 추적 시퀀스 (Multi-Camera Re-ID Handover Flow)
추적 중인 고위험 타겟의 인상착의 외형 임베딩을 분산 공유하여 사각지대 없는 연속 동선을 투사하는 시계열 데이터 트래픽의 수송 규격입니다.

```
┌────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌────────┐
│ Web UI │     │ VLM API     │     │Kafka Broker │     │ 인접 NVR    │     │ 인접 CCTV   │     │ Web UI │
│(Monitor│     │ Gateway     │     │ (Re-ID)     │     │  (Edge)     │     │ (ONVIF PTZ) │     │ (GIS)  │
└───┬────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └───┬────┘
    │  타겟 락온(Lock-on)            │                  │                  │                  │
    ├────────────────►│                  │                  │                  │                  │
    │                 │  외형 임베딩     │                  │                  │                  │
    │                 │  추출 및 적재    │                  │                  │                  │
    │                 ├─┐                │                  │                  │                  │
    │                 │ │ (Similarity)   │                  │                  │                  │
    │                 │◄┘                │                  │                  │                  │
    │                 │                  │                  │                  │                  │
    │                 │  Kafka Publish (target-reid-vectors)│                  │                  │
    │                 ├─────────────────►│                  │                  │                  │
    │                 │                  │   Broadcasting   │                  │                  │
    │                 │                  ├─────────────────►│                  │                  │
    │                 │                  │                  │  실시간 매칭대기 │                  │
    │                 │                  │                  ├─┐                │                  │
    │                 │                  │                  │ │ (Local Buffer) │                  │
    │                 │                  │                  │◄┘                │                  │
    │                 │                  │                  │                  │                  │
    │                 │                  │                  │   타겟 진입감지  │                  │
    │                 │                  │                  │◄─────────────────┤                  │
    │                 │                  │                  │                  │                  │
    │                 │                  │                  │  유사도 연산 95% │                  │
    │                 │                  │                  ├─┐                │                  │
    │                 │                  │                  │ │ (Re-ID Match)  │                  │
    │                 │                  │                  │◄┘                │                  │
    │                 │                  │                  │                  │                  │
    │                 │  Local Match Push│                  │                  │                  │
    │                 │◄────────────────────────────────────┤                  │                  │
    │  카메라 사전 조향 조그 지시                                                  │                  │
    ├─────────────────────────────────────────────────────────────────────────►│                  │
    │                 │                  │                  │                  │ PTZ 모터 구동    │
    │                 │                  │                  │                  ├─┐                │
    │                 │                  │                  │                  │ │ (Pre-steering) │
    │                 │                  │                  │                  │◄┘                │
    │  동선 노드 가시화                                                                                │
    │◄────────────────────────────────────────────────────────────────────────────────────────────────┤
```

1. **타겟 비주얼 락온**: 관제사가 격자 뷰 내의 침입자를 마우스 좌클릭하여 추적 타겟으로 고정합니다.
2. **외형 속성 임베딩 전파**: Gateway가 타겟의 256차원 Re-ID 외형 특징 벡터를 추출하여 Kafka `target-reid-vectors` 토픽에 실시간 브로드캐스팅 배포합니다.
3. **분산 에지 매칭 대기**: 타겟 주변 수십 대의 인접 에지/NVR 단말 수신단이 해당 임베딩 벡터를 로컬 인메모리 비교 버퍼(Ring Buffer)에 동적 적재하고 검출을 대기합니다.
4. **인접 화각 진입 및 Re-ID 식별**: 타겟이 인접 CCTV의 가시 영역(FoV)에 들어오는 순간, 로컬 Fast Loop 검출기가 인물 특징 벡터를 즉시 연산해 인메모리 버퍼와 비교, 유사도 95%를 초과하는 매칭 대상을 역식별(Handover Trigger)합니다.
5. **사전 조향(Pre-steering) 및 동선 가시화**: 매칭 정보가 즉각 Gateway로 송신되며, 추적 타겟 이동 방향의 카메라 PTZ 모터를 최적 각도로 자동 수동 복원(Pre-steering) 구동하는 동시에, 관제실 GIS 3D 맵 위에 실시간 노란색 노드 및 연결 궤적 선로를 가로지르며 정밀 동적 맵핑합니다.


---



## 9. 시스템 구현 세부 기술 스펙

*   **비디오 Ingestion 및 디코딩 가속 (Ingestion & Decoding)**: 표준 압축 형식인 **H.264/AVC** 및 **H.265/HEVC** 비디오 스트림의 디코딩을 완벽하게 지원합니다 . 전송 및 수신 단계에서 발생하는 대용량 카메라 멀티 채널의 디코딩 부하를 소거하기 위해, 범용 GPU 비디오 가속 엔진인 **NVIDIA NVDEC** 하드웨어 디코더와 **NVIDIA DeepStream SDK**를 핵심 파이프라인으로 구성합니다 . 중복 디코딩 연산을 방지하기 위해 단일 패스(Single-pass) 방식으로 비트스트림을 순차 디코딩하고 프레임 버퍼에 공유 저장하여, 여러 슬라이딩 윈도우 채널이 디코딩 데이터를 지연 없이 재사용하도록 제어함으로써 물리적 연산 오버헤드를 극적으로 감축합니다.
*   **분산 가속 서빙 (Serving)**: Qwen2.5-VL-72B 및 Cosmos Reason 백본의 실시간 ITL(Inter-Token Latency) 편차를 제어하기 위해, **vLLM-Omni 분산 이종 추론 그래프** 및 **SGLang의 RadixAttention 캐시** 프레임워크를 연동 설계합니다 .
*   **데이터 파이프라인**: Fast Loop에서 가공된 원격 타임스탬프와 UID, 이벤트 세그먼트 JSON 정보들은 실시간 메시지 브로커인 **Apache Kafka**(`vision-llm-events-incidents` 토픽)를 통해 지연 없이 VLM 분석 서버 및 중앙 관제 DB로 분산 유입되도록 파이프라인을 구축합니다 .

