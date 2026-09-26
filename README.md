# Student Help – An All-in-One Smart Campus Platform 🎓🛡️

![Student Help Logo](logo.png)

> **Student Help** is an all-in-one smart campus platform that seamlessly unites **Campus Safety & Live Safe Routing**, **QueueLess Virtual Queue System**, **StudyPulse AI**, and **Student Expense Tracker** into a single startup-grade MVP. Designed for high-impact hackathon demos and production campus deployments.

---

## 🌟 Key Highlights & Features

### 🛡️ Module 1: Campus Safety & Live Interactive Map
- **11 Incident Types**: Medical Emergency, Fire, Ragging, Fight, Electrical Issue, Water Leakage, Broken Street Light, Lift Failure, Suspicious Activity, Lost & Found, and Security Issue.
- **AI Incident Prioritization**: Classifies incidents into **Critical**, **High**, **Medium**, or **Low** priority, predicts target response times (e.g. 3–5 min for Fire), and assigns designated responder squads.
- **Duplicate Incident Detection & Merging**: Automatically clusters reports from the same campus zone within a 3-hour window, increases urgency dynamically, and tracks total reporting students (e.g., *"8 students have reported this issue"*).
- **Interactive Leaflet Campus Map**: Visualizes 17 campus landmarks (Hostels, Academic Blocks A–D, Central Library, Campus Hospital, Food Courts, Sports Complex, ATM, Bus Stop).
- **Nearest Incident & Safe Route Visualizer**: Automatically computes distance to the closest hazard, identifies dangerous corridors, and draws an AI-suggested detour polyline on the map bypassing danger zones.
- **Emergency SOS & Helplines**: 1-click panic SOS broadcasting live GPS coordinates, direct-dial buttons to Campus Security and Hospital Dispensary, and GPS location sharing.

### ⏱️ Module 2: QueueLess Virtual Queue System
- **Supported Locations**: Central Food Court (Canteen), Campus Health Center (Hospital), Central Library Help Desk, Student Welfare Office, South Campus Cafeteria, Tech Printing Shop.
- **Digital Token & QR Code**: Books appointments for specific time slots and party sizes, issuing formatted tokens (e.g. `CAN-142`) with high-resolution scannable QR codes.
- **Live Waiting Counter**: Real-time position tracking showing your token, serving token, people ahead, and dynamic wait time.
- **QR Check-In Scanner Simulation**: Student or desk attendant scans arrival, verifying attendance and enforcing auto-skip for no-shows after a configurable 5-minute grace period.
- **Queue Analytics**: Hour-by-hour campus traffic heatmaps, average service wait times, and daily footfall metrics.

### 📖 Module 3: StudyPulse AI
- **Syllabus Topic Extraction (OCR)**: Upload course syllabus in PDF, DOCX, or Image format to automatically extract modules and generate personalized timetables.
- **AI Study Planner**: Hourly daily timetable with Pomodoro break intervals, weekly milestones, and subject-wise time allocations.
- **Upcoming Exam Countdown**: Days remaining countdown timers, course codes, venues, and unit preparation progress bars.
- **AI Spaced Repetition Revision Scheduler**: Automatically schedules 1st Revision (Day 1), 2nd Revision (Day 4), and Final Revision (Day 10) for maximum retention.
- **AI Weak Subject Prediction**: Evaluates quiz performance, completed tasks, and streak consistency to diagnose strong vs. weak subjects with actionable study prompts.

### 💳 Module 4: Student Expense Tracker
- **Expense Logging**: Record spending in ₹ across 9 campus categories: Food, Books, Transport, Stationery, Recharge, Shopping, Entertainment, Hostel, and Other.
- **Monthly Budget Overview**: Customizable allowance (e.g. ₹8,000), total spent, remaining safe balance, and daily spending velocity.
- **Dynamic Budget Progress Ring**: Visual SVG ring shifting colors (Green < 50%, Amber 50–80%, Red ≥ 80%).
- **Budget Threshold Alerts**: Proactive alert banners triggered at 50%, 80%, and 100% budget thresholds.
- **AI Financial Insights**: Automated spending analytics (e.g., *"You spent ₹2,100 on Food this month (38%)"*, *"At your daily rate of ₹180, you will exceed your budget in 6 days"*).
- **Expense History**: Full search, category filter, date/amount sorting, inline edit, and delete.

