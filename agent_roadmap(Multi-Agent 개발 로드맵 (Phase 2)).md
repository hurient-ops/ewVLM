# 🗺️ Multi-Agent 개발 로드맵 (Phase 2)

이전에 분석했던 시스템의 "미진한 부분(Technical Debt)" 5가지를 방금 생성된 **4명의 전문 에이전트**에게 할당하여 체계적으로 고도화하기 위한 로드맵입니다.

## 📌 [Task 1] GIS 공간 좌표 변환 공식 고도화
- **전담 에이전트**: 📐 `ewvlm-gis-agent` (협력: `ewvlm-backend-agent`)
- **현재 문제점**: 2D 픽셀 좌표를 3D 공간 거리로 매핑하는 코드가 단순 비례식(Mock)으로 하드코딩 되어있습니다.
- **개발 내용**: 
  - OpenCV(`cv2.projectPoints`, `cv2.findHomography`)를 활용해 카메라의 고도(Altitude), 틸트(Tilt), 초점 거리(Focal Length)를 바탕으로 실제 거리와 위경도를 산출하는 `Perspective Transform` 알고리즘 개발.

## 📌 [Task 2] 자연어 기반 SOP 룰(Rule) 생성 파이프라인 연동
- **전담 에이전트**: 🧠 `ewvlm-ai-agent` (협력: `ewvlm-frontend-agent`)
- **현재 문제점**: "빨간 옷 입은 사람" 등의 프롬프트를 입력하면 단순 If-Else 키워드("차량", "화재")로만 걸러내는 중입니다.
- **개발 내용**: 
  - LLM Function Calling 기능을 연동하여 자연어 지시문을 정확한 JSON 기반의 VLM Rule 템플릿 구조체로 파싱하고 DB에 저장하는 AI 파이프라인 구축.

## 📌 [Task 3] NVR 하드웨어 실시간 리소스 모니터링 연동
- **전담 에이전트**: ⚙️ `ewvlm-backend-agent`
- **현재 문제점**: NVR 노드의 CPU/RAM 통계를 `random.uniform()` 난수로 가상 생성하고 있습니다.
- **개발 내용**: 
  - `psutil` 또는 서버 내장 메트릭(Telegraf API 등)을 긁어오는 백그라운드 태스크를 작성하여 실제 서버 자원을 실시간으로 관제 화면에 송출.

## 📌 [Task 4] 분산 메시지 큐(Redis/Kafka) 실환경 연결
- **전담 에이전트**: ⚙️ `ewvlm-backend-agent`
- **현재 문제점**: Kafka 설치가 안 되어 있어 단순 메모리 내에서 Mock 큐 모드로 브로드캐스팅 중입니다.
- **개발 내용**: 
  - Python `aioredis`를 연동하여 Redis Pub/Sub 기반의 실시간 메시지 브로드캐스터 체계를 구축하고 Mock 상태 해제.

## 📌 [Task 5] 이벤트 발생 시 비디오 분절(Chunk) 자동 저장
- **전담 에이전트**: ⚙️ `ewvlm-backend-agent` (협력: `ewvlm-frontend-agent`)
- **현재 문제점**: 이벤트 발생 시 녹화 파일 경로를 무조건 `/tmp/mock_path.mp4`로 리턴하고 있습니다.
- **개발 내용**: 
  - FFmpeg 서브프로세스를 활용해 실시간 스트림 버퍼에서 이벤트 전후 10초를 잘라내어(Slicing) 실제 `mp4` 파일로 저장하고 프론트엔드 재생기에 연동.

---

### 💡 진행 의견을 들려주세요!
위의 리스트 중 **어떤 Task를 가장 먼저 시작**할까요? (예: "Task 1번부터 시작해 줘", "Task 2번 AI 기능 먼저 해보자" 등)
