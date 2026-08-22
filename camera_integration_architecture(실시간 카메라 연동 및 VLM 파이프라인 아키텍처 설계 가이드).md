# 실시간 카메라 연동 및 VLM 파이프라인 아키텍처 설계 가이드

실제 현장의 IP 카메라(CCTV)를 시스템에 연동하고, 영상을 스트리밍하며, Edge AI(YOLO/VLM)로 분석하기 위한 전체적인 프로세스와 백엔드/프론트엔드 연동 방안을 정리한 가이드입니다.

---

## 1. 데이터베이스(DB) 설계
카메라 정보를 영구적으로 저장하기 위한 DB 테이블을 설계합니다. (예: PostgreSQL, MySQL, SQLite 등)

### `cameras` 테이블 스키마 (예시)
| 필드명 | 타입 | 설명 |
|---|---|---|
| `id` | VARCHAR | 카메라 고유 식별자 (Primary Key) |
| `name` | VARCHAR | 카메라 표시 이름 (예: "로비 메인 게이트") |
| `ip_address` | VARCHAR | 카메라 IP 주소 |
| `rtsp_url` | VARCHAR | 카메라 원본 RTSP 주소 (비밀번호 포함) |
| `group_id` | VARCHAR | 소속된 카메라 그룹 ID |
| `vlm_enabled` | BOOLEAN | VLM/YOLO 분석 활성화 여부 |
| `status` | VARCHAR | 현재 상태 (`online`, `offline`) |

---

## 2. 백엔드 API 설계 (FastAPI)
프론트엔드에서 카메라를 등록하고 조회할 수 있도록 RESTful API를 구현합니다. (`ewvlm_fastapi_gateway.py`에 추가)

- **`POST /api/v1/cameras`**: 신규 카메라 등록
  - 프론트엔드(`CameraSetupConfig.tsx`)에서 폼을 입력하고 저장할 때 호출됩니다.
  - DB에 카메라 정보를 저장합니다.
- **`GET /api/v1/cameras`**: 전체 카메라 목록 조회
  - 프론트엔드(`CameraListManager.tsx`) 진입 시 호출되어 목록을 렌더링합니다.
- **`PUT /api/v1/cameras/{id}`**: 카메라 정보 수정
- **`DELETE /api/v1/cameras/{id}`**: 카메라 삭제

---

## 3. 스트리밍 서버(MediaMTX) 동적 연동
CCTV의 RTSP 주소를 프론트엔드 웹(브라우저)에서 바로 재생하는 것은 불가능하므로, **MediaMTX**를 중계 서버로 사용합니다.

1. **스트림 동적 추가**: 
   백엔드(`POST /api/v1/cameras`)에 카메라가 등록되면, 백엔드가 MediaMTX의 API를 호출하여 새로운 카메라 스트림 경로(Path)를 동적으로 생성합니다.
   - *MediaMTX API 예시*: `POST http://localhost:9997/v3/config/paths/add/{camera_id}`
   - *Payload*: `{"source": "rtsp://admin:1234@192.168.1.100/stream"}`
2. **웹 재생 지원**: 
   MediaMTX는 이 RTSP 소스를 받아 WebRTC, HLS, 또는 MJPEG 등의 브라우저 친화적 포맷으로 변환하여 프론트엔드에 제공합니다.

---

## 4. Edge AI (YOLO/VLM) 분석 엔진 연동 (`fast_loop.py`)
현재 `fast_loop.py`에 하드코딩 되어있는 `CAMERAS = [...]` 배열을 동적 DB 조회 방식으로 변경해야 합니다.

1. **주기적인 동기화**: `fast_loop.py` 구동 시, 혹은 주기적(예: 1분마다)으로 DB(또는 FastAPI)에서 `vlm_enabled=True`인 카메라 목록을 조회합니다.
2. **다중 채널 처리**: 조회된 카메라들의 스트림 URL(MediaMTX 중계 주소)을 읽어들여 비동기(Asynchronous)로 프레임을 추출합니다.
3. **분석 파이프라인**:
   - 추출된 프레임을 YOLO 모델(Fast-Loop)에 통과시킵니다.
   - 지정된 임계치를 넘는 이벤트(사람 쓰러짐, 화재 등)가 감지되면, 해당 프레임을 VLM(Slow-Loop)으로 넘겨 심층 분석을 수행합니다.

