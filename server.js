import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { CONFIG } from './config.js';
import { connectDatabase, memoryStore } from './database.js';
import { isSupabaseConfigured } from './supabaseClient.js';
import { initSocket } from './socket.js';
import { authRouter } from './auth.js';
import { usersRouter } from './users.js';
import { incidentsRouter } from './incidents.js';
import { queuesRouter } from './queues.js';
import { studyRouter } from './study.js';
import { expensesRouter } from './expenses.js';
import { notificationsRouter } from './notifications.js';
import { adminRouter } from './admin.js';
import { chatCampusAssistantAI } from './ai.js';

const app = express();
const httpServer = http.createServer(app);

// Ensure uploads folder exists
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize Socket.io
initSocket(httpServer);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded incident & syllabus files statically
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/queues', queuesRouter);
app.use('/api/study', studyRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', adminRouter);

// AI Campus Assistant Direct Chat Route
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message prompt is required.' });
    }

    // Pass live platform context into AI
    const liveContext = {
      incidents: memoryStore.incidents.slice(0, 5),
      queues: memoryStore.queueServices,
      exams: memoryStore.exams.slice(0, 3),
      expenses: {
        totalSpent: memoryStore.expenses.reduce((s, e) => s + e.amount, 0),
        count: memoryStore.expenses.length
      }
    };

    const reply = await chatCampusAssistantAI(message, liveContext);
    res.json({ success: true, reply });
  } catch (err) {
    console.error('AI chat endpoint error:', err);
    res.status(500).json({
      success: false,
      reply: 'Student Help is temporarily recalibrating. Please check back in a moment!'
    });
  }
});

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'Student Help',
    version: '1.0.0',
    mode: memoryStore.dbEngine || (memoryStore.isUsingMemory ? 'Resilient In-Memory Mode' : 'Connected Database'),
    supabaseConfigured: isSupabaseConfigured(),
    activeStudents: memoryStore.users.filter(u => u.role === 'student').length,
    activeIncidents: memoryStore.incidents.length,
    activeQueues: memoryStore.queueServices.length,
    timestamp: new Date()
  });
});

// Start Server
async function startServer() {
  await connectDatabase();

  httpServer.listen(CONFIG.PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Student Help Backend Server Live on Port ${CONFIG.PORT}`);
    console.log(`📦 Database: ${memoryStore.dbEngine || 'In-Memory Store'}`);
    console.log(`⚡ Supabase: ${isSupabaseConfigured() ? 'Configured & Active' : 'Offline / Standby (Fallback Engaged)'}`);
    console.log(`🛡️ Campus Safety | ⏱️ QueueLess | 📖 StudyPulse | 💳 ExpenseTracker`);
    console.log(`======================================================\n`);
  });
}

startServer();
