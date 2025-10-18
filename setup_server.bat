@echo off
setlocal

:: -----------------------------
:: Configuration
:: -----------------------------
set SERVER_IP=10.45.228.10
set MASK=255.255.255.0
set CLIENT_PORT=5173
set SERVER_PORT=3001
set INTERFACE_NAME=Ethernet

:: -----------------------------
:: Set static IP
:: -----------------------------
echo Setting static IP for %INTERFACE_NAME% to %SERVER_IP%
netsh interface ip set address name="%INTERFACE_NAME%" static %SERVER_IP% %MASK%
if %errorlevel% neq 0 (
    echo Failed to set IP. Make sure the interface name is correct and cable is connected.
    pause
    exit /b
)

:: -----------------------------
:: Update client .env
:: -----------------------------
echo Updating client/.env with server IP
echo VITE_SERVER_URL=http://%SERVER_IP%:%SERVER_PORT% > client\.env

:: -----------------------------
:: Install dependencies
:: -----------------------------
echo Installing server dependencies...
start cmd /k "cd server && npm install && npm run start"
start cmd /k "cd client && npm install && npm run dev -- --host 0.0.0.0 --port %CLIENT_PORT%"

:: -----------------------------
:: Open client in default browser
:: -----------------------------
timeout /t 5 /nobreak >nul
start http://%SERVER_IP%:%CLIENT_PORT%

echo Setup complete. Server + Client running.
pause
