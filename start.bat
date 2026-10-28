@echo off
chcp 65001 >nul
title 史蒂夫的方块小屋 · Minecraft Block House
echo ======================================================
echo   🎮 正在启动我的世界方块小屋本地服务器...
echo ======================================================
start "" "http://localhost:8000"
node server.js
pause
