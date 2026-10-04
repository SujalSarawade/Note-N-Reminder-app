@echo off
echo ========================================================
echo   Launching NoteFlow: React Notes & Reminders App
echo ========================================================
echo.

echo Starting Backend Server on http://localhost:5000 ...
start "NoteFlow Backend" cmd /k "cd server && npm start"

timeout /t 2 /nobreak >nul

echo Starting Frontend React App on http://localhost:5173 ...
start "NoteFlow Frontend" cmd /k "cd client && npm run dev"

echo.
echo NoteFlow is launching! Open your browser at http://localhost:5173
echo ========================================================
