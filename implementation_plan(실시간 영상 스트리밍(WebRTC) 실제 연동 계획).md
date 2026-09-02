# 실시간 영상 스트리밍(WebRTC) 실제 연동 계획

현재 `WebRTCPlayer.tsx`는 포트 8889로 WHEP(WebRTC HTTP Egress Protocol) 기반의 SDP 통신을 시도하지만, 백엔드의 `mock_webrtc_server.py`가 더미(Dummy) 응답만 주고 있어 실제 비디오 영상이 스트리밍되지 않는 상태입니다. 

이를 해결하기 위해 3rd-party 미디어 서버(MediaMTX 등)를 도입하는 대신, 현재 YOLO 추론을 수행 중인 **`fast_loop.py` 내부에 `aiortc` 기반의 WebRTC 스트리밍 서버를 직접 내장**하여, AI 바운딩 박스가 그려진 실시간 프레임을 지연 없이 프론트엔드로 쏘아주도록 아키텍처를 개편합니다.

## User Review Required

> [!IMPORTANT]
> 이 계획을 실행하기 위해서는 파이썬 환경에 WebRTC 및 미디어 처리 라이브러리가 필요합니다. 승인해주시면 구현을 진행한 후, 아래 명령어를 통해 의존성을 설치하시도록 안내해 드리겠습니다.
> `pip install aiortc av aiohttp_cors`

## Open Questions

> [!TIP]
> 백엔드에서 `aiortc`를 이용해 WebRTC를 직접 서비스하게 되면, RTSP 스트림을 한 번만 디코딩하여 AI 분석과 WebRTC 스트리밍 양쪽에 모두 사용할 수 있어 리소스(CPU/GPU)가 크게 절감됩니다. MediaMTX 같은 외부 바이너리를 별도로 띄우는 것보다 이 Python Native 방식이 유지보수에 유리한데, 이 방향으로 진행해도 괜찮으실까요?

## Proposed Changes

### Backend

#### [MODIFY] `backend/fast_loop.py`
- `aiortc` 모듈 추가 (WebRTC PeerConnection 및 MediaStreamTrack 구현).
- 8889 포트로 들어오는 WHEP 호환 `/{camera_id}/whep` POST 엔드포인트 구현 (SDP Offer 수신 및 Answer 반환).
- `latest_frames[camera_id]` (YOLO 분석이 끝난 프레임)를 초당 24~30프레임으로 인코딩하여 WebRTC 비디오 트랙으로 쏴주는 로직(`VideoStreamTrack` 상속 클래스) 구현.

#### [DELETE] `backend/mock_webrtc_server.py`
- 가짜 통신만 하던 해당 목업 서버 삭제.

#### [MODIFY] `run_ewvlm_all.bat`
- `mock_webrtc_server.py`가 만약 실행 목록에 있었다면 제거(현재는 없으므로 확인 후 패스). `fast_loop.py` 하나가 AI 분석과 WebRTC 서빙을 모두 담당하게 됨.

### Frontend

#### [MODIFY] `frontend/src/components/WebRTCPlayer.tsx`
- 기존 WHEP 프로토콜 통신 코드가 커스텀 `aiortc` 서버와 완벽히 호환되도록 SDP 협상(Offer/Answer) 예외 처리 최적화.

#### [MODIFY] `frontend/src/components/MonitorCanvas.tsx`
- 연결 상태 UI에 WebRTC 스트림이 정상적으로 수신되는지(onTrack) 피드백 렌더링 최적화.

## Verification Plan

### Automated / Code Tests
- `fast_loop.py` 실행 시 8889(WebRTC) 및 8890(MJPEG) 포트가 동시에 충돌 없이 열리는지 확인.

### Manual Verification
1. 브라우저에서 Monitor Canvas로 진입.
2. WebRTCPlayer 컴포넌트가 8889 포트로 WHEP 요청을 보내고 정상적인 SDP Answer를 받는지 개발자 도구(F12) Network 탭에서 확인.
3. 캔버스 화면에 **가짜 영상이 아닌 진짜 CCTV(.mp4 든 실제 RTSP든) 영상과 함께 YOLO11 바운딩 박스가 실시간으로 렌더링**되는지 확인.
