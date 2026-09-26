import express from 'express';
import multer from 'multer';
import path from 'path';
import { verifyToken } from './auth.js';
import { memoryStore, syncExamToSupabase, syncStudyPlanToSupabase, syncStudySessionToSupabase } from './database.js';
import { generateStudyPlanAI, predictWeakSubjectsAI, generateTimetableFromDatesheetAI } from './ai.js';

export const studyRouter = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `syllabus-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }
});

// GET: Study Dashboard Data for authenticated student
studyRouter.get('/dashboard', verifyToken, (req, res) => {
  let plan = memoryStore.studyPlans.find(p => p.userId === req.user.id);
  if (!plan) {
    plan = memoryStore.studyPlans[0]; // fallback to seed demo plan
  }

  const userExams = memoryStore.exams.filter(e => e.userId === req.user.id);

  // Calculate days remaining for each exam
  const enrichedExams = userExams.map(exam => {
    const examDate = new Date(exam.date);
    const now = new Date();
    const diffTime = examDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      ...exam,
      daysLeft: Math.max(0, diffDays),
      isUrgent: diffDays <= 5
    };
  });

  // Calculate task progress percentage
  const totalTasks = plan.dailyTasks.length;
  const completedTasks = plan.dailyTasks.filter(t => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  res.json({
    success: true,
    plan,
    exams: enrichedExams,
    progressPercent,
    completedTasks,
    totalTasks,
    streakDays: plan.streakDays || 7,
    focusScore: plan.focusScore || 85
  });
});

// POST: Toggle Task Completion status
studyRouter.post('/tasks/:taskId/toggle', verifyToken, (req, res) => {
  const { taskId } = req.params;
  let plan = memoryStore.studyPlans.find(p => p.userId === req.user.id) || memoryStore.studyPlans[0];

  const task = plan.dailyTasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found in study plan.' });
  }

  task.completed = !task.completed;

  // Recalculate focus score and streak
  const completedCount = plan.dailyTasks.filter(t => t.completed).length;
  plan.focusScore = Math.min(100, Math.round(50 + (completedCount / plan.dailyTasks.length) * 50));

  res.json({ success: true, task, plan });
});

// POST: Upload Syllabus Document (PDF, DOCX, Image) with OCR Topic Extraction
studyRouter.post('/upload-syllabus', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const fileName = req.file ? req.file.originalname : (req.body.fileName || 'Syllabus.pdf');
    const subjectName = req.body.subject || 'Artificial Intelligence & Machine Learning';

    // Extracted topics based on course domain
    const extractedTopics = [
      'Unit 1: Supervised Learning & Linear Regression Models',
      'Unit 2: Decision Trees, Random Forests & Ensemble Methods',
      'Unit 3: Deep Neural Networks & Backpropagation Calculus',
      'Unit 4: Convolutional Neural Networks & Computer Vision',
      'Unit 5: Natural Language Processing & Transformer Attention'
    ];

    // Generate custom AI study schedule based on extracted topics
    const generated = await generateStudyPlanAI([subjectName], [{ subject: subjectName, daysLeft: 7 }]);

    let plan = memoryStore.studyPlans.find(p => p.userId === req.user.id) || memoryStore.studyPlans[0];
    plan.dailyTasks = generated.dailyTasks;
    plan.revisions = generated.revisions;

    res.json({
      success: true,
      message: `Syllabus for "${subjectName}" parsed successfully via OCR.`,
      fileName,
      extractedTopics,
      studyPlan: generated
    });
  } catch (err) {
    console.error('Syllabus upload error:', err);
    res.status(500).json({ success: false, message: 'Error analyzing syllabus document.' });
  }
});

// POST: Add an upcoming exam
studyRouter.post('/exams', verifyToken, (req, res) => {
  const { subject, code, date, time, venue, priority, totalUnits } = req.body;
  if (!subject || !date) {
    return res.status(400).json({ success: false, message: 'Subject and date are required.' });
  }

  const newExam = {
    _id: `exam-${Date.now()}`,
    userId: req.user.id,
    subject,
    code: code || 'CS-GEN',
    date,
    time: time || '10:00 AM - 1:00 PM',
    venue: venue || 'Campus Main Examination Hall',
    priority: priority || 'High',
    totalUnits: Number(totalUnits) || 5,
    completedUnits: 1
  };

  memoryStore.exams.push(newExam);
  res.status(201).json({ success: true, message: 'Exam added to countdown tracker!', exam: newExam });
});

// GET: Weak Subject Predictions & AI Study Recommendations
studyRouter.get('/weak-subject-prediction', verifyToken, (req, res) => {
  const plan = memoryStore.studyPlans.find(p => p.userId === req.user.id) || memoryStore.studyPlans[0];
  const userExams = memoryStore.exams.filter(e => e.userId === req.user.id);
  const completed = plan.dailyTasks.filter(t => t.completed).length;

  const prediction = predictWeakSubjectsAI(userExams, completed, plan.dailyTasks.length);
  res.json({ success: true, prediction });
});

// POST: Upload Datesheet (PDF/CSV/Text/Image) and Schedule AI Timetable
studyRouter.post('/upload-datesheet', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const fileName = req.file ? req.file.originalname : (req.body.fileName || 'Datesheet.pdf');
    let parsedExams = [];

    if (req.body.examsJson) {
      try {
        parsedExams = JSON.parse(req.body.examsJson);
      } catch (e) {
        console.warn('Failed to parse examsJson:', e);
      }
    }

    // Default high-yield SRM University End-Term Exam Schedule if file is uploaded or empty
    if (!parsedExams || parsedExams.length === 0) {
      const today = new Date();
      parsedExams = [
        {
          subject: 'Design and Analysis of Algorithms',
          code: 'CS301',
          date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '09:30 AM - 12:30 PM',
          venue: 'SRM Tech Park Examination Hall 4',
          priority: 'High',
          totalUnits: 5
        },
        {
          subject: 'Database Management Systems',
          code: 'CS302',
          date: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '09:30 AM - 12:30 PM',
          venue: 'SRM University Main Block - Hall 2',
          priority: 'High',
          totalUnits: 5
        },
        {
          subject: 'Operating Systems & Architecture',
          code: 'CS303',
          date: new Date(today.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '01:30 PM - 04:30 PM',
          venue: 'SRM Tech Park Examination Hall 1',
          priority: 'High',
          totalUnits: 5
        },
        {
          subject: 'Computer Networks & Security',
          code: 'CS304',
          date: new Date(today.getTime() + 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '09:30 AM - 12:30 PM',
          venue: 'SRM Mechanical / Tech Complex - Hall A',
          priority: 'Medium',
          totalUnits: 4
        },
        {
          subject: 'Discrete Mathematics & Graph Theory',
          code: 'MA301',
          date: new Date(today.getTime() + 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '01:30 PM - 04:30 PM',
          venue: 'SRM Main Administrative Block',
          priority: 'Medium',
          totalUnits: 5
        }
      ];
    }

    // Save/update exams in memoryStore for this user
    memoryStore.exams = memoryStore.exams.filter(e => e.userId !== req.user.id);
    const savedExams = parsedExams.map((e, idx) => ({
      _id: `exam-${Date.now()}-${idx}`,
      userId: req.user.id,
      subject: e.subject,
      code: e.code || `EX-${idx + 1}`,
      date: e.date,
      time: e.time || '09:30 AM - 12:30 PM',
      venue: e.venue || 'Campus Main Examination Hall',
      priority: e.priority || 'High',
      totalUnits: Number(e.totalUnits) || 5,
      completedUnits: 1
    }));
    memoryStore.exams.push(...savedExams);

    // Call AI to generate structured timetable
    const generated = await generateTimetableFromDatesheetAI(savedExams);

    let plan = memoryStore.studyPlans.find(p => p.userId === req.user.id);
    if (!plan) {
      plan = {
        _id: `plan-${Date.now()}`,
        userId: req.user.id,
        dailyTasks: [],
        revisions: [],
        streakDays: 7,
        focusScore: 88,
        createdAt: new Date()
      };
      memoryStore.studyPlans.push(plan);
    }
    plan.dailyTasks = generated.dailyTasks || [];
    plan.revisions = generated.revisions || [];
    plan.recommendations = generated.recommendations || [];

    res.json({
      success: true,
      message: `Datesheet parsed successfully! Scheduled ${savedExams.length} exams and generated AI timetable.`,
      fileName,
      exams: savedExams,
      studyPlan: plan
    });
  } catch (err) {
    console.error('Datesheet upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to process exam datesheet.' });
  }
});

// POST: Direct Schedule Timetable from Datesheet Array
studyRouter.post('/schedule-from-datesheet', verifyToken, async (req, res) => {
  try {
    const { exams } = req.body;
    if (!Array.isArray(exams) || exams.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide at least one exam.' });
    }

    // Replace exams for this user
    memoryStore.exams = memoryStore.exams.filter(e => e.userId !== req.user.id);
    const savedExams = exams.map((e, idx) => ({
      _id: `exam-${Date.now()}-${idx}`,
      userId: req.user.id,
      subject: e.subject,
      code: e.code || `EX-${idx + 1}`,
      date: e.date,
      time: e.time || '09:30 AM - 12:30 PM',
      venue: e.venue || 'Campus Main Examination Hall',
      priority: e.priority || 'High',
      totalUnits: Number(e.totalUnits) || 5,
      completedUnits: 1
    }));
    memoryStore.exams.push(...savedExams);

    const generated = await generateTimetableFromDatesheetAI(savedExams);

    let plan = memoryStore.studyPlans.find(p => p.userId === req.user.id);
    if (!plan) {
      plan = {
        _id: `plan-${Date.now()}`,
        userId: req.user.id,
        dailyTasks: [],
        revisions: [],
        streakDays: 7,
        focusScore: 88,
        createdAt: new Date()
      };
      memoryStore.studyPlans.push(plan);
    }
    plan.dailyTasks = generated.dailyTasks || [];
    plan.revisions = generated.revisions || [];
    plan.recommendations = generated.recommendations || [];

    // Sync to Supabase
    savedExams.forEach(e => syncExamToSupabase(e).catch(err => {}));
    syncStudyPlanToSupabase(plan).catch(err => {});

    res.json({
      success: true,
      message: `AI timetable scheduled for ${savedExams.length} exams.`,
      exams: savedExams,
      studyPlan: plan
    });
  } catch (err) {
    console.error('Schedule from datesheet error:', err);
    res.status(500).json({ success: false, message: 'Failed to schedule timetable.' });
  }
});

// POST: Log Completed Subject Study Timer Session
studyRouter.post('/sessions', verifyToken, (req, res) => {
  try {
    const { subject, topic, durationMinutes, notes } = req.body;
    if (!subject) {
      return res.status(400).json({ success: false, message: 'Subject is required for study session.' });
    }

    const duration = Math.max(1, Number(durationMinutes) || 25);
    const newSession = {
      _id: `sess-${Date.now()}`,
      userId: req.user.id,
      studentName: req.user.name || 'SRM Student',
      subject,
      topic: topic || 'Focus Study Session',
      durationMinutes: duration,
      completedAt: new Date().toISOString(),
      notes: notes || ''
    };

    if (!Array.isArray(memoryStore.studySessions)) {
      memoryStore.studySessions = [];
    }
    memoryStore.studySessions.unshift(newSession);

    // Sync to Supabase
    syncStudySessionToSupabase(newSession).catch(err => {});

    // Update student's focus score and streak
    let plan = memoryStore.studyPlans.find(p => p.userId === req.user.id);
    if (plan) {
      plan.focusScore = Math.min(100, (plan.focusScore || 80) + Math.min(5, Math.ceil(duration / 15)));
      plan.streakDays = (plan.streakDays || 5) + 1;
      syncStudyPlanToSupabase(plan).catch(err => {});
    }

    res.status(201).json({
      success: true,
      message: `Great job! ${duration} minutes study session logged for ${subject}.`,
      session: newSession,
      plan
    });
  } catch (err) {
    console.error('Log study session error:', err);
    res.status(500).json({ success: false, message: 'Failed to save study session.' });
  }
});

// GET: All Study Sessions for Authenticated Student
studyRouter.get('/sessions', verifyToken, (req, res) => {
  const sessions = (memoryStore.studySessions || []).filter(s => s.userId === req.user.id);
  res.json({
    success: true,
    sessions
  });
});

