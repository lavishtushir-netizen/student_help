import React, { useState, useEffect } from 'react';
import {
  Shield,
  Radio,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Building,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Send,
  GraduationCap,
  Flame,
  BookOpen,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Eye,
  X,
  Filter,
  Award,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { adminApi, incidentApi, queueApi } from './api.js';

export default function AdminDashboard({ user }) {
  const [metrics, setMetrics] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [queues, setQueues] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active View Tab: 'students' | 'incidents' | 'queues'
  const [activeTab, setActiveTab] = useState('students');

  // Student Directory Filters & Search State
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStudentDossier, setSelectedStudentDossier] = useState(null);

  // Broadcast Announcement State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState('Critical');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);

  const loadAdminData = async () => {
    try {
      const [metRes, incRes, qRes, studRes] = await Promise.all([
        adminApi.getMetrics(),
        incidentApi.getAll({ status: 'all' }),
        queueApi.getAll(),
        adminApi.getAllStudents({ search: studentSearch, department: selectedDept })
      ]);
      setMetrics(metRes.data.metrics);
      setIncidents(incRes.data.incidents || []);
      setQueues(qRes.data.services || []);
      setStudents(studRes.data.students || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [studentSearch, selectedDept]);

  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      await incidentApi.updateStatus(incidentId, { status: newStatus });
      loadAdminData();
    } catch (err) {
      alert('Could not update incident status.');
    }
  };

  const handleCallNextQueue = async (serviceId) => {
    try {
      await queueApi.callNext(serviceId);
      loadAdminData();
    } catch (err) {
      alert('Could not advance queue token.');
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    setBroadcasting(true);
    try {
      await adminApi.broadcast({
        title: broadcastTitle,
        message: broadcastMessage,
        priority: broadcastPriority
      });
      setBroadcastSuccess(true);
      setBroadcastTitle('');
      setBroadcastMessage('');
      setTimeout(() => setBroadcastSuccess(false), 5000);
      loadAdminData();
    } catch (err) {
      alert('Broadcast dispatch failed.');
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
            Campus Administration & Incident Command
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
            Admin Master Operations & Student Intelligence Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Full student directory dossiers, emergency incident triage, queue counter advancing, and campus-wide broadcasting.
          </p>
        </div>

        {/* Quick CSV Export Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={adminApi.exportStudentsCsvUrl}
            download="srm-students-directory.csv"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span>Export Students CSV</span>
          </a>
          <a
            href={adminApi.exportIncidentsCsvUrl}
            download="campus-incidents.csv"
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Incidents CSV</span>
          </a>
          <a
            href={adminApi.exportQueuesCsvUrl}
            download="campus-queues.csv"
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Queues CSV</span>
          </a>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div
          onClick={() => setActiveTab('students')}
          className={`glass-card rounded-2xl p-4 border text-center cursor-pointer transition-all ${
            activeTab === 'students' ? 'border-cyan-500 bg-cyan-950/20' : 'border-blue-500/20 hover:border-cyan-500/40'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Students</span>
          <p className="text-2xl font-display font-black text-cyan-400 mt-1">{students.length || metrics?.totalStudents || 6}</p>
        </div>
        <div
          onClick={() => setActiveTab('incidents')}
          className={`glass-card rounded-2xl p-4 border text-center cursor-pointer transition-all ${
            activeTab === 'incidents' ? 'border-amber-500 bg-amber-950/20' : 'border-amber-500/20 hover:border-amber-500/40'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400">Active Hazards</span>
          <p className="text-2xl font-display font-black text-amber-400 mt-1">{metrics?.activeIncidents || 0}</p>
        </div>
        <div
          onClick={() => setActiveTab('incidents')}
          className="glass-card rounded-2xl p-4 border border-red-500/20 text-center cursor-pointer"
        >
          <span className="text-[10px] uppercase font-bold text-slate-400">Critical Incidents</span>
          <p className="text-2xl font-display font-black text-red-400 mt-1">{metrics?.criticalIncidents || 0}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-emerald-500/20 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Resolved Today</span>
          <p className="text-2xl font-display font-black text-emerald-400 mt-1">{metrics?.resolvedIncidents || 0}</p>
        </div>
        <div
          onClick={() => setActiveTab('queues')}
          className={`glass-card rounded-2xl p-4 border text-center cursor-pointer transition-all ${
            activeTab === 'queues' ? 'border-purple-500 bg-purple-950/20' : 'border-cyan-500/20 hover:border-purple-500/40'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400">Tokens Issued</span>
          <p className="text-2xl font-display font-black text-purple-400 font-mono mt-1">{metrics?.totalTokensIssued || 0}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-purple-500/20 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Avg Wait Time</span>
          <p className="text-2xl font-display font-black text-purple-300 font-mono mt-1">~5.6m</p>
        </div>
      </div>

      {/* Admin Module Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'students'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-cyan-400" />
          <span>Student Directory & Master Dossiers ({students.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('incidents')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'incidents'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Shield className="w-4 h-4 text-red-400" />
          <span>Incident Triage & Emergency Broadcast</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('queues')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'queues'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Clock className="w-4 h-4 text-purple-400" />
          <span>Virtual Queue Controller</span>
        </button>
      </div>

      {/* TAB 1: ALL REGISTERED STUDENTS DIRECTORY & DOSSIERS */}
      {activeTab === 'students' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-blue-500/30 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h2 className="font-display font-bold text-xl text-white">
                  SRM University Student Records & Academic Intelligence Directory
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect complete student dossiers: personal details, StudyPulse focus metrics, active queue tokens, safety reports, and monthly expense budgets.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 px-3 py-1.5 rounded-xl border border-cyan-500/20">
                {students.length} Enrolled Students
              </span>
            </div>
          </div>

          {/* Search & Department Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search students by name, roll ID (e.g. SRM-2023-CS0142), email, or hostel..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <div className="relative">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white bg-slate-900 focus:outline-none"
              >
                <option value="All">All SRM Departments</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="AI & Data Science">AI & Data Science</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="School of Law">School of Law</option>
                <option value="Management & Business Analytics">Management & Business Analytics</option>
              </select>
            </div>
          </div>

          {/* Students Directory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-semibold">Student Profile</th>
                  <th className="pb-3 font-semibold">Department & Year</th>
                  <th className="pb-3 font-semibold">Hostel & Room</th>
                  <th className="pb-3 font-semibold">StudyPulse & Focus</th>
                  <th className="pb-3 font-semibold">Campus Activity</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-900/40 transition-colors">
                    {/* Student Info */}
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                        />
                        <div>
                          <p className="font-bold text-white text-sm">{student.name}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                            <span className="text-cyan-400 font-bold">{student.studentId}</span>
                            <span>•</span>
                            <span>{student.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department & Year */}
                    <td className="py-3.5 text-slate-300">
                      <p className="font-semibold text-white">{student.department}</p>
                      <span className="text-[10px] text-slate-400">{student.year}</span>
                    </td>

                    {/* Hostel Location */}
                    <td className="py-3.5 text-slate-300 max-w-[160px]">
                      <p className="truncate text-white">{student.hostel}</p>
                      <span className="text-[10px] text-cyan-400 font-mono">Room: {student.roomNo}</span>
                    </td>

                    {/* StudyPulse Metrics */}
                    <td className="py-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            {student.academic?.focusScore || 85}% Focus
                          </span>
                          <span className="text-[10px] text-amber-400 flex items-center gap-0.5 font-bold">
                            <Flame className="w-3 h-3 fill-amber-400" />
                            {student.academic?.streakDays || 5}d
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {student.academic?.examsCount || 0} Exams • {student.academic?.totalStudyMinutes || 0} mins focused
                        </p>
                      </div>
                    </td>

                    {/* Campus Activity */}
                    <td className="py-3.5 text-slate-300">
                      <div className="space-y-0.5 text-[11px]">
                        <p>Tokens: <b className="text-white">{student.activity?.totalTokensCount || 0}</b> ({student.activity?.activeTokensCount || 0} active)</p>
                        <p>Reports: <b className="text-amber-400">{student.activity?.incidentsReportedCount || 0} filed</b></p>
                      </div>
                    </td>

                    {/* View Dossier Action */}
                    <td className="py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedStudentDossier(student)}
                        className="py-1.5 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1 ml-auto transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Dossier</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INCIDENT TRIAGE & EMERGENCY BROADCAST */}
      {activeTab === 'incidents' && (
        <div className="space-y-8">
          {/* Emergency Broadcast Console */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-red-500/40 relative overflow-hidden space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-white">Campus-Wide Emergency Broadcast Terminal</h2>
                <p className="text-xs text-slate-400">
                  Instantly pushes high-priority audio-visual warning banners across all student screens via Socket.io
                </p>
              </div>
            </div>

            {broadcastSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Emergency announcement broadcasted successfully to all active devices!</span>
              </div>
            )}

            <form onSubmit={handleBroadcast} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Broadcast Headline</label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. FLASH STORM WARNING: Evening lab sessions relocated"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Urgency Priority</label>
                <select
                  value={broadcastPriority}
                  onChange={(e) => setBroadcastPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white bg-slate-900 focus:outline-none"
                >
                  <option value="Critical">Critical Emergency Alert</option>
                  <option value="High">High Advisory</option>
                  <option value="Info">General Campus Notice</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={broadcasting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{broadcasting ? 'Broadcasting...' : 'Broadcast Alert'}</span>
                </button>
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Message Instructions</label>
                <textarea
                  rows={2}
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Instructions for students and faculty regarding evacuation, rerouting, or scheduled power maintenance..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white focus:outline-none"
                />
              </div>
            </form>
          </div>

          {/* Incident Triage Dispatch Table */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-blue-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <h2 className="font-display font-bold text-lg text-white">Live Incident Triage & Dispatch Table</h2>
              </div>
              <span className="text-xs text-slate-400">{incidents.length} total incidents recorded</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3 font-semibold">Priority</th>
                    <th className="pb-3 font-semibold">Incident Details</th>
                    <th className="pb-3 font-semibold">Location</th>
                    <th className="pb-3 font-semibold">Reporters</th>
                    <th className="pb-3 font-semibold">Assigned Unit</th>
                    <th className="pb-3 font-semibold">Status Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {incidents.map((inc) => (
                    <tr key={inc._id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          inc.priority === 'Critical'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : inc.priority === 'High'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {inc.priority}
                        </span>
                      </td>
                      <td className="py-3.5 max-w-xs">
                        <p className="font-bold text-white truncate">{inc.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{inc.description}</p>
                      </td>
                      <td className="py-3.5 text-slate-300">
                        <p>{inc.building}</p>
                        <span className="text-[10px] text-slate-500">{inc.floor}</span>
                      </td>
                      <td className="py-3.5">
                        <span className="font-semibold text-white">{inc.reportersCount || 1} student(s)</span>
                      </td>
                      <td className="py-3.5 text-cyan-400 font-medium">
                        {inc.suggestedResponder}
                      </td>
                      <td className="py-3.5">
                        <select
                          value={inc.status}
                          onChange={(e) => handleStatusChange(inc._id, e.target.value)}
                          className="px-2.5 py-1 rounded-xl glass-input text-xs font-semibold text-white bg-slate-900 focus:outline-none"
                        >
                          <option value="Reported">Reported</option>
                          <option value="Investigating">Investigating</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VIRTUAL QUEUE CONTROLLER */}
      {activeTab === 'queues' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-blue-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h2 className="font-display font-bold text-lg text-white">Virtual Queue Counter Manager</h2>
            </div>
            <span className="text-xs text-slate-400">Advance service counters with 1-click</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {queues.map((svc) => (
              <div key={svc._id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-white">{svc.name}</h4>
                    <p className="text-[11px] text-slate-400">{svc.location}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                    {svc.currentServingToken}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Waiting in Line: <b className="text-white">{svc.currentQueueCount || 0}</b></span>
                  <span>Avg Wait: <b className="text-cyan-400">{svc.averageWaitMinutes}m</b></span>
                </div>

                <button
                  onClick={() => handleCallNextQueue(svc._id)}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
                >
                  <span>Call Next Token</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STUDENT MASTER DOSSIER MODAL */}
      {selectedStudentDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/40 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <img
                  src={selectedStudentDossier.avatar}
                  alt={selectedStudentDossier.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-500/50 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-extrabold text-xl text-white">
                      {selectedStudentDossier.name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {selectedStudentDossier.studentId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedStudentDossier.department} • {selectedStudentDossier.year}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudentDossier(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Contact & Residence Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">{selectedStudentDossier.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{selectedStudentDossier.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">{selectedStudentDossier.roomNo}, {selectedStudentDossier.hostel}</span>
              </div>
            </div>

            {/* Section 1: StudyPulse & Academics */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                StudyPulse AI & Academic Focus Metrics
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Focus Score</p>
                  <p className="text-xl font-bold text-cyan-400 mt-0.5">{selectedStudentDossier.academic?.focusScore || 85}%</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Day Streak</p>
                  <p className="text-xl font-bold text-amber-400 mt-0.5">{selectedStudentDossier.academic?.streakDays || 5} Days</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Exams Tracked</p>
                  <p className="text-xl font-bold text-white mt-0.5">{selectedStudentDossier.academic?.examsCount || 0}</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Study Time</p>
                  <p className="text-xl font-bold text-emerald-400 mt-0.5">{selectedStudentDossier.academic?.totalStudyMinutes || 0}m</p>
                </div>
              </div>

              {/* Study Sessions List */}
              {selectedStudentDossier.academic?.studySessions && selectedStudentDossier.academic.studySessions.length > 0 && (
                <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
                  <p className="text-[11px] font-semibold text-slate-300">Recent Completed Timer Sessions:</p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {selectedStudentDossier.academic.studySessions.map((sess, i) => (
                      <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="font-semibold text-white truncate max-w-xs">{sess.subject} - {sess.topic}</span>
                        <span className="font-mono text-cyan-400 font-bold shrink-0">{sess.durationMinutes} mins</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Virtual Queue & Safety Incidents */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Queues */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Queue Activity ({selectedStudentDossier.activity?.totalTokensCount || 0})
                </span>
                <p className="text-xs text-slate-300">
                  Active Tokens: <b className="text-white">{selectedStudentDossier.activity?.activeTokensCount || 0}</b>
                </p>
                <div className="text-[11px] text-slate-400">
                  {selectedStudentDossier.activity?.tokens && selectedStudentDossier.activity.tokens.length > 0 ? (
                    <ul className="list-disc pl-4 space-y-1">
                      {selectedStudentDossier.activity.tokens.slice(0, 3).map((t, idx) => (
                        <li key={idx}>Token {t.tokenCode} - {t.serviceName} ({t.status})</li>
                      ))}
                    </ul>
                  ) : (
                    <span>No active tokens booked.</span>
                  )}
                </div>
              </div>

              {/* Incidents & Financials */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Safety & Budget Summary
                </span>
                <p className="text-xs text-slate-300">
                  Incidents Filed: <b className="text-white">{selectedStudentDossier.activity?.incidentsReportedCount || 0} reports</b>
                </p>
                <p className="text-xs text-slate-300">
                  Monthly Budget: <b className="text-emerald-400">₹{selectedStudentDossier.budget || 8000}</b>
                </p>
                <p className="text-xs text-slate-300">
                  Total Expenses Recorded: <b className="text-cyan-400">₹{selectedStudentDossier.totalSpent || 0}</b>
                </p>
              </div>
            </div>

            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setSelectedStudentDossier(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
            >
              Close Dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

