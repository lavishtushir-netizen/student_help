import express from 'express';
import { verifyToken, verifyAdmin } from './auth.js';
import { memoryStore } from './database.js';
import { emitCampusBroadcast } from './socket.js';
import { createNotification } from './notifications.js';

export const adminRouter = express.Router();

// GET: High-level Admin Dashboard Metrics
adminRouter.get('/metrics', verifyToken, verifyAdmin, (req, res) => {
  const incidents = memoryStore.incidents;
  const activeIncidents = incidents.filter(i => i.status !== 'Resolved');
  const criticalIncidents = activeIncidents.filter(i => i.priority === 'Critical');
  const resolvedIncidents = incidents.filter(i => i.status === 'Resolved');

  const totalTokensToday = memoryStore.queueServices.reduce((sum, s) => sum + (s.totalIssuedToday || 0), 0);
  const activeQueues = memoryStore.queueServices.filter(s => s.status === 'Open').length;

  res.json({
    success: true,
    metrics: {
      totalStudents: memoryStore.users.filter(u => u.role === 'student').length,
      activeIncidents: activeIncidents.length,
      criticalIncidents: criticalIncidents.length,
      resolvedIncidents: resolvedIncidents.length,
      totalTokensIssued: totalTokensToday,
      activeQueues,
      averageSystemWaitMinutes: 5.6
    }
  });
});

// POST: Broadcast Emergency Campus-Wide Announcement
adminRouter.post('/broadcast', verifyToken, verifyAdmin, (req, res) => {
  const { title, message, priority = 'Critical', affectedAreas } = req.body;

  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Broadcast title and message are required.' });
  }

  const broadcastEvent = {
    id: `broadcast-${Date.now()}`,
    title,
    message,
    priority,
    affectedAreas: affectedAreas || 'Campus-Wide',
    broadcastedBy: req.user.name || 'Campus Security Command',
    timestamp: new Date()
  };

  // Push to Socket.io
  emitCampusBroadcast(broadcastEvent);

  // Also create universal notification
  createNotification('all', 'Safety', `📢 ANNOUNCEMENT: ${title}`, message);

  res.json({
    success: true,
    message: 'Campus emergency announcement broadcasted live to all active students.',
    broadcast: broadcastEvent
  });
});

