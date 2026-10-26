# 3가지 AI 모델 (Multi-Cloud VLM) 연동 계획

최근 발생한 **"사이트에 연결할 수 없음"** 및 **"카메라 리스트 사라짐"** 문제는 백엔드 서버(FastAPI)가 실행될 때 `groq`, `openai`, `huggingface_hub` 라이브러리가 설치되지 않아 발생한 `ModuleNotFoundError`로 인한 서버 다운이 원인이었습니다. 서버가 다운되니 카메라 목록 API(`/api/v1/cameras`) 호출이 실패하고 프론트엔드가 하얗게 나오는 증상이 발생한 것입니다. 현재 해당 패키지들은 모두 설치 완료했습니다.

이 계획은 3가지 클라우드 AI 모델(Groq, Upstage, HuggingFace)을 연동하는 방법에 대한 상세 구현 방안입니다.

## User Review Required
> [!IMPORTANT]
> 백엔드에 누락되었던 라이브러리(`groq`, `openai`, `huggingface_hub`)를 모두 설치 완료했습니다!
> 
> 이 플랜(Plan)이 승인되고 나면 사용 중이신 `run_ewvlm_all.bat` 파일이 실행된 명령 프롬프트(CMD) 창들을 모두 닫고 다시 실행해 주셔야 정상적으로 반영됩니다.

## Open Questions
> [!WARNING]
> `.env` 파일에 발급받으신 클라우드 API Key 3개 (`GROQ_API_KEY`, `UPSTAGE_API_KEY`, `HF_API_KEY`)가 정확히 입력되어 있는지 확인 부탁드립니다.

## Proposed Changes

### 백엔드 (Backend)

#### [MODIFY] `ewvlm_fastapi_gateway.py`
- `multicloud_vlm_bridge.py`를 임포트하고, 프론트엔드에서 전송하는 AI 모델 조합을 받아와서 라우팅할 수 있도록 엔드포인트 수정
- 기존의 로컬 LLM(LM Studio) 통신 로직 외에, `USE_LOCAL_VLM=false`인 경우 다중 클라우드 AI(Groq/Upstage/HF)로 요청을 병렬/순차 분배하는 로직 통합
- `groq` 모듈 등이 누락되어 발생했던 서버 크래시를 방지하기 위해 라이브러리 검증(Try-Except) 및 로그 보강

#### [MODIFY] `fast_loop.py`
- YOLOv11 객체 탐지 후, 캡처된 프레임을 FastAPI Gateway로 전송할 때 선택된 모델 리스트 정보를 함께 전송하도록 페이로드(Payload) 수정. 
- (해결 완료됨) `port`를 8890에서 8001로 수정하여 WebRTC 영상이 안 나오던 문제 해결 반영.

#### [NEW] `multicloud_vlm_bridge.py`
- **Groq API**: Llama-3.2-11B-Vision-Instruct 모델을 사용한 빠른 추론 구현
- **Upstage API**: Solar-Chat 모델을 사용한 한글 친화적 추론 구현
- **HuggingFace API**: PaliGemma-3B-mix-448 모델을 사용한 시각적/공간적 이해 구현
- 3개의 클라우드 API를 비동기로 병렬 호출하여 결과를 취합하고 앙상블(Ensemble)하는 로직 포함.

### 프론트엔드 (Frontend)

#### [MODIFY] `MonitorALiveControl.tsx`
- 좌측 상단에 위치한 AI 모델 선택기(Model Selector)에서 3가지 클라우드 모델을 선택할 수 있도록 상태 관리 추가.
- 선택된 앙상블 모델 리스트를 백엔드로 업데이트하는 API 호출 추가.

## Verification Plan

### Automated Tests
- `python -c "import groq; import openai; import huggingface_hub"` 명령어를 통해 모듈이 정상 로딩되는지 확인 완료.

### Manual Verification
1. `run_ewvlm_all.bat`를 재실행합니다.
2. 프론트엔드 UI(5174 포트)에 접속하여 **카메라 리스트**가 정상적으로 다시 보이는지 확인합니다.
3. 카메라를 슬롯에 드래그 앤 드롭했을 때 **YOLOv11 실시간 영상**이 정상 출력되는지 확인합니다.
4. AI 모델을 다중으로 선택한 뒤, 이벤트 발생 시 3가지 AI 모델의 분석 결과가 모두 리포팅되는지 확인합니다.
