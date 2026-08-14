# 시스템 보완 작업 (이슈 리포트 대응) 구현 계획

이전에 식별된 3가지 이슈를 순차적으로 해결하기 위한 기술적 구현 계획입니다. 사용자님의 승인이 완료되면 즉시 작업을 시작하겠습니다.

## 1. 글로벌 알림(Toast) UI 부재 해결 (프론트엔드)
현재 `useEventSimulator`를 통해 생성된 이벤트가 `useEventLogStore`에 정상적으로 저장되나, 화면상에 팝업으로 나타나지 않고 있습니다.

### [BaseLayout.tsx] 변경점
- **글로벌 Toast 컨테이너 추가**: 화면 우측 하단에 최신 이벤트 로그를 감지하여 5초간 팝업되는 Toast UI를 렌더링합니다.
- **알림 뱃지 데이터 연동**: 현재 UI에 하드코딩된 빨간색 알림 뱃지(Ping)를 `useEventLogStore`의 `unreadAlertCount`를 구독하도록 변경하여, 새 이벤트가 발생했을 때만 표시되도록 수정합니다.

## 2. 백엔드(FastAPI) 카메라 API 미구현 해결 (백엔드)
대시보드의 카카오맵(GIS)에서 카메라 마커를 불러오기 위해 `GET /api/v1/cameras` 엔드포인트를 호출하지만 404 에러가 발생하고 있습니다.

### [ewvlm_fastapi_gateway.py] 변경점
- `@app.get("/api/v1/cameras")` 라우터를 추가합니다.
- 프론트엔드가 요구하는 포맷(`camera_id`, `name`, `latitude`, `longitude`, `is_active`)에 맞춘 더미 카메라 리스트(예: CAM-01, CAM-02 등)를 반환하도록 로직을 구현합니다.

## 3. WebRTC 미디어 서버 부재 해결 (백엔드)
프론트엔드의 `WebRTCPlayer`가 `http://localhost:8889/` 로 더미 스트리밍을 요청하나 서버가 없어 `Failed to fetch` 에러가 발생합니다.

### [mock_webrtc_server.py] 신규 파일 생성
- 파이썬 내장 `http.server` 또는 `FastAPI`를 이용해 `8889` 포트에서 동작하는 경량 더미 서버를 생성합니다.
- 프론트엔드의 미디어 요청에 대해 CORS 허용 및 200 OK를 반환하여 Network Error(Failed to fetch)가 발생하지 않도록 조치합니다.

---

> [!IMPORTANT]
> **검토 요청**
> 1~3번 항목에 대한 위 구현 계획이 적절한지 확인 부탁드립니다. **승인해 주시면 바로 1번 프론트엔드 작업부터 순서대로 진행하겠습니다.**
