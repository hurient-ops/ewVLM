# 시스템 내 MOCK 데이터 잔재 현황 및 추가 개발 계획 보고

사용자님의 지시에 따라 현재 프로젝트(`ewVLM`)의 프론트엔드 및 백엔드 소스 코드를 면밀히 전수 조사(Grep Search)한 결과, UI 시연 및 초기 개발을 위해 하드코딩된 **다수의 MOCK(가짜/더미) 데이터 및 로직이 여전히 남아있는 것을 확인**했습니다.

이를 실제 데이터 및 기능으로 연동(Real Integration)하기 위한 구체적인 검토 내역과 앞으로의 추가 개발 계획을 아래와 같이 보고드립니다.

---

## 1. 프론트엔드(UI) 잔여 MOCK 요소 및 개선 계획

### [1] VLM 대화형 분석 챗봇 (MonitorBVlmAnalysis.tsx)
- **현황**: 사용자가 채팅을 입력하면 "빨간", "침입" 등 특정 키워드에 반응하여 하드코딩된 답변(`mockReply`)을 1.5초 뒤에 출력하는 가짜 챗봇 형태로 구현되어 있습니다.
- **개발 계획**: 백엔드의 LLM/VLM API(FastAPI Gateway)와 연동하여 실제 프롬프트를 전송하고 생성된 답변을 받아오도록 API 통신 로직을 구현해야 합니다.

### [2] 실시간 관제 이벤트 알림 및 이벤트 로그 (MonitorCanvas.tsx, useEventSimulator.ts)
- **현황**: `useEventSimulator.ts`에서 생성된 가짜 이벤트 배열(`MOCK_EVENTS`)을 사용해 무작위로 알림을 띄우거나, UI 캔버스(`MonitorCanvas.tsx`)에서 렌즈 영역을 클릭하면 가짜 알람(`triggerMockAlert`)이 발생합니다.
- **개발 계획**: 백엔드 `fast_loop.py`에서 YOLOv11/VLM 추론 결과를 WebSocket이나 Server-Sent Events(SSE)로 프론트엔드에 쏴주도록 실시간 이벤트 수신 아키텍처로 전면 개편해야 합니다.

### [3] PTZ 및 GIS 맵 연동 (PtzHandoverConsole.tsx)
- **현황**: PTZ 카메라 렌즈를 조작하고 동선을 파악하는 맵 영역이 형태만 있는 `{/* Mock Map Area */}` 상태입니다.
- **개발 계획**: 실제 카카오맵/네이버맵/구글맵 API 또는 로컬 평면도 기반의 좌표계(Canvas)를 연동하고, 카메라 시야각(FOV) 폴리곤 데이터를 렌더링해야 합니다.

### [4] 자원 모니터링 대시보드 차트 (EdgeAiOrchestration.tsx)
- **현황**: 서버의 CPU, 메모리, NPU/GPU 자원 사용량을 보여주는 차트 영역이 `{/* Mock Chart */}`로 비어 있거나 더미 데이터로 표시됩니다.
- **개발 계획**: 백엔드에서 `psutil` 등으로 실제 시스템 자원을 수집하여 프론트엔드에 제공하는 API를 개발하고, Recharts 등의 라이브러리로 실제 차트를 렌더링해야 합니다.

### [5] 영상 내보내기 / 마스킹 처리 (PrivacyExportWorkshop.tsx)
- **현황**: 모자이크/마스킹 처리된 영상을 다운로드할 때 `new Blob(["mock video data"])`로 텍스트 더미 파일을 내려받고 있습니다.
- **개발 계획**: 백엔드의 영상 후처리 모듈(OpenCV 등)을 통해 실제 마스킹이 적용된 `.mp4` 파일을 생성하여 다운로드할 수 있도록 API를 연동해야 합니다.

---

## 2. 백엔드 잔여 MOCK 요소 및 개선 계획

### [1] VLM 브릿지 응답 (ewvlm_lmstudio_bridge.py / ewvlm_ollama_bridge.py)
- **현황**: LM Studio나 Ollama로 VLM 추론을 요청할 때 실제 모델을 거치지 않고, `_generate_mock_base64_image()`와 하드코딩된 캡션 텍스트(`"지면 상에 누출된 유독 가스로 추정되는..."`)를 반환하도록 하드코딩 되어 있습니다. (Mock-Mode)
- **개발 계획**: 실제 LM Studio / Ollama 엔드포인트(`http://localhost:11434` 등)로 프레임(이미지)과 프롬프트를 전송하고 추론 결과를 파싱하도록 로직을 활성화(Uncomment)해야 합니다.

### [2] 시맨틱 검색 (crud.py)
- **현황**: 자연어 영상 검색(VSS Semantic Search) 기능이 Vector DB(FAISS, Chroma 등)를 사용하지 않고, 단순히 문자열 포함 여부만 비교(Substring matching)하는 Mock 형태로 작성되어 있습니다.
- **개발 계획**: 입력된 검색어를 임베딩 모델(Embedding)을 통해 벡터화하고, 영상 캡션의 임베딩 벡터와 코사인 유사도를 비교하는 진짜 시맨틱 검색 시스템을 구축해야 합니다.

### [3] ONVIF PTZ 카메라 제어 (onvif_controller.py)
- **현황**: `onvif-zeep` 라이브러리가 없거나 연결되지 않아 PTZ 카메라 제어가 `logger.warning("... PTZ will run in Mock mode.")` 형태로 더미 동작만 수행합니다.
- **개발 계획**: 실제 CCTV의 ONVIF 프로토콜 지원 여부를 확인하고 인증 정보를 연동하여 렌즈 팬/틸트/줌을 직접 물리적으로 제어하도록 구성해야 합니다.

---

> [!IMPORTANT]
> **우선순위 결정 및 승인 요청**
> 사용자님, 이처럼 꽤 많은 부분에서 아직 프로토타입 형태의 더미 로직들이 확인되었습니다.
> 이 모든 것을 한꺼번에 연동하기는 작업량이 방대하므로, **가장 먼저 실제 기능으로 구현되길 원하시는 항목(예: VLM 챗봇 실제 연동, 실시간 이벤트 알람 연동 등)을 선택해 주시면** 해당 파트부터 단계적으로 완벽하게 실제 시스템으로 걷어내어 개발을 진행하겠습니다.
> 어떤 파트부터 먼저 작업을 시작할까요?
