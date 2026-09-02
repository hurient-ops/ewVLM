# 저장영상 화면 레이아웃 및 실영상 교체 계획

현재 `MultiChannelSyncPlayback.tsx` 화면에서 발생하는 가로 늘어짐/크롭 현상과 MOCK 영상을 실제 CCTV 영상으로 교체하는 작업에 대한 계획입니다.

## User Review Required
> [!IMPORTANT]
> **실제 CCTV 영상 녹화 안내**
> DB에 등록된 사내 네트워크 카메라(`rtsp://...192.168.0.71:554/profile1`)에 직접 접근하여 약 **15초 분량의 실제 영상을 `sample_cctv_record.mp4` 파일로 녹화**할 예정입니다.
> 이를 백엔드의 `records/demo/stream` API에서 서비스하도록 연결하여 모든 4개의 채널이 실제 CCTV 녹화본을 재생하도록 구성하겠습니다. 녹화를 진행해도 될까요?

## Proposed Changes

---

### UI 레이아웃
화면이 비정상적으로 가로로 길게 늘어지거나 크롭(`object-cover`)되는 현상을 수정합니다.

#### [MODIFY] `MultiChannelSyncPlayback.tsx`
- 2x2 그리드 내의 비디오 요소가 원본 비율(16:9)을 유지하도록 `object-contain` 및 `aspect-video` 클래스를 적용합니다.
- 부모 컨테이너가 가로로 무작정 늘어나지 않도록 FlexBox 제약을 추가하여 화면에 꽉 차면서도 비율이 깨지지 않게 수정합니다.
- 현재 CH 3, CH 4에 적용되어 있는 고정 이미지(가짜 이미지 URL)를 걷어내고, 4채널 모두 동일한 녹화 영상(또는 시간차를 둔 영상)을 재생하도록 `<video>` 태그로 통일합니다.

---

### 백엔드 연동 및 영상 캡처
가짜 MOCK 영상을 송출하는 대신, 실제 CCTV를 실시간으로 녹화하여 스트리밍하도록 파이프라인을 변경합니다.

#### [NEW] `capture_cctv_sample.py` (임시 스크립트)
- FFmpeg(또는 OpenCV)를 사용하여 실 CCTV(`192.168.0.71`)에서 15초 길이의 영상을 `backend/sample_cctv_record.mp4`로 다운로드 및 저장합니다.

#### [MODIFY] `ewvlm_fastapi_gateway.py`
- 기존의 `/api/v1/records/demo/stream` 엔드포인트가 단순히 더미를 내려주던 것을 수정하여, 방금 녹화한 `sample_cctv_record.mp4` 파일을 실제 HTTP Range Requests(비디오 스트리밍)로 응답하도록 변경합니다.

## Verification Plan

### Automated Tests
- 없음

### Manual Verification
1. **비디오 스트리밍 테스트**: 브라우저에서 `/api/v1/records/demo/stream` 주소로 접근 시 15초 분량의 실제 CCTV 영상이 정상적으로 로드되는지 확인.
2. **UI 테스트**: 프론트엔드 다중 채널 재생 화면(`/multi-channel-sync`) 접속 시 4분할 화면이 찌그러지거나 잘리지 않고 자연스럽게 전체 화면을 채우는지 확인. 
3. **타임라인 조작 테스트**: 슬라이더를 드래그할 때 영상의 시간이 동기화되어 움직이는지 확인.
