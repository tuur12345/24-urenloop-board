@echo off
setlocal

:: Server IP
set SERVER_IP=10.45.228.10
set MY_IP=10.45.228.11
set MASK=255.255.255.0

:: Set static IP
netsh interface ip set address name="Ethernet" static %MY_IP% %MASK%

:: Open site
start http://%SERVER_IP%:5173

echo Connected to server %SERVER_IP%
pause
