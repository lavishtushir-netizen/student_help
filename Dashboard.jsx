import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  MapPin,
  Clock,
  BookOpen,
  PieChart,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Circle,
  Flame,
  Calendar,
  Sparkles,
  TrendingUp,
  Activity,
  Users
} from 'lucide-react';
import { incidentApi, queueApi, studyApi, expenseApi } from './api.js';

export default function Dashboard({ user, onTriggerSOS }) {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [activeTokens, setActiveTokens] = useState([]);
  const [studyDashboard, setStudyDashboard] = useState(null);
  const [expenseSummary, setExpenseSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [incRes, queueRes, studyRes, expRes] = await Promise.allSettled([
          incidentApi.getAll({ status: 'all' }),
          queueApi.getMyTokens(),
          studyApi.getDashboard(),
          expenseApi.getAll()
        ]);

        if (incRes.status === 'fulfilled') setIncidents(incRes.value.data.incidents || []);
        if (queueRes.status === 'fulfilled') setActiveTokens(queueRes.value.data.tokens || []);
        if (studyRes.status === 'fulfilled') setStudyDashboard(studyRes.value.data);
        if (expRes.status === 'fulfilled') setExpenseSummary(expRes.value.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleToggleTask = async (taskId) => {
    try {
      const res = await studyApi.toggleTask(taskId);
      if (res.data.success && studyDashboard) {
        const updatedTasks = studyDashboard.plan.dailyTasks.map(t =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        const completedCount = updatedTasks.filter(t => t.completed).length;
        setStudyDashboard({
          ...studyDashboard,
          plan: { ...studyDashboard.plan, dailyTasks: updatedTasks, focusScore: res.data.plan.focusScore },
          completedTasks: completedCount,
          progressPercent: Math.round((completedCount / updatedTasks.length) * 100)
        });
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const activeIncidents = incidents.filter(i => i.status !== 'Resolved');
  const nearestExam = studyDashboard?.exams?.[0];
  const dashboardOptions = [
    { to: '/report', label: 'Report Hazard', detail: '11 Emergency Types', icon: ShieldAlert, hover: 'hover:bg-red-50', iconStyle: 'bg-red-100 text-red-600' },
    { to: '/map', label: 'Campus Map', detail: 'Live Safe Routes', icon: MapPin, hover: 'hover:bg-blue-50', iconStyle: 'bg-blue-100 text-blue-600' },
    { to: '/queues', label: 'QueueLess', detail: 'Book Digital Token', icon: Clock, hover: 'hover:bg-amber-50', iconStyle: 'bg-amber-100 text-amber-600' },
    { to: '/study', label: 'StudyPulse AI', detail: 'OCR & Study Planner', icon: BookOpen, hover: 'hover:bg-cyan-50', iconStyle: 'bg-cyan-100 text-cyan-600' },
    { to: '/expenses', label: 'Expense Tracker', detail: 'Monthly Budget', icon: PieChart, hover: 'hover:bg-emerald-50', iconStyle: 'bg-emerald-100 text-emerald-600' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <aside className="w-full lg:w-56 lg:shrink-0 lg:sticky lg:top-24">
          <div className="glass-card rounded-2xl p-3 border border-blue-500/30">
            <p className="px-3 pb-2 text-[10px] uppercase tracking-wider font-bold text-slate-500">Dashboard options</p>
            <nav className="flex lg:flex-col gap-2 overflow-x-auto">
              {dashboardOptions.map(({ to, label, detail, icon: Icon, hover, iconStyle }) => (
                <Link key={to} to={to} className={`flex min-w-[150px] lg:min-w-0 items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${hover}`}>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconStyle}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-slate-800">{label}</span>
                    <span className="block truncate text-[10px] text-slate-500">{detail}</span>
                  </span>
                </Link>
              ))}
              <button onClick={onTriggerSOS} className="flex min-w-[150px] lg:min-w-0 items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-left transition-colors hover:bg-red-100">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white shadow-md shadow-red-600/20">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold text-red-700">Instant SOS</span>
                  <span className="block truncate text-[10px] text-red-500">Alert Command</span>
                </span>
              </button>
            </nav>
          </div>
        </aside>
        <div className="min-w-0 flex-1 space-y-8">
      {/* Top Welcome & Campus Health Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-blue-500/30 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Campus Safe Network Active
              </span>
              <span className="text-xs text-slate-400">• Metropolitan Tech Campus</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
              Welcome, {user?.name || 'Student'}! 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Here is your all-in-one real-time campus briefing: live safety status, your study goals, queue tickets, and spending limit.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div className="text-center px-2">
              <div className="flex items-center justify-center gap-1 text-amber-400 font-bold text-lg">
                <Flame className="w-5 h-5 fill-amber-400" />
                {studyDashboard?.streakDays || 7}d
              </div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Study Streak</p>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="text-center px-2">
              <div className="text-blue-400 font-bold text-lg">
                {studyDashboard?.focusScore || 88}%
              </div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Focus Score</p>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="text-center px-2">
              <div className="text-emerald-400 font-bold text-lg">
                ₹{expenseSummary ? (expenseSummary.monthlyBudget - expenseSummary.totalSpent).toLocaleString() : '4,351'}
              </div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Safe Balance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards Grid */}
      <div className="hidden">
        <Link
          to="/report"
          className="glass-card glass-card-hover rounded-2xl p-4 flex flex-col items-center text-center gap-2 border border-red-500/30 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-xs sm:text-sm text-white">Report Hazard</p>
            <p className="text-[10px] text-slate-400">11 Emergency Types</p>
          </div>
        </Link>

        <Link
          to="/map"
          className="glass-card glass-card-hover rounded-2xl p-4 flex flex-col items-center text-center gap-2 border border-blue-500/30 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-xs sm:text-sm text-white">Campus Map</p>
            <p className="text-[10px] text-slate-400">Live Safe Routes</p>
          </div>
        </Link>

        <Link
          to="/queues"
          className="glass-card glass-card-hover rounded-2xl p-4 flex flex-col items-center text-center gap-2 border border-amber-500/30 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-xs sm:text-sm text-white">QueueLess</p>
            <p className="text-[10px] text-slate-400">Book Digital Token</p>
          </div>
        </Link>

        <Link
          to="/study"
          className="glass-card glass-card-hover rounded-2xl p-4 flex flex-col items-center text-center gap-2 border border-cyan-500/30 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-xs sm:text-sm text-white">StudyPulse AI</p>
            <p className="text-[10px] text-slate-400">OCR & Study Planner</p>
          </div>
        </Link>

        <Link
          to="/expenses"
          className="glass-card glass-card-hover rounded-2xl p-4 flex flex-col items-center text-center gap-2 border border-emerald-500/30 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-xs sm:text-sm text-white">Expense Tracker</p>
            <p className="text-[10px] text-slate-400">Monthly Budget</p>
          </div>
        </Link>

        <button
          onClick={onTriggerSOS}
          className="glass-card glass-card-hover rounded-2xl p-4 flex flex-col items-center text-center gap-2 border border-red-500 bg-red-600/10 hover:bg-red-600/20 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-red-600/40">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="font-semibold text-xs sm:text-sm text-red-400">Instant SOS</p>
            <p className="text-[10px] text-slate-400">Alert Command</p>
          </div>
        </button>
      </div>

      {/* Main Content Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols wide on desktop): Safety & Study */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Campus Incidents Widget */}
          <div className="glass-card rounded-3xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-white">Active Campus Hazards</h2>
                  <p className="text-xs text-slate-400">
                    {activeIncidents.length} active incidents being monitored by Security
                  </p>
                </div>
              </div>
              <Link
                to="/map"
                className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                <span>Live Map & Detour</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {activeIncidents.slice(0, 3).map((inc) => (
                <div
                  key={inc._id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        inc.priority === 'Critical'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : inc.priority === 'High'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {inc.priority} Priority
                      </span>
                      <span className="text-xs font-semibold text-white">{inc.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{inc.building} ({inc.floor})</span>
                      {inc.reportersCount > 1 && (
                        <span className="text-[11px] text-amber-400 font-medium">
                          • {inc.reportersCount} students reported
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
                      {inc.status}
                    </span>
                    <Link
                      to="/map"
                      className="text-xs px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/30 transition-colors"
                    >
                      Safe Route
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Study Tasks Checklist */}
          <div className="glass-card rounded-3xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-white">Today's Study Plan</h2>
                  <p className="text-xs text-slate-400">
                    {studyDashboard?.completedTasks || 2} of {studyDashboard?.totalTasks || 5} tasks completed
                  </p>
                </div>
              </div>
              <Link
                to="/study"
                className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                <span>Full Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Task list with interactive toggle */}
            <div className="space-y-2.5">
              {(studyDashboard?.plan?.dailyTasks || []).slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    task.completed
                      ? 'bg-slate-900/40 border-slate-800/80 text-slate-500'
                      : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-blue-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button className="text-blue-400 hover:text-blue-300">
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 hover:text-blue-400" />
                      )}
                    </button>
                    <div>
                      <p className={`text-xs font-semibold ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                        {task.topic}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {task.subject} • <span className="font-mono text-blue-400/80">{task.time}</span>
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    task.completed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {task.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col wide): Queues, Exam Countdown, and Expenses */}
        <div className="space-y-8">
          {/* Exam Countdown Card */}
          {nearestExam && (
            <div className="glass-card rounded-3xl p-6 border border-cyan-500/30 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Upcoming Exam
                </span>
                <span className="text-xs font-semibold text-rose-400">
                  {nearestExam.daysLeft} Days Remaining
                </span>
              </div>

              <h3 className="font-display font-bold text-lg text-white mb-1">
                {nearestExam.subject}
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                {nearestExam.venue} • {nearestExam.time}
              </p>

              {/* Progress bar for exam units */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Syllabus Prepared</span>
                  <span className="font-semibold text-white">
                    {nearestExam.completedUnits} of {nearestExam.totalUnits} Units
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    style={{ width: `${(nearestExam.completedUnits / nearestExam.totalUnits) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Active Queue Status Widget */}
          <div className="glass-card rounded-3xl p-6 border border-amber-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-base text-white">Active Queue Token</h3>
              </div>
              <Link to="/queues" className="text-xs font-semibold text-amber-400 hover:text-amber-300">
                View All
              </Link>
            </div>

            {activeTokens.length > 0 ? (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{activeTokens[0].serviceName}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                    {activeTokens[0].status}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Your Token</p>
                    <p className="font-display font-extrabold text-2xl text-amber-400 font-mono">
                      {activeTokens[0].tokenCode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">People Ahead</p>
                    <p className="font-bold text-xl text-white">
                      {activeTokens[0].peopleAhead}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex justify-between items-center">
                  <span>Est. Waiting:</span>
                  <span className="font-semibold text-white font-mono">~{activeTokens[0].estimatedWaitMinutes} mins</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-400">No active queue reservations</p>
                <Link
                  to="/queues"
                  className="inline-block text-xs font-semibold text-blue-400 hover:underline"
                >
                  Reserve Canteen or Dispensary Token →
                </Link>
              </div>
            )}
          </div>

          {/* Monthly Expense Summary */}
          <div className="glass-card rounded-3xl p-6 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <PieChart className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-base text-white">Monthly Allowance</h3>
              </div>
              <Link to="/expenses" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                Manage
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {/* Circular Progress Ring */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500 transition-all duration-1000"
                    strokeDasharray={`${expenseSummary?.percentUsed || 45}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="font-bold text-sm text-white">{expenseSummary?.percentUsed || 45}%</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-400">Spent this month</p>
                <p className="font-display font-extrabold text-xl text-white">
                  ₹{expenseSummary?.totalSpent?.toLocaleString() || '3,649'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Budget: ₹{expenseSummary?.monthlyBudget?.toLocaleString() || '8,000'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
