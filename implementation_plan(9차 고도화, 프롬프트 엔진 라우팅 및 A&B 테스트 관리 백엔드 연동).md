# 9차 고도화: 프롬프트 엔진 라우팅 및 A/B 테스트 관리 백엔드 연동

프론트엔드의 `PromptGatewayDeploy.tsx`에서 배포한 프롬프트 설정이 실제 VLM 추론 워커(`vlm_task_worker`)에 동적으로 주입(Routing)되도록 전체 파이프라인을 연결하는 9차 개선안입니다.

## User Review Required
> [!IMPORTANT]
> 기존에는 `ewvlm_fastapi_gateway.py` 내부 워커에 `prompt = f"""[System] 당신은 산업 안전..."""` 형태로 하드코딩되어 있었습니다. 이를 DB 연동으로 변경하여, 배포된 최신 템플릿을 읽어오도록 아키텍처를 변경합니다. SQLite 특성상 실시간 조회 부하가 있을 수 있으나, Edge 관제 환경에서는 충분한 수준(또는 향후 인메모리 캐시 도입)으로 가정합니다.

## Proposed Changes

---

### Database Layer

#### [MODIFY] `backend/models.py` & `backend/crud.py`
1. **`PromptDeployment` 모델 확장**
   - 기존 모델에 `payload_json` (Text) 또는 `system_prompt`, `user_prompt` 컬럼을 추가하여, 배포된 템플릿의 세부 내용을 저장할 수 있도록 스키마를 확장합니다.
2. **`crud.get_active_prompt` 함수 신설**
   - 특정 `target_edge_id` (또는 기본값 'all-edges')에 대해 가장 최근(`deployed_at` DESC)에 성공적으로 배포된 프롬프트 레코드를 가져오는 함수를 구현합니다.

---

### Backend (Gateway & Inference)

#### [MODIFY] `backend/ewvlm_fastapi_gateway.py`
1. **`deploy_prompt_gateway` 엔드포인트 수정**
   - 클라이언트로부터 `target`뿐만 아니라 `payload` (JSON 템플릿 내용)를 함께 전달받아 DB에 기록하도록 스키마(`MLOpsActionRequest` 확장)와 로직을 수정합니다.
2. **`vlm_task_worker` (VLM 추론 워커) 동적 프롬프트 주입**
   - 매 프레임 분석 직전(또는 주기적으로 캐싱하여), `crud.get_active_prompt`를 호출해 현재 활성화된 프롬프트를 가져옵니다.
   - DB에 배포된 프롬프트가 있으면 해당 `system_prompt` 및 `user_prompt`를 조합하여 VLM에게 전달하고, 없으면 기존의 하드코딩된 기본(Fallback) 프롬프트를 사용합니다.

---

### Frontend

#### [MODIFY] `frontend/src/api/client.ts`
1. **`deployPrompt` 시그니처 변경**
   - `target` 외에 `payload` 객체를 POST Body로 전송하도록 인터페이스를 업데이트합니다.

#### [MODIFY] `frontend/src/components/PromptGatewayDeploy.tsx`
1. **프롬프트 템플릿 선택 및 상태 관리**
   - 하드코딩된 3개의 프롬프트 카드(외곽 침입, 군중 밀집, 차량 배회)를 클릭 가능하게 만들고, 선택된 프롬프트에 따라 우측 JSON 에디터 내용이 동적으로 변경되도록 React 상태(`selectedPrompt`)를 도입합니다.
2. **배포 연동**
   - [배포 실행] 버튼 클릭 시, 현재 선택된 템플릿의 JSON 데이터를 `API.deployPrompt`를 통해 백엔드로 전송합니다.

---

## Verification Plan

### 수동 검증 (Manual Verification)
1. 프론트엔드 좌측 메뉴에서 **[Prompt 배포]** 화면으로 진입합니다.
2. 좌측 3개의 카드 중 '군중 밀집 알림'이나 '차량 배회'를 클릭하여 우측 에디터의 JSON이 변경되는지 확인합니다.
3. 대상 엣지 박스를 선택하고 **[배포 실행]**을 누릅니다.
4. 백엔드 로그창에 `Deploying prompts...` 및 VLM 추론 시 해당 프롬프트가 주입되어 `[System]` 메시지로 시작하는 VLM 요청이 나가는지 확인합니다.
