@echo off
echo Installing dependencies (if needed)...
npm install
echo Starting Vite dev server...
start cmd /k "npm run dev"
timeout /t 2 >nul
start "" "http://localhost:5173"
