# Phase 4: 시스템 보안 통제 및 멀티사이트(RBAC) UI 완성

Phase 4에서는 전체 VMS 시스템의 접근을 통제하고 사용자 권한을 관리하며, 시스템 감사 로그(Audit Log)를 조회하는 보안 통제 레이어 구현을 목표로 합니다.
다중 사이트(Multi-Site)를 위한 RBAC(Role-Based Access Control) 권한 제어와 변경 불가능한(Immutable) 감사 로그 연동을 프론트엔드와 백엔드 간에 완벽히 연결합니다.

## User Review Required
> [!NOTE]
> 본 작업은 Phase 1에서 생성해 둔 프론트엔드 컴포넌트(`MultiSiteAuthMatrix`, `SystemAuditLogPortal` 등)와 기존에 준비되어 있는 FastAPI 백엔드 엔드포인트(`/api/v1/users`, `/api/v1/audit/logs`)를 **실시간 API로 연결**하는 통신 통합 작업입니다.

## Proposed Changes

### 프론트엔드 API 계층
---
#### [MODIFY] [client.ts](file:///e:/projects/ewVLM/frontend/src/api/client.ts)
- 백엔드와 통신하기 위한 보안 관리 API를 추가합니다.
- `getUsers()`: 전체 사용자 목록 및 권한 정보 조회
- `updateUserRole(userId: number, role: string)`: 특정 사용자의 RBAC 권한(Role) 변경 (예: Viewer -> Security Admin)
- `getAuditLogs(limit: number)`: 시스템 감사 로그 목록 조회

### 보안 통제 UI 연동
---
#### [MODIFY] [MultiSiteAuthMatrix.tsx](file:///e:/projects/ewVLM/frontend/src/components/MultiSiteAuthMatrix.tsx)
- 현재 하드코딩된 사용자 목록을 `getUsers()` API 호출로 대체하여 실시간 데이터를 렌더링합니다.
- "역할(Role)" 셀렉트 박스를 변경하고 **[설정 저장]**을 누르거나, 즉시 `updateUserRole()` API를 호출하여 백엔드 DB에 권한 변경 사항이 실시간으로 저장되도록 연동합니다.

#### [MODIFY] [AuditLogTable.tsx](file:///e:/projects/ewVLM/frontend/src/components/audit/AuditLogTable.tsx)
- 하드코딩된 감사 로그 배열을 `getAuditLogs()` API 호출로 교체합니다.
- 로딩 스피너 및 에러 핸들링 상태를 추가하여 실제 트랜잭션 해시(TX Hash)가 포함된 로그를 표출합니다.

## Verification Plan
1. **Multi-Site Auth Matrix 화면**: 
   - [ ] 실제 백엔드 사용자 목록이 로드되는지 확인합니다.
   - [ ] 사용자(예: Alex Chen)의 권한을 'Security Admin'에서 'System Admin'으로 변경 시 API 요청이 성공하며 즉각 반영되는지 테스트합니다.
2. **System Audit Log 화면**:
   - [ ] 최근 변경한 설정 내역, 사용자 로그인 이력 등의 백엔드 감사 로그 리스트가 표에 성공적으로 그려지는지 확인합니다.
