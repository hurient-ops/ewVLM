# B2B 엔터프라이즈 기능 확장 구현 계획

요청하신 데스크톱 앱화, 로그인/회원가입 기능, 라우팅 보호, 그리고 관리자용 권한 관리 화면에 대한 통합 구현 계획입니다. 사용자님의 승인이 완료되면 즉시 작업을 시작하겠습니다.

## 1. 데스크톱 앱화 (Electron 통합)
현재 Vite/React 웹 프로젝트를 독립된 데스크톱 애플리케이션으로 구동할 수 있도록 Electron을 연동합니다.
* **패키지 설치**: `electron`, `concurrently`, `wait-on` 등 필수 패키지 설치
* **Electron 설정**: `electron/main.js` 파일을 생성하여 데스크톱 윈도우 생성 로직 구성
* **스크립트 추가**: `package.json`에 `npm run electron:dev` 명령어를 추가하여 Vite 서버와 Electron 데스크톱 앱이 동시에 켜지도록 구성

## 2. 상태 관리 및 라우팅 보호 (Auth & Routing)
인증받지 않은 사용자의 내부 시스템 접근을 원천 차단합니다.
* **`useAuthStore.ts` 생성**: 로그인 상태(`isAuthenticated`), 사용자 정보(`user`), JWT 토큰을 전역 관리
* **`ProtectedRoute.tsx` 컴포넌트**: 라우팅 진입 시 `useAuthStore`를 확인하여 비로그인 시 강제로 `/login`으로 리다이렉트
* **`App.tsx` 라우팅 개편**: 전체 페이지를 보호된 라우트로 감싸고, `/login`, `/signup`만 예외(Guest) 라우트로 분리

## 3. 로그인 및 회원가입 화면 (Dark Theme UI)
ewVLM 브랜드 톤앤매너에 맞춘 다크 테마 기반의 독립된 Full-Screen 레이아웃을 제공합니다.
* **`GuestLayout.tsx`**: 사이드바와 헤더가 없는 중앙 정렬된 다크 네이비(`#0f172a`) 배경 레이아웃
* **`Login.tsx`**: 아이디/비밀번호 입력 폼 및 로그인 성공 시 `/monitor-a`로 즉시 이동
* **`Signup.tsx`**: 신규 사용자 가입 폼 및 백엔드 연동

## 4. 관리자용 사용자 권한 관리 화면 (Admin Dashboard)
회원가입한 사용자들의 권한(admin, operator, user)을 조회하고 변경합니다.
* **백엔드 API 추가 (`ewvlm_fastapi_gateway.py`)**: 
  - `GET /api/v1/users`: 가입된 전체 사용자 목록 조회
  - `PUT /api/v1/users/{id}/role`: 특정 사용자의 권한 업데이트
* **프론트엔드 UI (`SecurityAdminPortal.tsx`)**: 
  - 기존에 자리만 잡아둔 `/camera-security` 라우트를 **보안 관리자 포탈**로 개편
  - 전체 사용자 목록(DataGrid 테이블 형태)을 띄우고, 본인이 `admin`일 경우 타 유저의 권한을 Select 박스로 변경 및 저장 가능하도록 구현

---

> [!IMPORTANT]
> **검토 요청**
> 위의 기획 내용이 사용자님이 구상하신 그림과 일치하는지 확인해 주세요. **승인해 주시면 즉시 Electron 설치부터 UI/API 구현까지 한 번에 진행하겠습니다!**
