# 4차 개선 계획: 비디오 프라이버시 마스킹 실구현 (FFmpeg 동적 블러링)

현재 비디오 반출 시 단순한 워터마크만 적용되던 Mock 로직을 폐기하고, 저장된 이벤트의 바운딩 박스(Bounding Box) 좌표를 가져와 FFmpeg로 정확히 모자이크(Box Blur) 처리하는 실무 수준의 파이프라인으로 교체합니다.

## User Review Required

> [!IMPORTANT]
> **입력 비디오 소스 및 블러링 필터 관련 결정 요청**
>
> 1. 현재 API Gateway(`PrivacyExportRequest`)에 어떤 이벤트(어떤 좌표)를 대상으로 비디오를 뽑아낼지 지정하는 `event_id` 속성이 누락되어 있습니다. 이를 추가하여 프론트엔드에서 요청 시 `event_id`를 넘기도록 확장하고자 합니다. 동의하시나요?
> 2. 실제 원본 MP4 영상이 모두 저장되어 있지 않으므로, 데모 환경을 위해 `sample_video.mp4` 또는 `mock_videos/cam-01.mp4`를 원본 소스로 가정하고, DB에 저장된 `crop_box_coordinates` (없을 경우 임의의 사람 좌표) 부분에 FFmpeg `boxblur` 필터를 적용하는 방식을 제안합니다.

## Proposed Changes

### [e:\projects\ewVLM\backend\ewvlm_fastapi_gateway.py]
- **[MODIFY]** `PrivacyExportRequest`
  - `event_id: Optional[str] = None` 추가
- **[MODIFY]** `export_privacy_video` API
  - DB Job 생성 시 `event_id`를 `config_dict`에 포함시켜 백그라운드 워커로 전달.
- **[MODIFY]** `background_export_job`
  - DB에서 `event_id`에 해당하는 `EventLog`를 조회하여 `crop_box_coordinates` (좌표) 추출.
  - 해당 좌표 정보를 기반으로 `generate_privacy_video` 함수 호출 (이전의 Mock 함수 대체).

### [e:\projects\ewVLM\backend\video_export_processor.py]
- **[MODIFY]** `generate_mock_privacy_video` -> `generate_privacy_video`로 함수명 및 내용 변경
  - 파라미터로 `input_video: str`, `bbox: list`를 추가로 받음.
  - FFmpeg `filter_complex`를 활용하여 `crop` + `boxblur` + `overlay` 조합으로 원본 영상의 특정 영역(bbox)만 모자이크 처리되도록 쉘 커맨드 생성 및 실행.
  - 처리된 MP4 파일을 ZIP으로 압축 또는 직접 반환.

## Verification Plan

### Manual Verification
1. API `/api/v1/video/export/masking`을 Swagger를 통해 호출하며 임의의 `event_id`를 주입합니다.
2. FFmpeg 커맨드가 정상적으로 실행되고 ZIP 압축본이 다운로드 폴더에 생성되는지 백엔드 로그 확인.
3. 생성된 MP4 파일을 재생하여 특정 영역(바운딩 박스)에 블러 처리가 성공적으로 입혀졌는지 눈으로 확인합니다.
