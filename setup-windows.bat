@echo off
setlocal enabledelayedexpansion
title Do'kon Platform - Windows Setup

echo.
echo ========================================
echo   DO'KON PLATFORM - WINDOWS SETUP
echo ========================================
echo.

echo [1/3] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo [2/3] Building application...
call npm run build
if errorlevel 1 (
    echo ERROR: npm build failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo To start the application, run:
echo   dev.bat          (Development mode)
echo   run-prod.bat     (Production mode)
echo.
echo Application will run at:
echo   http://127.0.0.1:5000
echo.
echo Admin Panel:
echo   Login: +998990707102
echo   Password: samandar_7102
echo.
pause
