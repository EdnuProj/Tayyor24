@echo off
setlocal enabledelayedexpansion
set NODE_ENV=development
set HOST=127.0.0.1
set PORT=5000
title Do'kon Platform - Development

echo.
echo ========================================
echo   DO'KON PLATFORM - DEVELOPMENT MODE
echo ========================================
echo.
echo Starting on http://127.0.0.1:5000
echo Press Ctrl+C to stop
echo.

npx tsx server/index-dev.ts
