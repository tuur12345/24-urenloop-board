@echo off
setlocal

:: === Configuration ===
set IP=10.45.228.10
set MASK=255.255.255.0
set REDIS_HOST=127.0.0.1
set REDIS_PORT=6379

:: === Set static IP ===
netsh interface ip set address name="Ethernet" static %IP% %MASK%

:: === Check Node.js ===
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not found. Please install Node.js LTS first.
    pause
    exit /b
)

:: === Check Redis ===
powershell -Command "try { $tcp = Test-NetConnection -ComputerName %REDIS_HOST% -Port %REDIS_PORT%; if (-not $tcp.TcpTestSucceeded) { exit 1 } } catch { exit 1 }"
if %errorlevel% neq 0 (
    echo Redis is not running on %REDIS_HOST%:%REDIS_PORT%. Please start Redis before continuing.
    pause
    exit /b
)

:: === Update client/.env ===
echo VITE_SERVER_URL=http://%IP%:3001 > client/.env

:: === Start server + client ===
start cmd /k "cd server && npm install && npm run start"
start cmd /k "cd client && npm install && npm run dev -- --host 0.0.0.0"

:: === Open site in browser ===
start http://%IP%:5173

pause
