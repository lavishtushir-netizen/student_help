import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Flame,
  HeartPulse,
  Users,
  Zap,
  Droplets,
  Lightbulb,
  ArrowUpDown,
  Eye,
  Search,
  Lock,
  Camera,
  MapPin,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { incidentApi } from './api.js';
import { CAMPUS_LANDMARKS } from './utils.js';

export default function IncidentReport({ user }) {
  const navigate = useNavigate();

  const incidentTypes = [
    { label: 'Fire', icon: Flame, color: 'text-red-500 bg-red-500/10 border-red-500/30' },
    { label: 'Medical Emergency', icon: HeartPulse, color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' },
    { label: 'Ragging', icon: Users, color: 'text-purple-500 bg-purple-500/10 border-purple-500/30' },
    { label: 'Fight', icon: ShieldAlert, color: 'text-orange-500 bg-orange-500/10 border-orange-500/30' },
    { label: 'Electrical Issue', icon: Zap, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
    { label: 'Water Leakage', icon: Droplets, color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' },
    { label: 'Broken Street Light', icon: Lightbulb, color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30' },
    { label: 'Lift Failure', icon: ArrowUpDown, color: 'text-red-400 bg-red-400/10 border-red-400/30' },
    { label: 'Suspicious Activity', icon: Eye, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30' },
    { label: 'Lost & Found', icon: Search, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' },
    { label: 'Security Issue', icon: Lock, color: 'text-red-500 bg-red-500/10 border-red-500/30' }
  ];

  const [formData, setFormData] = useState({
    type: 'Lift Failure',
    title: '',
    description: '',
    building: 'Main Administrative & Academic Tower',
    floor: 'Ground Floor',
    lat: 28.9192,
    lng: 77.1285
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successReport, setSuccessReport] = useState(null);
  const [detectingGps, setDetectingGps] = useState(false);

  // Auto AI classification preview
  const getSimulatedAIPriority = (type) => {
    switch (type) {
      case 'Fire':
      case 'Medical Emergency':
      case 'Lift Failure':
        return { priority: 'Critical', responseTime: '3-5 minutes', team: 'Rapid Rescue & First Responders' };
      case 'Ragging':
      case 'Fight':
      case 'Electrical Issue':
      case 'Security Issue':
      case 'Suspicious Activity':
        return { priority: 'High', responseTime: '5-10 minutes', team: 'Campus Security Patrol' };
      case 'Water Leakage':
      case 'Broken Street Light':
        return { priority: 'Medium', responseTime: '30-45 minutes', team: 'Facilities Maintenance' };
      default:
        return { priority: 'Low', responseTime: '2-4 hours', team: 'Student Welfare Desk' };
    }
  };

  const aiPreview = getSimulatedAIPriority(formData.type);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAutoGPS = () => {
    setDetectingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({
            ...prev,
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6))
          }));
          setDetectingGps(false);
        },
        () => {
          // Fallback to campus coordinate
          setFormData(prev => ({ ...prev, lat: 28.5458, lng: 77.1920 }));
          setDetectingGps(false);
        },
        { timeout: 5000 }
      );
    } else {
      setDetectingGps(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('type', formData.type);
      data.append('title', formData.title || `${formData.type} Incident Reported`);
      data.append('description', formData.description);
      data.append('building', formData.building);
      data.append('floor', formData.floor);
      data.append('lat', formData.lat);
      data.append('lng', formData.lng);

      if (photoFile) {
        data.append('photo', photoFile);
      }

      const res = await incidentApi.create(data);
      setSuccessReport(res.data);
    } catch (err) {
      console.error('Failed to report incident:', err);
      alert('Could not file report. Please ensure required fields are filled.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-orange-600 to-amber-500 p-0.5 shadow-xl shadow-red-500/30 mb-3">
          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
            <ShieldAlert className="w-7 h-7 text-red-400" />
          </div>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
          Report Campus Hazard or Incident
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg mx-auto">
          AI triage analyzes urgency, checks for duplicate cluster reports, and alerts active responders instantly.
        </p>
      </div>

      {successReport ? (
        <div className="glass-card rounded-3xl p-8 border border-emerald-500/40 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl text-white">
              {successReport.isDuplicate ? 'Report Merged with Existing Cluster' : 'Incident Dispatched to First Responders!'}
            </h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              {successReport.message}
            </p>
          </div>

          {/* AI Prioritization Summary Card */}
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Classified Priority:</span>
              <span className="font-bold text-red-400 uppercase tracking-wider">{successReport.incident?.priority}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Estimated Response Time:</span>
              <span className="font-mono text-cyan-400 font-semibold">{successReport.incident?.estimatedResponseTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Assigned Dispatch Unit:</span>
              <span className="text-white font-semibold">{successReport.incident?.suggestedResponder}</span>
            </div>
            {successReport.incident?.reportersCount > 1 && (
              <div className="pt-2 border-t border-slate-800 text-amber-400 font-medium">
                👥 Total Students Reporting: {successReport.incident?.reportersCount}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSuccessReport(null);
                setFormData({
                  type: 'Lift Failure',
                  title: '',
                  description: '',
                  building: 'Main Administrative & Academic Tower',
                  floor: 'Ground Floor',
                  lat: 28.9192,
                  lng: 77.1285
                });
                setPhotoFile(null);
                setPhotoPreview(null);
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
            >
              Report Another Incident
            </button>
            <button
              onClick={() => navigate('/map')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View On Live Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Incident Type Grid */}
          <div className="glass-card rounded-3xl p-6 border border-blue-500/30 space-y-4">
            <label className="block text-xs font-bold text-white uppercase tracking-wider">
              1. Select Incident Type (11 Supported Emergency Categories)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {incidentTypes.map((item) => {
                const Icon = item.icon;
                const isSelected = formData.type === item.label;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: item.label })}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'bg-blue-600/30 border-blue-400 text-white shadow-lg shadow-blue-600/20 scale-[1.02]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-xl border ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Prioritization Live Badge */}
          <div className="glass-card rounded-2xl p-4 border border-blue-500/30 bg-blue-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-cyan-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">AI Prioritization Engine</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    aiPreview.priority === 'Critical'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : aiPreview.priority === 'High'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {aiPreview.priority} Priority
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Target Response: <b className="text-slate-200">{aiPreview.responseTime}</b> • Dispatch: <b className="text-slate-200">{aiPreview.team}</b>
                </p>
              </div>
            </div>
          </div>

          {/* Incident Details Form */}
          <div className="glass-card rounded-3xl p-6 border border-blue-500/30 space-y-4">
            <label className="block text-xs font-bold text-white uppercase tracking-wider">
              2. Incident Location & Details
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Incident Headline / Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Elevator stuck with alarm ringing on 3rd floor"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Description & Urgent Hazards</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain what happened, any persons needing medical aid, or immediate risks..."
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Campus Building / Zone</label>
                <select
                  value={formData.building}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    const lm = CAMPUS_LANDMARKS.find((l) => l.name === selectedName);
                    setFormData({
                      ...formData,
                      building: selectedName,
                      lat: lm ? lm.lat : formData.lat,
                      lng: lm ? lm.lng : formData.lng
                    });
                  }}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white bg-slate-900 focus:outline-none"
                >
                  {CAMPUS_LANDMARKS.map((lm) => (
                    <option key={lm.id} value={lm.name}>
                      {lm.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Floor / Wing / Room</label>
                <input
                  type="text"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  placeholder="e.g. 3rd Floor East Wing near Lab 304"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* GPS Auto-Detect */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>GPS Geolocation Coordinates</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoGPS}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  {detectingGps ? 'Acquiring Satellites...' : 'Detect Device GPS'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.0001"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                  className="px-3 py-2 rounded-xl glass-input text-xs text-white"
                  placeholder="Latitude"
                />
                <input
                  type="number"
                  step="0.0001"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                  className="px-3 py-2 rounded-xl glass-input text-xs text-white"
                  placeholder="Longitude"
                />
              </div>
            </div>

            {/* Photo Upload with Preview */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Incident Photo (Optional)</label>
              <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-900/40 relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                {photoPreview ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={photoPreview} alt="Preview" className="h-28 rounded-xl object-cover ring-2 ring-blue-500/40" />
                    <span className="text-xs text-blue-400 font-semibold">Change Photo</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-300">Click to upload photo or drag & drop</p>
                    <p className="text-[11px] text-slate-500">PNG, JPG, or WebP up to 10MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>Submit Emergency Report to Dispatch</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
