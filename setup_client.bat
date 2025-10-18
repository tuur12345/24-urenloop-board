@echo off
setlocal

:: Define IP
set IP=10.45.228.10
set MASK=255.255.255.0

:: Set static IP (replace "Ethernet" if your adapter has another name)
netsh interface ip set address name="Ethernet" static %IP% %MASK%

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo Node.js not found. Please install Node.js LTS first.
  pause
  exit /b
)

:: Update client/.env
echo VITE_SERVER_URL=http://%IP%:3001 > client/.env

:: Start server + client
start cmd /k "cd server && npm install && npm run start"
start cmd /k "cd client && npm install && npm run dev -- --host %IP%"

echo Server running at http://%IP%:5173

:: Open site
start http://%SERVER_IP%:5173
pause
