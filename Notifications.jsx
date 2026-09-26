import React, { useState } from 'react';
import { X, Bell, ShieldAlert, Clock, BookOpen, PieChart, CheckCheck } from 'lucide-react';

export default function Notifications({
  isOpen,
  onClose,
  notifications = [],
  onMarkRead,
  onMarkAllRead
}) {
  const [activeTab, setActiveTab] = useState('All');

  if (!isOpen) return null;

  const filterTabs = ['All', 'Safety', 'Queues', 'Study', 'Expenses'];

  const filtered = notifications.filter(n => {
    if (activeTab === 'All') return true;
    return (n.type || '').toLowerCase() === activeTab.toLowerCase();
  });

  const getIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'safety':
        return <ShieldAlert className="w-5 h-5 text-red-400" />;
      case 'queues':
        return <Clock className="w-5 h-5 text-amber-400" />;
      case 'study':
        return <BookOpen className="w-5 h-5 text-blue-400" />;
      case 'expenses':
        return <PieChart className="w-5 h-5 text-emerald-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-md h-full glass-card border-l border-blue-500/30 p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">Campus Notifications</h2>
              <p className="text-xs text-slate-400">
                {notifications.filter(n => !n.read).length} unread alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills & Mark All Read */}
        <div className="py-3 flex items-center justify-between gap-2 border-b border-slate-800/80">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-[260px] no-scrollbar">
            {filterTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium whitespace-nowrap"
            title="Mark all as read"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Bell className="w-12 h-12 mb-3 stroke-1 text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">No notifications in this category</p>
              <p className="text-xs text-slate-600 mt-1">You are completely up to date.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item._id}
                onClick={() => onMarkRead && onMarkRead(item._id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  item.read
                    ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                    : 'bg-slate-850/80 border-blue-500/40 text-slate-200 shadow-md shadow-blue-900/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-800/90 border border-slate-700/60 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-semibold truncate ${item.read ? 'text-slate-300' : 'text-white'}`}>
                        {item.title}
                      </p>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-slate-500">
                      <span className="font-semibold uppercase tracking-wider text-blue-400/80">{item.type}</span>
                      <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
