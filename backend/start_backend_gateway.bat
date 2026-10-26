@echo off
title ewVLM - Backend API Gateway (Port: 8000)
cd /d "%~dp0"

if exist "C:\Users\COMPANY\AppData\Local\Programs\Python\Python313\python.exe" (
    set "PATH=C:\Users\COMPANY\AppData\Local\Programs\Python\Python313;C:\Users\COMPANY\AppData\Local\Programs\Python\Python313\Scripts;%PATH%"
)

echo [*] Starting FastAPI Gateway...
python -m uvicorn ewvlm_fastapi_gateway:app --host 0.0.0.0 --port 8000 --reload
pause
