@echo off
setlocal enabledelayedexpansion
title 24-Urenloop Client Setup

:: ===== CONFIG =====
set SERVER_IP=10.45.228.10
set MY_IP=10.45.228.11
set MASK=255.255.255.0
set GATEWAY=10.45.228.1
set DNS=1.1.1.1
set ADAPTER_NAME=

:: ===== FIND ADAPTER =====
for /f "tokens=2 delims=:" %%A in ('netsh interface show interface ^| findstr /C:"Dedicated"') do (
    set ADAPTER_NAME=%%A
    set ADAPTER_NAME=!ADAPTER_NAME:~1!
    goto found
)
:found
if "%ADAPTER_NAME%"=="" (
    echo [ERROR] No active Ethernet adapter found. Please plug in the cable.
    pause
    exit /b
)

echo Using adapter: %ADAPTER_NAME%

:: ===== ASSIGN STATIC IP =====
echo Setting static IP %MY_IP% on %ADAPTER_NAME% ...
netsh interface ip set address name="%ADAPTER_NAME%" static %MY_IP% %MASK% %GATEWAY%
netsh interface ip set dns name="%ADAPTER_NAME%" static %DNS%

:: ===== OPEN SITE =====
timeout /t 3 >nul
start http://%SERVER_IP%:5173
echo [✓] Connected to server %SERVER_IP%
pause
