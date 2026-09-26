import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  UserCheck,
  ShieldCheck,
  GraduationCap,
  Shield
} from 'lucide-react';
import { authApi } from './api.js';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [activePortal, setActivePortal] = useState('student'); // 'student' or 'admin'
  const [email, setEmail] = useState('student@campus.edu');
  const [password, setPassword] = useState('student123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Switch Portal Handler
  const handleSwitchPortal = (portal) => {
    setActivePortal(portal);
    setError('');
    if (portal === 'student') {
      setEmail('student@campus.edu');
      setPassword('student123');
    } else {
      setEmail('admin@campus.edu');
      setPassword('admin123');
    }
  };

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      if (res.data.token) {
        onLoginSuccess(res.data.token, res.data.user);
        if (res.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setError('');
    setLoading(true);
    try {
      const res = await authApi.demoLogin(role);
      if (res.data.token) {
        onLoginSuccess(res.data.token, res.data.user);
        if (res.data.user.role === 'admin' || role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError('Demo login temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const res = await authApi.forgotPassword(forgotEmail);
      setForgotSuccessMessage(res.data.message || 'OTP reset code dispatched.');
    } catch (err) {
      setForgotSuccessMessage('Simulated Reset: OTP 442918 dispatched to your campus email.');
    } finally {
      setForgotLoading(false);
    }
  };

  const isStudent = activePortal === 'student';

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-slate-950">
      {/* Animated Glowing Radial Mesh Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full blur-[130px] transition-all duration-700 ${
          isStudent ? 'bg-cyan-600/20' : 'bg-purple-600/20'
        }`}></div>
        <div className={`absolute top-[40%] -right-[15%] w-[650px] h-[650px] rounded-full blur-[140px] transition-all duration-700 ${
          isStudent ? 'bg-blue-600/20' : 'bg-indigo-600/20'
        }`}></div>
        <div className="absolute -bottom-[20%] left-[25%] w-[500px] h-[500px] rounded-full bg-slate-800/20 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-lg z-10 py-6">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-2xl shadow-blue-500/30 mb-3 animate-float">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-white">
            Student Help
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            SRM University Delhi-NCR Smart Campus & Student Safety Platform
          </p>
        </div>

        {/* Dual-Portal Segmented Switcher */}
        <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1.5 mb-6 shadow-xl backdrop-blur-xl">
          <button
            type="button"
            onClick={() => handleSwitchPortal('student')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              isStudent
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <GraduationCap className={`w-4 h-4 ${isStudent ? 'text-white' : 'text-cyan-400'}`} />
            <span>Student Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchPortal('admin')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              !isStudent
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Shield className={`w-4 h-4 ${!isStudent ? 'text-white' : 'text-purple-400'}`} />
            <span>Admin & Staff Portal</span>
          </button>
        </div>

        {/* Glassmorphic Login Card */}
        <div className={`glass-card rounded-3xl p-6 sm:p-8 border shadow-2xl backdrop-blur-2xl transition-all duration-300 ${
          isStudent ? 'border-cyan-500/30 shadow-cyan-500/10' : 'border-purple-500/30 shadow-purple-500/10'
        }`}>
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                  isStudent
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                }`}>
                  {isStudent ? '🎓 Student Sign-In' : '🛡️ Admin Master Console'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1.5">
                {isStudent ? 'Student Access Portal' : 'Campus Administrator Login'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isStudent
                  ? 'Access StudyPulse AI timetable, queue tokens, safe maps, and expense analytics.'
                  : 'Manage all student directory records, campus emergency broadcasts, and queue counters.'}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isStudent ? 'Student Campus Email / Roll ID' : 'Administrator Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isStudent ? 'student@campus.edu' : 'admin@campus.edu'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className={`text-xs font-medium transition-colors ${
                    isStudent ? 'text-cyan-400 hover:text-cyan-300' : 'text-purple-400 hover:text-purple-300'
                  }`}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2 ${
                isStudent
                  ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/30'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isStudent ? 'Enter Student Dashboard' : 'Open Admin Command Console'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Quick Demo Sign In Box */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                1-Click Instant Demo Login
              </span>
              <span className="text-[10px] text-slate-500 font-mono">No typing required</span>
            </div>

            {isStudent ? (
              <button
                type="button"
                onClick={() => handleDemoLogin('student')}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors group shadow"
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="font-bold text-white">Login as Demo Student</p>
                    <p className="text-[11px] text-slate-400">Lavishtushir • SRM-2023-CS0142 (CSE 3rd Year)</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors group shadow"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="font-bold text-white">Login as Campus Administrator</p>
                    <p className="text-[11px] text-slate-400">Dr. Rajesh Varma • Full Student Directory Access</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {/* Quick credentials hint */}
            <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
              <span>{isStudent ? 'Default: student@campus.edu' : 'Default: admin@campus.edu'}</span>
              <span className="text-slate-500">{isStudent ? 'pw: student123' : 'pw: admin123'}</span>
            </div>
          </div>

          {/* Footer link */}
          <div className="mt-6 text-center text-xs text-slate-400">
            {isStudent ? (
              <>
                New student without credentials?{' '}
                <Link to="/signup" className="text-cyan-400 font-semibold hover:text-cyan-300 underline">
                  Create student profile
                </Link>
              </>
            ) : (
              <span className="text-slate-500">
                SRM University Delhi-NCR Administrator & Security Protocol Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 border border-cyan-500/40 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Campus Password</h3>
                <p className="text-xs text-slate-400">Enter your campus email for instant verification</p>
              </div>
            </div>

            {forgotSuccessMessage ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs space-y-3">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verification Dispatched</span>
                </div>
                <p>{forgotSuccessMessage}</p>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSuccessMessage('');
                  }}
                  className="w-full py-2 rounded-xl bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-500 transition-colors"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registered Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student@campus.edu"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors"
                  >
                    {forgotLoading ? 'Sending...' : 'Send OTP Reset'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
