# 8차 고도화: 엣지 AI 파인튜닝 (MLOps 파이프라인) 실시간 연동

프론트엔드 UI 껍데기로만 남아있던 `LoraFinetuningConsole.tsx`를 실제 백엔드의 LoRA 학습 루프와 WebSocket으로 양방향 연동하여, **동적 훈련 상태 추적 및 관리 파이프라인**을 완성하는 8차 개선안입니다.

## User Review Required
> [!IMPORTANT]
> - 실제 VLM 모델(11B 이상)을 환경 내에서 구동하여 수 시간 동안 훈련하는 것은 인프라 한계상 무리가 있으므로, Python 백엔드의 `mlops_lora_trainer.py` 훈련 루프(Epochs/Steps) 자체는 시뮬레이션(Mock) 방식을 유지하되, **이 루프가 실행되고 프론트엔드에 실시간으로 진행률(Loss, Epoch)을 Broadcast하여 UI가 동적으로 반응하는 "파이프라인"** 자체를 실제 상용 수준으로 구현하는 데 초점을 둡니다.

## Proposed Changes

---

### Frontend

#### [MODIFY] `frontend/src/components/LoraFinetuningConsole.tsx`
1. **WebSocket 리스너 연동**
   - 현재 UI 하드코딩(`isTraining ? '14/50' : '0/50'`)되어 있는 Epoch, Loss, 진행률 UI를 React 상태 변수로 분리합니다.
   - 관제센터용 웹소켓(`ws://localhost:8000/ws`)에 연결하여 `mlops_training_progress` 및 `mlops_training_completed` 이벤트를 수신받고 실시간 그래프(가상)와 수치를 갱신합니다.
2. **동적 학습 히스토리 관리**
   - 훈련이 완료(`SUCCESS`) 이벤트를 수신하면 우측 하단 "LoRA 버전 관리" 패널에 새로운 배포 버전(예: `v4.2 (Stable)`) 카드를 자동으로 추가하여 MLOps 생명주기를 시각화합니다.

---

### Backend

#### [MODIFY] `backend/mlops_lora_trainer.py`
1. **Progress Callback 지원**
   - `run_lora_finetuning` 함수가 단순히 터미널에 로그만 찍지 않고, 선택적인 비동기 `progress_callback` 함수를 매개변수로 받도록 수정합니다.
   - 매 Step마다 `loss`, `epoch`, `step` 계산 결과를 콜백으로 넘겨 외부(Gateway)로 방출(Emit)되도록 합니다.

#### [MODIFY] `backend/ewvlm_fastapi_gateway.py`
1. **WebSocket Broadcast 연동**
   - `background_lora_training` 함수 내부에 콜백 함수를 선언하여 `run_lora_finetuning`에 전달합니다.
   - 콜백이 호출될 때마다 `websocket_manager.manager.broadcast_event`를 통해 프론트엔드로 실시간 훈련 통계를 전송(`mlops_training_progress`)합니다.
   - 완료 시 `mlops_training_completed` 이벤트를 전송하고 DB(`MLOpsJob` 테이블)의 상태를 `COMPLETED`로 업데이트합니다.

---

## Verification Plan

### 수동 검증 (Manual Verification)
1. 프론트엔드 UI 좌측 햄버거 메뉴를 통해 **LoRA 모델 훈련(MLOps)** 페이지에 진입합니다.
2. 우측 상단의 **[훈련 강제 시작]** 버튼을 클릭합니다.
3. 화면 우측 상단 콘솔에 실시간으로 **Epoch (1/3), Loss 수치**가 백엔드로부터 스트리밍되어 갱신되는지 확인합니다.
4. 약 10초 후 훈련이 100% 완료되면 우측 하단의 **버전 관리 패널**에 새로운 훈련 완료 어댑터(버전 카드)가 등록되는지 확인합니다.
