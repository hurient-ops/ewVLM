# [AI & 백엔드 에이전트] Task 5: 이벤트 비디오 분절(Chunk) 자동 저장 파이프라인 완성 계획

현재 1단계(Fast-Loop YOLO)에서 위험 상황이 감지되면 단순히 에스컬레이션 API만 호출될 뿐, 증거로 남길 해당 시점의 **영상 분절(Chunk)을 잘라내는 로직**이 활성화되지 않은 상태입니다. 이에 `ffmpeg`를 백그라운드 태스크로 연동하여 위험 상황의 전후 20초(과거 10초 ~ 미래 10초) 가량의 영상을 자동으로 클리핑(Clipping)하는 증거 보존 아키텍처를 도입합니다.

## User Review Required

> [!NOTE]
> 실제 상용 환경이라면 NVR의 Rolling Buffer(실시간 메모리 캐시)나 RTSP 스트림의 Timestamp를 타겟팅하여 자르겠지만, 현재 데모 환경에서는 `sample_video.mp4`를 기반으로 `ffmpeg`의 `-ss` (시작점)와 `-t` (지속시간) 파라미터를 활용해 동적으로 가상의 사고 발생 시점을 잘라내어 저장(`downloads/chunk_{id}.mp4`)하도록 구현하겠습니다.

## Proposed Changes

### 백엔드 (FastAPI)

#### [MODIFY] `backend/ewvlm_fastapi_gateway.py`
1. **FFmpeg 비동기 청크(Chunk) 생성 함수 추가**:
   - `async def extract_event_video_chunk(escalation_id: str) -> str:` 형태의 비동기 함수를 작성합니다.
   - 파이썬의 `asyncio.create_subprocess_exec`를 이용해 `ffmpeg.exe`를 호출하고, 원본 비디오에서 20초 구간을 `-c copy` 옵션(트랜스코딩 없이 매우 빠른 스트림 복사)으로 덤프(Dump)합니다.
   - 완료 시 생성된 영상 파일의 경로(`/downloads/chunk_xxx.mp4`)를 반환합니다.

2. **VLM 워커 파이프라인(`vlm_worker`) 연동**:
   - 기존에는 `escalation_data.video_segment_chunk_path`를 그대로 DB에 저장하고 있었습니다 (보통 빈 값이나 Mock Data).
   - VLM 분석을 수행하는 딜레이(Wait) 시간 동안 낭비 없이 **FFmpeg 청크 생성을 병렬(await)로 처리**하도록 코드를 수정합니다.
   - 잘라낸 영상의 최종 물리적 경로를 DB 테이블의 `video_segment_chunk_path`에 업데이트하여, 추후 프론트엔드에서 재생할 수 있도록 바인딩합니다.

## Verification Plan

### Automated Tests
- 백엔드에서 `/api/v1/escalation/trigger` 엔드포인트를 호출 시켰을 때, `downloads/` 디렉토리에 `chunk_esc_xxx.mp4` 파일이 정상적으로 생성되는지(그리고 영상이 재생 가능한지) 파일 크기 등을 통해 검증.

### Manual Verification
- 프론트엔드의 이벤트 리포트나 대시보드 알림에서 발생한 이벤트를 클릭했을 때, 자동 저장된 20초 분량의 영상 분절본이 정상적으로 불러와지는지 육안 확인.
