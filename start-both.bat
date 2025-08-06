@echo off
echo Starting Unity Assets Marketplace Application...
echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d \"C:\All-Projects\Personal\unity-assets-next-app\unity-assets-backend\" && node dist/src/main.js"

timeout /t 3 >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d \"C:\All-Projects\Personal\unity-assets-next-app\unity-assets-next-app\" && npm run dev"

echo.
echo Both servers are starting...
echo Backend will be available at: http://localhost:3001
echo Frontend will be available at: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul