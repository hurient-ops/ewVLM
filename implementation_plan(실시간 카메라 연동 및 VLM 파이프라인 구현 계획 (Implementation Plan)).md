# 실시간 카메라 연동 및 VLM 파이프라인 구현 계획 (Implementation Plan)

이 문서는 실시간 카메라 연동을 위한 백엔드 API, MediaMTX 연동, DB 변경 및 프론트엔드 연결을 포함한 구체적인 작업 계획입니다. 사용자의 승인이 떨어지면 바로 구현 작업을 시작합니다.

## User Review Required
> [!IMPORTANT]
> 아래 구현 계획을 확인해 주세요. 특히 **DB 스키마(Camera)에 어떤 정보를 필수적으로 저장할지**와 **MediaMTX 트랜스코딩 설정**이 맞는지 확인해 주시기 바랍니다. 승인 시(Proceed 버튼 클릭) 작업이 바로 시작됩니다.

## Proposed Changes

---

### Backend (Database & CRUD)

#### [MODIFY] `backend/models.py`
- `Camera` 테이블 모델 확장:
  - `rtsp_url` 필드 추가
  - `group_id` 필드 추가
  - `vlm_enabled` 필드 추가
- `VideoRecord` 테이블 모델 신규 추가:
  - `id`, `camera_id`, `start_time`, `end_time`, `file_path`, `event_tags` 필드 정의

#### [MODIFY] `backend/crud.py`
- 카메라 관련 CRUD 함수 추가 (`create_camera`, `get_cameras`, `update_camera`, `delete_camera`)
- `video_records` 기록 및 조회를 위한 함수 추가

---

### Backend (FastAPI Gateway)

#### [MODIFY] `backend/ewvlm_fastapi_gateway.py`
- `/api/v1/cameras` 엔드포인트(GET, POST, PUT, DELETE) 신규 생성
- `/api/v1/records` 엔드포인트 신규 생성
- 카메라 POST 등록 시 **MediaMTX API (`http://localhost:9997/v3/config/paths/add/{camera_id}`)를 호출하여 스트림 패스를 동적으로 등록**하는 로직 추가.

---

### Backend (AI Engine & MediaMTX)

#### [MODIFY] `backend/mediamtx.yml`
- API 서버 활성화 (`api: yes`, `apiAddress: :9997`)

#### [MODIFY] `backend/fast_loop.py`
- 기존 하드코딩된 `CAMERAS = [...]` 배열 제거
- 서버 시작 및 주기적으로 DB(혹은 FastAPI)에서 `vlm_enabled=True`인 카메라 목록을 조회하여 OpenCV 스트리밍을 동적 캡처하도록 변경

---

### Frontend (UI & State)

#### [MODIFY] `frontend/src/store/useCameraStore.ts`
- Mock 데이터를 제거하고 `fetchCameras`, `addCamera` 등의 비동기 API 통신(Zustand action) 추가
- `axios`를 통해 `/api/v1/cameras`에서 데이터를 불러와 상태 갱신

#### [MODIFY] `frontend/src/components/CameraSetupConfig.tsx`
- 하드코딩된 정적 폼을 React `useState` 폼 컨트롤로 변경
- '저장 및 적용' 버튼 클릭 시 `useCameraStore.addCamera` 액션 호출

#### [MODIFY] `frontend/src/components/CameraListManager.tsx`
- 컴포넌트 마운트 시(`useEffect`) DB에서 카메라 목록을 불러와(`fetchCameras`) 렌더링하도록 수정

## Verification Plan

### Automated Tests
- DB 초기화 후 FastAPI가 정상적으로 Swagger UI와 엔드포인트를 제공하는지 확인
- `fast_loop.py` 실행 시 하드코딩된 값이 아닌 DB 정보를 바라보는지 로그 확인

### Manual Verification
1. 프론트엔드 **설정 및 구성(CameraSetupConfig)** 화면에서 신규 카메라 정보를 입력 후 저장 버튼 클릭
2. **카메라 목록(CameraListManager)** 화면에서 등록한 카메라가 잘 노출되는지 확인
3. 등록 시 MediaMTX 콘솔에서 동적으로 Stream Path가 생성되는지 확인
4. 실시간 영상 화면(Monitor A)에서 추가한 카메라를 드래그 앤 드롭했을 때 플레이어가 연동되는지 확인
