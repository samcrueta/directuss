@echo off
setlocal

rem Double-click helper: stop host services and the Docker stack.
call "%~dp0run.cmd" down %*
set "RC=%ERRORLEVEL%"
echo.
pause
exit /b %RC%
