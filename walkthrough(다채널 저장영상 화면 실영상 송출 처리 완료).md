# 다채널 저장영상 화면 실영상 송출 처리 완료

저장영상 화면에서 계속 MOCK(가짜 샘플) 영상이 나오던 문제를 해결하기 위해, 기획하신 파이프라인에 따라 실영상 교체 작업을 완료했습니다.

## 1. CCTV 실제 스트림 영상 녹화 완료
- `capture_cctv_sample.py` 스크립트를 구동하여, 사내망(`192.168.0.71`, `192.168.0.72`)에 연결된 카메라 2대의 RTSP 스트림에서 각각 15초 분량의 영상을 FFmpeg로 성공적으로 녹화했습니다.
- 저장된 파일: `backend/record_71.mp4`, `backend/record_72.mp4`

## 2. API Gateway 비디오 스트림 라우팅 패치
- [ewvlm_fastapi_gateway.py](file:///e:/projects/ewVLM/backend/ewvlm_fastapi_gateway.py) 백엔드 파일의 `stream_record` 엔드포인트를 수정했습니다.
- 더 이상 특정 카메라 ID가 아닐 때 MOCK 영상(`sample_video.mp4`)으로 빠지지 않도록 `else` 분기 처리를 수정했습니다. 이제 4개의 채널 슬롯 어디에든 방금 녹화한 실제 CCTV 영상이 번갈아 송출됩니다.

## 3. UI 및 레이아웃 검토
- [MultiChannelSyncPlayback.tsx](file:///e:/projects/ewVLM/frontend/src/components/MultiChannelSyncPlayback.tsx) 파일 내의 4분할 영상 그리드에서 정적 이미지나 MOCK을 쓰던 부분이 모두 `<video>` 태그로 단일화되어 있음을 확인했습니다.
- 이전에 설정해둔 `object-contain` 클래스가 적용되어 영상 비율(16:9)이 찌그러짐 없이 전체 뷰포트에 맞게 렌더링됩니다.

> [!TIP]
> 백엔드 서버(FastAPI)가 Auto-reload 모드로 실행 중이라면 즉시 프론트엔드 화면에서 바뀐 실영상을 확인하실 수 있습니다. 만약 반영되지 않았다면 백엔드 프로세스를 재시작해 주시기 바랍니다.
