import React from 'react';
import { ShieldAlert, PhoneCall, HeartPulse, LifeBuoy, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-blue-500/20 glass-card bg-slate-950/70 text-slate-400 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: About */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="font-display font-extrabold text-lg text-white">Student Help</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An all-in-one smart campus platform safeguarding student life with AI-prioritized incident reporting, safe navigation, virtual queues, study planning, and expense tracking.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-medium">All Campus Systems Operational</span>
            </div>
          </div>

          {/* Col 2: Emergency Helplines */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-red-400" />
              24/7 Campus Helplines
            </h4>
            <ul className="text-xs space-y-1.5">
              <li>
                <span className="text-slate-500 block">Chief Security Patrol:</span>
                <a href="tel:1800226787" className="text-blue-400 hover:text-blue-300 font-semibold font-mono">
                  +91 1800-CAMPUS-SAFE
                </a>
              </li>
              <li>
                <span className="text-slate-500 block">Health Center & Ambulance:</span>
                <a href="tel:1800432584" className="text-rose-400 hover:text-rose-300 font-semibold font-mono">
                  +91 1800-HEALTH-SOS
                </a>
              </li>
              <li>
                <span className="text-slate-500 block">National Anti-Ragging Cell:</span>
                <a href="tel:18001805522" className="text-amber-400 hover:text-amber-300 font-semibold font-mono">
                  1800-180-5522 (Toll Free)
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Campus Amenities */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-cyan-400" />
              Smart Campus Modules
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-400">
              <li>• Real-Time Hazard Detection & Safe Detour Routing</li>
              <li>• QueueLess Token Reservation & Live Counter Alerts</li>
              <li>• StudyPulse AI Spaced Repetition Timetable</li>
              <li>• Student Monthly Budget & Smart Alert Ring</li>
              <li>• Multi-Modal Campus AI Assistant with Live Context</li>
            </ul>
          </div>

          {/* Col 4: Hackathon / Quick Specs */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <LifeBuoy className="w-4 h-4 text-blue-400" />
              Campus Command Hub
            </h4>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
              <p className="text-slate-300 font-medium">Metropolitan Tech Campus</p>
              <p className="text-slate-500">Security Command Gate 1</p>
              <p className="text-slate-400 text-[11px] pt-1">
                Active Protocol: <span className="text-emerald-400 font-semibold">Green Shield Safe</span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Student Help. Engineered for modern student safety and campus productivity.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Production MVP v1.0
            </span>
            <span>Leaflet • Socket.io • Express • Vite</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