### 🤖 Multi-Modal AI Campus Assistant
- Context-aware chatbot embedded in the dashboard.
- Queries live platform state to answer questions like:
  - *"Where is the nearest canteen and how long is the line?"*
  - *"Is there any emergency near my hostel right now?"*
  - *"What should I study today for my upcoming exam?"*
  - *"How much did I spend on books this month?"*
- Powered by **Google Gemini API** (`gemini-1.5-flash`) with an intelligent local heuristic engine when offline.

### 👑 Admin Incident Command Portal
- **Role-Gated Access**: Dedicated control center for Campus Security and Staff.
- **Incident Triage & Status Workflow**: Update status (`Reported` $\rightarrow$ `Investigating` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved`) and assign dispatch responders.
- **Queue Counter Controller**: 1-click "Call Next Token" button to advance service counters in real-time.
- **Campus Emergency Broadcast System**: Pushes live audio-visual emergency banners across all active student screens via Socket.io.
- **CSV Data Export**: One-click download of all incident reports and queue logs in CSV format.

---

## 📁 Single-Folder Architecture

Every frontend and backend file lives in this single root folder:

```
campus-care-ai/
│── index.html              # HTML5 shell with Google Fonts & Leaflet CSS
│── App.jsx                 # Core router, auth, theme, real-time socket listeners
│── main.jsx                # React 18 root mounting with BrowserRouter
│── Login.jsx               # Glassmorphic login with 1-click Demo Student & Admin
│── Signup.jsx              # Student registration with roll, department, and hostel
│── Dashboard.jsx           # Main student hub with profile, timetable, and metrics
│── CampusMap.jsx           # Leaflet interactive map with safe detour polyline
│── IncidentReport.jsx      # 11-category hazard reporting with AI triage & duplicate check
│── QueueLess.jsx           # Virtual queues, QR token generation, and check-in
│── StudyPulse.jsx          # Syllabus OCR extraction, spaced repetition, weak subjects
│── ExpenseTracker.jsx      # Monthly budget, progress ring, charts, and AI tips
│── AdminDashboard.jsx      # Incident triage, emergency broadcast, CSV downloads
│── Navbar.jsx              # Responsive navigation, quick SOS, theme switcher
│── Footer.jsx              # Emergency helplines, campus status indicator
│── AIAssistant.jsx         # Context-aware chatbot with suggested prompts
│── Notifications.jsx       # Alert center slide-over with filter tabs
│── server.js               # Express + HTTP + Socket.io server entry point
│── database.js             # Dual-mode database (MongoDB Atlas + resilient memory fallback)
│── auth.js                 # JWT auth, bcrypt password hashing, and role checks
│── users.js                # Profile updates and user management
│── incidents.js            # Incident schema, duplicate merging, and safe routes
│── queues.js               # Queue services, QR code generator, and token caller
│── study.js                # Study plans, exams, and syllabus parsing
│── expenses.js             # Expense CRUD, monthly aggregates, and budget alerts
│── notifications.js        # Notification push dispatching
│── admin.js                # Broadcast terminal, metrics, and CSV export handlers
│── ai.js                   # Gemini 1.5 Flash client + intelligent local heuristic engine
│── socket.js               # Real-time Socket.io emitters
│── api.js                  # Axios client with JWT request interceptors
│── firebase.js             # Browser push notification handler
│── config.js               # Environment variables loader
│── utils.js                # Landmark geodata, Haversine distance, safe routing
│── style.css               # Tailwind CSS directives, glassmorphic styling, animations
│── logo.png                # High-resolution platform logo asset
│── favicon.ico             # Platform favicon
│── vite.config.js          # Vite configuration with API/WebSocket proxies
│── tailwind.config.js      # Tailwind theme and custom colors
│── postcss.config.js       # PostCSS plugins
│── package.json            # Unified dependency manifest
│── .env.example            # Environment variables template
│── README.md               # Documentation
│── LICENSE                 # MIT Open-Source License
└── .gitignore              # Git ignore rules
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **NPM**: v9.0.0 or higher

### 2. Setup Environment
```bash
# Clone the repository
git clone https://github.com/your-username/campus-care-ai.git
cd campus-care-ai

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install
```

### 3. Launch Development Servers (Backend + Frontend)
A single command runs both Express (Port 5001) and Vite (Port 3000) concurrently:
```bash
npm run dev
```

Open your browser to:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## 🔑 Demo Credentials (1-Click Login)

The Login page includes 1-click demo buttons for judges:

| Role | Email | Password | Pre-loaded Features |
|---|---|---|---|
| **Demo Student** | `student@campus.edu` | `student123` | Active canteen token, 7-day study streak, upcoming DS exam, logged expenses |
| **Demo Admin** | `admin@campus.edu` | `admin123` | Incident triage table, emergency broadcast system, queue controller, CSV exports |

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/signup` — Create student account
- `POST /api/auth/login` — Sign in and receive JWT token
- `POST /api/auth/demo-login` — 1-click login as student or admin
- `POST /api/auth/forgot-password` — Password reset link simulation
- `GET /api/auth/me` — Retrieve authenticated user profile

### Campus Safety & Incidents
- `GET /api/incidents` — List all active and past incidents
- `POST /api/incidents` — Report hazard with photo upload and AI prioritization
- `PUT /api/incidents/:id/status` — Admin update status and assign responders
- `POST /api/incidents/safe-route` — Compute safe detour route bypassing hazards
- `POST /api/incidents/sos` — Trigger instant panic emergency SOS

### QueueLess Virtual Queues
- `GET /api/queues` — Get all service queues and wait times
- `GET /api/queues/my-tokens` — Get user's active tokens with people ahead
- `POST /api/queues/book` — Reserve digital token with QR code
- `POST /api/queues/check-in` — Counter attendance check-in
- `POST /api/queues/call-next` — Admin advance queue to next token
- `GET /api/queues/analytics` — Peak hours and heatmap statistics

### StudyPulse AI
- `GET /api/study/dashboard` — Today's tasks, streak, and focus score
- `POST /api/study/tasks/:id/toggle` — Toggle task completion
- `POST /api/study/upload-syllabus` — Upload syllabus file and extract topics
- `POST /api/study/exams` — Add upcoming exam to countdown
- `GET /api/study/weak-subject-prediction` — AI weak subject analysis

### Student Expense Tracker
- `GET /api/expenses` — List expenses, budget summary, and AI insights
- `POST /api/expenses` — Log new expense
- `PUT /api/expenses/:id` — Edit expense record
- `DELETE /api/expenses/:id` — Delete expense record

### Campus AI Assistant & Admin
- `POST /api/ai/chat` — Context-aware AI assistant dialogue
- `GET /api/admin/metrics` — Command hub aggregate statistics
- `POST /api/admin/broadcast` — Dispatch campus-wide emergency banner
- `GET /api/admin/export-incidents-csv` — Download incident log CSV
- `GET /api/admin/export-queues-csv` — Download queue token CSV

---

## 🚀 Production Deployment

### Vercel (Frontend)
1. Link your GitHub repository in Vercel.
2. Root directory: `./`
3. Build command: `npm run build`
4. Output directory: `dist`

### Render (Backend)
1. Create a Web Service on Render.
2. Build command: `npm install`
3. Start command: `node server.js`
4. Add environment variables: `PORT=5001`, `JWT_SECRET=your_jwt_secret`, `MONGODB_URI=your_atlas_connection_string`.

---

## 📄 License
MIT License © 2025 Student Help. Open source and built for college students worldwide.
