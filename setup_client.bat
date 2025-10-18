@echo off
setlocal

:: -----------------------------
:: Configuration
:: -----------------------------
set SERVER_IP=10.45.228.10
set MY_IP=10.45.228.11
set MASK=255.255.255.0
set CLIENT_PORT=5173
set INTERFACE_NAME=Ethernet

:: -----------------------------
:: Set static IP
:: -----------------------------
echo Setting static IP for %INTERFACE_NAME% to %MY_IP%
netsh interface ip set address name="%INTERFACE_NAME%" static %MY_IP% %MASK%
if %errorlevel% neq 0 (
    echo Failed to set IP. Make sure the interface name is correct and cable is connected.
    pause
    exit /b
)

:: -----------------------------
:: Open client in default browser
:: -----------------------------
timeout /t 5 /nobreak >nul
start http://%SERVER_IP%:%CLIENT_PORT%

echo Setup complete. Client running.
pause
