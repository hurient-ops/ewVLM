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

:: Step 0: MediaMTX Streaming Server
echo [0/4] Starting MediaMTX Streaming Server...
start "ewVLM - MediaMTX Video Server (Port: 8889)" cmd /k "cd backend\mediamtx_v1.20.0_windows_amd64 && mediamtx.exe"

timeout /t 3 /nobreak >nul

:: Step 1: FastAPI Backend
echo [1/4] Starting FastAPI Backend Gateway...
start "ewVLM - Backend API Gateway (Port: 8000)" cmd /k "cd backend && (if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) else (if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat))) && python ewvlm_fastapi_gateway.py"

timeout /t 3 /nobreak >nul

:: Step 2: React/Vite Frontend
echo [2/4] Starting React/Vite Frontend UI...
start "ewVLM - Frontend UI Canvas (Port: 5174)" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

:: Step 3: YOLOv11 Fast Loop
echo [3/4] Starting YOLOv11 Fast-Loop...
start "ewVLM - YOLOv11 Fast Loop" cmd /k "cd backend && (if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) else (if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat))) && python fast_loop.py"

timeout /t 3 /nobreak >nul

:: Step 4: Local VLM Standby Bridge (LM Studio / Ollama)
echo [4/4] LM Studio Local VLM Connected
start "ewVLM - Local VLM Bridge (LM Studio)" cmd /k "echo [LOCAL MODE] ewVLM is currently connected to LM Studio on port 1234 for high-performance local AI inference. && cd backend && (if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) else (if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat)))"

echo.
echo ==============================================================================
echo [SUCCESS] ewVLM Platform components have been started!
echo.
echo  - Backend Server : http://localhost:8000
echo  - Frontend UI    : http://localhost:5174
echo  - AI Engine      : Local VLM (LM Studio - qwen2-vl-7b-instruct)
echo.
echo You can close this window.
echo ==============================================================================
pause
