import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Calendar,
  Flame,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  UploadCloud,
  Plus,
  AlertCircle,
  FileText,
  TrendingUp,
  Brain,
  Award,
  Zap,
  Target,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Timer,
  Check,
  ArrowRight,
  Trash2,
  FileCheck,
  Coffee
} from 'lucide-react';
import { studyApi } from './api.js';

// SRM University Delhi-NCR Default End-Term Datesheet
const DEFAULT_SRM_EXAMS = [
  {
    subject: 'Design and Analysis of Algorithms',
    code: 'CS301',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '09:30 AM - 12:30 PM',
    venue: 'SRM Tech Park Examination Hall 4',
    priority: 'High',
    totalUnits: 5,
    completedUnits: 2
  },
  {
    subject: 'Database Management Systems',
    code: 'CS302',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '09:30 AM - 12:30 PM',
    venue: 'SRM University Main Block - Hall 2',
    priority: 'High',
    totalUnits: 5,
    completedUnits: 1
  },
  {
    subject: 'Operating Systems & Architecture',
    code: 'CS303',
    date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '01:30 PM - 04:30 PM',
    venue: 'SRM Tech Park Examination Hall 1',
    priority: 'High',
    totalUnits: 5,
    completedUnits: 2
  },
  {
    subject: 'Computer Networks & Security',
    code: 'CS304',
    date: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '09:30 AM - 12:30 PM',
    venue: 'SRM Mechanical / Tech Complex - Hall A',
    priority: 'Medium',
    totalUnits: 4,
    completedUnits: 1
  },
  {
    subject: 'Discrete Mathematics & Graph Theory',
    code: 'MA301',
    date: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '01:30 PM - 04:30 PM',
    venue: 'SRM Main Administrative Block',
    priority: 'Medium',
    totalUnits: 5,
    completedUnits: 3
  }
];

