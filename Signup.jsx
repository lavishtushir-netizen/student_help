import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Mail,
  Lock,
  User,
  GraduationCap,
  Building,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { authApi } from './api.js';

export default function Signup({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    department: 'Computer Science & Engineering',
    year: '1st Year',
    hostel: 'Boys Hostel 1 (Everest House)'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.signup(formData);
      if (res.data.token) {
        onLoginSuccess(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check form fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-950">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] -left-[10%] w-[550px] h-[550px] rounded-full bg-blue-600/20 blur-[130px] animate-pulse-slow"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[140px] animate-pulse-slow"></div>
      </div>

      <div className="w-full max-w-lg z-10 my-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-xl shadow-blue-500/30 mb-3">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-blue-400" />
            </div>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Create Student Account
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Join Student Help for an intelligent, secure campus experience
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl backdrop-blur-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Lavishtushir"
                    className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Roll / Student ID</label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="studentId"
                    required
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="2023CS0142"
                    className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">College Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@campus.edu"
                    className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Secure Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white bg-slate-900 focus:outline-none"
                >
                  <option value="Computer Science & Engineering">Computer Science (CSE)</option>
                  <option value="Electronics & Communication">Electronics (ECE)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil & Environmental">Civil Engineering</option>
                  <option value="Biotechnology">Biotechnology</option>
                  <option value="Management Studies">Management / MBA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white bg-slate-900 focus:outline-none"
                >
                  <option value="1st Year (Freshman)">1st Year (Freshman)</option>
                  <option value="2nd Year (Sophomore)">2nd Year (Sophomore)</option>
                  <option value="3rd Year (Junior)">3rd Year (Junior)</option>
                  <option value="4th Year (Senior)">4th Year (Senior)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Campus Residence / Hostel</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  name="hostel"
                  value={formData.hostel}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white bg-slate-900 focus:outline-none"
                >
                  <option value="Boys Hostel 1 (Everest House)">Boys Hostel 1 (Everest House)</option>
                  <option value="Boys Hostel 2 (Himalaya House)">Boys Hostel 2 (Himalaya House)</option>
                  <option value="Girls Hostel 1 (Gargi Bhawan)">Girls Hostel 1 (Gargi Bhawan)</option>
                  <option value="Girls Hostel 2 (Kalpana Chawla Hall)">Girls Hostel 2 (Kalpana Chawla Hall)</option>
                  <option value="Day Scholar / Off-Campus">Day Scholar / Off-Campus</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Account & Enter Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
