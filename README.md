# NoteFlow - Notes & Reminders Web Application

A full-stack React web application where users can register/login, manage personal notes with full CRUD (Create, Read, Update, Delete, Pin, Search, Categorize, Color themes), and schedule smart reminders with in-app audio chimes and alerts.

---

## Features

### 1. Authentication & Security
- **Registration & Login**: Secure account creation with username, email, and password.
- **Password Hashing**: Passwords secured using `bcryptjs`.
- **JWT Authentication**: Token-based authentication with automatic session recovery and session timeout handling.

### 2. Notes Management (CRUD + Customization)
- **Create**: Write notes with custom title, content, category, color themes, and pin status.
- **Read & Search**: Instant keyword search (across title and body), category filters, and pinned note grouping.
- **Update**: Edit notes with live word/char counters, keyboard shortcut (`Ctrl+S`), and color picker.
- **Delete**: Remove notes with confirmation safeguards.
- **Colors & Organization**: Organize notes across categories (*General, Work, Personal, Ideas, Study, To-Do*) and 6 color themes.

### 3. Smart Reminders System
- **Schedule**: Set date & time with quick shortcuts (+10m, +1h, Tomorrow).
- **Priorities**: Assign Low, Medium, or High (Urgent) priority levels.
- **Note Linking**: Connect any reminder directly to an existing note.
- **Live Alerts**: In-app popups, audible notification chime (via Web Audio API), and browser notifications when reminders are due.
- **Completion Tracking**: Mark reminders as completed or pending, filter by status, and track relative countdowns (e.g. "in 15m", "2h overdue").

---

## Project Structure

```
notes-reminder-app/
├── server/                    # Node.js Express Backend
│   ├── db.js                 # SQLite database connection & schema
│   ├── middleware/auth.js    # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js           # /api/auth (register, login, me)
│   │   ├── notes.js          # /api/notes (CRUD, pin, search)
│   │   └── reminders.js      # /api/reminders (CRUD, toggle)
│   ├── server.js             # Main server entry point (Port 5000)
│   ├── verify-backend.js     # Automated API test suite
│   └── test-runner.js        # Test runner script
│
├── client/                    # React Frontend (Vite)
│   ├── src/
│   │   ├── components/       # NoteCard, NoteEditorModal, ReminderModal, ReminderList, NotificationBanner, Sidebar, Navbar
│   │   ├── context/          # AuthContext (state & session management)
│   │   ├── pages/            # Login, Register, Dashboard
│   │   ├── api.js            # API client service with Bearer token
│   │   ├── index.css         # Responsive modern dark theme styling
│   │   ├── App.jsx           # Root router
│   │   └── main.jsx          # React entry point
│   ├── vite.config.js        # Vite config with /api proxy
│   └── package.json
│
├── package.json              # Root project scripts
└── start.bat                 # One-click Windows launcher
```

---

## How to Run

### Quick Launch (Windows)
Double-click `start.bat` in the project root directory.

### Or Run Manually:

#### 1. Start Backend:
```bash
cd server
npm start
```
Server runs at `http://localhost:5000`.

#### 2. Start Frontend:
```bash
cd client
npm run dev
```
Open your browser at `http://localhost:5173`.