---

## 5. 프론트엔드 흐름 요약 (Zustand 상태 관리)
현재의 Mock 데이터 기반 코드(`useCameraStore.ts`)를 실제 API 연동 코드로 교체합니다.

1. **조회**: 앱이 로드될 때 `useCameraStore`에서 `axios.get('/api/v1/cameras')`를 호출하여 `cameras` 상태를 업데이트합니다.
2. **등록**: 사용자가 신규 등록 폼에서 데이터를 입력하고 저장하면, `axios.post()` 요청을 보낸 후 성공 시 전역 `cameras` 목록을 갱신합니다.
3. **재생**: 실시간 영상 화면(Monitor A)에서 카메라를 슬롯에 드래그하면, 컴포넌트는 MediaMTX가 제공하는 변환된 스트림 주소(예: WebRTC 엔드포인트)를 `<video>` 태그에 연결하여 영상을 출력합니다.

---

## 6. 저장 영상(NVR) DB 인덱싱 및 조회 아키텍처
단순히 실시간 스트리밍뿐만 아니라, 녹화된 과거 영상을 효율적으로 탐색하고 VLM 분석에 활용하기 위해서는 **영상 메타데이터 인덱싱**이 필수적입니다.

### 6.1 `video_records` 테이블 설계 (예시)
| 필드명 | 타입 | 설명 |
|---|---|---|
| `id` | VARCHAR | 녹화본 고유 식별자 |
| `camera_id` | VARCHAR | 연동된 카메라 ID (Foreign Key) |
| `start_time` | TIMESTAMP | 녹화 시작 시간 |
| `end_time` | TIMESTAMP | 녹화 종료 시간 |
| `file_path` | VARCHAR | 스토리지 내 물리적 파일 경로 (예: `/nvr/cam-01/20260823_1000.mp4`) |
| `event_tags` | JSONB | 해당 영상 구간에서 발생한 이벤트 태그들 (예: `["person_collapsed", "fire"]`) |

### 6.2 저장 영상 연동 프로세스
1. **NVR 녹화 및 메타데이터 저장**: 백엔드나 미디어 서버가 정해진 주기(예: 10분, 1시간 단위) 혹은 이벤트 발생 시 영상을 청크(Chunk) 단위로 파일 시스템이나 S3에 저장합니다. 저장과 동시에 `video_records` 테이블에 해당 파일의 경로와 시간 범위, 이벤트 태그를 인덱싱하여 `INSERT` 합니다.
2. **이벤트 타임라인 API (`GET /api/v1/records`)**: 프론트엔드(MultiChannelSyncPlayback 등)에서 특정 날짜와 카메라를 선택하면, 백엔드가 DB에서 해당 시간대의 인덱스(`file_path`)를 찾아 응답합니다.
3. **VLM 사후 분석 및 썸네일 제공**: 저장된 영상 파일의 특정 프레임을 백엔드에서 캡처하여 이벤트 리뷰 화면(EventReviewCenter)에 썸네일로 제공하거나, 사후 VLM 분석(Semantic Vector Search 등)에 활용할 수 있습니다.

---

### 💡 권장되는 작업 순서 (로드맵)
1. DB 세팅 및 FastAPI에 카메라 CRUD API 엔드포인트 구축
2. `CameraSetupConfig.tsx`(등록)와 `CameraListManager.tsx`(목록)에 API 연동
3. 카메라 등록 시 MediaMTX에 자동으로 스트림을 등록하는 로직 추가
4. `fast_loop.py`가 DB에서 카메라 목록을 읽어와서 동적으로 OpenCV VideoCapture 객체를 할당하도록 수정
5. 프론트엔드 실시간 영상 그리드에서 MediaMTX WebRTC 주소를 호출하도록 플레이어(`WebRTCPlayer`) 고도화
