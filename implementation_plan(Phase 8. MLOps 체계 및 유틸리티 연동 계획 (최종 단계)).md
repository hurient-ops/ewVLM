# Phase 8: MLOps 체계 및 유틸리티 연동 계획 (최종 단계)

ewVLM의 마지막 단계로서, 단순한 관제 시스템을 넘어 모델 스스로 발전(Finetuning)하고 대규모 엣지 디바이스들을 일괄 관리할 수 있는 MLOps 및 Device Management 유틸리티를 백엔드와 연동합니다.

## User Review Required
> [!NOTE]
> 실제 LoRA 파인튜닝, 프롬프트 배포, 대규모 장비 설정 동기화 작업 등은 클러스터 및 NPU 인프라가 요구되므로, 백엔드 단에서 시뮬레이션 된 작업 지연(Delay) 및 성공 상태 반환 모델로 설계할 예정입니다. 프론트엔드에서는 실제 API가 호출되는 것과 동일한 로딩 상태 바운드와 토스트(Toast) 피드백이 연동됩니다. 동의하시나요?

## Proposed Changes

### Backend API
#### [MODIFY] `backend/ewvlm_fastapi_gateway.py`
다음의 **MLOps & Management 모의(Mock) 엔드포인트** 3가지를 신설합니다:
1. **LoRA 파인튜닝 스케줄링 (`POST /api/v1/mlops/train/lora`)**: 백그라운드 학습 작업 시작을 시뮬레이션하고 작업(Job) ID를 반환.
2. **프롬프트 일괄 배포 (`POST /api/v1/mlops/deploy/prompt`)**: 선택된 VLM 프롬프트를 엣지 NVR로 OTA 배포하는 과정 시뮬레이션.
3. **대규모 장비 설정 동기화 (`POST /api/v1/devices/config/sync`)**: 여러 대의 장비(NVR/카메라)에 환경 설정을 동기화하는 모의 API.

### Frontend Components
#### [MODIFY] `frontend/src/api/client.ts`
- 3가지 신규 엔드포인트를 통신하기 위한 함수 `startLoraTraining`, `deployPrompt`, `syncDeviceConfig` 추가.

#### [MODIFY] `frontend/src/components/LoraFinetuningConsole.tsx`
- **학습 시작 버튼**: `startLoraTraining` 호출 후 로딩 상태 표출 및 응답 결과 Toast 알림 연동.

#### [MODIFY] `frontend/src/components/PromptGatewayDeploy.tsx`
- **배포 실행 버튼**: `deployPrompt` 호출로 프롬프트 배포 시뮬레이션 연동 및 시각적 피드백 제공.

#### [MODIFY] `frontend/src/components/MassDeviceConfigClone.tsx`
- **동기화 실행 버튼**: `syncDeviceConfig` 호출을 통해 설정 복제 작업을 비동기로 처리하고 완료 여부를 알림.

## Verification Plan
1. **LoraFinetuningConsole**: '훈련 강제 시작' 버튼을 누르고 API 요청 후 상태 토글 및 Toast 확인.
2. **PromptGatewayDeploy**: '배포 실행' 버튼 클릭 후 로딩 지연과 성공 알림 확인.
3. **MassDeviceConfigClone**: '구성 복제 실행' 버튼을 눌러 상태 전이 확인.
