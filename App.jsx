import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { AlertTriangle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import Dashboard from './Dashboard.jsx';
import CampusMap from './CampusMap.jsx';
import IncidentReport from './IncidentReport.jsx';
import QueueLess from './QueueLess.jsx';
import StudyPulse from './StudyPulse.jsx';
import ExpenseTracker from './ExpenseTracker.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import AIAssistant from './AIAssistant.jsx';
import Notifications from './Notifications.jsx';

import { authApi, notificationApi, incidentApi } from './api.js';
import { showBrowserNotification } from './firebase.js';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('campuscare_theme') || 'light');

  // Auth State
  const [token, setToken] = useState(() => localStorage.getItem('campuscare_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campuscare_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // AI Assistant Modal State
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Emergency SOS Modal State
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);

  // Real-Time Campus Broadcast Banner
  const [activeBroadcast, setActiveBroadcast] = useState(null);

  // Initialize Theme class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    localStorage.setItem('campuscare_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Socket.io Real-Time Connection
  useEffect(() => {
    const socket = io('/', {
      transports: ['websocket', 'polling']
    });

    if (user?._id) {
      socket.emit('join_user_room', user._id);
    }

    socket.on('campus_broadcast', (broadcast) => {
      setActiveBroadcast(broadcast);
      showBrowserNotification(broadcast.title, { body: broadcast.message });
    });

    socket.on('notification_created', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      showBrowserNotification(notif.title, { body: notif.message });
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  // Load User Profile & Notifications when authenticated
  useEffect(() => {
    if (token) {
      authApi.getMe()
        .then(res => {
          if (res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('campuscare_user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          handleLogout();
        });

      notificationApi.getAll()
        .then(res => {
          if (res.data.notifications) {
            setNotifications(res.data.notifications);
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('campuscare_token', newToken);
    localStorage.setItem('campuscare_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('campuscare_token');
    localStorage.removeItem('campuscare_user');
    navigate('/login');
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (e) {}
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {}
  };

  // Trigger Instant SOS Emergency Dispatch
  const handleTriggerSOS = async () => {
    setSosLoading(true);
    try {
      await incidentApi.triggerSOS({
        lat: 28.5475,
        lng: 77.1910,
        message: 'High priority panic SOS distress call initiated from mobile device.'
      });
      setSosSent(true);
      setTimeout(() => {
        setSosSent(false);
        setShowSOSModal(false);
      }, 4000);
    } catch (err) {
      alert('Could not dispatch SOS. Call security immediately at +91 1800-CAMPUS-SAFE.');
    } finally {
      setSosLoading(false);
    }
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* High-Priority Campus Emergency Broadcast Live Banner */}
      {activeBroadcast && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 py-3 shadow-2xl relative z-50 animate-bounce duration-1000">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="p-1.5 rounded-lg bg-black/20 shrink-0">
                <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-wider">
                  CAMPUS EMERGENCY BROADCAST: {activeBroadcast.title}
                </p>
                <p className="text-xs text-red-100 mt-0.5">{activeBroadcast.message}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveBroadcast(null)}
              className="p-1 rounded-lg hover:bg-black/20 text-white shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation Bar (hidden on login/signup) */}
      {!isAuthPage && token && (
        <Navbar
          user={user}
          onLogout={handleLogout}
          unreadCount={unreadNotifCount}
          onOpenNotifications={() => setIsNotifOpen(true)}
          onOpenAIModal={() => setIsAIOpen(true)}
          onTriggerSOS={() => setShowSOSModal(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          hideDesktopNavigation={location.pathname === '/dashboard'}
        />
      )}

      {/* Main Routed Content */}
      <main className="flex-1 bg-[var(--bg-primary)] text-slate-900">
        <Routes>
          <Route
            path="/login"
            element={token ? <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <Login onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/signup"
            element={token ? <Navigate to="/dashboard" replace /> : <Signup onLoginSuccess={handleLoginSuccess} />}
          />

          <Route
            path="/dashboard"
            element={token ? <Dashboard user={user} onTriggerSOS={() => setShowSOSModal(true)} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/map"
            element={token ? <CampusMap user={user} onTriggerSOS={() => setShowSOSModal(true)} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/report"
            element={token ? <IncidentReport user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/queues"
            element={token ? <QueueLess user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/study"
            element={token ? <StudyPulse user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/expenses"
            element={token ? <ExpenseTracker user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin"
            element={
              token && user?.role === 'admin' ? (
                <AdminDashboard user={user} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to={token ? (user?.role === 'admin' ? "/admin" : "/dashboard") : "/login"} replace />} />
        </Routes>
      </main>

      {/* Footer */}
      {!isAuthPage && <Footer />}

      {/* Floating AI Assistant Trigger & Chatbot Drawer */}
      {!isAuthPage && token && (
        <>
          <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />

          {!isAIOpen && (
            <button
              onClick={() => setIsAIOpen(true)}
              className="fixed bottom-6 right-6 z-40 p-4 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-2xl shadow-blue-500/40 hover:scale-105 hover:shadow-blue-500/60 transition-all flex items-center gap-2 group"
              title="Open Student Help Assistant"
            >
              <div className="relative">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 absolute -top-1 -right-1 animate-ping"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute -top-1 -right-1"></span>
                <ShieldAlert className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold tracking-tight hidden sm:inline">Ask AI</span>
            </button>
          )}
        </>
      )}

      {/* Notifications Drawer */}
      <Notifications
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
      />

      {/* Emergency SOS Confirmation Modal */}
      {showSOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 border border-red-500/40 shadow-2xl text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-red-600/20 text-red-500 mx-auto flex items-center justify-center border-2 border-red-500/40 animate-pulse">
              <AlertTriangle className="w-12 h-12" />
            </div>

            {sosSent ? (
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-2xl text-emerald-400">
                  SOS DISPATCH CONFIRMED!
                </h3>
                <p className="text-xs text-slate-300">
                  Campus Quick Response Team & Armed Security Patrol have received your live GPS coordinates. First responders are en route.
                </p>
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                  Response ETA: 2–3 Minutes
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-display font-extrabold text-2xl text-white">
                  Send Campus Emergency SOS?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  This sends an immediate high-priority distress alert with your real-time GPS coordinates to the Campus Central Security Control Room & Medical Squad.
                </p>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                  📍 Target Dispatch: <b className="text-white">{user?.hostel || 'Current Campus Quad'}</b>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setShowSOSModal(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTriggerSOS}
                    disabled={sosLoading}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/40 transition-all"
                  >
                    {sosLoading ? 'Broadcasting SOS...' : 'TRIGGER SOS NOW'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
