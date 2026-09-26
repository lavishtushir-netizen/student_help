import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Wallet,
  Calendar,
  Tag,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { expenseApi, userApi } from './api.js';

export default function ExpenseTracker({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  // Budget Edit State
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState(8000);

  const categories = [
    'Food',
    'Books',
    'Transport',
    'Stationery',
    'Recharge',
    'Shopping',
    'Entertainment',
    'Hostel',
    'Other'
  ];

  const categoryColors = {
    'Food': '#f97316',
    'Books': '#3b82f6',
    'Transport': '#06b6d4',
    'Stationery': '#8b5cf6',
    'Recharge': '#10b981',
    'Shopping': '#ec4899',
    'Entertainment': '#eab308',
    'Hostel': '#6366f1',
    'Other': '#64748b'
  };

  const loadExpenses = async () => {
    try {
      const res = await expenseApi.getAll({
        category: selectedCategory,
        search: searchQuery,
        sortBy,
        sortOrder
      });
      setData(res.data);
      setNewBudget(res.data.monthlyBudget || 8000);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [selectedCategory, searchQuery, sortBy, sortOrder]);

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    if (!formData.amount) return;

    try {
      if (editingExpense) {
        await expenseApi.update(editingExpense._id, formData);
      } else {
        await expenseApi.create(formData);
      }
      setShowAddModal(false);
      setEditingExpense(null);
      setFormData({
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        note: ''
      });
      loadExpenses();
    } catch (err) {
      alert('Could not save expense.');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm('Are you sure you want to remove this expense record?')) return;
    try {
      await expenseApi.delete(id);
      loadExpenses();
    } catch (err) {
      alert('Failed to delete expense.');
    }
  };

  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      note: expense.note || ''
    });
    setShowAddModal(true);
  };

  const handleSaveBudget = async () => {
    try {
      await userApi.updateProfile({ budget: Number(newBudget) });
      setIsEditingBudget(false);
      loadExpenses();
    } catch (err) {
      alert('Could not update budget.');
    }
  };

  const percentUsed = data?.percentUsed || 0;
  const ringColor =
    percentUsed >= 100 ? '#ef4444' : percentUsed >= 80 ? '#f59e0b' : '#10b981';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
            Module 4: Student Expense Tracker
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
            Student Monthly Finance & Smart Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Log allowances in ₹, analyze spending patterns with charts, and receive proactive budget breach alerts.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingExpense(null);
            setFormData({
              amount: '',
              category: 'Food',
              date: new Date().toISOString().split('T')[0],
              note: ''
            });
            setShowAddModal(true);
          }}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Expense</span>
        </button>
      </div>

      {/* Budget Threshold Alert Banner (If triggered) */}
      {data?.budgetAlert && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-pulse ${
          data.budgetAlert.level === 'danger'
            ? 'bg-red-500/15 border-red-500/40 text-red-300'
            : data.budgetAlert.level === 'warning'
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
            : 'bg-blue-500/15 border-blue-500/40 text-blue-300'
        }`}>
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div className="text-xs sm:text-sm font-semibold">
            {data.budgetAlert.message}
          </div>
        </div>
      )}

      {/* Monthly Budget Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Monthly Budget Card */}
        <div className="glass-card rounded-3xl p-6 border border-blue-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Monthly Budget</span>
            <button
              onClick={() => setIsEditingBudget(!isEditingBudget)}
              className="text-blue-400 hover:underline"
            >
              {isEditingBudget ? 'Cancel' : 'Edit Limit'}
            </button>
          </div>

          {isEditingBudget ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="w-full px-2 py-1 rounded-lg glass-input text-sm text-white"
              />
              <button
                onClick={handleSaveBudget}
                className="px-3 py-1 bg-blue-600 rounded-lg text-xs font-bold text-white"
              >
                Save
              </button>
            </div>
          ) : (
            <p className="font-display font-extrabold text-3xl text-white">
              ₹{data?.monthlyBudget?.toLocaleString() || '8,000'}
            </p>
          )}

          <p className="text-[11px] text-slate-500">Allocated for current calendar cycle</p>
        </div>

        {/* Total Spent with Progress Ring */}
        <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400">Total Spent</span>
            <p className="font-display font-extrabold text-3xl text-white">
              ₹{data?.totalSpent?.toLocaleString() || '0'}
            </p>
            <p className="text-[11px] text-slate-500">{percentUsed}% of budget used</p>
          </div>

          {/* SVG Progress Ring */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                stroke={ringColor}
                strokeDasharray={`${Math.min(100, percentUsed)}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center text-xs font-bold text-white">
              {percentUsed}%
            </div>
          </div>
        </div>

        {/* Remaining Balance */}
        <div className="glass-card rounded-3xl p-6 border border-cyan-500/30 space-y-1">
          <span className="text-xs text-slate-400">Safe Remaining</span>
          <p className="font-display font-extrabold text-3xl text-cyan-400">
            ₹{data?.remaining?.toLocaleString() || '0'}
          </p>
          <p className="text-[11px] text-slate-500">Available to spend safely</p>
        </div>

        {/* Daily Average Velocity */}
        <div className="glass-card rounded-3xl p-6 border border-amber-500/30 space-y-1">
          <span className="text-xs text-slate-400">Daily Average Velocity</span>
          <p className="font-display font-extrabold text-3xl text-amber-400 font-mono">
            ₹{data?.dailyAverage || '0'}<span className="text-xs text-slate-400 font-sans">/day</span>
          </p>
          <p className="text-[11px] text-slate-500">Based on past {new Date().getDate()} days</p>
        </div>
      </div>

      {/* AI Expense Insights Card */}
      {data?.insights && data.insights.length > 0 && (
        <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-base text-white">AI Financial Insights & Forecast</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {data.insights.map((insight, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts & Analytics Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Breakdown Bars */}
        <div className="glass-card rounded-3xl p-6 border border-blue-500/30 space-y-4">
          <h3 className="font-display font-bold text-base text-white">Spending by Category</h3>
          <div className="space-y-3">
            {(data?.categoryData || []).map((cat) => {
              const maxAmount = Math.max(...(data?.categoryData || []).map(c => c.amount), 1);
              const percentage = Math.round((cat.amount / (data?.totalSpent || 1)) * 100);
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{cat.category}</span>
                    <span className="font-bold text-white font-mono">₹{cat.amount.toLocaleString()} ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(cat.amount / maxAmount) * 100}%`,
                        backgroundColor: categoryColors[cat.category] || '#3b82f6'
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Trend Bars */}
        <div className="glass-card rounded-3xl p-6 border border-blue-500/30 space-y-4 lg:col-span-2">
          <h3 className="font-display font-bold text-base text-white">Weekly Expenditure Flow</h3>
          <div className="grid grid-cols-4 gap-4 h-48 items-end pt-4">
            {(data?.weeklyTrends || []).map((w, idx) => {
              const maxSpend = 1500;
              const heightPercent = Math.min(100, Math.round((w.amount / maxSpend) * 100));
              return (
                <div key={idx} className="h-full flex flex-col items-center justify-end gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400">₹{w.amount}</span>
                  <div
                    className="w-full max-w-[48px] bg-gradient-to-t from-blue-600 to-cyan-400 rounded-2xl transition-all duration-500"
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                  <span className="text-[11px] text-slate-400 text-center">{w.week}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expense History Table with Search, Filter & Sort */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-blue-500/30 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-display font-bold text-lg text-white">Expense Records</h3>

          {/* Search, Filter, Sort Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl glass-input text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl glass-input text-xs text-white bg-slate-900 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1"
            >
              <ArrowUpDown className="w-3 h-3 text-cyan-400" />
              <span>{sortOrder === 'asc' ? 'Oldest / Lowest' : 'Latest / Highest'}</span>
            </button>
          </div>
        </div>

        {/* Expenses List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Note / Detail</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold text-right">Amount (₹)</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(data?.expenses || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No expense records found matching criteria.
                  </td>
                </tr>
              ) : (
                data?.expenses.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 font-semibold text-white">
                      <span
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold inline-block"
                        style={{
                          backgroundColor: `${categoryColors[item.category] || '#3b82f6'}22`,
                          color: categoryColors[item.category] || '#60a5fa'
                        }}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300">{item.note || '—'}</td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">{item.date}</td>
                    <td className="py-3 text-right font-bold text-white font-mono text-sm">
                      ₹{item.amount.toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-1 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(item._id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 border border-emerald-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-display font-bold text-base text-white">
                {editingExpense ? 'Edit Expense Record' : 'Add Campus Expense'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g. 450"
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white bg-slate-900 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white bg-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Note / Description</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="e.g. Silberschatz OS book at library annex"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 transition-colors mt-2"
              >
                {editingExpense ? 'Save Updates' : 'Add Expense to Tracker'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
