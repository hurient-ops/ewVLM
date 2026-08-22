@echo off
:: ==============================================================================
:: ewVLM Platform - Windows One-Click Integrated Launcher (.bat)
:: ==============================================================================
:: 이 스크립트는 최상위 ewvlm/ 폴더에서 실행되어 백엔드, 프론트엔드, 브릿지 시뮬레이터까지
:: 3개의 마이크로서비스 터미널을 개별 창으로 분할하여 순차 자동 기동합니다.
:: ==============================================================================

title ewVLM Platform Master Control
color 0B
echo ==============================================================================
echo             ewVLM 지능형 선별관제 플랫폼 통합 원클릭 기동 엔진
echo ==============================================================================
echo.
echo [*] 작업 폴더 기준 경로 설정 완료: %CD%
echo.

:: 1단계: FastAPI 백엔드 서버 기동
echo [1/3단계] FastAPI 백엔드 Gateway 서버를 별도 터미널에서 구동하는 중...
start "ewVLM - Backend API Gateway (Port: 8000)" cmd /k "cd backend && (if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) else if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat)) && python ewvlm_fastapi_gateway.py"

:: 서버 런타임 바인딩 대기 (3초)
timeout /t 3 /nobreak >nul

:: 2단계: React/Vite 프론트엔드 개발 서버 기동
echo [2/4단계] React/Vite 프론트엔드 관제 웹 화면을 구동하는 중...
start "ewVLM - Frontend UI Canvas (Port: 5174)" cmd /k "cd frontend && npm run dev"

:: 화면 빌드 프로세스 수립 대기 (3초)
timeout /t 3 /nobreak >nul

:: 3단계: 초고속 1차 탐지 YOLO11 Fast Loop 구동
echo [3/4단계] YOLO11 다채널 고속 탐지 Fast-Loop 프로세스를 시작합니다...
start "ewVLM - YOLO11 Fast Loop" cmd /k "cd backend && (if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) else if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat)) && python fast_loop.py"

:: 화면 빌드 프로세스 수립 대기 (3초)
timeout /t 3 /nobreak >nul

:: 4단계: 가상 비디오 프레임 LM Studio VLM 브릿지 구동 (테스트용)
echo [4/4단계] 가상 이미지 수송 LM Studio VLM 브릿지 시뮬레이터를 가동하는 중...
start "ewVLM - LM Studio VLM Bridge" cmd /k "cd backend && (if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) else if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat)) && python ewvlm_lmstudio_bridge.py"

echo.
echo ==============================================================================
echo [성공] ewVLM 플랫폼의 3대 핵심 개발 환경이 각각 개별 콘솔 창에서 정상 시작되었습니다!
echo.
echo  - 백엔드 서버   : http://localhost:8000 (API 대기)
echo  - 관제화면 UI   : http://localhost:5173 (웹 브라우저 접속용)
echo  - AI 분석엔진   : Ollama 로컬 VLM (llama3.2-vision 외 3종 통신 중)
echo.
echo 이 창은 닫으셔도 되며, 실행된 3개의 터미널 창을 통해 개별 로그를 모니터링하십시오.
echo ==============================================================================
pause
