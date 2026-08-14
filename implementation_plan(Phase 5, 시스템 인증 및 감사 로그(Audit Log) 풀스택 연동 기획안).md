# Phase 5: 시스템 인증 및 감사 로그(Audit Log) 풀스택 연동 기획안

이제 가장 핵심적인 뷰어(VSS, GIS, 대시보드) 연동이 마무리되었으므로, **시스템의 보안과 유지보수를 담당하는 Phase 5** 단계로 진입합니다.

## 🎯 주요 목표 (Phase 5)
관리자가 시스템에 로그인하여 사용 권한을 얻고, 모든 시스템 사용 이력이 블록체인 개념의 감사 로그(Audit Log)로 남도록 REST API를 구축 및 연동합니다.

---

## 🛠️ 백엔드 (Backend) 개발 계획
1. **DB 모델(`models.py`) 확장**
   - `User` 모델 신설: 관리자/운영자 계정 정보 (username, hashed_password, role)
   - `AuditLog` 모델 신설: 사용자들의 활동 이력(로그인, 검색, 설정 변경 등)을 불변 원장 형태로 저장
   - **(초기화 시 테스트용 계정 자동 생성)**: 서버 시작 시 DB에 `admin` / `admin123!` 계정이 없으면 자동으로 생성하여 로그인 테스트가 가능하게 합니다.

2. **API 라우터 신설 (`ewvlm_fastapi_gateway.py`)**
   - `POST /api/v1/auth/signup`: 신규 운영자 계정 생성 (패스워드 해싱)
   - `POST /api/v1/auth/login`: 로그인 및 JWT 토큰 발급
   - `GET /api/v1/audit/logs`: 감사 로그(Audit Log) 목록 조회 API
   - `POST /api/v1/audit/logs`: 특정 액션 발생 시 프론트엔드에서 로그를 남기기 위한 기록 API

---

## 💻 프론트엔드 (Frontend) 연동 계획
1. **인증 화면 연동 (`Login.tsx`, `Signup.tsx`)**
   - 화면에서 입력한 ID/PW를 `axios`로 백엔드 로그인 API로 전송.
   - 응답받은 JWT 토큰이나 성공 여부를 스토어(Store) 또는 `localStorage`에 저장하여 로그인 상태 관리.

2. **시스템 감사 로그 포털 연동 (`SystemAuditLogPortal.tsx`)**
   - 하드코딩 되어 있는 테이블(Row 1 ~ 5)을 제거하고, `GET /api/v1/audit/logs` API를 호출하여 실제 사용자가 발생시킨 이벤트 내역을 타임라인으로 출력.
   - VSS 시맨틱 서치 시 자동으로 Audit Log 기록 남기기 기능 추가 (누가 언제 어떤 키워드로 검색했는지 기록)

---

## User Review Required
> [!IMPORTANT]
> **인증(JWT) 유지 방식에 대한 결정**
> 현재 데모 단계이므로 복잡한 리프레시 토큰(Refresh Token)이나 보안 쿠키 대신, **가장 빠르고 심플한 LocalStorage + 간단 토큰 검증** 방식으로 진행하고자 합니다. 괜찮으실까요?

## Open Questions
> [!NOTE]
> 1. 관리자(Admin) 권한과 일반(User) 권한을 구분하는 로직을 이번 단계에 바로 포함할까요? 아니면 우선 모든 가입자를 단일 권한으로 처리하여 진행 속도를 높일까요?
> 2. 계획이 마음에 드신다면 **승인(진행해줘)** 부탁드립니다! 즉시 DB 모델부터 수정 시작하겠습니다.
