# 확실한 영상 스트리밍(MediaMTX) 연결 실패 대책 플랜

현재 사용자가 겪고 계신 "영상이 올라오지 않는 현상"의 근본적인 원인은 **MediaMTX 스트리밍 서버가 제때 실행되지 않았거나, 백엔드가 서버보다 먼저 켜지면서 카메라 스트림 연결(Sync)에 실패**하기 때문입니다.

현재 환경 분석:
1. `run_ewvlm_all.bat` 통합 실행 스크립트에 `mediamtx.exe`를 시작하는 단계가 **완전히 누락**되어 있습니다.
2. 백엔드(`ewvlm_fastapi_gateway.py`)는 서버 기동 시 단 1회만 MediaMTX에 연결을 시도하며 실패 시 다시 재시도하지 않는 취약한 구조로 되어있습니다.

이 구조적인 문제를 해결하여 다음부터 절대 같은 문제가 발생하지 않도록 아래의 **확실한 대책**을 적용하겠습니다.

## User Review Required

> [!WARNING]  
> 이 변경 사항은 프로젝트의 시작 스크립트와 백엔드 서버의 초기화 코드를 수정합니다. 기존 구동 방식은 유지되면서 백그라운드 영상 서버 실행이 자동으로 추가됩니다. 적용해도 괜찮을지 승인(Proceed)을 눌러주세요.

## Proposed Changes

---

### Batch Launcher Script

통합 런처 스크립트 첫 단계에 영상 서버를 자동으로 켜는 루틴을 추가합니다.

#### [MODIFY] `run_ewvlm_all.bat`
- **추가**: Step 1 전에 `MediaMTX` 스트리밍 서버를 가장 먼저 실행하도록 `start` 명령어 추가.
- **순서**: MediaMTX 시작 -> 백엔드 시작 -> 프론트엔드 시작

---

### Backend Gateway

백엔드가 구동될 때 MediaMTX가 아직 켜지지 않았더라도 실패하지 않고 여러 번 재시도하도록 안정화 로직을 추가합니다.

#### [MODIFY] `backend/ewvlm_fastapi_gateway.py`
- **변경**: `startup` 이벤트 내부의 MediaMTX 카메라 Sync 로직에 **Retry(재시도) 메커니즘** 추가.
- **방식**: 연결 실패 시 2초 대기 후 최대 5번까지 재시도하도록 수정하여, 스트리밍 서버가 늦게 켜지더라도 정상적으로 영상 스트림을 등록(Push)할 수 있도록 보완.

## Verification Plan

### Automated Tests
- `run_ewvlm_all.bat` 실행 시 총 5개의 창(MediaMTX 포함)이 열리는지 확인.

### Manual Verification
- 사용자가 스크립트를 재실행한 뒤 브라우저에 접속하여 카메라 영상 썸네일과 실시간 뷰가 확실하게 나오는지 눈으로 확인 요청.
