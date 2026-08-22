# 카메라 목록 조회 및 그룹 관리 기능 구현

사용자가 등록된 카메라의 전체 목록을 조회하고, 논리적인 그룹(폴더) 단위로 관리하며, 기존 정보를 쉽게 수정할 수 있도록 새로운 화면과 전역 상태 관리 로직을 추가합니다.

## User Review Required

> [!IMPORTANT]
> - 신규 컴포넌트(`CameraListManager.tsx`)의 디자인 템플릿은 현재 시스템의 'Settings' 테마(다크 그레이, 표 형태)를 따릅니다.
> - 드래그 앤 드롭 대신, 초기 버전에서는 **그룹 선택 드롭다운**을 통해 소속 그룹을 변경하는 방식을 제안합니다. (가장 안정적이고 직관적입니다.) 드래그 앤 드롭이 필수라면 알려주세요.
> - 카메라 정보를 수정할 때, 별도의 화면으로 이동하지 않고 리스트 우측에 **사이드 패널(Side Panel)** 형태로 설정창을 띄워 빠르게 수정할 수 있도록 구성하려고 합니다. 동의하시나요?

## Proposed Changes

---

### 상태 관리 (Zustand)

#### [NEW] `frontend/src/store/useCameraStore.ts`
- 카메라 목록(ID, 이름, IP, 상태, VLM 활성화 여부, 그룹ID) 데이터를 저장합니다.
- 카메라 그룹(폴더) 데이터를 저장합니다.
- 액션 함수: `updateCamera`, `deleteCamera`, `changeGroup`

---

### 프론트엔드 UI 컴포넌트

#### [NEW] `frontend/src/components/CameraListManager.tsx`
- **좌측 패널**: 그룹(폴더) 목록 표시 및 선택
- **우측 패널**: 선택된 그룹에 속한 카메라 데이터 그리드 (표 형태)
- 표의 행(Row)을 클릭하면 해당 카메라의 상세 정보(IP 주소, 스트리밍 해상도 등)를 우측에서 슬라이드 오버 패널로 열어 수정할 수 있는 폼 제공

#### [MODIFY] `frontend/src/App.tsx`
- 신규 라우트 추가: `<Route path="/camera-list" element={<CameraListManager />} />`

#### [MODIFY] `frontend/src/layouts/BaseLayout.tsx`
- 우측 상단 톱니바퀴(설정) 드롭다운 메뉴에 **[카메라 목록 및 그룹 관리]** 이동 버튼 추가

## Verification Plan

### Manual Verification
1. 설정 아이콘에서 신규 메뉴 클릭 시 리스트 화면 정상 이동 여부 확인
2. 좌측 패널에서 그룹 클릭 시 우측 표 필터링 확인
3. 표에서 카메라 정보 변경 시(Zustand 상태 업데이트) 즉시 반영되는지 확인
4. 기존 `CameraSetupConfig` 설정 포맷과 이질감 없이 연동되는지 UI 렌더링 확인
