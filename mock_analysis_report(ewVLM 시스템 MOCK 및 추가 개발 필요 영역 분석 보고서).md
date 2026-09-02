# ewVLM 시스템 MOCK 및 추가 개발 필요 영역 분석 보고서

전체 코드베이스를 스캔(Grep)하여 `Mock`, `Simulate`, 라이브러리 부재 등의 키워드를 분석한 결과, 현재 ewVLM 시스템은 핵심 논리(Gateway API, VLM Inference, WebSocket, 시맨틱 검색 등)는 완벽히 구현되어 있으나 물리 하드웨어 연동 및 시간이 오래 걸리는 MLOps 작업 등에 **가상화(Mock/Simulation)** 처리가 다수 적용되어 있습니다.

## 1. 백엔드(Backend) 하드웨어 및 외부 연동 MOCK
물리적 IP 카메라, NVR 장비 없이 시연 및 작동이 가능하도록 하드웨어 연동 라이브러리가 미설치된 경우 자동으로 가상 응답을 반환합니다.

- **ONVIF PTZ 제어 (`onvif_controller.py`)**
  - **상태:** `onvif-zeep` 패키지 미설치로 인해 **Mock 모드** 동작. 카메라 팬/틸트/줌 명령 시 콘솔에 로그만 남음.
  - **필요 개발:** ONVIF 프로토콜(SOAP) 연동 코드를 실제 카메라와 연결하고 응답 속도를 테스트해야 합니다.
- **SNMP 네트워크 모니터링 (`snmp_controller.py`)**
  - **상태:** `pysnmp` 미설치로 인해 **Mock 모드** 동작. 대시보드에 표시되는 CPU, RAM, 네트워크 트래픽 상태가 `_get_mock_stats()`에 의해 랜덤으로 생성됨.
  - **필요 개발:** 실제 NVR 장비의 OID(Object Identifier)를 맵핑하고, SNMP Traps를 수신하는 실제 폴링(Polling) 로직 활성화가 필요합니다.
- **Edge 디바이스 제어 (`ssh_agent_controller.py`)**
  - **상태:** `asyncssh` 미설치로 Edge Agent에 대한 원격 명령이 시뮬레이션됨.
  - **필요 개발:** 젯슨 나노 등 엣지 디바이스의 재부팅, 모델 업데이트 등을 위한 실제 비동기 SSH 키 교환 및 명령 실행 파이프라인 고도화 필요.

## 2. 미디어 및 파이프라인 시뮬레이션
- **비디오 반출 프라이버시 마스킹 (`video_export_processor.py`)**
  - **상태:** `generate_mock_privacy_video()` 함수가 실행되어, 실제 얼굴/번호판을 블러 처리하는 것이 아닌 FFmpeg를 통해 단순 "PRIVACY MASK" 텍스트 워터마크만 영상에 덧씌워 가라(Mock) 처리 중입니다.
  - **필요 개발:** 객체 감지(YOLO)로 저장된 좌표(`crop_box_coordinates`) 정보를 기반으로 해당 영역만 모자이크(Blur) 처리하는 동적 FFmpeg 필터 파이프라인 구성이 요구됩니다.
- **RTSP 영상 소스 우회 (`fast_loop.py`, `playback_service.py`)**
  - **상태:** RTSP 스트림 연결 실패 시 자동으로 로컬 폴더의 `sample_video.mp4` 또는 가상 영상 스트림을 사용하도록 우회(Fallback)됨.

## 3. MLOps 및 AI 모델 재학습 (Active Learning)
- **LoRA 모델 미세조정 (`finetune_vlm.py`, `ewvlm_fastapi_gateway.py`)**
  - **상태:** 사용자가 오탐지 피드백을 보내어 VLM을 재학습하는 파이프라인 호출 시, 실제 PyTorch/HuggingFace 훈련이 아닌 `asyncio.sleep(5)`를 이용해 학습 시간을 **시뮬레이션(Simulate 5 seconds of training)** 중입니다.
  - **필요 개발:** Unsloth 등의 경량 튜닝 프레임워크를 도입하여, 수집된 피드백 데이터셋(`prepare_dataset.py`의 더미 데이터 대체)으로 LoRA 어댑터 가중치를 실제로 갱신하고 모델을 재배포(Hot-Swap)하는 실무 MLOps 구축이 가장 큰 과제입니다.

## 4. 프론트엔드(Frontend) MOCK 처리
- **랜덤 이벤트 발생기 (`useEventSimulator.ts`)**
  - **상태:** 백엔드가 연동되지 않은 상태에서도 UI 시연이 가능하도록 프론트단에서 주기적으로 무작위 이벤트를 만들어내고 있습니다.
  - **필요 개발:** 상용 배포 시 시뮬레이터 훅(Hook)을 비활성화하고, 100% 백엔드 WebSocket(Kafka) 이벤트 버스에 의존하도록 전환해야 합니다.
- **UI 더미 컴포넌트**
  - `RealtimeBiDashboard.tsx` 및 `MassDeviceConfigClone.tsx` 일부 차트와 데이터 그리드가 백엔드 연동 없이 더미(Mockup)로 동작하고 있습니다.

---

### 💡 총평 및 3대 우선 추진 과제
해당 시스템을 단순 시연용(PoC) 수준을 넘어 실제 **상용(Production) 수준**으로 배포하기 위한 최우선 해결 과제는 다음과 같습니다.

1. **프라이버시 영상 반출 고도화:** 동적 모자이크 블러 필터 적용 (현재 최우선 백엔드 개발 필요)
2. **하드웨어 제어 라이브러리 적용:** `pysnmp`, `asyncssh`, `onvif-zeep` 설치 및 실제 현장 장비(NVR/카메라) 1:1 디버깅
3. **MLOps 실제 구현:** 가짜 재학습 파이프라인을 진짜 GPU 기반 LoRA 미세조정 루프로 교체
