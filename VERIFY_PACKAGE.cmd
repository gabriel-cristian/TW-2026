@echo off
where node >nul 2>nul || (echo STOP  Node.js nu este in PATH. & exit /b 2)
node "%~dp0tools\tw-kit.mjs" verify
exit /b %ERRORLEVEL%
