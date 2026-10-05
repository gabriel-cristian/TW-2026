@echo off
where node >nul 2>nul || (echo STOP  Node.js is not on PATH. & exit /b 2)
node "%~dp0tools\tw-kit.mjs" test p1 all
exit /b %ERRORLEVEL%
