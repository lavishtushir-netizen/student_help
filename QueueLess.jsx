import React, { useState, useEffect } from 'react';
import {
  Clock,
  QrCode,
  Users,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Activity,
  Sparkles,
  Utensils,
  HeartPulse,
  BookOpen,
  Building,
  Coffee,
  Printer,
  Calendar,
  Camera,
  RefreshCw,
  Ticket
} from 'lucide-react';
import { queueApi } from './api.js';

export default function QueueLess({ user }) {
  const [services, setServices] = useState([]);
  const [myTokens, setMyTokens] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [timeSlot, setTimeSlot] = useState('Immediate Next Available');
  const [partySize, setPartySize] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  // QR Check-in Simulation State
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInTokenCode, setCheckInTokenCode] = useState('');
  const [checkInResult, setCheckInResult] = useState(null);

  const serviceIcons = {
    'Canteen': Utensils,
    'Hospital': HeartPulse,
    'Library Help Desk': BookOpen,
    'Student Office': Building,
    'Cafeteria': Coffee,
    'Printing Shop': Printer
  };

  const loadData = async () => {
    try {
      const [srvRes, tknRes, anaRes] = await Promise.all([
        queueApi.getAll(),
        queueApi.getMyTokens(),
        queueApi.getAnalytics()
      ]);
      setServices(srvRes.data.services || []);
      setMyTokens(tknRes.data.tokens || []);
      setAnalytics(anaRes.data.analytics || null);
    } catch (err) {
      console.error('Error loading queue data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000); // Polling for real-time queue shifts
    return () => clearInterval(interval);
  }, []);

  const handleOpenBooking = (service) => {
    setSelectedService(service);
    setShowBookModal(true);
  };

  const handleBookToken = async (e) => {
    e.preventDefault();
    if (!selectedService) return;
    setBookingLoading(true);

    try {
      const res = await queueApi.bookToken({
        serviceId: selectedService._id,
        timeSlot,
        partySize
      });
      setShowBookModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book virtual queue token.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCheckIn = async (codeToUse) => {
    const code = codeToUse || checkInTokenCode;
    if (!code) return;

    try {
      const res = await queueApi.checkIn(code);
      setCheckInResult(res.data);
      loadData();
    } catch (err) {
      alert('Could not verify QR token.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
            Module 2: QueueLess Virtual Queue System
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
            Zero-Wait Campus Service Queues
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Book digital tokens with scannable QR codes for canteens, dispensary, library, and tech printing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCheckInModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>Simulate QR Check-In</span>
          </button>
        </div>
      </div>

      {/* Active User Tokens Section */}
      {myTokens.filter(t => t.status === 'Waiting').length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-amber-400" />
            <h2 className="font-display font-bold text-lg text-white">Your Active Digital Tokens</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myTokens.filter(t => t.status === 'Waiting').map((tok) => (
              <div
                key={tok._id}
                className="glass-card rounded-3xl p-6 border border-amber-500/40 relative overflow-hidden shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 truncate max-w-[180px]">{tok.serviceName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Live In Queue
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Your Token Code</p>
                    <p className="font-display font-black text-3xl text-amber-400 font-mono tracking-tight">
                      {tok.tokenCode}
                    </p>
                    <p className="text-xs text-slate-300 mt-1">
                      Now Serving: <b className="text-white font-mono">{tok.serviceCurrentServing || 'TKN-001'}</b>
                    </p>
                  </div>

                  {/* QR Code Graphic */}
                  {tok.qrCodeData && (
                    <div className="p-1.5 bg-white rounded-2xl shadow-lg shrink-0">
                      <img src={tok.qrCodeData} alt="Token QR" className="w-20 h-20" />
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">People Ahead</span>
                    <span className="font-bold text-white text-base">{tok.peopleAhead}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Est. Wait Time</span>
                    <span className="font-bold text-cyan-400 text-base font-mono">~{tok.estimatedWaitMinutes} mins</span>
                  </div>
                </div>

                <button
                  onClick={() => handleCheckIn(tok.tokenCode)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs shadow-md shadow-amber-600/30 flex items-center justify-center gap-1.5 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Check In at Counter</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Campus Queue Services Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <h2 className="font-display font-bold text-lg text-white">Campus Virtual Counters</h2>
          </div>
          <span className="text-xs text-slate-400">Select any location to reserve your digital slot</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => {
            const Icon = serviceIcons[svc.category] || Clock;
            return (
              <div
                key={svc._id}
                className="glass-card glass-card-hover rounded-3xl p-6 border border-blue-500/25 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {svc.status}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-white">{svc.name}</h3>
                  <p className="text-xs text-slate-400">{svc.location}</p>

                  <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Serving</span>
                      <span className="font-bold text-amber-400 font-mono">{svc.currentServingToken}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">In Line</span>
                      <span className="font-bold text-white">{svc.currentQueueCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Avg Wait</span>
                      <span className="font-bold text-cyan-400 font-mono">~{svc.averageWaitMinutes}m</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenBooking(svc)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Book Digital Token</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Queue Analytics & Heatmap Section */}
      {analytics && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-blue-500/30 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">Queue Analytics & Peak Traffic</h2>
              <p className="text-xs text-slate-400">Real-time load metrics calculated from daily student footfalls</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400">System Avg Wait</span>
              <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">{analytics.averageWaitTimeOverall} mins</p>
              <span className="text-[11px] text-emerald-400 mt-1 block">↓ 14% faster than walk-in</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400">Total Campus Visitors Today</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">{analytics.dailyVisitorsTotal}</p>
              <span className="text-[11px] text-blue-400 mt-1 block">Across 6 service hubs</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400">Current Peak Service</span>
              <p className="text-lg font-bold text-amber-400 mt-1 truncate">Central Canteen</p>
              <span className="text-[11px] text-slate-400 mt-1 block">Peak hour: 12:30 PM - 2:00 PM</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400">Auto Late-Arrival Policy</span>
              <p className="text-lg font-bold text-emerald-400 mt-1">Grace 5 Mins</p>
              <span className="text-[11px] text-slate-400 mt-1 block">Auto-skipped if no-show</span>
            </div>
          </div>

          {/* Peak Hours Heatmap Bars */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Campus Hour-by-Hour Traffic Heatmap</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {analytics.peakHoursHeatmap.map((slot) => (
                <div key={slot.hour} className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
                  <span className="font-mono text-xs text-slate-400">{slot.hour}</span>
                  <div className="text-xs font-bold text-white">{slot.count} visits</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold block ${
                    slot.load === 'Peak'
                      ? 'bg-red-500/20 text-red-400'
                      : slot.load === 'High'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {slot.load}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Book Token Modal */}
      {showBookModal && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 border border-blue-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-blue-400" />
                <h3 className="font-display font-bold text-base text-white">Book Queue Token</h3>
              </div>
              <button
                onClick={() => setShowBookModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookToken} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Selected Facility</label>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm font-bold text-white">
                  {selectedService.name}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white bg-slate-900 focus:outline-none"
                >
                  <option value="Immediate Next Available">Immediate Next Available Slot</option>
                  <option value="12:30 PM - 1:00 PM">Lunch Rush (12:30 PM - 1:00 PM)</option>
                  <option value="1:00 PM - 1:30 PM">Afternoon Slot (1:00 PM - 1:30 PM)</option>
                  <option value="3:00 PM - 3:30 PM">Post-Class (3:00 PM - 3:30 PM)</option>
                  <option value="5:00 PM - 5:30 PM">Evening Slot (5:00 PM - 5:30 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Party / Order Size</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={partySize}
                  onChange={(e) => setPartySize(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center justify-between">
                <span>Current Est. Wait:</span>
                <span className="font-bold font-mono">~{selectedService.averageWaitMinutes * ((selectedService.currentQueueCount || 0) + 1)} mins</span>
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
              >
                {bookingLoading ? 'Issuing Digital Token...' : 'Confirm & Generate QR Token'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR Check-In Modal Simulation */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 border border-cyan-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-cyan-400" />
                <h3 className="font-display font-bold text-base text-white">Scanner Simulation Desk</h3>
              </div>
              <button
                onClick={() => {
                  setShowCheckInModal(false);
                  setCheckInResult(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {checkInResult ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-base">Check-In Successful!</h4>
                <p className="text-xs text-emerald-300">{checkInResult.message}</p>
                <button
                  onClick={() => {
                    setShowCheckInModal(false);
                    setCheckInResult(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  Enter student token code to simulate scanning the counter arrival terminal:
                </p>
                <input
                  type="text"
                  placeholder="e.g. CAN-142"
                  value={checkInTokenCode}
                  onChange={(e) => setCheckInTokenCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white font-mono uppercase focus:outline-none"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCheckIn(checkInTokenCode)}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors"
                  >
                    Simulate Counter Scan
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
