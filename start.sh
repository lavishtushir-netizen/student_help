#!/bin/bash
export PATH="$HOME/.nodejs/bin:$PATH"
echo "Cleaning up any old processes on ports 3000 and 5001..."
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
lsof -ti :5001 | xargs kill -9 2>/dev/null || true
sleep 1
echo "Starting CampusCare AI (Express Server on 5001 + Vite Frontend on 3000)..."
npm run dev
