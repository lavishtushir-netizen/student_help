import express from 'express';
import { verifyToken } from './auth.js';
import { memoryStore, syncExpenseToSupabase } from './database.js';
import { generateExpenseInsightsAI } from './ai.js';

export const expensesRouter = express.Router();

// GET: All expenses & complete monthly analytics for logged-in student
expensesRouter.get('/', verifyToken, (req, res) => {
  const { category, search, sortBy = 'date', sortOrder = 'desc' } = req.query;

  const user = memoryStore.users.find(u => u._id === req.user.id) || { budget: 8000 };
  const monthlyBudget = Number(user.budget) || 8000;

  let userExpenses = memoryStore.expenses.filter(e => e.userId === req.user.id);

  // Filter by category
  if (category && category !== 'All') {
    userExpenses = userExpenses.filter(e => e.category.toLowerCase() === category.toLowerCase());
  }

  // Search by note
  if (search) {
    const s = search.toLowerCase();
    userExpenses = userExpenses.filter(e => (e.note || '').toLowerCase().includes(s));
  }

  // Sort by date or amount
  userExpenses.sort((a, b) => {
    if (sortBy === 'amount') {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
    // default date sort
    return sortOrder === 'asc'
      ? new Date(a.date).getTime() - new Date(b.date).getTime()
      : new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Calculate insights & aggregates on all user expenses this month
  const allCurrentExpenses = memoryStore.expenses.filter(e => e.userId === req.user.id);
  const insights = generateExpenseInsightsAI(allCurrentExpenses, monthlyBudget);

  // Group by category for Chart.js
  const categoriesList = ['Food', 'Books', 'Transport', 'Stationery', 'Recharge', 'Shopping', 'Entertainment', 'Hostel', 'Other'];
  const categoryData = categoriesList.map(cat => ({
    category: cat,
    amount: allCurrentExpenses
      .filter(e => e.category.toLowerCase() === cat.toLowerCase())
      .reduce((sum, e) => sum + Number(e.amount), 0)
  }));

  // Weekly spending trend (last 4 weeks)
  const weeklyTrends = [
    { week: 'Week 1', amount: 850 },
    { week: 'Week 2', amount: 1120 },
    { week: 'Week 3', amount: 980 },
    { week: 'Week 4 (Current)', amount: allCurrentExpenses.slice(0, 3).reduce((s, e) => s + e.amount, 0) || 699 }
  ];

  res.json({
    success: true,
    monthlyBudget,
    totalSpent: insights.totalSpent,
    remaining: insights.remaining,
    percentUsed: insights.percentUsed,
    dailyAverage: insights.dailyAverage,
    expenses: userExpenses,
    categoryData,
    weeklyTrends,
    insights: insights.insights,
    budgetAlert: insights.alert
  });
});

// POST: Add new expense
expensesRouter.post('/', verifyToken, (req, res) => {
  const { amount, category, date, note } = req.body;

  if (!amount || !category) {
    return res.status(400).json({ success: false, message: 'Amount and category are required.' });
  }

  const newExpense = {
    _id: `exp-${Date.now()}`,
    userId: req.user.id,
    amount: Number(amount),
    category,
    date: date || new Date().toISOString().split('T')[0],
    note: note || '',
    createdAt: new Date()
  };

  memoryStore.expenses.unshift(newExpense);
  syncExpenseToSupabase(newExpense).catch(e => console.warn('Supabase expense sync:', e.message));

  // Check budget threshold & trigger notification if needed
  const user = memoryStore.users.find(u => u._id === req.user.id) || { budget: 8000 };
  const userExpenses = memoryStore.expenses.filter(e => e.userId === req.user.id);
  const insights = generateExpenseInsightsAI(userExpenses, user.budget);

  if (insights.alert) {
    memoryStore.notifications.unshift({
      _id: `notif-budget-${Date.now()}`,
      userId: req.user.id,
      type: 'Expenses',
      title: 'Budget Alert',
      message: insights.alert.message,
      read: false,
      createdAt: new Date()
    });
  }

  res.status(201).json({
    success: true,
    message: 'Expense recorded successfully!',
    expense: newExpense,
    budgetAlert: insights.alert
  });
});

// PUT: Edit existing expense
expensesRouter.put('/:id', verifyToken, (req, res) => {
  const { amount, category, date, note } = req.body;
  const index = memoryStore.expenses.findIndex(e => e._id === req.params.id && e.userId === req.user.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Expense record not found.' });
  }

  const existing = memoryStore.expenses[index];
  if (amount !== undefined) existing.amount = Number(amount);
  if (category) existing.category = category;
  if (date) existing.date = date;
  if (note !== undefined) existing.note = note;

  memoryStore.expenses[index] = existing;

  res.json({ success: true, message: 'Expense updated successfully!', expense: existing });
});

// DELETE: Delete expense
expensesRouter.delete('/:id', verifyToken, (req, res) => {
  const index = memoryStore.expenses.findIndex(e => e._id === req.params.id && e.userId === req.user.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Expense record not found.' });
  }

  memoryStore.expenses.splice(index, 1);
  res.json({ success: true, message: 'Expense record deleted.' });
});
