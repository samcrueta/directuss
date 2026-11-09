@echo off
setlocal

rem Run run.ps1 with PowerShell 7 when available, otherwise Windows PowerShell.
rem -ExecutionPolicy Bypass means no machine-wide policy change is required.

where pwsh >nul 2>nul
if errorlevel 1 goto useWindowsPowerShell

pwsh -NoProfile -ExecutionPolicy Bypass -File "%~dp0run.ps1" %*
exit /b %ERRORLEVEL%

:useWindowsPowerShell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0run.ps1" %*
exit /b %ERRORLEVEL%
