# Phase 20: MLOps 및 AI 모델 파이프라인 백엔드 연동 계획

**목표**: `LoraFinetuningConsole`, `PromptGatewayDeploy`, `NaturalLanguageRuleCopilot` 3개의 MLOps 관련 프론트엔드 컴포넌트를 가짜(Mock) 데이터 구조에서 벗어나 실제 DB와 로직으로 연동합니다.

---

## 1. 신규 데이터베이스 모델 추가 (`models.py`)

작업 내역을 영구적으로 저장하기 위해 다음 3개의 DB 테이블을 생성합니다.

### [NEW] `MLOpsJob` (LoRA 파인튜닝 작업 관리)
- `id` (Integer, PK)
- `job_type` (String, e.g., 'LORA_FINETUNE')
- `target_model` (String)
- `status` (String, e.g., 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED')
- `created_at` (DateTime)
- `completed_at` (DateTime, Nullable)

### [NEW] `PromptDeployment` (프롬프트 배포 이력 관리)
- `id` (Integer, PK)
- `target_edge_id` (String)
- `action_type` (String, e.g., 'UPDATE_SYSTEM_PROMPT')
- `status` (String)
- `deployed_at` (DateTime)

### [NEW] `SOPRule` (자연어 규칙 생성 저장소)
- `id` (Integer, PK)
- `rule_name` (String)
- `natural_language_prompt` (String)
- `target_object` (String)
- `confidence_threshold` (Float)
- `created_at` (DateTime)

---

## 2. 데이터 접근 계층 구현 (`crud.py`)

새로운 모델에 대한 삽입/조회 로직을 작성합니다.

- `create_mlops_job(db, job_type, target_model)`: 파인튜닝 작업 시작 시 DB에 레코드 생성
- `update_mlops_job_status(db, job_id, status)`: 학습 진행 상태 업데이트 (가상 백그라운드 태스크 연동)
- `create_prompt_deployment(db, target, action)`: 프롬프트 배포 이력 저장
- `create_sop_rule(db, rule_data)`: 생성된 룰셋을 DB에 보관

---

## 3. 백엔드 API 연동 (`ewvlm_fastapi_gateway.py`)

기존에 `asyncio.sleep`으로만 대기하던 API를 실제 DB CRUD 및 백그라운드 태스크(BackgroundTasks)로 전환합니다.

- **`POST /api/v1/mlops/train/lora`**
  - DB에 `MLOpsJob` 레코드를 생성하고 'PENDING' 상태로 응답을 즉시 반환.
  - `FastAPI BackgroundTasks`를 통해 5~10초 뒤 상태를 'COMPLETED'로 변경하는 백그라운드 시뮬레이션 적용.
- **`POST /api/v1/mlops/deploy/prompt`**
  - DB에 `PromptDeployment` 레코드 생성 후 성공 응답 반환.
- **`POST /api/v1/sop/rules/generate`**
  - 사용자가 입력한 자연어(NL)를 Python 내에서 간단한 키워드 추출기(Keyword Extractor) 알고리즘으로 분석.
  - "사람", "자동차", "침입" 등의 단어를 파싱하여 실제 `SOPRule` 레코드를 생성하고 반환.

---

## 4. 검증 계획

- **Swagger/Docs 확인**: `http://localhost:8000/docs`에서 신규 API 스키마 정상 적용 여부 확인
- **프론트엔드 연동 테스트**:
  - `LoraFinetuningConsole`에서 훈련을 시작하고, 터미널 로그 및 DB(SQLite)에 작업이 INSERT 되는지 확인
  - `NaturalLanguageRuleCopilot`에서 "주차장에 차가 들어오면 알려줘"라고 텍스트를 쳤을 때, `target_object: "vehicle"`로 정상 파싱되어 응답이 오는지 검증

> [!NOTE]
> 위 계획에 동의하시면 **승인(Proceed)** 버튼을 눌러주세요. 즉시 `models.py`, `crud.py`, `ewvlm_fastapi_gateway.py` 수정 및 연동 작업을 시작하겠습니다!
