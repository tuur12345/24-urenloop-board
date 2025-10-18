@echo off
setlocal enabledelayedexpansion
title 24-Urenloop Server Setup

:: ===== CONFIG =====
set IP=10.45.228.10
set MASK=255.255.255.0
set GATEWAY=10.45.228.1
set DNS=1.1.1.1
set ADAPTER_NAME=

:: ===== FIND ADAPTER AUTOMATICALLY =====
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
echo Setting static IP %IP% on %ADAPTER_NAME% ...
netsh interface ip set address name="%ADAPTER_NAME%" static %IP% %MASK% %GATEWAY%
netsh interface ip set dns name="%ADAPTER_NAME%" static %DNS%

:: ===== CHECK NODE INSTALL =====
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js LTS first.
    pause
    exit /b
)

:: ===== WRITE ENV FILE =====
echo VITE_SERVER_URL=http://%IP%:3001 > client/.env

:: ===== INSTALL DEPENDENCIES =====
echo Installing dependencies...
start cmd /k "cd server && npm install && npm run start"
start cmd /k "cd client && npm install && npm run dev -- --host 0.0.0.0"

:: ===== OPEN SITE =====
timeout /t 5 >nul
start http://%IP%:5173

echo [✓] Server running at http://%IP%:5173
pause
