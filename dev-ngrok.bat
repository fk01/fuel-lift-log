@echo off
rem Local test: run the Worker with wrangler dev (local D1) and expose it through ngrok.
setlocal
cd /d "%~dp0"
set PORT=8787
rem ngrok.exe + ngrok.yml (holds the authtoken) live outside the repo
set NGROK_DIR=%~dp0..\ngrok
set NGROK="%NGROK_DIR%\ngrok.exe"

if not exist %NGROK% ( echo [x] ngrok.exe not found in %NGROK_DIR% & pause & exit /b 1 )
where npm >nul 2>nul || ( echo [x] Node.js/npm not found. & pause & exit /b 1 )

if not exist node_modules (
  echo [*] npm install...
  call npm install || ( pause & exit /b 1 )
)
if not exist .dev.vars (
  echo [*] .dev.vars missing - copying .dev.vars.example
  copy .dev.vars.example .dev.vars >nul
)

echo [*] Starting wrangler dev on port %PORT% (new window)...
start "fuel-lift-log wrangler" cmd /k npx wrangler dev --local --port %PORT%

echo [*] Waiting for the server...
:wait
timeout /t 2 /nobreak >nul
powershell -NoProfile -Command "try{Invoke-WebRequest http://localhost:%PORT%/ -UseBasicParsing -TimeoutSec 2 | Out-Null; exit 0}catch{exit 1}" || goto wait

echo [*] Starting ngrok - open the https://....ngrok-free.app URL shown below
%NGROK% http %PORT% --config "%NGROK_DIR%\ngrok.yml"
