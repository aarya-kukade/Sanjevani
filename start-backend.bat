@echo off
REM Sanjivani Backend Server Startup Script (Windows)
REM This script starts the Express backend server for the contact form

echo.
echo ============================================================
echo  Sanjivani Backend Server Startup
echo ============================================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if .env file exists
if not exist ".env" (
    echo.
    echo WARNING: .env file not found!
    echo.
    echo Please create a .env file from .env.example:
    echo 1. Rename .env.example to .env
    echo 2. Add your Gmail App Password to EMAIL_PASSWORD
    echo 3. Run this script again
    echo.
    pause
    exit /b
)

REM Start the server
echo Starting Express server on port 5000...
echo.
call npm start
pause