// GET: Export Incidents to CSV
adminRouter.get('/export-incidents-csv', verifyToken, verifyAdmin, (req, res) => {
  const incidents = memoryStore.incidents;
  let csv = 'ID,Type,Title,Building,Floor,Priority,Status,Reporters,EstimatedResponse,Date\n';

  incidents.forEach(inc => {
    const cleanTitle = `"${(inc.title || '').replace(/"/g, '""')}"`;
    const cleanBuilding = `"${(inc.building || '').replace(/"/g, '""')}"`;
    csv += `${inc._id},${inc.type},${cleanTitle},${cleanBuilding},"${inc.floor || ''}",${inc.priority},${inc.status},${inc.reportersCount || 1},${inc.estimatedResponseTime || 'N/A'},${new Date(inc.createdAt).toISOString()}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="campus-incidents-report.csv"');
  res.status(200).send(csv);
});

// GET: Export Queue Logs to CSV
adminRouter.get('/export-queues-csv', verifyToken, verifyAdmin, (req, res) => {
  const tokens = memoryStore.queueTokens;
  let csv = 'TokenCode,Service,StudentName,TimeSlot,PartySize,Status,BookedTime\n';

  tokens.forEach(t => {
    csv += `${t.tokenCode},"${t.serviceName}","${t.studentName}","${t.timeSlot || ''}",${t.partySize || 1},${t.status},${new Date(t.createdAt).toISOString()}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="campus-queue-tokens.csv"');
  res.status(200).send(csv);
});

// GET: All Students with Enriched Dossier (Academic, Queues, Incidents, Expenses, Study Sessions)
adminRouter.get('/students', verifyToken, verifyAdmin, (req, res) => {
  const { search, department } = req.query;
  let students = memoryStore.users.filter(u => u.role === 'student');

  if (department && department !== 'All') {
    students = students.filter(s => s.department === department);
  }

  if (search) {
    const q = search.toLowerCase();
    students = students.filter(s =>
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.studentId && s.studentId.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.department && s.department.toLowerCase().includes(q)) ||
      (s.hostel && s.hostel.toLowerCase().includes(q))
    );
  }

  const enrichedStudents = students.map(student => {
    const plan = memoryStore.studyPlans.find(p => p.userId === student._id);
    const userExams = memoryStore.exams.filter(e => e.userId === student._id);
    const userTokens = memoryStore.queueTokens.filter(t => t.userId === student._id);
    const userIncidents = memoryStore.incidents.filter(i => i.userId === student._id);
    const userExpenses = memoryStore.expenses.filter(e => e.userId === student._id);
    const userSessions = (memoryStore.studySessions || []).filter(s => s.userId === student._id);

    const completedTasks = plan && Array.isArray(plan.dailyTasks) ? plan.dailyTasks.filter(t => t.completed).length : 0;
    const totalTasks = plan && Array.isArray(plan.dailyTasks) ? plan.dailyTasks.length : 0;
    const totalStudyMins = userSessions.reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0);
    const totalSpent = userExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    return {
      _id: student._id,
      name: student.name,
      email: student.email,
      studentId: student.studentId || 'SRM-2023-CS0000',
      department: student.department || 'Computer Science & Engineering',
      year: student.year || '3rd Year',
      hostel: student.hostel || 'SRM Rai Campus Hostel',
      roomNo: student.roomNo || 'N/A',
      phone: student.phone || 'N/A',
      avatar: student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      budget: student.budget || 8000,
      totalSpent,
      createdAt: student.createdAt,
      academic: {
        focusScore: plan ? plan.focusScore : 85,
        streakDays: plan ? plan.streakDays : 5,
        completedTasks,
        totalTasks,
        examsCount: userExams.length,
        exams: userExams,
        studySessionsCount: userSessions.length,
        totalStudyMinutes: totalStudyMins,
        studySessions: userSessions
      },
      activity: {
        activeTokensCount: userTokens.filter(t => t.status === 'Active' || t.status === 'Called').length,
        totalTokensCount: userTokens.length,
        tokens: userTokens,
        incidentsReportedCount: userIncidents.length,
        incidents: userIncidents,
        expensesCount: userExpenses.length,
        expenses: userExpenses
      }
    };
  });

  res.json({
    success: true,
    total: enrichedStudents.length,
    students: enrichedStudents
  });
});

// GET: Export Students Data to CSV
adminRouter.get('/export-students-csv', verifyToken, verifyAdmin, (req, res) => {
  const students = memoryStore.users.filter(u => u.role === 'student');
  let csv = 'StudentID,Name,Email,Department,Year,Hostel,RoomNo,Phone,MonthlyBudget,FocusScore,ExamsTracked,StudySessionsCompleted,TotalStudyMinutes,TokensBooked,IncidentsReported\n';

  students.forEach(student => {
    const plan = memoryStore.studyPlans.find(p => p.userId === student._id);
    const userExams = memoryStore.exams.filter(e => e.userId === student._id);
    const userTokens = memoryStore.queueTokens.filter(t => t.userId === student._id);
    const userIncidents = memoryStore.incidents.filter(i => i.userId === student._id);
    const userSessions = (memoryStore.studySessions || []).filter(s => s.userId === student._id);
    const totalStudyMins = userSessions.reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0);

    const safeField = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

    csv += `${safeField(student.studentId)},${safeField(student.name)},${safeField(student.email)},${safeField(student.department)},${safeField(student.year)},${safeField(student.hostel)},${safeField(student.roomNo)},${safeField(student.phone)},${student.budget || 8000},${plan ? plan.focusScore : 85},${userExams.length},${userSessions.length},${totalStudyMins},${userTokens.length},${userIncidents.length}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="srm-students-directory.csv"');
  res.status(200).send(csv);
});

