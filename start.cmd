@echo off
setlocal

rem Double-click helper: first-time setup plus start everything.
call "%~dp0run.cmd" start %*
set "RC=%ERRORLEVEL%"
echo.
pause
exit /b %RC%
