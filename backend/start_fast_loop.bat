@echo off
title ewVLM - YOLOv11 Fast Loop
cd /d "%~dp0"

if exist "C:\Users\COMPANY\AppData\Local\Programs\Python\Python313\python.exe" (
    set "PATH=C:\Users\COMPANY\AppData\Local\Programs\Python\Python313;C:\Users\COMPANY\AppData\Local\Programs\Python\Python313\Scripts;%PATH%"
)

echo [*] Starting YOLOv11 Fast-Loop...
python fast_loop.py
pause
