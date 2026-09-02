@echo off
:: ==============================================================================
:: ewVLM Platform - Windows One-Click Integrated Launcher (.bat)
:: ==============================================================================
:: Starts Backend, Frontend, and Fast-Loop microservices in separate windows.
:: ==============================================================================

title ewVLM Platform Master Control
color 0B
echo ==============================================================================
echo             ewVLM Integrated Startup Engine
echo ==============================================================================
echo.
echo [*] Working directory: %CD%
echo.

:: Step 1: FastAPI Backend
echo [1/4] Starting FastAPI Backend Gateway...
start "ewVLM - Backend API Gateway (Port: 8000)" cmd /k "cd backend && (if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) else (if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat))) && python ewvlm_fastapi_gateway.py"

timeout /t 3 /nobreak >nul

:: Step 2: React/Vite Frontend
echo [2/4] Starting React/Vite Frontend UI...
start "ewVLM - Frontend UI Canvas (Port: 5174)" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

:: Step 3: YOLO11 Fast Loop
echo [3/4] Starting YOLO11 Fast-Loop...
start "ewVLM - YOLO11 Fast Loop" cmd /k "cd backend && (if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) else (if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat))) && python fast_loop.py"

timeout /t 3 /nobreak >nul

:: Step 4: LM Studio VLM Bridge
echo [4/4] Starting LM Studio VLM Bridge...
start "ewVLM - LM Studio VLM Bridge" cmd /k "cd backend && (if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) else (if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat))) && python ewvlm_lmstudio_bridge.py"

echo.
echo ==============================================================================
echo [SUCCESS] ewVLM Platform components have been started!
echo.
echo  - Backend Server : http://localhost:8000
echo  - Frontend UI    : http://localhost:5174
echo  - AI Engine      : Ollama Local VLM
echo.
echo You can close this window.
echo ==============================================================================
pause