export default function StudyPulse({ user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [weakPrediction, setWeakPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Datesheet Upload & Auto-Scheduler State ---
  const [datesheetFile, setDatesheetFile] = useState(null);
  const [datesheetLoading, setDatesheetLoading] = useState(false);
  const [datesheetExams, setDatesheetExams] = useState(DEFAULT_SRM_EXAMS);
  const [datesheetStatusMsg, setDatesheetStatusMsg] = useState('');

  // --- Subject Study Timer State ---
  const [selectedSubject, setSelectedSubject] = useState('Design and Analysis of Algorithms');
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [timerTopic, setTimerTopic] = useState('Dynamic Programming & Graph Traversal Drills');
  const [timerDurationMinutes, setTimerDurationMinutes] = useState(25);
  const [customDurationInput, setCustomDurationInput] = useState('25');
  const [timerTotalSeconds, setTimerTotalSeconds] = useState(25 * 60);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [celebrationDetails, setCelebrationDetails] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);

  // --- Upload Syllabus State ---
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [syllabusSubject, setSyllabusSubject] = useState('Machine Learning & AI');
  const [uploadingSyllabus, setUploadingSyllabus] = useState(false);
  const [syllabusResult, setSyllabusResult] = useState(null);

  // --- Add Single Exam Modal State ---
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [newExam, setNewExam] = useState({
    subject: '',
    code: 'CS-401',
    date: '',
    time: '10:00 AM - 1:00 PM',
    venue: 'Exam Hall 1, Block A',
    priority: 'High',
    totalUnits: 5
  });

  // Web Audio API Pleasant Completion Chime (zero external assets, 100% offline reliable)
  const playCompletionChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Major chord chime)
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.13);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.13);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.13 + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.13);
        osc.stop(ctx.currentTime + idx * 0.13 + 0.5);
      });
    } catch (e) {
      console.warn('Audio chime notice:', e);
    }
  };

  const loadStudyData = async () => {
    try {
      const [dashRes, weakRes, sessRes] = await Promise.all([
        studyApi.getDashboard(),
        studyApi.getWeakSubjectPrediction(),
        studyApi.getStudySessions()
      ]);
      setDashboardData(dashRes.data);
      setWeakPrediction(weakRes.data.prediction);
      if (sessRes.data?.sessions) {
        setRecentSessions(sessRes.data.sessions);
      }
      if (dashRes.data?.exams && dashRes.data.exams.length > 0) {
        setDatesheetExams(dashRes.data.exams);
        setSelectedSubject(dashRes.data.exams[0].subject);
      }
    } catch (err) {
      console.error('Failed to load study data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudyData();
  }, []);

  // --- Countdown Timer Ticker Effect ---
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && !isTimerPaused && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleCompleteSession(timerDurationMinutes);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, isTimerPaused, timerSecondsLeft, timerDurationMinutes]);

  // Handle Session Completion (Natural or Finished Early)
  const handleCompleteSession = async (loggedMinutes) => {
    setIsTimerRunning(false);
    setIsTimerPaused(false);
    playCompletionChime();

    const currentSub = selectedSubject === 'Custom' ? (customSubjectInput || 'Independent Study') : selectedSubject;
    const duration = Math.max(1, loggedMinutes || 1);

    setCelebrationDetails({
      subject: currentSub,
      topic: timerTopic,
      durationMinutes: duration
    });
    setShowCelebrationModal(true);

    try {
      const res = await studyApi.logStudySession({
        subject: currentSub,
        topic: timerTopic || 'Focus Study Session',
        durationMinutes: duration
      });
      if (res.data.session) {
        setRecentSessions(prev => [res.data.session, ...prev]);
      }
      loadStudyData();
    } catch (err) {
      console.error('Failed to log study session:', err);
    }
  };

  // Timer Controls
  const handleStartTimer = () => {
    if (timerSecondsLeft === 0) {
      setTimerSecondsLeft(timerTotalSeconds);
    }
    setIsTimerRunning(true);
    setIsTimerPaused(false);
  };

  const handlePauseTimer = () => {
    setIsTimerPaused(true);
  };

  const handleResumeTimer = () => {
    setIsTimerPaused(false);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setIsTimerPaused(false);
    setTimerSecondsLeft(timerTotalSeconds);
  };

  const handleFinishEarly = () => {
    if (!isTimerRunning) return;
    const elapsedSecs = timerTotalSeconds - timerSecondsLeft;
    const elapsedMins = Math.max(1, Math.round(elapsedSecs / 60));
    handleCompleteSession(elapsedMins);
    setTimerSecondsLeft(timerTotalSeconds);
  };

  const handleSelectPresetDuration = (mins) => {
    if (isTimerRunning) return;
    setTimerDurationMinutes(mins);
    setCustomDurationInput(String(mins));
    setTimerTotalSeconds(mins * 60);
    setTimerSecondsLeft(mins * 60);
  };

  const handleCustomDurationChange = (e) => {
    const val = e.target.value;
    setCustomDurationInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0 && num <= 300) {
      setTimerDurationMinutes(num);
      setTimerTotalSeconds(num * 60);
      setTimerSecondsLeft(num * 60);
    }
  };

  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- Datesheet Upload & Auto-Scheduler Handlers ---
  const handleLoadSampleDatesheet = () => {
    setDatesheetExams(DEFAULT_SRM_EXAMS);
    setDatesheetStatusMsg('Loaded 5 official SRM University Delhi-NCR Semester End-Term Exams!');
    setTimeout(() => setDatesheetStatusMsg(''), 6000);
  };

  const handleScheduleFromDatesheet = async () => {
    setDatesheetLoading(true);
    try {
      const res = await studyApi.scheduleFromDatesheet({ exams: datesheetExams });
      setDatesheetStatusMsg(`Success! Scheduled ${datesheetExams.length} exams and optimized today's hourly timetable.`);
      if (res.data.studyPlan) {
        setDashboardData(prev => ({
          ...prev,
          plan: res.data.studyPlan,
          exams: res.data.exams
        }));
      }
      loadStudyData();
      setTimeout(() => setDatesheetStatusMsg(''), 7000);
    } catch (err) {
      alert('Could not schedule timetable from datesheet.');
    } finally {
      setDatesheetLoading(false);
    }
  };

  const handleUploadDatesheetFile = async (e) => {
    e.preventDefault();
    if (!datesheetFile) return;

    setDatesheetLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', datesheetFile);
      formData.append('examsJson', JSON.stringify(datesheetExams));

      const res = await studyApi.uploadDatesheet(formData);
      setDatesheetStatusMsg(`Datesheet "${res.data.fileName}" parsed! Scheduled ${res.data.exams?.length || 5} exams with AI.`);
      if (res.data.exams) {
        setDatesheetExams(res.data.exams);
      }
      loadStudyData();
      setTimeout(() => setDatesheetStatusMsg(''), 7000);
    } catch (err) {
      alert('Failed to process datesheet file.');
    } finally {
      setDatesheetLoading(false);
    }
  };

  // --- Toggle Daily Task ---
  const handleToggleTask = async (taskId) => {
    try {
      const res = await studyApi.toggleTask(taskId);
      if (res.data.success) {
        const updatedTasks = dashboardData.plan.dailyTasks.map(t =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        const completedCount = updatedTasks.filter(t => t.completed).length;
        setDashboardData({
          ...dashboardData,
          plan: { ...dashboardData.plan, dailyTasks: updatedTasks, focusScore: res.data.plan.focusScore },
          completedTasks: completedCount,
          progressPercent: Math.round((completedCount / updatedTasks.length) * 100)
        });
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  // --- Upload Syllabus ---
  const handleUploadSyllabus = async (e) => {
    e.preventDefault();
    setUploadingSyllabus(true);
    try {
      const formData = new FormData();
      if (syllabusFile) {
        formData.append('file', syllabusFile);
      }
      formData.append('subject', syllabusSubject);

      const res = await studyApi.uploadSyllabus(formData);
      setSyllabusResult(res.data);
      loadStudyData();
    } catch (err) {
      alert('Could not parse syllabus file.');
    } finally {
      setUploadingSyllabus(false);
    }
  };

  // --- Add Exam ---
  const handleAddExam = async (e) => {
    e.preventDefault();
    if (!newExam.subject || !newExam.date) return;

    try {
      await studyApi.addExam(newExam);
      setShowAddExamModal(false);
      setNewExam({
        subject: '',
        code: 'CS-401',
        date: '',
        time: '10:00 AM - 1:00 PM',
        venue: 'Exam Hall 1, Block A',
        priority: 'High',
        totalUnits: 5
      });
      loadStudyData();
    } catch (err) {
      alert('Failed to add exam.');
    }
  };

  const plan = dashboardData?.plan;
  const exams = dashboardData?.exams || datesheetExams;
  const timerProgress = timerTotalSeconds > 0 ? (timerSecondsLeft / timerTotalSeconds) : 1;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - timerProgress);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
            Module 3: StudyPulse AI
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
            Datesheet Timetable Scheduler & Focus Timer
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Upload exam datesheets, auto-generate priority study timetables, and execute timed subject sessions with audio completion alerts.
          </p>
        </div>

        {/* Quick Study Stats */}
        <div className="flex items-center gap-4 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 shrink-0">
          <div className="text-center px-2">
            <div className="flex items-center justify-center gap-1 text-amber-400 font-bold text-xl">
              <Flame className="w-5 h-5 fill-amber-400" />
              {dashboardData?.streakDays || 7}
            </div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Day Streak</p>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="text-center px-2">
            <div className="text-cyan-400 font-bold text-xl">
              {dashboardData?.focusScore || 88}%
            </div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Focus Score</p>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="text-center px-2">
            <div className="text-emerald-400 font-bold text-xl">
              {dashboardData?.progressPercent || 40}%
            </div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Daily Goal</p>
          </div>
        </div>
      </div>

      {/* FEATURE 1: INTERACTIVE SUBJECT STUDY TIMER (Custom Duration, Countdown Clock, Web Audio Chime) */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/40 shadow-2xl relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-600/15 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Timer className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                  Subject Focus Study Timer
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Custom Duration
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Decide your exact study duration per subject. Stay in deep focus with audio alerts and session tracking.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>Audio Chime Enabled on Completion</span>
          </div>
        </div>

        {/* Timer Control Grid: Configuration Left, Digital Clock & Circular Ring Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">
          {/* Left: Configuration Inputs */}
          <div className="lg:col-span-7 space-y-5">
            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Subject to Study
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  disabled={isTimerRunning}
                  className="sm:col-span-2 px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white bg-slate-900 focus:outline-none disabled:opacity-60"
                >
                  {exams.map((ex, i) => (
                    <option key={i} value={ex.subject}>
                      {ex.code ? `${ex.code} - ` : ''}{ex.subject}
                    </option>
                  ))}
                  <option value="Custom">+ Custom Subject...</option>
                </select>

                {selectedSubject === 'Custom' && (
                  <input
                    type="text"
                    placeholder="Enter subject name..."
                    value={customSubjectInput}
                    onChange={(e) => setCustomSubjectInput(e.target.value)}
                    disabled={isTimerRunning}
                    className="sm:col-span-1 px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                  />
                )}
              </div>
            </div>

            {/* Topic / Objective Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Specific Topic / Problem Set Objective
              </label>
              <input
                type="text"
                value={timerTopic}
                onChange={(e) => setTimerTopic(e.target.value)}
                placeholder="e.g. Unit 3 Backpropagation Proofs & Numerical Questions"
                disabled={isTimerRunning}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none disabled:opacity-60"
              />
            </div>

            {/* Study Duration: Preset Pills + Custom Minutes Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  Select or Decide Study Duration
                </label>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {timerDurationMinutes} Minutes Session
                </span>
              </div>

              {/* Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {[15, 25, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleSelectPresetDuration(mins)}
                    disabled={isTimerRunning}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      timerDurationMinutes === mins
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    } disabled:opacity-50`}
                  >
                    {mins}m {mins === 25 ? '(Pomodoro)' : mins === 90 ? '(Mock Exam)' : ''}
                  </button>
                ))}
              </div>

              {/* Custom Minutes Input */}
              <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Or decide custom duration:</span>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={customDurationInput}
                  onChange={handleCustomDurationChange}
                  disabled={isTimerRunning}
                  className="w-20 px-2 py-1 rounded-lg glass-input text-center text-xs font-mono font-bold text-cyan-300 focus:outline-none"
                />
                <span className="text-xs text-slate-400">minutes</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {!isTimerRunning ? (
                <button
                  type="button"
                  onClick={handleStartTimer}
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-500 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Focus Session ({timerDurationMinutes}m)</span>
                </button>
              ) : isTimerPaused ? (
                <button
                  type="button"
                  onClick={handleResumeTimer}
                  className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Resume Timer</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePauseTimer}
                  className="py-3 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-600/30 flex items-center gap-2 transition-all"
                >
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause Timer</span>
                </button>
              )}

              {isTimerRunning && (
                <button
                  type="button"
                  onClick={handleFinishEarly}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Finish Early & Log</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResetTimer}
                className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs border border-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Right: Circular Progress Ring & Digital Clock Display */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-3xl border border-slate-800/80 relative">
            <div className="relative flex items-center justify-center w-52 h-52">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-800/70"
                  fill="transparent"
                />
                {/* Animated Glowing Progress Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="url(#timerGradient)"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Digital Time Inside Ring */}
              <div className="absolute text-center">
                <div className="font-mono font-black text-4xl text-white tracking-wider">
                  {formatTime(timerSecondsLeft)}
                </div>
                <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
                  {isTimerRunning && !isTimerPaused ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>Deep Focus Active</span>
                    </>
                  ) : isTimerPaused ? (
                    <span className="text-amber-400">Paused</span>
                  ) : (
                    <span>Ready</span>
                  )}
                </div>
              </div>
            </div>

            {/* Current Subject Badge */}
            <div className="mt-4 text-center">
              <p className="text-xs font-semibold text-slate-400">Current Subject Goal</p>
              <p className="text-sm font-bold text-white max-w-xs truncate">
                {selectedSubject === 'Custom' ? (customSubjectInput || 'Custom Study') : selectedSubject}
              </p>
            </div>
          </div>
        </div>

        {/* Recently Completed Study Sessions Log */}
        {recentSessions.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                Completed Study Sessions Today
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Total: {recentSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0)} mins focused
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {recentSessions.slice(0, 3).map((sess, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{sess.subject}</p>
                    <p className="text-[10px] text-slate-400 truncate">{sess.topic}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold shrink-0">
                    +{sess.durationMinutes}m
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FEATURE 2: EXAM DATESHEET UPLOAD & AI AUTO-SCHEDULER */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-blue-500/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-xl text-white">
                Exam Datesheet & AI Timetable Scheduler
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload your semester datesheet (PDF, CSV, Image) or load SRM University datesheet to automatically generate an intelligent prioritized study schedule.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSampleDatesheet}
              className="py-2.5 px-3.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>1-Click Load SRM Datesheet</span>
            </button>
          </div>
        </div>

        {datesheetStatusMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="font-semibold">{datesheetStatusMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* File Upload Dropzone (4 cols) */}
          <form onSubmit={handleUploadDatesheetFile} className="lg:col-span-4 space-y-3">
            <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl p-5 text-center cursor-pointer transition-colors bg-slate-900/40 relative">
              <input
                type="file"
                accept=".pdf,.csv,.xlsx,.xls,image/*,.txt"
                onChange={(e) => setDatesheetFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-white">
                {datesheetFile ? datesheetFile.name : 'Upload Datesheet PDF / CSV / Image'}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Drag and drop your official university exam timetable
              </p>
            </div>

            <button
              type="submit"
              disabled={datesheetLoading || !datesheetFile}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              {datesheetLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Datesheet...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Parse Uploaded Datesheet</span>
                </>
              )}
            </button>
          </form>

          {/* Datesheet Table Preview & Scheduler Trigger (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Scheduled Exams</span>
                <p className="text-sm font-bold text-white">{datesheetExams.length} Courses Found in Datesheet</p>
              </div>

              <button
                type="button"
                onClick={handleScheduleFromDatesheet}
                disabled={datesheetLoading || datesheetExams.length === 0}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {datesheetLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Scheduling Timetable...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>Auto-Schedule AI Timetable</span>
                  </>
                )}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="pb-2 font-semibold">Course</th>
                    <th className="pb-2 font-semibold">Subject Title</th>
                    <th className="pb-2 font-semibold">Exam Date</th>
                    <th className="pb-2 font-semibold">Venue / Hall</th>
                    <th className="pb-2 font-semibold text-right">Countdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {datesheetExams.map((ex, idx) => {
                    const examDate = new Date(ex.date);
                    const now = new Date();
                    const diffDays = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 font-mono font-bold text-cyan-400">{ex.code || `EX-${idx+1}`}</td>
                        <td className="py-2.5 font-semibold text-white">{ex.subject}</td>
                        <td className="py-2.5 text-slate-300 font-mono text-[11px]">{ex.date}</td>
                        <td className="py-2.5 text-slate-400 text-[11px] max-w-[140px] truncate">{ex.venue || 'Exam Hall'}</td>
                        <td className="py-2.5 text-right">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                            diffDays <= 4 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-cyan-500/20 text-cyan-300'
                          }`}>
                            {Math.max(0, diffDays)}d left
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left (Today's Hourly AI Schedule & Syllabus) & Right (Exams & Weak Areas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Hourly Timetable Checklist */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-blue-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-white">Today's Hourly AI Study Schedule</h2>
                  <p className="text-xs text-slate-400">
                    Prioritized automatically by upcoming exam proximity and spaced intervals
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/20">
                {dashboardData?.completedTasks || 0} / {dashboardData?.totalTasks || 5} Complete
              </span>
            </div>

            {/* Daily Tasks List */}
            <div className="space-y-3 pt-2">
              {(plan?.dailyTasks || []).map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    task.completed
                      ? 'bg-slate-900/40 border-slate-800 text-slate-500'
                      : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <button className="text-cyan-400 hover:text-cyan-300 shrink-0">
                      {task.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-600 hover:text-cyan-400" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                          {task.time}
                        </span>
                        <span className="text-xs font-bold text-white">{task.subject}</span>
                      </div>
                      <p className={`text-xs mt-1 ${task.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                        {task.topic}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                    task.completed
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                  }`}>
                    {task.completed ? 'Done' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Spaced Repetition Revision Scheduler */}
          <div className="glass-card rounded-3xl p-6 border border-blue-500/30 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">AI Spaced Repetition Revisions</h3>
                <p className="text-xs text-slate-400">Scheduled automatically at Day 1, Day 4, and Day 10 intervals</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(plan?.revisions || []).map((rev, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Iteration {i + 1}
                  </span>
                  <p className="text-xs font-semibold text-white leading-snug">{rev.title}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Date:</span>
                    <span className="font-mono text-cyan-400 font-bold">{rev.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Exams & Weak Subjects */}
        <div className="space-y-8">
          {/* Upcoming Exam Countdown Card */}
          <div className="glass-card rounded-3xl p-6 border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-base text-white">Exam Countdown</h3>
              </div>
              <button
                onClick={() => setShowAddExamModal(true)}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Exam</span>
              </button>
            </div>

            <div className="space-y-3">
              {exams.map((exam) => (
                <div
                  key={exam._id || exam.code}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {exam.code}
                    </span>
                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg ${
                      exam.daysLeft <= 4 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {exam.daysLeft !== undefined ? `${exam.daysLeft} Days Left` : 'Active'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">{exam.subject}</h4>
                  <p className="text-xs text-slate-400">{exam.venue} • {exam.time}</p>

                  <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
                    <span>Preparation:</span>
                    <span className="font-semibold text-white font-mono">{exam.completedUnits || 1} / {exam.totalUnits || 5} Units</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Weak Subject Prediction & Focus Box */}
          {weakPrediction && (
            <div className="glass-card rounded-3xl p-6 border border-purple-500/30 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">AI Weak Subject Analysis</h3>
                  <p className="text-[11px] text-slate-400">Neural retention & diagnostic model</p>
                </div>
              </div>

              {/* Strong vs Weak tags */}
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-1.5">
                    Strong Subjects (Mastered)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {weakPrediction.strongSubjects.map((sub, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                        ✓ {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block mb-1.5">
                    Identified Weak Areas (Needs Practice)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {weakPrediction.weakSubjects.map((sub, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 font-medium">
                        ⚠ {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Recommended Practice Actions */}
              <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" /> High-Impact Action Items
                </span>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  {weakPrediction.recommendedActions.map((act, i) => (
                    <li key={i} className="leading-relaxed">• {act}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Celebration Modal when Timer Completes */}
      {showCelebrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/50 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 p-0.5 mx-auto shadow-lg shadow-cyan-500/30 animate-bounce">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Award className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            <div>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                Focus Goal Achieved
              </span>
              <h3 className="font-display font-extrabold text-2xl text-white mt-2">
                Study Session Completed!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                You focused on <b className="text-cyan-300">{celebrationDetails?.subject}</b> for <b className="text-emerald-400">{celebrationDetails?.durationMinutes} minutes</b>.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-1">
              <p>🎯 Topic: <span className="text-white font-medium">{celebrationDetails?.topic}</span></p>
              <p>⚡ Focus Score: <span className="text-emerald-400 font-bold">+5 Points Boost</span></p>
              <p>🔥 Day Streak: <span className="text-amber-400 font-bold">Extended to {dashboardData?.streakDays || 7} Days</span></p>
            </div>

            <button
              onClick={() => setShowCelebrationModal(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all"
            >
              Continue to Study Schedule
            </button>
          </div>
        </div>
      )}

      {/* Add Exam Modal */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 border border-cyan-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <h3 className="font-display font-bold text-base text-white">Add Exam to Countdown</h3>
              </div>
              <button
                onClick={() => setShowAddExamModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExam} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Title</label>
                <input
                  type="text"
                  required
                  value={newExam.subject}
                  onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
                  placeholder="e.g. Design & Analysis of Algorithms"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Course Code</label>
                  <input
                    type="text"
                    value={newExam.code}
                    onChange={(e) => setNewExam({ ...newExam, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Exam Date</label>
                  <input
                    type="date"
                    required
                    value={newExam.date}
                    onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white bg-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Exam Hall / Venue</label>
                  <input
                    type="text"
                    value={newExam.venue}
                    onChange={(e) => setNewExam({ ...newExam, venue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Total Units</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newExam.totalUnits}
                    onChange={(e) => setNewExam({ ...newExam, totalUnits: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/30 transition-colors mt-2"
              >
                Add Exam
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

