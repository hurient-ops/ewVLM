# Multi-Model Ensemble (멀티 VLM 모델 동시 추론) 구현 계획

사용자가 2개 이상의 AI 모델을 선택할 경우, 백엔드에서 비동기 병렬 처리(Async Parallel Inference)를 통해 동시에 추론을 수행하고 그 결과를 결합(Consensus/Aggregation)하여 보여주는 앙상블 시스템을 구현합니다.

## User Review Required

> [!IMPORTANT]
> - 프론트엔드의 탑 바(Top Bar) UI 공간이 제한적이므로, 다중 선택 방식은 가로형 체크박스 리스트 형태 또는 커스텀 멀티-셀렉트 팝업(드롭다운 내 체크박스)으로 구현됩니다. 어느 쪽이 더 선호되시는지 피드백 부탁드립니다. (기본 제안: 탑 바에 어울리는 **드롭다운 체크박스** 형태)
> - 하드웨어 VRAM 리소스 보호를 위해 기본적으로 제약 없이 자유롭게 다중 선택이 가능하도록 구현하되, **만약 모델을 단 1개만 선택하더라도 완벽하게 호환(단일 추론 모드로 자동 전환)**되도록 설계합니다.

## Proposed Changes

### 백엔드 (FastAPI & VLM Bridge)

#### [MODIFY] [ewvlm_fastapi_gateway.py](file:///e:/projects/ewVLM/backend/ewvlm_fastapi_gateway.py)
- **상태 관리 변경**: `app.state.active_vlm_model` (단일 String) -> `app.state.active_vlm_models` (String Array)로 확장합니다. 초기값은 `["Llama 3.2 11B Vision Instruct"]`로 설정합니다.
- **API 엔드포인트 수정**:
  - `GET /api/v1/vlm/models`: `active` 필드에 배열을 반환하도록 수정.
  - `PUT /api/v1/vlm/model`: Payload를 `{ "model_names": ["model1", "model2"] }` 형태로 받도록 DTO(Pydantic BaseModel) 수정.
- **병렬 추론 로직 적용 (`simulate_slow_loop_inference`)**:
  - 선택된 `active_vlm_models` 배열을 순회하며 `asyncio.to_thread(vlm_bridge.query_lmstudio_vision, ...)` 코루틴 태스크 리스트를 생성합니다.
  - 배열 길이가 1인 경우(단일 선택): 기존처럼 1개의 모델만 단독으로 추론하며 불필요한 결합 과정을 생략해 최적화합니다.
  - 배열 길이가 2 이상인 경우(다중 선택): `asyncio.gather(*tasks)`를 통해 **병렬(Parallel)로 모든 모델에 추론을 동시에 요청**합니다.
  - 여러 모델의 결과가 도착하면(Results), 각 모델의 Caption을 조합합니다. 
    (예: `[Llama 결과] ... \n [Solar 결과] ... \n => [앙상블 교차 검증 완료]`)
  - 신뢰도(Confidence Score)는 참여한 모델들의 평균값으로 보정(Calibration)합니다.

---

### 프론트엔드 (React & TypeScript)

#### [MODIFY] [client.ts](file:///e:/projects/ewVLM/frontend/src/api/client.ts)
- `setVlmModel(modelNames: string[])` 메서드로 시그니처를 변경하고, Payload를 배열로 전송하도록 업데이트합니다.
- `getVlmModels()` 호출 시 백엔드의 바뀐 응답 스키마(Array)를 수용하도록 타입 및 로직을 맞춥니다.

#### [MODIFY] [MonitorCanvas.tsx](file:///e:/projects/ewVLM/frontend/src/components/MonitorCanvas.tsx)
- `activeModel` 상태를 `string[]` 타입의 `activeModels`로 변경합니다.
- `<select>` 태그를 다중 선택이 가능한 형태(체크박스 드롭다운 팝업)로 리팩토링합니다.
- 특정 모델을 체크/체크 해제할 때마다 변경된 `activeModels` 배열을 API를 통해 백엔드로 전송(`setVlmModel`)합니다.
- 이벤트 콘솔 알림(onActionTrigger)에 다중 모델 교체 알림 텍스트를 출력합니다. (예: `[SYSTEM] AI 모델이 Llama, Solar 앙상블로 교체되었습니다.`)

## Verification Plan

### Automated Tests
- 백엔드 병렬 추론: 2개 이상의 모델을 설정하고 `GET /api/v1/vlm/models` 및 에스컬레이션 트리거 시 에러 없이 복합 캡션이 반환되는지 테스트.
- `npm run build` 명령어를 통한 무결성 100% 확인.

### Manual Verification
- 웹 브라우저(`http://localhost:5174/monitor-a`) 접속.
- 탑 바에서 모델 2개 이상을 클릭하여 다중 선택.
- 우측 하단 이벤트 콘솔에서 "다중 모델로 교체되었습니다"라는 알림 확인.
- VLM 판독 로그(`[VLM 판독완료]`)에 2개 이상의 모델명과 결합된 분석 결과가 출력되는지 시각적 검증.
