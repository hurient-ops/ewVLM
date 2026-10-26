# [백엔드 에이전트] Task 4: 분산 메시지 큐(Redis Pub/Sub) 연동 계획

현재 `websocket_manager.py`는 단일 인스턴스의 메모리 배열(`self.active_connections`)에만 WebSocket 클라이언트를 보관하고 있습니다. 만약 서버 트래픽이 늘어나 2대 이상의 백엔드 컨테이너(Scale-Out)로 운영될 경우, 1번 서버에서 발생한 알람 이벤트가 2번 서버에 접속한 프론트엔드 클라이언트에게는 전달되지 않는 고립 현상이 발생합니다.

이를 해결하기 위해 **Redis Pub/Sub 구조**를 도입하여 완벽한 분산 메시지 브로드캐스팅 아키텍처를 구현합니다.

## User Review Required

> [!WARNING]
> 현재 로컬 환경에 파이썬 `redis` 라이브러리가 설치되어 있지 않습니다. 따라서 구현 과정에서 `pip install redis`를 수행할 예정입니다.
> 
> [!TIP]
> **Graceful Degradation (우회 통신):** Redis 서버가 죽어 있거나 아직 설치되지 않은 경우를 대비하여, 연결 실패 시 기존의 단일 인메모리(Local) 브로드캐스트 모드로 자동 Fallback 되도록 튼튼하게 설계할 것입니다.

## Proposed Changes

### 백엔드 (FastAPI)

#### [MODIFY] `backend/websocket_manager.py`
1. **Redis 비동기 연결 셋업 (`redis.asyncio`)**:
   - `WebSocketManager` 클래스에 Redis 호스트(`redis://localhost:6379`) 연결을 초기화합니다.
   - 서버 시작 시 `_listen_redis` 비동기 백그라운드 태스크를 띄워 특정 채널(예: `ewvlm_events`)을 `subscribe()` 하도록 만듭니다.

2. **이벤트 송신 (Publishing)**:
   - 기존의 `broadcast_event(self, event_data)` 함수를 변경하여, 로컬 클라이언트들에게 바로 메시지를 뿌리는 대신 **Redis 채널로 Publish** 합니다.
   - 단, Redis에 연결할 수 없다면 예외처리(Exception)를 타고 로컬 루프로 메시지를 직접 쏘는 기존 로직을 타게 만듭니다(Fallback).

3. **이벤트 수신 (Subscribing)**:
   - `_listen_redis` 태스크는 Redis 채널에서 메시지를 받을 때마다 `self.active_connections`를 순회하며 실제 연결된 브라우저(프론트엔드)들에게 `send_text()`로 이벤트를 꽂아줍니다.

## Verification Plan

### Automated Tests
- 백엔드에 `pip install redis` 수행 후 FastAPI 애플리케이션 컴파일 검증.

### Manual Verification
- 프론트엔드 UI를 띄워두고 백엔드 API Gateway의 트리거 엔드포인트를 호출했을 때, Redis를 거쳐 WebSocket으로 알람이 정상적으로 웹 화면에 뜨는지 확인. (Redis 서버가 없는 윈도우 로컬의 경우 Fallback 모드로 정상 동작하는지 검증)
