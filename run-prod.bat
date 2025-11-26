@echo off
setlocal enabledelayedexpansion
set NODE_ENV=production
set HOST=127.0.0.1
set PORT=5000
title Do'kon Platform - Production

echo.
echo ========================================
echo   DO'KON PLATFORM - PRODUCTION MODE
echo ========================================
echo.
echo Starting on http://127.0.0.1:5000
echo Press Ctrl+C to stop
echo.

node dist/index.js
