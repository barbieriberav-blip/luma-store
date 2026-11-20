@echo off
cd /d "%~dp0"
echo LUMA STORE - Modo Spark (sin Blaze)
if not exist node_modules (call npm.cmd install)
if errorlevel 1 (echo Error instalando dependencias. & pause & exit /b 1)
call npm.cmd start
pause
